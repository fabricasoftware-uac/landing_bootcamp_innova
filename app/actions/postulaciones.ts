"use server";

import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import type { TipoDocumentoAdjunto } from "@/lib/supabase/types";
import {
  getFileExtension,
  parseBooleanValue,
  sanitizeFileName,
} from "@/lib/utils/formatters";
import {
  type ActionResult,
  type PostulacionCompletaInput,
  type PostulacionSuccessData,
  postulacionCompletaSchema,
} from "@/lib/validations/postulacion";

interface UploadedDocumentRecord {
  tipo_documento: TipoDocumentoAdjunto;
  storage_path: string;
  nombre_original: string;
  tamano_bytes: number;
  mime_type: string;
}

interface RawIntegrantesInput {
  nombres_apellidos?: unknown;
  tipo_documento?: unknown;
  numero_documento?: unknown;
  correo_electronico?: unknown;
  telefono?: unknown;
  es_menor_edad?: unknown;
}

/**
 * Server Action principal para registrar una postulación completa con sus 3 integrantes
 * y sus documentos de soporte almacenados de manera segura en Supabase Storage.
 */
export async function crearPostulacionAction(
  formData: FormData,
): Promise<ActionResult> {
  const uploadedStoragePaths: string[] = [];
  let postulacionIdCreada: string | null = null;
  const adminClient = getAdminSupabaseClient();

  try {
    // 1. Extraer datos del FormData (soporta tanto JSON 'datos'/'payload' como campos directos)
    const datosRaw = formData.get("datos") ?? formData.get("payload");
    let baseData: Record<string, unknown> = {};

    if (typeof datosRaw === "string" && datosRaw.trim() !== "") {
      try {
        baseData = JSON.parse(datosRaw) as Record<string, unknown>;
      } catch {
        return {
          success: false,
          error:
            "El formato de los datos del formulario es inválido (JSON malformado).",
        };
      }
    }

    // Procesar integrantes
    let rawIntegrantes: unknown = baseData.integrantes;
    if (!rawIntegrantes) {
      const integrantesRawStr = formData.get("integrantes");
      if (
        typeof integrantesRawStr === "string" &&
        integrantesRawStr.trim() !== ""
      ) {
        try {
          rawIntegrantes = JSON.parse(integrantesRawStr);
        } catch {
          rawIntegrantes = null;
        }
      }
    }

    // Si aún no hay integrantes, intentar leer por índices (integrantes[0], etc.)
    if (!Array.isArray(rawIntegrantes)) {
      const parsedArray: RawIntegrantesInput[] = [];
      for (let i = 0; i < 3; i++) {
        const nombres =
          formData.get(`integrantes[${i}].nombres_apellidos`) ??
          formData.get(`integrante_${i}_nombres_apellidos`);
        const tipoDoc =
          formData.get(`integrantes[${i}].tipo_documento`) ??
          formData.get(`integrante_${i}_tipo_documento`);
        const numDoc =
          formData.get(`integrantes[${i}].numero_documento`) ??
          formData.get(`integrante_${i}_numero_documento`);
        const email =
          formData.get(`integrantes[${i}].correo_electronico`) ??
          formData.get(`integrante_${i}_correo_electronico`);
        const tel =
          formData.get(`integrantes[${i}].telefono`) ??
          formData.get(`integrante_${i}_telefono`);
        const menor =
          formData.get(`integrantes[${i}].es_menor_edad`) ??
          formData.get(`integrante_${i}_es_menor_edad`);

        if (nombres || tipoDoc || numDoc || email || tel) {
          parsedArray.push({
            nombres_apellidos: nombres,
            tipo_documento: tipoDoc,
            numero_documento: numDoc,
            correo_electronico: email,
            telefono: tel,
            es_menor_edad: parseBooleanValue(menor),
          });
        }
      }
      if (parsedArray.length > 0) {
        rawIntegrantes = parsedArray;
      }
    }

    // Normalizar booleanos de integrantes si viene de JSON
    if (Array.isArray(rawIntegrantes)) {
      rawIntegrantes = rawIntegrantes.map((item: unknown) => {
        if (typeof item === "object" && item !== null) {
          const rec = item as Record<string, unknown>;
          return {
            ...rec,
            es_menor_edad: parseBooleanValue(rec.es_menor_edad),
          };
        }
        return item;
      });
    }

    // Extraer archivos del FormData
    const avalSemillero = formData.get("aval_semillero");
    const docIdentidad1 = formData.get("doc_identidad_1");
    const docIdentidad2 = formData.get("doc_identidad_2");
    const docIdentidad3 = formData.get("doc_identidad_3");
    const autorizacionMenores = formData.get("autorizacion_menores");

    // Construir objeto crudo para validación con Zod
    const rawPostulacion = {
      institucion_nombre:
        baseData.institucion_nombre ?? formData.get("institucion_nombre"),
      institucion_tipo:
        baseData.institucion_tipo ?? formData.get("institucion_tipo"),
      semillero_nombre:
        baseData.semillero_nombre ?? formData.get("semillero_nombre"),
      tutor_nombre: baseData.tutor_nombre ?? formData.get("tutor_nombre"),
      tutor_email: baseData.tutor_email ?? formData.get("tutor_email"),
      tutor_telefono: baseData.tutor_telefono ?? formData.get("tutor_telefono"),
      integrantes: rawIntegrantes,
      motivacion_intereses:
        baseData.motivacion_intereses ?? formData.get("motivacion_intereses"),
      aval_semillero: avalSemillero,
      doc_identidad_1: docIdentidad1,
      doc_identidad_2: docIdentidad2,
      doc_identidad_3: docIdentidad3,
      autorizacion_menores:
        autorizacionMenores instanceof File && autorizacionMenores.size > 0
          ? autorizacionMenores
          : undefined,
      acepta_terminos: parseBooleanValue(
        baseData.acepta_terminos ?? formData.get("acepta_terminos"),
      ),
      acepta_tratamiento_datos: parseBooleanValue(
        baseData.acepta_tratamiento_datos ??
          formData.get("acepta_tratamiento_datos"),
      ),
      declara_veracidad: parseBooleanValue(
        baseData.declara_veracidad ?? formData.get("declara_veracidad"),
      ),
    };

    // 2. Validar con Zod
    const validationResult =
      postulacionCompletaSchema.safeParse(rawPostulacion);

    if (!validationResult.success) {
      const fieldErrors = validationResult.error.flatten().fieldErrors;
      const firstErrorMessage =
        validationResult.error.issues[0]?.message ||
        "Por favor verifica los campos obligatorios del formulario.";

      return {
        success: false,
        error: firstErrorMessage,
        fieldErrors,
      };
    }

    const data: PostulacionCompletaInput = validationResult.data;

    // 3. Preparar subida de archivos con radicado temporal
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 9);
    const radicadoTemporal = `postulacion_${timestamp}_${randomSuffix}`;

    const archivosPorSubir: Array<{
      tipo: TipoDocumentoAdjunto;
      file: File;
    }> = [
      { tipo: "aval_semillero", file: data.aval_semillero },
      { tipo: "doc_identidad_1", file: data.doc_identidad_1 },
      { tipo: "doc_identidad_2", file: data.doc_identidad_2 },
      { tipo: "doc_identidad_3", file: data.doc_identidad_3 },
    ];

    if (data.autorizacion_menores && data.autorizacion_menores.size > 0) {
      archivosPorSubir.push({
        tipo: "autorizacion_menores",
        file: data.autorizacion_menores,
      });
    }

    const documentosSubidos: UploadedDocumentRecord[] = [];

    // Subir cada archivo a Supabase Storage con prefijo único sanitizado
    for (const item of archivosPorSubir) {
      const ext = getFileExtension(item.file);
      const storagePath = `${radicadoTemporal}/${item.tipo}_${timestamp}.${ext}`;
      const fileBuffer = Buffer.from(await item.file.arrayBuffer());

      const { error: uploadError } = await adminClient.storage
        .from("postulaciones_docs")
        .upload(storagePath, fileBuffer, {
          contentType: item.file.type,
          upsert: false,
        });

      if (uploadError) {
        throw new Error(
          `Error al almacenar el archivo ${item.tipo}: ${uploadError.message}`,
        );
      }

      uploadedStoragePaths.push(storagePath);
      documentosSubidos.push({
        tipo_documento: item.tipo,
        storage_path: storagePath,
        nombre_original: sanitizeFileName(
          item.file.name || `${item.tipo}.${ext}`,
        ),
        tamano_bytes: item.file.size,
        mime_type: item.file.type,
      });
    }

    // 4. Inserción atómica en Base de Datos:
    // 4.1 Registro en postulaciones (el trigger asignará automáticamente el radicado oficial)
    const { data: postulacionInsertada, error: postulacionError } =
      await adminClient
        .from("postulaciones")
        .insert({
          institucion_nombre: data.institucion_nombre,
          institucion_tipo: data.institucion_tipo,
          semillero_nombre: data.semillero_nombre,
          tutor_nombre: data.tutor_nombre,
          tutor_email: data.tutor_email,
          tutor_telefono: data.tutor_telefono,
          motivacion_intereses: data.motivacion_intereses,
          estado: "pendiente",
        })
        .select("id, radicado_codigo, institucion_nombre, semillero_nombre")
        .single();

    if (postulacionError || !postulacionInsertada) {
      throw new Error(
        `Error al registrar la postulación: ${postulacionError?.message || "Sin respuesta"}`,
      );
    }

    postulacionIdCreada = postulacionInsertada.id;

    // 4.2 Inserción de los 3 integrantes
    const integrantesInsertData = data.integrantes.map((int, idx) => ({
      postulacion_id: postulacionInsertada.id,
      orden_integrante: idx + 1,
      nombres_apellidos: int.nombres_apellidos,
      tipo_documento: int.tipo_documento,
      numero_documento: int.numero_documento,
      correo_electronico: int.correo_electronico,
      telefono: int.telefono,
      es_menor_edad: int.es_menor_edad,
    }));

    const { error: integrantesError } = await adminClient
      .from("integrantes")
      .insert(integrantesInsertData);

    if (integrantesError) {
      throw new Error(
        `Error al guardar los integrantes del equipo: ${integrantesError.message}`,
      );
    }

    // 4.3 Inserción de los metadatos de documentos
    const documentosInsertData = documentosSubidos.map((doc) => ({
      postulacion_id: postulacionInsertada.id,
      tipo_documento: doc.tipo_documento,
      storage_path: doc.storage_path,
      nombre_original: doc.nombre_original,
      tamano_bytes: doc.tamano_bytes,
      mime_type: doc.mime_type,
    }));

    const { error: documentosError } = await adminClient
      .from("documentos_postulacion")
      .insert(documentosInsertData);

    if (documentosError) {
      throw new Error(
        `Error al registrar los documentos adjuntos: ${documentosError.message}`,
      );
    }

    const resultData: PostulacionSuccessData = {
      radicado_codigo: postulacionInsertada.radicado_codigo,
      postulacion_id: postulacionInsertada.id,
      institucion_nombre: postulacionInsertada.institucion_nombre,
      semillero_nombre: postulacionInsertada.semillero_nombre,
    };

    return {
      success: true,
      data: resultData,
    };
  } catch (error) {
    // 5. Rollback de limpieza preventiva: borrar archivos huérfanos y postulación en caso de falla
    if (uploadedStoragePaths.length > 0) {
      try {
        await adminClient.storage
          .from("postulaciones_docs")
          .remove(uploadedStoragePaths);
      } catch (storageCleanupErr) {
        console.error(
          "Error al limpiar archivos huérfanos en storage:",
          storageCleanupErr,
        );
      }
    }

    if (postulacionIdCreada) {
      try {
        await adminClient
          .from("postulaciones")
          .delete()
          .eq("id", postulacionIdCreada);
      } catch (dbCleanupErr) {
        console.error(
          "Error al hacer rollback de postulación en base de datos:",
          dbCleanupErr,
        );
      }
    }

    const message =
      error instanceof Error
        ? error.message
        : "Ocurrió un error inesperado al procesar la inscripción.";

    return {
      success: false,
      error: message,
    };
  }
}
