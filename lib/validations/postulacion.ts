import { z } from "zod";
import {
  contieneMarcado,
  esNombreDeEntidad,
  esNombreDePersona,
  esNumeroDeDocumento,
  esTelefono,
  limpiarLinea,
  limpiarParrafo,
} from "./texto-seguro";

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const ALLOWED_FILE_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
] as const;

export type AllowedFileMimeType = (typeof ALLOWED_FILE_MIME_TYPES)[number];

export const TIPOS_INSTITUCION = ["basica_media", "superior"] as const;
export type TipoInstitucion = (typeof TIPOS_INSTITUCION)[number];

export const TIPOS_DOCUMENTO_IDENTIDAD = [
  "CC",
  "TI",
  "CE",
  "Pasaporte",
] as const;
export type TipoDocumentoIdentidad = (typeof TIPOS_DOCUMENTO_IDENTIDAD)[number];

export const institucionTipoSchema = z.enum(TIPOS_INSTITUCION, {
  message:
    "Seleccione un tipo de institución válido ('basica_media' o 'superior')",
});

export const tipoDocumentoIdentidadSchema = z.enum(TIPOS_DOCUMENTO_IDENTIDAD, {
  message:
    "Seleccione un tipo de documento válido ('CC', 'TI', 'CE' o 'Pasaporte')",
});

// Validación de archivo individual obligatorio
export const archivoRequeridoSchema = z
  .custom<File>(
    (val) => {
      if (typeof File === "undefined") return false;
      return val instanceof File;
    },
    { message: "Debe adjuntar un archivo válido" },
  )
  .refine((file) => file.size > 0, {
    message: "El archivo adjunto no puede estar vacío",
  })
  .refine((file) => file.size <= MAX_FILE_SIZE_BYTES, {
    message: "El archivo supera el tamaño máximo permitido de 10 MB",
  })
  .refine(
    (file) =>
      ALLOWED_FILE_MIME_TYPES.includes(file.type as AllowedFileMimeType),
    {
      message:
        "Formato de archivo no permitido. Solo se aceptan PDF (.pdf), JPEG (.jpg, .jpeg) o PNG (.png)",
    },
  );

// Validación de archivo opcional
export const archivoOpcionalSchema = z
  .custom<File | null | undefined>(
    (val) => {
      if (val === null || val === undefined) return true;
      if (typeof File === "undefined") return false;
      if (val instanceof File && val.size === 0) return true; // archivo vacío se considera no adjunto
      return val instanceof File;
    },
    { message: "Debe ser un archivo válido" },
  )
  .refine(
    (file) => {
      if (!file || file.size === 0) return true;
      return file.size <= MAX_FILE_SIZE_BYTES;
    },
    { message: "El archivo supera el tamaño máximo permitido de 10 MB" },
  )
  .refine(
    (file) => {
      if (!file || file.size === 0) return true;
      return ALLOWED_FILE_MIME_TYPES.includes(file.type as AllowedFileMimeType);
    },
    {
      message:
        "Formato de archivo no permitido. Solo se aceptan PDF (.pdf), JPEG (.jpg, .jpeg) o PNG (.png)",
    },
  );

// ==============================================================================
// CAMPOS DE TEXTO: longitud máxima, sin invisibles y con lista blanca
// ==============================================================================
export const MAX_NOMBRE = 150;
export const MAX_NUMERO_DOCUMENTO = 20;
export const MAX_CORREO = 254;
export const MAX_MOTIVACION = 2500;

const MENSAJE_CARACTERES_NOMBRE =
  "Usa solo letras, espacios, puntos, apóstrofes o guiones";
const MENSAJE_CARACTERES_ENTIDAD =
  "El nombre contiene caracteres no permitidos, como < o >";

function campoPersona(mensajeMinimo: string) {
  return z
    .string()
    .overwrite(limpiarLinea)
    .min(3, mensajeMinimo)
    .max(MAX_NOMBRE, `No puede superar los ${MAX_NOMBRE} caracteres`)
    .refine(esNombreDePersona, MENSAJE_CARACTERES_NOMBRE);
}

