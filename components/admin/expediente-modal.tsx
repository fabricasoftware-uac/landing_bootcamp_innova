"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  type RefObject,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { PostulacionAdminDetalle } from "@/app/actions/admin";
import type { AccionesPanel } from "@/components/admin/acciones";
import { EstadoMarca } from "@/components/admin/estado-marca";
import {
  type BorradorEvaluacion,
  ExpedienteEvaluacion,
} from "@/components/admin/expediente-evaluacion";
import {
  PestanaDocumentos,
  PestanaEquipo,
  PestanaMotivacion,
  PestanaResumen,
} from "@/components/admin/expediente-pestanas";
import {
  IconoChevronDerecha,
  IconoChevronIzquierda,
  IconoFlechaIzquierda,
  IconoPapelera,
} from "@/components/admin/iconos";

interface ExpedienteModalProps {
  postulacion: PostulacionAdminDetalle;
  /** Lugar en la lista de trabajo; -1 si ya no está en ella. */
  posicion: number;
  total: number;
  acciones: AccionesPanel;
  borradores: Map<string, BorradorEvaluacion>;
  alMover: (destino: number) => void;
  alCerrar: () => void;
  alActualizar: () => void;
  alSolicitarEliminar?: (postulacion: PostulacionAdminDetalle) => void;
}

type Pestana =
  | "resumen"
  | "equipo"
  | "motivacion"
  | "documentos"
  | "evaluacion";

const PESTANAS: { id: Pestana; etiqueta: string }[] = [
  { id: "resumen", etiqueta: "Resumen" },
  { id: "equipo", etiqueta: "Equipo" },
  { id: "motivacion", etiqueta: "Motivación" },
  { id: "documentos", etiqueta: "Documentos" },
  { id: "evaluacion", etiqueta: "Evaluación" },
];

const SELECTOR_FOCO =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const CONSULTA_ANCHA = "(min-width: 1100px)";

function suscribirAncho(alCambiar: () => void) {
  const consulta = window.matchMedia(CONSULTA_ANCHA);
  consulta.addEventListener("change", alCambiar);
  return () => consulta.removeEventListener("change", alCambiar);
}

/** En pantallas anchas la evaluación es columna fija; en las demás, una pestaña. */
function useColumnaFija(): boolean {
  return useSyncExternalStore(
    suscribirAncho,
    () => window.matchMedia(CONSULTA_ANCHA).matches,
    () => true,
  );
}

function esCampo(objetivo: EventTarget | null): boolean {
  return (
    objetivo instanceof HTMLElement &&
    objetivo.closest("input, textarea, select, [contenteditable]") !== null
  );
}

function atraparFoco(e: KeyboardEvent, panel: HTMLElement) {
  const foco = Array.from(
    panel.querySelectorAll<HTMLElement>(SELECTOR_FOCO),
  ).filter((el) => el.offsetParent !== null);
  const primero = foco[0];
  const ultimo = foco[foco.length - 1];
  if (!primero || !ultimo) {
    e.preventDefault();
    return;
  }
  const activo = document.activeElement;
  if (e.shiftKey && (activo === primero || activo === panel)) {
    e.preventDefault();
    ultimo.focus();
  } else if (!e.shiftKey && activo === ultimo) {
    e.preventDefault();
    primero.focus();
  }
}

/** Foco atrapado, Esc, flechas y bloqueo de scroll mientras el expediente está abierto. */
function useDialogoExpediente(
  panel: RefObject<HTMLElement | null>,
  alCerrar: () => void,
  alPasar: (paso: number) => void,
) {
  const manejadores = useRef({ alCerrar, alPasar });
  manejadores.current = { alCerrar, alPasar };

  useEffect(() => {
    const previo = document.activeElement as HTMLElement | null;
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.focus();

    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        manejadores.current.alCerrar();
      } else if (e.key === "Tab" && panel.current) {
        atraparFoco(e, panel.current);
      } else if (
        (e.key === "ArrowLeft" || e.key === "ArrowRight") &&
        !esCampo(e.target) &&
        !e.altKey &&
        !e.ctrlKey &&
        !e.metaKey
      ) {
        e.preventDefault();
        manejadores.current.alPasar(e.key === "ArrowLeft" ? -1 : 1);
      }
    };

    document.addEventListener("keydown", alTeclear);
    return () => {
      document.removeEventListener("keydown", alTeclear);
      document.body.style.overflow = overflowPrevio;
      previo?.focus();
    };
  }, [panel]);
}

