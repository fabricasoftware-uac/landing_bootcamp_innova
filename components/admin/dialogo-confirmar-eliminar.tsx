"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import type { PostulacionAdminDetalle } from "@/app/actions/admin";
import { IconoPapelera } from "@/components/admin/iconos";

export interface DialogoConfirmarEliminarProps {
  postulacion: PostulacionAdminDetalle;
  eliminando: boolean;
  error?: string | null;
  alConfirmar: () => void;
  alCancelar: () => void;
}

const SELECTOR_FOCO =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function atraparFoco(e: KeyboardEvent, contenedor: HTMLElement) {
  const elementos = Array.from(
    contenedor.querySelectorAll<HTMLElement>(SELECTOR_FOCO),
  ).filter((el) => el.offsetParent !== null);
  const primero = elementos[0];
  const ultimo = elementos[elementos.length - 1];

  if (!primero || !ultimo) {
    e.preventDefault();
    return;
  }

  const activo = document.activeElement;
  if (e.shiftKey && (activo === primero || activo === contenedor)) {
    e.preventDefault();
    ultimo.focus();
  } else if (!e.shiftKey && activo === ultimo) {
    e.preventDefault();
    primero.focus();
  }
}

export function DialogoConfirmarEliminar({
  postulacion,
  eliminando,
  error,
  alConfirmar,
  alCancelar,
}: DialogoConfirmarEliminarProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const botonCancelarRef = useRef<HTMLButtonElement>(null);
  const reduceMovimiento = useReducedMotion();

  // Foco inicial en Cancelar por seguridad, bloqueo de scroll y atajo Escape
  useEffect(() => {
    const previo = document.activeElement as HTMLElement | null;
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Foco inicial deliberado en el botón Cancelar para prevenir eliminaciones accidentales
    botonCancelarRef.current?.focus();

    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (!eliminando) {
          e.preventDefault();
          alCancelar();
        }
      } else if (e.key === "Tab" && panelRef.current) {
        atraparFoco(e, panelRef.current);
      }
    };

    document.addEventListener("keydown", alTeclear);
    return () => {
      document.removeEventListener("keydown", alTeclear);
      document.body.style.overflow = overflowPrevio;
      previo?.focus();
    };
  }, [alCancelar, eliminando]);

  const totalArchivos = postulacion.documentos_postulacion?.length ?? 0;
  const totalIntegrantes = postulacion.integrantes?.length ?? 0;

  return (
    <div
      className="adm-dialogo-fondo"
      onClick={(e) => {
        if (e.target === e.currentTarget && !eliminando) {
          alCancelar();
        }
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape" && !eliminando) {
          alCancelar();
        }
      }}
    >
      <motion.div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="titulo-dialogo-eliminar"
        aria-describedby="desc-dialogo-eliminar"
        className="adm-dialogo-tarjeta"
        tabIndex={-1}
        initial={reduceMovimiento ? undefined : { opacity: 0, scale: 0.96 }}
        animate={reduceMovimiento ? undefined : { opacity: 1, scale: 1 }}
        exit={reduceMovimiento ? undefined : { opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
      >
        <div className="adm-dialogo-icono-peligro" aria-hidden="true">
          <IconoPapelera />
        </div>

        <div className="adm-dialogo-cuerpo">
          <h2 id="titulo-dialogo-eliminar" className="adm-dialogo-titulo">
            ¿Eliminar postulación definitivamente?
          </h2>

          <div className="adm-dialogo-resumen">
            <p className="adm-dialogo-semillero">
              <strong>{postulacion.semillero_nombre}</strong>
            </p>
            <p className="adm-dialogo-meta">
              <span className="adm-dialogo-codigo">
                {postulacion.radicado_codigo}
              </span>
              <span> · {postulacion.institucion_nombre}</span>
            </p>
            <p className="adm-dialogo-datos-secundarios">
              Tutor: {postulacion.tutor_nombre}
              {totalIntegrantes > 0 && ` · ${totalIntegrantes} integrantes`}
              {totalArchivos > 0 && ` · ${totalArchivos} documentos`}
            </p>
          </div>

          <p id="desc-dialogo-eliminar" className="adm-dialogo-advertencia">
            Esta acción no se puede deshacer. Se eliminarán permanentemente el
            registro de la postulación, los datos de los integrantes, su
            evaluación técnica y todos los archivos adjuntos (PDFs e imágenes)
            almacenados en Supabase Storage.
          </p>

          {error && (
            <p className="adm-aviso" role="alert">
              {error}
            </p>
          )}
        </div>

        <div className="adm-dialogo-acciones">
          <button
            ref={botonCancelarRef}
            type="button"
            className="adm-boton adm-boton-suave"
            onClick={alCancelar}
            disabled={eliminando}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="adm-boton adm-boton-peligro"
            onClick={alConfirmar}
            disabled={eliminando}
          >
            <IconoPapelera />
            <span>
              {eliminando ? "Eliminando…" : "Eliminar definitivamente"}
            </span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
