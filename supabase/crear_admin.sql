-- ==============================================================================
-- Creación / Aprovisionamiento Seguro de Administrador en Supabase Auth
-- Proyecto: Bootcamp Cauca INNOVA 2026
-- ==============================================================================

-- 1. Saneamiento de campos NULL en auth.users
UPDATE auth.users
SET 
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change = COALESCE(email_change, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  reauthentication_token = COALESCE(reauthentication_token, '');

-- 2. Creación / Actualización del usuario administrador
DO $$
DECLARE
  v_user_id uuid := gen_random_uuid();
  v_email text := 'admin@caucainnova.gov.co';     -- Define aquí tu correo
  v_password text := '__DEFINE_CONTRASENA_SEGURA__';  -- Reemplaza antes de ejecutar; no la guardes en el repositorio
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = v_email) THEN
    IF v_password = '__DEFINE_CONTRASENA_SEGURA__' THEN
      RAISE EXCEPTION 'Define v_password antes de ejecutar este script';
    END IF;

    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change,
      email_change_token_current,
      reauthentication_token,
      is_super_admin
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      v_user_id,
      'authenticated',
      'authenticated',
      v_email,
      crypt(v_password, gen_salt('bf')),
      now(),
      jsonb_build_object('provider', 'email', 'providers', array['email'], 'role', 'admin'),
      jsonb_build_object('nombre', 'Administrador Cauca INNOVA'),
      now(),
      now(),
      '',
      '',
      '',
      '',
      '',
      '',
      false
    );

    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      v_user_id,
      jsonb_build_object('sub', v_user_id::text, 'email', v_email),
      'email',
      v_user_id::text,
      now(),
      now(),
      now()
    );

    RAISE NOTICE 'Administrador creado exitosamente: %', v_email;
  ELSE
    UPDATE auth.users
    SET 
      raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'admin'),
      confirmation_token = COALESCE(confirmation_token, ''),
      recovery_token = COALESCE(recovery_token, ''),
      email_change = COALESCE(email_change, ''),
      email_change_token_new = COALESCE(email_change_token_new, ''),
      email_change_token_current = COALESCE(email_change_token_current, ''),
      reauthentication_token = COALESCE(reauthentication_token, '')
    WHERE email = v_email;

    RAISE NOTICE 'Rol admin asignado exitosamente y campos saneados para: %', v_email;
  END IF;
END $$;
