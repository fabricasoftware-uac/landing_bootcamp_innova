import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { eliminarPostulacionAdminAction } from "@/app/actions/admin";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { obtenerAdministrador } from "@/lib/supabase/autorizacion";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/supabase/admin", () => ({
  getAdminSupabaseClient: vi.fn(),
  createAdminClient: vi.fn(),
}));

vi.mock("@/lib/supabase/autorizacion", () => ({
  obtenerAdministrador: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Headers()),
}));

const ADMIN_ID = "6f1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d";
const POSTULACION_ID = "11111111-2222-4333-8444-555555555555";
const MENSAJE_SIN_ACCESO =
  "Tu sesión no tiene acceso a este panel. Inicia sesión de nuevo.";

interface MockDatabaseOptions {
  documentos?: Array<{ storage_path: string | null }> | null;
  errorConsultarDocumentos?: Error | null;
  errorEliminarStorage?: Error | null;
  excepcionStorage?: boolean;
  errorEliminarPostulacion?: Error | null;
}

function configurarMockAdmin(options: MockDatabaseOptions = {}) {
  const datosDocumentos =
    options.documentos !== undefined
      ? options.documentos
      : options.errorConsultarDocumentos
        ? null
        : [
            { storage_path: "postulacion_1/aval.pdf" },
            { storage_path: "postulacion_1/doc1.pdf" },
            { storage_path: "postulacion_1/doc2.pdf" },
          ];

  const selectDocumentosEq = vi.fn().mockResolvedValue({
    data: datosDocumentos,
    error: options.errorConsultarDocumentos ?? null,
  });

  const selectDocumentos = vi.fn().mockReturnValue({
    eq: selectDocumentosEq,
  });

  const deletePostulacionesEq = vi.fn().mockResolvedValue({
    error: options.errorEliminarPostulacion ?? null,
  });

  const deletePostulaciones = vi.fn().mockReturnValue({
    eq: deletePostulacionesEq,
  });

  const removeStorage = vi.fn();
  if (options.excepcionStorage) {
    removeStorage.mockRejectedValue(new Error("Storage timeout crash"));
  } else {
    removeStorage.mockResolvedValue({
      error: options.errorEliminarStorage ?? null,
    });
  }

  const storageFrom = vi.fn().mockReturnValue({
    remove: removeStorage,
  });

  const from = vi.fn((tabla: string) => {
    if (tabla === "documentos_postulacion") {
      return { select: selectDocumentos };
    }
    if (tabla === "postulaciones") {
      return { delete: deletePostulaciones };
    }
    return {};
  });

  const mockAdminClient = {
    from,
    storage: { from: storageFrom },
  };

  vi.mocked(getAdminSupabaseClient).mockReturnValue(mockAdminClient as never);

  return {
    mockAdminClient,
    selectDocumentos,
    selectDocumentosEq,
    deletePostulaciones,
    deletePostulacionesEq,
    removeStorage,
    storageFrom,
  };
}

