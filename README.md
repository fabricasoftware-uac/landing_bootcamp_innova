<<<<<<< HEAD
﻿# Cauca INNOVA · Festival de Semilleros de Investigación

Landing en Next.js 16 App Router, React 19, TypeScript estricto, Tailwind CSS 4 y GSAP. Incluye portada tipo póster, intro omisible, navbar centrado conectado al footer, menú a pantalla completa, parallax por capas, recorrido fijado al scroll e impresora interactiva. Conserva requisitos, selección, FAQ y descarga de términos.

## Desarrollo

Node.js 22 o posterior. Gestor preferido: pnpm.

```sh
pnpm install
pnpm dev
pnpm lint
pnpm typecheck
pnpm build
```

En este entorno la instalación pnpm no pudo acceder al registry; se instaló con npm y se conserva `package-lock.json` reproducible. Alternativa: `npm ci`, `npm run dev`, `npm run lint`, `npm run typecheck`, `npm run build`. No se incluye un pnpm-lock ficticio.

## Contenido y publicación

La fuente vigente es `TERMINOS DE REFERENCIA.docx`: Festival el **13 y 14 de noviembre de 2026**, dos jornadas completas presenciales, máximo **21 participantes en siete equipos de tres**. Esta actualización reemplaza la fecha y cupos del afiche inicial. La extracción completa y diferencias están en docs/terms-source.md.

Sede, horarios, costo o gratuidad, URL oficial y plazos no están especificados. No se reciben datos ni se simulan inscripciones. Se permite preparar la postulación y descargar una copia fiel en public/documentos/terminos-de-referencia.docx. Los criterios publicados seleccionan equipos, no evalúan soluciones finales. Las imágenes no prometen equipos ni premios específicos. Consultar docs/design.md y docs/qa.md.

La impresora y el prototipo modular son ilustraciones. El logo es una restauración generada a partir de la referencia, con fondo transparente; ya no se recorta el afiche. El laboratorio usa una impresora SVG con cabezal, bobina y capas animables. La tipografía Anton se aloja localmente con su licencia OFL en `public/fonts/anton`. No se usaron fotografías de asistentes o testimonios inventados.

## Verificación en el entorno

TypeScript y Biome pasan. La compilación completa de producción finalizó correctamente en esta actualización. El servidor de desarrollo había sido bloqueado por el sandbox (`spawn EPERM`); la revisión real de navegador sigue pendiente.
=======
# landing_bootcamp_innova
>>>>>>> ad205c36f57896461244c584fe1d3d9ba91982ac
