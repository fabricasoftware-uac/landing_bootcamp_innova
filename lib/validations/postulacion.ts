import { z } from "zod";

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
// 1. PASO 1: SEMILLERO E INSTITUCIÓN
// ==============================================================================
export const paso1SemilleroSchema = z.object({
  institucion_nombre: z
    .string()
    .trim()
    .min(3, "El nombre de la institución debe tener al menos 3 caracteres"),
  institucion_tipo: institucionTipoSchema,
  semillero_nombre: z
    .string()
    .trim()
    .min(3, "El nombre del semillero debe tener al menos 3 caracteres"),
  tutor_nombre: z
    .string()
    .trim()
    .min(3, "El nombre del docente tutor debe tener al menos 3 caracteres"),
  tutor_email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Debe proporcionar un correo electrónico válido para el tutor"),
  tutor_telefono: z
    .string()
    .trim()
    .min(7, "El teléfono de contacto del tutor debe tener al menos 7 dígitos"),
});

// ==============================================================================
// 2. PASO 2: INTEGRANTES (EQUIPO DE 3 ESTUDIANTES)
// ==============================================================================
export const integranteSchema = z.object({
  nombres_apellidos: z
    .string()
    .trim()
    .min(3, "Nombres y apellidos deben tener al menos 3 caracteres"),
  tipo_documento: tipoDocumentoIdentidadSchema,
  numero_documento: z
    .string()
    .trim()
    .min(4, "El número de documento debe tener al menos 4 caracteres"),
  correo_electronico: z
    .string()
    .trim()
    .toLowerCase()
    .email("Debe proporcionar un correo electrónico válido"),
  telefono: z
    .string()
    .trim()
    .min(7, "El teléfono de contacto debe tener al menos 7 dígitos"),
  es_menor_edad: z.boolean({
    message: "Debe indicar si el participante es menor de edad",
  }),
});

export const paso2IntegrantesSchema = z.object({
  integrantes: z
    .array(integranteSchema)
    .length(
      3,
      "El equipo de semillero debe estar conformado por exactamente 3 integrantes",
    ),
});

// ==============================================================================
// 3. PASO 3: MOTIVACIÓN E INTERESES
// ==============================================================================
export const paso3MotivacionSchema = z.object({
  motivacion_intereses: z
    .string()
    .trim()
    .min(
      50,
      "La descripción de motivación e intereses debe tener al menos 50 caracteres para argumentar adecuadamente su postulación",
    )
    .max(
      2500,
      "La descripción de motivación no debe exceder los 2500 caracteres",
    ),
});

// ==============================================================================
// 4. PASO 4: DOCUMENTOS ADJUNTOS
// ==============================================================================
export const paso4DocumentosSchema = z.object({
  aval_semillero: archivoRequeridoSchema,
  doc_identidad_1: archivoRequeridoSchema,
  doc_identidad_2: archivoRequeridoSchema,
  doc_identidad_3: archivoRequeridoSchema,
  autorizacion_menores: archivoOpcionalSchema,
});

// ==============================================================================
// 5. PASO 5: DECLARACIÓN Y TÉRMINOS
// ==============================================================================
export const paso5DeclaracionSchema = z.object({
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
});

// ==============================================================================
// 6. POSTULACIÓN COMPLETA (INTEGRAL)
// ==============================================================================
export const postulacionCompletaSchema = z
  .object({
    // Paso 1
    institucion_nombre: z
      .string()
      .trim()
      .min(3, "El nombre de la institución debe tener al menos 3 caracteres"),
    institucion_tipo: institucionTipoSchema,
    semillero_nombre: z
      .string()
      .trim()
      .min(3, "El nombre del semillero debe tener al menos 3 caracteres"),
    tutor_nombre: z
      .string()
      .trim()
      .min(3, "El nombre del docente tutor debe tener al menos 3 caracteres"),
    tutor_email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Debe proporcionar un correo electrónico válido para el tutor"),
    tutor_telefono: z
      .string()
      .trim()
      .min(7, "El teléfono del tutor debe tener al menos 7 dígitos"),

    // Paso 2
    integrantes: z
      .array(integranteSchema)
      .length(
        3,
        "El equipo de semillero debe estar conformado por exactamente 3 integrantes",
      ),

    // Paso 3
    motivacion_intereses: z
      .string()
      .trim()
      .min(
        50,
        "La motivación e intereses debe tener al menos 50 caracteres para justificar la postulación",
      )
      .max(2500, "La motivación no puede exceder 2500 caracteres"),

    // Paso 4
    aval_semillero: archivoRequeridoSchema,
    doc_identidad_1: archivoRequeridoSchema,
    doc_identidad_2: archivoRequeridoSchema,
    doc_identidad_3: archivoRequeridoSchema,
    autorizacion_menores: archivoOpcionalSchema,

    // Paso 5
    acepta_terminos: z.literal(true, {
      message: "Debes aceptar los Términos de Referencia de Cauca INNOVA",
    }),
    acepta_tratamiento_datos: z.literal(true, {
      message:
        "Debes aceptar la autorización de tratamiento de datos personales",
    }),
    declara_veracidad: z.literal(true, {
      message: "Debes certificar la veracidad de la información registrada",
    }),
  })
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
          code: z.ZodIssueCode.custom,
          path: ["autorizacion_menores"],
          message:
            "Al menos uno de los integrantes es menor de 18 años. Es obligatorio adjuntar el formato de autorización de padres o acudientes firmado.",
        });
      }
    }
  });

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
