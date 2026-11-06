"use client";

import { useEffect, useState } from "react";
import { paginaTerminos } from "@/lib/contenido";

/* Botón flotante accesible que acompaña el scroll hacia la información de la convocatoria. */
export function AccesoPostular() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let enPie = false;
    let cuadro = 0;
    const medir = () => {
      cuadro = 0;
      setVisible(window.scrollY > window.innerHeight * 0.7 && !enPie);
    };
    const programar = () => {
      if (!cuadro) cuadro = requestAnimationFrame(medir);
    };
    const pie = document.querySelector(".pie-centinela");
    const observador = new IntersectionObserver(([entrada]) => {
      enPie = Boolean(entrada?.isIntersecting);
      programar();
    });
    if (pie) observador.observe(pie);
    window.addEventListener("scroll", programar, { passive: true });
    return () => {
      cancelAnimationFrame(cuadro);
      observador.disconnect();
      window.removeEventListener("scroll", programar);
    };
  }, []);

  return (
    <div className="acceso-postular" data-visible={visible ? "" : undefined}>
      <a href={paginaTerminos} tabIndex={visible ? 0 : -1}>
        <span>Términos de referencia</span>
        <small>14 nov · 21 cupos</small>
      </a>
    </div>
  );
}
