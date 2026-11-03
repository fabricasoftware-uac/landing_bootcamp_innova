import { PDFDocument } from "pdf-lib";

export interface ResultadoOptimizacionPdf {
  buffer: Buffer;
  tamanoOriginal: number;
  tamanoFinal: number;
  fueComprimido: boolean;
}

/**
 * Optimiza y comprime un archivo PDF en memoria mediante pdf-lib.
 * - Elimina objetos no referenciados o metadatos redundantes.
 * - Empaqueta diccionarios en Object Streams comprimidos (useObjectStreams: true).
 * - En caso de que el archivo ya esté altamente comprimido o no se pueda procesar,
 *   garantiza un fallback seguro retornando el buffer original intacto.
 */
export async function optimizarPdf(
  inputBuffer: Buffer,
): Promise<ResultadoOptimizacionPdf> {
  const tamanoOriginal = inputBuffer.length;

  try {
    // Cargar documento PDF
    const pdfDoc = await PDFDocument.load(inputBuffer, {
      ignoreEncryption: true,
      updateMetadata: false,
    });

    // Guardar con compresión de flujos de objetos
    const pdfBytes = await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
    });

    const optimizedBuffer = Buffer.from(pdfBytes);
    const tamanoFinal = optimizedBuffer.length;

    // Solo conservar la versión procesada si el tamaño final es menor
    if (tamanoFinal < tamanoOriginal) {
      return {
        buffer: optimizedBuffer,
        tamanoOriginal,
        tamanoFinal,
        fueComprimido: true,
      };
    }

    return {
      buffer: inputBuffer,
      tamanoOriginal,
      tamanoFinal: tamanoOriginal,
      fueComprimido: false,
    };
  } catch {
    // Si no es un PDF estándar o falla el parser, devolver original de forma resiliente
    return {
      buffer: inputBuffer,
      tamanoOriginal,
      tamanoFinal: tamanoOriginal,
      fueComprimido: false,
    };
  }
}
