import ExcelJS from "exceljs";
import { describe, expect, it } from "vitest";
import type { PostulacionAdminDetalle } from "@/app/actions/admin";
import {
  COLUMNAS_EQUIPOS,
  COLUMNAS_EVALUACION,
  COLUMNAS_INTEGRANTES,
  COLUMNAS_RUBRICA,
  construirWorkbookPostulaciones,
  generarExcelPostulaciones,
  HOJAS_EXCEL,
} from "@/lib/excel/generador-excel";

function crearPostulacionMock(params: {
  id: string;
  radicado: string;
  institucion: string;
  tipoInst: "basica_media" | "superior";
  semillero: string;
  estado: "pendiente" | "habilitado" | "no_habilitado" | "seleccionado";
  tieneEvaluacion: boolean;
  menores: [boolean, boolean, boolean];
}): PostulacionAdminDetalle {
  return {
    id: params.id,
    radicado_codigo: params.radicado,
    institucion_nombre: params.institucion,
    institucion_tipo: params.tipoInst,
    semillero_nombre: params.semillero,
    tutor_nombre: "Prof. Alberto Morales",
    tutor_email: "amorales@institucion.edu.co",
    tutor_telefono: "3118901234",
    motivacion_intereses:
      "Desarrollar soluciones tecnológicas para el agro caucano.",
    estado: params.estado,
    created_at: "2026-10-28T10:00:00.000Z",
    updated_at: "2026-10-28T10:00:00.000Z",
    integrantes: [
      {
        id: `int-${params.id}-1`,
        postulacion_id: params.id,
        orden_integrante: 1,
        nombres_apellidos: `Estudiante ${params.id} 1`,
        tipo_documento: "TI",
        numero_documento: "1061001",
        correo_electronico: "est1@test.com",
        telefono: "3100000001",
        es_menor_edad: params.menores[0],
        created_at: "2026-10-28T10:00:00.000Z",
        updated_at: "2026-10-28T10:00:00.000Z",
      },
      {
        id: `int-${params.id}-2`,
        postulacion_id: params.id,
        orden_integrante: 2,
        nombres_apellidos: `Estudiante ${params.id} 2`,
        tipo_documento: "TI",
        numero_documento: "1061002",
        correo_electronico: "est2@test.com",
        telefono: "3100000002",
        es_menor_edad: params.menores[1],
        created_at: "2026-10-28T10:00:00.000Z",
        updated_at: "2026-10-28T10:00:00.000Z",
      },
      {
        id: `int-${params.id}-3`,
        postulacion_id: params.id,
        orden_integrante: 3,
        nombres_apellidos: `Estudiante ${params.id} 3`,
        tipo_documento: "CC",
        numero_documento: "1061003",
        correo_electronico: "est3@test.com",
        telefono: "3100000003",
        es_menor_edad: params.menores[2],
        created_at: "2026-10-28T10:00:00.000Z",
        updated_at: "2026-10-28T10:00:00.000Z",
      },
    ],
    documentos_postulacion: [
      {
        id: `doc-${params.id}-1`,
        postulacion_id: params.id,
        tipo_documento: "aval_semillero",
        storage_path: "mock/path.pdf",
        nombre_original: "aval.pdf",
        tamano_bytes: 12000,
        mime_type: "application/pdf",
        subido_el: "2026-10-28T10:00:00.000Z",
      },
    ],
    evaluaciones: params.tieneEvaluacion
      ? {
          id: `eval-${params.id}`,
          postulacion_id: params.id,
          cumple_requisitos_habilitante: true,
          puntaje_motivacion: 28,
          puntaje_pertinencia: 27,
          puntaje_diversidad: 18,
          puntaje_representacion: 19,
          observaciones: "Propuesta destacada por su enfoque territorial.",
          evaluado_por: null,
          evaluado_el: "2026-10-28T12:00:00.000Z",
          updated_at: "2026-10-28T12:00:00.000Z",
        }
      : null,
  };
}

