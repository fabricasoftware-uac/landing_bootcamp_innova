import { type NextRequest, NextResponse } from "next/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { obtenerAdministrador } from "@/lib/supabase/autorizacion";
import { sanitizeFileName } from "@/lib/utils/formatters";
import { rutaDocumentoSchema } from "@/lib/validations/evaluacion";

export const dynamic = "force-dynamic";

const VIGENCIA_ENLACE_SEGUNDOS = 120;

export async function GET(request: NextRequest) {
  const admin = await obtenerAdministrador();
  if (!admin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const path = searchParams.get("path");

  if (!path) {
    return NextResponse.json(
      { error: "Falta el parámetro 'path'" },
      { status: 400 },
    );
  }

  const validacionRuta = rutaDocumentoSchema.safeParse(path);
  if (!validacionRuta.success) {
    return NextResponse.json(
      { error: "Ruta de documento inválida" },
      { status: 400 },
    );
  }

  const rutaValida = validacionRuta.data;

  try {
    const adminClient = getAdminSupabaseClient();

    const { data: documento, error: errDoc } = await adminClient
      .from("documentos_postulacion")
      .select("storage_path, nombre_original, mime_type")
      .eq("storage_path", rutaValida)
      .maybeSingle();

    if (errDoc) {
      console.error("Error al consultar documento en base de datos:", errDoc);
      return NextResponse.json(
        { error: "Error al consultar el documento" },
        { status: 500 },
      );
    }

    if (!documento) {
      return NextResponse.json(
        { error: "Documento no encontrado o no disponible" },
        { status: 404 },
      );
    }

    const descargar = searchParams.get("descargar") === "1";
    const opcionesStorage = descargar
      ? { download: sanitizeFileName(documento.nombre_original) }
      : undefined;

    const { data, error: errSigned } = await adminClient.storage
      .from("postulaciones_docs")
      .createSignedUrl(
        documento.storage_path,
        VIGENCIA_ENLACE_SEGUNDOS,
        opcionesStorage,
      );

    if (errSigned || !data?.signedUrl) {
      console.error("Error al generar signed URL en Storage:", errSigned);
      return NextResponse.json(
        { error: "No se pudo generar el enlace del documento" },
        { status: 500 },
      );
    }

    if (searchParams.get("formato") === "json") {
      return NextResponse.json({
        success: true,
        signedUrl: data.signedUrl,
        nombreOriginal: documento.nombre_original,
        mimeType: documento.mime_type,
      });
    }

    return NextResponse.redirect(data.signedUrl, 307);
  } catch (error) {
    console.error("Error inesperado en route handler de documento:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
