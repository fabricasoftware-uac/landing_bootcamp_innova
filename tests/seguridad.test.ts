import {
  PDFDocument,
  PDFHexString,
  PDFName,
  type PDFObject,
  PDFString,
} from "pdf-lib";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PostulacionAdminDetalle } from "@/app/actions/admin";
import {
  eliminarPostulacionAdminAction,
  exportarPostulacionesExcelAction,
  generarUrlDocumentoAction,
  guardarEvaluacionAction,
  obtenerPostulacionesAdminAction,
} from "@/app/actions/admin";
import { crearPostulacionAction } from "@/app/actions/postulaciones";
import {
  construirWorkbookPostulaciones,
  HOJAS_EXCEL,
  neutralizarCelda,
} from "@/lib/excel/generador-excel";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  detectarTipoArchivo,
  MENSAJE_ARCHIVO_INVALIDO,
  MENSAJE_PDF_ACTIVO,
  MENSAJE_PDF_ILEGIBLE,
  revisarArchivo,
} from "@/lib/validations/archivos";
import { rutaDocumentoSchema } from "@/lib/validations/evaluacion";
import { crearLimitador } from "@/lib/validations/limite-tasa";
import {
  integranteSchema,
  normalizarBooleanoEstricto,
  paso1SemilleroSchema,
  paso3MotivacionSchema,
} from "@/lib/validations/postulacion";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/config/convocatoria", () => ({
  ESTADO_CONVOCATORIA: {
    abierta: true,
    motivo: "cupos_agotados",
    badge: "Cupos agotados",
    tituloCierre: "Inscripciones cerradas · Cupos agotados",
    mensajeCierre:
      "Agradecemos a todos los semilleros de investigación del departamento del Cauca por su extraordinaria acogida y participación. Los cupos disponibles para el Bootcamp Cauca INNOVA 2026 se han completado en su totalidad.",
    subtituloCierre:
      "El proceso de recepción de postulaciones ha finalizado. Nuestro equipo evaluador se encuentra revisando las propuestas radicadas.",
    cronograma: [],
  },
}));

vi.mock("@/lib/supabase/admin", () => ({
  getAdminSupabaseClient: vi.fn(),
  createAdminClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));

const cabecerasPeticion = vi.hoisted(() => ({ valor: new Headers() }));

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => cabecerasPeticion.valor),
}));

const POSTULACION_ID = "11111111-2222-4333-8444-555555555555";
const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);

function simularSesion(usuario: unknown, error: unknown = null) {
  vi.mocked(createClient).mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: usuario }, error }),
    },
  } as never);
}

async function crearPdf(
  modificar?: (documento: PDFDocument) => void,
  useObjectStreams = true,
): Promise<Buffer> {
  const documento = await PDFDocument.create();
  documento.addPage();
  modificar?.(documento);
  return Buffer.from(await documento.save({ useObjectStreams }));
}

function agregarOpenAction(documento: PDFDocument, accion: PDFObject) {
  documento.catalog.set(PDFName.of("OpenAction"), accion);
}

function accionJavaScript(documento: PDFDocument) {
  return documento.context.obj({
    S: PDFName.of("JavaScript"),
    JS: PDFString.of("app.alert(1)"),
  });
}

