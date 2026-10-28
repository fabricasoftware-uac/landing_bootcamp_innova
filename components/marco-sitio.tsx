"use client";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { documentoTerminos } from "@/lib/contenido";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/motion";

export function Logo() {
  return (
    <img
      className="brand-image"
      src="/images/redesign/cauca-innova-logo.png"
      width="280"
      height="140"
      alt="Cauca INNOVA"
    />
  );
}
const enlaces = [
  ["EXPERIENCIA", "experiencia"],
  ["EL LABORATORIO", "laboratorio"],
  ["DOS JORNADAS", "agenda"],
  ["PARTICIPA", "preparacion"],
] as const;
export function MarcoSitio({ children }: { children: ReactNode }) {
  const [montado, setMontado] = useState(false);
  const [abierto, setAbierto] = useState(false);
  const [intro, setIntro] = useState(false);
  const [pieActivo, setPieActivo] = useState(false);
  const [heroActivo, setHeroActivo] = useState(true);
  const [reducido, setReducido] = useState(false);
  const contenedor = useRef<HTMLDivElement>(null);
  const fondo = useRef<HTMLDivElement>(null);
  const modal = useRef<HTMLDivElement>(null);
  const entrada = useRef<HTMLDivElement>(null);
  const cabecera = useRef<HTMLElement>(null);
  const pie = useRef<HTMLElement>(null);
  const burger = useRef<HTMLButtonElement>(null);
  const lineaMenu = useRef<gsap.core.Timeline | null>(null);
  const pendiente = useRef<string | null>(null);

  useEffect(() => {
    setMontado(true);
    const preferencia = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducido(preferencia.matches);
    const sincronizar = () => setReducido(preferencia.matches);
    preferencia.addEventListener("change", sincronizar);
    let vista = false;
    try {
      vista = sessionStorage.getItem("cauca-intro-v2") === "1";
    } catch {}
    if (!vista && !preferencia.matches) setIntro(true);
    else window.dispatchEvent(new Event("cauca-entrar"));
    return () => preferencia.removeEventListener("change", sincronizar);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.motion = reducido ? "reduced" : "full";
    window.dispatchEvent(new Event("cauca-motion-change"));
  }, [reducido]);
  const terminarIntro = useCallback(() => {
    setIntro(false);
    window.dispatchEvent(new Event("cauca-entrar"));
    requestAnimationFrame(() => burger.current?.focus());
    try {
      sessionStorage.setItem("cauca-intro-v2", "1");
    } catch {}
  }, []);
  useGSAP(
    () => {
      if (!intro || !entrada.current) return;
      if (reducido) {
        terminarIntro();
        return;
      }
      const seguridad = window.setTimeout(terminarIntro, 2800);
      const destino = cabecera.current
        ?.querySelector(".brand-image")
        ?.getBoundingClientRect();
      const origen = entrada.current
        .querySelector(".intro-logo")
        ?.getBoundingClientRect();
      const tl = gsap.timeline({ onComplete: terminarIntro });
      tl.fromTo(
        ".intro-logo",
        { y: 25, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, ease: "power3.out" },
      )
        .fromTo(
          ".intro-word span",
          { yPercent: 110 },
          { yPercent: 0, duration: 0.5, stagger: 0.05 },
          "<",
        )
        .to(".intro-word", { y: -20, opacity: 0, duration: 0.25 }, 0.9);
      if (destino && origen)
        tl.to(
          ".intro-logo",
          {
            x:
              destino.left +
              destino.width / 2 -
              (origen.left + origen.width / 2),
            y:
              destino.top +
              destino.height / 2 -
              (origen.top + origen.height / 2),
            scale: destino.width / origen.width,
            duration: 0.85,
            ease: "power4.inOut",
          },
          0.9,
        );
      tl.to(
        ".intro-door",
        { yPercent: -100, duration: 0.85, stagger: 0.08, ease: "power4.inOut" },
        1.0,
      ).to(".intro-logo", { opacity: 0, duration: 0.2 }, 1.8);
      return () => window.clearTimeout(seguridad);
    },
    { scope: entrada, dependencies: [intro, reducido], revertOnUpdate: true },
  );

  useEffect(() => {
    if (!intro) return;
    entrada.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const teclado = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") terminarIntro();
      if (evento.key === "Tab") {
        evento.preventDefault();
        entrada.current?.querySelector<HTMLButtonElement>("button")?.focus();
      }
    };
    document.addEventListener("keydown", teclado);
    return () => document.removeEventListener("keydown", teclado);
  }, [intro, terminarIntro]);
  useGSAP(
    () => {
      if (
        reducido ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      )
        return;
      const mm = gsap.matchMedia();
      mm.add("(min-width:651px)", () => {
        gsap.fromTo(
          ".footer-art",
          { y: 40, rotation: -7 },
          {
            y: -35,
            rotation: 6,
            ease: "none",
            scrollTrigger: {
              trigger: pie.current,
              start: "top bottom",
              end: "bottom bottom",
              scrub: 0.8,
            },
          },
        );
        gsap.fromTo(
          ".closing-poster h2",
          { y: 50 },
          {
            y: 0,
            ease: "none",
            scrollTrigger: {
              trigger: pie.current,
              start: "top bottom",
              end: "top 20%",
              scrub: 0.7,
            },
          },
        );
      });
      ScrollTrigger.refresh();
      return () => mm.revert();
    },
    { scope: contenedor, dependencies: [reducido], revertOnUpdate: true },
  );
  // One owner for scroll locking prevents intro and menu from restoring conflicting values.
  useEffect(() => {
    if (!abierto && !intro) return;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const nodo = fondo.current;
    if (nodo) nodo.inert = true;
    if (cabecera.current) cabecera.current.inert = true;
    return () => {
      document.body.style.overflow = anterior;
      if (nodo) nodo.inert = false;
      if (cabecera.current) cabecera.current.inert = false;
    };
  }, [abierto, intro]);
  useEffect(() => {
    let frame = 0;
    const medir = () => {
      frame = 0;
      setHeroActivo(
        (contenedor.current
          ?.querySelector(".poster-hero")
          ?.getBoundingClientRect().bottom ?? 0) >
          (cabecera.current?.offsetHeight ?? 0),
      );
      setPieActivo(
        (pie.current?.getBoundingClientRect().top ?? Infinity) <=
          (cabecera.current?.offsetHeight ?? 0) + 1,
      );
    };
    const programar = () => {
      if (!frame) frame = requestAnimationFrame(medir);
    };
    medir();
    window.addEventListener("scroll", programar, { passive: true });
    window.addEventListener("resize", programar);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", programar);
      window.removeEventListener("resize", programar);
    };
  }, []);
  useGSAP(
    () => {
      if (!montado || !modal.current) return;
      modal.current.inert = true;
      gsap.set(modal.current, { yPercent: -105, visibility: "hidden" });
      const tl = gsap.timeline({
        paused: true,
        onReverseComplete: () => {
          if (modal.current) {
            modal.current.style.visibility = "hidden";
            modal.current.inert = true;
          }
          setAbierto(false);
          requestAnimationFrame(() => burger.current?.focus());
          if (pendiente.current) {
            const id = pendiente.current;
            pendiente.current = null;
            requestAnimationFrame(() => {
              window.location.hash = id;
              const objetivo = document.getElementById(id);
              objetivo?.setAttribute("tabindex", "-1");
              objetivo?.focus({ preventScroll: true });
            });
          }
        },
      });
      tl.to(modal.current, { yPercent: 0, duration: 0.6, ease: "power4.inOut" })
        .fromTo(
          ".menu-link-letter",
          { yPercent: 115, rotate: 4 },
          {
            yPercent: 0,
            rotate: 0,
            duration: 0.5,
            stagger: 0.008,
            ease: "power3.out",
          },
          0.2,
        )
        .fromTo(
          ".menu-bottom, .menu-number",
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.3 },
          0.35,
        );
      lineaMenu.current = tl;
      return () => {
        lineaMenu.current = null;
      };
    },
    { scope: modal, dependencies: [montado] },
  );
  const cerrarDesdeTeclado = useEffectEvent(() => cerrar());
  useEffect(() => {
    if (!abierto || !modal.current) return;
    modal.current.inert = false;
    modal.current.style.visibility = "visible";
    if (reducido) lineaMenu.current?.progress(1).pause();
    else lineaMenu.current?.play();
    const primerBoton =
      modal.current.querySelector<HTMLButtonElement>("button");
    primerBoton?.focus();
    const teclado = (e: KeyboardEvent) => {
      if (e.key === "Escape") cerrarDesdeTeclado();
      if (e.key !== "Tab") return;
      const items =
        modal.current?.querySelectorAll<HTMLElement>("a[href], button");
      const primero = items?.[0];
      const ultimo = items?.[items.length - 1];
      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault();
        ultimo?.focus();
      }
      if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primero?.focus();
      }
    };
    document.addEventListener("keydown", teclado);
    return () => document.removeEventListener("keydown", teclado);
  }, [abierto, reducido]);
  function cerrar(id?: string) {
    pendiente.current = id ?? null;
    if (reducido) {
      lineaMenu.current?.progress(0).pause();
      setAbierto(false);
      if (modal.current) {
        modal.current.style.visibility = "hidden";
        modal.current.inert = true;
      }
      requestAnimationFrame(() => burger.current?.focus());
      if (id)
        requestAnimationFrame(() => {
          window.location.hash = id;
          const objetivo = document.getElementById(id);
          objetivo?.setAttribute("tabindex", "-1");
          objetivo?.focus({ preventScroll: true });
        });
    } else lineaMenu.current?.reverse();
  }
  return (
    <div
      ref={contenedor}
      className={`site-shell ${heroActivo ? "hero-scene" : ""} ${pieActivo ? "footer-scene" : ""}`}
    >
      <a className="skip-link" href="#experiencia">
        Saltar al contenido
      </a>
      <header ref={cabecera} className="site-header">
        <nav className="header-left" aria-label="Accesos principales">
          <a href="#experiencia">El festival</a>
          <a href="#agenda">13—14 NOV. 2026</a>
        </nav>
        <a className="brand" href="#inicio" aria-label="Cauca Innova, inicio">
          <Logo />
        </a>
        <div className="header-right">
          <a href="#preparacion">Participa ↗</a>
          <button
            ref={burger}
            className="burger"
            type="button"
            aria-label="Abrir menú"
            aria-expanded={abierto}
            aria-controls="menu-principal"
            onClick={() => setAbierto(true)}
          >
            <span>Menú</span>
            <i aria-hidden="true">
              <b />
              <b />
            </i>
          </button>
        </div>
      </header>
      <div ref={fondo}>
        <main id="inicio">{children}</main>
        <footer ref={pie} className="closing-poster" id="participar">
          <h2>
            NOS VEMOS
            <br />
            CREANDO.
          </h2>
          <div className="footer-art" aria-hidden="true">
            <img
              src="/images/redesign/idea-prototype.png"
              width="1024"
              height="1024"
              alt=""
              loading="lazy"
            />
          </div>
          <div className="closing-info">
            <p>
              <strong>
                13—14
                <br />
                noviembre 2026
              </strong>
              <span>Dos jornadas. Un territorio que crea.</span>
            </p>
            <a className="button light" href={documentoTerminos} download>
              Leer términos de participación ↗
            </a>
          </div>
          <div className="closing-status">
            <p>
              Formulario, plazos, sede y horarios por publicar.
              <br />
              Prepara tu equipo de tres estudiantes.
            </p>
            <a href="#preparacion">Revisa los requisitos ↗</a>
          </div>
          <div className="footer-baseline">
            <p>
              Secretaría de Desarrollo Económico
              <br />
              Gobernación del Cauca
            </p>
            <a className="back-top" href="#inicio">
              <span aria-hidden="true">↑</span>Volver al inicio
            </a>
            <p>
              Uniautónoma
              <br />
              del Cauca
            </p>
          </div>
          <button
            className="motion-control"
            type="button"
            aria-pressed={reducido}
            onClick={() => setReducido(!reducido)}
          >
            {reducido ? "Activar movimiento" : "Reducir movimiento"}
          </button>
        </footer>
      </div>
      {montado &&
        createPortal(
          <div
            ref={modal}
            id="menu-principal"
            className="full-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Navegación principal"
            aria-hidden={!abierto}
          >
            <div className="menu-top">
              <span>Festival de semilleros</span>
              <a
                href="#inicio"
                onClick={(e) => {
                  e.preventDefault();
                  cerrar("inicio");
                }}
              >
                <Logo />
              </a>
              <button type="button" onClick={() => cerrar()}>
                Cerrar ×
              </button>
            </div>
            <nav aria-label="Secciones del festival">
              {enlaces.map(([texto, id], i) => (
                <a
                  key={id}
                  href={`#${id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    cerrar(id);
                  }}
                >
                  <span className="menu-number" aria-hidden="true">
                    0{i + 1}
                  </span>
                  <span className="menu-label">
                    <span className="sr-only">{texto}</span>
                    {[...texto]
                      .map((letra, indice) => ({
                        letra,
                        clave: `${id}-${indice}`,
                      }))
                      .map(({ letra, clave }) => (
                        <span
                          className="menu-link-letter"
                          aria-hidden="true"
                          key={clave}
                        >
                          {letra === " " ? "\u00a0" : letra}
                        </span>
                      ))}
                  </span>
                  <span className="menu-arrow" aria-hidden="true">
                    ↗
                  </span>
                </a>
              ))}
            </nav>
            <img
              className="menu-prototype"
              src="/images/redesign/idea-prototype.png"
              width="1024"
              height="1024"
              alt=""
              aria-hidden="true"
            />
            <div className="menu-bottom">
              <span>13—14 noviembre 2026</span>
              <span>Del conocimiento a la solución</span>
            </div>
          </div>,
          document.body,
        )}
      {intro &&
        createPortal(
          <div
            className="intro"
            ref={entrada}
            role="dialog"
            aria-label="Bienvenida a Cauca Innova"
            aria-modal="true"
          >
            <div className="intro-door" />
            <div className="intro-door second" />
            <div className="intro-logo">
              <Logo />
            </div>
            <p className="intro-word">
              <span>ENCENDAMOS</span>
              <span>LAS IDEAS.</span>
            </p>
            <button
              className="skip-intro"
              type="button"
              onClick={terminarIntro}
            >
              Saltar intro ↗
            </button>
          </div>,
          document.body,
        )}
    </div>
  );
}
