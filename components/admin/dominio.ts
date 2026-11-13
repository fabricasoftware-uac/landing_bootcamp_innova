import type { PostulacionAdminDetalle } from "@/app/actions/admin";
import type {
  DocumentoPostulacion,
  InstitucionTipo,
  PostulacionEstado,
  TipoDocumentoAdjunto,
} from "@/lib/supabase/types";

export const ETIQUETA_ESTADO: Record<PostulacionEstado, string> = {
  pendiente: "En revisión",
  habilitado: "Habilitado",
  no_habilitado: "No habilitado",
  seleccionado: "Seleccionado",
};

export const ORDEN_ESTADO: Record<PostulacionEstado, number> = {
  seleccionado: 0,
  habilitado: 1,
  pendiente: 2,
  no_habilitado: 3,
};

export const ETIQUETA_NIVEL: Record<InstitucionTipo, string> = {
  basica_media: "Básica y media",
  superior: "Superior",
};

export const NIVEL_LARGO: Record<InstitucionTipo, string> = {
  basica_media: "Básica y media",
  superior: "Educación superior",
};

export function puntajeTotal(p: PostulacionAdminDetalle): number | null {
  const e = p.evaluaciones;
  if (!e) return null;
  return (
    e.puntaje_motivacion +
    e.puntaje_pertinencia +
    e.puntaje_diversidad +
    e.puntaje_representacion
  );
}

export function contarMenores(p: PostulacionAdminDetalle): number {
  return p.integrantes.filter((i) => i.es_menor_edad).length;
}

const ZONA = "America/Bogota";

/** Con zona fija: el comité lee siempre la hora de Colombia. */
export function fechaCorta(iso: string): string {
  return new Date(iso)
    .toLocaleDateString("es-CO", {
      day: "numeric",
      month: "short",
      timeZone: ZONA,
    })
    .replace(" de ", " ")
    .replace(".", "");
}

export function fechaLarga(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: ZONA,
  });
}

export function horaCorta(fecha: Date): string {
  return fecha.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: ZONA,
  });
}

export function formatearPeso(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function tipoArchivo(mime: string): string {
  if (mime.includes("pdf")) return "PDF";
  if (mime.includes("png")) return "PNG";
  return mime.startsWith("image/") ? "JPG" : "Archivo";
}

export interface DocumentoEsperado {
  tipo: TipoDocumentoAdjunto;
  nombre: string;
  categoria: string;
  archivo: DocumentoPostulacion | null;
}

function nombreIdentidad(p: PostulacionAdminDetalle, orden: number): string {
  const integrante = p.integrantes.find((i) => i.orden_integrante === orden);
  return integrante
    ? `Documento de ${integrante.nombres_apellidos}`
    : `Documento del estudiante ${orden}`;
}

function documentosRequeridos(
  p: PostulacionAdminDetalle,
): Omit<DocumentoEsperado, "archivo">[] {
  const identidad = "Documento de identidad";
  const lista: Omit<DocumentoEsperado, "archivo">[] = [
    {
      tipo: "aval_semillero",
      nombre: "Aval institucional del semillero",
      categoria: "Aval",
    },
    {
      tipo: "doc_identidad_1",
      nombre: nombreIdentidad(p, 1),
      categoria: identidad,
    },
    {
      tipo: "doc_identidad_2",
      nombre: nombreIdentidad(p, 2),
      categoria: identidad,
    },
    {
      tipo: "doc_identidad_3",
      nombre: nombreIdentidad(p, 3),
      categoria: identidad,
    },
  ];
  const conAutorizacion =
    contarMenores(p) > 0 ||
    p.documentos_postulacion.some(
      (d) => d.tipo_documento === "autorizacion_menores",
    );
  if (conAutorizacion) {
    lista.push({
      tipo: "autorizacion_menores",
      nombre: "Autorización de padres o acudientes",
      categoria: "Autorización",
    });
  }
  return lista;
}

/** Lo que el expediente debería traer, con el archivo cargado si existe. */
export function documentosEsperados(
  p: PostulacionAdminDetalle,
): DocumentoEsperado[] {
  return documentosRequeridos(p).map((d) => ({
    ...d,
    archivo:
      p.documentos_postulacion.find((a) => a.tipo_documento === d.tipo) ?? null,
  }));
}

export function contarFaltantes(p: PostulacionAdminDetalle): number {
  return documentosEsperados(p).filter((d) => !d.archivo).length;
}

export function descargarExcel(base64: string, nombreArchivo: string): void {
  const binario = atob(base64);
  const bytes = Uint8Array.from(binario, (c) => c.charCodeAt(0));
  const blob = new Blob([bytes], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombreArchivo;
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);
}