describe("Autorización de las acciones admin", () => {
  const entrada = {
    postulacion_id: POSTULACION_ID,
    cumple_requisitos_habilitante: true,
    puntaje_motivacion: 10,
    puntaje_pertinencia: 10,
    puntaje_diversidad: 10,
    puntaje_representacion: 10,
    nuevo_estado: "habilitado" as const,
  };

  const acciones = [
    ["obtenerPostulacionesAdminAction", obtenerPostulacionesAdminAction],
    [
      "generarUrlDocumentoAction",
      () => generarUrlDocumentoAction("carpeta/doc.pdf"),
    ],
    ["guardarEvaluacionAction", () => guardarEvaluacionAction(entrada)],
    ["exportarPostulacionesExcelAction", exportarPostulacionesExcelAction],
    [
      "eliminarPostulacionAdminAction",
      () => eliminarPostulacionAdminAction(POSTULACION_ID),
    ],
  ] as const;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each(acciones)("%s rechaza sin sesión", async (_nombre, accion) => {
    simularSesion(null);

    const respuesta = await accion();

    expect(respuesta.success).toBe(false);
    expect(respuesta.data).toBeUndefined();
    expect(getAdminSupabaseClient).not.toHaveBeenCalled();
  });

  it.each(acciones)(
    "%s rechaza a un usuario sin rol admin",
    async (_nombre, accion) => {
      simularSesion({ id: "u1", app_metadata: {}, user_metadata: {} });

      expect((await accion()).success).toBe(false);
      expect(getAdminSupabaseClient).not.toHaveBeenCalled();
    },
  );

  it("no acepta un rol escrito en user_metadata", async () => {
    simularSesion({
      id: "u1",
      app_metadata: {},
      user_metadata: { role: "admin" },
    });

    expect((await obtenerPostulacionesAdminAction()).success).toBe(false);
    expect(getAdminSupabaseClient).not.toHaveBeenCalled();
  });

  it("deniega si Supabase falla al validar el token", async () => {
    vi.mocked(createClient).mockRejectedValue(new Error("red caída"));

    expect((await obtenerPostulacionesAdminAction()).success).toBe(false);
    expect(getAdminSupabaseClient).not.toHaveBeenCalled();
  });

  it("no firma una ruta que no pertenece a un expediente registrado", async () => {
    simularSesion({ id: "u1", app_metadata: { role: "admin" } });
    const createSignedUrl = vi.fn();
    vi.mocked(getAdminSupabaseClient).mockReturnValue({
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({ data: null, error: null }),
          }),
        }),
      }),
      storage: { from: () => ({ createSignedUrl }) },
    } as never);

    const respuesta = await generarUrlDocumentoAction("otra/ruta.pdf");

    expect(respuesta.success).toBe(false);
    expect(createSignedUrl).not.toHaveBeenCalled();
  });

  it("firma documentos registrados con vida corta para visualización en línea por defecto y permite descarga opcional", async () => {
    simularSesion({ id: "u1", app_metadata: { role: "admin" } });
    const createSignedUrl = vi.fn().mockResolvedValue({
      data: { signedUrl: "https://storage.test/firmado" },
      error: null,
    });
    vi.mocked(getAdminSupabaseClient).mockReturnValue({
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({
              data: {
                storage_path: "carpeta/doc.pdf",
                nombre_original: "doc.pdf",
              },
              error: null,
            }),
          }),
        }),
      }),
      storage: { from: () => ({ createSignedUrl }) },
    } as never);

    const respuesta = await generarUrlDocumentoAction("carpeta/doc.pdf");

    expect(respuesta.success).toBe(true);
    expect(createSignedUrl).toHaveBeenCalledWith(
      "carpeta/doc.pdf",
      60,
      undefined,
    );

    const respuestaDescarga = await generarUrlDocumentoAction(
      "carpeta/doc.pdf",
      { descargar: true },
    );

    expect(respuestaDescarga.success).toBe(true);
    expect(createSignedUrl).toHaveBeenCalledWith("carpeta/doc.pdf", 60, {
      download: "doc.pdf",
    });
  });

  it.each([
    "../secreto.pdf",
    "carpeta/../../secreto.pdf",
    "/absoluta.pdf",
    "carpeta\\doc.pdf",
    "sin-carpeta.pdf",
    "a/b/c.pdf",
  ])("rechaza la ruta %s", (ruta) => {
    expect(rutaDocumentoSchema.safeParse(ruta).success).toBe(false);
  });
});

