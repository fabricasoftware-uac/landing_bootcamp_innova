"use client";

import { type CSSProperties, useRef, useState } from "react";
import {
  FantasmaCauca,
  PiezaCauca,
  SiluetaCauca,
} from "@/components/sitio/pieza-cauca";
import { ESTADO_CONVOCATORIA } from "@/lib/config/convocatoria";
import { requisitos } from "@/lib/contenido";
import { gsap, prefiereMenosMovimiento, useGSAP } from "@/lib/motion";
import { CAPAS_PIEZA } from "@/lib/pieza-cauca";

function estadoCapa(indice: number, actual: number) {
  if (indice === actual) return "actual";
  return indice < actual ? "hecha" : "pendiente";
}

/** Cada requisito se lee en grande y al cumplirse baja a ser una capa más de la pila. */
export function PreparaExpediente() {
  const raiz = useRef<HTMLElement>(null);
  const [capas, setCapas] = useState(CAPAS_PIEZA);

  useGSAP(
    () => {
      if (prefiereMenosMovimiento()) return;
      setCapas(0);
      gsap.timeline({
        scrollTrigger: {
          trigger: raiz.current,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          onUpdate: ({ progress }) => {
            setCapas(
              Math.min(CAPAS_PIEZA, Math.floor(progress * (CAPAS_PIEZA + 0.6))),
            );
          },
        },
      });
    },
    { scope: raiz },
  );

  const completa = capas >= CAPAS_PIEZA;
  const actual = Math.min(requisitos.length - 1, Math.max(0, capas - 1));

  return (
    <section
      ref={raiz}
      id="requisitos"
      className="requisitos"
      data-tema="claro"
      aria-labelledby="titulo-requisitos"
    >
      <div className="requisitos-fijo">
        <div className="marco requisitos-rejilla">
          <div className="requisitos-pieza">
            <div className="taller-cama">
              <FantasmaCauca />
              <PiezaCauca
                capas={capas}
                etiqueta="Prototipo del Cauca que se imprime por capas"
              />
            </div>
            <p className="requisitos-contador" aria-hidden="true">
              <strong>{capas}</strong> de {CAPAS_PIEZA} capas
            </p>
          </div>

          <div className="requisitos-texto">
            <h2 id="titulo-requisitos" className="text-titulo">
              Seis requisitos.
              <span className="acento">Seis capas.</span>
            </h2>
            <ol
              className="pila-requisitos"
              style={{ "--actual": actual } as CSSProperties}
            >
              {requisitos.map((requisito, indice) => (
                <li
                  key={requisito.titulo}
                  style={{ "--piso": indice } as CSSProperties}
                  data-estado={estadoCapa(indice, actual)}
                >
                  <div className="capa-tira" aria-hidden="true">
                    {requisito.titulo}
                  </div>
                  <div className="capa-grande">
                    <strong>{requisito.titulo}</strong>
                    <p>{requisito.texto}</p>
                  </div>
                </li>
              ))}
            </ol>
            <a
              className="boton requisitos-accion"
              data-listo={completa ? "" : undefined}
              data-cerrado={!ESTADO_CONVOCATORIA.abierta ? "" : undefined}
              href="/postulacion"
            >
              <SiluetaCauca clase="sello-mapa" />
              {ESTADO_CONVOCATORIA.abierta ? (
                <>
                  Inscribir a mi equipo <span className="flecha">→</span>
                </>
              ) : (
                <>
                  Cupos agotados <span className="flecha">→</span>
                </>
              )}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
