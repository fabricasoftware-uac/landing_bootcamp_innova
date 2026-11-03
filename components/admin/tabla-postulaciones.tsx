"use client";

import { useMemo, useState, useTransition } from "react";
import {
  exportarPostulacionesExcelAction,
  type PostulacionAdminDetalle,
} from "@/app/actions/admin";
import type { PostulacionEstado } from "@/lib/supabase/types";

interface TablaPostulacionesProps {
  postulaciones: PostulacionAdminDetalle[];
  alSeleccionarPostulacion: (postulacion: PostulacionAdminDetalle) => void;
  alRecargar: () => void;
}

export function TablaPostulaciones({
  postulaciones,
  alSeleccionarPostulacion,
  alRecargar,
}: TablaPostulacionesProps) {
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [filtroNivel, setFiltroNivel] = useState<string>("todos");
  const [exportando, setExportando] = useState(false);
  const [errorExport, setErrorExport] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Filtrado reactivo en cliente
  const postulacionesFiltradas = useMemo(() => {
    return postulaciones.filter((p) => {
      // Filtro de búsqueda textual
      const query = busqueda.trim().toLowerCase();
      const coincideBusqueda =
        query === "" ||
        p.radicado_codigo.toLowerCase().includes(query) ||
        p.semillero_nombre.toLowerCase().includes(query) ||
        p.institucion_nombre.toLowerCase().includes(query) ||
        p.tutor_nombre.toLowerCase().includes(query);

      // Filtro de estado
      const coincideEstado =
        filtroEstado === "todos" || p.estado === filtroEstado;

      // Filtro de nivel formativo
      const coincideNivel =
        filtroNivel === "todos" || p.institucion_tipo === filtroNivel;

      return coincideBusqueda && coincideEstado && coincideNivel;
    });
  }, [postulaciones, busqueda, filtroEstado, filtroNivel]);

  // Manejador de descarga de archivo Excel .xlsx
  const handleExportarExcel = async () => {
    setErrorExport(null);
    setExportando(true);

    try {
      const res = await exportarPostulacionesExcelAction();

      if (!res.success || !res.data) {
        throw new Error(res.error || "No se pudo generar el archivo Excel");
      }

      // Convertir base64 a Blob binario y disparar descarga en el navegador
      const byteCharacters = atob(res.data.base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.data.nombreArchivo;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Error al exportar datos";
      setErrorExport(msg);
    } finally {
      setExportando(false);
    }
  };

  const getBadgeEstado = (estado: PostulacionEstado) => {
    switch (estado) {
      case "seleccionado":
        return "bg-[#d1ef3d] text-[#10384f] border-[#10384f]/20 font-black";
      case "habilitado":
        return "bg-[#006b5c] text-white border-transparent font-bold";
      case "no_habilitado":
        return "bg-rose-100 text-rose-800 border-rose-200 font-semibold";
      default:
        return "bg-amber-100 text-amber-800 border-amber-200 font-semibold";
    }
  };

  return (
    <div className="space-y-4">
      {/* Barra de Filtros, Búsqueda y Exportación */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#10384f]/15 bg-white p-4 shadow-xs">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          {/* Buscador */}
          <div className="relative min-w-[240px] flex-1">
            <span
              className="absolute left-3 top-2.5 text-xs text-[#10384f]/40"
              aria-hidden="true"
            >
              🔍
            </span>
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por radicado, semillero, colegio, tutor..."
              className="w-full rounded-lg border border-[#10384f]/20 bg-white py-2 pl-9 pr-3 text-xs text-[#10384f] placeholder:text-[#10384f]/40 focus:border-[#006b5c] focus:outline-hidden focus:ring-1 focus:ring-[#006b5c]"
            />
          </div>

          {/* Filtro Estado */}
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="rounded-lg border border-[#10384f]/20 bg-white px-3 py-2 text-xs font-semibold text-[#10384f] focus:border-[#006b5c] focus:outline-hidden"
          >
            <option value="todos">Todos los Estados</option>
            <option value="pendiente">Pendientes</option>
            <option value="habilitado">Habilitados</option>
            <option value="no_habilitado">No Habilitados</option>
            <option value="seleccionado">Seleccionados (6 cupos)</option>
          </select>

          {/* Filtro Nivel */}
          <select
            value={filtroNivel}
            onChange={(e) => setFiltroNivel(e.target.value)}
            className="rounded-lg border border-[#10384f]/20 bg-white px-3 py-2 text-xs font-semibold text-[#10384f] focus:border-[#006b5c] focus:outline-hidden"
          >
            <option value="todos">Todos los Niveles</option>
            <option value="basica_media">Básica y Media (Colegios)</option>
            <option value="superior">Educación Superior</option>
          </select>
        </div>

        {/* Botón Exportar y Refrescar */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={exportando}
            onClick={handleExportarExcel}
            className="inline-flex items-center gap-2 rounded-lg bg-[#006b5c] px-4 py-2 text-xs font-bold text-[#d1ef3d] shadow-xs transition hover:bg-[#10384f] hover:text-white disabled:opacity-50"
            title="Exportar archivo Microsoft Excel oficial con 3 hojas"
          >
            {exportando ? (
              <>
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span>Generando Excel...</span>
              </>
            ) : (
              <>
                <span aria-hidden="true">📊</span>
                <span>Exportar a Excel (.xlsx)</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => startTransition(alRecargar)}
            disabled={isPending}
            className="rounded-lg border border-[#10384f]/20 p-2 text-xs text-[#10384f] hover:bg-[#10384f]/5 disabled:opacity-50"
            title="Recargar datos"
          >
            🔄
          </button>
        </div>
      </div>

      {errorExport && (
        <div className="rounded-lg bg-rose-50 p-3 text-xs font-semibold text-rose-800">
          {errorExport}
        </div>
      )}

      {/* Tabla Principal */}
      <div className="overflow-x-auto rounded-xl border border-[#10384f]/15 bg-white shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-[#10384f]/15 bg-[#10384f] text-[#f5f4ec]">
            <tr>
              <th
                scope="col"
                className="px-4 py-3 font-bold uppercase tracking-wider"
              >
                Radicado
              </th>
              <th
                scope="col"
                className="px-4 py-3 font-bold uppercase tracking-wider"
              >
                Semillero / Institución
              </th>
              <th
                scope="col"
                className="px-4 py-3 font-bold uppercase tracking-wider"
              >
                Nivel
              </th>
              <th
                scope="col"
                className="px-4 py-3 font-bold uppercase tracking-wider"
              >
                Docente Tutor
              </th>
              <th
                scope="col"
                className="px-4 py-3 font-bold uppercase tracking-wider"
              >
                Menores
              </th>
              <th
                scope="col"
                className="px-4 py-3 font-bold uppercase tracking-wider"
              >
                Estado
              </th>
              <th
                scope="col"
                className="px-4 py-3 font-bold uppercase tracking-wider"
              >
                Puntaje TDR
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-right font-bold uppercase tracking-wider"
              >
                Acción
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#10384f]/10 text-[#10384f]">
            {postulacionesFiltradas.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="py-12 text-center text-xs text-[#10384f]/60"
                >
                  No se encontraron postulaciones que coincidan con los filtros
                  seleccionados.
                </td>
              </tr>
            ) : (
              postulacionesFiltradas.map((p) => {
                const totalPuntaje = p.evaluaciones
                  ? p.evaluaciones.puntaje_motivacion +
                    p.evaluaciones.puntaje_pertinencia +
                    p.evaluaciones.puntaje_diversidad +
                    p.evaluaciones.puntaje_representacion
                  : null;

                const menoresCount = p.integrantes.filter(
                  (i) => i.es_menor_edad,
                ).length;

                return (
                  <tr
                    key={p.id}
                    className="transition-colors hover:bg-[#f5f4ec]/60"
                  >
                    <td className="px-4 py-3 font-mono font-bold text-[#006b5c]">
                      {p.radicado_codigo}
                    </td>
                    <td className="px-4 py-3 max-w-[260px]">
                      <div className="font-bold text-[#10384f] truncate">
                        {p.semillero_nombre}
                      </div>
                      <div className="text-[11px] text-[#10384f]/70 truncate">
                        {p.institucion_nombre}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {p.institucion_tipo === "basica_media" ? (
                        <span className="rounded bg-sky-100 px-2 py-0.5 text-[10px] font-semibold text-sky-800">
                          Básica y Media
                        </span>
                      ) : (
                        <span className="rounded bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-800">
                          Superior
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-semibold">{p.tutor_nombre}</div>
                      <div className="text-[10px] text-[#10384f]/60 truncate">
                        {p.tutor_email}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {menoresCount > 0 ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-amber-700">
                          <span>⚠️</span> {menoresCount} menor
                          {menoresCount > 1 ? "es" : ""}
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#10384f]/50">
                          Mayores
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-block rounded-md border px-2 py-0.5 text-[10px] uppercase tracking-wider ${getBadgeEstado(
                          p.estado,
                        )}`}
                      >
                        {p.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {totalPuntaje !== null ? (
                        <span className="font-mono font-bold text-[#006b5c]">
                          {totalPuntaje} / 100
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#10384f]/40">
                          Sin evaluar
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => alSeleccionarPostulacion(p)}
                        className="rounded-md border border-[#10384f]/25 bg-white px-2.5 py-1 text-xs font-bold text-[#10384f] transition hover:bg-[#10384f] hover:text-white"
                      >
                        Expediente ↗
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-xs text-[#10384f]/70">
        <span>
          Mostrando {postulacionesFiltradas.length} de {postulaciones.length}{" "}
          equipos
        </span>
        <span className="font-semibold text-[#006b5c]">
          6 equipos de 3 estudiantes seleccionados para la jornada presencial
          del 15 de noviembre
        </span>
      </div>
    </div>
  );
}
