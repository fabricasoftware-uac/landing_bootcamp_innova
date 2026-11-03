-- ==============================================================================
-- Migración: 20261028000000_init_inscripciones_schema.sql
-- Proyecto: Festival de Semilleros de Investigación Cauca INNOVA 2026
-- Descripción:
--   Crea el esquema relacional normalizado para el sistema de inscripciones:
--   - Secuencia y trigger para generación automática de radicado único (INNOVA-2026-XXXX).
--   - Tabla `postulaciones`: registro cabecera de la postulación y tutor.
--   - Tabla `integrantes`: detalle de los 3 estudiantes por equipo.
--   - Tabla `documentos_postulacion`: metadatos de archivos adjuntos.
--   - Tabla `evaluaciones`: módulo de calificación y dictamen del comité evaluador.
--   - Inicialización del bucket privado `postulaciones_docs` en Storage.
--   - Políticas RLS estrictas protegidas contra BOLA/IDOR (rol 'admin' en app_metadata).
-- ==============================================================================

-- 1. EXTENSIONES Y SECUENCIAS
create extension if not exists "pgcrypto";

create sequence if not exists public.postulacion_radicado_seq
  as bigint
  start with 1
  increment by 1
  no minvalue
  no maxvalue
  cache 1;

comment on sequence public.postulacion_radicado_seq is 'Secuencia correlativa para radicado oficial INNOVA-2026-XXXX';

-- 2. TABLA: postulaciones
create table if not exists public.postulaciones (
  id uuid primary key default gen_random_uuid(),
  radicado_codigo text not null unique,
  institucion_nombre text not null,
  institucion_tipo text not null check (institucion_tipo in ('basica_media', 'superior')),
  semillero_nombre text not null,
  tutor_nombre text not null,
  tutor_email text not null,
  tutor_telefono text not null,
  motivacion_intereses text not null,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'habilitado', 'no_habilitado', 'seleccionado')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.postulaciones is 'Registro principal de postulaciones de semilleros para Cauca INNOVA';
comment on column public.postulaciones.radicado_codigo is 'Código alfanumérico único para seguimiento del equipo (INNOVA-2026-XXXX)';
comment on column public.postulaciones.institucion_tipo is 'Tipo de institución: basica_media (colegios) o superior (universidades/tecnológicos)';
comment on column public.postulaciones.estado is 'Estado actual en el proceso: pendiente, habilitado, no_habilitado o seleccionado';

-- 3. TABLA: integrantes
create table if not exists public.integrantes (
  id uuid primary key default gen_random_uuid(),
  postulacion_id uuid not null references public.postulaciones(id) on delete cascade,
  orden_integrante integer not null check (orden_integrante between 1 and 3),
  nombres_apellidos text not null,
  tipo_documento text not null,
  numero_documento text not null,
  correo_electronico text not null,
  telefono text not null,
  es_menor_edad boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_postulacion_orden_integrante unique (postulacion_id, orden_integrante)
);

comment on table public.integrantes is 'Estudiantes que conforman el equipo de 3 integrantes de cada postulación';
comment on column public.integrantes.orden_integrante is 'Posición del estudiante dentro del equipo (1, 2 o 3)';
comment on column public.integrantes.es_menor_edad is 'Indica si es menor de 18 años para exigir autorización de acudiente';

-- 4. TABLA: documentos_postulacion
create table if not exists public.documentos_postulacion (
  id uuid primary key default gen_random_uuid(),
  postulacion_id uuid not null references public.postulaciones(id) on delete cascade,
  tipo_documento text not null check (
    tipo_documento in (
      'aval_semillero',
      'doc_identidad_1',
      'doc_identidad_2',
      'doc_identidad_3',
      'autorizacion_menores'
    )
  ),
  storage_path text not null,
  nombre_original text not null,
  tamano_bytes bigint not null check (tamano_bytes > 0),
  mime_type text not null,
  subido_el timestamptz not null default now()
);

comment on table public.documentos_postulacion is 'Metadatos de documentos requeridos almacenados en bucket privado';
comment on column public.documentos_postulacion.tipo_documento is 'Categoría del documento adjunto según los TDR';
comment on column public.documentos_postulacion.storage_path is 'Ruta relativa dentro del bucket postulaciones_docs';

