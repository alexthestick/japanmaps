-- Reviewed SQL only. Apply directly after approval; do not run `supabase db push`.
-- on_auth_user_created already calls this function after auth.users INSERT.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_username text := NEW.raw_user_meta_data ->> 'username';
  fallback_display_name text := COALESCE(
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'name'
  );
BEGIN
  -- Match the website rule. Metadata is client-controlled, so validate here too.
  IF new_username IS NULL
     OR length(new_username) NOT BETWEEN 3 AND 20
     OR new_username !~ '^[a-z0-9_]+$' THEN
    new_username := NULL;
  END IF;

  INSERT INTO public.profiles (id, username, display_name, created_at, updated_at)
  VALUES (
    NEW.id,
    new_username,
    COALESCE(new_username, fallback_display_name),
    NOW(),
    NOW()
  )
  ON CONFLICT DO NOTHING;

  -- If another sign-up claimed the username between the availability check and
  -- this insert, still create the account and its profile without a username.
  IF NOT FOUND THEN
    INSERT INTO public.profiles (id, username, display_name, created_at, updated_at)
    VALUES (NEW.id, NULL, fallback_display_name, NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$function$;
