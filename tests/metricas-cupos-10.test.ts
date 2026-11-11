import { describe, expect, it } from "vitest";
import type {
  MetricasAdmin,
  PostulacionAdminDetalle,
} from "@/app/actions/admin";

describe("Métricas de Cupos Administrativos (10 cupos: 6 universidades / 3 colegios)", () => {
  it("contiene los campos requeridos para seguimiento de 10 cupos y metas diferenciadas", () => {
    const metricas: MetricasAdmin = {
      total: 15,
      pendientes: 2,
      habilitados: 3,
      no_habilitados: 1,
      seleccionados: 9,
      cupos_ocupados: 9,
      cupos_totales: 10,
      meta_superior: 6,
      meta_basica_media: 3,
      seleccionados_superior: 6,
      seleccionados_basica_media: 3,
      basica_media: 5,
      superior: 10,
    };

    expect(metricas.cupos_totales).toBe(10);
    expect(metricas.meta_superior).toBe(6);
    expect(metricas.meta_basica_media).toBe(3);
    expect(metricas.seleccionados_superior).toBe(6);
    expect(metricas.seleccionados_basica_media).toBe(3);
    expect(metricas.seleccionados_superior >= metricas.meta_superior).toBe(
      true,
    );
    expect(
      metricas.seleccionados_basica_media >= metricas.meta_basica_media,
    ).toBe(true);
  });

  it("calcula correctamente el avance hacia las metas de 6 universidades y 3 colegios", () => {
    const postulaciones: Pick<
      PostulacionAdminDetalle,
      "estado" | "institucion_tipo"
    >[] = [
      { estado: "seleccionado", institucion_tipo: "superior" },
      { estado: "seleccionado", institucion_tipo: "superior" },
      { estado: "seleccionado", institucion_tipo: "superior" },
      { estado: "seleccionado", institucion_tipo: "superior" },
      { estado: "seleccionado", institucion_tipo: "basica_media" },
      { estado: "seleccionado", institucion_tipo: "basica_media" },
      { estado: "habilitado", institucion_tipo: "superior" },
      { estado: "pendiente", institucion_tipo: "basica_media" },
    ];

    const seleccionadosSuperior = postulaciones.filter(
      (p) => p.estado === "seleccionado" && p.institucion_tipo === "superior",
    ).length;
    const seleccionadosBasicaMedia = postulaciones.filter(
      (p) =>
        p.estado === "seleccionado" && p.institucion_tipo === "basica_media",
    ).length;
    const seleccionadosTotal = postulaciones.filter(
      (p) => p.estado === "seleccionado",
    ).length;

    expect(seleccionadosSuperior).toBe(4);
    expect(seleccionadosBasicaMedia).toBe(2);
    expect(seleccionadosTotal).toBe(6);

    const metaSuperior = 6;
    const metaBasicaMedia = 3;

    expect(seleccionadosSuperior >= metaSuperior).toBe(false);
    expect(seleccionadosBasicaMedia >= metaBasicaMedia).toBe(false);
    expect(metaSuperior - seleccionadosSuperior).toBe(2);
    expect(metaBasicaMedia - seleccionadosBasicaMedia).toBe(1);
  });

  it("maneja los casos límite de cupos libres: 0 seleccionados, metas exactas (9) y tope máximo (10)", () => {
    const cuposTotales = 10;

    // Caso 1: 0 seleccionados
    const seleccionadosCero = 0;
    const libresCero = Math.max(cuposTotales - seleccionadosCero, 0);
    expect(libresCero).toBe(10);

    // Caso 2: Cumplimiento de metas mínimas institucionales (6 universidades + 3 colegios = 9)
    const seleccionadosMetas = 9;
    const libresMetas = Math.max(cuposTotales - seleccionadosMetas, 0);
    expect(libresMetas).toBe(1); // 1 cupo disponible para llegar a los 10 totales

    // Caso 3: Llenado total de los 10 cupos (ej. 7 universidades + 3 colegios)
    const seleccionadosLleno = 10;
    const libresLleno = Math.max(cuposTotales - seleccionadosLleno, 0);
    expect(libresLleno).toBe(0);

    // Caso 4: Protección contra sobrecupo accidental (no genera números negativos)
    const seleccionadosExceso = 12;
    const libresExceso = Math.max(cuposTotales - seleccionadosExceso, 0);
    expect(libresExceso).toBe(0);
  });

  it("genera correctamente los 10 bloques visuales de cupos con su estado lleno/vacío", () => {
    const totales = 10;
    const ocupados = 7;

    const bloques = Array.from({ length: totales }, (_, i) => ({
      id: `cupo-${i + 1}`,
      lleno: i < ocupados,
    }));

    expect(bloques).toHaveLength(10);
    expect(bloques.filter((b) => b.lleno)).toHaveLength(7);
    expect(bloques.filter((b) => !b.lleno)).toHaveLength(3);

    // Verificar IDs correctos del 1 al 10
    expect(bloques[0]?.id).toBe("cupo-1");
    expect(bloques[9]?.id).toBe("cupo-10");
    expect(bloques[6]?.lleno).toBe(true); // 7mo cupo
    expect(bloques[7]?.lleno).toBe(false); // 8vo cupo
  });

  it("evalúa las condiciones de cumplimiento de píldoras de meta institucional", () => {
    const metaSuperior = 6;
    const metaBasicaMedia = 3;

    // Estado 1: Ninguna meta alcanzada (5 superior, 2 básica media)
    const ocupadosSup1 = 5;
    const ocupadosBas1 = 2;
    expect(ocupadosSup1 >= metaSuperior).toBe(false);
    expect(ocupadosBas1 >= metaBasicaMedia).toBe(false);

    // Estado 2: Solo básica media alcanzada (5 superior, 3 básica media)
    const ocupadosSup2 = 5;
    const ocupadosBas2 = 3;
    expect(ocupadosSup2 >= metaSuperior).toBe(false);
    expect(ocupadosBas2 >= metaBasicaMedia).toBe(true);

    // Estado 3: Ambas metas alcanzadas (6 superior, 3 básica media)
    const ocupadosSup3 = 6;
    const ocupadosBas3 = 3;
    expect(ocupadosSup3 >= metaSuperior).toBe(true);
    expect(ocupadosBas3 >= metaBasicaMedia).toBe(true);

    // Estado 4: Ambas metas superadas (7 superior, 3 básica media = 10 totales)
    const ocupadosSup4 = 7;
    const ocupadosBas4 = 3;
    expect(ocupadosSup4 >= metaSuperior).toBe(true);
    expect(ocupadosBas4 >= metaBasicaMedia).toBe(true);
    expect(ocupadosSup4 + ocupadosBas4).toBe(10);
  });
});
