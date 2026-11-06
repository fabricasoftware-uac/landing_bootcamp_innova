import { z } from "zod";
import { contieneMarcado, limpiarParrafo } from "./texto-seguro";

export const MAX_OBSERVACIONES = 2000;

const ESTADOS_POSTULACION = [
  "pendiente",
  "habilitado",
  "no_habilitado",
  "seleccionado",
] as const;

function puntaje(maximo: number) {
  return z
    .number()
    .finite()
    .transform((valor) => Math.max(0, Math.min(maximo, Math.round(valor))));
}

export const evaluacionSchema = z.strictObject({
  postulacion_id: z.uuid(),
  cumple_requisitos_habilitante: z.boolean(),
  puntaje_motivacion: puntaje(30),
  puntaje_pertinencia: puntaje(30),
  puntaje_diversidad: puntaje(20),
  puntaje_representacion: puntaje(20),
  observaciones: z
    .string()
    .overwrite(limpiarParrafo)
    .max(MAX_OBSERVACIONES)
    .refine((valor) => !contieneMarcado(valor))
    .nullish(),
  nuevo_estado: z.enum(ESTADOS_POSTULACION),
  // El panel aún lo envía; se acepta y se ignora: el autor sale de la sesión.
  evaluado_por: z.string().max(120).nullish(),
});

/** Solo rutas con la forma que genera el servidor: carpeta/archivo, sin `..`. */
export const rutaDocumentoSchema = z
  .string()
  .max(200)
  .regex(/^[A-Za-z0-9_-]+\/[A-Za-z0-9_.-]+$/)
  .refine((ruta) => !ruta.includes(".."));
