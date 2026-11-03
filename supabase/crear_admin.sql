-- ==============================================================================
-- Creación / Aprovisionamiento de Usuario Administrador en Supabase Auth
-- Proyecto: Bootcamp de Semilleros de Investigación Cauca INNOVA 2026
-- ==============================================================================
-- Este script permite aprovisionar de forma segura un usuario administrador con
-- el rol 'admin' en `app_metadata`, habilitando el acceso a /admin y a las
-- políticas RLS de postulaciones, evaluaciones y documentos privados.
--
-- Ejecuta este script en el SQL Editor de tu Dashboard de Supabase.
-- ==============================================================================

DO $$
DECLARE
  v_user_id uuid := gen_random_uuid();
  -- Configura aquí las credenciales iniciales deseadas:
  v_email text := 'admin@caucainnova.gov.co';
  v_password text := 'CaucaInnova2026*';
BEGIN
  -- 1. Si el usuario no existe, se inserta en auth.users y auth.identities
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = v_email) THEN
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
      recovery_token
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
      ''
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

    RAISE NOTICE 'Usuario administrador creado exitosamente: %', v_email;
  ELSE
    -- 2. Si el usuario ya existe, asegurar que cuente con el rol 'admin' en app_metadata
    UPDATE auth.users
    SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'admin')
    WHERE email = v_email;

    RAISE NOTICE 'Rol admin asignado exitosamente al usuario existente: %', v_email;
  END IF;
END $$;
