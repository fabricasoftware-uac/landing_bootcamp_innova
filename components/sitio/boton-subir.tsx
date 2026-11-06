"use client";

import { useEffect, useRef, useState } from "react";
import { irA } from "@/lib/motion";

const RADIO = 22;
const PERIMETRO = 2 * Math.PI * RADIO;
const UMBRAL = 700;

/** Sube al inicio; el anillo muestra cuánto se ha recorrido de la página. */
export function BotonSubir() {
  const [visible, setVisible] = useState(false);
  const anillo = useRef<SVGCircleElement>(null);

  useEffect(() => {
    let cuadro = 0;
    const medir = () => {
      cuadro = 0;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const avance = total > 0 ? window.scrollY / total : 0;
      setVisible(window.scrollY > UMBRAL);
      if (anillo.current) {
        anillo.current.style.strokeDashoffset = String(
          PERIMETRO * (1 - avance),
        );
      }
    };
    const programar = () => {
      if (!cuadro) cuadro = requestAnimationFrame(medir);
    };
    medir();
    window.addEventListener("scroll", programar, { passive: true });
    return () => {
      cancelAnimationFrame(cuadro);
      window.removeEventListener("scroll", programar);
    };
  }, []);

  return (
    <button
      type="button"
      className="boton-subir"
      data-visible={visible ? "" : undefined}
      aria-label="Volver arriba"
      tabIndex={visible ? 0 : -1}
      onClick={() => irA(0)}
    >
      <svg viewBox="0 0 52 52" aria-hidden="true">
        <circle cx="26" cy="26" r={RADIO} className="boton-subir-base" />
        <circle
          ref={anillo}
          cx="26"
          cy="26"
          r={RADIO}
          className="boton-subir-anillo"
          strokeDasharray={PERIMETRO}
          strokeDashoffset={PERIMETRO}
        />
        <path d="M26 34V19M19.5 25 26 18.5l6.5 6.5" />
      </svg>
    </button>
  );
}
