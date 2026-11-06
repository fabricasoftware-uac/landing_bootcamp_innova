"use client";

import { CampoArea, TituloPaso } from "./campos";
import type { PasoProps } from "./tipos";

const MIN_CARACTERES = 50;
const MAX_CARACTERES = 2500;

const PREGUNTAS_GUIA = [
  "¿Qué problema del Cauca les inquieta?",
  "¿Por qué su semillero debe estar aquí?",
  "¿Qué esperan aprender y crear en equipo?",
] as const;

function mensajeLongitud(longitud: number): string {
  if (longitud > MAX_CARACTERES) {
    return `Sobran ${longitud - MAX_CARACTERES} caracteres.`;
  }
  if (longitud < MIN_CARACTERES) {
    return `Faltan ${MIN_CARACTERES - longitud} caracteres para el mínimo.`;
  }
  return "Listo. Si quieren, pueden contar más.";
}

export function Paso3Motivacion({
  datos,
  actualizarDatos,
  errores = {},
  limpiarError,
}: PasoProps) {
  const longitud = datos.motivacion_intereses.trim().length;

  const alCambiar = (valor: string) => {
    actualizarDatos({ motivacion_intereses: valor });
    limpiarError?.("motivacion_intereses");
  };

  return (
    <div className="paso">
      <TituloPaso titulo="Por qué quieren estar">
        Si hay más equipos que cupos, la motivación pesa el 30&nbsp;% de la
        selección. Cuéntenlo con sus palabras.
      </TituloPaso>

      <ul className="preguntas-guia">
        {PREGUNTAS_GUIA.map((pregunta) => (
          <li key={pregunta}>{pregunta}</li>
        ))}
      </ul>

      <CampoArea
        id="motivacion_intereses"
        etiqueta="Motivación e intereses del equipo"
        requerido
        filas={9}
        valor={datos.motivacion_intereses}
        alCambiar={alCambiar}
        error={errores.motivacion_intereses}
        invalido={longitud > MAX_CARACTERES}
        marcador="Por ejemplo: en nuestro municipio nos preocupa…"
      />
      <div className="medidor" aria-hidden="true">
        <span
          style={{
            transform: `scaleX(${Math.min(1, longitud / MIN_CARACTERES)})`,
          }}
        />
      </div>
      <p className="contador" aria-live="polite">
        <span>{mensajeLongitud(longitud)}</span>
        <span>
          {longitud} de {MAX_CARACTERES}
        </span>
      </p>
    </div>
  );
}
