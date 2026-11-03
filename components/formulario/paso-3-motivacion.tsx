"use client";

import type { PasoProps } from "./tipos";

const MIN_CARACTERES = 50;
const MAX_CARACTERES = 2500;

export function Paso3Motivacion({
  datos,
  actualizarDatos,
  errores = {},
  limpiarError,
}: PasoProps) {
  const longitud = datos.motivacion_intereses.trim().length;
  const esMuyCorto = longitud < MIN_CARACTERES;
  const esMuyLargo = longitud > MAX_CARACTERES;
  const caracteresRestantesMinimo = Math.max(0, MIN_CARACTERES - longitud);

  const handleChange = (valor: string) => {
    actualizarDatos({ motivacion_intereses: valor });
    if (limpiarError) {
      limpiarError("motivacion_intereses");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-[#10384f] md:text-3xl">
          Motivación e Intereses del Semillero
        </h2>
        <p className="mt-2 text-sm text-[#10384f]/80 md:text-base">
          Comparte las razones, problemáticas de interés y la visión de tu
          equipo para participar en la jornada del festival.
        </p>
      </div>

      {/* Orientación visual TDR 30% */}
      <div className="rounded-xl border border-[#006b5c]/30 bg-[#006b5c]/10 p-5 md:p-6">
        <div className="flex items-start gap-3">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#006b5c] text-sm font-black text-[#d1ef3d]"
            aria-hidden="true"
          >
            30%
          </span>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#006b5c]">
              Criterio Oficial de Selección TDR: Motivación e Intereses (30 %)
            </h3>
            <p className="mt-1 text-xs text-[#10384f]/80 md:text-sm">
              En caso de que las postulaciones superen los cupos habilitados,
              este criterio evalúa la claridad, pasión, pertinencia y coherencia
              de las motivaciones del equipo para convertir ideas en prototipos
              durante el festival.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-[#006b5c]">
              <span className="rounded-full bg-white/80 px-2.5 py-1 font-semibold">
                ✓ ¿Qué problema del Cauca les inquieta?
              </span>
              <span className="rounded-full bg-white/80 px-2.5 py-1 font-semibold">
                ✓ ¿Por qué su semillero debe estar aquí?
              </span>
              <span className="rounded-full bg-white/80 px-2.5 py-1 font-semibold">
                ✓ ¿Qué esperan aprender y crear en equipo?
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Textarea de motivación */}
      <div className="rounded-xl border border-[#10384f]/15 bg-white/70 p-5 shadow-xs backdrop-blur-xs md:p-7">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label
            htmlFor="motivacion_intereses"
            className="block text-xs font-bold uppercase tracking-wider text-[#10384f]"
          >
            Descripción de Motivación e Intereses{" "}
            <span className="text-rose-600">*</span>
          </label>

          {/* Contador en tiempo real */}
          <div
            className={`text-xs font-semibold ${
              esMuyCorto
                ? "text-amber-700"
                : esMuyLargo
                  ? "text-rose-600"
                  : "text-[#006b5c]"
            }`}
            aria-live="polite"
          >
            {longitud} / {MAX_CARACTERES} caracteres
            {esMuyCorto && (
              <span className="ml-1 text-[11px] text-amber-600">
                (faltan {caracteresRestantesMinimo} mín.)
              </span>
            )}
          </div>
        </div>

        <textarea
          id="motivacion_intereses"
          rows={9}
          required
          value={datos.motivacion_intereses}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Escribe aquí la motivación de tu semillero. Cuéntanos sobre su trayectoria, los retos del Cauca que les apasiona abordar, y cómo la jornada de formación, mentoría y prototipado potenciará sus habilidades..."
          className={`mt-3 w-full rounded-lg border p-4 text-sm leading-relaxed text-[#10384f] placeholder:text-[#10384f]/40 focus:outline-hidden focus:ring-2 ${
            errores.motivacion_intereses || esMuyLargo
              ? "border-rose-500 bg-rose-50/50 focus:ring-rose-500"
              : "border-[#10384f]/25 bg-white focus:border-[#006b5c] focus:ring-[#006b5c]"
          }`}
          aria-invalid={Boolean(errores.motivacion_intereses || esMuyLargo)}
          aria-describedby="ayuda-motivacion"
        />

        {errores.motivacion_intereses && (
          <p className="mt-2 text-xs font-semibold text-rose-600" role="alert">
            {errores.motivacion_intereses}
          </p>
        )}

        <div
          id="ayuda-motivacion"
          className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[#10384f]/60"
        >
          <span>Extensión requerida: mínimo 50 y máximo 2500 caracteres.</span>
          {longitud >= MIN_CARACTERES && !esMuyLargo && (
            <span className="inline-flex items-center gap-1 font-semibold text-[#006b5c]">
              <span aria-hidden="true">✓</span> Longitud adecuada para
              evaluación técnica
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
