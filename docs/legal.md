# Textos legales del sitio: fuentes, decisiones y pendientes

Fecha de última actualización de las páginas: 6 de noviembre de 2026.

**Antes de publicar, estos textos deben pasar por la oficina jurídica de la Gobernación del Cauca y de la Corporación Universitaria Autónoma del Cauca.** Fueron redactados a partir del código del sitio y de fuentes oficiales, pero no son un concepto jurídico. Ningún texto afirma cumplimiento garantizado y así debe seguir.

Páginas: `/terminos-de-referencia`, `/privacidad`, `/terminos`, `/cookies`. Datos en `lib/legal.ts`. Plantilla en `components/legal/`.

## Términos de referencia

`lib/terminos-referencia.ts` es una transcripción del PDF oficial (`public/documentos/terminos-de-referencia.pdf`, 14 de noviembre, siete equipos, 21 participantes). Si cambia el PDF, se vuelve a transcribir y se actualiza `huellaTerminos`, su SHA-256.

La página conserva lo que dice el documento, incluidos los títulos repetidos con el número 2 y el 7, y «LOS EQUIPO». Solo se corrigió «Bootcamp0», que trae un cero suelto.

### Diferencias entre el PDF y el sitio, por decidir

| Tema | PDF oficial | Sitio |
| --- | --- | --- |
| Integrantes | Máximo tres por equipo | Exactamente tres: el formulario y el servidor lo exigen |
| Criterios de selección | Ya no trae el 30/30/20/20; solo enumera criterios de evaluación para el pitch | Gráfico del Recorrido, paso 3, comprobante y calificación del panel usan 30/30/20/20 |
| Propiedad intelectual | Ya no trae la sección | Preguntas frecuentes la explica |
| Desempate y lista de espera | Ya no los trae | `/privacidad` menciona la lista de espera |

## Datos verificados

| Dato | Valor | Fuente |
| --- | --- | --- |
| NIT Gobernación | 891580016-8 | Política GT-PL-01, sección 10.2: <https://intranet.cauca.gov.co/phocadownload/politicas/politica-tratamiento-datos-personales.pdf>. También Resolución 10801 de 2025: <https://www.cauca.gov.co/NuestraGestion/Normatividad/Resoluci%C3%B3n%2010801%20de%202025.pdf> |
| Dirección Gobernación | Carrera 7 Calle 4 Esquina, Popayán | <https://www.cauca.gov.co/> |
| Secretaría | Carrera 6 Calle 22N, Edificio de Infraestructura, Popayán; +57 314 517 9711; scompetitividad@cauca.gov.co | <https://www.cauca.gov.co/Dependencias/DesarrolloEconomico/Paginas/Default.aspx> |
| Correo Gobernación | contactenos@cauca.gov.co | <https://www.cauca.gov.co/> y GT-PL-01 |
| Política Gobernación | GT-PL-01, versión 01, 24-08-2021 | Enlazada desde <https://www.cauca.gov.co/Paginas/Politicas-de-Privacidad-y-Condiciones-de-Uso.aspx> |
| NIT Uniautónoma | 891.501.766-6 | Resolución 0186 de 2018, artículo sexto, y Reglamento Interno de Trabajo: <https://portal.uniautonoma.edu.co/wp-content/uploads/2025/05/REGLAMENTO-INTERNO-DE-TRABAJO-ACDO-23-DE-2024.pdf> |
| Dirección Uniautónoma | Calle 5 No. 3-85, Popayán | Resolución 0186 de 2018, artículo sexto |
| Correo de datos Uniautónoma | habeasdata@uniautonoma.edu.co | Resolución 0186 de 2018, artículos sexto y vigésimo: <https://portal.uniautonoma.edu.co/wp-content/uploads/2025/05/POLITICA-TRATAMIENTO-DATOS-PERSONALES-RES-0186-DE-2018.pdf>. Listada en <https://portal.uniautonoma.edu.co/transparencia> |
| Sin región de Supabase en Colombia | Solo São Paulo en Suramérica | <https://supabase.com/docs/guides/platform/regions> |
| Alcance de la región | Base, Auth, Storage y copias en la región; algunos datos se procesan fuera | <https://supabase.com/legal/privacy-resources/data-residency-and-transfers-faq> |
| Duración de la cookie de sesión | `maxAge` de 400 días; se borra al cerrar sesión | `node_modules/@supabase/ssr/dist/main/utils/constants.js` |

