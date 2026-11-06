"use client";

import { useEffect, useRef } from "react";
import { prefiereMenosMovimiento } from "@/lib/motion";

/** El peso del video solo se paga cuando se acerca, y en móvil baja la versión liviana. */
export function rutaVideo(nombre: string): string {
  const movil = window.matchMedia("(max-width: 899px)").matches;
  return `/video/${nombre}${movil ? "-movil" : ""}.mp4`;
}

interface VideoPerezosoProps {
  nombre: string;
  clase?: string;
  activo?: boolean;
  etiqueta?: string;
  /** Elemento que decide la visibilidad, cuando el video va fijo y siempre cruza la pantalla. */
  centinela?: string;
}

export function VideoPerezoso({
  nombre,
  clase = "",
  activo = true,
  etiqueta,
  centinela,
}: VideoPerezosoProps) {
  const video = useRef<HTMLVideoElement>(null);
  const enPantalla = useRef(false);
  const estaActivo = useRef(activo);
  estaActivo.current = activo;

  const sincronizar = () => {
    const nodo = video.current;
    if (!nodo) return;
    if (!enPantalla.current || !estaActivo.current) {
      nodo.pause();
      return;
    }
    if (prefiereMenosMovimiento()) return;
    if (!nodo.getAttribute("src")) nodo.src = rutaVideo(nombre);
    // Si el navegador niega la reproducción, el póster sigue a la vista.
    nodo.play().catch(() => undefined);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: sincronizar solo lee referencias
  useEffect(() => {
    const nodo = video.current;
    if (!nodo) return;
    const observador = new IntersectionObserver(
      ([entrada]) => {
        enPantalla.current = Boolean(entrada?.isIntersecting);
        // El póster también pesa: se asigna aquí para que no baje con la carga inicial.
        if (enPantalla.current && !nodo.poster) {
          nodo.poster = `/video/${nombre}.webp`;
        }
        sincronizar();
      },
      { rootMargin: "60% 0px" },
    );
    const objetivo = centinela ? document.querySelector(centinela) : nodo;
    observador.observe(objetivo ?? nodo);
    return () => observador.disconnect();
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: el efecto reacciona a `activo`
  useEffect(() => {
    sincronizar();
  }, [activo]);

  return (
    <video
      ref={video}
      className={clase}
      muted
      loop
      playsInline
      preload="none"
      aria-label={etiqueta}
      aria-hidden={etiqueta ? undefined : true}
      tabIndex={-1}
    />
  );
}
