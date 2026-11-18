-- ============================================================
-- VaptVaga — Integração Stripe Connect (Contas Express & Split)
-- ============================================================

-- 1. Campos de vínculo Stripe Connect na tabela public.profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS stripe_account_id text,
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS stripe_onboarding_complete boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS stripe_payouts_enabled boolean NOT NULL DEFAULT false;

-- 2. Tabela de custódia (escrow) e transferências split via Stripe Connect
CREATE TABLE IF NOT EXISTS public.stripe_connect_transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES public.applications(id) ON DELETE SET NULL,
  job_id uuid REFERENCES public.jobs(id) ON DELETE SET NULL,
  company_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  freelancer_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_payment_intent_id text,
  stripe_transfer_id text,
  amount_cents integer NOT NULL,
  platform_fee_cents integer NOT NULL DEFAULT 0,
  net_amount_cents integer NOT NULL,
  status text NOT NULL DEFAULT 'held_in_escrow',
  created_at timestamptz NOT NULL DEFAULT now(),
  released_at timestamptz
);

ALTER TABLE public.stripe_connect_transfers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "stripe_transfers_select_participants_and_support" ON public.stripe_connect_transfers;
CREATE POLICY "stripe_transfers_select_participants_and_support"
  ON public.stripe_connect_transfers FOR SELECT
  TO authenticated
  USING (
    auth.uid() = company_id
    OR auth.uid() = freelancer_id
    OR EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('support', 'admin')
    )
  );
