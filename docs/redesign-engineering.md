# Rediseño: taller vivo del Cauca

Auditoría del 28 de octubre de 2026. Esta fase modifica únicamente este documento. No se modificaron los proyectos de referencia ni la aplicación. Las composiciones generadas por dirección de arte deben verse antes de implementar.

## Evidencia observada

La aplicación actual concentra todo en `components/landing.tsx`: portada de texto a la izquierda y bitmap a la derecha, menú pequeño controlado con un booleano, apariciones de capítulos y un SVG de cubo con tres temas. El logo proviene de `referencia.jpg` dentro de `.logo-original`; el recorte de afiche no constituye un activo de marca limpio. `app/globals.css` conserva la estructura split. `lib/motion.ts` ya centraliza GSAP/ScrollTrigger/useGSAP. `lib/contenido.ts` es la fuente factual que debe conservarse.

La documentación anterior (`docs/design.md` y `.project-context.md`) explica una dirección que ya no satisface al usuario. Su sección histórica del afiche no debe alimentar el nuevo copy: manda `docs/terms-source.md` y la actualización de `lib/contenido.ts`.

### Educación Continua: referencia principal

Raíz: `D:/FabSoft/Educacion Continua/apps/web/src/`.

- `shared/ui/site-shell.tsx:34–55`: une visualmente header/footer cuando el borde superior del footer alcanza la altura del header. Usa un evento pasivo agrupado por requestAnimationFrame, mide `offsetHeight` para no oscilar con el estado compacto y limpia eventos. Esta es la continuidad que pide el usuario; no basta pintar ambos del mismo color.
- `shared/ui/site-shell.tsx:61–92`: bloquea scroll, coloca foco, Escape y ciclo Tab. Debemos añadir aislamiento real del fondo e incluir el cierre dentro del modal, evitando que un botón de cierre exterior quede fuera del foco atrapado.
- `shared/ui/site-shell.tsx:100–156`: menú fullscreen desciende desde -100%; enlaces suben desde 105% con stagger 0,045 s y bloques secundarios se solapan. Para BootCamp conviene una timeline reversible persistente: abrir/cerrar muy rápido no debe reiniciar poses ni dejar una capa invisible capturando clics.
- `shared/ui/site-shell.tsx:183–211`: footer tipo poster, titular/foto/contacto y parallax de foto de +18 a -18 px. No oculta links con visibility porque los retiraría del árbol accesible.
- `modules/catalogo/ui/home.tsx`: titular con líneas alternantes; contenido revelado por elementos; reel de figuras recortadas con órbitas pausadas fuera de pantalla; parallax con ScrollTrigger; ResizeObserver y fuentes disparan refresh. Es útil su profundidad y composición, no su carrusel de catálogo.
- `shared/ui/route-loading.tsx`: indicador de ruta corto; no es una intro de marca. No atribuir al proyecto una intro que ese archivo no implementa.

Se inspeccionaron visualmente dos imágenes locales reales: `D:/FabSoft/Fabrica/apps/web/public/proyectos/educacion-continua-1.jpg` y `educacion-continua-2.jpg`. La primera muestra nav a sangre azul, logo geométricamente centrado, links a izquierda y burger a derecha; hero de video/foto con titular blanco/amarillo de gran escala. La segunda muestra su estado compacto y tickets educativos. Son capturas guardadas en el portafolio de Fábrica; no se afirma que representen una ejecución actual. No se encontraron capturas de footer/menú por los patrones locales consultados.

### Otras referencias: mecanismos, no identidades

- Fábrica: `apps/web/src/modules/sitio/ui/components/portada.tsx:189–265` combina entrada por letras (stagger 0,022), profundidad de scroll y quickTo de puntero. Los listeners se retiran. `pantalla-carga.tsx` dibuja/rellena el logo, coordina recursos y vuela hacia el logo del navbar; su secuencia espacial extensa no conviene copiar. Sí conviene que la intro desemboque físicamente en el centro del header. No adoptar espacio, HUD, falsa telemetría ni flashes.
- ChontaMix: `src/components/intro/Intro.tsx` abre dos puertas complementarias con solapamiento de 1 px, timeline y temporizador de seguridad de 7 s. Aprovechar la apertura material y su failsafe; no copiar porcentaje decorativo ni espera de varios segundos. El límite previsto aquí es 2,2 s, con salida accesible inmediata.
- Genix: `apps/web/src/modules/sitio/ui/selector/animaciones-selector.ts` ofrece `crearParallax` con amplitud por capa y quickTo reutilizados; intro de paneles contrapuestos; poses con overwrite; versión estática explícita. Adoptar amplitudes proporcionadas y separación entre la capa del puntero y la del scroll. No copiar selector diagonal, personajes, marcas o idle infinito.
- Pixeles: `apps/web/src/shared/ui/movimiento/use-coreografia.ts` carga coreografía cerca del viewport con IntersectionObserver y cancela la resolución asíncrona al desmontar; reduced-motion conserva el estado final SSR. Aprovechar carga/ejecución por visibilidad; no hace falta importar todo un motor pixel para tres escenas.