function BarraExpediente({
  p,
  posicion,
  total,
  alCerrar,
  alPasar,
  alSolicitarEliminar,
}: {
  p: PostulacionAdminDetalle;
  posicion: number;
  total: number;
  alCerrar: () => void;
  alPasar: (paso: number) => void;
  alSolicitarEliminar?: (p: PostulacionAdminDetalle) => void;
}) {
  return (
    <header className="adm-exp-barra">
      <button
        type="button"
        className="adm-boton adm-boton-fantasma"
        onClick={alCerrar}
        aria-label="Volver a postulaciones"
      >
        <IconoFlechaIzquierda />
        <span className="adm-solo-ancho">Postulaciones</span>
      </button>
      <div className="adm-exp-titulo">
        <h2 id="titulo-expediente">{p.semillero_nombre}</h2>
        <p>
          <span className="adm-exp-codigo">{p.radicado_codigo}</span>
          <span className="adm-solo-ancho"> · {p.institucion_nombre}</span>
        </p>
      </div>
      <EstadoMarca estado={p.estado} />
      {alSolicitarEliminar && (
        <button
          type="button"
          className="adm-boton adm-boton-peligro-suave"
          onClick={() => alSolicitarEliminar(p)}
          title="Eliminar postulación definitivamente"
          aria-label={`Eliminar postulación ${p.radicado_codigo}`}
        >
          <IconoPapelera />
          <span className="adm-solo-ancho">Eliminar</span>
        </button>
      )}
      <nav className="adm-exp-paso" aria-label="Pasar de postulación">
        {posicion >= 0 && (
          <span aria-live="polite">
            {posicion + 1} de {total}
          </span>
        )}
        <button
          type="button"
          className="adm-boton adm-boton-icono"
          aria-label="Postulación anterior"
          title="Anterior (flecha izquierda)"
          disabled={posicion <= 0}
          onClick={() => alPasar(-1)}
        >
          <IconoChevronIzquierda />
        </button>
        <button
          type="button"
          className="adm-boton adm-boton-icono"
          aria-label="Postulación siguiente"
          title="Siguiente (flecha derecha)"
          disabled={posicion < 0 || posicion >= total - 1}
          onClick={() => alPasar(1)}
        >
          <IconoChevronDerecha />
        </button>
      </nav>
    </header>
  );
}

function Pestanas({
  activa,
  columnaFija,
  alElegir,
}: {
  activa: Pestana;
  columnaFija: boolean;
  alElegir: (pestana: Pestana) => void;
}) {
  const visibles = columnaFija
    ? PESTANAS.filter((t) => t.id !== "evaluacion")
    : PESTANAS;
  return (
    <div className="adm-pestanas" role="tablist" aria-label="Secciones">
      {visibles.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          id={`pestana-${t.id}`}
          aria-selected={activa === t.id}
          aria-controls="panel-expediente"
          onClick={() => alElegir(t.id)}
        >
          {t.etiqueta}
        </button>
      ))}
    </div>
  );
}

export function ExpedienteModal({
  postulacion,
  posicion,
  total,
  acciones,
  borradores,
  alMover,
  alCerrar,
  alActualizar,
  alSolicitarEliminar,
}: ExpedienteModalProps) {
  const [elegida, setElegida] = useState<Pestana>("resumen");
  const columnaFija = useColumnaFija();
  const panelRef = useRef<HTMLDivElement>(null);
  const reducido = useReducedMotion();

  const alPasar = (paso: number) => {
    const destino = posicion + paso;
    if (posicion >= 0 && destino >= 0 && destino < total) alMover(destino);
  };
  useDialogoExpediente(panelRef, alCerrar, alPasar);

  const activa = columnaFija && elegida === "evaluacion" ? "resumen" : elegida;
  const verDocumentos = () => setElegida("documentos");

  return (
    <motion.div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-expediente"
      tabIndex={-1}
      className="adm-exp"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reducido ? 0.01 : 0.16 }}
    >
      <BarraExpediente
        p={postulacion}
        posicion={posicion}
        total={total}
        alCerrar={alCerrar}
        alPasar={alPasar}
        alSolicitarEliminar={alSolicitarEliminar}
      />
      <Pestanas
        activa={activa}
        columnaFija={columnaFija}
        alElegir={setElegida}
      />
      <div
        key={`contenido-${postulacion.id}`}
        id="panel-expediente"
        role="tabpanel"
        aria-labelledby={`pestana-${activa}`}
        className="adm-exp-contenido"
        data-oculta={activa === "evaluacion"}
      >
        {activa === "resumen" && (
          <PestanaResumen p={postulacion} alVerDocumentos={verDocumentos} />
        )}
        {activa === "equipo" && <PestanaEquipo p={postulacion} />}
        {activa === "motivacion" && <PestanaMotivacion p={postulacion} />}
        {activa === "documentos" && (
          <PestanaDocumentos p={postulacion} acciones={acciones} />
        )}
      </div>
      <ExpedienteEvaluacion
        key={postulacion.id}
        postulacion={postulacion}
        acciones={acciones}
        borradores={borradores}
        oculta={!columnaFija && activa !== "evaluacion"}
        alActualizar={alActualizar}
        alVerDocumentos={verDocumentos}
      />
    </motion.div>
  );
}
