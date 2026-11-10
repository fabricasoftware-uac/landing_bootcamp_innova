import { PDFDocument } from "pdf-lib";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { guardarEvaluacionAction } from "@/app/actions/admin";
import { crearPostulacionAction } from "@/app/actions/postulaciones";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { obtenerAdministrador } from "@/lib/supabase/autorizacion";

// Mockear el cliente admin de Supabase para pruebas aisladas y determinísticas
vi.mock("@/lib/supabase/admin", () => ({
  getAdminSupabaseClient: vi.fn(),
  createAdminClient: vi.fn(),
}));

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

vi.mock("@/lib/supabase/autorizacion", () => ({
  obtenerAdministrador: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Headers()),
}));

const ADMIN_ID = "6f1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d";
const POSTULACION_ID = "11111111-2222-4333-8444-555555555555";

const pdfVacio = await (async () => {
  const documento = await PDFDocument.create();
  documento.addPage();
  return documento.save();
})();

function crearArchivoMock(nombre: string, type = "application/pdf"): File {
  return new File([Buffer.from(pdfVacio)], nombre, { type });
}

describe("Server Actions: crearPostulacionAction y Rollback Preventivo", () => {
  const uploadMock = vi.fn();
  const removeMock = vi.fn();
  const insertPostulacionMock = vi.fn();
  const insertIntegrantesMock = vi.fn();
  const insertDocumentosMock = vi.fn();
  const deleteMock = vi.fn();
  const eqDeleteMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    eqDeleteMock.mockResolvedValue({ error: null });
    deleteMock.mockReturnValue({ eq: eqDeleteMock });

    uploadMock.mockResolvedValue({ data: { path: "ok" }, error: null });
    removeMock.mockResolvedValue({ data: [], error: null });

    const mockAdminClient = {
      storage: {
        from: vi.fn().mockReturnValue({
          upload: uploadMock,
          remove: removeMock,
        }),
      },
      from: vi.fn((table: string) => {
        if (table === "postulaciones") {
          return {
            insert: insertPostulacionMock.mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {
                    id: "post-uuid-1234",
                    radicado_codigo: "INNOVA-2026-0001",
                    institucion_nombre: "Universidad del Cauca",
                    semillero_nombre: "Semillero de Teleinformática",
                  },
                  error: null,
                }),
              }),
            }),
            delete: deleteMock,
          };
        }
        if (table === "integrantes") {
          return {
            insert: insertIntegrantesMock.mockResolvedValue({ error: null }),
          };
        }
        if (table === "documentos_postulacion") {
          return {
            insert: insertDocumentosMock.mockResolvedValue({ error: null }),
          };
        }
        return {
          insert: vi.fn().mockResolvedValue({ error: null }),
          delete: deleteMock,
        };
      }),
    };

    vi.mocked(getAdminSupabaseClient).mockReturnValue(mockAdminClient as never);
  });

  it("devuelve error si el campo JSON 'datos' es malformado", async () => {
    const formData = new FormData();
    formData.set("datos", "{ malformed_json: ");

    const result = await crearPostulacionAction(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).not.toContain("JSON");
      expect(result.error).toContain("No pudimos leer los datos");
    }
  });

  it("devuelve fieldErrors si la validación de Zod falla (ej. menos de 3 integrantes)", async () => {
    const formData = new FormData();
    const payload = {
      institucion_nombre: "Universidad del Cauca",
      institucion_tipo: "superior",
      semillero_nombre: "GTI",
      tutor_nombre: "Profesor Guía",
      tutor_email: "tutor@unicauca.edu.co",
      tutor_telefono: "3110000000",
      integrantes: [
        {
          nombres_apellidos: "Solo Un Estudiante",
          tipo_documento: "CC",
          numero_documento: "1061000",
          correo_electronico: "estudiante@unicauca.edu.co",
          telefono: "3100000000",
          es_menor_edad: false,
        },
      ],
      motivacion_intereses:
        "Texto válido de motivación con más de cincuenta caracteres exactos para pasar.",
      acepta_terminos: true,
      acepta_tratamiento_datos: true,
      declara_veracidad: true,
    };

    formData.set("datos", JSON.stringify(payload));
    formData.set("aval_semillero", crearArchivoMock("aval.pdf"));
    formData.set("doc_identidad_1", crearArchivoMock("doc1.pdf"));
    formData.set("doc_identidad_2", crearArchivoMock("doc2.pdf"));
    formData.set("doc_identidad_3", crearArchivoMock("doc3.pdf"));

    const result = await crearPostulacionAction(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.fieldErrors?.integrantes).toBeDefined();
    }
  });

  it("ejecuta Rollback Preventivo (limpieza en storage) si falla la subida de un archivo", async () => {
    // Simular que el segundo archivo falla al subir
    let callCount = 0;
    uploadMock.mockImplementation(() => {
      callCount++;
      if (callCount === 2) {
        return Promise.resolve({
          data: null,
          error: new Error("Network timeout en storage"),
        });
      }
      return Promise.resolve({ data: { path: "ok" }, error: null });
    });

    const formData = new FormData();
    const payload = {
      institucion_nombre: "Universidad del Cauca",
      institucion_tipo: "superior",
      semillero_nombre: "Semillero de Teleinformática",
      tutor_nombre: "Roberto Muñoz",
      tutor_email: "rmunoz@unicauca.edu.co",
      tutor_telefono: "3156789012",
      integrantes: [
        {
          nombres_apellidos: "Estudiante Uno",
          tipo_documento: "CC",
          numero_documento: "1001",
          correo_electronico: "e1@test.com",
          telefono: "3100000001",
          es_menor_edad: false,
        },
        {
          nombres_apellidos: "Estudiante Dos",
          tipo_documento: "CC",
          numero_documento: "1002",
          correo_electronico: "e2@test.com",
          telefono: "3100000002",
          es_menor_edad: false,
        },
        {
          nombres_apellidos: "Estudiante Tres",
          tipo_documento: "CC",
          numero_documento: "1003",
          correo_electronico: "e3@test.com",
          telefono: "3100000003",
          es_menor_edad: false,
        },
      ],
      motivacion_intereses:
        "Nos apasiona investigar soluciones innovadoras para comunidades vulnerables del Cauca.",
      acepta_terminos: true,
      acepta_tratamiento_datos: true,
      declara_veracidad: true,
    };

    formData.set("datos", JSON.stringify(payload));
    formData.set("aval_semillero", crearArchivoMock("aval.pdf"));
    formData.set("doc_identidad_1", crearArchivoMock("doc1.pdf"));
    formData.set("doc_identidad_2", crearArchivoMock("doc2.pdf"));
    formData.set("doc_identidad_3", crearArchivoMock("doc3.pdf"));

    const result = await crearPostulacionAction(formData);

    expect(result.success).toBe(false);
    // Verificar que se invocó removeMock para limpiar los archivos subidos antes del error
    expect(removeMock).toHaveBeenCalled();
  });

  it("ejecuta Rollback Preventivo completo (limpieza en storage y eliminación en BD) si falla la inserción de integrantes", async () => {
    // La inserción de postulaciones tiene éxito, pero la de integrantes falla
    insertIntegrantesMock.mockResolvedValueOnce({
      error: new Error("Violación de restricción de clave foránea simulada"),
    });

    const formData = new FormData();
    const payload = {
      institucion_nombre: "Universidad del Cauca",
      institucion_tipo: "superior",
      semillero_nombre: "Semillero de Teleinformática",
      tutor_nombre: "Roberto Muñoz",
      tutor_email: "rmunoz@unicauca.edu.co",
      tutor_telefono: "3156789012",
      integrantes: [
        {
          nombres_apellidos: "Estudiante Uno",
          tipo_documento: "CC",
          numero_documento: "1001",
          correo_electronico: "e1@test.com",
          telefono: "3100000001",
          es_menor_edad: false,
        },
        {
          nombres_apellidos: "Estudiante Dos",
          tipo_documento: "CC",
          numero_documento: "1002",
          correo_electronico: "e2@test.com",
          telefono: "3100000002",
          es_menor_edad: false,
        },
        {
          nombres_apellidos: "Estudiante Tres",
          tipo_documento: "CC",
          numero_documento: "1003",
          correo_electronico: "e3@test.com",
          telefono: "3100000003",
          es_menor_edad: false,
        },
      ],
      motivacion_intereses:
        "Nos apasiona investigar soluciones innovadoras para comunidades vulnerables del Cauca.",
      acepta_terminos: true,
      acepta_tratamiento_datos: true,
      declara_veracidad: true,
    };

    formData.set("datos", JSON.stringify(payload));
    formData.set("aval_semillero", crearArchivoMock("aval.pdf"));
    formData.set("doc_identidad_1", crearArchivoMock("doc1.pdf"));
    formData.set("doc_identidad_2", crearArchivoMock("doc2.pdf"));
    formData.set("doc_identidad_3", crearArchivoMock("doc3.pdf"));

    const result = await crearPostulacionAction(formData);

    expect(result.success).toBe(false);
    // Verificar que se limpió el storage
    expect(removeMock).toHaveBeenCalled();
    // Verificar que se borró el registro huérfano de la base de datos
    expect(deleteMock).toHaveBeenCalled();
    expect(eqDeleteMock).toHaveBeenCalledWith("id", "post-uuid-1234");
  });

  it("registra exitosamente la postulación cuando todos los datos y archivos son correctos", async () => {
    const formData = new FormData();
    const payload = {
      institucion_nombre: "Universidad del Cauca",
      institucion_tipo: "superior",
      semillero_nombre: "Semillero de Teleinformática",
      tutor_nombre: "Roberto Muñoz",
      tutor_email: "rmunoz@unicauca.edu.co",
      tutor_telefono: "3156789012",
      integrantes: [
        {
          nombres_apellidos: "Estudiante Uno",
          tipo_documento: "CC",
          numero_documento: "1001",
          correo_electronico: "e1@test.com",
          telefono: "3100000001",
          es_menor_edad: false,
        },
        {
          nombres_apellidos: "Estudiante Dos",
          tipo_documento: "CC",
          numero_documento: "1002",
          correo_electronico: "e2@test.com",
          telefono: "3100000002",
          es_menor_edad: false,
        },
        {
          nombres_apellidos: "Estudiante Tres",
          tipo_documento: "CC",
          numero_documento: "1003",
          correo_electronico: "e3@test.com",
          telefono: "3100000003",
          es_menor_edad: false,
        },
      ],
      motivacion_intereses:
        "Nos apasiona investigar soluciones innovadoras para comunidades vulnerables del Cauca.",
      acepta_terminos: true,
      acepta_tratamiento_datos: true,
      declara_veracidad: true,
    };

    formData.set("datos", JSON.stringify(payload));
    formData.set("aval_semillero", crearArchivoMock("aval.pdf"));
    formData.set("doc_identidad_1", crearArchivoMock("doc1.pdf"));
    formData.set("doc_identidad_2", crearArchivoMock("doc2.pdf"));
    formData.set("doc_identidad_3", crearArchivoMock("doc3.pdf"));

    const result = await crearPostulacionAction(formData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.radicado_codigo).toBe("INNOVA-2026-0001");
      expect(result.data.postulacion_id).toBe("post-uuid-1234");
    }
  });
});

