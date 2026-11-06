"use client";

import { useRef } from "react";
import { gsap, prefiereMenosMovimiento, useGSAP } from "@/lib/motion";
import { LogoCauca, LogoMascara } from "./logos";

const ESPERA_CARGA = 2.2;
const PAUSA_UNIVERSIDAD = 8;
const PAUSA_ALIANZA = 4;

/** Abre la Uniautónoma con su lema y se queda; Cauca INNOVA y la Gobernación pasan rápido. */
export function MarcaAnimada() {
  const raiz = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      if (prefiereMenosMovimiento()) return;
      // Solo la portada tiene carga: en las demás páginas el logo entra de una.
      const yaVisto =
        document.documentElement.dataset.intro === "no" ||
        !document.querySelector(".carga");
      // Sin esto, cada estado inicial escondería el logo desde el primer cuadro.
      const base = { immediateRender: false };

      gsap
        .timeline({ delay: yaVisto ? 0.1 : ESPERA_CARGA, repeat: -1 })
        .set(".marca-universidad", { autoAlpha: 1 })
        .fromTo(
          ".marca-grifo",
          { scale: 0.5, rotation: -14, opacity: 0 },
          {
            ...base,
            scale: 1,
            rotation: 0,
            opacity: 1,
            duration: 0.55,
            ease: "back.out(1.8)",
          },
        )
        .fromTo(
          ".marca-letras",
          { clipPath: "inset(-10% 100% -10% 0)" },
          {
            ...base,
            clipPath: "inset(-10% 0% -10% 0)",
            duration: 0.5,
            ease: "power3.out",
          },
          "-=0.35",
        )
        .fromTo(
          ".marca-lema > *",
          { x: -14, opacity: 0 },
          {
            ...base,
            x: 0,
            opacity: 1,
            duration: 0.45,
            ease: "power3.out",
            stagger: 0.14,
          },
          "-=0.2",
        )
        .to(
          ".marca-universidad",
          { yPercent: -110, duration: 0.28, ease: "power3.in" },
          `+=${PAUSA_UNIVERSIDAD}`,
        )
        .set(".marca-universidad", { autoAlpha: 0, yPercent: 0 })
        .fromTo(
          ".marca-alianza",
          { yPercent: 110, opacity: 0 },
          {
            ...base,
            yPercent: 0,
            opacity: 1,
            duration: 0.4,
            ease: "expo.out",
          },
          "-=0.04",
        )
        .fromTo(
          ".logo-recuadro",
          { scale: 0.4, rotation: -90, svgOrigin: "390 365" },
          {
            ...base,
            scale: 1,
            rotation: 0,
            duration: 0.5,
            ease: "back.out(1.6)",
          },
          "<",
        )
        .to(
          ".marca-alianza",
          { yPercent: -110, opacity: 0, duration: 0.25, ease: "power3.in" },
          `+=${PAUSA_ALIANZA}`,
        );
    },
    { scope: raiz },
  );

  return (
    <span ref={raiz} className="marca">
      <span className="marca-alianza">
        <LogoCauca />
        <span className="marca-gobernacion">
          <LogoMascara nombre="gobernacion-compacto" />
        </span>
      </span>
      <span className="marca-universidad">
        <LogoMascara nombre="uniautonoma-grifo" clase="marca-grifo" />
        <LogoMascara nombre="uniautonoma-letras" clase="marca-letras" />
        <span className="marca-lema">
          <span>Somos</span>
          <em>el motor de la</em>
          <span>innovación</span>
        </span>
      </span>
    </span>
  );
}
