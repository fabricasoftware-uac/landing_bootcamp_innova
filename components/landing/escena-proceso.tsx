"use client";

import { useEffect, useRef, useState } from "react";
import { etapasIdea } from "@/lib/contenido";
import type { EscenaImpresora } from "@/lib/escena-impresora";
import { gsap, prefiereMenosMovimiento, useGSAP } from "@/lib/motion";

const GIRO_MAXIMO = 0.7;

/** Arrastrar gira la impresora; soltarla la devuelve a la toma del scroll. */
function useArrastre(escena: React.RefObject<EscenaImpresora | null>) {
  const inicio = useRef<number | null>(null);
  return {
    onPointerDown: (evento: React.PointerEvent<HTMLCanvasElement>) => {
      if (evento.pointerType !== "mouse") return;
      inicio.current = evento.clientX;
      evento.currentTarget.setPointerCapture(evento.pointerId);
    },
    onPointerMove: (evento: React.PointerEvent<HTMLCanvasElement>) => {
      if (inicio.current === null) return;
      const delta = (evento.clientX - inicio.current) / 280;
      escena.current?.fijarGiro(
        gsap.utils.clamp(-GIRO_MAXIMO, GIRO_MAXIMO, delta),
      );
    },
    onPointerUp: () => {
      inicio.current = null;
      escena.current?.fijarGiro(0);
    },
  };
}

export function EscenaProceso() {
  const raiz = useRef<HTMLElement>(null);
  const lienzo = useRef<HTMLCanvasElement>(null);
  const escena = useRef<EscenaImpresora | null>(null);
  const [activa, setActiva] = useState(0);
  const [con3d, setCon3d] = useState(false);
  const arrastre = useArrastre(escena);

  useEffect(() => {
    const nodo = lienzo.current;
    const seccion = raiz.current;
    if (!nodo || !seccion || prefiereMenosMovimiento()) return;
    let cancelado = false;
    let visible = false;
    const observador = new IntersectionObserver(
      ([entrada]) => {
        visible = Boolean(entrada?.isIntersecting);
        if (visible && !escena.current) {
          import("@/lib/escena-impresora")
            .then(({ crearEscena }) => {
              if (cancelado) return;
              escena.current = crearEscena(nodo);
              setCon3d(true);
              escena.current.activar(visible);
            })
            .catch((error: unknown) => {
              // Sin WebGL queda la imagen de la impresora.
              console.error("No se pudo iniciar la escena 3D:", error);
            });
        }
        escena.current?.activar(visible);
      },
      { rootMargin: "25% 0px" },
    );
    observador.observe(seccion);
    const medidor = new ResizeObserver(() => escena.current?.redimensionar());
    medidor.observe(nodo);
    return () => {
      cancelado = true;
      observador.disconnect();
      medidor.disconnect();
      escena.current?.destruir();
      escena.current = null;
    };
  }, []);

  useGSAP(
    () => {
      if (prefiereMenosMovimiento()) return;
      gsap.timeline({
        scrollTrigger: {
          trigger: raiz.current,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          onUpdate: ({ progress }) => {
            escena.current?.fijarAvance(progress);
            setActiva(
              Math.min(etapasIdea.length - 1, Math.floor(progress * 3)),
            );
          },
        },
      });
    },
    { scope: raiz },
  );

  return (
    <section
      ref={raiz}
      id="proceso"
      className="proceso"
      data-tema="claro"
      aria-labelledby="titulo-proceso"
    >
      <div className="proceso-fijo">
        <h2 id="titulo-proceso" className="proceso-titulo">
          Del «¿y si?» al «lo hicimos».
        </h2>

        <div className="proceso-palabras" aria-hidden="true">
          {etapasIdea.map(({ nombre }, indice) => (
            <span key={nombre} data-activa={indice === activa ? "" : undefined}>
              {nombre}
            </span>
          ))}
        </div>

        <img
          className="proceso-respaldo"
          data-oculto={con3d ? "" : undefined}
          src="/images/impresora.webp"
          width="1100"
          height="1100"
          alt="Impresora 3D creando un prototipo"
          loading="lazy"
        />
        <canvas
          ref={lienzo}
          className="proceso-lienzo"
          data-listo={con3d ? "" : undefined}
          role="img"
          aria-label="Impresora 3D imprimiendo el mapa del Cauca capa por capa"
          {...arrastre}
        />

        <div className="proceso-textos">
          {etapasIdea.map((etapa, indice) => (
            <article
              key={etapa.nombre}
              data-activa={indice === activa ? "" : undefined}
            >
              <h3>{etapa.titulo}</h3>
              <p>{etapa.texto}</p>
            </article>
          ))}
        </div>

        <ol className="proceso-indice" aria-hidden="true">
          {etapasIdea.map(({ nombre }, indice) => (
            <li key={nombre} data-activa={indice <= activa ? "" : undefined} />
          ))}
        </ol>
      </div>
    </section>
  );
}
