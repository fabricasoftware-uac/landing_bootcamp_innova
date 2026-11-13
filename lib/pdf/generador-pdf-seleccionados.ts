import fs from "node:fs";
import path from "node:path";
import {
  PDFDocument,
  type PDFFont,
  type PDFImage,
  type PDFPage,
  type RGB,
  rgb,
  StandardFonts,
} from "pdf-lib";
import type { PostulacionAdminDetalle } from "@/app/actions/admin";

// ============================================================================
// CONSTANTES DE DISEÑO Y COLOR (Paleta Canónica Uniautónoma & Cauca INNOVA)
// ============================================================================
const COLOR_NAVY = rgb(6 / 255, 38 / 255, 83 / 255); // #062653
const COLOR_AZUL_CORP = rgb(7 / 255, 86 / 255, 165 / 255); // #0756A5
const COLOR_VERDE = rgb(16 / 255, 185 / 255, 129 / 255); // #10B981
const COLOR_VERDE_FONDO = rgb(232 / 255, 245 / 255, 233 / 255); // #E8F5E9
const COLOR_VERDE_TEXTO = rgb(30 / 255, 70 / 255, 32 / 255); // #1E4620
const _COLOR_NARANJA = rgb(245 / 255, 130 / 255, 32 / 255); // #F58220
const COLOR_FONDO_CARD = rgb(248 / 255, 250 / 255, 252 / 255); // #F8FAFC
const _COLOR_FONDO_ALT = rgb(241 / 255, 245 / 255, 249 / 255); // #F1F5F9
const COLOR_BORDE = rgb(226 / 255, 232 / 255, 240 / 255); // #E2E8F0
const COLOR_BORDE_VERDE = rgb(167 / 255, 243 / 255, 208 / 255); // #A7F3D0
const COLOR_TEXTO = rgb(20 / 255, 43 / 255, 77 / 255); // #142B4D
const COLOR_MUTED = rgb(100 / 255, 116 / 255, 139 / 255); // #64748B
const COLOR_BLANCO = rgb(1, 1, 1);

const PAGE_WIDTH = 595.28; // A4 pt
const PAGE_HEIGHT = 841.89; // A4 pt
const MARGIN_LEFT = 40;
const MARGIN_RIGHT = 555.28;
const CONTENT_WIDTH = MARGIN_RIGHT - MARGIN_LEFT; // 515.28 pt

// ============================================================================
// INTERFACES
// ============================================================================
export interface IntegranteDetallePdf {
  orden: number;
  nombres_apellidos: string;
  tipo_documento: string;
  numero_documento: string;
  correo_electronico: string;
  telefono: string;
  es_menor_edad: boolean;
}

export interface EvaluacionDetallePdf {
  puntaje_motivacion: number;
  puntaje_pertinencia: number;
  puntaje_diversidad: number;
  puntaje_representacion: number;
  puntaje_total: number;
  cumple_requisitos_habilitante: boolean;
  observaciones?: string | null;
  evaluado_el?: string | null;
}

export interface PostulacionSeleccionadaPdf {
  id: string;
  radicado_codigo: string;
  semillero_nombre: string;
  institucion_nombre: string;
  institucion_tipo: "basica_media" | "superior";
  tutor_nombre: string;
  tutor_email: string;
  tutor_telefono: string;
  integrantes: IntegranteDetallePdf[];
  evaluacion: EvaluacionDetallePdf;
  ranking: number;
}

export interface GeneracionPdfResultado {
  pdfBytes: Uint8Array;
  buffer: Buffer;
  base64: string;
  nombreArchivo: string;
}

// ============================================================================
// SANITIZACIÓN Y HELPERS DE TEXTO
// ============================================================================

/**
 * Limpia y normaliza texto para fuentes estándar de PDF (WinAnsi / ISO-8859-1).
 * Reemplaza caracteres tipográficos no soportados (comillas curvas, guiones largos raros).
 */
