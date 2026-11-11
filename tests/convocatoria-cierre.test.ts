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
  it("la configuración de convocatoria define estado de inscripciones abiertas y conserva metadatos de cierre", () => {
    expect(ESTADO_CONVOCATORIA.abierta).toBe(true);
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

  it("crearPostulacionAction bloquea inmediatamente cualquier intento si la convocatoria está cerrada", async () => {
    mockGetAdminSupabaseClient.mockClear();
    (ESTADO_CONVOCATORIA as { abierta: boolean }).abierta = false;

    try {
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
    } finally {
      (ESTADO_CONVOCATORIA as { abierta: boolean }).abierta = true;
    }
  });

  it("la metadata de la página de postulación refleja el estado de convocatoria abierta", () => {
    expect(postulacionMetadata.title).toContain("Postula a tu equipo");
    expect(postulacionMetadata.description).toContain(
      "Formulario oficial de postulación",
    );
    expect(postulacionMetadata.openGraph?.title).toContain(
      "Postula a tu equipo",
    );
    expect(postulacionMetadata.openGraph?.description).toContain(
      "Formulario oficial para semilleros",
    );
  });
});
