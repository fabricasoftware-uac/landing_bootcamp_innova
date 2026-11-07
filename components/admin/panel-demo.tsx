"use client";

import { useMemo, useState } from "react";
import type {
  EvaluacionInput,
  MetricasAdmin,
  PostulacionAdminDetalle,
} from "@/app/actions/admin";
import type { AccionesPanel } from "@/components/admin/acciones";
import { AuthAdmin } from "@/components/admin/auth-admin";
import { PanelPostulaciones } from "@/components/admin/panel-postulaciones";
import type {
  DocumentoPostulacion,
  Evaluacion,
  InstitucionTipo,
  PostulacionEstado,
  TipoDocumentoAdjunto,
} from "@/lib/supabase/types";

export type VistaDemo = "datos" | "cargando" | "error" | "vacio" | "ingreso";

type Puntajes = [number, number, number, number];

interface Semilla {
  semillero: string;
  institucion: string;
  nivel: InstitucionTipo;
  tutor: string;
  estado: PostulacionEstado;
  fecha: string;
  equipo: [string, string, string];
  menores: number;
  puntajes?: Puntajes;
  sinDocumentos?: TipoDocumentoAdjunto[];
}

/* Datos de muestra: ninguno corresponde a una persona o postulación real. */
const SEMILLAS: Semilla[] = [
  {
    semillero: "Semillero Robótica Verde",
    institucion: "Institución Educativa Vereda Alta",
    nivel: "basica_media",
    tutor: "Lucía Fernanda Muñoz Ortega",
    estado: "pendiente",
    fecha: "2026-11-05T15:20:00Z",
    equipo: [
      "Mateo Silva Pérez",
      "Valentina Chicangana Daza",
      "Samuel Andrés Quira Yule",
    ],
    menores: 2,
    sinDocumentos: ["autorizacion_menores"],
  },
  {
    semillero: "Semillero Agua Viva del Macizo",
    institucion: "Universidad del Macizo Andino",
    nivel: "superior",
    tutor: "Hernán Darío Campo Velasco",
    estado: "seleccionado",
    fecha: "2026-11-04T19:42:00Z",
    equipo: [
      "Daniela Ipia Conejo",
      "Juan Esteban Paz Mosquera",
      "Laura Sofía Zúñiga Rengifo",
    ],
    menores: 0,
    puntajes: [28, 27, 18, 17],
  },
  {
    semillero: "Café y Datos",
    institucion: "Colegio Técnico Agropecuario La Meseta",
    nivel: "basica_media",
    tutor: "Marta Cecilia Bolaños",
    estado: "habilitado",
    fecha: "2026-11-04T14:05:00Z",
    equipo: [
      "Nicolás Guauña Tunubalá",
      "Isabella Ruiz Calambás",
      "Kevin Yalanda Pillimué",
    ],
    menores: 3,
    puntajes: [22, 24, 15, 14],
  },
  {
    semillero: "Telares que Calculan",
    institucion: "Institución Educativa Indígena Río Claro",
    nivel: "basica_media",
    tutor: "Óscar Iván Tombé",
    estado: "seleccionado",
    fecha: "2026-11-03T21:10:00Z",
    equipo: [
      "Yuliana Trochez Pechené",
      "Brayan Ulcué Dagua",
      "María José Sánchez Noscué",
    ],
    menores: 3,
    puntajes: [29, 26, 20, 18],
  },
  {
    semillero: "Bioinsumos del Pacífico",
    institucion: "Fundación Universitaria Costa Caucana",
    nivel: "superior",
    tutor: "Adriana Lucumí Carabalí",
    estado: "habilitado",
    fecha: "2026-11-03T16:33:00Z",
    equipo: [
      "Jhon Fredy Angulo Caicedo",
      "Sara Lucía Riascos Grueso",
      "Andrés Felipe Sinisterra Mina",
    ],
    menores: 0,
    puntajes: [20, 21, 16, 12],
  },
  {
    semillero: "Energías del Patía",
    institucion: "Institución Educativa Valle Caliente",
    nivel: "basica_media",
    tutor: "Fabio Nelson Ordóñez",
    estado: "no_habilitado",
    fecha: "2026-11-02T20:18:00Z",
    equipo: [
      "Camila Andrea Hoyos Muñoz",
      "Santiago Papamija Ruiz",
      "Ana María Gaviria Solarte",
    ],
    menores: 2,
    puntajes: [12, 10, 8, 6],
    sinDocumentos: ["aval_semillero", "doc_identidad_3"],
  },
  {
    semillero: "Prototipos para la Tierra",
    institucion: "Corporación Universitaria Sierra Blanca",
    nivel: "superior",
    tutor: "Paola Andrea Sandoval Chaux",
    estado: "pendiente",
    fecha: "2026-11-02T13:47:00Z",
    equipo: [
      "Diego Alejandro Fernández Ledezma",
      "Natalia Cerón Astudillo",
      "Felipe Ramírez Quintero",
    ],
    menores: 0,
  },
  {
    semillero: "Pequeños Ingenieros de Timbío",
    institucion: "Colegio Rural Alto Bonito",
    nivel: "basica_media",
    tutor: "Ruth Elena Vidal",
    estado: "pendiente",
    fecha: "2026-11-01T17:02:00Z",
    equipo: [
      "Emiliano Vargas Tobar",
      "Salomé Rodríguez Dorado",
      "Tomás Guzmán Erazo",
    ],
    menores: 3,
  },
];

