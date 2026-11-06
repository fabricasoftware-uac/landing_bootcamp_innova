/**
 * Normalización y listas blancas de texto compartidas por cliente y servidor.
 * No escapa nada: React ya escapa al pintar. Aquí se decide qué entra a la base.
 */

// Cc: controles C0/C1. Cf: bidi, ancho cero y BOM, que permiten disfrazar el texto.
const INVISIBLES = /[\p{Cc}\p{Cf}]/gu;
const INVISIBLES_SALVO_SALTOS = /(?![\n\t])[\p{Cc}\p{Cf}]/gu;

const INICIO_DE_ETIQUETA = /<[a-zA-Z!/?]/;
const ENTIDAD_HTML = /&(?:#\d+|#x[\da-f]+|[a-z][a-z\d]*);/i;

const NOMBRE_DE_PERSONA = /^\p{L}[\p{L}\p{M} .'’´-]*$/u;
const NOMBRE_DE_ENTIDAD =
  /^[\p{L}\p{N}"“«(¿¡][\p{L}\p{M}\p{N} .,;:'’"“”«»()&/#ºª°+@_!¡?¿%–—-]*$/u;
const NUMERO_DE_DOCUMENTO = /^[\p{L}\d][\p{L}\d .-]*$/u;
const FORMA_DE_TELEFONO = /^\+?[\d(][\d\s().-]*(?:(?:ext\.?|x)\s*\d{1,6})?$/i;

const MAX_LONGITUD_TELEFONO = 25;
const MIN_DIGITOS_TELEFONO = 7;

/** Para campos de una línea: colapsa espacios y quita caracteres invisibles. */
export function limpiarLinea(valor: string): string {
  return valor
    .normalize("NFC")
    .replace(/\s+/g, " ")
    .replace(INVISIBLES, "")
    .trim();
}

/** Para textos largos: conserva saltos de línea y tabuladores. */
export function limpiarParrafo(valor: string): string {
  return valor
    .normalize("NFC")
    .replace(/\r\n?/g, "\n")
    .replace(INVISIBLES_SALVO_SALTOS, "")
    .trim();
}

export function contieneMarcado(valor: string): boolean {
  return INICIO_DE_ETIQUETA.test(valor) || ENTIDAD_HTML.test(valor);
}

export function esNombreDePersona(valor: string): boolean {
  return NOMBRE_DE_PERSONA.test(valor);
}

export function esNombreDeEntidad(valor: string): boolean {
  return NOMBRE_DE_ENTIDAD.test(valor) && !contieneMarcado(valor);
}

export function esNumeroDeDocumento(valor: string): boolean {
  return NUMERO_DE_DOCUMENTO.test(valor);
}

/** Comprueba la longitud antes del patrón para acotar el coste del retroceso. */
export function esTelefono(valor: string): boolean {
  return (
    valor.length <= MAX_LONGITUD_TELEFONO &&
    FORMA_DE_TELEFONO.test(valor) &&
    valor.replace(/\D/g, "").length >= MIN_DIGITOS_TELEFONO
  );
}
