"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useRef, useState } from "react";
import { Credito } from "@/components/sitio/con-credito";
import { territorios } from "@/lib/contenido";
import { gsap, irA, prefiereMenosMovimiento, useGSAP } from "@/lib/motion";
import {
  CELDAS_SILUETA,
  COLUMNAS_SILUETA,
  FILAS_SILUETA,
} from "@/lib/pieza-cauca";

const RADIO_REGION = 3.4;
const ENTRADA_FOTOS = 0.45;

/** Distancia en celdas a cada lugar: de ahí salen la región encendida y su retraso. */
function celdasConRegion() {
  return CELDAS_SILUETA.map(({ columna, fila }) => {
    let lugar = -1;
    let minima = RADIO_REGION;
    territorios.forEach((sitio, indice) => {
      const distancia = Math.hypot(
        columna + 0.5 - (sitio.columna + 0.5),
        fila + 0.5 - (sitio.fila + 0.5),
      );
      if (distancia < minima) {
        minima = distancia;
        lugar = indice;
      }
    });
    return { columna, fila, lugar, retraso: Math.round(minima * 45) };
  });
}

const CELDAS = celdasConRegion();

function MapaPixeles({ activo }: { activo: number }) {
  return (
    <svg
      className="mapa-svg"
      viewBox={`0 0 ${COLUMNAS_SILUETA} ${FILAS_SILUETA}`}
      aria-hidden="true"
    >
      {CELDAS.map(({ columna, fila, lugar, retraso }) => (
        <rect
          key={`${columna}-${fila}`}
          x={columna + 0.04}
          y={fila + 0.04}
          width="0.92"
          height="0.92"
          rx="0.12"
          className="mapa-celda"
          data-encendida={lugar === activo ? "" : undefined}
          style={{ "--retraso": `${retraso}ms` } as CSSProperties}
        />
      ))}
    </svg>
  );
}

/** Porcentajes desde el tablero del mapa, para ubicar los marcadores. */
function posicion(columna: number, fila: number): CSSProperties {
  return {
    left: `${((columna + 0.5) / COLUMNAS_SILUETA) * 100}%`,
    top: `${((fila + 0.5) / FILAS_SILUETA) * 100}%`,
  };
}

export function MapaCauca() {
  const raiz = useRef<HTMLElement>(null);
  const [activo, setActivo] = useState(0);

  useGSAP(
    () => {
      if (prefiereMenosMovimiento()) return;
      const fotos = gsap.utils.toArray<HTMLElement>(".mapa-lugar");
      const linea = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: raiz.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
          onUpdate: ({ progress }) => {
            // Mismo reloj de la línea: la región encendida no se adelanta a su foto.
            const tiempo = progress * linea.duration();
            const tramo = Math.floor(tiempo - ENTRADA_FOTOS + 0.15);
            setActivo(gsap.utils.clamp(0, territorios.length - 1, tramo));
          },
        },
      });
      // GSAP anula la propiedad translate: el centrado también debe ser suyo.
      const escritorio = window.matchMedia("(min-width: 900px)").matches;
      const centroX = escritorio ? 0 : -50;
      const centroY = escritorio ? -50 : 0;
      linea.fromTo(
        ".mapa-intro",
        { opacity: 1, y: 0, yPercent: centroY },
        { opacity: 0, y: -80, yPercent: centroY, duration: 0.5 },
        0.1,
      );
      linea.fromTo(
        ".mapa-tablero",
        {
          xPercent: escritorio ? 62 : centroX,
          yPercent: centroY,
          scale: escritorio ? 1.08 : 1,
        },
        { xPercent: centroX, yPercent: centroY, scale: 1, duration: 0.7 },
        0,
      );
      linea.fromTo(
        ".mapa-marcador",
        { xPercent: -50, yPercent: -50, scale: 0, opacity: 0 },
        {
          xPercent: -50,
          yPercent: -50,
          scale: 1,
          opacity: 1,
          duration: 0.2,
          stagger: 0.04,
        },
        0.42,
      );
      fotos.forEach((foto, indice) => {
        const entrada = ENTRADA_FOTOS + indice;
        linea.fromTo(
          foto,
          { clipPath: "inset(100% 0 0 0)" },
          { clipPath: "inset(0% 0 0 0)", duration: 0.5 },
          entrada,
        );
        linea.fromTo(
          foto.querySelector("img"),
          { scale: 1.3 },
          { scale: 1, duration: 1.5 },
          entrada,
        );
        linea.fromTo(
          foto.querySelector(".mapa-lugar-texto"),
          { y: 70, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.35 },
          entrada + 0.2,
        );
      });
    },
    { scope: raiz },
  );

  const irAlLugar = (indice: number) => {
    const nodo = raiz.current;
    if (!nodo) return;
    const recorrido = nodo.offsetHeight - window.innerHeight;
    const inicio = nodo.getBoundingClientRect().top + window.scrollY;
    const duracion = ENTRADA_FOTOS + territorios.length + 0.5;
    irA(inicio + (recorrido * (ENTRADA_FOTOS + indice + 0.6)) / duracion);
  };

  return (
    <section
      ref={raiz}
      id="mapa"
      className="mapa"
      data-tema="oscuro"
      aria-labelledby="titulo-mapa"
    >
      <div className="mapa-fijo">
        <div className="mapa-intro">
          <h2 id="titulo-mapa" className="text-portada">
            El Cauca es
            <span className="acento">el laboratorio.</span>
          </h2>
          <p className="text-entrada">
            Cada prototipo parte de un reto real del territorio. Por eso la
            representación institucional y territorial pesa el 20&nbsp;% en la
            selección.
          </p>
        </div>

        <div className="mapa-tablero">
          <MapaPixeles activo={activo} />
          {territorios.map(({ nombre, columna, fila }, indice) => (
            <button
              key={nombre}
              type="button"
              className="mapa-marcador"
              data-activo={indice === activo ? "" : undefined}
              style={posicion(columna, fila)}
              aria-label={`Ir a ${nombre}`}
              onClick={() => irAlLugar(indice)}
            >
              <span>{nombre}</span>
            </button>
          ))}
        </div>

        <div className="mapa-lugares">
          {territorios.map((lugar) => (
            <figure key={lugar.nombre} className="mapa-lugar con-credito">
              <Image
                src={lugar.imagen}
                alt={lugar.alt}
                fill
                sizes="(min-width: 900px) 56vw, 100vw"
                quality={75}
              />
              <div className="mapa-lugar-texto">
                <p className="mapa-region">{lugar.region}</p>
                <h3>{lugar.nombre}</h3>
                <p>{lugar.texto}</p>
              </div>
              <Credito medio={lugar.medio} />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
