# Seguridad: auditoría de inyección y control de acceso

Fecha: 2026-11-06. Revisión del código en el árbol de trabajo, sin commit, con pruebas locales y mocks.

## Alcance y límites de esta revisión

Se revisó el código y las migraciones del repositorio. **No** se consultó el proyecto real de Supabase, no se levantó ningún servidor, no se abrió un navegador y no se envió ningún formulario.

Este documento no afirma que inyectar sea imposible. Dice qué se verificó, cómo, y qué falta. Hay tres cosas sin verificar que importan:

- **La CSP no se probó en un navegador.** Una CSP mal ajustada no rompe el build ni los tests: rompe la página en silencio.
- **Las políticas RLS se leyeron en la migración**, no en la base real. Lo desplegado puede diferir.
- **La detección de PDF activo es heurística.** Reduce el riesgo; no prueba que un PDF sea inocuo.

## Hallazgos y estado

### Críticos

| # | Hallazgo | Evidencia (antes de corregir) | Estado |
|---|---|---|---|
| C1 | Ninguna acción admin verificaba sesión ni rol antes de usar el cliente de service role. Las Server Actions son endpoints públicos: cualquiera que invocara la acción podía leer todos los expedientes de menores, generar enlaces a sus documentos, alterar evaluaciones y exportar el Excel. | `app/actions/admin.ts:53`, `:188`, `:233`, `:324` | Corregido |
| C2 | Cualquiera con la clave anónima, que es pública, puede escribir directo en `postulaciones`, `integrantes`, `documentos_postulacion` y en el bucket, saltándose toda la validación del servidor. Incluye fijar `estado = 'seleccionado'` o el radicado. | `supabase/migrations/20261028000000_init_inscripciones_schema.sql:225-229`, `:258-262`, `:288-292`, `:348-352` | **Pendiente: requiere aplicar SQL** |
| C3 | Contraseña del administrador en texto plano, versionada y en el historial remoto de GitHub. | `supabase/crear_admin.sql:21`, `supabase/reparar_auth.sql:28`, commits `5db931f`, `4c7263f`, `356076d` | **Parcial: hay que rotarla** |

### Altos

| # | Hallazgo | Evidencia | Estado |
|---|---|---|---|
| A1 | `generarUrlDocumentoAction` firmaba cualquier ruta recibida, sin comprobar que perteneciera a un expediente. | `app/actions/admin.ts:188-205` | Corregido |
| A2 | Tipo de archivo validado solo con el MIME que declara el cliente, y ese MIME se guardaba en Storage. | `lib/validations/postulacion.ts:48-55`, `app/actions/postulaciones.ts:240` | Corregido |
| A3 | Sin cabeceras de seguridad ni CSP. | `next.config.ts` | Corregido; CSP sin probar en navegador |
| A4 | `guardarEvaluacionAction` no validaba `nuevo_estado` ni los identificadores, y aceptaba `evaluado_por` del cliente. Ese valor era texto para una columna `uuid`, así que guardar una evaluación fallaría contra la base real. | `app/actions/admin.ts:273`, migración `:103` | Corregido |

### Medios

| # | Hallazgo | Evidencia | Estado |
|---|---|---|---|
| M1 | Fórmulas sin neutralizar en el Excel. ExcelJS guarda estos valores como texto, así que no se ejecutan al abrir, pero sí al editar la celda o al pasar por CSV. | `lib/excel/generador-excel.ts:132-136`, `:183-187`, `:253` | Corregido |
| M2 | Campos sin longitud máxima, con caracteres de control y marcado aceptados. | `lib/validations/postulacion.ts:89-112`, `:117-139` | Corregido |
| M3 | Un valor irreconocible en `es_menor_edad` se convertía en `false` y evitaba exigir la autorización de acudientes. | `app/actions/postulaciones.ts:115`, `:131` | Corregido |
| M4 | PDF con JavaScript aceptado; un PDF ilegible pasaba sin revisión. | `lib/utils/optimizar-pdf.ts:54-61` | Corregido con límites |
| M5 | Sin límite de envíos en la única acción pública de escritura. | `app/actions/postulaciones.ts:42` | Parcial |
| M6 | RLS sin `FORCE`, exigido por el estándar. | Migración `:217-220` | **Pendiente: requiere aplicar SQL** |
| M7 | `SUPABASE_SERVICE_ROLE_KEY` sin barrera de compilación contra importarse en cliente. | `lib/supabase/admin.ts` | Corregido |

### Bajos

| # | Hallazgo | Evidencia | Estado |
|---|---|---|---|
| B1 | JSON sin tope y no comprobado como objeto. | `app/actions/postulaciones.ts:57-59` | Corregido |
| B2 | Carpeta de Storage con `Math.random`. | `app/actions/postulaciones.ts:200` | Corregido |
| B3 | Claves desconocidas en el JSON se ignoraban en silencio. | `app/actions/postulaciones.ts:146` | Corregido |
| B4 | `uuid` moderado, vía `exceljs`. | `pnpm audit` | Pendiente; no afecta a la ruta usada aquí según el aviso (solo con `buf` en v3/v5/v6), sin comprobarlo en el código de exceljs |

