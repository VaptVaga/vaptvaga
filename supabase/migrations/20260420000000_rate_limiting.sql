-- ==========================================
-- Rate Limiting Triggers para Segurança
-- ==========================================

-- 1. Limite para Formulário de Contato (Por Email)
-- Previne que o mesmo email envie centenas de mensagens de spam.
CREATE OR REPLACE FUNCTION public.check_contact_message_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
    message_count INT;
BEGIN
    -- Conta quantas mensagens esse email enviou nos últimos 15 minutos
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

-- 2. Limite para Criação de Vagas (Prevenção de Spam de Vagas)
-- Previne que uma empresa crie mais de 10 vagas por hora.
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
        RAISE EXCEPTION 'Limite de publicações excedido. Você pode publicar no máximo 10 vagas por hora.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS enforce_job_creation_rate_limit ON public.jobs;
CREATE TRIGGER enforce_job_creation_rate_limit
    BEFORE INSERT ON public.jobs
    FOR EACH ROW
    EXECUTE FUNCTION public.check_job_creation_rate_limit();

-- 3. Limite para Candidaturas (Prevenção de Flood)
-- Previne que um freelancer se candidate a mais de 30 vagas por hora.
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
        RAISE EXCEPTION 'Limite de candidaturas excedido. Você pode se candidatar a no máximo 30 vagas por hora.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS enforce_application_rate_limit ON public.applications;
CREATE TRIGGER enforce_application_rate_limit
    BEFORE INSERT ON public.applications
    FOR EACH ROW
    EXECUTE FUNCTION public.check_application_rate_limit();
