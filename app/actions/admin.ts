"use server";

import { generarExcelPostulaciones } from "@/lib/excel/generador-excel";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { obtenerAdministrador } from "@/lib/supabase/autorizacion";
import type {
  DocumentoPostulacion,
  Evaluacion,
  Integrante,
  Postulacion,
  PostulacionEstado,
} from "@/lib/supabase/types";
import { sanitizeFileName } from "@/lib/utils/formatters";
import {
  evaluacionSchema,
  rutaDocumentoSchema,
} from "@/lib/validations/evaluacion";

export interface PostulacionAdminDetalle extends Postulacion {
  integrantes: Integrante[];
  documentos_postulacion: DocumentoPostulacion[];
  evaluaciones: Evaluacion | null;
}

export interface MetricasAdmin {
  total: number;
  pendientes: number;
  habilitados: number;
  no_habilitados: number;
  seleccionados: number;
  cupos_ocupados: number;
  cupos_totales: number;
  basica_media: number;
  superior: number;
}

export interface EvaluacionInput {
  postulacion_id: string;
  cumple_requisitos_habilitante: boolean;
  puntaje_motivacion: number;
  puntaje_pertinencia: number;
  puntaje_diversidad: number;
  puntaje_representacion: number;
  observaciones?: string | null;
  nuevo_estado: PostulacionEstado;
  evaluado_por?: string | null;
}

export interface RespuestaAdmin<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface ListadoAdmin {
  postulaciones: PostulacionAdminDetalle[];
  metricas: MetricasAdmin;
}

const MENSAJE_SIN_ACCESO =
  "Tu sesión no tiene acceso a este panel. Inicia sesión de nuevo.";
const MENSAJE_DOCUMENTO_NO_DISPONIBLE =
  "No pudimos abrir el documento. Actualiza la página e inténtalo de nuevo.";
const VIGENCIA_ENLACE_SEGUNDOS = 60;

/** Sin verificación propia: solo la invocan acciones que ya exigieron administrador. */
async function consultarListadoAdmin(): Promise<RespuestaAdmin<ListadoAdmin>> {
  try {
    const adminClient = getAdminSupabaseClient();

    // 1. Obtener todas las postulaciones ordenadas por fecha reciente
    const { data: postulaciones, error: errPostulaciones } = await adminClient
      .from("postulaciones")
      .select("*")
      .order("created_at", { ascending: false });

    if (errPostulaciones) {
      throw new Error(
        `Error al consultar postulaciones: ${errPostulaciones.message}`,
      );
    }

    const postulacionesIds = (postulaciones || []).map((p) => p.id);

    // 2. Obtener integrantes de todas las postulaciones
    let integrantesList: Integrante[] = [];
    if (postulacionesIds.length > 0) {
      const { data: ints, error: errInts } = await adminClient
        .from("integrantes")
        .select("*")
        .in("postulacion_id", postulacionesIds)
        .order("orden_integrante", { ascending: true });

      if (errInts) {
        console.error("Error al consultar integrantes:", errInts);
      } else if (ints) {
        integrantesList = ints;
      }
    }

    // 3. Obtener documentos de todas las postulaciones
    let documentosList: DocumentoPostulacion[] = [];
    if (postulacionesIds.length > 0) {
      const { data: docs, error: errDocs } = await adminClient
        .from("documentos_postulacion")
        .select("*")
        .in("postulacion_id", postulacionesIds)
        .order("subido_el", { ascending: true });

      if (errDocs) {
        console.error("Error al consultar documentos:", errDocs);
      } else if (docs) {
        documentosList = docs;
      }
    }

    // 4. Obtener evaluaciones
    let evaluacionesList: Evaluacion[] = [];
    if (postulacionesIds.length > 0) {
      const { data: evals, error: errEvals } = await adminClient
        .from("evaluaciones")
        .select("*")
        .in("postulacion_id", postulacionesIds);

      if (errEvals) {
        console.error("Error al consultar evaluaciones:", errEvals);
      } else if (evals) {
        evaluacionesList = evals;
      }
    }

    // 5. Cruzar datos
    const postulacionesConDetalle: PostulacionAdminDetalle[] = (
      postulaciones || []
    ).map((p) => {
      const ints = integrantesList.filter((i) => i.postulacion_id === p.id);
      const docs = documentosList.filter((d) => d.postulacion_id === p.id);
      const evaluacion =
        evaluacionesList.find((e) => e.postulacion_id === p.id) || null;

      return {
        ...p,
        integrantes: ints,
        documentos_postulacion: docs,
        evaluaciones: evaluacion,
      };
    });

    // 6. Calcular métricas consolidadas
    const metricas: MetricasAdmin = {
      total: postulacionesConDetalle.length,
      pendientes: postulacionesConDetalle.filter(
        (p) => p.estado === "pendiente",
      ).length,
      habilitados: postulacionesConDetalle.filter(
        (p) => p.estado === "habilitado",
      ).length,
      no_habilitados: postulacionesConDetalle.filter(
        (p) => p.estado === "no_habilitado",
      ).length,
      seleccionados: postulacionesConDetalle.filter(
        (p) => p.estado === "seleccionado",
      ).length,
      cupos_ocupados: postulacionesConDetalle.filter(
        (p) => p.estado === "seleccionado",
      ).length,
      cupos_totales: 7, // 7 equipos máximo según actualización oficial (21 participantes)
      basica_media: postulacionesConDetalle.filter(
        (p) => p.institucion_tipo === "basica_media",
      ).length,
      superior: postulacionesConDetalle.filter(
        (p) => p.institucion_tipo === "superior",
      ).length,
    };

    return {
      success: true,
      data: {
        postulaciones: postulacionesConDetalle,
        metricas,
      },
    };
  } catch (error) {
    console.error("Error al consultar postulaciones:", error);
    return {
      success: false,
      error:
        "No pudimos cargar las postulaciones en este momento. Inténtalo de nuevo en unos minutos.",
    };
  }
}

