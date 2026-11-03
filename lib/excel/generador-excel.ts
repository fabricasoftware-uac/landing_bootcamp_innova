import ExcelJS from "exceljs";
import type { PostulacionAdminDetalle } from "@/app/actions/admin";

export interface GeneracionExcelResultado {
  workbook: ExcelJS.Workbook;
  buffer: ExcelJS.Buffer;
  base64: string;
  nombreArchivo: string;
}

export const HOJAS_EXCEL = {
  EQUIPOS: "Equipos y Semilleros",
  INTEGRANTES: "Base de Integrantes",
  EVALUACION: "Matriz de Evaluación",
} as const;

export const COLUMNAS_EQUIPOS = [
  "Radicado Oficial",
  "Estado",
  "Nivel Formativo",
  "Institución Educativa",
  "Semillero de Investigación",
  "Docente Tutor / Asesor",
  "Correo Tutor",
  "Teléfono Tutor",
  "Puntaje Total",
  "Fecha Inscripción",
] as const;

export const COLUMNAS_INTEGRANTES = [
  "Radicado",
  "Semillero",
  "Orden",
  "Nombres y Apellidos",
  "Tipo Doc.",
  "Número Documento",
  "Correo Electrónico",
  "Teléfono",
  "¿Es Menor de Edad?",
] as const;

export const COLUMNAS_EVALUACION = [
  "Radicado",
  "Semillero",
  "Habilitante",
  "Motivación (/30)",
  "Pertinencia (/30)",
  "Diversidad (/20)",
  "Representación (/20)",
  "Puntaje Total (/100)",
  "Observaciones del Comité",
  "Fecha Evaluación",
] as const;

/**
 * Construye el objeto Workbook de ExcelJS con las tres hojas oficiales requeridas para Cauca INNOVA:
 * 1. "Equipos y Semilleros"
 * 2. "Base de Integrantes"
 * 3. "Matriz de Evaluación"
 */
