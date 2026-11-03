"use client";

interface IndicadorPasosProps {
  pasoActual: number;
  totalPasos: number;
  alSeleccionarPaso?: (paso: number) => void;
}

export const PASOS_INFO = [
  { numero: 1, titulo: "Semillero", subtitulo: "Institución y tutor" },
  { numero: 2, titulo: "Integrantes", subtitulo: "3 estudiantes" },
  { numero: 3, titulo: "Motivación", subtitulo: "Intereses y TDR" },
  { numero: 4, titulo: "Documentos", subtitulo: "Soportes requeridos" },
  { numero: 5, titulo: "Revisión", subtitulo: "Términos y envío" },
] as const;

export function IndicadorPasos({
  pasoActual,
  totalPasos,
  alSeleccionarPaso,
}: IndicadorPasosProps) {
  const porcentaje = Math.round(((pasoActual - 1) / (totalPasos - 1)) * 100);

  return (
    <nav
      aria-label="Progreso de la postulación"
      className="mb-8 w-full border-b border-[#10384f]/15 pb-6 sm:mb-10"
    >
      {/* Vista móvil compacta */}
      <div className="md:hidden">
        <div className="flex items-center justify-between text-xs font-bold tracking-wider uppercase text-[#10384f]/75">
          <span>
            Paso {pasoActual} de {totalPasos}
          </span>
          <span className="font-mono text-xs font-extrabold text-[#006b5c] bg-[#006b5c]/10 px-2 py-0.5 rounded-md">
            {porcentaje}%
          </span>
        </div>
        <div className="mt-2.5 text-base font-extrabold text-[#10384f]">
          {PASOS_INFO[pasoActual - 1]?.titulo} —{" "}
          <span className="text-xs font-medium text-[#10384f]/70">
            {PASOS_INFO[pasoActual - 1]?.subtitulo}
          </span>
        </div>
        <div
          className="mt-3.5 h-2 w-full overflow-hidden rounded-full bg-[#10384f]/10"
          role="progressbar"
          aria-valuenow={porcentaje}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Paso ${pasoActual} de ${totalPasos}: ${PASOS_INFO[pasoActual - 1]?.titulo}`}
        >
          <div
            className="h-full bg-[#006b5c] transition-all duration-300 ease-out"
            style={{ width: `${porcentaje}%` }}
          />
        </div>
      </div>

      {/* Vista desktop estructurada */}
      <ol className="hidden md:grid md:grid-cols-5 md:gap-2.5">
        {PASOS_INFO.map((paso) => {
          const estaCompletado = pasoActual > paso.numero;
          const esActual = pasoActual === paso.numero;
          const esClickable = estaCompletado && alSeleccionarPaso !== undefined;

          return (
            <li
              key={paso.numero}
              className={`group relative flex flex-col rounded-xl p-2.5 sm:p-3 transition-all ${
                esActual
                  ? "border-2 border-[#006b5c] bg-[#006b5c]/8 shadow-2xs"
                  : estaCompletado
                    ? "border border-[#10384f]/15 bg-[#10384f]/5 hover:bg-[#10384f]/10"
                    : "border border-[#10384f]/10 bg-white/40 opacity-60"
              }`}
              aria-current={esActual ? "step" : undefined}
            >
              <button
                type="button"
                disabled={!esClickable}
                onClick={() => esClickable && alSeleccionarPaso(paso.numero)}
                className={`flex w-full items-center gap-2.5 text-left ${
                  esClickable ? "cursor-pointer" : "cursor-default"
                }`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                    estaCompletado
                      ? "bg-[#006b5c] text-[#f5f4ec]"
                      : esActual
                        ? "bg-[#10384f] text-[#d1ef3d]"
                        : "border border-[#10384f]/30 bg-transparent text-[#10384f]"
                  }`}
                  aria-hidden="true"
                >
                  {estaCompletado ? "✓" : paso.numero}
                </span>

                <div className="min-w-0">
                  <div
                    className={`text-xs font-bold leading-tight ${
                      esActual
                        ? "text-[#006b5c]"
                        : estaCompletado
                          ? "text-[#10384f]"
                          : "text-[#10384f]/70"
                    }`}
                  >
                    {paso.titulo}
                  </div>
                  <div className="mt-0.5 text-[11px] leading-tight text-[#10384f]/60 whitespace-nowrap overflow-hidden text-ellipsis">
                    {paso.subtitulo}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
