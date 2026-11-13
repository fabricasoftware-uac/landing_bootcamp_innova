import ExcelJS from "exceljs";
import type { PostulacionAdminDetalle } from "@/app/actions/admin";
import type { PostulacionEstado } from "@/lib/supabase/types";
import { esTelefono } from "@/lib/validations/texto-seguro";

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
  RUBRICA: "Rúbrica de Evaluación",
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
  "Clasificación Final",
  "Habilitante",
  "Motivación e Interés (/30)",
  "Pertinencia Territorial (/30)",
  "Diversidad de Habilidades (/20)",
  "Representación Institucional (/20)",
  "Puntaje Total (/100)",
  "Justificación y Criterio del Resultado",
  "Observaciones del Comité",
  "Fecha Evaluación",
] as const;

export const COLUMNAS_RUBRICA = [
  "Criterio de Evaluación",
  "Ponderación",
  "Qué se Evalúa (Descripción Exhaustiva)",
  "Nivel Sobresaliente (90% - 100%)",
  "Nivel Notable / Aceptable (70% - 89%)",
  "Nivel Insuficiente (< 70%)",
  "Guía Orientadora del Comité Evaluador",
] as const;

// También el ancho completo: Excel y LibreOffice pueden convertirlos al editar la celda.
const INICIO_DE_FORMULA = /^[\s\p{Cc}]*[=+\-@＝＋－＠]/u;
// Excepto \t, \n y \r: el XML de xlsx no admite los demás y corrompen el archivo.
const CONTROLES_NO_XML = /(?![\t\n\r])\p{Cc}/gu;

/**
 * Neutraliza un texto para Excel con un apóstrofo inicial (recomendación de OWASP).
 * Los teléfonos con + se conservan porque no pueden ejecutar ninguna función.
 */
export function neutralizarCelda(valor: string): string {
  const limpio = valor.replace(CONTROLES_NO_XML, "");
  if (esTelefono(limpio.trim())) return limpio;
  return INICIO_DE_FORMULA.test(limpio) ? `'${limpio}` : limpio;
}

/** Barre la hoja entera para que una columna nueva quede cubierta sin recordarlo. */
function neutralizarHoja(hoja: ExcelJS.Worksheet): void {
  hoja.eachRow((fila, numeroFila) => {
    if (numeroFila === 1) return;
    fila.eachCell((celda) => {
      if (typeof celda.value === "string") {
        celda.value = neutralizarCelda(celda.value);
      }
    });
  });
}

/** Calcula el puntaje numérico total o -1 si no tiene evaluación registrada */
function calcularPuntajeTotal(post: PostulacionAdminDetalle): number {
  if (!post.evaluaciones) return -1;
  return (
    (post.evaluaciones.puntaje_motivacion || 0) +
    (post.evaluaciones.puntaje_pertinencia || 0) +
    (post.evaluaciones.puntaje_diversidad || 0) +
    (post.evaluaciones.puntaje_representacion || 0)
  );
}

/** Convierte el estado interno en la etiqueta de clasificación final para comités */
function obtenerClasificacionFinal(estado: PostulacionEstado): string {
  switch (estado) {
    case "seleccionado":
      return "CLASIFICADO AL BOOTCAMP";
    case "habilitado":
      return "HABILITADO (LISTA DE ESPERA)";
    case "no_habilitado":
      return "NO HABILITADO";
    case "pendiente":
      return "EN REVISIÓN";
    default:
      return String(estado).toUpperCase();
  }
}