## Propuesta concreta: tres escenas

### 1. El Cauca se inventa

Portada poster a sangre, mínimo `100svh`, papel cálido, tipografía condensada expresiva navy. H1 real en dos líneas: «EL CAUCA / SE INVENTA.». Mantener una zona limpia sobre la máquina para que jamás tape el mensaje. La impresora ocupa el centro inferior frente a parte del titular, con base y sombra elíptica discreta, no columna separada. Nombre completo del Festival y fecha 13–14 de noviembre de 2026 son visibles en la primera pantalla. Descripción corta y CTA a preparación quedan en un borde inferior claramente legible, fuera del dibujo.

Navbar fijo a sangre, sin píldora: grid `1fr auto 1fr`; logo limpio en columna central de ancho estable; dos links balanceados a izquierda; una acción textual y burger a derecha. Logo a 50% geométrico incluso si los enlaces laterales tienen distinto largo. En móvil: centro estable, marca secundaria a izquierda y burger a derecha, sin apilar enlaces.

Escena de impresora original SVG de calidad, con volumen isométrico: bastidor trasero, riel, cabezal separado, cama, bobina con radios, pieza de 12–16 capas y bastidor delantero. Un botón real «Imprime una idea» inicia un ciclo de 2,4 s: cabezal recorre riel con retornos; capas de pieza aparecen de abajo arriba; bobina gira proporcionalmente; cama baja unos píxeles; final con encaje corto. Estado visible «Idea lista» y acción «Otra vez». Sin simulación de progreso de red. El SVG incluye título/descripcion; detalles decorativos aria-hidden. El modelo está completo si JS no corre.

Profundidad: wrapper externo de scroll desplaza impresora -50 px, titular -90 px y marcas de plano +35 px a lo largo del hero; wrapper interno exclusivo de puntero mueve máquina máximo ±12/±8 px y piezas ambientales ±22 px. Solo `(hover:hover) and (pointer:fine)`. No dos tweens escribiendo transform del mismo nodo. No idle infinito necesario.

### 2. De una pregunta a algo que funciona

Una sección teal profundo con escena desktop fijada durante aproximadamente 110vh de scroll adicional, no 400vh. Tres estados narrativos «Pregunta / Construye / Comparte» alineados con formación, ideación, mentoría y prototipado ya confirmados. Un trazo de pregunta se ensambla en pieza, la pieza recibe capas y sale de la cama; los verbos cambian por desplazamientos verticales y la composición pasa de plano a volumen. Una timeline ScrollTrigger con labels, scrub 0,7 y pin solo `min-width:960px` + altura suficiente. Las tres explicaciones existen como contenido semántico; las letras visuales duplicadas son decorativas.

Debajo se abre la cifra 7 como gran composición editorial: «equipos de tres / máximo 21 participantes». El scroll libera la escena y entra en requisitos, documentación y selección. Esas condiciones deben seguir siendo contenido claro con acordeones, tabla y enlaces, sin ocultarlas detrás de la interacción ni convertirlas en cartas de juego. Móvil muestra tres pasos verticales sin pin ni espacio vacío. Reduced-motion muestra el prototipo terminado y todos los textos.

### 3. La siguiente idea empieza contigo

Cierre poster de al menos `100svh`, teal profundo/lima, titular grande y una pieza transformada de la impresora como motivo central. El footer recoge el marco de la primera pantalla: mismas posiciones de fecha, logo, acción y bordes. Cuando llega al header, el header cambia a la misma superficie y desaparece su división. La marca continúa centrada; no se duplica otro logo justo debajo. CTA principal «Prepara tu equipo» apunta a requisitos y «Volver al inicio» cierra el bucle. Organizaciones y descarga de términos quedan en una franja inferior accesible. No pie clásico de tres columnas.

## Intro y menú

Intro de marca breve, no porcentaje de carga ficticio. Dos paneles de color despliegan el logo limpio; a los 0,8 s empieza su vuelo al centro del header; paneles salen a los 1,4 s; máximo 2,2 s. «Saltar intro» siempre visible con foco; timeout de seguridad independiente; una vez por sesión si storage funciona; reduced-motion omite. Base SSR visible y overlay no debe existir/bloquear si la hidratación falla. Si las fuentes o el logo fallan, cerrar igual y dejar alt/texto de marca. Restaurar overflow anterior, timers y eventos al salir/desmontar.

