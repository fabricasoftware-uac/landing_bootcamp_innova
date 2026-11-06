# Medios

## Agregar un video

1. Elegir el clip y mirarlo completo.
2. Comprimir en dos tamaños y sacar el póster, sin audio:

```sh
ffmpeg -ss 1 -t 8 -i origen.mp4 -vf "scale=1600:-2,fps=30" -an -c:v libx264 -crf 30 -preset slow -pix_fmt yuv420p -movflags +faststart public/video/NOMBRE.mp4
ffmpeg -ss 1 -t 8 -i origen.mp4 -vf "scale=854:-2,fps=30" -an -c:v libx264 -crf 31 -preset slow -pix_fmt yuv420p -movflags +faststart public/video/NOMBRE-movil.mp4
ffmpeg -ss 2 -i origen.mp4 -frames:v 1 -vf "scale=1600:-2" poster.jpg
```

3. Convertir el póster a `public/video/NOMBRE.webp` con calidad cercana a 68.
4. Registrar título, autor, licencia y enlace en `lib/medios.ts`.

Objetivo: menos de 1,5 MB en escritorio y 500 KB en móvil. `VideoPerezoso` pide el archivo solo al acercarse y lo pausa fuera de pantalla.

## Agregar una foto

Formato WebP, 1600 px de ancho, calidad 70. Registrar el crédito en `lib/medios.ts` y mostrarlo con `ConCredito`.

## Fuentes

Videos y fotos de taller: Pexels, enlaces en `lib/medios.ts`. La clave de la API de Pexels nunca se guarda en el repositorio. Territorio: Wikimedia Commons, detalle en `docs/creditos-imagenes.json`. Las personas de Pexels son ilustrativas y no pertenecen al Bootcamp.

## Logos

Uniautónoma se volvió a trazar desde `solar-flex-main/public/img/ally-autonoma.png` (1041 px), que tiene letras más gruesas que el PNG de Educación Continua, y se separó en grifo y letras para animarlas (`uniautonoma-grifo.svg`, `uniautonoma-letras.svg`). `uniautonoma.svg` recompone ambas en horizontal. Trazados con potrace desde los PNG oficiales. `public/logos/*.svg` se usan como máscara y toman el color de la sección; Cauca INNOVA va en línea, partido en tres piezas (`lib/logo-cauca.ts`).
