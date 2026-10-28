"use client";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/motion";

const estados = [
  {
    palabra: "PREGUNTA.",
    texto:
      "Mira tu territorio con curiosidad. Las buenas soluciones empiezan por entender una necesidad.",
  },
  {
    palabra: "CONSTRUYE.",
    texto:
      "Conecta conocimientos. Experimenta, prototipa y mejora con tu equipo y las mentorías.",
  },
  {
    palabra: "COMPARTE.",
    texto:
      "Presenta una propuesta creativa y viable. Dale una nueva posibilidad a lo que imaginaste.",
  },
];
export function RecorridoCreativo() {
  const raiz = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      let contexto: gsap.Context | undefined;
      const construir = () => {
        contexto?.revert();
        raiz.current?.classList.remove("is-enhanced");
        contexto = gsap.context(() => {
          if (
            document.documentElement.dataset.motion === "reduced" ||
            window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
            window.innerWidth < 960 ||
            window.innerHeight < 650
          )
            return;
          raiz.current?.classList.add("is-enhanced");
          gsap.set(".journey-panel:not(:first-child)", {
            yPercent: 110,
            opacity: 0,
          });
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: raiz.current,
              start: "top top",
              end: "+=145%",
              scrub: 0.7,
              pin: true,
              anticipatePin: 1,
            },
          });
          tl.to(
            ".journey-art",
            { rotation: 13, scale: 1.1, y: -22, duration: 1.2 },
            0,
          );
          estados.slice(1).forEach((_, i) => {
            const inicio = i * 0.6 + 0.2;
            tl.to(
              `.journey-panel:nth-child(${i + 1})`,
              { yPercent: -110, opacity: 0, duration: 0.4 },
              inicio,
            ).to(
              `.journey-panel:nth-child(${i + 2})`,
              { yPercent: 0, opacity: 1, duration: 0.4 },
              inicio + 0.12,
            );
          });
          tl.to(".journey-line", { scaleX: 1, duration: 1.5, ease: "none" }, 0);
        }, raiz);
      };
      mm.add(
        "(prefers-reduced-motion: no-preference) and (min-width:960px) and (min-height:650px)",
        () => {
          construir();
          return () => {
            contexto?.revert();
            raiz.current?.classList.remove("is-enhanced");
          };
        },
      );
      window.addEventListener("cauca-motion-change", construir);
      return () => {
        window.removeEventListener("cauca-motion-change", construir);
        contexto?.revert();
        raiz.current?.classList.remove("is-enhanced");
        mm.revert();
      };
    },
    { scope: raiz },
  );
  return (
    <section
      ref={raiz}
      className="journey chapter"
      id="experiencia"
      aria-labelledby="journey-title"
    >
      <div className="section-top">
        <span id="journey-title">Del conocimiento a la solución</span>
        <span>Desliza. Sigue la idea. ↓</span>
      </div>
      <div className="journey-stage">
        <div className="journey-art">
          <img
            src="/images/redesign/idea-prototype.png"
            alt="Prototipo modular lima y navy que revela sus piezas"
            width="1024"
            height="1024"
            loading="lazy"
          />
        </div>
        <div className="journey-panels">
          {estados.map((paso, i) => (
            <div className="journey-panel" key={paso.palabra}>
              <span className="journey-index">0{i + 1} / 03</span>
              <h2>{paso.palabra}</h2>
              <p>{paso.texto}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="journey-progress" aria-hidden="true">
        <span className="journey-line" />
      </div>
    </section>
  );
}
