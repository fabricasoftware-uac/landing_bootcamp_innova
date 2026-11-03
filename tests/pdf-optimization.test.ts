import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";
import { optimizarPdf } from "../lib/utils/optimizar-pdf";

describe("optimizarPdf", () => {
  it("debe procesar un PDF válido sin corromperlo y retornar un buffer válido", async () => {
    // Crear un PDF de prueba usando pdf-lib
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([400, 400]);
    page.drawText("Bootcamp Cauca INNOVA 2026 - Test PDF");
    const pdfBytes = await pdfDoc.save();
    const inputBuffer = Buffer.from(pdfBytes);

    const resultado = await optimizarPdf(inputBuffer);

    expect(resultado.buffer).toBeInstanceOf(Buffer);
    expect(resultado.tamanoOriginal).toBe(inputBuffer.length);
    expect(resultado.tamanoFinal).toBeLessThanOrEqual(resultado.tamanoOriginal);
    expect(typeof resultado.fueComprimido).toBe("boolean");

    // Verificar que el resultado sea un PDF válido que pdf-lib puede leer
    const verificacion = await PDFDocument.load(resultado.buffer);
    expect(verificacion.getPageCount()).toBe(1);
  });

  it("debe retornar el buffer original como fallback seguro si recibe datos corruptos o no PDF", async () => {
    const corruptBuffer = Buffer.from("no-es-un-pdf-valido-sino-texto-plano");
    const resultado = await optimizarPdf(corruptBuffer);

    expect(resultado.buffer).toEqual(corruptBuffer);
    expect(resultado.tamanoOriginal).toBe(corruptBuffer.length);
    expect(resultado.tamanoFinal).toBe(corruptBuffer.length);
    expect(resultado.fueComprimido).toBe(false);
  });
});