describe("Inyección de fórmulas en Excel", () => {
  it.each([
    ["=HYPERLINK(1)"],
    ['=cmd|"/c calc"!A0'],
    ["+1+1"],
    ["-1+1"],
    ["@SUM(A1)"],
    ["\t=1+1"],
    ["\r=1+1"],
    [" =1+1"],
    ["＝1+1"],
  ])("neutraliza %j", (peligroso) => {
    expect(neutralizarCelda(peligroso).startsWith("'")).toBe(true);
  });

  it.each([
    ["+57 310 123 4567"],
    ["+57-310-123-4567"],
    ["3101234567"],
    ["Universidad del Cauca"],
    ["María-José Ñáñez"],
    ["—"],
  ])("no altera %j", (legitimo) => {
    expect(neutralizarCelda(legitimo)).toBe(legitimo);
  });

  it("no deja pasar una fórmula disfrazada de teléfono", () => {
    expect(neutralizarCelda('+1(2)&cmd|"x"').startsWith("'")).toBe(true);
  });

  it("elimina controles que corromperían el XML del xlsx", () => {
    expect(neutralizarCelda("Hola\u0001Mundo\u0007")).toBe("HolaMundo");
  });

  it("protege todas las hojas del libro exportado", () => {
    const formula = '=HYPERLINK("https://atacante.test")';
    const postulacion = {
      id: POSTULACION_ID,
      radicado_codigo: "INNOVA-2026-0001",
      estado: "pendiente",
      institucion_tipo: "superior",
      institucion_nombre: formula,
      semillero_nombre: formula,
      tutor_nombre: formula,
      tutor_email: formula,
      tutor_telefono: "+57 310 123 4567",
      created_at: "2026-11-06T00:00:00Z",
      integrantes: [
        {
          orden_integrante: 1,
          nombres_apellidos: formula,
          tipo_documento: "CC",
          numero_documento: formula,
          correo_electronico: formula,
          telefono: "+57 311 000 0000",
          es_menor_edad: false,
        },
      ],
      documentos_postulacion: [],
      evaluaciones: {
        cumple_requisitos_habilitante: true,
        puntaje_motivacion: 1,
        puntaje_pertinencia: 1,
        puntaje_diversidad: 1,
        puntaje_representacion: 1,
        observaciones: formula,
        evaluado_el: "2026-11-06T00:00:00Z",
      },
    } as unknown as PostulacionAdminDetalle;

    const libro = construirWorkbookPostulaciones([postulacion]);
    const valores: unknown[] = [];
    libro.eachSheet((hoja) => {
      hoja.eachRow((fila, numero) => {
        if (numero === 1) return;
        fila.eachCell((celda) => {
          valores.push(celda.value);
        });
      });
    });

    expect(valores.filter((valor) => valor === formula)).toHaveLength(0);
    expect(
      libro
        .getWorksheet(HOJAS_EXCEL.EQUIPOS)
        ?.getRow(2)
        .getCell("tutor_telefono").value,
    ).toBe("+57 310 123 4567");
  });
});

