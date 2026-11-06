"use client";

import { useState, useTransition } from "react";
import type {
  EvaluacionInput,
  PostulacionAdminDetalle,
} from "@/app/actions/admin";
import type { AccionesPanel } from "@/components/admin/acciones";
import { contarFaltantes } from "@/components/admin/dominio";
import { IconoMas, IconoMenos } from "@/components/admin/iconos";
import type { PostulacionEstado } from "@/lib/supabase/types";

export interface BorradorEvaluacion {
  habilitante: boolean;
  motivacion: number;
  pertinencia: number;
  diversidad: number;
  representacion: number;
  observaciones: string;
  estado: PostulacionEstado;
}

type ClavePuntaje =
  | "motivacion"
  | "pertinencia"
  | "diversidad"
  | "representacion";

const CRITERIOS: { clave: ClavePuntaje; etiqueta: string; max: number }[] = [
  { clave: "motivacion", etiqueta: "Motivación e intereses", max: 30 },
  { clave: "pertinencia", etiqueta: "Pertinencia de la propuesta", max: 30 },
  { clave: "diversidad", etiqueta: "Diversidad e inclusión", max: 20 },
  {
    clave: "representacion",
    etiqueta: "Representación institucional y territorial",
    max: 20,
  },
];

function desdePostulacion(p: PostulacionAdminDetalle): BorradorEvaluacion {
  const e = p.evaluaciones;
  return {
    habilitante: e?.cumple_requisitos_habilitante ?? true,
    motivacion: e?.puntaje_motivacion || 0,
    pertinencia: e?.puntaje_pertinencia || 0,
    diversidad: e?.puntaje_diversidad || 0,
    representacion: e?.puntaje_representacion || 0,
    observaciones: e?.observaciones || "",
    estado: p.estado,
  };
}

function iguales(a: BorradorEvaluacion, b: BorradorEvaluacion): boolean {
  return (Object.keys(a) as (keyof BorradorEvaluacion)[]).every(
    (clave) => a[clave] === b[clave],
  );
}

function aEntrada(id: string, b: BorradorEvaluacion): EvaluacionInput {
  return {
    postulacion_id: id,
    cumple_requisitos_habilitante: b.habilitante,
    puntaje_motivacion: b.motivacion,
    puntaje_pertinencia: b.pertinencia,
    puntaje_diversidad: b.diversidad,
    puntaje_representacion: b.representacion,
    observaciones: b.observaciones,
    nuevo_estado: b.estado,
    evaluado_por: "Comité Técnico Evaluador",
  };
}

function Criterio({
  id,
  etiqueta,
  max,
  valor,
  alCambiar,
}: {
  id: string;
  etiqueta: string;
  max: number;
  valor: number;
  alCambiar: (valor: number) => void;
}) {
  const fijar = (nuevo: number) =>
    alCambiar(Math.min(max, Math.max(0, Math.round(nuevo) || 0)));

  return (
    <div className="adm-criterio">
      <label htmlFor={id}>
        {etiqueta}
        <span>Pesa {max}%</span>
      </label>
      <div className="adm-paso">
        <button
          type="button"
          aria-label={`Restar un punto a ${etiqueta}`}
          disabled={valor <= 0}
          onClick={() => fijar(valor - 1)}
        >
          <IconoMenos />
        </button>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={0}
          max={max}
          value={valor}
          onChange={(e) => fijar(Number(e.target.value))}
        />
        <button
          type="button"
          aria-label={`Sumar un punto a ${etiqueta}`}
          disabled={valor >= max}
          onClick={() => fijar(valor + 1)}
        >
          <IconoMas />
        </button>
      </div>
    </div>
  );
}

function AvisoDocumentos({
  faltantes,
  alVerDocumentos,
}: {
  faltantes: number;
  alVerDocumentos: () => void;
}) {
  const texto =
    faltantes === 0
      ? "Documentos completos"
      : faltantes === 1
        ? "Falta 1 documento"
        : `Faltan ${faltantes} documentos`;
  return (
    <button
      type="button"
      className="adm-enlace"
      data-falta={faltantes > 0}
      onClick={alVerDocumentos}
    >
      {texto}
    </button>
  );
}

interface EvaluacionProps {
  postulacion: PostulacionAdminDetalle;
  acciones: AccionesPanel;
  borradores: Map<string, BorradorEvaluacion>;
  oculta: boolean;
  alActualizar: () => void;
  alVerDocumentos: () => void;
}

