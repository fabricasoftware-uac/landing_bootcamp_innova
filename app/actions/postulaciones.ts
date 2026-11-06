"use server";

import { headers } from "next/headers";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import type { TipoDocumentoAdjunto } from "@/lib/supabase/types";
import { parseBooleanValue, sanitizeFileName } from "@/lib/utils/formatters";
import { optimizarPdf } from "@/lib/utils/optimizar-pdf";
import { revisarArchivo, type TipoDetectado } from "@/lib/validations/archivos";
import { crearLimitador } from "@/lib/validations/limite-tasa";
import {
  type ActionResult,
  normalizarBooleanoEstricto,
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

const MENSAJE_ERROR_RADICACION =
  "No pudimos radicar tu postulación en este momento. Tus datos siguen en el formulario: inténtalo de nuevo en unos minutos.";

const MENSAJE_DATOS_ILEGIBLES =
  "No pudimos leer los datos del formulario. Recarga la página e inténtalo de nuevo.";
const MENSAJE_LIMITE =
  "Recibimos demasiados intentos desde esta conexión. Espera un rato e inténtalo de nuevo.";

const MAX_LONGITUD_JSON = 64 * 1024;
const MAX_NOMBRE_ARCHIVO = 120;
const INTENTOS_POR_HORA = 10;
const UNA_HORA_MS = 60 * 60 * 1000;
// Trampa para bots: el formulario debe enviarlo vacío y oculto. Ver docs/seguridad.md.
const CAMPO_TRAMPA = "sitio_web";

const consumirIntento = crearLimitador(INTENTOS_POR_HORA, UNA_HORA_MS);

async function obtenerIp(): Promise<string | null> {
  const cabeceras = await headers();
  return (
    cabeceras.get("x-real-ip") ??
    cabeceras.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    null
  );
}

function leerJson(valor: unknown): { valido: boolean; dato?: unknown } {
  if (typeof valor !== "string" || valor.trim() === "") return { valido: true };
  if (valor.length > MAX_LONGITUD_JSON) return { valido: false };
  try {
    return { valido: true, dato: JSON.parse(valor) };
  } catch {
    return { valido: false };
  }
}

function esObjetoPlano(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

function nombreOriginalSeguro(
  nombre: string,
  respaldo: string,
  extension: string,
): string {
  const base = sanitizeFileName(nombre)
    .replace(/\.[^.]*$/, "")
    .replace(/\.{2,}/g, ".")
    .replace(/^\.+/, "")
    .slice(0, MAX_NOMBRE_ARCHIVO);
  return `${base || respaldo}.${extension}`;
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
  // Se crea dentro del try: si falta configuración no debe romper la acción con un throw crudo.
  let adminClient: ReturnType<typeof getAdminSupabaseClient> | null = null;

  try {
    const ip = await obtenerIp();
    if (ip && !consumirIntento(ip)) {
      return { success: false, error: MENSAJE_LIMITE };
    }

    if (formData.get(CAMPO_TRAMPA)) {
      return { success: false, error: MENSAJE_ERROR_RADICACION };
    }

    adminClient = getAdminSupabaseClient();

    // 1. Extraer datos del FormData (soporta tanto JSON 'datos'/'payload' como campos directos)
    const datosRaw = formData.get("datos") ?? formData.get("payload");
    const datosLeidos = leerJson(datosRaw);
    if (
      !datosLeidos.valido ||
      (datosLeidos.dato !== undefined && !esObjetoPlano(datosLeidos.dato))
    ) {
      return { success: false, error: MENSAJE_DATOS_ILEGIBLES };
    }
    const baseData: Record<string, unknown> = esObjetoPlano(datosLeidos.dato)
      ? datosLeidos.dato
      : {};

    // Procesar integrantes
    let rawIntegrantes: unknown = baseData.integrantes;
    if (!rawIntegrantes) {
      rawIntegrantes = leerJson(formData.get("integrantes")).dato;
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
            es_menor_edad: normalizarBooleanoEstricto(menor),
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
            es_menor_edad: normalizarBooleanoEstricto(rec.es_menor_edad),
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
    // baseData va primero: sus claves desconocidas llegan a Zod, que las rechaza.
    const rawPostulacion = {
      ...baseData,
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

    // 3. Preparar subida de archivos en una carpeta con nombre no adivinable
    const carpeta = `postulacion_${crypto.randomUUID()}`;

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

    // Se revisan todos antes de subir nada: un archivo falso no deja rastro en Storage.
    const archivosRevisados: Array<{
      tipo: TipoDocumentoAdjunto;
      file: File;
      contenido: Buffer;
      detectado: TipoDetectado;
    }> = [];

    for (const item of archivosPorSubir) {
      const contenido = Buffer.from(await item.file.arrayBuffer());
      const revision = await revisarArchivo(contenido);

      if (!revision.aceptado) {
        return {
          success: false,
          error: revision.mensaje,
          fieldErrors: { [item.tipo]: [revision.mensaje] },
        };
      }

      archivosRevisados.push({ ...item, contenido, detectado: revision.tipo });
    }

    const documentosSubidos: UploadedDocumentRecord[] = [];

    // Ruta, extensión y tipo salen del servidor; nada del nombre original llega a la ruta.
    for (const item of archivosRevisados) {
      const { extension, mime } = item.detectado;
      const storagePath = `${carpeta}/${item.tipo}.${extension}`;
      let fileBuffer: Buffer = item.contenido;
      let finalSize = item.contenido.length;

      if (mime === "application/pdf") {
        const optimizado = await optimizarPdf(item.contenido);
        fileBuffer = optimizado.buffer;
        finalSize = optimizado.tamanoFinal;
      }

      const { error: uploadError } = await adminClient.storage
        .from("postulaciones_docs")
        .upload(storagePath, fileBuffer, {
          contentType: mime,
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
        nombre_original: nombreOriginalSeguro(
          item.file.name,
          item.tipo,
          extension,
        ),
        tamano_bytes: finalSize,
        mime_type: mime,
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
    if (adminClient && uploadedStoragePaths.length > 0) {
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

    if (adminClient && postulacionIdCreada) {
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

    // El detalle técnico queda solo en el log del servidor; al usuario se le da un mensaje fijo.
    console.error("Error al radicar la postulación:", error);

    return {
      success: false,
      error: MENSAJE_ERROR_RADICACION,
    };
  }
}