### Normas revisadas

Texto leído en el Gestor Normativo de Función Pública:

- Ley 1581 de 2012, arts. 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 14, 15, 16, 25 y 26: <https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=49981>. Consultas 10 días hábiles más 5; reclamos 15 más 8; incompleto 5 días; desistimiento 2 meses; traslado 2 días hábiles.
- Decreto 1377 de 2013, arts. 6, 7, 8, 9, 11, 12, 13, 21, 23, 24 y 25: <https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=53646>.
- Decreto 1074 de 2015, arts. 2.2.2.25.2.3 (sensibles), 2.2.2.25.2.4 (modo de autorizar), 2.2.2.25.2.5 (prueba), 2.2.2.25.2.6 (revocatoria), 2.2.2.25.2.8 (temporalidad), 2.2.2.25.2.9 (menores), 2.2.2.25.3.1 (política), 2.2.2.25.5.1 y 2.2.2.25.5.2 (transmisión): <https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=76608>. La misma página de Función Pública marca el Decreto 1377 como derogado parcialmente por el Decreto 1081 de 2015: jurídica debe confirmar qué citar.
- Ley 1098 de 2006, art. 33 (intimidad): <https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=22106>.
- Ley 527 de 1999, art. 5 (mensajes de datos): <https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=4276>.
- Ley 23 de 1982, arts. 1, 2, 12 y 30: <https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=3431>.

