import {
  type EvaluacionInput,
  exportarPostulacionesExcelAction,
  generarUrlDocumentoAction,
  guardarEvaluacionAction,
  type RespuestaAdmin,
} from "@/app/actions/admin";

/** Las pantallas reciben las acciones: así la vista de muestra nunca toca el servidor. */
export interface AccionesPanel {
  guardarEvaluacion: (
    input: EvaluacionInput,
  ) => Promise<RespuestaAdmin<unknown>>;
  urlDocumento: (
    ruta: string,
  ) => Promise<RespuestaAdmin<{ signedUrl: string }>>;
  exportarExcel: () => Promise<
    RespuestaAdmin<{ base64: string; nombreArchivo: string }>
  >;
}

export const ACCIONES_REALES: AccionesPanel = {
  guardarEvaluacion: guardarEvaluacionAction,
  urlDocumento: generarUrlDocumentoAction,
  exportarExcel: exportarPostulacionesExcelAction,
};
