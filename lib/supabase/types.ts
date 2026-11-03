export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type InstitucionTipo = "basica_media" | "superior";
export type PostulacionEstado =
  | "pendiente"
  | "habilitado"
  | "no_habilitado"
  | "seleccionado";
export type TipoDocumentoAdjunto =
  | "aval_semillero"
  | "doc_identidad_1"
  | "doc_identidad_2"
  | "doc_identidad_3"
  | "autorizacion_menores";

export interface Database {
  public: {
    Tables: {
      postulaciones: {
        Row: {
          id: string;
          radicado_codigo: string;
          institucion_nombre: string;
          institucion_tipo: InstitucionTipo;
          semillero_nombre: string;
          tutor_nombre: string;
          tutor_email: string;
          tutor_telefono: string;
          motivacion_intereses: string;
          estado: PostulacionEstado;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          radicado_codigo?: string;
          institucion_nombre: string;
          institucion_tipo: InstitucionTipo;
          semillero_nombre: string;
          tutor_nombre: string;
          tutor_email: string;
          tutor_telefono: string;
          motivacion_intereses: string;
          estado?: PostulacionEstado;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          radicado_codigo?: string;
          institucion_nombre?: string;
          institucion_tipo?: InstitucionTipo;
          semillero_nombre?: string;
          tutor_nombre?: string;
          tutor_email?: string;
          tutor_telefono?: string;
          motivacion_intereses?: string;
          estado?: PostulacionEstado;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      integrantes: {
        Row: {
          id: string;
          postulacion_id: string;
          orden_integrante: number;
          nombres_apellidos: string;
          tipo_documento: string;
          numero_documento: string;
          correo_electronico: string;
          telefono: string;
          es_menor_edad: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          postulacion_id: string;
          orden_integrante: number;
          nombres_apellidos: string;
          tipo_documento: string;
          numero_documento: string;
          correo_electronico: string;
          telefono: string;
          es_menor_edad?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          postulacion_id?: string;
          orden_integrante?: number;
          nombres_apellidos?: string;
          tipo_documento?: string;
          numero_documento?: string;
          correo_electronico?: string;
          telefono?: string;
          es_menor_edad?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "integrantes_postulacion_id_fkey";
            columns: ["postulacion_id"];
            isOneToOne: false;
            referencedRelation: "postulaciones";
            referencedColumns: ["id"];
          },
        ];
      };
      documentos_postulacion: {
        Row: {
          id: string;
          postulacion_id: string;
          tipo_documento: TipoDocumentoAdjunto;
          storage_path: string;
          nombre_original: string;
          tamano_bytes: number;
          mime_type: string;
          subido_el: string;
        };
        Insert: {
          id?: string;
          postulacion_id: string;
          tipo_documento: TipoDocumentoAdjunto;
          storage_path: string;
          nombre_original: string;
          tamano_bytes: number;
          mime_type: string;
          subido_el?: string;
        };
        Update: {
          id?: string;
          postulacion_id?: string;
          tipo_documento?: TipoDocumentoAdjunto;
          storage_path?: string;
          nombre_original?: string;
          tamano_bytes?: number;
          mime_type?: string;
          subido_el?: string;
        };
        Relationships: [
          {
            foreignKeyName: "documentos_postulacion_postulacion_id_fkey";
            columns: ["postulacion_id"];
            isOneToOne: false;
            referencedRelation: "postulaciones";
            referencedColumns: ["id"];
          },
        ];
      };
      evaluaciones: {
        Row: {
          id: string;
          postulacion_id: string;
          cumple_requisitos_habilitante: boolean;
          puntaje_motivacion: number;
          puntaje_pertinencia: number;
          puntaje_diversidad: number;
          puntaje_representacion: number;
          observaciones: string | null;
          evaluado_por: string | null;
          evaluado_el: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          postulacion_id: string;
          cumple_requisitos_habilitante?: boolean;
          puntaje_motivacion?: number;
          puntaje_pertinencia?: number;
          puntaje_diversidad?: number;
          puntaje_representacion?: number;
          observaciones?: string | null;
          evaluado_por?: string | null;
          evaluado_el?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          postulacion_id?: string;
          cumple_requisitos_habilitante?: boolean;
          puntaje_motivacion?: number;
          puntaje_pertinencia?: number;
          puntaje_diversidad?: number;
          puntaje_representacion?: number;
          observaciones?: string | null;
          evaluado_por?: string | null;
          evaluado_el?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "evaluaciones_postulacion_id_fkey";
            columns: ["postulacion_id"];
            isOneToOne: true;
            referencedRelation: "postulaciones";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      set_postulacion_radicado: {
        Args: Record<PropertyKey, never>;
        Returns: unknown;
      };
      handle_updated_at: {
        Args: Record<PropertyKey, never>;
        Returns: unknown;
      };
    };
    Enums: {
      institucion_tipo: InstitucionTipo;
      postulacion_estado: PostulacionEstado;
      tipo_documento_adjunto: TipoDocumentoAdjunto;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

export type Postulacion = Tables<"postulaciones">;
export type PostulacionInsert = TablesInsert<"postulaciones">;
export type PostulacionUpdate = TablesUpdate<"postulaciones">;

export type Integrante = Tables<"integrantes">;
export type IntegranteInsert = TablesInsert<"integrantes">;
export type IntegranteUpdate = TablesUpdate<"integrantes">;

export type DocumentoPostulacion = Tables<"documentos_postulacion">;
export type DocumentoPostulacionInsert = TablesInsert<"documentos_postulacion">;
export type DocumentoPostulacionUpdate = TablesUpdate<"documentos_postulacion">;

export type Evaluacion = Tables<"evaluaciones">;
export type EvaluacionInsert = TablesInsert<"evaluaciones">;
export type EvaluacionUpdate = TablesUpdate<"evaluaciones">;