/** Se monta por postulación: el borrador vive aparte para no perderlo al pasar de una a otra. */
export function ExpedienteEvaluacion({
  postulacion,
  acciones,
  borradores,
  oculta,
  alActualizar,
  alVerDocumentos,
}: EvaluacionProps) {
  const guardada = desdePostulacion(postulacion);
  const [borrador, setBorrador] = useState(
    () => borradores.get(postulacion.id) ?? guardada,
  );
  const [mensaje, setMensaje] = useState<{
    texto: string;
    conError: boolean;
  } | null>(null);
  const [guardando, startTransition] = useTransition();

  const sinGuardar = !iguales(borrador, guardada);
  const total =
    borrador.motivacion +
    borrador.pertinencia +
    borrador.diversidad +
    borrador.representacion;

  const cambiar = (parcial: Partial<BorradorEvaluacion>) => {
    const nuevo = { ...borrador, ...parcial };
    setBorrador(nuevo);
    setMensaje(null);
    if (iguales(nuevo, guardada)) borradores.delete(postulacion.id);
    else borradores.set(postulacion.id, nuevo);
  };

  const guardar = () => {
    startTransition(async () => {
      setMensaje(null);
      const res = await acciones.guardarEvaluacion(
        aEntrada(postulacion.id, borrador),
      );
      if (res.success) {
        borradores.delete(postulacion.id);
        setMensaje({ texto: "Evaluación guardada.", conError: false });
        alActualizar();
      } else {
        setMensaje({
          texto:
            res.error ||
            "No pudimos guardar la evaluación. Inténtalo de nuevo en unos minutos.",
          conError: true,
        });
      }
    });
  };

  return (
    <aside
      className="adm-evaluacion"
      data-oculta={oculta}
      aria-label="Evaluación"
    >
      <header className="adm-evaluacion-cabecera">
        <h3>Evaluación</h3>
        <p aria-live="polite">
          <strong>{total}</strong>
          <span> /100</span>
        </p>
      </header>

      <div className="adm-evaluacion-cuerpo">
        <section className="adm-bloque">
          <h4>Requisitos habilitantes</h4>
          <label className="adm-casilla">
            <input
              type="checkbox"
              checked={borrador.habilitante}
              onChange={(e) => cambiar({ habilitante: e.target.checked })}
            />
            <span>Cumple los requisitos habilitantes</span>
          </label>
          <p className="adm-pista">
            Aval del tutor, documentos de los 3 estudiantes y autorización de
            acudientes si aplica.{" "}
            <AvisoDocumentos
              faltantes={contarFaltantes(postulacion)}
              alVerDocumentos={alVerDocumentos}
            />
          </p>
        </section>

        <section className="adm-bloque">
          <h4>Criterios</h4>
          {CRITERIOS.map((c) => (
            <Criterio
              key={c.clave}
              id={`puntaje_${c.clave}`}
              etiqueta={c.etiqueta}
              max={c.max}
              valor={borrador[c.clave]}
              alCambiar={(valor) => cambiar({ [c.clave]: valor })}
            />
          ))}
        </section>

        <section className="adm-bloque">
          <label htmlFor="observaciones">Observaciones del comité</label>
          <textarea
            id="observaciones"
            rows={3}
            value={borrador.observaciones}
            onChange={(e) => cambiar({ observaciones: e.target.value })}
            placeholder="Justificación del puntaje o subsanación requerida"
          />
          <label htmlFor="nuevo_estado">Estado de la postulación</label>
          <select
            id="nuevo_estado"
            className="adm-selector"
            value={borrador.estado}
            onChange={(e) =>
              cambiar({ estado: e.target.value as PostulacionEstado })
            }
          >
            <option value="pendiente">En revisión</option>
            <option value="habilitado">Habilitado (cumple requisitos)</option>
            <option value="no_habilitado">No habilitado</option>
            <option value="seleccionado">
              Seleccionado (uno de los 6 cupos)
            </option>
          </select>
        </section>
      </div>

      <footer className="adm-evaluacion-pie">
        {mensaje && (
          <p
            className="adm-evaluacion-mensaje"
            data-error={mensaje.conError}
            role={mensaje.conError ? "alert" : "status"}
          >
            {mensaje.texto}
          </p>
        )}
        {!mensaje && sinGuardar && (
          <p className="adm-evaluacion-mensaje">Cambios sin guardar</p>
        )}
        <button
          type="button"
          className="adm-boton adm-boton-primario adm-boton-ancho"
          disabled={guardando}
          onClick={guardar}
        >
          {guardando ? "Guardando…" : "Guardar evaluación"}
        </button>
      </footer>
    </aside>
  );
}