Menú dialog fullscreen con fondo navy, dos bandas teal/lima de barrido y enlaces de escala 56–100 px. Cuatro enlaces reales a experiencia, participación, recorrido y preguntas. Separar cada línea en contenedor recortado y spans por letra decorativos para stagger; enlace conserva su nombre accesible completo. Timeline 0,55–0,7 s, entrada de enlaces solapada desde 0,2 s. Una timeline reversible, sin nuevas instancias por clic. Modal en portal fuera del fondo inert; cierre dentro; focus trap, Escape, restore al burger, bloqueo scroll conservando posición, alturas `100dvh`, overflow-y y safe-area. Cerrar por enlace y navegar al ancla correcta al terminar; no perder el hash.

## Arquitectura prevista y ownership

Conservar `lib/contenido.ts` bajo ownership del agente de términos; no reescribir sus requisitos/FAQ. `components/landing.tsx` puede pasar a composición con secciones semánticas. Islas cliente específicas: `components/marco-sitio.tsx` (nav/menu/intro/footer state), `components/impresora-interactiva.tsx`, `components/recorrido-creativo.tsx`, `components/entrada-marca.tsx`. Estilos modulares con clases explícitas en `app/globals.css`; tokens al inicio. `lib/motion.ts` sigue como registro único, no añadir dependencias por animaciones triviales.

Dirección de arte suministra el logo transparente fiel y composiciones. Integración mediante img con tamaño y object-fit contain; prohibidos crop del afiche, borde negro o filtros que cambien colores de marca. Los SVG técnicos originales necesitan revisarse contra la composición aprobada; el bitmap puede dar textura/entorno, pero la máquina interactiva requiere partes animables reales.

## Rendimiento, accesibilidad y verificación

- Máximo tres escenas principales; animar transform/opacity y trazos SVG cortos. Sin blur animado fullscreen, canvas continuo ni WebGL innecesario. will-change solo durante interacciones.
- useGSAP scope y cleanup; gsap.matchMedia separa desktop/móvil/reduced; contextSafe para eventos. quickTo reutilizado y eventos de puntero locales; cancelar listeners/observers/timers. Pausar o matar animaciones al quedar fuera de pantalla.
- Crear ScrollTriggers en orden DOM; refresh tras fuentes y assets con guard de montaje. No refresh en cada movimiento ni ResizeObserver que cambie su propia medida. `scroll-margin-top` según header.
- Tipografía local, máximo dos familias; cuerpo mínimo 16 px legible y contraste AA. Preferir texto navy/paper o paper/dark teal; no lima clara como texto pequeño sobre papel. Nada factual debe depender de color/animación.
- Menú con Tab/Shift-Tab, Escape y secuencia abrir-cerrar-abrir; intro skip y timeout; impresora por teclado/replay; hash links y foco visible; contenido sin JS; reduced-motion y móvil a 360/390 px sin overflow horizontal. Revisar alturas pequeñas de portátil.
- Verificación posterior: TypeScript, Biome y build; revisión visual real en navegador si hay herramienta disponible. No afirmar capturas ni pruebas de browser hasta ejecutarlas. En esta auditoría se inspeccionaron las dos capturas locales citadas; no se ejecutó navegador.

## Hechos que no pueden moverse con el diseño

13 y 14 de noviembre de 2026; dos jornadas presenciales completas; siete equipos de tres, máximo 21; estudiantes de semilleros del Cauca. Formulario, plazos, sede, horarios y premios específicos no publicados. Pesos 30/30/20/20 solo para selección de postulaciones habilitadas cuando se supera el cupo. Máquina/prototipo son arte conceptual, nunca premio confirmado. Preservar descarga y contenido de términos, menores, PI, imagen, datos y certificado condicionado.

## Estado

Propuesta lista para revisión del coordinador. Implementación pendiente de autorización de fase y de ver las composiciones de dirección de arte. No hay herramientas engram disponibles en el contexto delegado; este documento conserva los hallazgos. Skill resolution: injected.

## Decisión final tras revisar los tres comps

Se implementó la escena hero navy/lima del comp (en lugar del fondo paper de la propuesta preliminar). La impresora raster original es el protagonista para conservar el volumen material; el SVG articulado se usa como experiencia adicional del laboratorio, no como sustitución barata. Hero, menú y footer conservan la geometría de `.design-v2`. Anton oficial local se agregó con licencia, suministrado por el coordinador. La profundidad de puntero y scroll se separa por wrappers; el prototipo transparente se integra en recorrido, menú y cierre. Los detalles finales y la accesibilidad están en `docs/design.md`. TypeScript/Biome verificados; revisión visual de ejecución limitada por herramientas del entorno.
