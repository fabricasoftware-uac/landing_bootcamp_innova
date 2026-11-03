/**
 * Utilidades para sanitización de nombres de archivo, extracción de extensiones,
 * parsing de valores booleanos y validación de radicados oficiales.
 */

export const FORMATO_RADICADO_REGEX = /^INNOVA-2026-\d{4,}$/;

/**
 * Convierte un valor de entrada arbitrario (booleano, string, etc.) en un booleano estricto.
 * Reconoce "true", "1", "on", "yes", "si", "sí" (insensible a mayúsculas y espacios).
 */
export function parseBooleanValue(val: unknown): boolean {
  if (typeof val === "boolean") return val;
  if (typeof val === "string") {
    const lower = val.trim().toLowerCase();
    return (
      lower === "true" ||
      lower === "1" ||
      lower === "on" ||
      lower === "yes" ||
      lower === "si" ||
      lower === "sí"
    );
  }
  return false;
}

/**
 * Sanitiza el nombre de un archivo removiendo tildes, caracteres diacríticos
 * y sustituyendo caracteres no permitidos por guiones bajos. Convierte a minúsculas.
 */
export function sanitizeFileName(fileName: string): string {
  return fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .toLowerCase();
}

/**
 * Obtiene la extensión limpia y permitida de un archivo a partir de su nombre o MIME type.
 * Devuelve "bin" si no coincide con formatos autorizados (pdf, jpg, jpeg, png).
 */
export function getFileExtension(file: {
  name?: string;
  type?: string;
}): string {
  const name = file.name || "";
  const parts = name.split(".");
  if (parts.length > 1) {
    const ext = parts
      .pop()
      ?.toLowerCase()
      .replace(/[^a-z0-9]/g, "");
    if (ext && ["pdf", "jpg", "jpeg", "png"].includes(ext)) {
      return ext;
    }
  }
  if (file.type === "application/pdf") return "pdf";
  if (file.type === "image/png") return "png";
  if (file.type === "image/jpeg") return "jpg";
  return "bin";
}

/**
 * Formatea un número secuencial correlativo en el código de radicado oficial:
 * INNOVA-2026-XXXX (rellenado con ceros a la izquierda a mínimo 4 dígitos).
 */
export function formatearRadicado(secuencia: number): string {
  if (!Number.isInteger(secuencia) || secuencia <= 0) {
    throw new Error(
      "La secuencia correlativa debe ser un entero positivo mayor a cero.",
    );
  }
  return `INNOVA-2026-${String(secuencia).padStart(4, "0")}`;
}

/**
 * Valida si una cadena cumple estrictamente con el formato oficial de radicado INNOVA-2026-XXXX.
 */
export function esRadicadoValido(radicado: string): boolean {
  if (typeof radicado !== "string") return false;
  return FORMATO_RADICADO_REGEX.test(radicado.trim());
}
