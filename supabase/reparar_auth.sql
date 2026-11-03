-- ==============================================================================
-- Script de Reparación Inmediata de auth.users y Creación de Administrador
-- Proyecto: Bootcamp Cauca INNOVA 2026
-- ==============================================================================
-- Este script soluciona el error 500 "Database error querying schema" y
-- "Database error finding users" en Supabase Auth (GoTrue).
--
-- Causa: Cuando se inserta un usuario directamente con SQL sin especificar los
-- tokens internos, quedan con valor NULL. El motor de GoTrue espera strings vacíos ('')
-- y genera un error de escaneo de columnas al intentar autenticar.
-- ==============================================================================

-- PASO 1: Reparar columnas NULL existentes en toda la tabla auth.users
UPDATE auth.users
SET 
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change = COALESCE(email_change, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  reauthentication_token = COALESCE(reauthentication_token, '');

-- PASO 2: Asegurar o crear el usuario administrador con todos los campos no-nulos requeridos
DO $$
DECLARE
  v_user_id uuid := gen_random_uuid();
  v_email text := 'admin@caucainnova.gov.co';     -- Puedes cambiar este correo
  v_password text := 'CaucaInnova2026*';           -- Puedes cambiar esta contraseña
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = v_email) THEN
    -- Inserción con todos los campos de texto inicializados como '' para cumplir el struct de GoTrue
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

    -- Registrar identidad para inicio de sesión con email/password
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

    RAISE NOTICE 'Administrador creado exitosamente con credenciales y tokens corregidos: %', v_email;
  ELSE
    -- Si ya existía, asignar rol admin y garantizar que no tenga campos NULL
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

    RAISE NOTICE 'Rol de administrador asignado y tokens saneados para: %', v_email;
  END IF;
END $$;