function campoEntidad(mensajeMinimo: string) {
  return z
    .string()
    .overwrite(limpiarLinea)
    .min(3, mensajeMinimo)
    .max(MAX_NOMBRE, `No puede superar los ${MAX_NOMBRE} caracteres`)
    .refine(esNombreDeEntidad, MENSAJE_CARACTERES_ENTIDAD);
}

function campoCorreo(mensaje: string) {
  return z
    .string()
    .overwrite(limpiarLinea)
    .toLowerCase()
    .max(MAX_CORREO, mensaje)
    .email(mensaje);
}

function campoTelefono(mensaje: string) {
  return z.string().overwrite(limpiarLinea).refine(esTelefono, mensaje);
}

function campoMotivacion(mensajeMinimo: string, mensajeMaximo: string) {
  return z
    .string()
    .overwrite(limpiarParrafo)
    .min(50, mensajeMinimo)
    .max(MAX_MOTIVACION, mensajeMaximo)
    .refine(
      (valor) => !contieneMarcado(valor),
      "El texto no puede incluir etiquetas HTML ni código",
    );
}

// ==============================================================================
// 1. PASO 1: SEMILLERO E INSTITUCIÓN
// ==============================================================================
const camposSemillero = {
  institucion_nombre: campoEntidad(
    "El nombre de la institución debe tener al menos 3 caracteres",
  ),
  institucion_tipo: institucionTipoSchema,
  semillero_nombre: campoEntidad(
    "El nombre del semillero debe tener al menos 3 caracteres",
  ),
  tutor_nombre: campoPersona(
    "El nombre del docente tutor debe tener al menos 3 caracteres",
  ),
  tutor_email: campoCorreo(
    "Debe proporcionar un correo electrónico válido para el tutor",
  ),
  tutor_telefono: campoTelefono(
    "El teléfono de contacto del tutor debe tener al menos 7 dígitos",
  ),
};

export const paso1SemilleroSchema = z.object(camposSemillero);

// ==============================================================================
// 2. PASO 2: INTEGRANTES (EQUIPO DE 3 ESTUDIANTES)
// ==============================================================================
export const integranteSchema = z.strictObject({
  nombres_apellidos: campoPersona(
    "Nombres y apellidos deben tener al menos 3 caracteres",
  ),
  tipo_documento: tipoDocumentoIdentidadSchema,
  numero_documento: z
    .string()
    .overwrite(limpiarLinea)
    .min(4, "El número de documento debe tener al menos 4 caracteres")
    .max(
      MAX_NUMERO_DOCUMENTO,
      `El número de documento no puede superar los ${MAX_NUMERO_DOCUMENTO} caracteres`,
    )
    .refine(
      esNumeroDeDocumento,
      "El número de documento solo admite letras, números, puntos o guiones",
    ),
  correo_electronico: campoCorreo(
    "Debe proporcionar un correo electrónico válido",
  ),
  telefono: campoTelefono(
    "El teléfono de contacto debe tener al menos 7 dígitos",
  ),
  es_menor_edad: z.boolean({
    message: "Debe indicar si el participante es menor de edad",
  }),
});

const listaIntegrantes = z
  .array(integranteSchema)
  .length(
    3,
    "El equipo de semillero debe estar conformado por exactamente 3 integrantes",
  );

export const paso2IntegrantesSchema = z.object({
  integrantes: listaIntegrantes,
});

// ==============================================================================
// 3. PASO 3: MOTIVACIÓN E INTERESES
// ==============================================================================
export const paso3MotivacionSchema = z.object({
  motivacion_intereses: campoMotivacion(
    "La descripción de motivación e intereses debe tener al menos 50 caracteres para argumentar adecuadamente su postulación",
    "La descripción de motivación no debe exceder los 2500 caracteres",
  ),
});

// ==============================================================================
// 4. PASO 4: DOCUMENTOS ADJUNTOS
// ==============================================================================
const camposDocumentos = {
  aval_semillero: archivoRequeridoSchema,
  doc_identidad_1: archivoRequeridoSchema,
  doc_identidad_2: archivoRequeridoSchema,
  doc_identidad_3: archivoRequeridoSchema,
  autorizacion_menores: archivoOpcionalSchema,
};