## Revisado sin hallazgos

- **XSS.** El único `dangerouslySetInnerHTML` es `components/landing/carga-inicial.tsx:27`, con script fijo sin datos externos. No hay `innerHTML`, `eval` ni `document.write`. Los `href` dinámicos usan constantes propias. `window.open` en `components/admin/expediente-pestanas.tsx:255` abre una URL devuelta por el servidor. Los datos almacenados se pintan con el escape de React.
- **SQL y PostgREST.** No hay `.or()`, `.filter()`, `.ilike()`, `.rpc()` ni búsqueda en servidor. Las consultas usan métodos parametrizados.
- **Secretos en cliente.** Ningún archivo del código usa `NEXT_PUBLIC_` con la clave de servicio. En `.next/static` no aparece el nombre de la variable ni la marca de un JWT `service_role`. La única coincidencia de `sb_secret_` es la comprobación de prefijo de supabase-js. El build revisado es el que había en disco y no se sabe si está al día.
- **`.env`.** Está ignorado y nunca se versionó según `git log --all -- .env`. Su contenido no se leyó.
- **Bucket.** Privado, 10 MB, con lista de MIME (migración `:186-197`).

## Correcciones

- **Autorización.** `obtenerAdministrador()` en `lib/supabase/autorizacion.ts` usa `getUser()` y exige `app_metadata.role === "admin"`; cualquier fallo deniega. Se llama en las cuatro acciones antes de crear el cliente de service role. La consulta interna sin verificación no se exporta.
- **Documentos.** Solo se firman rutas con forma válida y registradas en `documentos_postulacion`. Vigencia de 60 segundos en lugar de 300, con `Content-Disposition: attachment`. **Cambio visible:** el documento se descarga en lugar de verse en la pestaña.
- **Archivos.** `lib/validations/archivos.ts` detecta el tipo por bytes mágicos. Se revisan todos antes de subir ninguno. Ruta, extensión y `contentType` salen del servidor; el nombre original solo se guarda como metadato saneado.
- **PDF.** Se rechazan los que contienen JavaScript, acciones `Launch`/`ImportData`/`GoToE`, adjuntos, `RichMedia` o XFA, incluso dentro de object streams o con nombres ofuscados con `#xx`. Se rechazan los cifrados y los que no tienen páginas: pdf-lib aceptaba `%PDF-` seguido de basura, y un test lo descubrió.
- **Validación.** `lib/validations/texto-seguro.ts` define limpieza de invisibles y listas blancas. Hay límites de longitud, `strictObject` en la postulación, en los integrantes y en la evaluación, y claves desconocidas rechazadas.
- **Excel.** Barrido de todas las hojas con apóstrofo inicial sobre `=`, `+`, `-`, `@`, tabulador, retorno, espacios previos y sus variantes de ancho completo. Los teléfonos válidos con `+` no cambian. Se quitan controles que corromperían el XML.
- **Abuso.** 10 intentos por hora y por IP, en memoria, y honeypot `sitio_web` en el servidor.
- **Cabeceras.** `next.config.ts`: CSP, HSTS sin `preload`, `nosniff`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, COOP y `poweredByHeader: false`.
- **Secretos.** `supabase/crear_admin.sql` usa un marcador y falla con un mensaje claro si se ejecuta sin reemplazarlo al crear el usuario. `lib/supabase/admin.ts` y `autorizacion.ts` llevan `import "server-only"`.

### Por qué la CSP usa `'unsafe-inline'` y no nonce

`/` y las demás páginas son estáticas. Next documenta que un nonce exige renderizado dinámico en cada petición: se pierde el HTML estático y la caché de CDN, y exigiría añadir `proxy.ts` y tocar el layout. Los hashes tampoco sirven: la landing tiene un script fijo que se podría hashear, pero Next emite scripts de datos que cambian por página y por build, y un solo hash en la política hace que el navegador ignore `'unsafe-inline'`, bloqueándolos. El modo SRI de Next es experimental y solo cubre archivos externos.

**Coste aceptado:** esta CSP no detiene un script en línea que llegara a inyectarse. Sí bloquea scripts de otros orígenes, `eval` en producción, `object`, cambio de `base`, envío de formularios a otros sitios, incrustación en marcos y peticiones `fetch` a dominios ajenos. Contra XSS, la defensa principal sigue siendo el escape de React y la validación de entrada.

`'unsafe-eval'`, los WebSocket de recarga en desarrollo y la ausencia de HSTS se aplican solo fuera de producción. El estándar pide desplegar primero en `Report-Only`; aquí se dejó aplicada por pedido expreso.

## Pendientes

### Requieren al dueño

