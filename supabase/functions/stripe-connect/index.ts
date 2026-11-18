// Supabase Edge Function — Stripe Connect (Marketplace Split & Custódia Escrow)
// Deploy: supabase functions deploy stripe-connect
// Secrets requeridos: STRIPE_SECRET_KEY, SUPABASE_URL, SUPABASE_ANON_KEY

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const STRIPE_API = 'https://api.stripe.com/v1';

const STRIPE_PLATFORM_CONFIG = {
  accountId: 'acct_1TBiwPFYGK1Xf7qc',
  vaptProPriceId: 'price_1UdB9uFYGK1Xf7qc7QszymUT',
  negocioAgilPriceId: 'price_1UdBA2FYGK1Xf7qc9sTwk606',
  escrowProductId: 'prod_VeU7PRhObhmGka',
};

async function stripeRequest(
  endpoint: string,
  secretKey: string,
  params: Record<string, string>
) {
  const body = new URLSearchParams(params);
  const res = await fetch(`${STRIPE_API}${endpoint}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || `Stripe error ${res.status}`);
  }
  return data;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      return new Response(
        JSON.stringify({
          configured: false,
          error: 'STRIPE_SECRET_KEY não configurada nos secrets do Supabase.',
        }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payload = await req.json();
    const action = payload.action as string;
    const originUrl = payload.returnUrl || 'http://localhost:5173/freelancer/financeiro';

    if (action === 'create_connect_account') {
      const account = await stripeRequest('/accounts', stripeSecretKey, {
        type: 'express',
        country: 'BR',
        email: payload.email || '',
        'capabilities[transfers][requested]': 'true',
        'capabilities[card_payments][requested]': 'true',
        'business_profile[name]': payload.name || 'Freelancer VaptVaga',
      });

      const accountLink = await stripeRequest('/account_links', stripeSecretKey, {
        account: account.id,
        refresh_url: `${originUrl}?stripe=refresh`,
        return_url: `${originUrl}?stripe=connected&account=${account.id}`,
        type: 'account_onboarding',
      });

      return new Response(
        JSON.stringify({
          configured: true,
          accountId: account.id,
          onboardingUrl: accountLink.url,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'create_login_link') {
      const link = await stripeRequest(
        `/accounts/${payload.accountId}/login_links`,
        stripeSecretKey,
        {}
      );
      return new Response(
        JSON.stringify({ configured: true, url: link.url }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'create_escrow_payment') {
      const amountCents = Math.round(Number(payload.amountCents || 0));
      if (amountCents < 100) {
        throw new Error('Valor mínimo de custódia deve ser >= R$ 1,00.');
      }

      const intent = await stripeRequest('/payment_intents', stripeSecretKey, {
        amount: String(amountCents),
        currency: 'brl',
        transfer_group: payload.transferGroup || `VAPTVAGA_${Date.now()}`,
        'automatic_payment_methods[enabled]': 'true',
      });

      return new Response(
        JSON.stringify({
          configured: true,
          paymentIntentId: intent.id,
          clientSecret: intent.client_secret,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'release_transfer') {
      const amountCents = Math.round(Number(payload.amountCents || 0));
      const destinationAccountId = payload.destinationAccountId as string;
      if (!destinationAccountId || amountCents < 100) {
        throw new Error('Conta destino e valor válidos são obrigatórios para o repasse.');
      }

      const transfer = await stripeRequest('/transfers', stripeSecretKey, {
        amount: String(amountCents),
        currency: 'brl',
        destination: destinationAccountId,
        ...(payload.transferGroup ? { transfer_group: payload.transferGroup } : {}),
      });

      return new Response(
        JSON.stringify({
          configured: true,
          transferId: transfer.id,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'create_checkout_session') {
      const planKey = payload.plan === 'company' || payload.plan === 'negocio_agil'
        ? 'negocio_agil'
        : 'vapt_pro';
      const priceId =
        (payload.priceId as string | undefined) ||
        (planKey === 'negocio_agil'
          ? STRIPE_PLATFORM_CONFIG.negocioAgilPriceId
          : STRIPE_PLATFORM_CONFIG.vaptProPriceId);

      const session = await stripeRequest('/checkout/sessions', stripeSecretKey, {
        mode: 'subscription',
        'line_items[0][price]': priceId,
        'line_items[0][quantity]': '1',
        success_url: `${originUrl}?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${originUrl}?checkout=canceled`,
        ...(payload.email ? { customer_email: payload.email } : {}),
        'metadata[platform_account]': STRIPE_PLATFORM_CONFIG.accountId,
        'metadata[plan]': planKey,
      });

      return new Response(
        JSON.stringify({
          configured: true,
          sessionId: session.id,
          url: session.url,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: `Ação desconhecida: ${action}` }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : 'Erro interno no Stripe Connect.',
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
