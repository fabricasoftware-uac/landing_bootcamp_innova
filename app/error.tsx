"use client";

import { useEffect } from "react";
import { SiluetaCauca } from "@/components/sitio/pieza-cauca";

export default function PaginaError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Error capturado en ErrorBoundary:", error);
  }, [error]);

  return (
    <main className="grid min-h-svh place-items-center bg-azul p-5 text-papel">
      <div className="w-full max-w-xl">
        <SiluetaCauca clase="w-16 text-lima" />
        <h1 className="mt-6 text-titulo">La impresión se detuvo</h1>
        <p className="mt-4 text-entrada">
          Algo falló al cargar esta página. Tus datos no se enviaron dos veces:
          puedes intentarlo de nuevo con tranquilidad.
        </p>
        {error.digest && (
          <p className="mt-4 text-pequeno">Código de error: {error.digest}</p>
        )}
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            className="boton boton-lima"
            onClick={() => reset()}
          >
            Intentar de nuevo
          </button>
          <a className="boton boton-suave" href="/">
            Ir al inicio
          </a>
        </div>
      </div>
    </main>
  );
}
