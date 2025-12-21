import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import Stripe from 'https://esm.sh/stripe@14.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('Stripe secret key not configured');
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    });

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    const { productId, quantity = 1, successUrl, cancelUrl } = await req.json();

    // Get product details
    const { data: product, error: productError } = await supabaseClient
      .from('marketplace_products')
      .select('*, marketplace_storefronts!inner(id, name, stripe_connected_accounts(stripe_account_id, charges_enabled))')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      throw new Error('Product not found');
    }

    // Get user's subscription tier
    const { data: profile } = await supabaseClient
      .from('users_profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single();

    const subscriptionTier = profile?.subscription_tier || 'free';
    
    // Calculate discount based on subscription tier
    let discountPercentage = 0;
    let discountLabel = '';
    if (subscriptionTier === 'premium') {
      discountPercentage = 20;
      discountLabel = 'Premium Member Discount (20%)';
    } else if (subscriptionTier === 'plus') {
      discountPercentage = 10;
      discountLabel = 'Plus Member Discount (10%)';
    }

    const basePrice = product.price * quantity;
    const discountAmount = (basePrice * discountPercentage) / 100;
    const finalPrice = basePrice - discountAmount;

    // Platform fee: 10% of final price
    const platformFee = Math.round(finalPrice * 0.10 * 100); // in cents
    const creatorPayout = Math.round(finalPrice * 0.90 * 100); // in cents

    // Check if storefront has Stripe Connect account
    const connectedAccount = product.marketplace_storefronts.stripe_connected_accounts?.[0];
    const hasConnectedAccount = connectedAccount?.stripe_account_id && connectedAccount?.charges_enabled;

    // Create line items
    const lineItems = [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            description: `${product.marketplace_storefronts.name} - ${product.description || ''}`,
            images: product.image_url ? [product.image_url] : [],
            metadata: {
              product_id: product.id,
              storefront_id: product.storefront_id,
              storefront_name: product.marketplace_storefronts.name,
            },
          },
          unit_amount: Math.round(finalPrice * 100), // Convert to cents
        },
        quantity: quantity,
      },
    ];

    // Create checkout session configuration
    const sessionConfig: any = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl || `${req.headers.get('origin')}/marketplace/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${req.headers.get('origin')}/marketplace`,
      client_reference_id: user.id,
      metadata: {
        user_id: user.id,
        product_id: productId,
        storefront_id: product.storefront_id,
        quantity: quantity.toString(),
        subscription_tier: subscriptionTier,
        discount_percentage: discountPercentage.toString(),
        discount_amount: discountAmount.toFixed(2),
        platform_fee: (platformFee / 100).toFixed(2),
        creator_payout: (creatorPayout / 100).toFixed(2),
      },
      payment_intent_data: {
        metadata: {
          product_id: productId,
          storefront_id: product.storefront_id,
          user_id: user.id,
        },
      },
    };

    // If storefront has connected account, add transfer configuration
    if (hasConnectedAccount) {
      sessionConfig.payment_intent_data.application_fee_amount = platformFee;
      sessionConfig.payment_intent_data.transfer_data = {
        destination: connectedAccount.stripe_account_id,
      };
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    // Record transaction intent in database
    await supabaseClient.from('marketplace_transactions').insert({
      buyer_id: user.id,
      storefront_id: product.storefront_id,
      product_id: productId,
      amount: finalPrice,
      status: 'pending',
      stripe_payment_intent_id: session.payment_intent as string,
      platform_fee: platformFee / 100,
      creator_payout: creatorPayout / 100,
      subscription_discount_applied: discountLabel || null,
      discount_amount: discountAmount,
    });

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url,
        discountApplied: discountPercentage > 0,
        discountPercentage,
        originalPrice: basePrice,
        finalPrice,
        discountAmount,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});