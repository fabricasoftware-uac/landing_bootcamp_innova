"use client";

import { useState } from "react";
import { preguntas } from "@/lib/contenido";

export function PreguntasFrecuentes() {
  const [activa, setActiva] = useState(0);

  return (
    <section
      id="preguntas"
      className="preguntas"
      data-tema="oscuro"
      aria-labelledby="titulo-preguntas"
    >
      <div className="marco">
        <h2 id="titulo-preguntas" className="preguntas-titulo" data-titular>
          Lo que más nos preguntan.
        </h2>
        <ul className="faq">
          {preguntas.map((pregunta, indice) => (
            <li key={pregunta.q}>
              <button
                type="button"
                aria-expanded={activa === indice}
                aria-controls={`respuesta-${indice}`}
                onClick={() => setActiva(indice)}
                onMouseEnter={() => setActiva(indice)}
              >
                {pregunta.tema}
              </button>
              <div
                id={`respuesta-${indice}`}
                className="faq-respuesta"
                hidden={activa !== indice}
              >
                <h3>{pregunta.q}</h3>
                <p>{pregunta.a}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
