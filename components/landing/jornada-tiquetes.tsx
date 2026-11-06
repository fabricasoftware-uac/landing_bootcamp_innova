"use client";

import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { useCallback } from "react";
import { Credito } from "@/components/sitio/con-credito";
import { agenda } from "@/lib/contenido";

export function JornadaTiquetes() {
  const [visor, embla] = useEmblaCarousel({
    align: "start",
    dragFree: true,
    loop: true,
  });
  const anterior = useCallback(() => embla?.scrollPrev(), [embla]);
  const siguiente = useCallback(() => embla?.scrollNext(), [embla]);

  return (
    <section
      id="jornada"
      className="jornada"
      data-tema="claro"
      aria-labelledby="titulo-jornada"
    >
      <div className="marco jornada-cabeza">
        <div>
          <h2 id="titulo-jornada" className="text-titulo" data-titular>
            Un día para construirlo.
          </h2>
          <p className="text-entrada" data-rev="sube">
            Cuatro etapas, una jornada presencial completa y tu equipo. La
            organización publicará la sede y los horarios.
          </p>
        </div>
        <fieldset className="rail-controles" aria-label="Mover etapas">
          <button type="button" onClick={anterior} aria-label="Etapa anterior">
            <span aria-hidden="true">←</span>
          </button>
          <button
            type="button"
            onClick={siguiente}
            aria-label="Etapa siguiente"
          >
            <span aria-hidden="true">→</span>
          </button>
        </fieldset>
      </div>

      <div className="rail-visor" ref={visor} data-rev="sube">
        <div className="rail-pista">
          {agenda.map((etapa, indice) => (
            <article key={etapa.titulo} className="tiquete">
              <figure className="tiquete-foto con-credito">
                <Image
                  src={etapa.imagen}
                  alt={etapa.alt}
                  fill
                  sizes="(min-width: 900px) 620px, 86vw"
                  quality={75}
                  draggable={false}
                />
                <Credito medio={etapa.medio} />
              </figure>
              <div className="tiquete-copia">
                <span className="tiquete-numero" aria-hidden="true">
                  {indice + 1}
                </span>
                <h3>{etapa.titulo}</h3>
                <p>{etapa.texto}</p>
                <p className="tiquete-resultado">
                  Sales con: <strong>{etapa.resultado.toLowerCase()}</strong>
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
