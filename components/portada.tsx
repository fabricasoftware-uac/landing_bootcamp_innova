"use client";
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/motion";
export function Portada() {
  const raiz = useRef<HTMLElement>(null);
  useEffect(() => {
    let entradaRealizada = false;
    let contextoEntrada: gsap.Context | undefined;
    const entrar = () => {
      if (entradaRealizada) return;
      entradaRealizada = true;
      if (
        document.documentElement.dataset.motion === "reduced" ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      )
        return;
      contextoEntrada = gsap.context(() => {
        gsap.fromTo(
          ".poster-title .title-inner",
          { yPercent: 110 },
          { yPercent: 0, duration: 1.1, stagger: 0.12, ease: "power4.out" },
        );
        gsap.fromTo(
          ".hero-printer",
          { y: 70, rotation: -7, scale: 0.92 },
          {
            y: 0,
            rotation: 0,
            scale: 1,
            duration: 1.3,
            ease: "power3.out",
            delay: 0.1,
          },
        );
      }, raiz);
    };
    window.addEventListener("cauca-entrar", entrar);
    return () => {
      window.removeEventListener("cauca-entrar", entrar);
      contextoEntrada?.revert();
    };
  }, []);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const crear = () => {
        const contexto = gsap.context(() => {
          if (
            document.documentElement.dataset.motion === "reduced" ||
            window.matchMedia("(prefers-reduced-motion: reduce)").matches
          )
            return;
          gsap.to(".printer-scroll", {
            y: -65,
            rotation: -3,
            ease: "none",
            scrollTrigger: {
              trigger: raiz.current,
              start: "top top",
              end: "bottom top",
              scrub: 0.8,
            },
          });
          gsap.to(".poster-title", {
            yPercent: -15,
            ease: "none",
            scrollTrigger: {
              trigger: raiz.current,
              start: "top top",
              end: "bottom top",
              scrub: 0.6,
            },
          });
          gsap.utils.toArray<HTMLElement>("[data-depth]").forEach((capa) => {
            gsap.to(capa, {
              y: Number(capa.dataset.depth),
              rotation: 12,
              ease: "none",
              scrollTrigger: {
                trigger: raiz.current,
                start: "top top",
                end: "bottom top",
                scrub: 1,
              },
            });
          });
        }, raiz);
        return contexto;
      };
      let contexto: gsap.Context | undefined;
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        contexto = crear();
        return () => contexto?.revert();
      });
      const cambio = () => {
        contexto?.revert();
        contexto = crear();
      };
      window.addEventListener("cauca-motion-change", cambio);
      let vivo = true;
      document.fonts.ready.then(() => {
        if (vivo) ScrollTrigger.refresh();
      });
      return () => {
        vivo = false;
        window.removeEventListener("cauca-motion-change", cambio);
        contexto?.revert();
        mm.revert();
      };
    },
    { scope: raiz },
  );
  useEffect(() => {
    const el = raiz.current;
    if (!el || !window.matchMedia("(hover: hover) and (pointer: fine)").matches)
      return;
    const capas = [...el.querySelectorAll<HTMLElement>("[data-pointer]")].map(
      (nodo) => ({
        nodo,
        factor: Number(nodo.dataset.pointer),
        x: gsap.quickTo(nodo, "x", { duration: 0.9, ease: "power3.out" }),
        y: gsap.quickTo(nodo, "y", { duration: 0.9, ease: "power3.out" }),
      }),
    );
    const mover = (e: PointerEvent) => {
      if (document.documentElement.dataset.motion === "reduced") return;
      const box = el.getBoundingClientRect();
      const x = (e.clientX - box.left) / box.width - 0.5;
      const y = (e.clientY - box.top) / box.height - 0.5;
      for (const c of capas) {
        c.x(x * c.factor);
        c.y(y * c.factor * 0.65);
      }
    };
    const volver = () => {
      for (const c of capas) {
        c.x(0);
        c.y(0);
      }
    };
    el.addEventListener("pointermove", mover, { passive: true });
    el.addEventListener("pointerleave", volver);
    window.addEventListener("cauca-motion-change", volver);
    return () => {
      el.removeEventListener("pointermove", mover);
      el.removeEventListener("pointerleave", volver);
      window.removeEventListener("cauca-motion-change", volver);
      for (const c of capas) {
        c.x.tween.kill();
        c.y.tween.kill();
        gsap.set(c.nodo, { clearProps: "transform" });
      }
    };
  }, []);
  return (
    <section className="poster-hero" ref={raiz} aria-labelledby="hero-title">
      <div className="hero-corners">
        <p>
          13—14
          <br />
          NOVIEMBRE
          <br />
          2026
        </p>
        <p>
          Del conocimiento
          <br />a la solución.
        </p>
      </div>
      <h1 id="hero-title" className="poster-title">
        <span>
          <span className="title-inner">EL CAUCA</span>
        </span>
        <span>
          <span className="title-inner">SE INVENTA.</span>
        </span>
      </h1>
      <div className="hero-print">
        <div className="printer-scroll">
          <div data-pointer="22">
            <img
              src="/images/hero-maker.png"
              className="hero-printer"
              width="1280"
              height="1280"
              alt="Impresora 3D verde creando un prototipo lima: una idea toma forma"
              fetchPriority="high"
            />
          </div>
        </div>
      </div>
      <div className="hero-shape shape-one" data-depth="-120">
        <div data-pointer="-45">
          <svg viewBox="0 0 160 160" aria-hidden="true">
            <path
              d="m80 8 65 38-2 74-63 34-65-35V45Z M80 8v146M15 45l128 75M145 46 15 119M15 45l65 39 65-38M15 119l65-35 63 36"
              fill="none"
              stroke="currentColor"
              strokeWidth="5"
            />
          </svg>
        </div>
      </div>
      <div className="hero-shape shape-two" data-depth="-190">
        <div data-pointer="55">
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <path
              d="m60 5 14 18 22-2 3 23 16 16-16 16-3 23-22-2-14 18-14-18-22 2-3-23L5 60l16-16 3-23 22 2Z"
              fill="currentColor"
            />
            <circle cx="60" cy="60" r="23" fill="#10384f" />
          </svg>
        </div>
      </div>
      <div className="hero-shape shape-three" data-depth="-85">
        <div data-pointer="-35">
          <svg viewBox="0 0 180 180" aria-hidden="true">
            <path
              d="m90 8 73 42v82l-73 42-73-42V50ZM17 50l73 42 73-42M90 92v82M90 8v84M17 132l146-82M17 50l146 82"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
            />
          </svg>
        </div>
      </div>
      <div className="hero-description">
        <h2>
          Festival de Semilleros
          <br />
          de Investigación
        </h2>
        <p>
          Dos jornadas para convertir
          <br />
          preguntas en prototipos.
        </p>
      </div>
      <a className="hero-action" href="#experiencia">
        <span aria-hidden="true">↗</span>
        <strong>
          Conoce
          <br />
          el festival
        </strong>
      </a>
      <div className="hero-baseline">
        <span />
        <a href="#experiencia">
          CAUCA · COLOMBIA <b aria-hidden="true">↓</b>
        </a>
        <span />
      </div>
    </section>
  );
}