const MOTIVACION = `Nuestro semillero nació para resolver un problema que vemos todos los días en la vereda: el agua de las quebradas llega turbia después de las lluvias y nadie sabe cuándo es segura para las familias.

Queremos llegar al bootcamp con un primer prototipo de sensor de bajo costo, construido con piezas impresas en 3D, que avise por mensaje de texto a la junta de acción comunal. Ya hicimos mediciones durante dos meses con el acompañamiento de nuestra tutora.

Lo que más nos motiva es aprender a pasar de una idea en el cuaderno a un objeto que funcione, y volver a nuestra comunidad con algo que podamos enseñar a otros estudiantes.`;

const TIPOS_DOCUMENTO: TipoDocumentoAdjunto[] = [
  "aval_semillero",
  "doc_identidad_1",
  "doc_identidad_2",
  "doc_identidad_3",
  "autorizacion_menores",
];

function crearDocumentos(s: Semilla, id: string): DocumentoPostulacion[] {
  return TIPOS_DOCUMENTO.filter(
    (tipo) =>
      !s.sinDocumentos?.includes(tipo) &&
      (tipo !== "autorizacion_menores" || s.menores > 0),
  ).map((tipo, i) => ({
    id: `${id}-doc-${tipo}`,
    postulacion_id: id,
    tipo_documento: tipo,
    storage_path: `muestra/${id}/${tipo}.pdf`,
    nombre_original: `${tipo}.pdf`,
    tamano_bytes: 184_320 + i * 96_500,
    mime_type: i === 2 ? "image/jpeg" : "application/pdf",
    subido_el: s.fecha,
  }));
}

function crearEvaluacion(s: Semilla, id: string): Evaluacion | null {
  if (!s.puntajes) return null;
  const [motivacion, pertinencia, diversidad, representacion] = s.puntajes;
  return {
    id: `${id}-eval`,
    postulacion_id: id,
    cumple_requisitos_habilitante: s.estado !== "no_habilitado",
    puntaje_motivacion: motivacion,
    puntaje_pertinencia: pertinencia,
    puntaje_diversidad: diversidad,
    puntaje_representacion: representacion,
    observaciones: "",
    evaluado_por: "Comité Técnico Evaluador",
    evaluado_el: s.fecha,
    updated_at: s.fecha,
  };
}

function correo(nombre: string): string {
  const [uno = "", dos = "", tres = ""] = nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .split(" ");
  return `${uno}.${dos}.${tres}@semilleros-ejemplo.edu.co`;
}

