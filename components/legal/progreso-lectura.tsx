"use client";

import { useEffect, useRef } from "react";

/** Mide el documento, no la página: el pie no debe contar como lectura pendiente. */
function medirAvance(): number {
  const texto = document.getElementById("contenido-legal");
  if (!texto) return 0;
  const { top, height } = texto.getBoundingClientRect();
  const recorrido = height - window.innerHeight;
  if (recorrido <= 0) return 1;
  return Math.min(1, Math.max(0, -top / recorrido));
}

export function ProgresoLectura() {
  const barra = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cuadro = 0;
    const pintar = () => {
      cuadro = 0;
      barra.current?.style.setProperty("transform", `scaleX(${medirAvance()})`);
    };
    const programar = () => {
      if (!cuadro) cuadro = requestAnimationFrame(pintar);
    };
    pintar();
    window.addEventListener("scroll", programar, { passive: true });
    window.addEventListener("resize", programar);
    return () => {
      cancelAnimationFrame(cuadro);
      window.removeEventListener("scroll", programar);
      window.removeEventListener("resize", programar);
    };
  }, []);

  return <div ref={barra} className="legal-progreso" aria-hidden="true" />;
}