-- 5. TABLA: evaluaciones
create table if not exists public.evaluaciones (
  id uuid primary key default gen_random_uuid(),
  postulacion_id uuid not null unique references public.postulaciones(id) on delete cascade,
  cumple_requisitos_habilitante boolean not null default false,
  puntaje_motivacion integer not null default 0 check (puntaje_motivacion between 0 and 100),
  puntaje_pertinencia integer not null default 0 check (puntaje_pertinencia between 0 and 100),
  puntaje_diversidad integer not null default 0 check (puntaje_diversidad between 0 and 100),
  puntaje_representacion integer not null default 0 check (puntaje_representacion between 0 and 100),
  observaciones text,
  evaluado_por uuid references auth.users(id) on delete set null,
  evaluado_el timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.evaluaciones is 'Evaluación ponderada realizada por el comité evaluador';
comment on column public.evaluaciones.cumple_requisitos_habilitante is 'Verificación de documentación completa y requisitos de elegibilidad';
comment on column public.evaluaciones.puntaje_motivacion is 'Criterio 1: Motivación e interés por investigación e innovación (30%)';
comment on column public.evaluaciones.puntaje_pertinencia is 'Criterio 2: Pertinencia frente a los retos del Festival (30%)';
comment on column public.evaluaciones.puntaje_diversidad is 'Criterio 3: Diversidad de conocimientos y habilidades (20%)';
comment on column public.evaluaciones.puntaje_representacion is 'Criterio 4: Representación institucional y territorial (20%)';

-- 6. ÍNDICES DE RENDIMIENTO (Foreign Keys y filtros frecuentes)
create index if not exists idx_postulaciones_estado on public.postulaciones(estado);
create index if not exists idx_postulaciones_institucion_tipo on public.postulaciones(institucion_tipo);
create index if not exists idx_postulaciones_created_at on public.postulaciones(created_at desc);

create index if not exists idx_integrantes_postulacion_id on public.integrantes(postulacion_id);

create index if not exists idx_documentos_postulacion_postulacion_id on public.documentos_postulacion(postulacion_id);
create index if not exists idx_documentos_postulacion_tipo on public.documentos_postulacion(tipo_documento);

create index if not exists idx_evaluaciones_postulacion_id on public.evaluaciones(postulacion_id);
create index if not exists idx_evaluaciones_evaluado_por on public.evaluaciones(evaluado_por);

-- 7. FUNCIONES Y TRIGGERS

-- 7.1 Generación de código de radicado único
create or replace function public.set_postulacion_radicado()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  next_val bigint;
begin
  if new.radicado_codigo is null or trim(new.radicado_codigo) = '' then
    next_val := nextval('public.postulacion_radicado_seq');
    new.radicado_codigo := 'INNOVA-2026-' || lpad(next_val::text, 4, '0');
  end if;
  return new;
end;
$$;

drop trigger if exists trg_set_postulacion_radicado on public.postulaciones;
create trigger trg_set_postulacion_radicado
before insert on public.postulaciones
for each row
execute function public.set_postulacion_radicado();

-- 7.2 Manejador de updated_at
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_postulaciones_updated_at on public.postulaciones;
create trigger trg_postulaciones_updated_at
before update on public.postulaciones
for each row
execute function public.handle_updated_at();

drop trigger if exists trg_integrantes_updated_at on public.integrantes;
create trigger trg_integrantes_updated_at
before update on public.integrantes
for each row
execute function public.handle_updated_at();

drop trigger if exists trg_evaluaciones_updated_at on public.evaluaciones;
create trigger trg_evaluaciones_updated_at
before update on public.evaluaciones
for each row
execute function public.handle_updated_at();

-- 8. CONFIGURACIÓN DE STORAGE (BUCKET PRIVADO)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'postulaciones_docs',
  'postulaciones_docs',
  false,
  10485760, -- 10 MB máximo
  array['application/pdf', 'image/jpeg', 'image/png']::text[]
)
on conflict (id) do update set
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = array['application/pdf', 'image/jpeg', 'image/png']::text[];

-- 9. PERMISOS DE TABLA (DATA API / POSTGREST)
grant usage on schema public to anon, authenticated;

grant insert on table public.postulaciones to anon, authenticated;
grant select, update, delete on table public.postulaciones to authenticated;

grant insert on table public.integrantes to anon, authenticated;
grant select, update, delete on table public.integrantes to authenticated;

