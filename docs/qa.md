# QA — rediseño Cauca INNOVA

Revisión independiente de fuentes del 28 de octubre de 2026. Fuente factual vigente: `TERMINOS DE REFERENCIA.docx`, superior al afiche anterior. Las tres composiciones de `.design-v2` se inspeccionaron como referencias de diseño; no son capturas de la aplicación.

## Contenido y archivos comprobados

Se leyó el DOCX original mediante ZIP/XML .NET en modo lectura, incluyendo P20–34, P53–70 y P88–113. La interfaz y `lib/contenido.ts` conservan 13 y 14 de noviembre de 2026, dos jornadas presenciales completas, siete equipos de tres y máximo 21 participantes. Los requisitos incluyen matrícula y semillero avalado del Cauca, aval del tutor y autorización escrita para menores. No se anuncia inscripción abierta ni se inventan formulario, sede, horarios, costo o premios específicos.

La tabla 30/30/20/20 identifica selección de postulaciones habilitadas cuando se supera el cupo; no se presenta como evaluación final. Se conservan la selección no garantizada, eventual lista de espera/desempates, derechos de propiedad intelectual sin transferencia automática, autorización independiente de divulgación y certificado condicionado a asistencia y participación. Las actividades no se adjudican a días u horas concretos. La impresora del laboratorio se identifica como ilustración ajena a premios o retos oficiales.

Los metadatos contienen el Festival, fecha 2026 y equipos correctos. No aparecen 15 de noviembre, cinco grupos, un día ni año pendiente en las fuentes UI actuales. Todos los `href` internos literales tienen un `id` existente; los cuatro destinos del menú también existen. Los archivos de todas las imágenes referenciadas existen. La tipografía local Anton tiene 170812 bytes y licencia OFL; junto a Manrope suma dos familias principales.

La copia `public/documentos/terminos-de-referencia.docx` y el original coinciden por SHA-256: `0C160615BAC7004E169680079CD9839E11F24CDFDFA74001794EE8AB68FE818F`. `documentoTerminos` apunta a esa ruta pública existente y los enlaces tienen atributo `download`. Esto comprueba resolución estática, no descarga HTTP ejecutada.

## Diseño e interacción: alcance estático

La portada usa titular HTML de dos líneas, impresora centrada y capas ambientales, con texto y CTA inferiores. Menú fullscreen de enlaces grandes y footer póster reproducen la estructura de las referencias sin insertar sus imágenes como interfaz. La marca original limpia se presenta sobre papel, sin usar la variante blanca defectuosa. Navbar con grid `1fr auto 1fr` centra geométricamente el logo; la unión del footer usa su borde superior y altura constante de cabecera, con scroll pasivo agrupado por frame.

La intro se monta tras hidratación, tiene duración finita, salida accesible, Escape, límite de seguridad y persistencia de sesión; sin JS la página queda visible. Menú con portal, dialog modal, timeline reversible, Escape, ciclo de foco, restauración de overflow e inert del contenido/cabecera. El laboratorio usa botón nativo, estado aria-live, cabezal, bobina y 14 capas de prototipo. Existen estilos de foco, acordeones nativos, tabla con caption y encabezados, disposición móvil y variantes de movimiento reducido.

Se notificaron y corrigieron en fuente: impresión que continuaba al reducir movimiento, pin que no se retiraba al cambiar a móvil, cabecera fuera del aislamiento modal y recreación de parallax que podía ignorar la preferencia del sistema. La verificación final de las correcciones restantes y gates se registra al cierre.

## Ejecución real y límites

En esta fase QA ejecutó una vez `npm run dev`: falló `spawn EPERM` al crear el proceso de Next. También ejecutó una vez el inspector real `inspect.mjs` para 1440/768/390: falló `spawn EPERM` en `Browser.launch` antes de tomar capturas. No se insistió, no se solicitó escalación ni se usaron lanzamientos alternativos. El Browser plugin no tiene navegador conectado. Estos resultados no invalidan el build completo anterior de la fase TDR, informado como correcto, pero tampoco constituyen validación visual del rediseño.

Con navegador disponible, quedan por ejecutar 1366×768, 1440×900, 768×1024, 390×844 y 360 px: overflow/solapamientos, fecha larga, lectura de tablas/acordeones, logo, contraste renderizado, consola, navegación por teclado, apertura/cierre rápido del menú, intro/skip, impresora/replay, reducción durante impresión, cambio de viewport, unión navbar/footer y descarga HTTP real. No hay capturas de la aplicación ni métricas de rendimiento verificadas.

No existe Engram disponible; este documento conserva la revisión local. Skill resolution: injected.

## Cierre de revisión de fuentes

El implementador informó ejecución final correcta de `npm run lint` (12 archivos), `npm run typecheck` y `npm run build` (Next 16.4.3, tres páginas generadas). QA no duplicó estos comandos para evitar ejecución simultánea.

QA volvió a leer la versión final y confirmó también: nombre accesible del burger en móvil; devolución de foco al salir de la intro; foco en el destino al cerrar el menú incluso con movimiento reducido; bobina que vuelve a girar en replay mediante rotación relativa; entrada de portada disparada tras la intro, una sola vez, separada del parallax. Reducir movimiento no vuelve a ejecutar esa entrada. Los contextos GSAP, media queries, listeners, timeout de seguridad y frame de medición principal cuentan con limpieza.

El gate de estilo estático se ejecutó realmente sobre diez fuentes: **12 FAIL de `hairline` y 2 WARN (`outlined-box`, `em-dash`)**. No es un gate limpio. Se mantienen como excepciones de dirección de arte: reglas finas de los pósteres/menu de referencia, separadores de listas/acordeones, estado hover de navegación, círculo de volver arriba y separadores tipográficos de fecha. Se documenta el resultado íntegro sin minimizar CSS ni retirar rasgos del diseño pedido para ocultar hallazgos. No se observaron fallos funcionales asociados a estos patrones en revisión estática.

El ajuste final del footer desktop usa `100svh` con mínimo de 720 px, titular limitado a `22svh` y arte desde el 50 % con ancho máximo `35svh`. La revisión de las fórmulas contempla 1366 × 768 y 1440 × 900 sin exigir altura adicional; móvil conserva flujo que puede crecer. El implementador volvió a ejecutar lint correctamente tras este ajuste CSS. La ausencia de solapamientos y coincidencia visual con las referencias quedan pendientes de revisión renderizada.

