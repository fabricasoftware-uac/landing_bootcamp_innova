import type {
  IntegranteInput,
  PostulacionSuccessData,
} from "@/lib/validations/postulacion";

export interface FormularioPostulacionState {
  // Paso 1
  institucion_nombre: string;
  institucion_tipo: "basica_media" | "superior";
  semillero_nombre: string;
  tutor_nombre: string;
  tutor_email: string;
  tutor_telefono: string;

  // Paso 2 (Exactamente 3 integrantes)
  integrantes: [IntegranteInput, IntegranteInput, IntegranteInput];

  // Paso 3
  motivacion_intereses: string;

  // Paso 4
  aval_semillero: File | null;
  doc_identidad_1: File | null;
  doc_identidad_2: File | null;
  doc_identidad_3: File | null;
  autorizacion_menores: File | null;

  // Paso 5
  acepta_terminos: boolean;
  acepta_tratamiento_datos: boolean;
  declara_veracidad: boolean;
}

export const INTEGRANTE_INICIAL: IntegranteInput = {
  nombres_apellidos: "",
  tipo_documento: "TI",
  numero_documento: "",
  correo_electronico: "",
  telefono: "",
  es_menor_edad: true,
};

export const ESTADO_INICIAL_POSTULACION: FormularioPostulacionState = {
  institucion_nombre: "",
  institucion_tipo: "basica_media",
  semillero_nombre: "",
  tutor_nombre: "",
  tutor_email: "",
  tutor_telefono: "",
  integrantes: [
    { ...INTEGRANTE_INICIAL, tipo_documento: "TI", es_menor_edad: true },
    { ...INTEGRANTE_INICIAL, tipo_documento: "TI", es_menor_edad: true },
    { ...INTEGRANTE_INICIAL, tipo_documento: "TI", es_menor_edad: true },
  ],
  motivacion_intereses: "",
  aval_semillero: null,
  doc_identidad_1: null,
  doc_identidad_2: null,
  doc_identidad_3: null,
  autorizacion_menores: null,
  acepta_terminos: false,
  acepta_tratamiento_datos: false,
  declara_veracidad: false,
};

export interface PasoProps {
  datos: FormularioPostulacionState;
  actualizarDatos: (parciales: Partial<FormularioPostulacionState>) => void;
  errores?: Record<string, string>;
  limpiarError?: (campo: string) => void;
}

export interface ExitoPostulacionProps {
  resultado: PostulacionSuccessData;
  datos: FormularioPostulacionState;
  alReiniciar: () => void;
}