1. **Rotar ya la contraseña del administrador** y revisar accesos. Sigue en el historial de GitHub: quitarla del archivo no la invalida, y reescribir el historial no basta.
2. **`supabase/reparar_auth.sql:28` conserva la misma contraseña en texto.** Quedó fuera del alcance autorizado y hay que limpiarla igual.
3. **Aplicar el SQL de abajo.** Hasta entonces C2 sigue abierto: el formulario está validado, pero la API de Supabase no.
4. **Comprobar en el proyecto real** que el registro público esté desactivado y que RLS y las políticas coincidan con la migración.
5. **Abrir `/`, `/postulacion` y `/admin` con la consola del navegador** y confirmar que no hay errores de CSP.

### Requieren cambios en componentes

6. **Honeypot.** El formulario no envía `sitio_web`, así que la trampa no atrapa nada hasta añadir un campo oculto en `components/formulario/formulario-postulacion.tsx`.
7. **`evaluado_por`.** `components/admin/expediente-evaluacion.tsx:72` envía un texto que el servidor ahora ignora. Se puede quitar.
8. **`/admin` decide qué pantalla mostrar con `getSession()` en el navegador** (`app/admin/page.tsx:37`). No es una frontera de seguridad, porque los datos ya exigen rol en servidor, pero un usuario sin rol vería el panel vacío con un error.

### Riesgo residual

- **Límite de tasa.** Vale por instancia y se reinicia con cada despliegue; no frena un ataque distribuido. Uno real necesita un almacén compartido, como Upstash, que no está en el stack.
- **Sin antivirus.** El estándar lo pide cuando un usuario sube y otro descarga. Las imágenes no se recodifican y conservan sus metadatos, y una imagen con bytes válidos puede llevar datos añadidos.
- **Bomba de compresión en PDF.** Un PDF de 10 MB podría consumir mucha memoria al descomprimirse en pdf-lib. No se midió ni se limitó.
- **PDF legítimos rechazados.** Los protegidos con contraseña y los formularios con validación en JavaScript se rechazan, con instrucción de usar «Imprimir como PDF». Es una decisión de negar por defecto.
- **Sin tabla de auditoría** de accesos a datos sensibles, que el estándar exige.
- **Documentos ya cargados.** Las correcciones aplican a envíos nuevos. Lo ya almacenado no se revisó ni se migró.
- **Coherencia de evaluación.** `guardarEvaluacionAction` responde éxito aunque falle el cambio de estado (`app/actions/admin.ts`). No es un problema de inyección y se dejó igual.
- **Despliegue.** Si es en Vercel, hay un límite de cuerpo por función muy inferior a los `55mb` configurados. No se comprobó dónde se desplegará.
- **Registro npm.** `.npmrc` apunta a `registry.npmmirror.com`, que no ofrece auditoría, y las dependencias se instalan desde ese espejo. La auditoría se hizo contra el registro oficial con un flag de esa sola llamada.

### SQL propuesto (sin aplicar)

`supabase/migrations` quedó fuera del alcance de esta tanda, así que no se creó el archivo. El código funciona antes y después de aplicarlo, porque el servidor usa service role.

```sql
begin;

alter table public.postulaciones force row level security;
alter table public.integrantes force row level security;
alter table public.documentos_postulacion force row level security;
alter table public.evaluaciones force row level security;

drop policy if exists "postulaciones_insert_public" on public.postulaciones;
drop policy if exists "integrantes_insert_public" on public.integrantes;
drop policy if exists "documentos_postulacion_insert_public" on public.documentos_postulacion;
drop policy if exists "postulaciones_docs_insert_policy" on storage.objects;

revoke all on table
  public.postulaciones,
  public.integrantes,
  public.documentos_postulacion,
  public.evaluaciones
from anon;

revoke insert, truncate, references, trigger on table
  public.postulaciones,
  public.integrantes,
  public.documentos_postulacion
from authenticated;

revoke truncate, references, trigger on table public.evaluaciones from authenticated;

revoke all on sequence public.postulacion_radicado_seq from anon, authenticated;

commit;
```

Después de aplicarlo, esta consulta debe devolver cero filas:

```sql
select polname from pg_policy where polname like '%insert_public%' or polname = 'postulaciones_docs_insert_policy';
```

## Verificación

| Comprobación | Resultado |
|---|---|
| `pnpm test` (`vitest run`) | 6 archivos, 134 pruebas, todas correctas |
| `pnpm typecheck` (`tsc --noEmit`) | 0 errores |
| `npx biome check app/actions lib tests next.config.ts` | 29 archivos, sin errores |
| `pnpm audit --registry=https://registry.npmjs.org` | 0 critical, 0 high, 1 moderate (`uuid` vía `exceljs`) |

Las pruebas nuevas están en `tests/seguridad.test.ts`: acción admin sin sesión o sin rol rechazada sin tocar el cliente de service role, rol en `user_metadata` ignorado, fórmula neutralizada con teléfono intacto, archivo falso rechazado sin subir nada, PDF con JavaScript rechazado, marcado rechazado con nombres legítimos aceptados, y cabeceras. Todas usan mocks y no hacen llamadas de red.
