# Dirección de diseño v4: Cauca INNOVA

Actualizado el 6 de noviembre de 2026. La v2 (póster Anton) y la v3 (papelería y luego "familia Educación Continua") quedan superadas. `docs/art-direction-v2.md` se conserva solo como registro.

## Qué pidió el cliente

Web institucional que no sea aburrida, ordenada, muy animada, en PC y móvil. El prototipo es el diferenciador frente a Educación Continua. Ronda 3 (6 de noviembre):

- Navbar elegante y minimalista que cambia de color por sección y se une al footer de pantalla completa.
- Logos en SVG. Animación: primero Uniautónoma con el lema «Somos el motor de la innovación» durante 8 s; luego, rápido, Cauca INNOVA con la Gobernación durante 4 s.
- Usar el mapa del Cauca a favor. Rehacer la sección de territorio.
- Más videos, más parallax y más GSAP; videos en alta resolución pero livianos.
- Banner nuevo, sin el bloque de fecha.
- Pasos y menú burger menos aburridos.
- Créditos de fotos al pasar el mouse, no en el footer.
- Footer: "Creado por la Fábrica de Software" y "Powered by Emprendelab y Uniautónoma del Cauca".
- Botón para subir. Login nuevo con icono de ojo.
- Términos legibles en la web y paquete legal completo.
- El loading gustó: no se tocó.

## Idea central

**El mapa pixelado del logo es la ventana del proyecto.** Aparece como recorte del video en el banner, tablero interactivo en la sección del territorio, marco de fotos en el menú y escena del login.

## Secciones

- **Banner** (`components/landing/portada.tsx`, `animarBanner` en `movimiento.tsx`): cuatro clips sincronizados con "se dibujan / se imprimen / se prueban / se presentan". Al bajar, el mapa crece hasta ser pantalla completa.
- **Cifras:** contadores de cupos.
- **Jornada:** tiquetes arrastrables con Embla.
- **Mapa:** escena fija de 520svh por Popayán, Puracé, Tierradentro y Guapi; las posiciones son aproximadas sobre la silueta pixelada.
- **Proceso:** impresora 3D con Three (`lib/escena-impresora.ts`). La palabra va al lado y nunca detrás: en escritorio el lienzo ocupa el 58 % derecho; en móvil va entre la palabra y el texto.
- **Requisitos:** el requisito en curso se lee grande; al cumplirse baja a ser una tira de la pila, sincronizada con la pieza.
- **Recorrido:** pista horizontal en escritorio, con un filamento que se imprime; en móvil, secuencia vertical. Los pesos de selección son columnas de capas (una por cada 2,5 %), con tabla para lectores de pantalla.
- **Preguntas** y **pie** a pantalla completa, con video y revelado por detrás del contenido.

## Navbar

`data-tema` en cada sección y una banda de 2 px con IntersectionObserver en `cabecera-sitio.tsx`. `data-barra="abierta"` quita el velo sobre banner y pie. Se queda fija: el cliente pidió no perderla al bajar y Postular debe estar siempre a la mano.

## Movimiento

Sigue [Animación y Movimiento]. Las escenas dependen de `html[data-escenas="si"]`, que un script fija antes de pintar. Sin JavaScript o con movimiento reducido, el contenido queda apilado y estático.

Decisión justificada: el recorte del banner anima `clip-path` por fotograma, fuera de la regla de solo `transform` y `opacity`. Es un único elemento, limitado a esa escena, y no hay otra forma de que el mapa crezca sin escalar el video.

Transiciones:

- Entre secciones: `animarEntradas` crea una banda de capas con el color de la sección anterior, que se retira con el scroll. Se omite si ambas tienen el mismo fondo.
- Enlaces internos: `crearTelon` cubre, salta y descubre, en lugar de recorrer media página.
- Entre páginas: View Transitions con `@view-transition`, porque los enlaces `<a>` recargan el documento.

## Postular rápido

- Escritorio: botón sólido fijo en la barra.
- Móvil: `components/sitio/acceso-postular.tsx`, barra inferior bajo el pulgar que aparece pasado el banner y se aparta en el pie.
- El formulario abre con el paso 1 a la vista y cada botón nombra el paso siguiente.

La evidencia consultada fue de blogs y glosarios, sin estudios primarios: es una decisión de buena práctica, por validar con datos reales si se instala analítica.

## Formulario

Fondo azul, campos blancos y lima solo como acento. `components/formulario/taller-progreso.tsx` imprime la pieza con cada dato, no con cada paso (`calcularAvance`). En móvil pasa a una barra pegada bajo la cabecera. Al radicar cae confeti de píxeles, solo CSS.

## Medios

`lib/medios.ts` es el catálogo único; receta en `docs/medios.md`.

## Dónde cambiar lo habitual

- Textos y datos: `lib/contenido.ts`.
- Medios y créditos: `lib/medios.ts`.
- Lugares del mapa (nombre, foto, columna, fila): `territorios` en `lib/contenido.ts`.
- Colores y escala: `@theme` en `app/globals.css`.

## Panel en desarrollo

`/admin/demo` muestra el panel con datos de muestra. Solo existe con `next dev`.

## Pendientes del cliente

1. Supabase restringido por `exceed_storage_size_quota`: no se puede radicar hasta resolverlo.
2. El DOCX dice 13 y 14 de noviembre, 7 equipos, 21 cupos y Festival; la web, 15 de noviembre, 6 equipos, 18 cupos y Bootcamp. La página de términos muestra el DOCX tal cual.
3. Vercel limita cada función a unos 4,5 MB; el formulario admite hasta 50 MB.
4. Revisión jurídica de los textos legales (ver `docs/legal.md`).
5. Licencia de Museo Sans Rounded para este sitio.
6. Aprobación de las versiones monocromas de logos oficiales.
7. La contraseña inicial del admin está en `supabase/crear_admin.sql`, versionado: cambiarla.
8. Sede, horarios y fecha de cierre.
9. Fotos reales de la jornada para reemplazar las de archivo.
10. Estándares no cubiertos por el código previo: cabeceras de seguridad, React Hook Form, next-safe-action, Drizzle, `.nvmrc`.

## Fallos con causa raíz

- **Tema del navbar fijo en oscuro:** el pie `sticky` siempre corta la banda; ahora solo cuenta si no hay otra sección.
- **Mapa corrido en móvil:** GSAP anula la propiedad `translate`; el centrado pasó a `xPercent` y `yPercent`.
- **Logo invisible al inicio:** el `fromTo` de un ciclo aplica su estado inicial de inmediato; se usa `immediateRender: false`.
- **Región encendida adelantada:** se calculaba aparte; ahora usa el tiempo de la línea.
- **Límite de 1 MB en Server Actions:** corregido a 55 MB.
- **Errores técnicos en pantalla:** las acciones devolvían `error.message`; ahora el detalle va al log.
- **Video inapropiado:** un timelapse terminaba en una figura de soldado con placa. Mirar cada clip completo.
