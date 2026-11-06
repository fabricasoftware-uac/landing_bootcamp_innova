"use client";

import { useEffect, useState } from "react";
import { guardarMovimiento, leerMovimientoGuardado } from "@/lib/motion";

export function ControlMovimiento() {
  const [reducido, setReducido] = useState(false);

  useEffect(() => {
    const guardado = leerMovimientoGuardado();
    const sistema = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    setReducido(guardado || sistema);
    if (guardado) guardarMovimiento(true);
  }, []);

  return (
    <button
      type="button"
      aria-pressed={reducido}
      onClick={() => {
        guardarMovimiento(!reducido);
        setReducido(!reducido);
      }}
    >
      {reducido ? "Activar movimiento" : "Reducir movimiento"}
    </button>
  );
}
