-- ============================================================
-- VaptVaga — Segurança Estrita do Chat (2 Participantes + Suporte Oficial)
-- Garante que apenas o Freelancer da candidatura, a Empresa dona da vaga
-- e o Suporte Oficial da VaptVaga acessem ou enviem dados no chat.
-- ============================================================

-- Remove políticas anteriores da tabela public.messages
DROP POLICY IF EXISTS "messages_select_participant" ON public.messages;
DROP POLICY IF EXISTS "messages_insert_authenticated" ON public.messages;
DROP POLICY IF EXISTS "messages_update_read" ON public.messages;
DROP POLICY IF EXISTS "messages_select_strict_participants_and_support" ON public.messages;
DROP POLICY IF EXISTS "messages_insert_strict_participants_and_support" ON public.messages;
DROP POLICY IF EXISTS "messages_update_read_strict" ON public.messages;
DROP POLICY IF EXISTS "messages_delete_support_only" ON public.messages;

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Função verificadora estrita de autorização no chat
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

  -- Suporte Oficial e Administradores VaptVaga têm acesso autorizado para mediação e segurança
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

  -- Apenas os 2 participantes envolvidos na conversa: Freelancer ou Empresa dona da vaga
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

-- Leitura permitida APENAS aos 2 participantes ou Suporte VaptVaga
CREATE POLICY "messages_select_strict_participants_and_support"
  ON public.messages FOR SELECT
  TO authenticated
  USING (
    public.is_chat_authorized_viewer(application_id, auth.uid())
  );

-- Envio permitido APENAS se o remetente autenticado for um dos 2 participantes ou Suporte
CREATE POLICY "messages_insert_strict_participants_and_support"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND public.is_chat_authorized_viewer(application_id, auth.uid())
  );

-- Atualização de leitura permitida APENAS aos participantes autorizados da conversa
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

-- Exclusão bloqueada para usuários comuns (apenas Suporte VaptVaga para auditoria)
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

-- Bloqueio no banco contra envio de links/convites externos para WhatsApp no chat
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