/** Genera la explicación detallada y motivada del resultado del equipo según la rúbrica */
function generarJustificacionEvaluacion(post: PostulacionAdminDetalle): string {
  const ev = post.evaluaciones;
  const nivel =
    post.institucion_tipo === "basica_media"
      ? "Básica y Media (Colegio)"
      : "Educación Superior";

  if (!ev) {
    return "Postulación registrada en plataforma, pendiente de asignación y deliberación de puntaje por el comité técnico evaluador.";
  }

  const total =
    ev.puntaje_motivacion +
    ev.puntaje_pertinencia +
    ev.puntaje_diversidad +
    ev.puntaje_representacion;

  if (!ev.cumple_requisitos_habilitante || post.estado === "no_habilitado") {
    return `No cumple con la totalidad de requisitos habilitantes obligatorios o documentos reglamentarios requeridos por los términos de referencia (aval institucional o autorizaciones completas).`;
  }

  if (post.estado === "seleccionado") {
    return `CLASIFICADO OFICIAL (${total}/100 pts - ${nivel}). Cumple requisitos habilitantes y aval institucional. Calificación por rúbrica: Motivación e Interés ${ev.puntaje_motivacion}/30, Pertinencia Territorial Caucana ${ev.puntaje_pertinencia}/30, Diversidad de Habilidades ${ev.puntaje_diversidad}/20, Representación Institucional ${ev.puntaje_representacion}/20. Asignado dentro de los cupos oficiales del Bootcamp Cauca INNOVA.`;
  }

  if (post.estado === "habilitado") {
    return `HABILITADO EN LISTA DE ESPERA (${total}/100 pts - ${nivel}). Cumple plenamente requisitos habilitantes. Calificación por rúbrica: Motivación ${ev.puntaje_motivacion}/30, Pertinencia Caucana ${ev.puntaje_pertinencia}/30, Diversidad ${ev.puntaje_diversidad}/20, Representación ${ev.puntaje_representacion}/20. Elegible por orden de mérito en caso de liberación de cupo en su categoría.`;
  }

  return `En deliberación técnica (${total}/100 pts). Motivación: ${ev.puntaje_motivacion}/30, Pertinencia: ${ev.puntaje_pertinencia}/30, Diversidad: ${ev.puntaje_diversidad}/20, Representación: ${ev.puntaje_representacion}/20.`;
}

/**
 * Construye el objeto Workbook de ExcelJS con las cuatro hojas oficiales requeridas para Cauca INNOVA:
 * 1. "Equipos y Semilleros" (Clasificados de primeros)
 * 2. "Base de Integrantes" (Integrantes de clasificados de primeros)
 * 3. "Matriz de Evaluación" (Clasificados de primeros con rúbrica detallada y justificación)
 * 4. "Rúbrica de Evaluación" (Criterios oficiales, ponderaciones y descriptores de desempeño)
 */
