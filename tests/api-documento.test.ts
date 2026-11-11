import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/admin/documento/route";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { obtenerAdministrador } from "@/lib/supabase/autorizacion";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/supabase/admin", () => ({
  getAdminSupabaseClient: vi.fn(),
}));

vi.mock("@/lib/supabase/autorizacion", () => ({
  obtenerAdministrador: vi.fn(),
}));

const ADMIN_ID = "6f1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d";
const RUTA_VALIDA =
  "11111111-2222-4333-8444-555555555555/aval_semillero_documento.pdf";
const SIGNED_URL_SIMULADA =
  "https://supabase.co/storage/v1/object/sign/postulaciones_docs/test.pdf?token=abc";

interface MockStorageOptions {
  documento?: {
    storage_path: string;
    nombre_original: string;
    mime_type: string;
  } | null;
  errorDb?: Error | null;
  signedUrl?: string | null;
  errorStorage?: Error | null;
}

function configurarMocks(opciones: MockStorageOptions = {}) {
  const doc =
    opciones.documento !== undefined
      ? opciones.documento
      : {
          storage_path: RUTA_VALIDA,
          nombre_original: "Aval Institucional 2026.pdf",
          mime_type: "application/pdf",
        };

  const createSignedUrlMock = vi.fn().mockResolvedValue({
    data:
      opciones.errorStorage || opciones.signedUrl === null
        ? null
        : { signedUrl: opciones.signedUrl ?? SIGNED_URL_SIMULADA },
    error: opciones.errorStorage ?? null,
  });

  const maybeSingleMock = vi.fn().mockResolvedValue({
    data: opciones.errorDb ? null : doc,
    error: opciones.errorDb ?? null,
  });

  const eqMock = vi.fn().mockReturnValue({
    maybeSingle: maybeSingleMock,
  });

  const selectMock = vi.fn().mockReturnValue({
    eq: eqMock,
  });

  const fromMock = vi.fn().mockReturnValue({
    select: selectMock,
  });

  const adminClient = {
    from: fromMock,
    storage: {
      from: vi.fn().mockReturnValue({
        createSignedUrl: createSignedUrlMock,
      }),
    },
  };

  vi.mocked(getAdminSupabaseClient).mockReturnValue(adminClient as never);

  return { adminClient, createSignedUrlMock, maybeSingleMock };
}

