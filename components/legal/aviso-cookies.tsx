"use client";

import { useEffect, useState } from "react";

const CLAVE_AVISO = "cauca-aviso-cookies";

function yaCerrado(): boolean {
  try {
    return localStorage.getItem(CLAVE_AVISO) === "cerrado";
  } catch {
    // Sin almacenamiento el aviso reaparece en cada visita: es preferible a no informar.
    return false;
  }
}

function recordarCierre(): void {
  try {
    localStorage.setItem(CLAVE_AVISO, "cerrado");
  } catch {
    // Se cierra en esta visita aunque no se pueda recordar.
  }
}

/*
 * Vive en el layout raíz y por eso usa utilidades de Tailwind: legal.css solo se
 * carga en las páginas legales. Es informativo, no pide consentimiento, porque el
 * sitio no usa analítica ni publicidad; si eso cambia, este aviso debe cambiar.
 */
export function AvisoCookies() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!yaCerrado());
  }, []);

  if (!visible) return null;

  const cerrar = () => {
    recordarCierre();
    setVisible(false);
  };

  return (
    <section
      aria-label="Aviso sobre cookies"
      className="fixed bottom-3 left-3 z-[62] max-w-sm max-[1099px]:bottom-20 rounded-2xl border border-linea bg-papel p-4 text-pequeno text-tinta shadow-lg max-sm:right-3"
    >
      <p>
        Este sitio guarda solo lo necesario para funcionar y recordar tus
        preferencias. No usa analítica ni publicidad.{" "}
        <a className="font-bold underline" href="/cookies">
          Ver detalle
        </a>
      </p>
      <button
        type="button"
        className="boton boton-suave mt-3 min-h-11"
        onClick={cerrar}
      >
        Entendido
      </button>
    </section>
  );
}
