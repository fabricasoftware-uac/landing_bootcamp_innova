"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import {
  gsap,
  prefiereMenosMovimiento,
  registrarScrollSuave,
  ScrollTrigger,
  SplitText,
  saltarA,
} from "@/lib/motion";
import { CONTORNO_SILUETA } from "@/lib/pieza-cauca";

const COLUMNAS = 14;
const FILAS = 15;
/* Una celda bien adentro del mapa: desde ahí crece sin que aparezcan sus bordes. */
const FOCO = { x: 7.5 / COLUMNAS, y: 5.5 / FILAS };

function crearScrollSuave(): () => void {
  const lenis = new Lenis({ lerp: 0.11 });
  const avanzar = (tiempo: number) => lenis.raf(tiempo * 1000);
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(avanzar);
  gsap.ticker.lagSmoothing(0);
  registrarScrollSuave(lenis);
  return () => {
    registrarScrollSuave(null);
    gsap.ticker.remove(avanzar);
    lenis.destroy();
  };
}

function cajaMapa(ancho: number, alto: number) {
  if (ancho >= 900) {
    const h = Math.min(alto * 0.8, ancho * 0.45);
    const w = (h * COLUMNAS) / FILAS;
    return { x: ancho * 0.95 - w, y: (alto - h) / 2 + alto * 0.03, w, h };
  }
  const w = Math.min(ancho * 0.78, alto * 0.36);
  const h = (w * FILAS) / COLUMNAS;
  return { x: (ancho - w) / 2, y: alto - h - alto * 0.04, w, h };
}

/** El mapa es la ventana del video y crece hasta volverse la pantalla completa. */
function animarBanner(): () => void {
  const ventana = document.querySelector<HTMLElement>(".banner-ventana");
  if (!ventana) return () => undefined;
  const estado = { t: 0 };

  const pintar = () => {
    const { innerWidth: ancho, innerHeight: alto } = window;
    if (estado.t >= 0.995) {
      ventana.style.clipPath = "none";
      return;
    }
    const caja = cajaMapa(ancho, alto);
    const crecimientoFinal = Math.max(ancho, alto) / (caja.w / COLUMNAS) / 3;
    const k = crecimientoFinal ** estado.t;
    const focoX0 = caja.x + FOCO.x * caja.w;
    const focoY0 = caja.y + FOCO.y * caja.h;
    const focoX = focoX0 + (ancho / 2 - focoX0) * estado.t;
    const focoY = focoY0 + (alto / 2 - focoY0) * estado.t;
    const puntos = CONTORNO_SILUETA.map(([x, y]) => {
      const px = focoX + (x / COLUMNAS - FOCO.x) * caja.w * k;
      const py = focoY + (y / FILAS - FOCO.y) * caja.h * k;
      return `${px.toFixed(1)}px ${py.toFixed(1)}px`;
    });
    ventana.style.clipPath = `polygon(${puntos.join(",")})`;
  };

  pintar();
  const disparo = {
    trigger: ".banner",
    start: "top top",
    end: "bottom bottom",
    scrub: 0.5,
  };
  gsap.to(estado, {
    t: 1,
    ease: "power2.in",
    onUpdate: pintar,
    scrollTrigger: disparo,
  });
  gsap
    .timeline({ defaults: { ease: "none" }, scrollTrigger: disparo })
    .to(".banner-copia", { y: -160, opacity: 0, duration: 0.3 }, 0.02)
    .to(".banner-pixel", { opacity: 0, duration: 0.2 }, 0.1)
    .fromTo(
      ".banner-velo",
      { opacity: 0 },
      { opacity: 0.55, duration: 0.3 },
      0.6,
    )
    .fromTo(
      ".banner-final p",
      { y: 90, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.25 },
      0.7,
    );
  window.addEventListener("resize", pintar);
  return () => window.removeEventListener("resize", pintar);
}

/** Titulares por líneas: cada línea sube detrás de su propia máscara. */
function animarTitulares(): void {
  for (const titular of gsap.utils.toArray<HTMLElement>("[data-titular]")) {
    SplitText.create(titular, {
      type: "lines,words",
      mask: "lines",
      autoSplit: true,
      onSplit: (partes) =>
        gsap.fromTo(
          partes.lines,
          { yPercent: 110 },
          {
            yPercent: 0,
            duration: 1.1,
            ease: "expo.out",
            stagger: 0.09,
            scrollTrigger: { trigger: titular, start: "top 88%", once: true },
          },
        ),
    });
  }
}

const REVELADOS = {
  sube: { desde: { y: 70, opacity: 0 }, hasta: { y: 0, opacity: 1 } },
  clip: {
    desde: { clipPath: "inset(100% 0 0 0)" },
    hasta: { clipPath: "inset(0% 0 0 0)" },
  },
} as const;

function animarRevelados(): void {
  for (const nodo of gsap.utils.toArray<HTMLElement>("[data-rev]")) {
    const paso = nodo.dataset.rev === "clip" ? REVELADOS.clip : REVELADOS.sube;
    gsap.fromTo(nodo, paso.desde, {
      ...paso.hasta,
      duration: 1.1,
      ease: "expo.out",
      scrollTrigger: { trigger: nodo, start: "top 86%", once: true },
    });
  }
}

/** Parallax por capas; el disparador es la sección, porque la capa se mueve. */
function animarCapas(): void {
  for (const capa of gsap.utils.toArray<HTMLElement>("[data-capa]")) {
    const fuerza = Number(capa.dataset.capa) * 120;
    gsap.fromTo(
      capa,
      { y: fuerza },
      {
        y: -fuerza,
        ease: "none",
        scrollTrigger: {
          trigger: capa.closest("section") ?? capa,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.7,
        },
      },
    );
  }
}