function crearPostulacion(s: Semilla, i: number): PostulacionAdminDetalle {
  const id = `demo-${i + 1}`;
  return {
    id,
    radicado_codigo: `INNOVA-2026-${String(SEMILLAS.length - i).padStart(4, "0")}`,
    institucion_nombre: s.institucion,
    institucion_tipo: s.nivel,
    semillero_nombre: s.semillero,
    tutor_nombre: s.tutor,
    tutor_email: correo(s.tutor),
    tutor_telefono: `310 555 ${String(1200 + i * 37)}`,
    motivacion_intereses: MOTIVACION,
    estado: s.estado,
    created_at: s.fecha,
    updated_at: s.fecha,
    integrantes: s.equipo.map((nombre, orden) => ({
      id: `${id}-${orden + 1}`,
      postulacion_id: id,
      orden_integrante: orden + 1,
      nombres_apellidos: nombre,
      tipo_documento: orden < s.menores ? "TI" : "CC",
      numero_documento: `10${i + 1}${orden + 1}555${orden}${i}7`,
      correo_electronico: correo(nombre),
      telefono: `320 555 ${String(3400 + i * 11 + orden)}`,
      es_menor_edad: orden < s.menores,
      created_at: s.fecha,
      updated_at: s.fecha,
    })),
    documentos_postulacion: crearDocumentos(s, id),
    evaluaciones: crearEvaluacion(s, id),
  };
}

function calcularMetricas(lista: PostulacionAdminDetalle[]): MetricasAdmin {
  const contar = (estado: PostulacionEstado) =>
    lista.filter((p) => p.estado === estado).length;
  const seleccionados = contar("seleccionado");
  return {
    total: lista.length,
    pendientes: contar("pendiente"),
    habilitados: contar("habilitado"),
    no_habilitados: contar("no_habilitado"),
    seleccionados,
    cupos_ocupados: seleccionados,
    cupos_totales: 7,
    basica_media: lista.filter((p) => p.institucion_tipo === "basica_media")
      .length,
    superior: lista.filter((p) => p.institucion_tipo === "superior").length,
  };
}

function aplicarEvaluacion(
  p: PostulacionAdminDetalle,
  e: EvaluacionInput,
): PostulacionAdminDetalle {
  const ahora = new Date().toISOString();
  return {
    ...p,
    estado: e.nuevo_estado,
    updated_at: ahora,
    evaluaciones: {
      id: `${p.id}-eval`,
      postulacion_id: p.id,
      cumple_requisitos_habilitante: e.cumple_requisitos_habilitante,
      puntaje_motivacion: e.puntaje_motivacion,
      puntaje_pertinencia: e.puntaje_pertinencia,
      puntaje_diversidad: e.puntaje_diversidad,
      puntaje_representacion: e.puntaje_representacion,
      observaciones: e.observaciones ?? "",
      evaluado_por: e.evaluado_por ?? null,
      evaluado_el: ahora,
      updated_at: ahora,
    },
  };
}

const AVISO_MUESTRA = "En la vista de muestra esta acción no está disponible.";

export function PanelDemo({ vista }: { vista: VistaDemo }) {
  const [lista, setLista] = useState(() =>
    vista === "datos" ? SEMILLAS.map(crearPostulacion) : [],
  );

  // Nada de esto llega al servidor: guardar cambia solo la lista en memoria.
  const acciones = useMemo<AccionesPanel>(
    () => ({
      guardarEvaluacion: async (input) => {
        setLista((previa) =>
          previa.map((p) =>
            p.id === input.postulacion_id ? aplicarEvaluacion(p, input) : p,
          ),
        );
        return { success: true };
      },
      urlDocumento: async () => ({ success: false, error: AVISO_MUESTRA }),
      exportarExcel: async () => ({ success: false, error: AVISO_MUESTRA }),
      eliminarPostulacion: async (id: string) => {
        setLista((previa) => previa.filter((p) => p.id !== id));
        return { success: true };
      },
    }),
    [],
  );

  if (vista === "ingreso") {
    return (
      <main className="bg-papel">
        <AuthAdmin alAutenticar={() => undefined} />
      </main>
    );
  }

  return (
    <PanelPostulaciones
      postulaciones={lista}
      metricas={
        vista === "datos" || vista === "vacio" ? calcularMetricas(lista) : null
      }
      cargando={vista === "cargando"}
      error={
        vista === "error"
          ? "No pudimos cargar las postulaciones. Revisa tu conexión e inténtalo de nuevo."
          : null
      }
      sesion="Vista de muestra sin datos reales"
      acciones={acciones}
      alRecargar={() => undefined}
      alCerrarSesion={() => undefined}
    />
  );
}