/**
 * Consulta todas las postulaciones con sus integrantes, documentos y evaluaciones,
 * junto con las métricas consolidadas del evento.
 */
export async function obtenerPostulacionesAdminAction(): Promise<
  RespuestaAdmin<ListadoAdmin>
> {
  if (!(await obtenerAdministrador())) {
    return { success: false, error: MENSAJE_SIN_ACCESO };
  }

  return consultarListadoAdmin();
}

/**
 * Genera una Signed URL de corta vida para descargar un documento del bucket privado
 * 'postulaciones_docs'. La ruta debe pertenecer a un expediente registrado, así una
 * ruta manipulada no alcanza otros objetos del bucket.
 */
export async function generarUrlDocumentoAction(
  storagePath: string,
): Promise<RespuestaAdmin<{ signedUrl: string }>> {
  if (!(await obtenerAdministrador())) {
    return { success: false, error: MENSAJE_SIN_ACCESO };
  }

  const ruta = rutaDocumentoSchema.safeParse(storagePath);
  if (!ruta.success) {
    return { success: false, error: MENSAJE_DOCUMENTO_NO_DISPONIBLE };
  }

  try {
    const adminClient = getAdminSupabaseClient();

    const { data: documento, error: errDocumento } = await adminClient
      .from("documentos_postulacion")
      .select("storage_path, nombre_original")
      .eq("storage_path", ruta.data)
      .maybeSingle();

    if (errDocumento) {
      throw new Error(`Error al ubicar el documento: ${errDocumento.message}`);
    }
    if (!documento) {
      return { success: false, error: MENSAJE_DOCUMENTO_NO_DISPONIBLE };
    }

    // download fuerza Content-Disposition: attachment en la respuesta de Storage.
    const { data, error } = await adminClient.storage
      .from("postulaciones_docs")
      .createSignedUrl(documento.storage_path, VIGENCIA_ENLACE_SEGUNDOS, {
        download: sanitizeFileName(documento.nombre_original),
      });

    if (error || !data?.signedUrl) {
      throw new Error(
        error?.message ||
          "No se pudo generar el enlace firmado para el archivo",
      );
    }

    return {
      success: true,
      data: { signedUrl: data.signedUrl },
    };
  } catch (error) {
    console.error("Error al generar el enlace del documento:", error);
    return {
      success: false,
      error:
        "No pudimos abrir el documento en este momento. Inténtalo de nuevo en unos minutos.",
    };
  }
}

