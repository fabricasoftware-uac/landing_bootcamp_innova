# ADR 0001: Three.js para la impresora de la sección Proceso

Fecha: 6 de noviembre de 2026. Estado: propuesta aceptada por pedido del cliente, pendiente de su aprobación formal.

## Contexto

El cliente pidió que el prototipo sea protagonista y "jugar" con la impresora. Una imagen no permite mover el cabezal, imprimir capa por capa ni girar el objeto. Three.js no está en el Stack Tecnológico Estándar, aunque hay precedente en el sitio de FabSoft.

## Decisión

Usar `three` sin React Three Fiber, en `lib/escena-impresora.ts`. Se importa de forma dinámica al acercarse a la sección.

## Consecuencias

- La portada no paga el peso de la librería.
- Con movimiento reducido o sin WebGL se muestra `impresora.webp`.
- Fuera de pantalla no se renderiza.
- Si se retira la sección, la dependencia se elimina con ella.
