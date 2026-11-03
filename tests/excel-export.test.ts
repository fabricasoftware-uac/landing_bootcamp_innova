import ExcelJS from "exceljs";
import { describe, expect, it } from "vitest";
import type { PostulacionAdminDetalle } from "@/app/actions/admin";
import {
  COLUMNAS_EQUIPOS,
  COLUMNAS_EVALUACION,
  COLUMNAS_INTEGRANTES,
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
        nombres_apellidos: "Estudiante Uno",
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
        nombres_apellidos: "Estudiante Dos",
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
        nombres_apellidos: "Estudiante Tres",
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
  ];

  it("crea un libro de Excel con exactamente las 3 hojas requeridas", () => {
    const workbook = construirWorkbookPostulaciones(postulacionesMock);
    const nombresHojas = workbook.worksheets.map((ws) => ws.name);

    expect(nombresHojas).toHaveLength(3);
    expect(nombresHojas).toEqual([
      HOJAS_EXCEL.EQUIPOS,
      HOJAS_EXCEL.INTEGRANTES,
      HOJAS_EXCEL.EVALUACION,
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

  it("garantiza que la Hoja 3 'Matriz de Evaluación' contiene las columnas exactas", () => {
    const workbook = construirWorkbookPostulaciones(postulacionesMock);
    const hoja3 = workbook.getWorksheet(HOJAS_EXCEL.EVALUACION);
    expect(hoja3).toBeDefined();

    const headers: string[] = [];
    hoja3?.getRow(1).eachCell((cell) => {
      headers.push(String(cell.value));
    });

    expect(headers).toEqual([...COLUMNAS_EVALUACION]);
  });

  it("aplica los estilos institucionales (Navy Fill #FF10384F y fuente blanca) en cabeceras", () => {
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

  it("rellena las filas de datos con los cálculos y mapeos esperados", () => {
    const workbook = construirWorkbookPostulaciones(postulacionesMock);

    // Hoja 1: 2 postulaciones -> 2 filas de datos (filas 2 y 3)
    const hoja1 = workbook.getWorksheet(HOJAS_EXCEL.EQUIPOS);
    expect(hoja1?.rowCount).toBe(3);

    const fila1 = hoja1?.getRow(2);
    expect(fila1?.getCell("radicado").value).toBe("INNOVA-2026-0001");
    expect(fila1?.getCell("estado").value).toBe("HABILITADO");
    expect(fila1?.getCell("tipo_institucion").value).toBe(
      "Básica y Media (Colegio)",
    );
    // Puntaje evaluado: 28 + 27 + 18 + 19 = 92
    expect(fila1?.getCell("puntaje_total").value).toBe(92);

    const fila2 = hoja1?.getRow(3);
    expect(fila2?.getCell("radicado").value).toBe("INNOVA-2026-0002");
    expect(fila2?.getCell("tipo_institucion").value).toBe("Educación Superior");
    expect(fila2?.getCell("puntaje_total").value).toBe("Sin evaluar");

    // Hoja 2: 2 equipos x 3 integrantes = 6 filas de integrantes (+1 cabecera = 7)
    const hoja2 = workbook.getWorksheet(HOJAS_EXCEL.INTEGRANTES);
    expect(hoja2?.rowCount).toBe(7);

    // Verificar indicador de menor de edad
    const int1Fila = hoja2?.getRow(2);
    expect(int1Fila?.getCell("es_menor").value).toBe("SÍ (Menor de edad)");

    const int3Fila = hoja2?.getRow(4);
    expect(int3Fila?.getCell("es_menor").value).toBe("NO (Mayor de edad)");

    // Hoja 3: Matriz de evaluación
    const hoja3 = workbook.getWorksheet(HOJAS_EXCEL.EVALUACION);
    expect(hoja3?.rowCount).toBe(3);

    const evalFila1 = hoja3?.getRow(2);
    expect(evalFila1?.getCell("habilitante").value).toBe("Habilitado");
    expect(evalFila1?.getCell("total").value).toBe(92);

    const evalFila2 = hoja3?.getRow(3);
    expect(evalFila2?.getCell("habilitante").value).toBe("Pendiente");
    expect(evalFila2?.getCell("total").value).toBe("—");
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
    ]);

    const hojaEquipos = workbookLeido.getWorksheet(HOJAS_EXCEL.EQUIPOS);
    expect(hojaEquipos?.getCell("A2").value).toBe("INNOVA-2026-0001");
  });
});
