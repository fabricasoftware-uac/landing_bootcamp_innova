import { describe, expect, it } from "vitest";
import {
  esRadicadoValido,
  formatearRadicado,
  getFileExtension,
  parseBooleanValue,
  sanitizeFileName,
} from "@/lib/utils/formatters";

describe("Utilidad de Generación y Validación de Radicados Oficiales", () => {
  it("formatearRadicado genera la estructura correlativa INNOVA-2026-XXXX", () => {
    expect(formatearRadicado(1)).toBe("INNOVA-2026-0001");
    expect(formatearRadicado(7)).toBe("INNOVA-2026-0007");
    expect(formatearRadicado(42)).toBe("INNOVA-2026-0042");
    expect(formatearRadicado(350)).toBe("INNOVA-2026-0350");
    expect(formatearRadicado(9999)).toBe("INNOVA-2026-9999");
    expect(formatearRadicado(10050)).toBe("INNOVA-2026-10050");
  });

  it("formatearRadicado lanza error ante números no enteros o menores a 1", () => {
    expect(() => formatearRadicado(0)).toThrow();
    expect(() => formatearRadicado(-5)).toThrow();
    expect(() => formatearRadicado(3.14)).toThrow();
    expect(() => formatearRadicado(NaN)).toThrow();
  });

  it("esRadicadoValido acepta códigos de radicado que cumplen estrictamente el estándar", () => {
    expect(esRadicadoValido("INNOVA-2026-0001")).toBe(true);
    expect(esRadicadoValido("INNOVA-2026-0042")).toBe(true);
    expect(esRadicadoValido("INNOVA-2026-1000")).toBe(true);
    expect(esRadicadoValido("  INNOVA-2026-0001  ")).toBe(true);
  });

  it("esRadicadoValido rechaza formatos incorrectos, de otros años o maliciosos", () => {
    const invalidos = [
      "INNOVA-2025-0001", // año anterior
      "INNOVA-2027-0001", // año futuro
      "INNOVA-2026-01", // menos de 4 dígitos
      "INNOVA-2026-1", // 1 dígito
      "CAUCA-2026-0001", // prefijo inválido
      "innova-2026-0001", // minúsculas
      "INNOVA-2026-ABCD", // no numérico al final
      "INNOVA-2026-0001; DROP TABLE postulaciones;", // inyección
      "",
      "   ",
      null as unknown as string,
      undefined as unknown as string,
      12345 as unknown as string,
    ];

    for (const inv of invalidos) {
      expect(esRadicadoValido(inv)).toBe(false);
    }
  });
});

describe("Utilidad de Sanitización de Nombres de Archivo", () => {
  it("remueve tildes, diacríticos y convierte a minúsculas", () => {
    expect(sanitizeFileName("Documento_Evaluación.pdf")).toBe(
      "documento_evaluacion.pdf",
    );
    expect(sanitizeFileName("ÁÉÍÓÚ_áéíóú_Ññ.pdf")).toBe("aeiou_aeiou_nn.pdf");
  });

  it("reemplaza espacios y caracteres prohibidos por guiones bajos", () => {
    expect(sanitizeFileName("Plan de Trabajo 2026.pdf")).toBe(
      "plan_de_trabajo_2026.pdf",
    );
    expect(sanitizeFileName("aval #1 (versión final)!.pdf")).toBe(
      "aval__1__version_final__.pdf",
    );
    expect(sanitizeFileName("doc/test\\name.pdf")).toBe("doc_test_name.pdf");
  });

  it("conserva puntos, números y guiones válidos", () => {
    expect(sanitizeFileName("doc-identidad-v1.2.png")).toBe(
      "doc-identidad-v1.2.png",
    );
  });
});

describe("Utilidad de Detección de Extensiones Seguras", () => {
  it("extrae extensiones válidas a partir del nombre del archivo", () => {
    expect(getFileExtension({ name: "certificado.pdf" })).toBe("pdf");
    expect(getFileExtension({ name: "FOTO_EQUIPO.JPG" })).toBe("jpg");
    expect(getFileExtension({ name: "imagen.jpeg" })).toBe("jpeg");
    expect(getFileExtension({ name: "plano.PNG" })).toBe("png");
  });

  it("usa el MIME type si el nombre no contiene extensión clara", () => {
    expect(
      getFileExtension({ name: "archivo_sin_ext", type: "application/pdf" }),
    ).toBe("pdf");
    expect(getFileExtension({ name: "foto_sin_ext", type: "image/png" })).toBe(
      "png",
    );
    expect(getFileExtension({ name: "foto_sin_ext", type: "image/jpeg" })).toBe(
      "jpg",
    );
  });

  it("retorna 'bin' como fallback ante tipos no permitidos o sospechosos", () => {
    expect(getFileExtension({ name: "malware.exe" })).toBe("bin");
    expect(getFileExtension({ name: "script.sh" })).toBe("bin");
    expect(getFileExtension({ name: "payload.bat" })).toBe("bin");
    expect(
      getFileExtension({
        name: "archivo.unknown",
        type: "application/octet-stream",
      }),
    ).toBe("bin");
  });
});

describe("Utilidad de Parsing de Valores Booleanos", () => {
  it("reconoce booleanos nativos sin alteración", () => {
    expect(parseBooleanValue(true)).toBe(true);
    expect(parseBooleanValue(false)).toBe(false);
  });

  it("convierte strings afirmativos a true de manera robusta", () => {
    const afirmativos = [
      "true",
      "TRUE",
      "True",
      "1",
      "on",
      "ON",
      "yes",
      "YES",
      "si",
      "sí",
      "SÍ",
      "  Sí  ",
    ];

    for (const val of afirmativos) {
      expect(parseBooleanValue(val)).toBe(true);
    }
  });

  it("convierte cualquier otro valor o string negativo a false", () => {
    const negativos = [
      "false",
      "FALSE",
      "0",
      "no",
      "off",
      "",
      "aleatorio",
      null,
      undefined,
      {},
      [],
    ];

    for (const val of negativos) {
      expect(parseBooleanValue(val)).toBe(false);
    }
  });
});