export function construirWorkbookPostulaciones(
  postulaciones: PostulacionAdminDetalle[],
): ExcelJS.Workbook {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Cauca INNOVA - Gobernación del Cauca";
  workbook.created = new Date();

  // 1. ORDENAMIENTO REQUERIDO:
  // - Clasificados (estado === "seleccionado") de primero
  // - Secundario: Puntaje total evaluado descendente
  // - Terciario: Radicado oficial ascendente
  const postulacionesOrdenadas = [...postulaciones].sort((a, b) => {
    const aEsSeleccionado = a.estado === "seleccionado" ? 1 : 0;
    const bEsSeleccionado = b.estado === "seleccionado" ? 1 : 0;
    if (aEsSeleccionado !== bEsSeleccionado) {
      return bEsSeleccionado - aEsSeleccionado;
    }

    const puntajeA = calcularPuntajeTotal(a);
    const puntajeB = calcularPuntajeTotal(b);
    if (puntajeA !== puntajeB) {
      return puntajeB - puntajeA;
    }

    return a.radicado_codigo.localeCompare(b.radicado_codigo, "es", {
      numeric: true,
    });
  });

  const navyFill: ExcelJS.Fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF10384F" }, // #10384f Institucional
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

  const fillSeleccionado: ExcelJS.Fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE8F5E9" }, // Relleno verde suave institucional #E8F5E9
  };

  const borderSeleccionado: Partial<ExcelJS.Borders> = {
    top: { style: "thin", color: { argb: "FFA7F3D0" } },
    bottom: { style: "thin", color: { argb: "FFA7F3D0" } },
    left: { style: "thin", color: { argb: "FFA7F3D0" } },
    right: { style: "thin", color: { argb: "FFA7F3D0" } },
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

  for (const post of postulacionesOrdenadas) {
    const esSeleccionado = post.estado === "seleccionado";
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
      celda.border = esSeleccionado ? borderSeleccionado : borderThin;
      if (esSeleccionado) {
        celda.fill = fillSeleccionado;
      }
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

  for (const post of postulacionesOrdenadas) {
    const esSeleccionado = post.estado === "seleccionado";
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
        celda.border = esSeleccionado ? borderSeleccionado : borderThin;
        if (esSeleccionado) {
          celda.fill = fillSeleccionado;
        }
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
    { header: "Semillero", key: "semillero", width: 34 },
    { header: "Clasificación Final", key: "clasificacion", width: 28 },
    { header: "Habilitante", key: "habilitante", width: 16 },
    { header: "Motivación e Interés (/30)", key: "motivacion", width: 25 },
    { header: "Pertinencia Territorial (/30)", key: "pertinencia", width: 25 },
    { header: "Diversidad de Habilidades (/20)", key: "diversidad", width: 25 },
    {
      header: "Representación Institucional (/20)",
      key: "representacion",
      width: 28,
    },
    { header: "Puntaje Total (/100)", key: "total", width: 20 },
    {
      header: "Justificación y Criterio del Resultado",
      key: "justificacion",
      width: 62,
    },
    { header: "Observaciones del Comité", key: "observaciones", width: 42 },
    { header: "Fecha Evaluación", key: "fecha_eval", width: 18 },
  ];

  const filaEncabezado3 = hoja3.getRow(1);
  filaEncabezado3.height = 26;
  for (let c = 1; c <= hoja3.columns.length; c++) {
    const celda = filaEncabezado3.getCell(c);
    celda.fill = navyFill;
    celda.font = headerFont;
    celda.alignment = { vertical: "middle", horizontal: "center" };
  }

  for (const post of postulacionesOrdenadas) {
    const esSeleccionado = post.estado === "seleccionado";
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
      clasificacion: obtenerClasificacionFinal(post.estado),
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
      justificacion: generarJustificacionEvaluacion(post),
      observaciones: ev?.observaciones || "Sin observaciones del comité",
      fecha_eval: ev
        ? new Date(ev.evaluado_el).toLocaleDateString("es-CO")
        : "Pendiente",
    });

    fila.height = 36;
    for (let c = 1; c <= hoja3.columns.length; c++) {
      const celda = fila.getCell(c);
      celda.border = esSeleccionado ? borderSeleccionado : borderThin;
      if (esSeleccionado) {
        celda.fill = fillSeleccionado;
      }
      celda.alignment = {
        vertical: "middle",
        wrapText: c === 10 || c === 11, // wrapText para justificación y observaciones
      };
    }
  }

  // --------------------------------------------------------------------------
  // HOJA 4: RÚBRICA DE EVALUACIÓN
  // --------------------------------------------------------------------------
  const hoja4 = workbook.addWorksheet(HOJAS_EXCEL.RUBRICA, {
    views: [{ showGridLines: true }],
  });

  hoja4.columns = [
    { header: "Criterio de Evaluación", key: "criterio", width: 28 },
    { header: "Ponderación", key: "ponderacion", width: 16 },
    {
      header: "Qué se Evalúa (Descripción Exhaustiva)",
      key: "descripcion",
      width: 48,
    },
    {
      header: "Nivel Sobresaliente (90% - 100%)",
      key: "sobresaliente",
      width: 36,
    },
    {
      header: "Nivel Notable / Aceptable (70% - 89%)",
      key: "notable",
      width: 36,
    },
    { header: "Nivel Insuficiente (< 70%)", key: "insuficiente", width: 36 },
    { header: "Guía Orientadora del Comité Evaluador", key: "guia", width: 44 },
  ];

  const filaEncabezado4 = hoja4.getRow(1);
  filaEncabezado4.height = 28;
  for (let c = 1; c <= hoja4.columns.length; c++) {
    const celda = filaEncabezado4.getCell(c);
    celda.fill = navyFill;
    celda.font = headerFont;
    celda.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };
  }

  const filasRubrica = [
    {
      criterio: "1. Motivación e Intereses",
      ponderacion: "30% (Hasta 30 pts)",
      descripcion:
        "Claridad, pasión y coherencia en los objetivos expresados por el semillero; interés manifiesto por la ciencia, la tecnología y el emprendimiento; y compromiso explícito del equipo para asistir a todas las jornadas intensivas de formación y prototipado.",
      sobresaliente:
        "Sobresaliente (27 - 30 pts): Demuestran visión clara, proactividad excepcional, articulación sólida con su plan de vida o estudios y compromiso total evidenciado en la postulación.",
      notable:
        "Notable / Aceptable (21 - 26 pts): Motivación clara y fundamentada, interés genuino en resolver retos de innovación, disponibilidad confirmada para las sesiones del Bootcamp.",
      insuficiente:
        "Insuficiente (0 - 20 pts): Interés difuso, justificación genérica o débil coherencia entre las metas del semillero y los objetivos formativos del Bootcamp.",
      guia: "Revisar el texto de motivación del formulario, trayectoria del semillero y coherencia en los perfiles de los tres integrantes.",
    },
    {
      criterio: "2. Pertinencia Territorial Caucana",
      ponderacion: "30% (Hasta 30 pts)",
      descripcion:
        "Alineación de la línea de investigación o propuesta con los desafíos prioritarios del Departamento del Cauca: agroindustria, soberanía alimentaria, biodiversidad y medio ambiente, energía limpia, educación rural, salud comunitaria o paz y convivencia territorial.",
      sobresaliente:
        "Sobresaliente (27 - 30 pts): Planteamiento estrechamente vinculado a retos prioritarios del Cauca con impacto directo y potencial tangible de transferencia en comunidades locales o cadenas productivas.",
      notable:
        "Notable / Aceptable (21 - 26 pts): Relevancia evidente para el contexto departamental con potencial de aplicación situada o metodológica en problemáticas caucanas.",
      insuficiente:
        "Insuficiente (0 - 20 pts): Desconexión con las dinámicas territoriales del Cauca o planteamiento excesivamente abstracto sin aplicación local verificable.",
      guia: "Verificar si la iniciativa aborda cadenas productivas locales, municipios caucanos o necesidades reales de la población del departamento.",
    },
    {
      criterio: "3. Diversidad de Habilidades del Equipo",
      ponderacion: "20% (Hasta 20 pts)",
      descripcion:
        "Complementariedad técnica, multidisciplinariedad de los perfiles estudiantiles (roles analíticos, de programación/tecnología, diseño, liderazgo y comunicación), equidad de género y capacidad para el trabajo colaborativo en equipo.",
      sobresaliente:
        "Sobresaliente (18 - 20 pts): Equipo interdisciplinario y equilibrado de forma sobresaliente: roles analíticos, técnicos y creativos claramente diferenciados y complementarios.",
      notable:
        "Notable / Aceptable (14 - 17 pts): Buena distribución de habilidades y capacidades básicas para afrontar retos intensivos de ideación y prototipado rápido.",
      insuficiente:
        "Insuficiente (0 - 13 pts): Perfiles homogéneos sin complementariedad de roles o debilidad sustancial en habilidades requeridas para el desarrollo del reto.",
      guia: "Evaluar formación, programas académicos o grados de los tres estudiantes y sus aportes individuales al equipo postulado.",
    },
    {
      criterio: "4. Representación Institucional y Respaldo",
      ponderacion: "20% (Hasta 20 pts)",
      descripcion:
        "Respaldo formal de la institución educativa o universidad mediante aval institucional, involucramiento y experiencia del tutor/asesor acompañante, e inclusión de municipios no capitales del Cauca.",
      sobresaliente:
        "Sobresaliente (18 - 20 pts): Aval institucional completo y con respaldo expreso; docente tutor con trayectoria comprobada de acompañamiento; fomento a la representatividad regional o de género.",
      notable:
        "Notable / Aceptable (14 - 17 pts): Documento de aval formal verificado; tutor activo y comprometido; respaldo institucional adecuado para la movilidad de los estudiantes.",
      insuficiente:
        "Insuficiente (0 - 13 pts): Acompañamiento tutorial débil, aval institucional dudoso o falta de soporte para la participación de los estudiantes.",
      guia: "Verificar carta de aval institucional firmada por la rectoría o decanatura, vinculación activa del docente tutor y representatividad geográfica.",
    },
  ];

  for (const filaData of filasRubrica) {
    const fila = hoja4.addRow(filaData);
    fila.height = 60;
    for (let c = 1; c <= hoja4.columns.length; c++) {
      const celda = fila.getCell(c);
      celda.border = borderThin;
      celda.alignment = { vertical: "middle", wrapText: true };
    }
  }

  // Fila resumen de metas de asignación de cupos:
  hoja4.addRow({});
  const filaNota = hoja4.addRow({
    criterio: "METAS DE ASIGNACIÓN DE CUPOS BOOTCAMP CAUCA INNOVA",
    ponderacion: "10 Cupos Totales",
    descripcion:
      "Distribución diferencial oficial: 6 cupos para Instituciones de Educación Superior y 4 cupos para Instituciones de Educación Básica y Media (Colegios). Los semilleros habilitados que no alcancen cupo directo integran la lista oficial de espera por estricto orden de puntaje dentro de su respectiva categoría formativa.",
    sobresaliente: "6 cupos: Superior",
    notable: "4 cupos: Básica y Media",
    insuficiente: "Lista de espera activa",
    guia: "Comité Técnico Evaluador Cauca INNOVA - Gobernación del Cauca & Uniautónoma",
  });
  filaNota.height = 44;
  const fillNota: ExcelJS.Fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF0FDF4" }, // Verde claro #F0FDF4
  };
  for (let c = 1; c <= hoja4.columns.length; c++) {
    const celda = filaNota.getCell(c);
    celda.fill = fillNota;
    celda.border = borderThin;
    celda.alignment = { vertical: "middle", wrapText: true };
    celda.font = { bold: c <= 2, name: "Arial", size: 10 };
  }

  workbook.eachSheet(neutralizarHoja);

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
