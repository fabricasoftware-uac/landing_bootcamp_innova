# Dirección de diseño v2 — Cauca INNOVA

La nueva experiencia sigue las tres composiciones generadas e inspeccionadas en `.design-v2`: hero, menú y footer. La auditoría técnica y las referencias observadas están en `docs/redesign-engineering.md`; mediciones y decisiones de arte en `docs/art-direction-v2.md`.

## Composición implementada

Hero poster navy/lima de viewport completo: «EL CAUCA / SE INVENTA.», impresora transparente protagonista centrada, objetos SVG laterales en varias profundidades, fecha y mensaje del festival legibles en las esquinas. No usa columnas de texto/imagen. La impresora raster preserva el volumen del arte original; un segundo modelo SVG articulado permite imprimir una idea en el laboratorio con botón y repetición.

Navbar a sangre de tres columnas `1fr auto 1fr`: logo geométricamente centrado independientemente del ancho de links laterales; burger siempre disponible. La marca fiel transparente se coloca sobre una pequeña superficie paper para conservar su lettering oscuro y evitar el borde negro del recorte anterior. La variante blanca generada se descartó por ruido. El header es navy sobre hero, paper en el recorrido y vuelve al navy cuando el borde del footer alcanza su altura, formando una única superficie.

Menú modal fullscreen paper con cuatro enlaces condensados gigantes, offsets alternados, números, trazos separadores y prototipo lateral. El cierre es reversible, los caracteres entran escalonados y las acciones navegan a anclas reales. Foco atrapado/restaurado, Escape, inert del contenido y header, bloqueo de scroll con un único propietario.

Footer poster de viewport completo, «NOS VEMOS / CREANDO.», prototipo modular central, fecha y términos a los lados y retorno al inicio centrado. Repite el marco espacial del hero y el estado de la navegación. No pie clásico de tres columnas.

## Movimiento

Intro explícita de bienvenida de unos 1,9 s, paneles y marca que viaja al centro del header, botón Saltar y Escape; failsafe de 2,8 s. Sin porcentajes ficticios. Se monta solo después de hidratar, así que contenido y navegación SSR no quedan bloqueados si JS falla. Una vez por sesión cuando storage está disponible; reduced-motion la omite.

Hero con profundidad separada de scroll y puntero: titular, impresora y geometrías tienen velocidades propias, con wrappers independientes. Puntero fino local, quickTo reutilizado y limpieza. Escena «Pregunta / Construye / Comparte» con pin desktop corto (145% adicional) y scrub; móvil y alturas pequeñas muestran los tres pasos verticalmente. El estado inicial SSR deja los textos visibles. Footer usa parallax de objeto y título. La impresora del laboratorio anima bobina, cabezal y 14 capas con un ciclo finito explícito. No hay bucles decorativos permanentes.

El control global «Reducir movimiento» revierte el parallax, el pin y las animaciones de footer, neutraliza el puntero y termina estáticamente una impresión en curso. También se respeta la preferencia del sistema. GSAP/ScrollTrigger/useGSAP están registrados una vez en `lib/motion.ts`; contextos, matchMedia, timelines y eventos tienen limpieza.

## Tipografía y activos

Dos familias locales: Anton para los posters y Manrope Variable para lectura/interfaz. Anton proviene del repositorio oficial [Google Fonts](https://github.com/google/fonts/tree/main/ofl/anton); fuente y licencia SIL OFL se conservan en `public/fonts/anton/`. No se redistribuyen fuentes del sistema.

Paleta propia navy #10384f, teal profundo #006b5c, lima #d1ef3d y paper #f5f4ec. Superficies planas. Los separadores de menú, acordeones, tablas y rail de navegación son líneas editoriales intencionales tomadas de las composiciones; los círculos de flecha/retorno son controles del marco del poster.

`hero-maker.png`: impresora existente de 1280, transparente. `redesign/idea-prototype.png`: cubo modular explotado generado, transparente. `redesign/cauca-innova-logo.png`: restauración fiel del logo suministrado. SVG de geometrías y modelo de impresión dibujados en código. Las composiciones de referencia no se usan como imágenes de fondo ni sustituyen texto o acciones HTML.

## Fuente y límites

`lib/contenido.ts` y `docs/terms-source.md` conservan los términos completos: 13 y 14 de noviembre de 2026; siete equipos de tres; máximo 21; dos jornadas presenciales; semilleros del Cauca. No se inventa inscripción, contacto, sede, horario, costo ni premio específico. Selección 30/30/20/20 es admisión de postulaciones habilitadas si se excede cupo. Ilustraciones y laboratorio son conceptuales, no premios o retos oficiales.

Se preservan requisitos, documentos, pasos, tabla, descarga DOCX y FAQ sobre menores, propiedad intelectual, imagen, datos, certificación y premiación. Se indica claramente lo pendiente de publicación.

## Verificación

TypeScript y Biome pasaron durante la implementación. El coordinador y QA ejecutan la validación final. No se afirma revisión visual de la web ejecutada: los intentos de navegador están restringidos por el entorno. Las tres composiciones y los assets sí se inspeccionaron como imágenes locales antes de implementar.
