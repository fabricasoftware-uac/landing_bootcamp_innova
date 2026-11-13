import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";
import type { PostulacionAdminDetalle } from "@/app/actions/admin";
import {
  generarPdfSeleccionados,
  sanitizarTextoPdf,
} from "@/lib/pdf/generador-pdf-seleccionados";

function crearSeleccionadoMock(params: {
  id: string;
  radicado: string;
  semillero: string;
  institucion: string;
  tipoInst: "basica_media" | "superior";
  puntajes: [number, number, number, number]; // mot, per, div, rep
  menores: [boolean, boolean, boolean];
}): PostulacionAdminDetalle {
  return {
    id: params.id,
    radicado_codigo: params.radicado,
    institucion_nombre: params.institucion,
    institucion_tipo: params.tipoInst,
    semillero_nombre: params.semillero,
    tutor_nombre: "Docente Tutor Test",
    tutor_email: "tutor@test.edu.co",
    tutor_telefono: "3110000000",
    motivacion_intereses: "Interés en robótica y agro.",
    estado: "seleccionado",
    created_at: "2026-11-10T10:00:00.000Z",
    updated_at: "2026-11-10T10:00:00.000Z",
    integrantes: [
      {
        id: `int-${params.id}-1`,
        postulacion_id: params.id,
        orden_integrante: 1,
        nombres_apellidos: `Estudiante ${params.id} 1`,
        tipo_documento: "TI",
        numero_documento: "1000001",
        correo_electronico: "est1@test.com",
        telefono: "3000001",
        es_menor_edad: params.menores[0],
        created_at: "2026-11-10T10:00:00.000Z",
        updated_at: "2026-11-10T10:00:00.000Z",
      },
      {
        id: `int-${params.id}-2`,
        postulacion_id: params.id,
        orden_integrante: 2,
        nombres_apellidos: `Estudiante ${params.id} 2`,
        tipo_documento: "TI",
        numero_documento: "1000002",
        correo_electronico: "est2@test.com",
        telefono: "3000002",
        es_menor_edad: params.menores[1],
        created_at: "2026-11-10T10:00:00.000Z",
        updated_at: "2026-11-10T10:00:00.000Z",
      },
      {
        id: `int-${params.id}-3`,
        postulacion_id: params.id,
        orden_integrante: 3,
        nombres_apellidos: `Estudiante ${params.id} 3`,
        tipo_documento: "CC",
        numero_documento: "1000003",
        correo_electronico: "est3@test.com",
        telefono: "3000003",
        es_menor_edad: params.menores[2],
        created_at: "2026-11-10T10:00:00.000Z",
        updated_at: "2026-11-10T10:00:00.000Z",
      },
    ],
    documentos_postulacion: [],
    evaluaciones: {
      id: `eval-${params.id}`,
      postulacion_id: params.id,
      cumple_requisitos_habilitante: true,
      puntaje_motivacion: params.puntajes[0],
      puntaje_pertinencia: params.puntajes[1],
      puntaje_diversidad: params.puntajes[2],
      puntaje_representacion: params.puntajes[3],
      observaciones: "Propuesta evaluada por el comité.",
      evaluado_por: null,
      evaluado_el: "2026-11-11T12:00:00.000Z",
      updated_at: "2026-11-11T12:00:00.000Z",
    },
  };
}

