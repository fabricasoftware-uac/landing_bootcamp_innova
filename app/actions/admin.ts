"use server";

import { generarExcelPostulaciones } from "@/lib/excel/generador-excel";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import type {
  DocumentoPostulacion,
  Evaluacion,
  Integrante,
  Postulacion,
  PostulacionEstado,
} from "@/lib/supabase/types";

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

/**
 * Consulta todas las postulaciones con sus integrantes, documentos y evaluaciones,
 * junto con las métricas consolidadas del evento.
 */
export async function obtenerPostulacionesAdminAction(): Promise<
  RespuestaAdmin<{
    postulaciones: PostulacionAdminDetalle[];
    metricas: MetricasAdmin;
  }>
> {
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
    const msg =
      error instanceof Error ? error.message : "Error interno del servidor";
    return {
      success: false,
      error: msg,
    };
  }
}

/**
 * Genera una Signed URL temporal para visualizar o descargar un documento
 * confidencial almacenado en el bucket privado 'postulaciones_docs'.
 */
export async function generarUrlDocumentoAction(
  storagePath: string,
): Promise<RespuestaAdmin<{ signedUrl: string }>> {
  try {
    if (!storagePath || storagePath.trim() === "") {
      return {
        success: false,
        error: "Ruta de almacenamiento no especificada",
      };
    }

    const adminClient = getAdminSupabaseClient();
    const expiresInSeconds = 300; // 5 minutos de vigencia segura

    const { data, error } = await adminClient.storage
      .from("postulaciones_docs")
      .createSignedUrl(storagePath, expiresInSeconds);

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
    const msg =
      error instanceof Error
        ? error.message
        : "Error al generar enlace seguro de documento";
    return {
      success: false,
      error: msg,
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
  try {
    const adminClient = getAdminSupabaseClient();

    // Sanitizar y validar rangos de puntajes
    const motivacion = Math.max(
      0,
      Math.min(30, Number(input.puntaje_motivacion) || 0),
    );
    const pertinencia = Math.max(
      0,
      Math.min(30, Number(input.puntaje_pertinencia) || 0),
    );
    const diversidad = Math.max(
      0,
      Math.min(20, Number(input.puntaje_diversidad) || 0),
    );
    const representacion = Math.max(
      0,
      Math.min(20, Number(input.puntaje_representacion) || 0),
    );

    // 1. Guardar o actualizar evaluación en la tabla 'evaluaciones'
    const { data: evaluacionGuardada, error: errEval } = await adminClient
      .from("evaluaciones")
      .upsert(
        {
          postulacion_id: input.postulacion_id,
          cumple_requisitos_habilitante: Boolean(
            input.cumple_requisitos_habilitante,
          ),
          puntaje_motivacion: motivacion,
          puntaje_pertinencia: pertinencia,
          puntaje_diversidad: diversidad,
          puntaje_representacion: representacion,
          observaciones: input.observaciones
            ? input.observaciones.trim()
            : null,
          evaluado_por: input.evaluado_por || "Comité Técnico Evaluador",
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
        estado: input.nuevo_estado,
        updated_at: new Date().toISOString(),
      })
      .eq("id", input.postulacion_id);

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
    const msg =
      error instanceof Error ? error.message : "Error al guardar la evaluación";
    return {
      success: false,
      error: msg,
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
  try {
    const consulta = await obtenerPostulacionesAdminAction();

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
    const msg =
      error instanceof Error ? error.message : "Error al exportar a Excel";
    return {
      success: false,
      error: msg,
    };
  }
}