/** Las cifras cuentan una sola vez, al entrar. */
function animarContadores(): void {
  for (const nodo of gsap.utils.toArray<HTMLElement>("[data-contar]")) {
    const final = Number(nodo.dataset.contar);
    const contador = { valor: 0 };
    gsap.to(contador, {
      valor: final,
      duration: 1.4,
      ease: "power2.out",
      onUpdate: () => {
        nodo.textContent = String(Math.round(contador.valor));
      },
      scrollTrigger: { trigger: nodo, start: "top 88%", once: true },
    });
  }
}

function animarPie(): void {
  gsap.fromTo(
    ".pie-video",
    { scale: 1.18 },
    {
      scale: 1,
      ease: "none",
      scrollTrigger: {
        trigger: ".contenido",
        start: "bottom bottom",
        end: "bottom top",
        scrub: 0.6,
      },
    },
  );
  gsap.fromTo(
    ".pie-marcas > *",
    { y: 40, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 0.9,
      stagger: 0.1,
      ease: "expo.out",
      scrollTrigger: { trigger: ".contenido", start: "bottom 60%", once: true },
    },
  );
}

const CAPAS_ENTRADA = 16;

/**
 * Cada sección entra imprimiéndose sobre la anterior: su color sube en capas
 * escalonadas. Se crea aquí y no en el marcado porque depende del color vecino.
 */
function animarEntradas(): () => void {
  const bandas: HTMLElement[] = [];
  const secciones = gsap.utils.toArray<HTMLElement>(".contenido > section");
  secciones.forEach((seccion, indice) => {
    const previa = secciones[indice - 1];
    if (!previa) return;
    const color = getComputedStyle(previa).backgroundColor;
    if (color === getComputedStyle(seccion).backgroundColor) return;
    const banda = document.createElement("div");
    banda.className = "entrada-capas";
    banda.setAttribute("aria-hidden", "true");
    banda.style.setProperty("--capa-color", color);
    for (let capa = 0; capa < CAPAS_ENTRADA; capa++) {
      banda.append(document.createElement("span"));
    }
    seccion.append(banda);
    bandas.push(banda);
    gsap.to(banda.children, {
      scaleY: 0,
      ease: "none",
      stagger: { each: 0.05, from: indice % 2 ? "start" : "end" },
      scrollTrigger: {
        trigger: seccion,
        start: "top bottom",
        end: "top 40%",
        scrub: 0.4,
      },
    });
  });
  return () => {
    for (const banda of bandas) banda.remove();
  };
}

/** Los enlaces internos no recorren media página: un telón de capas cubre y descubre. */
function crearTelon(): () => void {
  const telon = document.querySelector<HTMLElement>(".telon");
  if (!telon) return () => undefined;
  const capas = telon.children;
  let enCurso = false;

  const alPulsar = (evento: MouseEvent) => {
    const enlace = (evento.target as Element).closest?.<HTMLAnchorElement>(
      'a[href^="#"]',
    );
    const destino = enlace
      ? document.getElementById(enlace.hash.slice(1))
      : null;
    if (!destino) return;
    evento.preventDefault();
    if (enCurso) return;
    enCurso = true;
    const y = destino.getBoundingClientRect().top + window.scrollY;
    gsap
      .timeline({
        onComplete: () => {
          enCurso = false;
        },
      })
      .set(telon, { autoAlpha: 1 })
      .fromTo(
        capas,
        { scaleX: 0, transformOrigin: "left center" },
        { scaleX: 1, duration: 0.32, ease: "power3.inOut", stagger: 0.035 },
      )
      .add(() => {
        saltarA(y);
        ScrollTrigger.update();
      })
      .set(capas, { transformOrigin: "right center" }, "+=0.06")
      .to(capas, {
        scaleX: 0,
        duration: 0.36,
        ease: "power3.inOut",
        stagger: 0.035,
      })
      .set(telon, { autoAlpha: 0 });
  };

  window.addEventListener("click", alPulsar, { capture: true });
  return () => window.removeEventListener("click", alPulsar, { capture: true });
}

export function Movimiento() {
  useEffect(() => {
    let limpiar: (() => void) | undefined;

    const montar = () => {
      limpiar?.();
      limpiar = undefined;
      const conEscenas = !prefiereMenosMovimiento();
      document.documentElement.dataset.escenas = conEscenas ? "si" : "no";
      if (!conEscenas) return;
      const quitarScroll = crearScrollSuave();
      const quitarTelon = crearTelon();
      let quitarBanner = () => {};
      let quitarEntradas = () => {};
      const contexto = gsap.context(() => {
        quitarBanner = animarBanner();
        quitarEntradas = animarEntradas();
        animarTitulares();
        animarRevelados();
        animarCapas();
        animarContadores();
        animarPie();
      });
      limpiar = () => {
        quitarBanner();
        quitarTelon();
        contexto.revert();
        quitarEntradas();
        quitarScroll();
      };
    };

    montar();
    document.fonts.ready.then(() => ScrollTrigger.refresh());
    window.addEventListener("cauca-movimiento", montar);
    return () => {
      window.removeEventListener("cauca-movimiento", montar);
      limpiar?.();
    };
  }, []);

  return (
    <div className="telon" aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
      <span />
      <span />
    </div>
  );
}