export const paso4DocumentosSchema = z.object(camposDocumentos);

// ==============================================================================
// 5. PASO 5: DECLARACIÓN Y TÉRMINOS
// ==============================================================================
const camposDeclaracion = {
  acepta_terminos: z.literal(true, {
    message:
      "Debes aceptar los Términos de Referencia oficiales de Cauca INNOVA",
  }),
  acepta_tratamiento_datos: z.literal(true, {
    message:
      "Debes autorizar el tratamiento de datos personales conforme a la política de Habeas Data",
  }),
  declara_veracidad: z.literal(true, {
    message:
      "Debes certificar bajo la gravedad de juramento la veracidad de la información diligenciada",
  }),
};

export const paso5DeclaracionSchema = z.object(camposDeclaracion);

// ==============================================================================
// 6. POSTULACIÓN COMPLETA (INTEGRAL)
// ==============================================================================
export const postulacionCompletaSchema = z
  .strictObject(
    {
      ...camposSemillero,
      integrantes: listaIntegrantes,
      motivacion_intereses: campoMotivacion(
        "La motivación e intereses debe tener al menos 50 caracteres para justificar la postulación",
        "La motivación no puede exceder 2500 caracteres",
      ),
      ...camposDocumentos,
      ...camposDeclaracion,
    },
    {
      error: (problema) =>
        problema.code === "unrecognized_keys"
          ? "El formulario incluye campos no reconocidos. Recarga la página e inténtalo de nuevo."
          : undefined,
    },
  )
  .superRefine((val, ctx) => {
    const hayMenoresDeEdad = val.integrantes.some(
      (integrante) => integrante.es_menor_edad,
    );

    if (hayMenoresDeEdad) {
      const archivoAuth = val.autorizacion_menores;
      const esArchivoValido =
        archivoAuth &&
        typeof File !== "undefined" &&
        archivoAuth instanceof File &&
        archivoAuth.size > 0;

      if (!esArchivoValido) {
        ctx.addIssue({
          code: "custom",
          path: ["autorizacion_menores"],
          message:
            "Al menos uno de los integrantes es menor de 18 años. Es obligatorio adjuntar el formato de autorización de padres o acudientes firmado.",
        });
      }
    }
  });

/**
 * A diferencia de parseBooleanValue, deja pasar lo que no reconoce para que Zod lo
 * rechace: un valor raro en es_menor_edad no puede volverse "false" y saltarse la
 * autorización de acudientes.
 */
export function normalizarBooleanoEstricto(valor: unknown): unknown {
  if (typeof valor !== "string") return valor;
  const texto = valor.trim().toLowerCase();
  if (["true", "1", "on", "yes", "si", "sí"].includes(texto)) return true;
  if (["false", "0", "off", "no"].includes(texto)) return false;
  return valor;
}

// ==============================================================================
// TIPOS INFERIDOS Y RESULTADOS DE ACCIÓN
// ==============================================================================
export type Paso1Input = z.infer<typeof paso1SemilleroSchema>;
export type IntegranteInput = z.infer<typeof integranteSchema>;
export type Paso2Input = z.infer<typeof paso2IntegrantesSchema>;
export type Paso3Input = z.infer<typeof paso3MotivacionSchema>;
export type Paso4Input = z.infer<typeof paso4DocumentosSchema>;
export type Paso5Input = z.infer<typeof paso5DeclaracionSchema>;
export type PostulacionCompletaInput = z.infer<
  typeof postulacionCompletaSchema
>;

export interface PostulacionSuccessData {
  radicado_codigo: string;
  postulacion_id: string;
  institucion_nombre: string;
  semillero_nombre: string;
}

export type ActionSuccess<T = PostulacionSuccessData> = {
  success: true;
  data: T;
};

export type ActionError = {
  success: false;
  error: string;
  fieldErrors?: Record<string, string[]>;
};

export type ActionResult<T = PostulacionSuccessData> =
  | ActionSuccess<T>
  | ActionError;