/**
 * Guarda o actualiza la evaluación técnica ponderada según los TDR
 * (Motivación 30%, Pertinencia 30%, Diversidad 20%, Representación 20% = 100 pts)
 * y actualiza el estado de la postulación.
 */
export async function guardarEvaluacionAction(
  input: EvaluacionInput,
): Promise<RespuestaAdmin<Evaluacion>> {
  const administrador = await obtenerAdministrador();
  if (!administrador) {
    return { success: false, error: MENSAJE_SIN_ACCESO };
  }

  const validacion = evaluacionSchema.safeParse(input);
  if (!validacion.success) {
    return {
      success: false,
      error: "Revisa los datos de la evaluación e inténtalo de nuevo.",
    };
  }

  const evaluacion = validacion.data;

  try {
    const adminClient = getAdminSupabaseClient();

    // 1. Guardar o actualizar evaluación en la tabla 'evaluaciones'
    const { data: evaluacionGuardada, error: errEval } = await adminClient
      .from("evaluaciones")
      .upsert(
        {
          postulacion_id: evaluacion.postulacion_id,
          cumple_requisitos_habilitante:
            evaluacion.cumple_requisitos_habilitante,
          puntaje_motivacion: evaluacion.puntaje_motivacion,
          puntaje_pertinencia: evaluacion.puntaje_pertinencia,
          puntaje_diversidad: evaluacion.puntaje_diversidad,
          puntaje_representacion: evaluacion.puntaje_representacion,
          observaciones: evaluacion.observaciones || null,
          evaluado_por: administrador.id,
          evaluado_el: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "postulacion_id" },
      )
      .select()
      .single();

    if (errEval || !evaluacionGuardada) {
      throw new Error(
        `Error al guardar evaluación: ${errEval?.message || "Sin respuesta"}`,
      );
    }

    // 2. Actualizar el estado de la postulación
    const { error: errPostulacion } = await adminClient
      .from("postulaciones")
      .update({
        estado: evaluacion.nuevo_estado,
        updated_at: new Date().toISOString(),
      })
      .eq("id", evaluacion.postulacion_id);

    if (errPostulacion) {
      console.error(
        "Error al actualizar estado de la postulación:",
        errPostulacion,
      );
    }

    return {
      success: true,
      data: evaluacionGuardada,
    };
  } catch (error) {
    console.error("Error al guardar la evaluación:", error);
    return {
      success: false,
      error:
        "No pudimos guardar la evaluación. Inténtalo de nuevo en unos minutos.",
    };
  }
}

/**
 * Motor de exportación estructurada a formato Microsoft Excel (.xlsx) con 3 hojas:
 * 1. "Equipos y Semilleros"
 * 2. "Base de Integrantes"
 * 3. "Matriz de Evaluación"
 */
export async function exportarPostulacionesExcelAction(): Promise<
  RespuestaAdmin<{
    base64: string;
    nombreArchivo: string;
  }>
> {
  if (!(await obtenerAdministrador())) {
    return { success: false, error: MENSAJE_SIN_ACCESO };
  }

  try {
    const consulta = await consultarListadoAdmin();

    if (!consulta.success || !consulta.data) {
      throw new Error(
        consulta.error || "No se pudieron obtener las postulaciones",
      );
    }

    const { postulaciones } = consulta.data;
    const { base64, nombreArchivo } =
      await generarExcelPostulaciones(postulaciones);

    return {
      success: true,
      data: {
        base64,
        nombreArchivo,
      },
    };
  } catch (error) {
    console.error("Error al exportar a Excel:", error);
    return {
      success: false,
      error:
        "No pudimos generar el archivo de Excel en este momento. Inténtalo de nuevo en unos minutos.",
    };
  }
}
