-- ============================================================
-- VaptVaga — Configuração Completa de Segurança (RLS)
-- Cole este script inteiro no SQL Editor do Supabase e execute
-- ============================================================

-- STEP 1: Drop ALL existing policies on every public table
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- STEP 2: Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- STEP 3: PROFILES
-- ============================================================
-- Qualquer usuario logado pode ver perfis (necessario para listar freelancers)
CREATE POLICY "profiles_select_authenticated"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Apenas o proprio usuario pode criar seu perfil
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Apenas o proprio usuario pode editar seu perfil
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- STEP 4: JOBS
-- ============================================================
-- Qualquer pessoa (inclusive nao logada) pode ver vagas
CREATE POLICY "jobs_select_public"
  ON public.jobs FOR SELECT
  USING (true);

-- Apenas a empresa dona pode criar vagas
CREATE POLICY "jobs_insert_company"
  ON public.jobs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = company_id);

-- Apenas a empresa dona pode editar suas vagas
CREATE POLICY "jobs_update_company"
  ON public.jobs FOR UPDATE
  TO authenticated
  USING (auth.uid() = company_id)
  WITH CHECK (auth.uid() = company_id);

-- Apenas a empresa dona pode deletar suas vagas
CREATE POLICY "jobs_delete_company"
  ON public.jobs FOR DELETE
  TO authenticated
  USING (auth.uid() = company_id);

-- ============================================================
-- STEP 5: APPLICATIONS
-- ============================================================
-- Freelancer ve suas candidaturas, empresa ve candidaturas das suas vagas
CREATE POLICY "applications_select_own"
  ON public.applications FOR SELECT
  TO authenticated
  USING (
    auth.uid() = freelancer_id
    OR auth.uid() IN (SELECT company_id FROM public.jobs WHERE id = job_id)
  );

-- Freelancer pode se candidatar
CREATE POLICY "applications_insert_freelancer"
  ON public.applications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = freelancer_id);

-- Empresa dona da vaga pode atualizar status da candidatura
CREATE POLICY "applications_update_company"
  ON public.applications FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (SELECT company_id FROM public.jobs WHERE id = job_id)
  );

-- Freelancer pode cancelar sua propria candidatura
CREATE POLICY "applications_delete_own"
  ON public.applications FOR DELETE
  TO authenticated
  USING (auth.uid() = freelancer_id);

-- ============================================================
-- STEP 6: MESSAGES (segurança estrita: 2 participantes + Suporte VaptVaga)
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_chat_authorized_viewer(
  p_application_id uuid,
  p_user_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_user_id IS NULL THEN
    RETURN false;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = p_user_id
      AND p.role IN ('support', 'admin')
  ) THEN
    RETURN true;
  END IF;

  IF p_application_id IS NULL THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.applications a
    LEFT JOIN public.jobs j ON j.id = a.job_id
    WHERE a.id = p_application_id
      AND (a.freelancer_id = p_user_id OR j.company_id = p_user_id)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.is_chat_authorized_viewer(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_chat_authorized_viewer(uuid, uuid) TO authenticated;

-- Apenas os 2 envolvidos na conversa e o Suporte Oficial da VaptVaga podem ler
CREATE POLICY "messages_select_strict_participants_and_support"
  ON public.messages FOR SELECT
  TO authenticated
  USING (
    public.is_chat_authorized_viewer(application_id, auth.uid())
  );

-- Apenas os 2 envolvidos na conversa e o Suporte Oficial podem enviar mensagens
CREATE POLICY "messages_insert_strict_participants_and_support"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND public.is_chat_authorized_viewer(application_id, auth.uid())
  );

-- Destinatario autorizado pode marcar como lido
CREATE POLICY "messages_update_read_strict"
  ON public.messages FOR UPDATE
  TO authenticated
  USING (
    auth.uid() != sender_id
    AND public.is_chat_authorized_viewer(application_id, auth.uid())
  )
  WITH CHECK (
    auth.uid() != sender_id
    AND public.is_chat_authorized_viewer(application_id, auth.uid())
  );

-- Exclusão restrita ao Suporte Oficial para preservação de auditoria
CREATE POLICY "messages_delete_support_only"
  ON public.messages FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('support', 'admin')
    )
  );

