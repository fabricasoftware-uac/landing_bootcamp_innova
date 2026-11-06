"use client";

interface IndicadorPasosProps {
  pasoActual: number;
  alSeleccionarPaso?: (paso: number) => void;
}

export const PASOS_INFO = [
  { numero: 1, titulo: "Semillero" },
  { numero: 2, titulo: "Equipo" },
  { numero: 3, titulo: "Motivación" },
  { numero: 4, titulo: "Documentos" },
  { numero: 5, titulo: "Revisión" },
] as const;

function estadoPaso(numero: number, pasoActual: number) {
  if (numero === pasoActual) return "actual";
  return numero < pasoActual ? "hecho" : "pendiente";
}

/** Los pasos son estaciones de un filamento; la boquilla marca dónde vas. */
export function IndicadorPasos({
  pasoActual,
  alSeleccionarPaso,
}: IndicadorPasosProps) {
  const tramo = (pasoActual - 1) / (PASOS_INFO.length - 1);

  return (
    <nav className="estaciones" aria-label="Progreso de la postulación">
      <p className="sr-only">
        Paso {pasoActual} de {PASOS_INFO.length}
      </p>
      <div className="estaciones-pista" aria-hidden="true">
        <span style={{ transform: `scaleX(${tramo})` }} />
      </div>
      <ol>
        {PASOS_INFO.map(({ numero, titulo }) => {
          const estado = estadoPaso(numero, pasoActual);
          return (
            <li key={numero} data-estado={estado}>
              <button
                type="button"
                disabled={estado !== "hecho"}
                aria-current={estado === "actual" ? "step" : undefined}
                onClick={() => alSeleccionarPaso?.(numero)}
              >
                <span className="estacion-marca">
                  {estado === "hecho" ? "✓︎" : numero}
                </span>
                <span className="estacion-titulo">{titulo}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