describe("Tipo real de los archivos", () => {
  it("identifica PDF, JPEG y PNG por sus bytes", async () => {
    expect(detectarTipoArchivo(await crearPdf())?.mime).toBe("application/pdf");
    expect(detectarTipoArchivo(JPEG)?.mime).toBe("image/jpeg");
    expect(detectarTipoArchivo(PNG)?.mime).toBe("image/png");
  });

  it.each([
    ["HTML con extensión pdf", "<html><script>alert(1)</script></html>"],
    ["SVG", '<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"/>'],
    ["ejecutable", "MZ\u0090\u0000"],
    ["vacío", ""],
  ])("rechaza %s", async (_nombre, contenido) => {
    const revision = await revisarArchivo(Buffer.from(contenido, "latin1"));

    expect(revision).toEqual({
      aceptado: false,
      mensaje: MENSAJE_ARCHIVO_INVALIDO,
    });
  });

  it("acepta un PDF normal aunque tenga OpenAction de vista", async () => {
    const pdf = await crearPdf((documento) => {
      agregarOpenAction(
        documento,
        documento.context.obj([documento.getPage(0).ref, PDFName.of("Fit")]),
      );
    });

    expect((await revisarArchivo(pdf)).aceptado).toBe(true);
  });

  it.each([
    ["en objeto plano", false],
    ["comprimido en object stream", true],
  ])("rechaza PDF con JavaScript %s", async (_nombre, comprimido) => {
    const pdf = await crearPdf(
      (documento) => agregarOpenAction(documento, accionJavaScript(documento)),
      comprimido,
    );

    expect(await revisarArchivo(pdf)).toEqual({
      aceptado: false,
      mensaje: MENSAJE_PDF_ACTIVO,
    });
  });

  it("detecta nombres ofuscados con #xx en minúsculas", async () => {
    const pdf = await crearPdf((documento) => {
      agregarOpenAction(
        documento,
        documento.context.obj({
          Type: PDFName.of("Action"),
          S: PDFName.of("LaunchMarcador"),
        }),
      );
    }, false);
    const ofuscado = Buffer.from(
      pdf.toString("latin1").replace("/LaunchMarcador", "/J#61vaScript"),
      "latin1",
    );

    expect(await revisarArchivo(ofuscado)).toEqual({
      aceptado: false,
      mensaje: MENSAJE_PDF_ACTIVO,
    });
  });

  it("rechaza un PDF con cabecera válida pero cuerpo ilegible", async () => {
    const falso = Buffer.from("%PDF-1.7\nesto no es un pdf", "latin1");

    expect(await revisarArchivo(falso)).toEqual({
      aceptado: false,
      mensaje: MENSAJE_PDF_ILEGIBLE,
    });
  });

  it("no da falso positivo por texto en un literal hexadecimal", async () => {
    const pdf = await crearPdf((documento) => {
      documento.catalog.set(
        PDFName.of("Marcador"),
        PDFHexString.fromText("texto normal"),
      );
    });

    expect((await revisarArchivo(pdf)).aceptado).toBe(true);
  });
});

describe("Validación de campos", () => {
  const semillero = {
    institucion_nombre: "Institución Educativa Nº 5 “San José”",
    institucion_tipo: "basica_media",
    semillero_nombre: "Ciencia & Tecnología: C++ (Popayán)",
    tutor_nombre: "María-José O’Neil Ñáñez",
    tutor_email: "tutora@colegio.edu.co",
    tutor_telefono: "+57 (2) 824-0000 ext. 12",
  };

  const integrante = {
    nombres_apellidos: "José Ángel D'Alessandro",
    tipo_documento: "Pasaporte",
    numero_documento: "AB-123.456",
    correo_electronico: "jose@colegio.edu.co",
    telefono: "+57 310 123 4567",
    es_menor_edad: false,
  };

  it("acepta nombres legítimos con tildes, ñ, comillas y guiones", () => {
    expect(paso1SemilleroSchema.safeParse(semillero).success).toBe(true);
    expect(integranteSchema.safeParse(integrante).success).toBe(true);
  });

  it.each([
    ["<script>alert(1)</script>"],
    ["<img src=x onerror=alert(1)>"],
    ["Ana <b>Ruiz</b>"],
    ["Ana&#60;script&#62;"],
    ["=HYPERLINK(1)"],
    ["@SUM(1)"],
  ])("rechaza marcado o fórmula en nombres: %s", (valor) => {
    for (const campo of [
      "institucion_nombre",
      "semillero_nombre",
      "tutor_nombre",
    ]) {
      const resultado = paso1SemilleroSchema.safeParse({
        ...semillero,
        [campo]: valor,
      });
      expect(resultado.success).toBe(false);
    }
    expect(
      integranteSchema.safeParse({ ...integrante, nombres_apellidos: valor })
        .success,
    ).toBe(false);
  });

  it("rechaza marcado en la motivación sin vetar comparaciones", () => {
    const relleno =
      "Queremos investigar agua potable en zonas rurales del Cauca. ";

    expect(
      paso3MotivacionSchema.safeParse({
        motivacion_intereses: `${relleno}<script>alert(1)</script>`,
      }).success,
    ).toBe(false);
    expect(
      paso3MotivacionSchema.safeParse({
        motivacion_intereses: `${relleno}Con costos < 100 y "buena" cobertura.\nSegunda línea.`,
      }).success,
    ).toBe(true);
  });

  it("quita caracteres de control e invisibles", () => {
    const resultado = paso1SemilleroSchema.parse({
      ...semillero,
      tutor_nombre: "Ana\u0000 ‮Ruiz​",
    });

    expect(resultado.tutor_nombre).toBe("Ana Ruiz");
  });

  it("impone longitudes máximas", () => {
    expect(
      paso1SemilleroSchema.safeParse({
        ...semillero,
        semillero_nombre: "a".repeat(151),
      }).success,
    ).toBe(false);
    expect(
      integranteSchema.safeParse({
        ...integrante,
        numero_documento: "1".repeat(21),
      }).success,
    ).toBe(false);
  });

  it("rechaza campos extra en un integrante", () => {
    expect(
      integranteSchema.safeParse({ ...integrante, estado: "seleccionado" })
        .success,
    ).toBe(false);
  });

  it("no convierte un booleano irreconocible en false", () => {
    expect(normalizarBooleanoEstricto("false")).toBe(false);
    expect(normalizarBooleanoEstricto("sí")).toBe(true);
    expect(normalizarBooleanoEstricto("quizás")).toBe("quizás");
    expect(normalizarBooleanoEstricto(undefined)).toBeUndefined();
    expect(
      integranteSchema.safeParse({ ...integrante, es_menor_edad: "quizás" })
        .success,
    ).toBe(false);
  });
});