grant insert on table public.documentos_postulacion to anon, authenticated;
grant select, update, delete on table public.documentos_postulacion to authenticated;

grant select, insert, update, delete on table public.evaluaciones to authenticated;

grant usage, select on sequence public.postulacion_radicado_seq to anon, authenticated;

-- 10. SEGURIDAD: ROW LEVEL SECURITY (RLS)

alter table public.postulaciones enable row level security;
alter table public.integrantes enable row level security;
alter table public.documentos_postulacion enable row level security;
alter table public.evaluaciones enable row level security;

-- 10.1 Políticas para: postulaciones
-- Permite a cualquier aspirante enviar su postulación
drop policy if exists "postulaciones_insert_public" on public.postulaciones;
create policy "postulaciones_insert_public"
on public.postulaciones
for insert
to anon, authenticated
with check (true);

-- Lectura exclusiva para evaluadores/administradores autenticados
drop policy if exists "postulaciones_select_admin" on public.postulaciones;
create policy "postulaciones_select_admin"
on public.postulaciones
for select
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Modificación exclusiva para administradores
drop policy if exists "postulaciones_update_admin" on public.postulaciones;
create policy "postulaciones_update_admin"
on public.postulaciones
for update
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Eliminación exclusiva para administradores
drop policy if exists "postulaciones_delete_admin" on public.postulaciones;
create policy "postulaciones_delete_admin"
on public.postulaciones
for delete
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- 10.2 Políticas para: integrantes
drop policy if exists "integrantes_insert_public" on public.integrantes;
create policy "integrantes_insert_public"
on public.integrantes
for insert
to anon, authenticated
with check (true);

drop policy if exists "integrantes_select_admin" on public.integrantes;
create policy "integrantes_select_admin"
on public.integrantes
for select
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "integrantes_update_admin" on public.integrantes;
create policy "integrantes_update_admin"
on public.integrantes
for update
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "integrantes_delete_admin" on public.integrantes;
create policy "integrantes_delete_admin"
on public.integrantes
for delete
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- 10.3 Políticas para: documentos_postulacion
drop policy if exists "documentos_postulacion_insert_public" on public.documentos_postulacion;
create policy "documentos_postulacion_insert_public"
on public.documentos_postulacion
for insert
to anon, authenticated
with check (true);

drop policy if exists "documentos_postulacion_select_admin" on public.documentos_postulacion;
create policy "documentos_postulacion_select_admin"
on public.documentos_postulacion
for select
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "documentos_postulacion_update_admin" on public.documentos_postulacion;
create policy "documentos_postulacion_update_admin"
on public.documentos_postulacion
for update
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "documentos_postulacion_delete_admin" on public.documentos_postulacion;
create policy "documentos_postulacion_delete_admin"
on public.documentos_postulacion
for delete
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- 10.4 Políticas para: evaluaciones
drop policy if exists "evaluaciones_select_admin" on public.evaluaciones;
create policy "evaluaciones_select_admin"
on public.evaluaciones
for select
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "evaluaciones_insert_admin" on public.evaluaciones;
create policy "evaluaciones_insert_admin"
on public.evaluaciones
for insert
to authenticated
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "evaluaciones_update_admin" on public.evaluaciones;
create policy "evaluaciones_update_admin"
on public.evaluaciones
for update
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "evaluaciones_delete_admin" on public.evaluaciones;
create policy "evaluaciones_delete_admin"
on public.evaluaciones
for delete
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- 10.5 Políticas para: storage.objects (Bucket postulaciones_docs)
drop policy if exists "postulaciones_docs_insert_policy" on storage.objects;
create policy "postulaciones_docs_insert_policy"
on storage.objects
for insert
to anon, authenticated
with check (bucket_id = 'postulaciones_docs');

drop policy if exists "postulaciones_docs_select_admin_policy" on storage.objects;
create policy "postulaciones_docs_select_admin_policy"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'postulaciones_docs'
  and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

drop policy if exists "postulaciones_docs_update_admin_policy" on storage.objects;
create policy "postulaciones_docs_update_admin_policy"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'postulaciones_docs'
  and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
)
with check (
  bucket_id = 'postulaciones_docs'
  and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

drop policy if exists "postulaciones_docs_delete_admin_policy" on storage.objects;
create policy "postulaciones_docs_delete_admin_policy"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'postulaciones_docs'
  and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);