export function sanitizarTextoPdf(str?: string | null): string {
  if (!str) return "";
  return str
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, "-")
    .replace(/…/g, "...")
    .replace(/[\r\n\t]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Trunca texto con elipses si excede el ancho disponible */
function truncarTexto(
  texto: string,
  anchoMax: number,
  fuente: PDFFont,
  tamano: number,
): string {
  const limpio = sanitizarTextoPdf(texto);
  if (fuente.widthOfTextAtSize(limpio, tamano) <= anchoMax) {
    return limpio;
  }
  let truncado = limpio;
  while (
    truncado.length > 3 &&
    fuente.widthOfTextAtSize(`${truncado}...`, tamano) > anchoMax
  ) {
    truncado = truncado.slice(0, -1);
  }
  return `${truncado}...`;
}

/** Formatea fechas ISO a formato legible colombiano */
function _formatearFechaCol(fechaStr?: string | null): string {
  if (!fechaStr) return "13/11/2026";
  const d = new Date(fechaStr);
  if (Number.isNaN(d.getTime())) return "13/11/2026";
  return d.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

/**
 * Extrae y normaliza una postulación a la estructura requerida para el PDF.
 */
function normalizarPostulacionPdf(
  p: PostulacionAdminDetalle | Record<string, unknown>,
  rankingIndex: number,
): PostulacionSeleccionadaPdf {
  const evRaw = Array.isArray(p.evaluaciones)
    ? p.evaluaciones[0]
    : p.evaluaciones;
  const evObj = (evRaw || {}) as Record<string, unknown>;
  const mot = Number(evObj.puntaje_motivacion) || 0;
  const per = Number(evObj.puntaje_pertinencia) || 0;
  const div = Number(evObj.puntaje_diversidad) || 0;
  const rep = Number(evObj.puntaje_representacion) || 0;
  const total = mot + per + div + rep;

  const rawInts = Array.isArray(p.integrantes) ? p.integrantes : [];
  const intsSorted = [...rawInts].sort(
    (a, b) =>
      (Number((a as Record<string, unknown>).orden_integrante) || 0) -
      (Number((b as Record<string, unknown>).orden_integrante) || 0),
  );

  const integrantes: IntegranteDetallePdf[] = intsSorted.map((rawI, idx) => {
    const i = rawI as Record<string, unknown>;
    return {
      orden: Number(i.orden_integrante) || idx + 1,
      nombres_apellidos: String(i.nombres_apellidos || "Integrante"),
      tipo_documento: String(i.tipo_documento || "CC"),
      numero_documento: String(i.numero_documento || ""),
      correo_electronico: String(i.correo_electronico || ""),
      telefono: String(i.telefono || ""),
      es_menor_edad: Boolean(i.es_menor_edad),
    };
  });

  return {
    id: String(p.id || ""),
    radicado_codigo:
      String(p.radicado_codigo || "") ||
      `INNOVA-2026-${String(rankingIndex).padStart(4, "0")}`,
    semillero_nombre: String(
      p.semillero_nombre || "Semillero de Investigación",
    ),
    institucion_nombre: String(p.institucion_nombre || "Institución Educativa"),
    institucion_tipo:
      p.institucion_tipo === "basica_media" ? "basica_media" : "superior",
    tutor_nombre: String(p.tutor_nombre || "Docente Tutor"),
    tutor_email: String(p.tutor_email || ""),
    tutor_telefono: String(p.tutor_telefono || ""),
    integrantes,
    ranking: rankingIndex,
    evaluacion: {
      puntaje_motivacion: mot,
      puntaje_pertinencia: per,
      puntaje_diversidad: div,
      puntaje_representacion: rep,
      puntaje_total: total,
      cumple_requisitos_habilitante: Boolean(
        evObj.cumple_requisitos_habilitante ?? true,
      ),
      observaciones: evObj.observaciones ? String(evObj.observaciones) : null,
      evaluado_el: evObj.evaluado_el ? String(evObj.evaluado_el) : null,
    },
  };
}

// ============================================================================
// DIBUJADO DE ELEMENTOS GRÁFICOS
// ============================================================================

/** Dibuja la franja superior corporativa en cada página */
function dibujarFranjaSuperior(page: PDFPage): void {
  // Franja Navy principal
  page.drawRectangle({
    x: 0,
    y: PAGE_HEIGHT - 6,
    width: PAGE_WIDTH,
    height: 6,
    color: COLOR_NAVY,
  });
  // Franja Verde institucional complementaria
  page.drawRectangle({
    x: 0,
    y: PAGE_HEIGHT - 9,
    width: PAGE_WIDTH,
    height: 3,
    color: COLOR_VERDE,
  });
}

/** Dibuja el pie de página oficial con numeración formal */
function dibujarPieDePagina(
  page: PDFPage,
  paginaActual: number,
  totalPaginas: number,
  fuenteReg: PDFFont,
  fuenteBold: PDFFont,
): void {
  // Línea divisoria
  page.drawLine({
    start: { x: MARGIN_LEFT, y: 35 },
    end: { x: MARGIN_RIGHT, y: 35 },
    thickness: 0.75,
    color: COLOR_BORDE,
  });

  // Texto izquierdo
  page.drawText("Cauca INNOVA 2026 - Convocatoria Pública Departamental", {
    x: MARGIN_LEFT,
    y: 22,
    size: 7.5,
    font: fuenteBold,
    color: COLOR_NAVY,
  });

  page.drawText(
    "Gobernación del Cauca | Corporación Universitaria Autónoma del Cauca",
    {
      x: MARGIN_LEFT,
      y: 13,
      size: 7,
      font: fuenteReg,
      color: COLOR_MUTED,
    },
  );

  // Numeración derecha
  const textoPagina = `Página ${paginaActual} de ${totalPaginas}`;
  const anchoPagina = fuenteBold.widthOfTextAtSize(textoPagina, 8);
  page.drawText(textoPagina, {
    x: MARGIN_RIGHT - anchoPagina,
    y: 18,
    size: 8,
    font: fuenteBold,
    color: COLOR_NAVY,
  });
}

/** Dibuja un badge de puntaje o estado */
function dibujarBadge(
  page: PDFPage,
  texto: string,
  x: number,
  y: number,
  ancho: number,
  alto: number,
  bg: RGB,
  borde: RGB,
  colorTexto: RGB,
  fuente: PDFFont,
  tamano: number,
): void {
  page.drawRectangle({
    x,
    y,
    width: ancho,
    height: alto,
    color: bg,
    borderColor: borde,
    borderWidth: 0.75,
  });
  const textWidth = fuente.widthOfTextAtSize(texto, tamano);
  const textX = x + (ancho - textWidth) / 2;
  const textY = y + (alto - tamano) / 2 + 1;
  page.drawText(texto, {
    x: textX,
    y: textY,
    size: tamano,
    font: fuente,
    color: colorTexto,
  });
}

// ============================================================================
// CONSTRUCTOR PRINCIPAL DEL PDF
// ============================================================================

/**
 * Genera el documento PDF oficial con la lista completa de semilleros seleccionados.
 */
export async function generarPdfSeleccionados(
  postulaciones: (PostulacionAdminDetalle | Record<string, unknown>)[],
): Promise<GeneracionPdfResultado> {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle(
    "Cauca INNOVA 2026 - Listado Oficial de Equipos Seleccionados",
  );
  pdfDoc.setAuthor("Gobernación del Cauca & Uniautónoma del Cauca");
  pdfDoc.setSubject("Acta de Selección y Publicación Oficial de Resultados");
  pdfDoc.setCreationDate(new Date());

  const fontReg = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // 1. Filtrar solo los seleccionados
  const seleccionadosCrudos = (postulaciones || []).filter(
    (p) => p.estado === "seleccionado",
  );

  // 2. Ordenar por puntaje descendente, secundario por radicado ascendente
  seleccionadosCrudos.sort((a, b) => {
    const evA = Array.isArray(a.evaluaciones)
      ? a.evaluaciones[0]
      : a.evaluaciones;
    const evB = Array.isArray(b.evaluaciones)
      ? b.evaluaciones[0]
      : b.evaluaciones;
    const totA = evA
      ? (Number(evA.puntaje_motivacion) || 0) +
        (Number(evA.puntaje_pertinencia) || 0) +
        (Number(evA.puntaje_diversidad) || 0) +
        (Number(evA.puntaje_representacion) || 0)
      : 0;
    const totB = evB
      ? (Number(evB.puntaje_motivacion) || 0) +
        (Number(evB.puntaje_pertinencia) || 0) +
        (Number(evB.puntaje_diversidad) || 0) +
        (Number(evB.puntaje_representacion) || 0)
      : 0;
    if (totA !== totB) return totB - totA;
    return String(a.radicado_codigo || "").localeCompare(
      String(b.radicado_codigo || ""),
      "es",
      { numeric: true },
    );
  });

  const seleccionados: PostulacionSeleccionadaPdf[] = seleccionadosCrudos.map(
    (p, i) => normalizarPostulacionPdf(p, i + 1),
  );

  // Cargar logotipo de Gobernación si existe en disco
  let logoGobernacion: PDFImage | null = null;
  const rutaLogo = path.join(
    process.cwd(),
    "public/images/gobernacion-cauca.png",
  );
  if (fs.existsSync(rutaLogo)) {
    try {
      const bytesImg = fs.readFileSync(rutaLogo);
      logoGobernacion = await pdfDoc.embedPng(bytesImg);
    } catch {
      logoGobernacion = null;
    }
  }

  const TOTAL_PAGINAS = 4;

  // ==========================================================================
  // PÁGINA 1: PORTADA Y CUADRO DE HONOR (TABLA GENERAL DE SELECCIONADOS)
  // ==========================================================================
  const page1 = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  dibujarFranjaSuperior(page1);

  let y = PAGE_HEIGHT - 35;

  // Header Institucional
  if (logoGobernacion) {
    const logoW = 100;
    const logoH = (logoGobernacion.height / logoGobernacion.width) * logoW;
    page1.drawImage(logoGobernacion, {
      x: MARGIN_LEFT,
      y: y - logoH + 12,
      width: logoW,
      height: logoH,
    });
  }

  // Título institucional superior derecho
  const textTitleX = logoGobernacion ? MARGIN_LEFT + 115 : MARGIN_LEFT;
  page1.drawText("GOBERNACIÓN DEL CAUCA", {
    x: textTitleX,
    y: y,
    size: 10,
    font: fontBold,
    color: COLOR_NAVY,
  });
  page1.drawText("Secretaría de Desarrollo Económico y Competitividad", {
    x: textTitleX,
    y: y - 12,
    size: 8.5,
    font: fontReg,
    color: COLOR_MUTED,
  });
  page1.drawText(
    "Corporación Universitaria Autónoma del Cauca - Dirección de Investigación",
    {
      x: textTitleX,
      y: y - 23,
      size: 8,
      font: fontBold,
      color: COLOR_AZUL_CORP,
    },
  );

  y -= 52;

  // Línea divisoria
  page1.drawLine({
    start: { x: MARGIN_LEFT, y },
    end: { x: MARGIN_RIGHT, y },
    thickness: 1,
    color: COLOR_VERDE,
  });

  y -= 24;

  // Título Principal del Documento
  page1.drawText("BOOTCAMP CAUCA INNOVA 2026", {
    x: MARGIN_LEFT,
    y,
    size: 16,
    font: fontBold,
    color: COLOR_NAVY,
  });

  y -= 15;
  page1.drawText("ACTA OFICIAL DE RESULTADOS Y SEMILLEROS CLASIFICADOS", {
    x: MARGIN_LEFT,
    y,
    size: 11,
    font: fontBold,
    color: COLOR_AZUL_CORP,
  });

  y -= 14;
  page1.drawText(
    "Publicación final de la fase de evaluación y selección de la convocatoria departamental",
    {
      x: MARGIN_LEFT,
      y,
      size: 9,
      font: fontOblique,
      color: COLOR_MUTED,
    },
  );

  y -= 20;

  // Caja de Métricas y Metadatos de la Convocatoria
  page1.drawRectangle({
    x: MARGIN_LEFT,
    y: y - 38,
    width: CONTENT_WIDTH,
    height: 48,
    color: COLOR_FONDO_CARD,
    borderColor: COLOR_BORDE,
    borderWidth: 1,
  });

  // Metadatos en 4 columnas
  const colW = CONTENT_WIDTH / 4;

  // Columna 1: Fecha
  page1.drawText("FECHA DE PUBLICACIÓN", {
    x: MARGIN_LEFT + 10,
    y: y - 4,
    size: 6.5,
    font: fontBold,
    color: COLOR_MUTED,
  });
  page1.drawText("13 de Noviembre, 2026", {
    x: MARGIN_LEFT + 10,
    y: y - 18,
    size: 8.5,
    font: fontBold,
    color: COLOR_NAVY,
  });
  page1.drawText("Popayán, Cauca", {
    x: MARGIN_LEFT + 10,
    y: y - 29,
    size: 7.5,
    font: fontReg,
    color: COLOR_MUTED,
  });

  // Columna 2: Cupos Totales
  page1.drawText("CUPOS OFICIALES", {
    x: MARGIN_LEFT + colW + 10,
    y: y - 4,
    size: 6.5,
    font: fontBold,
    color: COLOR_MUTED,
  });
  page1.drawText("10 Seleccionados", {
    x: MARGIN_LEFT + colW + 10,
    y: y - 18,
    size: 8.5,
    font: fontBold,
    color: COLOR_VERDE_TEXTO,
  });
  page1.drawText("100% Cobertura", {
    x: MARGIN_LEFT + colW + 10,
    y: y - 29,
    size: 7.5,
    font: fontReg,
    color: COLOR_MUTED,
  });

  // Columna 3: Universidades
  page1.drawText("EDUCACIÓN SUPERIOR", {
    x: MARGIN_LEFT + colW * 2 + 10,
    y: y - 4,
    size: 6.5,
    font: fontBold,
    color: COLOR_MUTED,
  });
  page1.drawText("6 Universidades", {
    x: MARGIN_LEFT + colW * 2 + 10,
    y: y - 18,
    size: 8.5,
    font: fontBold,
    color: COLOR_NAVY,
  });
  page1.drawText("Meta de cupos cumplida", {
    x: MARGIN_LEFT + colW * 2 + 10,
    y: y - 29,
    size: 7.5,
    font: fontReg,
    color: COLOR_MUTED,
  });

  // Columna 4: Colegios
  page1.drawText("BÁSICA Y MEDIA", {
    x: MARGIN_LEFT + colW * 3 + 10,
    y: y - 4,
    size: 6.5,
    font: fontBold,
    color: COLOR_MUTED,
  });
  page1.drawText("4 Colegios Clasificados", {
    x: MARGIN_LEFT + colW * 3 + 10,
    y: y - 18,
    size: 8.5,
    font: fontBold,
    color: COLOR_NAVY,
  });
  page1.drawText("Fomento temprano I+D", {
    x: MARGIN_LEFT + colW * 3 + 10,
    y: y - 29,
    size: 7.5,
    font: fontReg,
    color: COLOR_MUTED,
  });

  y -= 58;

  // Párrafo introductorio
  const intro =
    "El Comité Técnico Evaluador de Cauca INNOVA 2026, tras verificar los requisitos habilitantes y aplicar la rúbrica oficial de cuatro criterios (Motivación 30%, Pertinencia 30%, Diversidad 20%, Representación 20%), hace público el orden de mérito definitivo de los semilleros clasificados a la fase de inmersión y prototipado:";
  page1.drawText(truncarTexto(intro, CONTENT_WIDTH, fontReg, 8.5), {
    x: MARGIN_LEFT,
    y,
    size: 8.5,
    font: fontReg,
    color: COLOR_TEXTO,
  });

  y -= 18;

  // TABLA GENERAL DEL TOP 10 CLASIFICADOS
  const rowH = 25;
  const _tableH = rowH * 11; // 1 header + 10 rows

  // Encabezado de la tabla (Navy)
  page1.drawRectangle({
    x: MARGIN_LEFT,
    y: y - rowH,
    width: CONTENT_WIDTH,
    height: rowH,
    color: COLOR_NAVY,
  });

  // Columnas:
  // Puesto: 35 | Radicado: 80 | Semillero: 175 | Institución: 125 | Nivel: 55 | Puntaje: 45.28
  const cX = {
    puesto: MARGIN_LEFT + 8,
    radicado: MARGIN_LEFT + 38,
    semillero: MARGIN_LEFT + 120,
    institucion: MARGIN_LEFT + 295,
    nivel: MARGIN_LEFT + 420,
    puntaje: MARGIN_LEFT + 472,
  };

  page1.drawText("#", {
    x: cX.puesto,
    y: y - 16,
    size: 8,
    font: fontBold,
    color: COLOR_BLANCO,
  });
  page1.drawText("RADICADO", {
    x: cX.radicado,
    y: y - 16,
    size: 8,
    font: fontBold,
    color: COLOR_BLANCO,
  });
  page1.drawText("SEMILLERO CLASIFICADO", {
    x: cX.semillero,
    y: y - 16,
    size: 8,
    font: fontBold,
    color: COLOR_BLANCO,
  });
  page1.drawText("INSTITUCIÓN EDUCATIVA", {
    x: cX.institucion,
    y: y - 16,
    size: 8,
    font: fontBold,
    color: COLOR_BLANCO,
  });
  page1.drawText("NIVEL", {
    x: cX.nivel,
    y: y - 16,
    size: 8,
    font: fontBold,
    color: COLOR_BLANCO,
  });
  page1.drawText("PUNTAJE", {
    x: cX.puntaje,
    y: y - 16,
    size: 8,
    font: fontBold,
    color: COLOR_BLANCO,
  });

  y -= rowH;

  // Filas de los 10 seleccionados
  for (let i = 0; i < seleccionados.length; i++) {
    const post = seleccionados[i];
    if (!post) continue;

    const rowY = y - rowH;
    const esPar = i % 2 === 0;

    // Fondo alternado suave con verde claro para los 3 primeros
    let bgFila = esPar ? COLOR_BLANCO : COLOR_FONDO_CARD;
    if (i < 3) {
      bgFila = i === 0 ? COLOR_VERDE_FONDO : COLOR_FONDO_CARD;
    }

    page1.drawRectangle({
      x: MARGIN_LEFT,
      y: rowY,
      width: CONTENT_WIDTH,
      height: rowH,
      color: bgFila,
      borderColor: COLOR_BORDE,
      borderWidth: 0.5,
    });

    // Puesto
    const puestoStr = `#${post.ranking}`;
    page1.drawText(puestoStr, {
      x: cX.puesto,
      y: rowY + 8,
      size: 8.5,
      font: fontBold,
      color: i === 0 ? COLOR_VERDE_TEXTO : COLOR_NAVY,
    });

    // Radicado
    page1.drawText(post.radicado_codigo, {
      x: cX.radicado,
      y: rowY + 8,
      size: 7.5,
      font: fontBold,
      color: COLOR_TEXTO,
    });

    // Semillero
    page1.drawText(truncarTexto(post.semillero_nombre, 168, fontBold, 8), {
      x: cX.semillero,
      y: rowY + 8,
      size: 8,
      font: fontBold,
      color: COLOR_NAVY,
    });

    // Institución
    page1.drawText(truncarTexto(post.institucion_nombre, 120, fontReg, 7.5), {
      x: cX.institucion,
      y: rowY + 8,
      size: 7.5,
      font: fontReg,
      color: COLOR_MUTED,
    });

    // Nivel
    const nivelLabel =
      post.institucion_tipo === "basica_media" ? "Colegio" : "Universidad";
    page1.drawText(nivelLabel, {
      x: cX.nivel,
      y: rowY + 8,
      size: 7.5,
      font: fontReg,
      color: COLOR_TEXTO,
    });

    // Puntaje en Badge verde
    const ptsStr = `${post.evaluacion.puntaje_total} pts`;
    dibujarBadge(
      page1,
      ptsStr,
      cX.puntaje - 2,
      rowY + 4,
      38,
      17,
      COLOR_VERDE_FONDO,
      COLOR_BORDE_VERDE,
      COLOR_VERDE_TEXTO,
      fontBold,
      8,
    );

    y -= rowH;
  }

  y -= 16;

  // Cuadro informativo al pie de la tabla
  page1.drawRectangle({
    x: MARGIN_LEFT,
    y: y - 26,
    width: CONTENT_WIDTH,
    height: 32,
    color: COLOR_FONDO_CARD,
    borderColor: COLOR_BORDE,
    borderWidth: 0.75,
  });

  page1.drawText("NOTA DE CONFORMIDAD Y ASIGNACIÓN DE CUPOS:", {
    x: MARGIN_LEFT + 10,
    y: y - 8,
    size: 7,
    font: fontBold,
    color: COLOR_NAVY,
  });
  page1.drawText(
    "Los diez (10) semilleros listados superaron la puntuación mínima clasificatoria y cuentan con aval institucional completo.",
    {
      x: MARGIN_LEFT + 10,
      y: y - 18,
      size: 7,
      font: fontReg,
      color: COLOR_TEXTO,
    },
  );

  dibujarPieDePagina(page1, 1, TOTAL_PAGINAS, fontReg, fontBold);

  // ==========================================================================
  // FUNCIÓN REUTILIZABLE PARA DIBUJAR PÁGINAS DE FICHAS TÉCNICAS (5 equipos por página)
  // ==========================================================================
  function dibujarPaginaFichas(
    equiposSlice: PostulacionSeleccionadaPdf[],
    numeroPagina: number,
    tituloSeccion: string,
  ): void {
    const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    dibujarFranjaSuperior(page);

    let curY = PAGE_HEIGHT - 35;

    // Encabezado de página
    page.drawText("BOOTCAMP CAUCA INNOVA 2026 - ACTA OFICIAL DE RESULTADOS", {
      x: MARGIN_LEFT,
      y: curY,
      size: 8,
      font: fontBold,
      color: COLOR_AZUL_CORP,
    });
    curY -= 15;
    page.drawText(tituloSeccion, {
      x: MARGIN_LEFT,
      y: curY,
      size: 13,
      font: fontBold,
      color: COLOR_NAVY,
    });
    curY -= 10;
    page.drawLine({
      start: { x: MARGIN_LEFT, y: curY },
      end: { x: MARGIN_RIGHT, y: curY },
      thickness: 0.75,
      color: COLOR_VERDE,
    });

    curY -= 16;

    // Altura por tarjeta de equipo (5 tarjetas en la página)
    const cardH = 136;
    const cardGap = 12;

    for (let idx = 0; idx < equiposSlice.length; idx++) {
      const eq = equiposSlice[idx];
      if (!eq) continue;

      const cardY = curY - cardH;

      // 1. Contenedor de la tarjeta
      page.drawRectangle({
        x: MARGIN_LEFT,
        y: cardY,
        width: CONTENT_WIDTH,
        height: cardH,
        color: COLOR_BLANCO,
        borderColor: COLOR_BORDE,
        borderWidth: 1,
      });

      // 2. Cabecera de la tarjeta (Navy)
      const headerH = 24;
      page.drawRectangle({
        x: MARGIN_LEFT,
        y: cardY + cardH - headerH,
        width: CONTENT_WIDTH,
        height: headerH,
        color: COLOR_NAVY,
      });

      // Puesto y Radicado
      page.drawText(
        `PUESTO #${eq.ranking}  |  RADICADO: ${eq.radicado_codigo}`,
        {
          x: MARGIN_LEFT + 10,
          y: cardY + cardH - 16,
          size: 8,
          font: fontBold,
          color: COLOR_BLANCO,
        },
      );

      // Badge de Puntaje Oficial a la derecha
      const badgeW = 90;
      dibujarBadge(
        page,
        `PUNTAJE: ${eq.evaluacion.puntaje_total}/100`,
        MARGIN_RIGHT - badgeW - 6,
        cardY + cardH - headerH + 3,
        badgeW,
        18,
        COLOR_VERDE,
        COLOR_VERDE,
        COLOR_BLANCO,
        fontBold,
        8,
      );

      let innerY = cardY + cardH - headerH - 12;

      // 3. Datos del Semillero e Institución
      page.drawText("Semillero:", {
        x: MARGIN_LEFT + 10,
        y: innerY,
        size: 7.5,
        font: fontBold,
        color: COLOR_MUTED,
      });
      page.drawText(truncarTexto(eq.semillero_nombre, 240, fontBold, 8.5), {
        x: MARGIN_LEFT + 55,
        y: innerY,
        size: 8.5,
        font: fontBold,
        color: COLOR_NAVY,
      });

      // Nivel e Institución a la derecha
      const nivelDesc =
        eq.institucion_tipo === "basica_media"
          ? "Educación Básica y Media"
          : "Educación Superior";
      page.drawText(
        `Institución: ${truncarTexto(eq.institucion_nombre, 180, fontReg, 7.5)} (${nivelDesc})`,
        {
          x: MARGIN_LEFT + 300,
          y: innerY,
          size: 7.5,
          font: fontReg,
          color: COLOR_TEXTO,
        },
      );

      innerY -= 13;

      // Docente Tutor
      page.drawText("Docente Tutor:", {
        x: MARGIN_LEFT + 10,
        y: innerY,
        size: 7.5,
        font: fontBold,
        color: COLOR_MUTED,
      });
      page.drawText(
        `${eq.tutor_nombre}  -  Correo: ${eq.tutor_email || "No registrado"}${
          eq.tutor_telefono ? `  -  Tel: ${eq.tutor_telefono}` : ""
        }`,
        {
          x: MARGIN_LEFT + 75,
          y: innerY,
          size: 7.5,
          font: fontReg,
          color: COLOR_TEXTO,
        },
      );

      innerY -= 12;

      // Separador sutil
      page.drawLine({
        start: { x: MARGIN_LEFT + 10, y: innerY },
        end: { x: MARGIN_RIGHT - 10, y: innerY },
        thickness: 0.5,
        color: COLOR_BORDE,
      });

      innerY -= 11;

      // 4. Integrantes del Equipo (3 estudiantes)
      page.drawText("Integrantes del Equipo (3 Estudiantes):", {
        x: MARGIN_LEFT + 10,
        y: innerY,
        size: 7,
        font: fontBold,
        color: COLOR_AZUL_CORP,
      });

      innerY -= 11;

      // Renderizar los integrantes
      for (let j = 0; j < eq.integrantes.length; j++) {
        const it = eq.integrantes[j];
        if (!it) continue;
        const menorTag = it.es_menor_edad
          ? "[Menor de Edad]"
          : "[Mayor de Edad]";
        const lineaIntegrante = `${j + 1}. ${it.nombres_apellidos}  (${it.tipo_documento}: ${it.numero_documento})  -  ${it.correo_electronico}  ${menorTag}`;
        page.drawText(
          truncarTexto(lineaIntegrante, CONTENT_WIDTH - 20, fontReg, 7),
          {
            x: MARGIN_LEFT + 15,
            y: innerY,
            size: 7,
            font: fontReg,
            color: COLOR_TEXTO,
          },
        );
        innerY -= 9.5;
      }

      innerY -= 2;

      // 5. Barra de Calificación por Rúbrica
      page.drawRectangle({
        x: MARGIN_LEFT + 8,
        y: cardY + 6,
        width: CONTENT_WIDTH - 16,
        height: 20,
        color: COLOR_FONDO_CARD,
        borderColor: COLOR_BORDE,
        borderWidth: 0.5,
      });

      const ev = eq.evaluacion;
      const rubricaTexto = `RÚBRICA:  Motivación: ${ev.puntaje_motivacion}/30  |  Pertinencia: ${ev.puntaje_pertinencia}/30  |  Diversidad: ${ev.puntaje_diversidad}/20  |  Representación: ${ev.puntaje_representacion}/20  |  TOTAL: ${ev.puntaje_total}/100`;
      page.drawText(rubricaTexto, {
        x: MARGIN_LEFT + 16,
        y: cardY + 12,
        size: 7,
        font: fontBold,
        color: COLOR_NAVY,
      });

      curY -= cardH + cardGap;
    }

    dibujarPieDePagina(page, numeroPagina, TOTAL_PAGINAS, fontReg, fontBold);
  }

  // ==========================================================================
  // PÁGINA 2: FICHAS TÉCNICAS (PUESTOS 1 AL 5)
  // ==========================================================================
  const equiposPag2 = seleccionados.slice(0, 5);
  dibujarPaginaFichas(
    equiposPag2,
    2,
    "FICHAS TÉCNICAS DE EQUIPOS SELECCIONADOS (PUESTOS 1 AL 5)",
  );

  // ==========================================================================
  // PÁGINA 3: FICHAS TÉCNICAS (PUESTOS 6 AL 10)
  // ==========================================================================
  const equiposPag3 = seleccionados.slice(5, 10);
  dibujarPaginaFichas(
    equiposPag3,
    3,
    "FICHAS TÉCNICAS DE EQUIPOS SELECCIONADOS (PUESTOS 6 AL 10)",
  );

  // ==========================================================================
  // PÁGINA 4: METODOLOGÍA, INSTRUCCIONES LOGÍSTICAS Y FIRMAS INSTITUCIONALES
  // ==========================================================================
  const page4 = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  dibujarFranjaSuperior(page4);

  let p4Y = PAGE_HEIGHT - 35;

  page4.drawText("BOOTCAMP CAUCA INNOVA 2026 - ACTA OFICIAL DE RESULTADOS", {
    x: MARGIN_LEFT,
    y: p4Y,
    size: 8,
    font: fontBold,
    color: COLOR_AZUL_CORP,
  });
  p4Y -= 15;
  page4.drawText("METODOLOGÍA, INSTRUCCIONES PARA CLASIFICADOS Y CIERRE", {
    x: MARGIN_LEFT,
    y: p4Y,
    size: 13,
    font: fontBold,
    color: COLOR_NAVY,
  });
  p4Y -= 10;
  page4.drawLine({
    start: { x: MARGIN_LEFT, y: p4Y },
    end: { x: MARGIN_RIGHT, y: p4Y },
    thickness: 0.75,
    color: COLOR_VERDE,
  });

  p4Y -= 18;

  // 1. Caja de Síntesis de la Rúbrica
  page4.drawRectangle({
    x: MARGIN_LEFT,
    y: p4Y - 110,
    width: CONTENT_WIDTH,
    height: 110,
    color: COLOR_FONDO_CARD,
    borderColor: COLOR_BORDE,
    borderWidth: 1,
  });

  page4.drawText("1. SÍNTESIS DE LA RÚBRICA DE EVALUACIÓN OFICIAL", {
    x: MARGIN_LEFT + 12,
    y: p4Y - 15,
    size: 8.5,
    font: fontBold,
    color: COLOR_NAVY,
  });

  const criterios = [
    {
      nombre: "Motivación e Interés Investigativo (30% - Máx 30 pts):",
      desc: "Claridad en metas científicas y tecnológicas, compromiso expreso con las jornadas presenciales y vocación de innovación.",
    },
    {
      nombre: "Pertinencia Territorial Caucana (30% - Máx 30 pts):",
      desc: "Alineación de la propuesta con desafíos agropecuarios, productivos, ambientales y comunitarios del departamento del Cauca.",
    },
    {
      nombre: "Diversidad e Inclusión de Habilidades (20% - Máx 20 pts):",
      desc: "Complementariedad técnica de los 3 integrantes (roles analíticos, de desarrollo y creativos), equidad y sinergia.",
    },
    {
      nombre: "Representación Institucional y Territorial (20% - Máx 20 pts):",
      desc: "Aval formal de la rectoría o decanatura, rol activo y acompañamiento presencial del docente tutor y origen territorial.",
    },
  ];

  let critY = p4Y - 28;
  for (const crit of criterios) {
    page4.drawText(crit.nombre, {
      x: MARGIN_LEFT + 16,
      y: critY,
      size: 7.5,
      font: fontBold,
      color: COLOR_AZUL_CORP,
    });
    page4.drawText(truncarTexto(crit.desc, CONTENT_WIDTH - 30, fontReg, 7), {
      x: MARGIN_LEFT + 16,
      y: critY - 9,
      size: 7,
      font: fontReg,
      color: COLOR_TEXTO,
    });
    critY -= 20;
  }

  p4Y -= 126;

  // 2. Caja de Instrucciones Obligatorias para los Clasificados
  page4.drawRectangle({
    x: MARGIN_LEFT,
    y: p4Y - 120,
    width: CONTENT_WIDTH,
    height: 120,
    color: COLOR_BLANCO,
    borderColor: COLOR_BORDE,
    borderWidth: 1,
  });

  page4.drawText(
    "2. INSTRUCCIONES Y COMPROMISOS PARA LOS 10 EQUIPOS SELECCIONADOS",
    {
      x: MARGIN_LEFT + 12,
      y: p4Y - 15,
      size: 8.5,
      font: fontBold,
      color: COLOR_NAVY,
    },
  );

  const pasos = [
    "A. Confirmación de Participación: Los docentes tutores disponen de 5 días hábiles a partir de esta publicación para confirmar mediante correo institucional la asistencia de los 3 estudiantes formalmente inscritos.",
    "B. Menores de Edad: Es requisito sine qua non presentar el formato de consentimiento informado firmado por padres o acudientes, adjuntando copia del documento de identidad y afiliación al sistema de salud (EPS/SISBÉN).",
    "C. Sede y Logística del Bootcamp: El evento se desarrollará en el Campus Principal de la Corporación Universitaria Autónoma del Cauca (Popayán). Cada equipo recibirá kits oficiales de prototipado, acceso a laboratorios y mentores.",
    "D. Alimentación y Refrigerios: La organización cubrirá la totalidad de la alimentación (almuerzos y refrigerios) durante las jornadas completas del Bootcamp para los 3 estudiantes y su docente asesor.",
    "E. Política de Asistencia: La inasistencia no justificada de algún miembro del equipo dará lugar a la asignación del cupo al primer equipo en lista de espera según el estricto orden de mérito de la convocatoria.",
  ];

  let pasoY = p4Y - 30;
  for (const paso of pasos) {
    page4.drawText(truncarTexto(paso, CONTENT_WIDTH - 24, fontReg, 7), {
      x: MARGIN_LEFT + 16,
      y: pasoY,
      size: 7,
      font: fontReg,
      color: COLOR_TEXTO,
    });
    pasoY -= 17;
  }

  p4Y -= 140;

  // 3. Declaración de Cierre y Formalización
  page4.drawText(
    "Dada en la ciudad de Popayán, departamento del Cauca, a los trece (13) días del mes de noviembre de 2026.",
    {
      x: MARGIN_LEFT,
      y: p4Y,
      size: 8,
      font: fontBold,
      color: COLOR_NAVY,
    },
  );
  p4Y -= 12;
  page4.drawText(
    "En constancia de lo anterior, firman los representantes del Comité Técnico y Directivo de la Convocatoria:",
    {
      x: MARGIN_LEFT,
      y: p4Y,
      size: 7.5,
      font: fontReg,
      color: COLOR_MUTED,
    },
  );

  p4Y -= 45;

  // Bloque de 3 Firmas Institucionales
  const firmaColW = (CONTENT_WIDTH - 30) / 3;

  // Firma 1: Comité Evaluador
  const f1X = MARGIN_LEFT;
  page4.drawLine({
    start: { x: f1X, y: p4Y },
    end: { x: f1X + firmaColW, y: p4Y },
    thickness: 1,
    color: COLOR_NAVY,
  });
  page4.drawText("Comité Técnico Evaluador", {
    x: f1X + 5,
    y: p4Y - 12,
    size: 7.5,
    font: fontBold,
    color: COLOR_NAVY,
  });
  page4.drawText("Convocatoria Cauca INNOVA", {
    x: f1X + 5,
    y: p4Y - 21,
    size: 6.5,
    font: fontReg,
    color: COLOR_MUTED,
  });

  // Firma 2: Uniautónoma del Cauca
  const f2X = MARGIN_LEFT + firmaColW + 15;
  page4.drawLine({
    start: { x: f2X, y: p4Y },
    end: { x: f2X + firmaColW, y: p4Y },
    thickness: 1,
    color: COLOR_NAVY,
  });
  page4.drawText("Dirección de Investigación y Extensión", {
    x: f2X + 5,
    y: p4Y - 12,
    size: 7.5,
    font: fontBold,
    color: COLOR_NAVY,
  });
  page4.drawText("Corporación Universitaria Autónoma", {
    x: f2X + 5,
    y: p4Y - 21,
    size: 6.5,
    font: fontReg,
    color: COLOR_MUTED,
  });

  // Firma 3: Gobernación del Cauca
  const f3X = MARGIN_LEFT + (firmaColW + 15) * 2;
  page4.drawLine({
    start: { x: f3X, y: p4Y },
    end: { x: f3X + firmaColW, y: p4Y },
    thickness: 1,
    color: COLOR_NAVY,
  });
  page4.drawText("Sec. Desarrollo Económico y Competitividad", {
    x: f3X + 5,
    y: p4Y - 12,
    size: 7.5,
    font: fontBold,
    color: COLOR_NAVY,
  });
  page4.drawText("Gobernación del Cauca", {
    x: f3X + 5,
    y: p4Y - 21,
    size: 6.5,
    font: fontReg,
    color: COLOR_MUTED,
  });

  dibujarPieDePagina(page4, 4, TOTAL_PAGINAS, fontReg, fontBold);

  // ==========================================================================
  // SERIALIZACIÓN Y GENERACIÓN DE SALIDAS
  // ==========================================================================
  const pdfBytes = await pdfDoc.save();
  const buffer = Buffer.from(pdfBytes);
  const base64 = buffer.toString("base64");
  const fechaHoy = new Date().toISOString().slice(0, 10);
  const nombreArchivo = `Cauca_INNOVA_Seleccionados_${fechaHoy}.pdf`;

  return {
    pdfBytes,
    buffer,
    base64,
    nombreArchivo,
  };
}