describe("Defensas de crearPostulacionAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cabecerasPeticion.valor = new Headers();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function formularioCompleto(archivo: File): FormData {
    const integrante = (numero: number) => ({
      nombres_apellidos: "Estudiante Prueba",
      tipo_documento: "CC",
      numero_documento: `100${numero}`,
      correo_electronico: `e${numero}@test.com`,
      telefono: "3100000000",
      es_menor_edad: false,
    });
    const formData = new FormData();
    formData.set(
      "datos",
      JSON.stringify({
        institucion_nombre: "Universidad del Cauca",
        institucion_tipo: "superior",
        semillero_nombre: "Semillero de Prueba",
        tutor_nombre: "Roberto Muñoz",
        tutor_email: "tutor@test.com",
        tutor_telefono: "3156789012",
        integrantes: [integrante(1), integrante(2), integrante(3)],
        motivacion_intereses:
          "Texto válido de motivación con más de cincuenta caracteres para pasar.",
        acepta_terminos: true,
        acepta_tratamiento_datos: true,
        declara_veracidad: true,
      }),
    );
    for (const campo of [
      "aval_semillero",
      "doc_identidad_1",
      "doc_identidad_2",
      "doc_identidad_3",
    ]) {
      formData.set(campo, archivo);
    }
    return formData;
  }

  function simularStorage() {
    const upload = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(getAdminSupabaseClient).mockReturnValue({
      storage: { from: () => ({ upload, remove: vi.fn() }) },
    } as never);
    return upload;
  }

  it("rechaza un HTML con MIME de PDF y no sube nada", async () => {
    const upload = simularStorage();
    const falso = new File(["<html><script>1</script>"], "a.pdf", {
      type: "application/pdf",
    });

    const resultado = await crearPostulacionAction(formularioCompleto(falso));

    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      expect(resultado.error).toBe(MENSAJE_ARCHIVO_INVALIDO);
    }
    expect(upload).not.toHaveBeenCalled();
  });

  it("rechaza claves desconocidas en el JSON", async () => {
    const upload = simularStorage();
    const formData = formularioCompleto(
      new File([JPEG], "a.jpg", { type: "image/jpeg" }),
    );
    const datos = JSON.parse(formData.get("datos") as string);
    formData.set("datos", JSON.stringify({ ...datos, estado: "seleccionado" }));

    const resultado = await crearPostulacionAction(formData);

    expect(resultado.success).toBe(false);
    expect(upload).not.toHaveBeenCalled();
  });

  it.each([["null"], ["[]"], ['"texto"']])(
    "rechaza 'datos' que no es un objeto: %s",
    async (crudo) => {
      simularStorage();
      const formData = new FormData();
      formData.set("datos", crudo);

      const resultado = await crearPostulacionAction(formData);

      expect(resultado.success).toBe(false);
      if (!resultado.success) {
        expect(resultado.error).toContain("No pudimos leer los datos");
      }
    },
  );

  it("rechaza JSON desmedido", async () => {
    simularStorage();
    const formData = new FormData();
    formData.set("datos", `{"a":"${"x".repeat(70 * 1024)}"}`);

    const resultado = await crearPostulacionAction(formData);

    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      expect(resultado.error).toContain("No pudimos leer los datos");
    }
  });

  it("corta el envío si el honeypot viene lleno", async () => {
    const upload = simularStorage();
    const formData = formularioCompleto(
      new File([JPEG], "a.jpg", { type: "image/jpeg" }),
    );
    formData.set("sitio_web", "https://spam.test");

    const resultado = await crearPostulacionAction(formData);

    expect(resultado.success).toBe(false);
    expect(upload).not.toHaveBeenCalled();
    expect(getAdminSupabaseClient).not.toHaveBeenCalled();
  });

  it("frena una ráfaga desde la misma IP", async () => {
    simularStorage();
    cabecerasPeticion.valor = new Headers({ "x-real-ip": "203.0.113.7" });
    const resultados = [];

    for (let intento = 0; intento < 11; intento++) {
      resultados.push(await crearPostulacionAction(new FormData()));
    }

    const ultimo = resultados.at(-1);
    expect(ultimo?.success).toBe(false);
    if (ultimo && !ultimo.success) {
      expect(ultimo.error).toContain("demasiados intentos");
    }
    const anterior = resultados.at(-2);
    if (anterior && !anterior.success) {
      expect(anterior.error).not.toContain("demasiados intentos");
    }
  });
});