describe("Generador de Archivos Excel (.xlsx) para Administración", () => {
  const postulacionesMock: PostulacionAdminDetalle[] = [
    crearPostulacionMock({
      id: "post-1",
      radicado: "INNOVA-2026-0001",
      institucion: "IE Técnico Industrial",
      tipoInst: "basica_media",
      semillero: "Robótica y Futuro",
      estado: "habilitado",
      tieneEvaluacion: true,
      menores: [true, true, false],
    }),
    crearPostulacionMock({
      id: "post-2",
      radicado: "INNOVA-2026-0002",
      institucion: "Universidad del Cauca",
      tipoInst: "superior",
      semillero: "Inteligencia Artificial Aplicada",
      estado: "pendiente",
      tieneEvaluacion: false,
      menores: [false, false, false],
    }),
    crearPostulacionMock({
      id: "post-3",
      radicado: "INNOVA-2026-0003",
      institucion: "Corporación Universitaria Autónoma del Cauca",
      tipoInst: "superior",
      semillero: "Emprendelab",
      estado: "seleccionado",
      tieneEvaluacion: true,
      menores: [false, false, false],
    }),
  ];

  it("crea un libro de Excel con exactamente las 4 hojas requeridas", () => {
    const workbook = construirWorkbookPostulaciones(postulacionesMock);
    const nombresHojas = workbook.worksheets.map((ws) => ws.name);

    expect(nombresHojas).toHaveLength(4);
    expect(nombresHojas).toEqual([
      HOJAS_EXCEL.EQUIPOS,
      HOJAS_EXCEL.INTEGRANTES,
      HOJAS_EXCEL.EVALUACION,
      HOJAS_EXCEL.RUBRICA,
    ]);
  });

  it("garantiza que la Hoja 1 'Equipos y Semilleros' contiene las columnas exactas", () => {
    const workbook = construirWorkbookPostulaciones(postulacionesMock);
    const hoja1 = workbook.getWorksheet(HOJAS_EXCEL.EQUIPOS);
    expect(hoja1).toBeDefined();

    const filaEncabezados = hoja1?.getRow(1);
    const headers: string[] = [];
    filaEncabezados?.eachCell((cell) => {
      headers.push(String(cell.value));
    });

    expect(headers).toEqual([...COLUMNAS_EQUIPOS]);
  });

  it("garantiza que la Hoja 2 'Base de Integrantes' contiene las columnas exactas", () => {
    const workbook = construirWorkbookPostulaciones(postulacionesMock);
    const hoja2 = workbook.getWorksheet(HOJAS_EXCEL.INTEGRANTES);
    expect(hoja2).toBeDefined();

    const headers: string[] = [];
    hoja2?.getRow(1).eachCell((cell) => {
      headers.push(String(cell.value));
    });

    expect(headers).toEqual([...COLUMNAS_INTEGRANTES]);
  });

  it("garantiza que la Hoja 3 'Matriz de Evaluación' contiene las columnas exactas enriquecidas", () => {
    const workbook = construirWorkbookPostulaciones(postulacionesMock);
    const hoja3 = workbook.getWorksheet(HOJAS_EXCEL.EVALUACION);
    expect(hoja3).toBeDefined();

    const headers: string[] = [];
    hoja3?.getRow(1).eachCell((cell) => {
      headers.push(String(cell.value));
    });

    expect(headers).toEqual([...COLUMNAS_EVALUACION]);
  });

  it("garantiza que la Hoja 4 'Rúbrica de Evaluación' contiene las columnas oficiales", () => {
    const workbook = construirWorkbookPostulaciones(postulacionesMock);
    const hoja4 = workbook.getWorksheet(HOJAS_EXCEL.RUBRICA);
    expect(hoja4).toBeDefined();

    const headers: string[] = [];
    hoja4?.getRow(1).eachCell((cell) => {
      headers.push(String(cell.value));
    });

    expect(headers).toEqual([...COLUMNAS_RUBRICA]);
    // Debe contener las 4 filas de criterios más la fila resumen
    expect(hoja4?.rowCount).toBeGreaterThanOrEqual(5);
  });

  it("aplica los estilos institucionales (Navy Fill #FF10384F y fuente blanca) en cabeceras de las 4 hojas", () => {
    const workbook = construirWorkbookPostulaciones(postulacionesMock);
    for (const nombreHoja of Object.values(HOJAS_EXCEL)) {
      const hoja = workbook.getWorksheet(nombreHoja);
      const celda1 = hoja?.getRow(1).getCell(1);

      expect(celda1?.fill).toMatchObject({
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF10384F" },
      });
      expect(celda1?.font?.color).toMatchObject({
        argb: "FFFFFFFF",
      });
      expect(celda1?.font?.bold).toBe(true);
    }
  });

  it("ubica a los clasificados (seleccionados) de primeros en todas las hojas y aplica resaltado verde institucional", () => {
    const workbook = construirWorkbookPostulaciones(postulacionesMock);

    // Hoja 1: El seleccionado (post-3) debe ser la fila 2 (primer dato)
    const hoja1 = workbook.getWorksheet(HOJAS_EXCEL.EQUIPOS);
    expect(hoja1?.rowCount).toBe(4);

    const fila1 = hoja1?.getRow(2);
    expect(fila1?.getCell("radicado").value).toBe("INNOVA-2026-0003");
    expect(fila1?.getCell("estado").value).toBe("SELECCIONADO");
    expect(fila1?.getCell("semillero").value).toBe("Emprendelab");
    expect(fila1?.getCell("radicado").fill).toMatchObject({
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE8F5E9" },
    });

    // Fila 2 es el habilitado con puntaje
    const fila2 = hoja1?.getRow(3);
    expect(fila2?.getCell("radicado").value).toBe("INNOVA-2026-0001");
    expect(fila2?.getCell("estado").value).toBe("HABILITADO");

    // Fila 3 es el pendiente sin evaluación
    const fila3 = hoja1?.getRow(4);
    expect(fila3?.getCell("radicado").value).toBe("INNOVA-2026-0002");
    expect(fila3?.getCell("estado").value).toBe("PENDIENTE");

    // Hoja 2: Los integrantes de post-3 (Emprendelab) deben aparecer de primeros (filas 2, 3, 4)
    const hoja2 = workbook.getWorksheet(HOJAS_EXCEL.INTEGRANTES);
    expect(hoja2?.rowCount).toBe(10); // 1 header + 3x3 integrantes = 10

    const intFila1 = hoja2?.getRow(2);
    expect(intFila1?.getCell("radicado").value).toBe("INNOVA-2026-0003");
    expect(intFila1?.getCell("semillero").value).toBe("Emprendelab");
    expect(intFila1?.getCell("radicado").fill).toMatchObject({
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE8F5E9" },
    });

    // Hoja 3: Matriz de Evaluación tiene a post-3 de primero con clasificación y justificación
    const hoja3 = workbook.getWorksheet(HOJAS_EXCEL.EVALUACION);
    expect(hoja3?.rowCount).toBe(4);

    const evalFila1 = hoja3?.getRow(2);
    expect(evalFila1?.getCell("radicado").value).toBe("INNOVA-2026-0003");
    expect(evalFila1?.getCell("clasificacion").value).toBe(
      "CLASIFICADO AL BOOTCAMP",
    );
    expect(evalFila1?.getCell("habilitante").value).toBe("Habilitado");
    expect(evalFila1?.getCell("total").value).toBe(92);
    expect(String(evalFila1?.getCell("justificacion").value)).toContain(
      "CLASIFICADO OFICIAL",
    );
    expect(evalFila1?.getCell("radicado").fill).toMatchObject({
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE8F5E9" },
    });

    const evalFila2 = hoja3?.getRow(3);
    expect(evalFila2?.getCell("radicado").value).toBe("INNOVA-2026-0001");
    expect(evalFila2?.getCell("clasificacion").value).toBe(
      "HABILITADO (LISTA DE ESPERA)",
    );

    const evalFila3 = hoja3?.getRow(4);
    expect(evalFila3?.getCell("radicado").value).toBe("INNOVA-2026-0002");
    expect(evalFila3?.getCell("clasificacion").value).toBe("EN REVISIÓN");
    expect(evalFila3?.getCell("total").value).toBe("—");
  });

  it("generarExcelPostulaciones produce un buffer XLSX válido que puede ser deserializado", async () => {
    const resultado = await generarExcelPostulaciones(postulacionesMock);

    expect(resultado.buffer).toBeDefined();
    expect(resultado.buffer.byteLength).toBeGreaterThan(0);
    expect(resultado.base64).toBeDefined();
    expect(resultado.nombreArchivo).toMatch(
      /^Cauca_INNOVA_Postulaciones_\d{4}-\d{2}-\d{2}\.xlsx$/,
    );

    // Deserializar el buffer binario en una nueva instancia limpia de ExcelJS
    const workbookLeido = new ExcelJS.Workbook();
    await workbookLeido.xlsx.load(
      resultado.buffer as Parameters<typeof workbookLeido.xlsx.load>[0],
    );

    expect(workbookLeido.worksheets.map((w) => w.name)).toEqual([
      HOJAS_EXCEL.EQUIPOS,
      HOJAS_EXCEL.INTEGRANTES,
      HOJAS_EXCEL.EVALUACION,
      HOJAS_EXCEL.RUBRICA,
    ]);

    const hojaEquipos = workbookLeido.getWorksheet(HOJAS_EXCEL.EQUIPOS);
    // El seleccionado (post-3) debe ser el primero tras el ordenamiento
    expect(hojaEquipos?.getCell("A2").value).toBe("INNOVA-2026-0003");
  });

  it("normaliza evaluaciones tanto si vienen como objeto único o como arreglo (compatibilidad joins)", () => {
    const postBase = postulacionesMock[2];
    if (!postBase) throw new Error("Mock requerido");
    const postConArreglo = {
      ...postBase,
      evaluaciones: [postBase.evaluaciones],
    } as unknown as PostulacionAdminDetalle;

    const wb = construirWorkbookPostulaciones([postConArreglo]);
    const hojaEval = wb.getWorksheet(HOJAS_EXCEL.EVALUACION);
    const fila = hojaEval?.getRow(2);

    expect(fila?.getCell("radicado").value).toBe("INNOVA-2026-0003");
    expect(fila?.getCell("motivacion").value).toBe(28);
    expect(fila?.getCell("pertinencia").value).toBe(27);
    expect(fila?.getCell("diversidad").value).toBe(18);
    expect(fila?.getCell("representacion").value).toBe(19);
    expect(fila?.getCell("total").value).toBe(92);
    expect(fila?.getCell("habilitante").value).toBe("Habilitado");
    expect(fila?.getCell("clasificacion").value).toBe(
      "CLASIFICADO AL BOOTCAMP",
    );
    expect(String(fila?.getCell("justificacion").value)).toContain(
      "CLASIFICADO OFICIAL (92/100 pts",
    );
  });
});
