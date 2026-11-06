import { PDFArray, PDFDict, PDFDocument, PDFName, PDFStream } from "pdf-lib";
import type { AllowedFileMimeType } from "./postulacion";

export interface TipoDetectado {
  mime: AllowedFileMimeType;
  extension: "pdf" | "jpg" | "png";
}

export type RevisionArchivo =
  | { aceptado: true; tipo: TipoDetectado }
  | { aceptado: false; mensaje: string };

const FIRMAS: ReadonlyArray<{ bytes: readonly number[]; tipo: TipoDetectado }> =
  [
    {
      bytes: [0x25, 0x50, 0x44, 0x46, 0x2d], // %PDF-
      tipo: { mime: "application/pdf", extension: "pdf" },
    },
    {
      bytes: [0xff, 0xd8, 0xff],
      tipo: { mime: "image/jpeg", extension: "jpg" },
    },
    {
      bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
      tipo: { mime: "image/png", extension: "png" },
    },
  ];

// Nombres largos: que aparezcan al azar en bytes binarios es despreciable, así que
// sirven en un barrido crudo. /JS o /XFA darían falsos positivos en un escaneo JPEG.
const NOMBRES_ACTIVOS_CRUDOS =
  /\/(?:JavaScript|Launch|ImportData|EmbeddedFiles?|RichMedia)(?![A-Za-z0-9])/;

const NOMBRES_ACTIVOS = new Set([
  "JS",
  "JavaScript",
  "Launch",
  "ImportData",
  "GoToE",
  "EmbeddedFile",
  "EmbeddedFiles",
  "RichMedia",
  "XFA",
]);

const MAX_PROFUNDIDAD = 64;

export const MENSAJE_ARCHIVO_INVALIDO =
  "El archivo no es un PDF, JPEG o PNG válido. Revísalo y adjúntalo de nuevo.";
export const MENSAJE_PDF_ACTIVO =
  "El PDF contiene código o adjuntos internos y no podemos aceptarlo. Usa «Imprimir como PDF» y adjunta el nuevo archivo.";
export const MENSAJE_PDF_ILEGIBLE =
  "No pudimos revisar el PDF porque está dañado o protegido con contraseña. Usa «Imprimir como PDF» y adjunta el nuevo archivo.";

/** El tipo sale de los bytes; el MIME y la extensión los controla el cliente. */
export function detectarTipoArchivo(
  contenido: Uint8Array,
): TipoDetectado | null {
  const firma = FIRMAS.find(({ bytes }) =>
    bytes.every((byte, indice) => contenido[indice] === byte),
  );
  return firma?.tipo ?? null;
}

// pdf-lib solo decodifica #XX en mayúsculas; /J#61vaScript debe verse como JavaScript.
function decodificarNombre(nombre: string): string {
  return nombre.replace(/#([0-9a-fA-F]{2})/g, (_, hexadecimal: string) =>
    String.fromCharCode(Number.parseInt(hexadecimal, 16)),
  );
}

function esNombreActivo(nombre: PDFName): boolean {
  return NOMBRES_ACTIVOS.has(decodificarNombre(nombre.asString()).slice(1));
}

function contieneObjetoActivo(
  objeto: unknown,
  visitados: Set<unknown>,
  profundidad = 0,
): boolean {
  if (objeto instanceof PDFName) return esNombreActivo(objeto);
  // Lo anidado más allá del tope no es inspeccionable: se trata como activo.
  if (profundidad > MAX_PROFUNDIDAD) return true;
  if (visitados.has(objeto)) return false;

  if (objeto instanceof PDFStream) {
    visitados.add(objeto);
    return contieneObjetoActivo(objeto.dict, visitados, profundidad + 1);
  }
  if (objeto instanceof PDFDict) {
    visitados.add(objeto);
    return objeto
      .entries()
      .some(
        ([clave, valor]) =>
          esNombreActivo(clave) ||
          contieneObjetoActivo(valor, visitados, profundidad + 1),
      );
  }
  if (objeto instanceof PDFArray) {
    visitados.add(objeto);
    return objeto
      .asArray()
      .some((valor) => contieneObjetoActivo(valor, visitados, profundidad + 1));
  }
  return false;
}

async function revisarPdf(contenido: Buffer): Promise<string | null> {
  const crudo = decodificarNombre(contenido.toString("latin1"));
  if (NOMBRES_ACTIVOS_CRUDOS.test(crudo)) return MENSAJE_PDF_ACTIVO;

  try {
    // Sin ignoreEncryption: un PDF cifrado no se puede inspeccionar y se rechaza.
    const documento = await PDFDocument.load(contenido, {
      updateMetadata: false,
    });
    // pdf-lib tolera basura tras la cabecera: sin páginas no es un documento real.
    if (documento.getPageCount() === 0) return MENSAJE_PDF_ILEGIBLE;

    const visitados = new Set<unknown>();
    const activo = documento.context
      .enumerateIndirectObjects()
      .some(([, objeto]) => contieneObjetoActivo(objeto, visitados));
    return activo ? MENSAJE_PDF_ACTIVO : null;
  } catch {
    return MENSAJE_PDF_ILEGIBLE;
  }
}

export async function revisarArchivo(
  contenido: Buffer,
): Promise<RevisionArchivo> {
  const tipo = detectarTipoArchivo(contenido);
  if (!tipo) return { aceptado: false, mensaje: MENSAJE_ARCHIVO_INVALIDO };

  if (tipo.mime === "application/pdf") {
    const motivo = await revisarPdf(contenido);
    if (motivo) return { aceptado: false, mensaje: motivo };
  }

  return { aceptado: true, tipo };
}
