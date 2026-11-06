"use client";

import { useEffect, useRef, useState } from "react";
import { rutaVideo } from "@/components/sitio/video-perezoso";
import { versionesPrototipo } from "@/lib/contenido";
import { prefiereMenosMovimiento } from "@/lib/motion";
import { CONTORNO_SILUETA } from "@/lib/pieza-cauca";

const DURACION_VERSION = 3600;

/* Ventana inicial aproximada: evita ver el video completo un instante antes de hidratar. */
const POLIGONO_INICIAL = `polygon(${CONTORNO_SILUETA.map(
  ([x, y]) =>
    `${(54 + (x / 14) * 41).toFixed(2)}% ${(12 + (y / 15) * 80).toFixed(2)}%`,
).join(",")})`;

function useVersionActiva(raiz: React.RefObject<HTMLElement | null>): number {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (prefiereMenosMovimiento()) return;
    let visible = true;
    const observador = new IntersectionObserver(([entrada]) => {
      visible = Boolean(entrada?.isIntersecting);
    });
    if (raiz.current) observador.observe(raiz.current);
    const reloj = window.setInterval(() => {
      if (!visible || document.hidden) return;
      setVersion((actual) => (actual + 1) % versionesPrototipo.length);
    }, DURACION_VERSION);
    return () => {
      observador.disconnect();
      window.clearInterval(reloj);
    };
  }, [raiz]);

  return version;
}

/** Solo corre el clip visible; los demás se piden uno a uno cuando la página ya respiró. */
function VideosBanner({ version }: { version: number }) {
  const lista = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    if (prefiereMenosMovimiento()) return;
    const primero = lista.current[0];
    if (primero) primero.src = rutaVideo(versionesPrototipo[0].video);
    const pendientes = window.setTimeout(() => {
      versionesPrototipo.slice(1).forEach(({ video }, indice) => {
        const nodo = lista.current[indice + 1];
        if (nodo) nodo.src = rutaVideo(video);
      });
    }, 2600);
    return () => window.clearTimeout(pendientes);
  }, []);

  useEffect(() => {
    if (prefiereMenosMovimiento()) return;
    lista.current.forEach((nodo, indice) => {
      if (!nodo) return;
      if (indice === version) {
        nodo.currentTime = 0;
        // Si el navegador niega la reproducción, el póster sigue a la vista.
        nodo.play().catch(() => undefined);
      } else {
        nodo.pause();
      }
    });
  }, [version]);

  return versionesPrototipo.map(({ video }, indice) => (
    <video
      key={video}
      ref={(nodo) => {
        lista.current[indice] = nodo;
      }}
      className="banner-video"
      data-activo={indice === version ? "" : undefined}
      muted
      loop
      playsInline
      preload="none"
      poster={`/video/${video}.webp`}
      aria-hidden="true"
      tabIndex={-1}
    />
  ));
}

export function Portada() {
  const raiz = useRef<HTMLElement>(null);
  const version = useVersionActiva(raiz);

  return (
    <section
      ref={raiz}
      className="banner"
      data-tema="oscuro"
      data-barra="abierta"
      aria-labelledby="titulo-banner"
    >
      <div className="banner-fijo">
        <div className="banner-ventana" style={{ clipPath: POLIGONO_INICIAL }}>
          <VideosBanner version={version} />
          <div className="banner-velo" />
        </div>

        <span className="banner-pixel banner-pixel-1" data-capa="-0.5" />
        <span className="banner-pixel banner-pixel-2" data-capa="0.7" />
        <span className="banner-pixel banner-pixel-3" data-capa="-0.9" />

        <div className="banner-copia">
          <p className="banner-nombre">Bootcamp Cauca INNOVA</p>
          <h1
            id="titulo-banner"
            aria-label="Aquí las ideas se convierten en prototipos"
          >
            <span className="banner-fija" aria-hidden="true">
              Aquí las ideas
            </span>
            <span className="banner-rotativas" aria-hidden="true">
              {versionesPrototipo.map(({ verbo }, indice) => (
                <span
                  key={verbo}
                  className="banner-rotativa"
                  data-activa={indice === version ? "" : undefined}
                >
                  {verbo}
                </span>
              ))}
            </span>
          </h1>
          <p className="banner-bajada">
            Siete equipos de semilleros del Cauca entran con una pregunta y
            salen con un prototipo. 14 de noviembre de 2026.
          </p>
          <div className="banner-acciones">
            <a className="boton boton-lima boton-grande" href="/postulacion">
              Postular a mi equipo <span className="flecha">→</span>
            </a>
            <a className="enlace-banner" href="#jornada">
              Ver el recorrido
            </a>
          </div>
        </div>

        <div className="banner-final" aria-hidden="true">
          <p>
            Tres estudiantes.
            <br />
            Un día.
            <br />
            <span className="acento">Un prototipo real.</span>
          </p>
        </div>
      </div>
    </section>
  );
}
