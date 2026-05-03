CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
DROP VIEW IF EXISTS public.solutions_public;

DO $$ BEGIN
  CREATE TYPE public.solution_status AS ENUM ('live', 'upcoming', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.solutions DROP CONSTRAINT IF EXISTS solutions_status_check;
ALTER TABLE public.solutions ALTER COLUMN status DROP DEFAULT;
ALTER TABLE public.solutions
  ALTER COLUMN status TYPE public.solution_status
  USING (
    CASE WHEN status IN ('live','upcoming','archived')
      THEN status::public.solution_status
      ELSE 'live'::public.solution_status END
  );
ALTER TABLE public.solutions
  ALTER COLUMN status SET DEFAULT 'live'::public.solution_status,
  ALTER COLUMN status SET NOT NULL;

ALTER TABLE public.solutions ADD COLUMN IF NOT EXISTS upcoming_eta date;

CREATE TABLE IF NOT EXISTS public._app_secrets (
  key text PRIMARY KEY, value text NOT NULL
);
ALTER TABLE public._app_secrets ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.set_credentials_key(_key text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
BEGIN
  INSERT INTO public._app_secrets(key,value) VALUES ('credentials_key',_key)
  ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
END $$;
REVOKE ALL ON FUNCTION public.set_credentials_key(text) FROM public, anon, authenticated;

CREATE OR REPLACE FUNCTION public.encrypt_credential(_plaintext text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
DECLARE k text;
BEGIN
  IF _plaintext IS NULL OR _plaintext = '' THEN RETURN NULL; END IF;
  SELECT value INTO k FROM public._app_secrets WHERE key='credentials_key';
  IF k IS NULL THEN RAISE EXCEPTION 'credentials_key not set'; END IF;
  RETURN encode(extensions.pgp_sym_encrypt(_plaintext,k),'base64');
END $$;
REVOKE ALL ON FUNCTION public.encrypt_credential(text) FROM public, anon, authenticated;

CREATE OR REPLACE FUNCTION public.decrypt_credential(_ciphertext text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
DECLARE k text;
BEGIN
  IF _ciphertext IS NULL OR _ciphertext='' THEN RETURN NULL; END IF;
  SELECT value INTO k FROM public._app_secrets WHERE key='credentials_key';
  IF k IS NULL THEN RAISE EXCEPTION 'credentials_key not set'; END IF;
  RETURN extensions.pgp_sym_decrypt(decode(_ciphertext,'base64'),k);
END $$;
REVOKE ALL ON FUNCTION public.decrypt_credential(text) FROM public, anon, authenticated;

CREATE VIEW public.solutions_public
WITH (security_invoker = true) AS
SELECT id, title, description, icon_url, thumbnail_url, target_url,
  solution_type, status, upcoming_eta,
  default_username, credentials_note,
  (default_password_encrypted IS NOT NULL) AS has_credentials,
  created_at, updated_at
FROM public.solutions
WHERE status <> 'archived';

GRANT SELECT ON public.solutions_public TO anon, authenticated;

CREATE TABLE IF NOT EXISTS public.credential_reveals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  solution_id uuid NOT NULL REFERENCES public.solutions(id) ON DELETE CASCADE,
  email text NOT NULL,
  session_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.credential_reveals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "credential_reveals public insert" ON public.credential_reveals;
CREATE POLICY "credential_reveals public insert"
  ON public.credential_reveals FOR INSERT TO public WITH CHECK (true);