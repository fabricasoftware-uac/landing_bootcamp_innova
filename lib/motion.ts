"use client";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

const CLAVE_MOVIMIENTO = "cauca-movimiento";

export function prefiereMenosMovimiento(): boolean {
  if (typeof window === "undefined") return false;
  return (
    document.documentElement.dataset.movimiento === "reducido" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function leerMovimientoGuardado(): boolean {
  try {
    return localStorage.getItem(CLAVE_MOVIMIENTO) === "reducido";
  } catch {
    // Sin almacenamiento (ventana privada) se usa la preferencia del sistema.
    return false;
  }
}

export function guardarMovimiento(reducido: boolean): void {
  document.documentElement.dataset.movimiento = reducido
    ? "reducido"
    : "completo";
  try {
    localStorage.setItem(CLAVE_MOVIMIENTO, reducido ? "reducido" : "completo");
  } catch {
    // La elección sigue vigente en esta visita aunque no se pueda recordar.
  }
  window.dispatchEvent(new Event("cauca-movimiento"));
}

interface ScrollSuave {
  scrollTo: (
    destino: number,
    opciones: { duration?: number; immediate?: boolean; force?: boolean },
  ) => void;
}

let scrollSuave: ScrollSuave | null = null;

export function registrarScrollSuave(instancia: ScrollSuave | null): void {
  scrollSuave = instancia;
}

/** Sube a un destino: la duración crece con la distancia para que no se sienta como un salto. */
export function irA(destino: number): void {
  const distancia = Math.abs(window.scrollY - destino);
  if (prefiereMenosMovimiento()) {
    window.scrollTo(0, destino);
    return;
  }
  if (scrollSuave) {
    scrollSuave.scrollTo(destino, {
      duration: Math.min(3.2, Math.max(1.1, 0.9 + distancia / 3500)),
    });
    return;
  }
  window.scrollTo({ top: destino, behavior: "smooth" });
}

/** Salta sin recorrer: lo usa el telón, que ya tapó la pantalla. */
export function saltarA(destino: number): void {
  if (scrollSuave) {
    scrollSuave.scrollTo(destino, { immediate: true, force: true });
    return;
  }
  window.scrollTo(0, destino);
}

export { gsap, ScrollTrigger, SplitText, useGSAP };