describe("Route Handler GET /api/admin/documento", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(obtenerAdministrador).mockResolvedValue({ id: ADMIN_ID });
  });

  it("rechaza con 401 si el usuario no es administrador", async () => {
    vi.mocked(obtenerAdministrador).mockResolvedValue(null);

    const req = new NextRequest(
      `http://localhost:3000/api/admin/documento?path=${encodeURIComponent(RUTA_VALIDA)}`,
    );
    const res = await GET(req);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("No autorizado");
  });

  it("rechaza con 400 si falta el parámetro path", async () => {
    configurarMocks();

    const req = new NextRequest("http://localhost:3000/api/admin/documento");
    const res = await GET(req);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Falta el parámetro 'path'");
  });

  it("rechaza con 400 si path contiene secuencias de escape de directorio o caracteres inválidos", async () => {
    configurarMocks();

    const rutasMaliciosas = [
      "../secreto.txt",
      "carpeta/../archivo.pdf",
      "/raiz/archivo.pdf",
      "carpeta/archivo$malicioso.pdf",
      "archivo_sin_carpeta.pdf",
    ];

    for (const ruta of rutasMaliciosas) {
      const req = new NextRequest(
        `http://localhost:3000/api/admin/documento?path=${encodeURIComponent(ruta)}`,
      );
      const res = await GET(req);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toBe("Ruta de documento inválida");
    }
  });

  it("retorna 404 si el documento no está registrado en la base de datos", async () => {
    configurarMocks({ documento: null });

    const req = new NextRequest(
      `http://localhost:3000/api/admin/documento?path=${encodeURIComponent(RUTA_VALIDA)}`,
    );
    const res = await GET(req);

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toContain("Documento no encontrado");
  });

  it("retorna 500 si ocurre un error al consultar la base de datos", async () => {
    configurarMocks({ errorDb: new Error("DB Connection Error") });

    const req = new NextRequest(
      `http://localhost:3000/api/admin/documento?path=${encodeURIComponent(RUTA_VALIDA)}`,
    );
    const res = await GET(req);

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Error al consultar el documento");
  });

  it("retorna 500 si Storage falla al crear la signed URL", async () => {
    configurarMocks({ errorStorage: new Error("Storage timeout") });

    const req = new NextRequest(
      `http://localhost:3000/api/admin/documento?path=${encodeURIComponent(RUTA_VALIDA)}`,
    );
    const res = await GET(req);

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toContain("No se pudo generar el enlace");
  });

  it("redirecciona con 307 a la signed URL por defecto (inline para iframe o enlace directo)", async () => {
    const { createSignedUrlMock } = configurarMocks();

    const req = new NextRequest(
      `http://localhost:3000/api/admin/documento?path=${encodeURIComponent(RUTA_VALIDA)}`,
    );
    const res = await GET(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe(SIGNED_URL_SIMULADA);

    // Opciones sin download
    expect(createSignedUrlMock).toHaveBeenCalledWith(
      RUTA_VALIDA,
      expect.any(Number),
      undefined,
    );
  });

  it("pasa la opción download sanitizada a Storage cuando descargar=1", async () => {
    const { createSignedUrlMock } = configurarMocks({
      documento: {
        storage_path: RUTA_VALIDA,
        nombre_original: "Plan de Trabajo (Semillero) #1.pdf",
        mime_type: "application/pdf",
      },
    });

    const req = new NextRequest(
      `http://localhost:3000/api/admin/documento?path=${encodeURIComponent(RUTA_VALIDA)}&descargar=1`,
    );
    const res = await GET(req);

    expect(res.status).toBe(307);
    expect(createSignedUrlMock).toHaveBeenCalledWith(
      RUTA_VALIDA,
      expect.any(Number),
      {
        download: "plan_de_trabajo__semillero___1.pdf",
      },
    );
  });

  it("retorna JSON con signedUrl cuando formato=json", async () => {
    configurarMocks({
      documento: {
        storage_path: RUTA_VALIDA,
        nombre_original: "Aval.pdf",
        mime_type: "application/pdf",
      },
      signedUrl: "https://supabase.co/firmada.pdf",
    });

    const req = new NextRequest(
      `http://localhost:3000/api/admin/documento?path=${encodeURIComponent(RUTA_VALIDA)}&formato=json`,
    );
    const res = await GET(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({
      success: true,
      signedUrl: "https://supabase.co/firmada.pdf",
      nombreOriginal: "Aval.pdf",
      mimeType: "application/pdf",
    });
  });

  it("rechaza con 400 si el parámetro path excede la longitud máxima de 200 caracteres", async () => {
    configurarMocks();

    const rutaLarga = `carpeta/${"a".repeat(200)}.pdf`;
    const req = new NextRequest(
      `http://localhost:3000/api/admin/documento?path=${encodeURIComponent(rutaLarga)}`,
    );
    const res = await GET(req);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Ruta de documento inválida");
  });

  it("no activa la opción download cuando descargar tiene un valor diferente a '1'", async () => {
    const { createSignedUrlMock } = configurarMocks();

    const req = new NextRequest(
      `http://localhost:3000/api/admin/documento?path=${encodeURIComponent(RUTA_VALIDA)}&descargar=0`,
    );
    const res = await GET(req);

    expect(res.status).toBe(307);
    expect(createSignedUrlMock).toHaveBeenCalledWith(
      RUTA_VALIDA,
      expect.any(Number),
      undefined,
    );
  });

  it("retorna 500 con mensaje de error interno si ocurre una excepción inesperada no controlada", async () => {
    vi.mocked(getAdminSupabaseClient).mockImplementation(() => {
      throw new Error("Falla catastrófica simulada");
    });

    const req = new NextRequest(
      `http://localhost:3000/api/admin/documento?path=${encodeURIComponent(RUTA_VALIDA)}`,
    );
    const res = await GET(req);

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Error interno del servidor");
  });
});