describe("crearLimitador", () => {
  it("permite hasta el máximo y se reinicia al vencer la ventana", () => {
    const consumir = crearLimitador(2, 1000);

    expect(consumir("a", 0)).toBe(true);
    expect(consumir("a", 1)).toBe(true);
    expect(consumir("a", 2)).toBe(false);
    expect(consumir("b", 3)).toBe(true);
    expect(consumir("a", 1001)).toBe(true);
  });

  it("no crece sin límite ante claves distintas", () => {
    const consumir = crearLimitador(1, 1000);

    for (let clave = 0; clave < 20_000; clave++) {
      consumir(`ip-${clave}`, 0);
    }

    expect(consumir("nueva", 0)).toBe(true);
  });
});

describe("Cabeceras de seguridad", () => {
  async function cabeceras(entorno: string) {
    vi.resetModules();
    vi.stubEnv("NODE_ENV", entorno);
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://proyecto.supabase.co");
    const { default: config } = await import("@/next.config");
    const reglas = await config.headers?.();
    return new Map(
      reglas?.[0]?.headers.map(({ key, value }) => [key, value]) ?? [],
    );
  }

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("en producción no permite unsafe-eval y limita los orígenes", async () => {
    const csp = (await cabeceras("production")).get("Content-Security-Policy");

    expect(csp).not.toContain("unsafe-eval");
    expect(csp).toContain("connect-src 'self' https://proyecto.supabase.co");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("form-action 'self'");
  });

  it("solo fuera de producción habilita unsafe-eval", async () => {
    const csp = (await cabeceras("development")).get("Content-Security-Policy");

    expect(csp).toContain("'unsafe-eval'");
  });

  it("HSTS no lleva preload", async () => {
    const hsts = (await cabeceras("production")).get(
      "Strict-Transport-Security",
    );

    expect(hsts).toContain("max-age=63072000");
    expect(hsts).not.toContain("preload");
  });

  it("incluye las cabeceras del estándar", async () => {
    const mapa = await cabeceras("production");

    expect(mapa.get("X-Content-Type-Options")).toBe("nosniff");
    expect(mapa.get("X-Frame-Options")).toBe("DENY");
    expect(mapa.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(mapa.get("Cross-Origin-Opener-Policy")).toBe("same-origin");
    expect(mapa.get("Permissions-Policy")).toContain("camera=()");
  });
});
