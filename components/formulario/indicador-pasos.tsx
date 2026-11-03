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
      className="mb-8 w-full border-b border-[#10384f]/15 pb-6"
    >
      {/* Vista móvil compacta */}
      <div className="md:hidden">
        <div className="flex items-center justify-between text-xs font-semibold tracking-wider uppercase text-[#10384f]">
          <span>
            Paso {pasoActual} de {totalPasos}
          </span>
          <span className="font-mono text-[#006b5c]">{porcentaje}%</span>
        </div>
        <div className="mt-2 text-base font-bold text-[#10384f]">
          {PASOS_INFO[pasoActual - 1]?.titulo} —{" "}
          <span className="text-xs font-normal text-[#10384f]/70">
            {PASOS_INFO[pasoActual - 1]?.subtitulo}
          </span>
        </div>
        <div
          className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#10384f]/10"
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
      <ol className="hidden md:grid md:grid-cols-5 md:gap-3">
        {PASOS_INFO.map((paso) => {
          const estaCompletado = pasoActual > paso.numero;
          const esActual = pasoActual === paso.numero;
          const esClickable = estaCompletado && alSeleccionarPaso !== undefined;

          return (
            <li
              key={paso.numero}
              className={`group relative flex flex-col rounded-lg p-3 transition-colors ${
                esActual
                  ? "border border-[#006b5c] bg-[#006b5c]/5"
                  : estaCompletado
                    ? "bg-[#10384f]/5 hover:bg-[#10384f]/10"
                    : "opacity-60"
              }`}
              aria-current={esActual ? "step" : undefined}
            >
              <button
                type="button"
                disabled={!esClickable}
                onClick={() => esClickable && alSeleccionarPaso(paso.numero)}
                className={`flex w-full items-center gap-3 text-left ${
                  esClickable ? "cursor-pointer" : "cursor-default"
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
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
                    className={`truncate text-xs font-bold uppercase tracking-wider ${
                      esActual
                        ? "text-[#006b5c]"
                        : estaCompletado
                          ? "text-[#10384f]"
                          : "text-[#10384f]/70"
                    }`}
                  >
                    {paso.titulo}
                  </div>
                  <div className="truncate text-[11px] text-[#10384f]/60">
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
