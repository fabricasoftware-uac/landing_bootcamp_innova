"use client";
import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/motion";
export function ImpresoraInteractiva() {
  const raiz = useRef<HTMLDivElement>(null);
  const [estado, setEstado] = useState<"lista" | "imprimiendo" | "terminada">(
    "lista",
  );
  const ciclo = useRef<gsap.core.Timeline | null>(null);
  const { contextSafe } = useGSAP(
    () => () => {
      ciclo.current?.kill();
    },
    { scope: raiz },
  );
  useEffect(() => {
    const finalizar = () => {
      if (document.documentElement.dataset.motion !== "reduced") return;
      ciclo.current?.kill();
      const nodo = raiz.current;
      if (nodo)
        gsap.set(
          nodo.querySelectorAll(
            ".print-layer, .print-head, .print-result, .print-spool",
          ),
          { clearProps: "transform,opacity" },
        );
      setEstado((actual) => (actual === "imprimiendo" ? "terminada" : actual));
    };
    window.addEventListener("cauca-motion-change", finalizar);
    return () => window.removeEventListener("cauca-motion-change", finalizar);
  }, []);
  const imprimir = contextSafe(() => {
    ciclo.current?.kill();
    if (
      document.documentElement.dataset.motion === "reduced" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setEstado("terminada");
      gsap.set(".print-layer", { opacity: 1, scaleX: 1 });
      return;
    }
    setEstado("imprimiendo");
    const capas = gsap.utils.toArray<SVGElement>(".print-layer", raiz.current);
    gsap.set(capas, { opacity: 0, scaleX: 0.3, transformOrigin: "50% 50%" });
    const tl = gsap.timeline({ onComplete: () => setEstado("terminada") });
    ciclo.current = tl;
    tl.to(
      ".print-spool",
      { rotation: "+=300", svgOrigin: "111 211", duration: 3.2, ease: "none" },
      0,
    )
      .fromTo(
        ".print-head",
        { x: -55, y: 60 },
        {
          x: 55,
          y: -4,
          duration: 0.2,
          repeat: 13,
          yoyo: true,
          ease: "sine.inOut",
        },
        0,
      )
      .to(
        capas,
        {
          opacity: 1,
          scaleX: 1,
          duration: 0.18,
          stagger: 0.19,
          ease: "power1.out",
        },
        0.2,
      )
      .to(".print-head", { x: 0, y: 0, duration: 0.35, ease: "power3.out" })
      .fromTo(
        ".print-result",
        { y: 0 },
        { y: -9, duration: 0.25, yoyo: true, repeat: 1, ease: "power2.out" },
      );
  });
  return (
    <div className="printer-lab" ref={raiz}>
      <div className="printer-lab-top">
        <span>DE LA IDEA A LA CAPA</span>
        <span aria-live="polite">
          {estado === "imprimiendo"
            ? "Construyendo…"
            : estado === "terminada"
              ? "¡Idea lista!"
              : "Tu idea está lista para empezar"}
        </span>
      </div>
      <svg
        viewBox="0 0 620 460"
        role="img"
        aria-label="Modelo interactivo de impresora 3D con cabezal, bobina y prototipo por capas"
      >
        <defs>
          <linearGradient id="metal" x2="1" y2="1">
            <stop stopColor="#12bea5" />
            <stop offset="1" stopColor="#006b60" />
          </linearGradient>
        </defs>
        <ellipse
          cx="330"
          cy="415"
          rx="238"
          ry="22"
          fill="#10384f"
          opacity=".12"
        />
        <path d="m160 360 280-36 122 56-281 43Z" fill="#10384f" />
        <path
          d="M160 360v29l121 56v-22Zm121 63v22l281-41v-24Z"
          fill="#096d65"
        />
        <path
          d="M201 352V80l244-27v274"
          fill="none"
          stroke="#10384f"
          strokeWidth="28"
        />
        <path
          d="M201 352V80l244-27"
          fill="none"
          stroke="url(#metal)"
          strokeWidth="17"
        />
        <path
          d="m201 99 243-28M201 128l243-28"
          stroke="#b4d5cd"
          strokeWidth="5"
        />
        <path
          d="m210 327 180-24 111 46-187 31Z"
          fill="#153a55"
          stroke="#82c3b1"
          strokeWidth="3"
        />
        <g className="print-result">
          {Array.from({ length: 14 }, (_, nivel) => ({
            nivel,
            altura: 324 - nivel * 6,
          })).map(({ nivel: i, altura }) => (
            <path
              className="print-layer"
              key={altura}
              d={`m${282 + i * 1.2} ${324 - i * 6} 68-10 40 18-68 11Z`}
              fill={i % 2 ? "#d1ef3d" : "#a5c626"}
              stroke="#7b9a15"
              strokeWidth=".8"
            />
          ))}
        </g>
        <path
          d="M172 198c-20-120 80-182 153-65"
          fill="none"
          stroke="#10384f"
          strokeWidth="9"
        />
        <g className="print-head">
          <path d="m288 121 45-7 29 15v55l-46 7-28-16Z" fill="#10384f" />
          <path
            d="m288 121 28 16 46-8M316 137v54"
            fill="none"
            stroke="#36ba9f"
            strokeWidth="4"
          />
          <path d="m322 191 12 0-5 17Z" fill="#a4c2b8" />
          <circle cx="330" cy="160" r="12" fill="#006b5c" />
          <path d="M329 147v26m-12-13h25" stroke="#c4ed4c" strokeWidth="2" />
        </g>
        <path d="M450 327V56l25 12v285" fill="url(#metal)" />
        <path d="M450 56v271" stroke="#10384f" strokeWidth="10" />
        <g className="print-spool">
          <ellipse cx="111" cy="211" rx="49" ry="76" fill="#10384f" />
          <ellipse cx="111" cy="211" rx="32" ry="58" fill="#d1ef3d" />
          <ellipse cx="111" cy="211" rx="12" ry="23" fill="#10384f" />
          <path
            d="M111 140v48m0 46v48M65 211h34m24 0h34m-77-49 23 32m16 34 22 32m-61 0 23-32m16-34 22-32"
            stroke="#10384f"
            strokeWidth="6"
          />
        </g>
        <path d="m376 385 51-6v16l-51 7Z" fill="#10384f" />
        <circle cx="464" cy="381" r="7" fill="#d1ef3d" />
        <path
          d="m185 371 9-1m303-19 8-1"
          stroke="#c5d9cc"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
      <button
        className="button"
        type="button"
        onClick={imprimir}
        disabled={estado === "imprimiendo"}
      >
        {estado === "imprimiendo"
          ? "Imprimiendo una idea"
          : estado === "terminada"
            ? "Imprime otra vez"
            : "Imprime una idea"}
        <span aria-hidden="true">↗</span>
      </button>
    </div>
  );
}
