"use client";

import { useEffect } from "react";

export default function ErrorPage({
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f5f4ec] px-4 text-[#10384f]">
      <div className="w-full max-w-md rounded-2xl border border-[#10384f]/15 bg-white p-6 text-center shadow-xl sm:p-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#10384f] text-2xl text-[#d1ef3d] shadow-sm">
          ⚠️
        </div>

        <span className="mt-4 inline-block text-[11px] font-bold uppercase tracking-widest text-rose-700">
          Error en la aplicación
        </span>

        <h1 className="mt-1 text-2xl font-black tracking-tight text-[#10384f]">
          Algo no salió como esperábamos
        </h1>

        <p className="mt-3 text-xs text-[#10384f]/80 leading-relaxed">
          {error.message ||
            "Ocurrió un error al cargar los datos. Verifica la conexión a Internet o las variables de entorno del servidor."}
        </p>

        {error.digest && (
          <p className="mt-2 text-[10px] font-mono text-[#10384f]/50">
            Código de referencia: {error.digest}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-lg bg-[#10384f] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#d1ef3d] shadow-sm transition hover:bg-[#006b5c] hover:text-[#f5f4ec]"
          >
            Reintentar ↻
          </button>
          <a
            href="/"
            className="rounded-lg border border-[#10384f]/25 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#10384f] transition hover:bg-[#10384f]/5"
          >
            Ir al inicio ↗
          </a>
        </div>
      </div>
    </div>
  );
}
