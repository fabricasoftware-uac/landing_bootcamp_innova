import { describe, expect, it, vi } from "vitest";

const { mockGetAdminSupabaseClient } = vi.hoisted(() => ({
  mockGetAdminSupabaseClient: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Headers()),
}));
vi.mock("@/lib/supabase/admin", () => ({
  getAdminSupabaseClient: mockGetAdminSupabaseClient,
  createAdminClient: vi.fn(),
}));

import { crearPostulacionAction } from "@/app/actions/postulaciones";
import { metadata as postulacionMetadata } from "@/app/postulacion/page";
import { ESTADO_CONVOCATORIA } from "@/lib/config/convocatoria";

describe("Estado de convocatoria y control de postulaciones", () => {
  it("la configuración de convocatoria define estado de inscripciones cerradas por cupos agotados", () => {
    expect(ESTADO_CONVOCATORIA.abierta).toBe(false);
    expect(ESTADO_CONVOCATORIA.motivo).toBe("cupos_agotados");
    expect(ESTADO_CONVOCATORIA.badge).toBe("Cupos agotados");
    expect(ESTADO_CONVOCATORIA.tituloCierre).toContain(
      "Inscripciones cerradas",
    );
    expect(ESTADO_CONVOCATORIA.mensajeCierre).toContain("cupos disponibles");
    expect(ESTADO_CONVOCATORIA.cronograma.length).toBeGreaterThan(0);
  });

  it("el cronograma contiene estructura válida con hitos y estados reconocidos", () => {
    const estadosValidos = ["completado", "en_proceso", "pendiente"];
    for (const item of ESTADO_CONVOCATORIA.cronograma) {
      expect(item.hito).toBeTruthy();
      expect(item.fecha).toBeTruthy();
      expect(estadosValidos).toContain(item.estado);
    }
  });

  it("crearPostulacionAction bloquea inmediatamente cualquier intento si la convocatoria está cerrada sin tocar BD", async () => {
    mockGetAdminSupabaseClient.mockClear();

    const formData = new FormData();
    formData.append(
      "datos",
      JSON.stringify({ institucion_nombre: "Colegio Test" }),
    );

    const resultado = await crearPostulacionAction(formData);

    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      expect(resultado.error).toBe(ESTADO_CONVOCATORIA.mensajeCierre);
    }
    // Asegurar que nunca se instanció el cliente de base de datos
    expect(mockGetAdminSupabaseClient).not.toHaveBeenCalled();
  });

  it("la metadata de la página de postulación refleja el estado de cierre", () => {
    expect(postulacionMetadata.title).toContain(
      ESTADO_CONVOCATORIA.tituloCierre,
    );
    expect(postulacionMetadata.description).toBe(
      ESTADO_CONVOCATORIA.mensajeCierre,
    );
    expect(postulacionMetadata.openGraph?.title).toContain(
      ESTADO_CONVOCATORIA.tituloCierre,
    );
    expect(postulacionMetadata.openGraph?.description).toBe(
      ESTADO_CONVOCATORIA.mensajeCierre,
    );
  });
});