describe("Server Action: eliminarPostulacionAdminAction", () => {
  let spyConsoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    spyConsoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(obtenerAdministrador).mockResolvedValue({ id: ADMIN_ID });
  });

  afterEach(() => {
    spyConsoleError.mockRestore();
  });

  describe("Control de acceso y autorización", () => {
    it("rechaza la solicitud cuando obtenerAdministrador() retorna null (sesión inexistente)", async () => {
      vi.mocked(obtenerAdministrador).mockResolvedValue(null);

      const respuesta = await eliminarPostulacionAdminAction(POSTULACION_ID);

      expect(respuesta.success).toBe(false);
      expect(respuesta.error).toBe(MENSAJE_SIN_ACCESO);
      expect(getAdminSupabaseClient).not.toHaveBeenCalled();
    });

    it("rechaza la solicitud si la verificación de administrador arroja error o es denegada", async () => {
      vi.mocked(obtenerAdministrador).mockResolvedValue(null);

      const respuesta = await eliminarPostulacionAdminAction(POSTULACION_ID);

      expect(respuesta.success).toBe(false);
      expect(respuesta.error).toBe(MENSAJE_SIN_ACCESO);
      expect(getAdminSupabaseClient).not.toHaveBeenCalled();
    });
  });

  describe("Validación de identificador (UUID)", () => {
    it("rechaza identificadores vacíos o con solo espacios", async () => {
      const respuestaVacia = await eliminarPostulacionAdminAction("");
      expect(respuestaVacia.success).toBe(false);
      expect(respuestaVacia.error).toBe(
        "Identificador de postulación inválido.",
      );

      const respuestaEspacios = await eliminarPostulacionAdminAction("   ");
      expect(respuestaEspacios.success).toBe(false);
      expect(respuestaEspacios.error).toBe(
        "Identificador de postulación inválido.",
      );

      expect(getAdminSupabaseClient).not.toHaveBeenCalled();
    });

    it("rechaza identificadores alfanuméricos que no cumplen el formato UUID", async () => {
      const idsInvalidos = [
        "12345",
        "postulacion-no-uuid",
        "11111111-2222-3333-4444",
        "11111111-2222-3333-4444-55555555555Z",
        "null",
        "undefined",
      ];

      for (const id of idsInvalidos) {
        const respuesta = await eliminarPostulacionAdminAction(id);
        expect(respuesta.success).toBe(false);
        expect(respuesta.error).toBe("Identificador de postulación inválido.");
      }

      expect(getAdminSupabaseClient).not.toHaveBeenCalled();
    });

    it("rechaza intentos de inyección SQL o de caracteres de control", async () => {
      const intentosInyeccion = [
        `${POSTULACION_ID}' OR 1=1;--`,
        `${POSTULACION_ID}; DROP TABLE postulaciones;`,
        "../../etc/passwd",
        "<script>alert(1)</script>",
      ];

      for (const payload of intentosInyeccion) {
        const respuesta = await eliminarPostulacionAdminAction(payload);
        expect(respuesta.success).toBe(false);
        expect(respuesta.error).toBe("Identificador de postulación inválido.");
      }

      expect(getAdminSupabaseClient).not.toHaveBeenCalled();
    });
  });

  describe("Flujo exitoso de eliminación", () => {
    it("elimina documentos en Storage y el registro en la BD cuando existen adjuntos", async () => {
      const {
        selectDocumentos,
        selectDocumentosEq,
        storageFrom,
        removeStorage,
        deletePostulaciones,
        deletePostulacionesEq,
      } = configurarMockAdmin({
        documentos: [
          { storage_path: "postulacion_1/aval.pdf" },
          { storage_path: "postulacion_1/doc1.pdf" },
          { storage_path: "postulacion_1/doc2.pdf" },
        ],
      });

      const respuesta = await eliminarPostulacionAdminAction(POSTULACION_ID);

      expect(respuesta).toEqual({ success: true });

      // 1. Verifica consulta a documentos_postulacion
      expect(selectDocumentos).toHaveBeenCalledWith("storage_path");
      expect(selectDocumentosEq).toHaveBeenCalledWith(
        "postulacion_id",
        POSTULACION_ID,
      );

      // 2. Verifica eliminación en Storage
      expect(storageFrom).toHaveBeenCalledWith("postulaciones_docs");
      expect(removeStorage).toHaveBeenCalledWith([
        "postulacion_1/aval.pdf",
        "postulacion_1/doc1.pdf",
        "postulacion_1/doc2.pdf",
      ]);

      // 3. Verifica eliminación en cascada en la BD
      expect(deletePostulaciones).toHaveBeenCalled();
      expect(deletePostulacionesEq).toHaveBeenCalledWith("id", POSTULACION_ID);
    });

    it("elimina el registro en BD sin invocar Storage si la postulación no tiene documentos", async () => {
      const { removeStorage, deletePostulacionesEq } = configurarMockAdmin({
        documentos: [],
      });

      const respuesta = await eliminarPostulacionAdminAction(POSTULACION_ID);

      expect(respuesta).toEqual({ success: true });
      expect(removeStorage).not.toHaveBeenCalled();
      expect(deletePostulacionesEq).toHaveBeenCalledWith("id", POSTULACION_ID);
    });

    it("ignora rutas de storage nulas, indefinidas o con solo espacios en blanco", async () => {
      const { removeStorage, deletePostulacionesEq } = configurarMockAdmin({
        documentos: [
          { storage_path: null },
          { storage_path: "" },
          { storage_path: "   " },
          { storage_path: "postulacion_1/archivo_valido.pdf" },
        ],
      });

      const respuesta = await eliminarPostulacionAdminAction(POSTULACION_ID);

      expect(respuesta).toEqual({ success: true });
      expect(removeStorage).toHaveBeenCalledWith([
        "postulacion_1/archivo_valido.pdf",
      ]);
      expect(deletePostulacionesEq).toHaveBeenCalledWith("id", POSTULACION_ID);
    });

    it("no invoca Storage si todos los documentos tienen storage_path vacío o nulo", async () => {
      const { removeStorage, deletePostulacionesEq } = configurarMockAdmin({
        documentos: [
          { storage_path: null },
          { storage_path: "" },
          { storage_path: "   " },
        ],
      });

      const respuesta = await eliminarPostulacionAdminAction(POSTULACION_ID);

      expect(respuesta).toEqual({ success: true });
      expect(removeStorage).not.toHaveBeenCalled();
      expect(deletePostulacionesEq).toHaveBeenCalledWith("id", POSTULACION_ID);
    });
  });

  describe("Resiliencia y manejo de errores", () => {
    it("continúa y elimina en BD si Storage responde con error, registrando advertencia", async () => {
      const { removeStorage, deletePostulacionesEq } = configurarMockAdmin({
        errorEliminarStorage: new Error("Permisos denegados en bucket S3"),
      });

      const respuesta = await eliminarPostulacionAdminAction(POSTULACION_ID);

      // Debe ser exitoso porque la postulación sí se elimina en BD (evita bloquear al administrador)
      expect(respuesta).toEqual({ success: true });
      expect(removeStorage).toHaveBeenCalled();
      expect(deletePostulacionesEq).toHaveBeenCalledWith("id", POSTULACION_ID);
      expect(spyConsoleError).toHaveBeenCalledWith(
        expect.stringContaining(
          "no se pudieron eliminar algunos archivos en Storage:",
        ),
        expect.any(Error),
      );
    });

    it("continúa y elimina en BD si Storage lanza una excepción rechazada", async () => {
      const { removeStorage, deletePostulacionesEq } = configurarMockAdmin({
        excepcionStorage: true,
      });

      const respuesta = await eliminarPostulacionAdminAction(POSTULACION_ID);

      expect(respuesta).toEqual({ success: true });
      expect(removeStorage).toHaveBeenCalled();
      expect(deletePostulacionesEq).toHaveBeenCalledWith("id", POSTULACION_ID);
      expect(spyConsoleError).toHaveBeenCalledWith(
        expect.stringContaining(
          "Excepción al intentar eliminar archivos de Storage:",
        ),
        expect.any(Error),
      );
    });

    it("continúa y elimina en BD si la consulta de documentos_postulacion devuelve error", async () => {
      const { removeStorage, deletePostulacionesEq } = configurarMockAdmin({
        errorConsultarDocumentos: new Error(
          "Falla al consultar tabla documentos",
        ),
        documentos: undefined, // Simula que documentos es undefined por el error
      });

      const respuesta = await eliminarPostulacionAdminAction(POSTULACION_ID);

      expect(respuesta).toEqual({ success: true });
      expect(removeStorage).not.toHaveBeenCalled();
      expect(deletePostulacionesEq).toHaveBeenCalledWith("id", POSTULACION_ID);
      expect(spyConsoleError).toHaveBeenCalledWith(
        expect.stringContaining(
          "Error al consultar documentos de la postulación",
        ),
        expect.any(Error),
      );
    });

    it("captura errores de la base de datos al eliminar postulaciones y retorna mensaje amigable", async () => {
      configurarMockAdmin({
        errorEliminarPostulacion: new Error(
          "Foreign key constraint violation o timeout",
        ),
      });

      const respuesta = await eliminarPostulacionAdminAction(POSTULACION_ID);

      expect(respuesta.success).toBe(false);
      expect(respuesta.error).toBe(
        "No pudimos eliminar la postulación. Inténtalo de nuevo en unos minutos.",
      );
      expect(spyConsoleError).toHaveBeenCalledWith(
        "Error al eliminar postulación:",
        expect.any(Error),
      );
    });
  });
});
