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

    // Get user from JWT token
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { partner_tracking_code, purchase_amount, product_name } = await req.json();

    if (!partner_tracking_code || !purchase_amount) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find the partner
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

    // Find the most recent click for this user and partner
    const { data: click, error: clickError } = await supabaseClient
      .from('affiliate_clicks')
      .select('*')
      .eq('partner_id', partner.id)
      .eq('user_id', user.id)
      .eq('converted', false)
      .order('click_timestamp', { ascending: false })
      .limit(1)
      .single();

    if (clickError || !click) {
      // Create a conversion without a prior click (direct conversion)
      const directTransactionData = {
        user_id: user.id,
        partner_id: partner.id,
        brand_name: partner.brand_name,
        product_name: product_name || null,
        amount: parseFloat(purchase_amount),
        commission_percentage: partner.commission_rate,
        cashback_amount: (parseFloat(purchase_amount) * partner.commission_rate) / 100,
        status: 'pending',
        transaction_id: 'direct_' + Date.now()
      };

      const { data: transaction, error: transactionError } = await supabaseClient
        .from('affiliate_transactions')
        .insert([directTransactionData])
        .select()
        .single();

      if (transactionError) {
        throw transactionError;
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          type: 'direct_conversion',
          cashback_amount: directTransactionData.cashback_amount 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mark click as converted
    const { error: updateError } = await supabaseClient
      .from('affiliate_clicks')
      .update({ 
        converted: true, 
        conversion_timestamp: new Date().toISOString() 
      })
      .eq('user_id', click.id);

    if (updateError) {
      throw updateError;
    }

    // Create affiliate transaction
    const cashbackAmount = (parseFloat(purchase_amount) * partner.commission_rate) / 100;
    
    const transactionData = {
      user_id: user.id,
      partner_id: partner.id,
      click_id: click.id,
      brand_name: partner.brand_name,
      product_name: product_name || null,
      amount: parseFloat(purchase_amount),
      commission_percentage: partner.commission_rate,
      cashback_amount: cashbackAmount,
      status: 'pending',
      transaction_id: 'conv_' + Date.now()
    };

    const { data: transaction, error: transactionError } = await supabaseClient
      .from('affiliate_transactions')
      .insert([transactionData])
      .select()
      .single();

    if (transactionError) {
      throw transactionError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        type: 'click_conversion',
        transaction_id: transaction.id,
        cashback_amount: cashbackAmount 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error marking conversion:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});