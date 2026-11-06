"use client";

import { useEffect, useState } from "react";

/* Botón flotante accesible que acompaña el scroll bajo el pulgar en móviles y pantallas táctiles. */
export function AccesoPostular() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let enPie = false;
    let cuadro = 0;
    const medir = () => {
      cuadro = 0;
      setVisible(window.scrollY > 160 && !enPie);
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
      <a href="/postulacion" tabIndex={visible ? 0 : -1}>
        <span>Inscribir equipo</span>
        <small>5 pasos · 21 cupos</small>
      </a>
    </div>
  );
}
