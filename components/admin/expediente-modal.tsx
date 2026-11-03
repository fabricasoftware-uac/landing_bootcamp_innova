"use client";

import { useEffect, useState, useTransition } from "react";
import {
  type EvaluacionInput,
  generarUrlDocumentoAction,
  guardarEvaluacionAction,
  type PostulacionAdminDetalle,
} from "@/app/actions/admin";
import type { PostulacionEstado } from "@/lib/supabase/types";

interface ExpedienteModalProps {
  postulacion: PostulacionAdminDetalle | null;
  alCerrar: () => void;
  alActualizar: () => void;
}

function formatearBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function ExpedienteModal({
  postulacion,
  alCerrar,
  alActualizar,
}: ExpedienteModalProps) {
  // Estados de evaluación
  const [habilitante, setHabilitante] = useState(true);
  const [motivacion, setMotivacion] = useState<number>(0);
  const [pertinencia, setPertinencia] = useState<number>(0);
  const [diversidad, setDiversidad] = useState<number>(0);
  const [representacion, setRepresentacion] = useState<number>(0);
  const [observaciones, setObservaciones] = useState<string>("");
  const [estado, setEstado] = useState<PostulacionEstado>("pendiente");

  const [cargandoDoc, setCargandoDoc] = useState<string | null>(null);
  const [mensajeDocError, setMensajeDocError] = useState<string | null>(null);
  const [mensajeGuardado, setMensajeGuardado] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Sincronizar datos al abrir postulación
  useEffect(() => {
    if (!postulacion) return;

    setEstado(postulacion.estado);

    if (postulacion.evaluaciones) {
      setHabilitante(
        postulacion.evaluaciones.cumple_requisitos_habilitante ?? true,
      );
      setMotivacion(postulacion.evaluaciones.puntaje_motivacion || 0);
      setPertinencia(postulacion.evaluaciones.puntaje_pertinencia || 0);
      setDiversidad(postulacion.evaluaciones.puntaje_diversidad || 0);
      setRepresentacion(postulacion.evaluaciones.puntaje_representacion || 0);
      setObservaciones(postulacion.evaluaciones.observaciones || "");
    } else {
      setHabilitante(true);
      setMotivacion(0);
      setPertinencia(0);
      setDiversidad(0);
      setRepresentacion(0);
      setObservaciones("");
    }

    setMensajeGuardado(null);
    setMensajeDocError(null);
  }, [postulacion]);

  if (!postulacion) return null;

  const puntajeTotal = motivacion + pertinencia + diversidad + representacion;

  const handleAbrirDocumento = async (storagePath: string) => {
    try {
      setCargandoDoc(storagePath);
      setMensajeDocError(null);

      const res = await generarUrlDocumentoAction(storagePath);
      if (res.success && res.data?.signedUrl) {
        window.open(res.data.signedUrl, "_blank", "noopener,noreferrer");
      } else {
        setMensajeDocError(res.error || "No se pudo obtener el documento.");
      }
    } catch {
      setMensajeDocError("Error de conexión al obtener el archivo.");
    } finally {
      setCargandoDoc(null);
    }
  };

  const handleGuardarEvaluacion = () => {
    startTransition(async () => {
      setMensajeGuardado(null);

      const input: EvaluacionInput = {
        postulacion_id: postulacion.id,
        cumple_requisitos_habilitante: habilitante,
        puntaje_motivacion: motivacion,
        puntaje_pertinencia: pertinencia,
        puntaje_diversidad: diversidad,
        puntaje_representacion: representacion,
        observaciones,
        nuevo_estado: estado,
        evaluado_por: "Comité Técnico Evaluador",
      };

      const res = await guardarEvaluacionAction(input);
      if (res.success) {
        setMensajeGuardado("✓ Evaluación y estado guardados correctamente.");
        alActualizar();
      } else {
        setMensajeGuardado(`Error: ${res.error || "No se pudo guardar"}`);
      }
    });
  };

  const hayMenores = postulacion.integrantes.some((i) => i.es_menor_edad);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-expediente"
    >
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Cabecera del Expediente */}
        <div className="flex items-center justify-between border-b border-[#10384f]/15 bg-[#10384f] px-6 py-4 text-[#f5f4ec]">
          <div>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#d1ef3d]">
              {postulacion.radicado_codigo}
            </span>
            <h2
              id="titulo-expediente"
              className="text-lg font-black tracking-tight text-white md:text-xl"
            >
              {postulacion.semillero_nombre}
            </h2>
            <p className="text-xs text-[#f5f4ec]/70">
              {postulacion.institucion_nombre} ·{" "}
              {postulacion.institucion_tipo === "basica_media"
                ? "Básica y Media (Colegio)"
                : "Educación Superior"}
            </p>
          </div>

          <button
            type="button"
            onClick={alCerrar}
            className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white"
            aria-label="Cerrar expediente"
          >
            ✕
          </button>
        </div>

        {/* Cuerpo del expediente con scroll */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-[#f5f4ec]/40">
          {/* Ficha rápida */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-[#10384f]/15 bg-white p-4 text-xs">
              <span className="block font-semibold text-[#10384f]/60">
                Docente Tutor / Contacto
              </span>
              <span className="mt-1 block font-bold text-sm text-[#10384f]">
                {postulacion.tutor_nombre}
              </span>
              <span className="block text-[11px] text-[#10384f]/70 mt-0.5">
                ✉ {postulacion.tutor_email}
              </span>
              <span className="block text-[11px] text-[#10384f]/70">
                ☎ {postulacion.tutor_telefono}
              </span>
            </div>

            <div className="rounded-xl border border-[#10384f]/15 bg-white p-4 text-xs">
              <span className="block font-semibold text-[#10384f]/60">
                Fecha de Radicación
              </span>
              <span className="mt-1 block font-bold text-sm text-[#10384f]">
                {new Date(postulacion.created_at).toLocaleDateString("es-CO", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <span className="block text-[11px] text-[#10384f]/70 mt-0.5">
                Integrantes: {postulacion.integrantes.length} estudiantes
              </span>
            </div>

            <div className="rounded-xl border border-[#10384f]/15 bg-white p-4 text-xs">
              <span className="block font-semibold text-[#10384f]/60">
                Estado Actual
              </span>
              <div className="mt-1.5 flex items-center gap-2">
                <span
                  className={`inline-block rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${
                    postulacion.estado === "seleccionado"
                      ? "bg-[#d1ef3d] text-[#10384f]"
                      : postulacion.estado === "habilitado"
                        ? "bg-[#006b5c] text-white"
                        : postulacion.estado === "no_habilitado"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {postulacion.estado}
                </span>
                {postulacion.evaluaciones && (
                  <span className="font-bold text-[#006b5c]">
                    {postulacion.evaluaciones.puntaje_motivacion +
                      postulacion.evaluaciones.puntaje_pertinencia +
                      postulacion.evaluaciones.puntaje_diversidad +
                      postulacion.evaluaciones.puntaje_representacion}{" "}
                    / 100 pts
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 1. Integrantes del equipo */}
          <div className="rounded-xl border border-[#10384f]/15 bg-white p-5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#006b5c] mb-3">
              1. Equipo de 3 Estudiantes
            </h3>
            <div className="grid gap-3 sm:grid-cols-3">
              {postulacion.integrantes.map((int) => (
                <div
                  key={int.id}
                  className="rounded-lg border border-[#10384f]/10 bg-[#f5f4ec]/30 p-3 text-xs"
                >
                  <div className="flex items-center justify-between font-bold text-[#10384f]">
                    <span>Estudiante {int.orden_integrante}</span>
                    {int.es_menor_edad ? (
                      <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                        Menor de edad
                      </span>
                    ) : (
                      <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800">
                        Mayor de edad
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 font-bold text-[#10384f]">
                    {int.nombres_apellidos}
                  </p>
                  <p className="text-[11px] text-[#10384f]/70">
                    {int.tipo_documento}: {int.numero_documento}
                  </p>
                  <p className="truncate text-[11px] text-[#10384f]/70">
                    ✉ {int.correo_electronico}
                  </p>
                  <p className="text-[11px] text-[#10384f]/70">
                    ☎ {int.telefono}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Motivación e Intereses */}
          <div className="rounded-xl border border-[#10384f]/15 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#006b5c]">
                2. Motivación e Intereses (Criterio TDR 30%)
              </h3>
              <span className="text-[11px] font-medium text-[#10384f]/60">
                {postulacion.motivacion_intereses.trim().length} caracteres
              </span>
            </div>
            <p className="rounded-lg bg-[#f5f4ec]/50 p-4 text-xs leading-relaxed text-[#10384f] whitespace-pre-line border border-[#10384f]/10 italic">
              &ldquo;{postulacion.motivacion_intereses}&rdquo;
            </p>
          </div>

          {/* 3. Documentos Adjuntos y Signed URLs */}
          <div className="rounded-xl border border-[#10384f]/15 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#006b5c]">
                3. Documentos de Soporte y Expediente Digital
              </h3>
              {hayMenores && (
                <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                  Requiere autorización de acudientes
                </span>
              )}
            </div>

            {mensajeDocError && (
              <div className="mb-3 rounded-lg bg-rose-50 p-2.5 text-xs font-semibold text-rose-700">
                {mensajeDocError}
              </div>
            )}

            <div className="divide-y divide-[#10384f]/10 border border-[#10384f]/10 rounded-lg">
              {postulacion.documentos_postulacion.map((doc) => {
                const estaCargando = cargandoDoc === doc.storage_path;

                return (
                  <div
                    key={doc.id}
                    className="flex flex-wrap items-center justify-between gap-3 p-3 text-xs hover:bg-[#f5f4ec]/40"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#10384f] text-[10px] font-bold text-white">
                        {doc.mime_type.includes("pdf") ? "PDF" : "IMG"}
                      </span>
                      <div>
                        <p className="font-bold text-[#10384f]">
                          {doc.tipo_documento === "aval_semillero"
                            ? "Aval Institucional del Semillero"
                            : doc.tipo_documento === "autorizacion_menores"
                              ? "Autorización de Padres / Acudientes"
                              : `Documento de Identidad (${doc.tipo_documento})`}
                        </p>
                        <p className="text-[11px] text-[#10384f]/60">
                          {doc.nombre_original} ·{" "}
                          {formatearBytes(doc.tamano_bytes)}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={estaCargando}
                      onClick={() => handleAbrirDocumento(doc.storage_path)}
                      className="inline-flex items-center gap-1.5 rounded-md border border-[#006b5c] bg-[#006b5c]/10 px-3 py-1.5 text-xs font-bold text-[#006b5c] hover:bg-[#006b5c] hover:text-white disabled:opacity-50"
                    >
                      {estaCargando ? (
                        <>
                          <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          <span>Generando enlace...</span>
                        </>
                      ) : (
                        <span>Ver Documento Seguro ↗</span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. Panel de Evaluación Oficial TDR */}
          <div className="rounded-xl border-2 border-[#006b5c] bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#10384f]/15 pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#006b5c]">
                  Evaluación Oficial según TDR
                </span>
                <h3 className="text-base font-black text-[#10384f]">
                  Calificación Ponderada y Dictamen
                </h3>
              </div>

              {/* Puntaje total medidor */}
              <div className="flex items-center gap-3 rounded-xl bg-[#10384f] px-5 py-2.5 text-white">
                <span className="text-xs font-bold uppercase tracking-wider text-[#f5f4ec]/70">
                  Total Ponderado:
                </span>
                <span className="text-2xl font-black text-[#d1ef3d]">
                  {puntajeTotal}{" "}
                  <span className="text-xs font-normal">/ 100 pts</span>
                </span>
              </div>
            </div>

            {/* Checkbox Habilitante */}
            <div className="my-5 rounded-lg border border-[#10384f]/15 bg-[#f5f4ec]/50 p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={habilitante}
                  onChange={(e) => setHabilitante(e.target.checked)}
                  className="mt-0.5 h-5 w-5 rounded-sm border-[#10384f]/40 text-[#006b5c] focus:ring-[#006b5c]"
                />
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-[#10384f]">
                    Requisitos Habilitantes Cumplidos
                  </span>
                  <span className="block text-[11px] text-[#10384f]/70">
                    Certifica que el equipo cuenta con aval del tutor,
                    documentación de los 3 estudiantes y autorización de
                    acudientes si aplica.
                  </span>
                </div>
              </label>
            </div>

            {/* Criterios Ponderados */}
            <div className="grid gap-5 sm:grid-cols-2">
              {/* Criterio 1: Motivación 30% */}
              <div className="rounded-lg border border-[#10384f]/15 p-4 bg-white">
                <div className="flex justify-between items-center text-xs">
                  <label
                    htmlFor="puntaje_motivacion"
                    className="font-bold text-[#10384f]"
                  >
                    1. Motivación e Intereses (30%)
                  </label>
                  <span className="font-mono font-bold text-[#006b5c]">
                    {motivacion} / 30 pts
                  </span>
                </div>
                <input
                  id="puntaje_motivacion"
                  type="range"
                  min="0"
                  max="30"
                  value={motivacion}
                  onChange={(e) => setMotivacion(Number(e.target.value))}
                  className="mt-2 w-full accent-[#006b5c]"
                />
              </div>

              {/* Criterio 2: Pertinencia 30% */}
              <div className="rounded-lg border border-[#10384f]/15 p-4 bg-white">
                <div className="flex justify-between items-center text-xs">
                  <label
                    htmlFor="puntaje_pertinencia"
                    className="font-bold text-[#10384f]"
                  >
                    2. Pertinencia de la Propuesta (30%)
                  </label>
                  <span className="font-mono font-bold text-[#006b5c]">
                    {pertinencia} / 30 pts
                  </span>
                </div>
                <input
                  id="puntaje_pertinencia"
                  type="range"
                  min="0"
                  max="30"
                  value={pertinencia}
                  onChange={(e) => setPertinencia(Number(e.target.value))}
                  className="mt-2 w-full accent-[#006b5c]"
                />
              </div>

              {/* Criterio 3: Diversidad 20% */}
              <div className="rounded-lg border border-[#10384f]/15 p-4 bg-white">
                <div className="flex justify-between items-center text-xs">
                  <label
                    htmlFor="puntaje_diversidad"
                    className="font-bold text-[#10384f]"
                  >
                    3. Diversidad e Inclusión (20%)
                  </label>
                  <span className="font-mono font-bold text-[#006b5c]">
                    {diversidad} / 20 pts
                  </span>
                </div>
                <input
                  id="puntaje_diversidad"
                  type="range"
                  min="0"
                  max="20"
                  value={diversidad}
                  onChange={(e) => setDiversidad(Number(e.target.value))}
                  className="mt-2 w-full accent-[#006b5c]"
                />
              </div>

              {/* Criterio 4: Representación Territorial 20% */}
              <div className="rounded-lg border border-[#10384f]/15 p-4 bg-white">
                <div className="flex justify-between items-center text-xs">
                  <label
                    htmlFor="puntaje_representacion"
                    className="font-bold text-[#10384f]"
                  >
                    4. Representación Institucional / Territorial (20%)
                  </label>
                  <span className="font-mono font-bold text-[#006b5c]">
                    {representacion} / 20 pts
                  </span>
                </div>
                <input
                  id="puntaje_representacion"
                  type="range"
                  min="0"
                  max="20"
                  value={representacion}
                  onChange={(e) => setRepresentacion(Number(e.target.value))}
                  className="mt-2 w-full accent-[#006b5c]"
                />
              </div>
            </div>

            {/* Observaciones y Estado */}
            <div className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="observaciones"
                  className="block text-xs font-bold uppercase tracking-wider text-[#10384f]"
                >
                  Observaciones Técnicas del Comité Evaluador
                </label>
                <textarea
                  id="observaciones"
                  rows={3}
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Escribe comentarios, justificación del puntaje o requerimientos de subsanación..."
                  className="mt-1.5 w-full rounded-lg border border-[#10384f]/25 bg-white p-3 text-xs text-[#10384f] focus:border-[#006b5c] focus:outline-hidden focus:ring-2 focus:ring-[#006b5c]"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <label
                    htmlFor="nuevo_estado"
                    className="block text-xs font-bold uppercase tracking-wider text-[#10384f]"
                  >
                    Asignar Estado de Postulación
                  </label>
                  <select
                    id="nuevo_estado"
                    value={estado}
                    onChange={(e) =>
                      setEstado(e.target.value as PostulacionEstado)
                    }
                    className="mt-1.5 rounded-lg border border-[#10384f]/25 bg-white px-3 py-2 text-xs font-bold text-[#10384f] focus:border-[#006b5c] focus:outline-hidden focus:ring-2 focus:ring-[#006b5c]"
                  >
                    <option value="pendiente">Pendiente de revisión</option>
                    <option value="habilitado">Habilitado (Cumple TDR)</option>
                    <option value="no_habilitado">No Habilitado</option>
                    <option value="seleccionado">
                      Seleccionado (Cupo oficial 1 de los 7)
                    </option>
                  </select>
                </div>

                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleGuardarEvaluacion}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#006b5c] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-[#d1ef3d] shadow-sm transition hover:bg-[#10384f] hover:text-[#f5f4ec] disabled:opacity-50"
                >
                  {isPending ? (
                    <>
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>Guardar Calificación y Estado ✓</span>
                  )}
                </button>
              </div>

              {mensajeGuardado && (
                <div
                  className={`rounded-lg p-3 text-xs font-bold ${
                    mensajeGuardado.startsWith("✓")
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-rose-50 text-rose-800 border border-rose-200"
                  }`}
                  role="status"
                >
                  {mensajeGuardado}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pie del modal */}
        <div className="border-t border-[#10384f]/15 bg-white px-6 py-3 flex justify-end">
          <button
            type="button"
            onClick={alCerrar}
            className="rounded-lg border border-[#10384f]/25 px-5 py-2 text-xs font-bold uppercase tracking-wider text-[#10384f] hover:bg-[#10384f]/5"
          >
            Cerrar Expediente
          </button>
        </div>
      </div>
    </div>
  );
}
