"use client";

import { useEffect, useRef, useState } from "react";
import {
  documentoTerminos,
  enlacesSeccion,
  paginaTerminos,
} from "@/lib/contenido";
import {
  gsap,
  prefiereMenosMovimiento,
  SplitText,
  useGSAP,
} from "@/lib/motion";
import { POLIGONO_SILUETA } from "@/lib/pieza-cauca";

const COLUMNAS = 14;
const FILAS = 8;
const CELDAS = Array.from(
  { length: COLUMNAS * FILAS },
  (_, indice) => `celda-${indice}`,
);

interface MenuCompletoProps {
  prefijo: string;
  abierto: boolean;
  alCerrar: () => void;
  alTerminarCierre: () => void;
}

/** La pantalla se cubre con píxeles, como se imprime una capa, y luego llegan los enlaces. */
function crearApertura(raiz: HTMLElement, alTerminarCierre: () => void) {
  const titulares = SplitText.create(".menu-enlace-texto", {
    type: "chars",
    mask: "chars",
  });
  const linea = gsap.timeline({
    paused: true,
    onReverseComplete: alTerminarCierre,
  });
  linea
    .set(raiz, { visibility: "visible" })
    .fromTo(
      ".menu-celda",
      { scale: 0 },
      {
        scale: 1.02,
        duration: 0.28,
        ease: "power2.out",
        stagger: { grid: [FILAS, COLUMNAS], from: "random", amount: 0.42 },
      },
    )
    .set(".menu-fondo", { opacity: 1 })
    .set(".menu-celdas", { opacity: 0 })
    .fromTo(
      titulares.chars,
      { yPercent: 115 },
      { yPercent: 0, duration: 0.6, ease: "expo.out", stagger: 0.012 },
      "-=0.05",
    )
    .fromTo(
      ".menu-vista",
      { clipPath: "inset(100% 0 0 0)" },
      { clipPath: "inset(0% 0 0 0)", duration: 0.8, ease: "expo.inOut" },
      "-=0.75",
    )
    .fromTo(
      ".menu-pie > *",
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, stagger: 0.06 },
      "-=0.55",
    );
  return linea;
}

function useTecladoMenu(
  raiz: React.RefObject<HTMLDivElement | null>,
  abierto: boolean,
  alCerrar: () => void,
) {
  useEffect(() => {
    if (!abierto) return;
    const nodo = raiz.current;
    nodo?.querySelector<HTMLElement>("a[href]")?.focus({ preventScroll: true });
    const teclado = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") alCerrar();
      if (evento.key !== "Tab" || !nodo) return;
      const enfocables = nodo.querySelectorAll<HTMLElement>("a[href]");
      const primero = enfocables[0];
      const ultimo = enfocables[enfocables.length - 1];
      if (evento.shiftKey && document.activeElement === primero) {
        evento.preventDefault();
        ultimo?.focus();
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        primero?.focus();
      }
    };
    document.addEventListener("keydown", teclado);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", teclado);
      document.documentElement.style.overflow = "";
    };
  }, [abierto, alCerrar, raiz]);
}

export function MenuCompleto({
  prefijo,
  abierto,
  alCerrar,
  alTerminarCierre,
}: MenuCompletoProps) {
  const raiz = useRef<HTMLDivElement>(null);
  const apertura = useRef<gsap.core.Timeline | null>(null);
  const [vista, setVista] = useState(0);

  useGSAP(
    () => {
      if (!raiz.current) return;
      apertura.current = crearApertura(raiz.current, alTerminarCierre);
    },
    { scope: raiz, dependencies: [alTerminarCierre] },
  );

  useEffect(() => {
    const linea = apertura.current;
    if (!linea) return;
    if (prefiereMenosMovimiento()) {
      linea.progress(abierto ? 1 : 0).pause();
      if (!abierto) alTerminarCierre();
      return;
    }
    if (abierto) linea.play();
    else if (linea.progress() > 0) linea.timeScale(1.6).reverse();
  }, [abierto, alTerminarCierre]);

  useTecladoMenu(raiz, abierto, alCerrar);

  return (
    <div
      ref={raiz}
      id="menu-principal"
      className="menu"
      role="dialog"
      aria-modal="true"
      aria-label="Navegación principal"
      aria-hidden={!abierto}
      inert={!abierto}
    >
      <div className="menu-celdas" aria-hidden="true">
        {CELDAS.map((celda, indice) => (
          <span key={celda} className={`menu-celda menu-celda-${indice % 3}`} />
        ))}
      </div>
      <div className="menu-fondo" />

      <div className="menu-cuerpo">
        <nav className="menu-enlaces" aria-label="Secciones">
          {enlacesSeccion.map(({ texto, id }, indice) => (
            <a
              key={id}
              href={`${prefijo}#${id}`}
              onClick={alCerrar}
              onMouseEnter={() => setVista(indice)}
              onFocus={() => setVista(indice)}
              data-activo={vista === indice ? "" : undefined}
            >
              <span className="menu-enlace-texto">{texto}</span>
            </a>
          ))}
        </nav>

        <div className="menu-vista" aria-hidden="true">
          <div
            className="menu-vista-mapa"
            style={{ clipPath: POLIGONO_SILUETA }}
          >
            {enlacesSeccion.map(({ id, imagen }, indice) => (
              <img
                key={id}
                src={imagen}
                alt=""
                loading="lazy"
                data-activa={vista === indice ? "" : undefined}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="menu-pie">
        <p>14 de noviembre de 2026</p>
        <a href={paginaTerminos}>Términos de referencia</a>
        <a className="menu-postular" href={documentoTerminos} download>
          Descargar PDF <span aria-hidden="true">↓</span>
        </a>
      </div>
    </div>
  );
}
