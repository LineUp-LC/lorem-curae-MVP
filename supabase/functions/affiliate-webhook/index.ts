import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { 
      user_id, 
      partner_tracking_code, 
      transaction_id, 
      amount, 
      commission_percentage, 
      product_name, 
      brand_name 
    } = await req.json();

    // Validate required fields
    if (!user_id || !partner_tracking_code || !transaction_id || !amount) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find the partner by tracking code
    const { data: partner, error: partnerError } = await supabaseClient
      .from('affiliate_partners')
      .select('*')
      .eq('tracking_code', partner_tracking_code)
      .single();

    if (partnerError || !partner) {
      return new Response(
        JSON.stringify({ error: 'Partner not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate commission and cashback
    const actualCommissionRate = commission_percentage || partner.commission_rate;
    const cashbackAmount = (amount * actualCommissionRate) / 100;

    // Find the click that led to this conversion
    const { data: click, error: clickError } = await supabaseClient
      .from('affiliate_clicks')
      .select('*')
      .eq('partner_id', partner.id)
      .eq('user_id', user_id)
      .order('click_timestamp', { ascending: false })
      .limit(1)
      .single();

    // Create the affiliate transaction
    const transactionData = {
      user_id,
      partner_id: partner.id,
      click_id: click?.id || null,
      brand_name: brand_name || partner.brand_name,
      product_name: product_name || null,
      transaction_id,
      amount: parseFloat(amount),
      commission_percentage: actualCommissionRate,
      cashback_amount: cashbackAmount,
      currency: 'USD',
      status: 'pending'
    };

    const { data: transaction, error: transactionError } = await supabaseClient
      .from('affiliate_transactions')
      .insert([transactionData])
      .select()
      .single();

    if (transactionError) {
      throw transactionError;
    }

    // Update the click as converted if found
    if (click) {
      await supabaseClient
        .from('affiliate_clicks')
        .update({ 
          converted: true, 
          conversion_timestamp: new Date().toISOString() 
        })
        .eq('id', click.id);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        transaction_id: transaction.id,
        cashback_amount: cashbackAmount 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error processing affiliate transaction:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});