-- Trigger anti-evasão: proíbe encaminhar conversas para WhatsApp fora do app
CREATE OR REPLACE FUNCTION public.enforce_chat_no_external_whatsapp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF COALESCE(NEW.content, '') ~* '(whatsapp|wa\.me|zapzap)' THEN
    RAISE EXCEPTION 'É terminantemente proibido transferir a conversa para o WhatsApp. Resolva tudo pelo aplicativo VaptVaga.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_chat_no_external_whatsapp ON public.messages;
CREATE TRIGGER trg_enforce_chat_no_external_whatsapp
  BEFORE INSERT OR UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_chat_no_external_whatsapp();

-- ============================================================
-- STEP 7: CONTACT_MESSAGES
-- ============================================================
-- Qualquer visitante pode enviar mensagem de contato
CREATE POLICY "contact_messages_insert_anyone"
  ON public.contact_messages FOR INSERT
  WITH CHECK (true);

-- Ninguem pode ler/editar/deletar pelo client (somente admin/backend)

-- ============================================================
-- STEP 8: WALLETS
-- ============================================================
-- Apenas o dono pode ver seu saldo
CREATE POLICY "wallets_select_own"
  ON public.wallets FOR SELECT
  TO authenticated
  USING (auth.uid() = freelancer_id);

-- INSERT/UPDATE/DELETE bloqueados para o client (somente backend/triggers)

-- ============================================================
-- STEP 9: Trigger para criar wallet automaticamente
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_freelancer_wallet()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'freelancer' THEN
    INSERT INTO public.wallets (freelancer_id, credits)
    VALUES (NEW.id, 0)
    ON CONFLICT (freelancer_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_freelancer_profile_created ON public.profiles;
CREATE TRIGGER on_freelancer_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_freelancer_wallet();

-- ============================================================
-- STEP 10: RATE LIMITING TRIGGERS (Anti-Spam & Anti-Flood)
-- ============================================================

-- 1. Limite para Formulário de Contato
CREATE OR REPLACE FUNCTION public.check_contact_message_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
    message_count INT;
BEGIN
    SELECT COUNT(*) INTO message_count
    FROM public.contact_messages
    WHERE email = NEW.email
      AND created_at > (NOW() - INTERVAL '15 minutes');

    IF message_count >= 3 THEN
        RAISE EXCEPTION 'Muitas mensagens enviadas. Aguarde 15 minutos antes de tentar novamente.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS enforce_contact_rate_limit ON public.contact_messages;
CREATE TRIGGER enforce_contact_rate_limit
    BEFORE INSERT ON public.contact_messages
    FOR EACH ROW
    EXECUTE FUNCTION public.check_contact_message_rate_limit();


-- 2. Limite para Criação de Vagas
CREATE OR REPLACE FUNCTION public.check_job_creation_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
    job_count INT;
BEGIN
    SELECT COUNT(*) INTO job_count
    FROM public.jobs
    WHERE company_id = NEW.company_id
      AND created_at > (NOW() - INTERVAL '1 hour');

    IF job_count >= 10 THEN
        RAISE EXCEPTION 'Limite de publicações excedido. Máximo de 10 vagas por hora.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS enforce_job_creation_rate_limit ON public.jobs;
CREATE TRIGGER enforce_job_creation_rate_limit
    BEFORE INSERT ON public.jobs
    FOR EACH ROW
    EXECUTE FUNCTION public.check_job_creation_rate_limit();


-- 3. Limite para Candidaturas
CREATE OR REPLACE FUNCTION public.check_application_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
    app_count INT;
BEGIN
    SELECT COUNT(*) INTO app_count
    FROM public.applications
    WHERE freelancer_id = NEW.freelancer_id
      AND created_at > (NOW() - INTERVAL '1 hour');

    IF app_count >= 30 THEN
        RAISE EXCEPTION 'Limite de candidaturas excedido. Máximo de 30 vagas por hora.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS enforce_application_rate_limit ON public.applications;
CREATE TRIGGER enforce_application_rate_limit
    BEFORE INSERT ON public.applications
    FOR EACH ROW
    EXECUTE FUNCTION public.check_application_rate_limit();

-- ============================================================
-- STEP 11: STRIPE CONNECT (Contas Express & Split Transfers)
-- ============================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS stripe_account_id text,
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS stripe_onboarding_complete boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS stripe_payouts_enabled boolean NOT NULL DEFAULT false;

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
