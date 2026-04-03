ALTER TABLE public.profiles
ADD COLUMN aceita_email boolean NOT NULL DEFAULT false,
ADD COLUMN aceita_whatsapp boolean NOT NULL DEFAULT false;