Sentencia C-748 de 2011: el Decreto 1377 la menciona, y un decreto de 2026 recogido por la JEP resume el condicionamiento del artículo 7 al interés superior del menor (<https://jurinfo.jep.gov.co/Normograma/Compilacion/docs/decreto_0769_2026.htm>). No se pudo leer la sentencia directamente, así que la página pública no la cita.

**Normas que no se citan a propósito.** Ley 1266 de 2008: el sistema no trata información financiera ni crediticia. Ley 1480 de 2011: el sitio no vende bienes ni servicios; la convocatoria no declara costo, así que jurídica debe confirmar si procede.

## Decisiones

- **Dos responsables.** El paso 5 dice «por parte de la Gobernación del Cauca y Uniautónoma» y los términos de referencia hablan del formulario dispuesto por ambas. Por eso la política presenta a las dos como responsables (Ley 1581, art. 3, «por sí misma o en asocio con otros»). Debe confirmarse con el convenio entre las entidades.
- **Finalidades.** Salen de la casilla del paso 5 (organizativos, académicos, de evaluación y certificación) y del proceso de los términos de referencia. Las listas de asistencia e informes vienen de `docs/manual-administracion.md`.
- **Plazos.** Se usan los de la ley. La Resolución 0186 de Uniautónoma da 15 días hábiles a las consultas, lo que excede los 10 legales.
- **Imagen.** Los términos de referencia dicen que la organización podrá pedir autorización independiente. La política dice que postular no autoriza el uso de imagen.
- **Datos sensibles.** La política advierte que la copia del documento puede mostrar datos biométricos, sin afirmar que todos los documentos los contengan.
- **Transmisión internacional.** Dice que los servidores «pueden estar fuera de Colombia», sin nombrar país, porque Supabase no ofrece región en Colombia y la región del proyecto no se conoce. `.env` no se leyó.
- **Compromiso de no vender datos ni usarlos para publicidad.** Coincide con el código y con «exclusivamente conforme a las finalidades informadas» de los términos de referencia. Es un compromiso nuevo: jurídica debe aceptarlo, porque la política general de Uniautónoma incluye campañas comerciales.
- **Aviso de cookies.** Es informativo, sin aceptar o rechazar, porque solo hay almacenamiento propio y necesario. Si se agrega analítica, debe cambiar.
- **Inventario del navegador.** Búsqueda en `app`, `components` y `lib`: solo las cuatro claves propias y la cookie de sesión. El formulario no guarda borradores. No hay iframes, scripts externos ni fuentes remotas.

## Pendientes

Lo marcado en `null` en `lib/legal.ts` se muestra como «La organización publicará este dato».

1. **Teléfono de Uniautónoma** (`null`). La Resolución 0186 da 8214000 ext. 101, y su membrete da PBX 8213000 y fax 8214000, todos en formato anterior al marcado de 2021. El portal actual no publica teléfono.
2. **Plazo de conservación** (`plazoConservacion`, `null`). El código no borra nada y no hay regla definida. Decreto 1074, art. 2.2.2.25.2.8. Hace falta definirlo, incluido el de las copias de documentos y los Excel exportados.
3. **Región de Supabase** (`regionAlmacenamiento`, `null`). Se ve en el panel de Supabase.
4. **Contrato de transmisión con Supabase** (Decreto 1074, art. 2.2.2.25.5.2) y confirmar quién firmó la cuenta. Sin ese contrato, hay que informar la transmisión y obtener consentimiento, y revisar si cae en el art. 26 de la Ley 1581.
5. **Proveedor de hosting.** El repositorio no lo identifica. Si recibe datos del formulario debe figurar como encargado en `/privacidad`.
6. **Canal único.** Confirmar que contactenos@cauca.gov.co y habeasdata@uniautonoma.edu.co atenderán estas solicitudes y quién es la persona o área designada (art. 2.2.2.25.4.4). La Gobernación dirige todo por su sistema de atención al ciudadano; el buzón de Uniautónoma viene de 2018.
7. **Procedimiento para corregir o suprimir.** El panel no tiene esa función; hoy habría que hacerlo a mano en Supabase.
8. **Registro Nacional de Bases de Datos.** Verificar si esta base debe inscribirse (Ley 1581, art. 25).
9. **Enlaces.** `formulario-postulacion.tsx` aún descarga el DOCX directamente, y la política de la Gobernación está en un dominio `intranet`: confirmar que seguirá siendo público.
10. **Datos sin publicar de los términos de referencia**: fechas «Por definir» y «canales oficiales» sin identificar.

## Riesgos legales

Ordenados por gravedad. Requieren decisión, y varios requieren cambios de código que quedaron fuera de este trabajo.

1. **No queda prueba de la autorización.** `crearPostulacionAction` valida las tres casillas, pero no las guarda: el esquema no tiene columnas de aceptación, fecha ni versión del texto. La ley exige conservar prueba (Ley 1581, arts. 9 y 12, parágrafo; Decreto 1074, art. 2.2.2.25.2.5). La política y el art. 8 dan al titular el derecho a pedir esa prueba, que hoy no se podría entregar.
2. **Una persona autoriza por cuatro.** Quien diligencia marca la casilla por los tres estudiantes y el tutor. La autorización debe venir de cada titular, y la de un menor, de su representante. Conviene que el aval o un formato firmado incluya la autorización de cada uno.
3. **Menores de edad.** No hay formato oficial de autorización en el repositorio y el sistema pide un solo archivo por equipo aunque haya varios menores. Debe cubrir tratamiento de datos, constancia de que se escuchó al menor (art. 2.2.2.25.2.9) y, por separado, imagen. Además, una lectura de búsqueda de la Resolución 0186 de Uniautónoma indica que prohíbe tratar datos de menores salvo los públicos; no se localizó esa página en el escaneo revisado. Si es así, esa política no contempla esta convocatoria, y debe revisarse.
4. **Copias de documentos de identidad.** Son obligatorias, aunque la ley dice que nadie está obligado a autorizar datos sensibles y que el dato debe ser necesario. Los términos de referencia piden «documentos de identificación» entre los datos del integrante, sin exigir copia expresamente. Jurídica debe valorar si basta el número, o una alternativa para quien no quiera entregar copia.
5. **Contradicción de fechas y cupos** entre documento oficial y casilla (ver arriba): afecta el consentimiento informado.
6. **Juramento en la casilla de veracidad.** La frase «bajo la gravedad de juramento» y «matrícula activa» no sale de los términos de referencia.
7. **Exportación a Excel.** El libro incluye número de documento, teléfono y condición de menor, y sale del sistema sin control. `docs/manual-administracion.md` lo menciona para «auditoría pública»: esos datos no deben publicarse.
8. **Quién accede.** `docs/arquitectura-sistema.md` restringe los documentos a evaluadores de la Gobernación, y `docs/manual-administracion.md` incluye a Uniautónoma. La política dice «cuenta autorizada por la organización»; hay que definirlo.
9. **Cookie de sesión del panel** legible por JavaScript (`httpOnly: false`, valor por defecto de `@supabase/ssr`) y hasta 400 días. Conviene acortarla para cuentas con acceso a datos de menores.