export function construirWorkbookPostulaciones(
  postulaciones: PostulacionAdminDetalle[],
): ExcelJS.Workbook {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Cauca INNOVA - Gobernación del Cauca";
  workbook.created = new Date();

  const navyFill: ExcelJS.Fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF10384F" }, // #10384f
  };

  const headerFont: Partial<ExcelJS.Font> = {
    name: "Arial",
    size: 11,
    bold: true,
    color: { argb: "FFFFFFFF" },
  };

  const borderThin: Partial<ExcelJS.Borders> = {
    top: { style: "thin", color: { argb: "FFE0E0E0" } },
    bottom: { style: "thin", color: { argb: "FFE0E0E0" } },
    left: { style: "thin", color: { argb: "FFE0E0E0" } },
    right: { style: "thin", color: { argb: "FFE0E0E0" } },
  };

  // --------------------------------------------------------------------------
  // HOJA 1: EQUIPOS Y SEMILLEROS
  // --------------------------------------------------------------------------
  const hoja1 = workbook.addWorksheet(HOJAS_EXCEL.EQUIPOS, {
    views: [{ showGridLines: true }],
  });

  hoja1.columns = [
    { header: "Radicado Oficial", key: "radicado", width: 20 },
    { header: "Estado", key: "estado", width: 16 },
    { header: "Nivel Formativo", key: "tipo_institucion", width: 22 },
    { header: "Institución Educativa", key: "institucion", width: 38 },
    { header: "Semillero de Investigación", key: "semillero", width: 38 },
    { header: "Docente Tutor / Asesor", key: "tutor_nombre", width: 30 },
    { header: "Correo Tutor", key: "tutor_email", width: 30 },
    { header: "Teléfono Tutor", key: "tutor_telefono", width: 18 },
    { header: "Puntaje Total", key: "puntaje_total", width: 15 },
    { header: "Fecha Inscripción", key: "fecha_registro", width: 20 },
  ];

  const filaEncabezado1 = hoja1.getRow(1);
  filaEncabezado1.height = 26;
  for (let c = 1; c <= hoja1.columns.length; c++) {
    const celda = filaEncabezado1.getCell(c);
    celda.fill = navyFill;
    celda.font = headerFont;
    celda.alignment = { vertical: "middle", horizontal: "center" };
  }

  for (const post of postulaciones) {
    const puntaje = post.evaluaciones
      ? post.evaluaciones.puntaje_motivacion +
        post.evaluaciones.puntaje_pertinencia +
        post.evaluaciones.puntaje_diversidad +
        post.evaluaciones.puntaje_representacion
      : "Sin evaluar";

    const fila = hoja1.addRow({
      radicado: post.radicado_codigo,
      estado: post.estado.toUpperCase(),
      tipo_institucion:
        post.institucion_tipo === "basica_media"
          ? "Básica y Media (Colegio)"
          : "Educación Superior",
      institucion: post.institucion_nombre,
      semillero: post.semillero_nombre,
      tutor_nombre: post.tutor_nombre,
      tutor_email: post.tutor_email,
      tutor_telefono: post.tutor_telefono,
      puntaje_total: puntaje,
      fecha_registro: new Date(post.created_at).toLocaleDateString("es-CO"),
    });

    fila.height = 20;
    for (let c = 1; c <= hoja1.columns.length; c++) {
      const celda = fila.getCell(c);
      celda.border = borderThin;
      celda.alignment = { vertical: "middle" };
    }
  }

  // --------------------------------------------------------------------------
  // HOJA 2: BASE DE INTEGRANTES
  // --------------------------------------------------------------------------
  const hoja2 = workbook.addWorksheet(HOJAS_EXCEL.INTEGRANTES, {
    views: [{ showGridLines: true }],
  });

  hoja2.columns = [
    { header: "Radicado", key: "radicado", width: 18 },
    { header: "Semillero", key: "semillero", width: 32 },
    { header: "Orden", key: "orden", width: 10 },
    { header: "Nombres y Apellidos", key: "nombres", width: 34 },
    { header: "Tipo Doc.", key: "tipo_doc", width: 12 },
    { header: "Número Documento", key: "num_doc", width: 20 },
    { header: "Correo Electrónico", key: "correo", width: 32 },
    { header: "Teléfono", key: "telefono", width: 18 },
    { header: "¿Es Menor de Edad?", key: "es_menor", width: 20 },
  ];

  const filaEncabezado2 = hoja2.getRow(1);
  filaEncabezado2.height = 26;
  for (let c = 1; c <= hoja2.columns.length; c++) {
    const celda = filaEncabezado2.getCell(c);
    celda.fill = navyFill;
    celda.font = headerFont;
    celda.alignment = { vertical: "middle", horizontal: "center" };
  }

  for (const post of postulaciones) {
    for (const integrante of post.integrantes) {
      const fila = hoja2.addRow({
        radicado: post.radicado_codigo,
        semillero: post.semillero_nombre,
        orden: integrante.orden_integrante,
        nombres: integrante.nombres_apellidos,
        tipo_doc: integrante.tipo_documento,
        num_doc: integrante.numero_documento,
        correo: integrante.correo_electronico,
        telefono: integrante.telefono,
        es_menor: integrante.es_menor_edad
          ? "SÍ (Menor de edad)"
          : "NO (Mayor de edad)",
      });

      fila.height = 20;
      for (let c = 1; c <= hoja2.columns.length; c++) {
        const celda = fila.getCell(c);
        celda.border = borderThin;
        celda.alignment = { vertical: "middle" };
      }
    }
  }

  // --------------------------------------------------------------------------
  // HOJA 3: MATRIZ DE EVALUACIÓN
  // --------------------------------------------------------------------------
  const hoja3 = workbook.addWorksheet(HOJAS_EXCEL.EVALUACION, {
    views: [{ showGridLines: true }],
  });

  hoja3.columns = [
    { header: "Radicado", key: "radicado", width: 18 },
    { header: "Semillero", key: "semillero", width: 32 },
    { header: "Habilitante", key: "habilitante", width: 14 },
    { header: "Motivación (/30)", key: "motivacion", width: 18 },
    { header: "Pertinencia (/30)", key: "pertinencia", width: 18 },
    { header: "Diversidad (/20)", key: "diversidad", width: 18 },
    { header: "Representación (/20)", key: "representacion", width: 22 },
    { header: "Puntaje Total (/100)", key: "total", width: 20 },
    { header: "Observaciones del Comité", key: "observaciones", width: 45 },
    { header: "Fecha Evaluación", key: "fecha_eval", width: 20 },
  ];

  const filaEncabezado3 = hoja3.getRow(1);
  filaEncabezado3.height = 26;
  for (let c = 1; c <= hoja3.columns.length; c++) {
    const celda = filaEncabezado3.getCell(c);
    celda.fill = navyFill;
    celda.font = headerFont;
    celda.alignment = { vertical: "middle", horizontal: "center" };
  }

  for (const post of postulaciones) {
    const ev = post.evaluaciones;
    const totalPuntos = ev
      ? ev.puntaje_motivacion +
        ev.puntaje_pertinencia +
        ev.puntaje_diversidad +
        ev.puntaje_representacion
      : null;

    const fila = hoja3.addRow({
      radicado: post.radicado_codigo,
      semillero: post.semillero_nombre,
      habilitante: ev
        ? ev.cumple_requisitos_habilitante
          ? "Habilitado"
          : "No Habilitado"
        : "Pendiente",
      motivacion: ev ? ev.puntaje_motivacion : "—",
      pertinencia: ev ? ev.puntaje_pertinencia : "—",
      diversidad: ev ? ev.puntaje_diversidad : "—",
      representacion: ev ? ev.puntaje_representacion : "—",
      total: totalPuntos !== null ? totalPuntos : "—",
      observaciones: ev?.observaciones || "Sin observaciones",
      fecha_eval: ev
        ? new Date(ev.evaluado_el).toLocaleDateString("es-CO")
        : "Pendiente",
    });

    fila.height = 20;
    for (let c = 1; c <= hoja3.columns.length; c++) {
      const celda = fila.getCell(c);
      celda.border = borderThin;
      celda.alignment = { vertical: "middle" };
    }
  }

  return workbook;
}

/**
 * Genera el archivo Excel binario y base64 a partir de la lista de postulaciones.
 */
export async function generarExcelPostulaciones(
  postulaciones: PostulacionAdminDetalle[],
): Promise<GeneracionExcelResultado> {
  const workbook = construirWorkbookPostulaciones(postulaciones);
  const buffer = await workbook.xlsx.writeBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  const fechaStr = new Date().toISOString().split("T")[0];
  const nombreArchivo = `Cauca_INNOVA_Postulaciones_${fechaStr}.xlsx`;

  return {
    workbook,
    buffer,
    base64,
    nombreArchivo,
  };
}