describe("Server Actions: guardarEvaluacionAction", () => {
  beforeEach(() => {
    vi.mocked(obtenerAdministrador).mockResolvedValue({ id: ADMIN_ID });
  });

  it("clamp y valida que los puntajes no superen los topes de los TDR (30/30/20/20)", async () => {
    const upsertMock = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: { id: "eval-1", postulacion_id: "post-1" },
          error: null,
        }),
      }),
    });
    const updatePostulacionMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });

    vi.mocked(getAdminSupabaseClient).mockReturnValue({
      from: vi.fn((table: string) => {
        if (table === "evaluaciones") {
          return { upsert: upsertMock };
        }
        return { update: updatePostulacionMock };
      }),
    } as never);

    const input = {
      postulacion_id: POSTULACION_ID,
      cumple_requisitos_habilitante: true,
      puntaje_motivacion: 50, // excede 30 -> debe ser limitado a 30
      puntaje_pertinencia: -10, // menor que 0 -> limitado a 0
      puntaje_diversidad: 25, // excede 20 -> limitado a 20
      puntaje_representacion: 15,
      observaciones: "Evaluación test",
      nuevo_estado: "habilitado" as const,
    };

    const res = await guardarEvaluacionAction(input);
    expect(res.success).toBe(true);

    const callArgs = upsertMock.mock.calls[0]?.[0];
    expect(callArgs.puntaje_motivacion).toBe(30);
    expect(callArgs.puntaje_pertinencia).toBe(0);
    expect(callArgs.puntaje_diversidad).toBe(20);
    expect(callArgs.puntaje_representacion).toBe(15);
    // El autor sale de la sesión: evaluado_por es uuid con FK a auth.users.
    expect(callArgs.evaluado_por).toBe(ADMIN_ID);
  });
});
