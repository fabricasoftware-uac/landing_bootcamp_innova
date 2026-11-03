"use client";

import type { MetricasAdmin } from "@/app/actions/admin";

interface MetricasDashboardProps {
  metricas: MetricasAdmin;
}

export function MetricasDashboard({ metricas }: MetricasDashboardProps) {
  const porcentajeCupos = Math.round(
    (metricas.seleccionados / metricas.cupos_totales) * 100,
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Total Postulaciones */}
      <div className="rounded-xl border border-[#10384f]/15 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between text-[#10384f]/70">
          <span className="text-xs font-bold uppercase tracking-wider">
            Total Postulaciones
          </span>
          <span className="text-xl" aria-hidden="true">
            📋
          </span>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-black text-[#10384f]">
            {metricas.total}
          </span>
          <span className="text-xs font-semibold text-[#006b5c]">
            equipos radicados
          </span>
        </div>
        <div className="mt-2 flex items-center gap-3 text-[11px] text-[#10384f]/60">
          <span>Colegios: {metricas.basica_media}</span>
          <span>·</span>
          <span>Superior: {metricas.superior}</span>
        </div>
      </div>

      {/* 2. Pendientes de Evaluación */}
      <div className="rounded-xl border border-[#10384f]/15 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between text-amber-800">
          <span className="text-xs font-bold uppercase tracking-wider">
            Pendientes de Revisión
          </span>
          <span className="text-xl" aria-hidden="true">
            ⏳
          </span>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-black text-amber-700">
            {metricas.pendientes}
          </span>
          <span className="text-xs font-semibold text-amber-800/80">
            por verificar
          </span>
        </div>
        <p className="mt-2 text-[11px] text-[#10384f]/60">
          Requieren validación de documentos y aval
        </p>
      </div>

      {/* 3. Equipos Habilitados */}
      <div className="rounded-xl border border-[#10384f]/15 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between text-[#006b5c]">
          <span className="text-xs font-bold uppercase tracking-wider">
            Habilitados TDR
          </span>
          <span className="text-xl" aria-hidden="true">
            ✓
          </span>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-black text-[#006b5c]">
            {metricas.habilitados}
          </span>
          <span className="text-xs font-semibold text-[#006b5c]/80">
            cumplen requisitos
          </span>
        </div>
        <div className="mt-2 flex items-center gap-2 text-[11px] text-[#10384f]/60">
          <span>No habilitados: {metricas.no_habilitados}</span>
        </div>
      </div>

      {/* 4. Cupos Ocupados (7 Equipos Oficiales TDR) */}
      <div className="rounded-xl border-2 border-[#10384f] bg-[#10384f] p-5 text-[#f5f4ec] shadow-sm">
        <div className="flex items-center justify-between text-[#d1ef3d]">
          <span className="text-xs font-bold uppercase tracking-wider">
            Cupos Oficiales
          </span>
          <span className="text-xs font-black tracking-widest text-[#d1ef3d]">
            TDR 2026
          </span>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-black text-[#d1ef3d]">
            {metricas.seleccionados}
          </span>
          <span className="text-xs text-[#f5f4ec]/80">
            de {metricas.cupos_totales} cupos ocupados
          </span>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full bg-[#d1ef3d] transition-all duration-500 ease-out"
            style={{ width: `${Math.min(100, porcentajeCupos)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
