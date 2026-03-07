import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Retailer Feed Ingestion Edge Function
 *
 * Accepts a batch of retailer price records and upserts them into
 * the retailer_prices table. Designed to be called by a scheduled
 * cron job or manual admin trigger after parsing affiliate feed data.
 *
 * Expects: POST {
 *   source: 'affiliate_feed' | 'retailer_api' | 'manual',
 *   records: Array<{
 *     product_id: string,
 *     retailer_slug: string,
 *     price: number,
 *     shipping_cost?: number,
 *     shipping_label?: string,
 *     tax_included?: boolean,
 *     total_price: number,
 *     in_stock?: boolean,
 *     delivery_window?: string,
 *     url: string,
 *     deep_link?: string,
 *   }>
 * }
 *
 * Returns: { success: boolean, processed: number, failed: number, log_id: string }
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const startedAt = new Date().toISOString();
  let logId: string | null = null;

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { source, records } = await req.json();

    // Validate input
    if (!source || !Array.isArray(records) || records.length === 0) {
      return new Response(
        JSON.stringify({ error: 'source (string) and records (non-empty array) are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const validSources = ['affiliate_feed', 'retailer_api', 'manual'];
    if (!validSources.includes(source)) {
      return new Response(
        JSON.stringify({ error: `source must be one of: ${validSources.join(', ')}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Create import log entry
    const { data: logEntry, error: logError } = await supabase
      .from('feed_import_log')
      .insert([{ source, status: 'partial', records_processed: 0, records_failed: 0, started_at: startedAt }])
      .select('id')
      .single();

    if (logError) {
      console.error('Failed to create import log:', logError);
    } else {
      logId = logEntry.id;
    }

    // Resolve retailer slugs to IDs
    const slugs = [...new Set(records.map((r: { retailer_slug: string }) => r.retailer_slug))];
    const { data: retailers, error: retailerError } = await supabase
      .from('retailers')
      .select('id, slug')
      .in('slug', slugs);

    if (retailerError) {
      throw new Error(`Failed to look up retailers: ${retailerError.message}`);
    }

    const slugToId = new Map((retailers ?? []).map((r: { id: string; slug: string }) => [r.slug, r.id]));

    let processed = 0;
    let failed = 0;
    const now = new Date().toISOString();

    // Process records in batches of 50
    const batchSize = 50;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      const rows = [];

      for (const record of batch) {
        const retailerId = slugToId.get(record.retailer_slug);
        if (!retailerId) {
          console.error(`Unknown retailer slug: ${record.retailer_slug}`);
          failed++;
          continue;
        }

        if (!record.product_id || !record.url || record.price == null || record.total_price == null) {
          console.error(`Invalid record for product ${record.product_id}: missing required fields`);
          failed++;
          continue;
        }

        rows.push({
          product_id: record.product_id,
          retailer_id: retailerId,
          price: record.price,
          shipping_cost: record.shipping_cost ?? 0,
          shipping_label: record.shipping_label ?? null,
          tax_included: record.tax_included ?? false,
          total_price: record.total_price,
          in_stock: record.in_stock ?? true,
          delivery_window: record.delivery_window ?? null,
          url: record.url,
          deep_link: record.deep_link ?? null,
          source,
          last_updated: now,
        });
      }

      if (rows.length > 0) {
        const { error: upsertError } = await supabase
          .from('retailer_prices')
          .upsert(rows, { onConflict: 'product_id,retailer_id', ignoreDuplicates: false });

        if (upsertError) {
          console.error(`Batch upsert error:`, upsertError);
          failed += rows.length;
        } else {
          processed += rows.length;
        }
      }
    }

    // Update import log
    const finalStatus = failed === 0 ? 'success' : processed === 0 ? 'failed' : 'partial';
    if (logId) {
      await supabase
        .from('feed_import_log')
        .update({
          status: finalStatus,
          records_processed: processed,
          records_failed: failed,
          completed_at: new Date().toISOString(),
        })
        .eq('id', logId);
    }

    return new Response(
      JSON.stringify({ success: true, processed, failed, log_id: logId }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('Feed ingestion error:', error);

    // Update log as failed if we have a log entry
    if (logId) {
      try {
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        );
        await supabase
          .from('feed_import_log')
          .update({
            status: 'failed',
            error_message: (error as Error).message,
            completed_at: new Date().toISOString(),
          })
          .eq('id', logId);
      } catch (_) {
        // Silent — don't mask the original error
      }
    }

    return new Response(
      JSON.stringify({ error: 'Feed ingestion failed', details: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