describe("Generador de Documento PDF Oficial de Seleccionados (Cauca INNOVA)", () => {
  const lista10Seleccionados: PostulacionAdminDetalle[] = [
    crearSeleccionadoMock({
      id: "p-1",
      radicado: "INNOVA-2026-0018",
      semillero: "Mekatrons",
      institucion: "Normal Superior",
      tipoInst: "basica_media",
      puntajes: [30, 30, 20, 15], // 95
      menores: [true, true, true],
    }),
    crearSeleccionadoMock({
      id: "p-2",
      radicado: "INNOVA-2026-0005",
      semillero: "Emprendelab",
      institucion: "Uniautónoma",
      tipoInst: "superior",
      puntajes: [20, 30, 20, 20], // 90
      menores: [false, false, false],
    }),
    crearSeleccionadoMock({
      id: "p-3",
      radicado: "INNOVA-2026-0010",
      semillero: "Aeroespacial",
      institucion: "Unicauca",
      tipoInst: "superior",
      puntajes: [30, 25, 15, 20], // 90
      menores: [false, false, false],
    }),
    crearSeleccionadoMock({
      id: "p-4",
      radicado: "INNOVA-2026-0016",
      semillero: "Robótica Unicomfacauca",
      institucion: "Unicomfacauca",
      tipoInst: "superior",
      puntajes: [30, 30, 10, 20], // 90
      menores: [false, false, false],
    }),
    crearSeleccionadoMock({
      id: "p-5",
      radicado: "INNOVA-2026-0006",
      semillero: "SEMADS",
      institucion: "Uniautónoma",
      tipoInst: "superior",
      puntajes: [30, 20, 19, 20], // 89
      menores: [false, false, false],
    }),
    crearSeleccionadoMock({
      id: "p-6",
      radicado: "INNOVA-2026-0019",
      semillero: "CLA Inventores",
      institucion: "Colegio Los Andes",
      tipoInst: "basica_media",
      puntajes: [30, 30, 15, 10], // 85
      menores: [true, true, true],
    }),
    crearSeleccionadoMock({
      id: "p-7",
      radicado: "INNOVA-2026-0003",
      semillero: "NOVA",
      institucion: "INEM",
      tipoInst: "basica_media",
      puntajes: [20, 30, 15, 15], // 80
      menores: [true, true, true],
    }),
    crearSeleccionadoMock({
      id: "p-8",
      radicado: "INNOVA-2026-0014",
      semillero: "SIE2",
      institucion: "FUP",
      tipoInst: "superior",
      puntajes: [25, 25, 10, 20], // 80
      menores: [false, false, false],
    }),
    crearSeleccionadoMock({
      id: "p-9",
      radicado: "INNOVA-2026-0015",
      semillero: "SENAUTRONIC",
      institucion: "SENA",
      tipoInst: "superior",
      puntajes: [20, 30, 15, 15], // 80
      menores: [true, true, true],
    }),
    crearSeleccionadoMock({
      id: "p-10",
      radicado: "INNOVA-2026-0004",
      semillero: "CREALAB",
      institucion: "Colegio Cesco",
      tipoInst: "basica_media",
      puntajes: [23, 25, 15, 15], // 78
      menores: [true, false, false],
    }),
  ];

  it("genera un documento PDF válido de exactamente 4 páginas", async () => {
    const res = await generarPdfSeleccionados(lista10Seleccionados);

    expect(res).toBeDefined();
    expect(res.buffer).toBeInstanceOf(Buffer);
    expect(res.buffer.length).toBeGreaterThan(5000);
    expect(res.base64).toBeDefined();
    expect(res.nombreArchivo).toMatch(
      /^Cauca_INNOVA_Seleccionados_\d{4}-\d{2}-\d{2}\.pdf$/,
    );

    // Cargar y validar mediante pdf-lib
    const pdfDoc = await PDFDocument.load(res.buffer);
    expect(pdfDoc.getPageCount()).toBe(4);

    // Todas las páginas deben tener tamaño A4 estándar
    for (let i = 0; i < 4; i++) {
      const page = pdfDoc.getPage(i);
      expect(page.getWidth()).toBeCloseTo(595.28, 1);
      expect(page.getHeight()).toBeCloseTo(841.89, 1);
    }
  });

  it("filtra únicamente los registros en estado seleccionado descartando no habilitados o pendientes", async () => {
    const mezcla: (PostulacionAdminDetalle | Record<string, unknown>)[] = [
      ...lista10Seleccionados,
      {
        id: "p-descartada",
        radicado_codigo: "INNOVA-2026-0099",
        estado: "no_habilitado",
        semillero_nombre: "Semillero Descartado",
        evaluaciones: {
          puntaje_motivacion: 10,
          puntaje_pertinencia: 10,
          puntaje_diversidad: 10,
          puntaje_representacion: 10,
        },
      },
    ];

    const res = await generarPdfSeleccionados(mezcla);
    const pdfDoc = await PDFDocument.load(res.buffer);
    expect(pdfDoc.getPageCount()).toBe(4);
  });

  it("sanitiza correctamente caracteres de texto para fuentes WinAnsi", () => {
    expect(sanitizarTextoPdf("“Semillero”")).toBe('"Semillero"');
    expect(sanitizarTextoPdf("Línea 1\nLínea 2")).toBe("Línea 1 Línea 2");
    expect(sanitizarTextoPdf("Texto – con guion largo")).toBe(
      "Texto - con guion largo",
    );
  });
});
