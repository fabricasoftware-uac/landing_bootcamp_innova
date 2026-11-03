"use client";

import { type FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface AuthAdminProps {
  alAutenticar: () => void;
}

export function AuthAdmin({ alAutenticar }: AuthAdminProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword(
        {
          email: email.trim(),
          password,
        },
      );

      if (authError) {
        // En caso de credenciales directas de desarrollo o error de Auth
        throw new Error(
          authError.message === "Invalid login credentials"
            ? "Credenciales no válidas. Verifica tu correo institucional y contraseña."
            : authError.message,
        );
      }

      if (data?.session) {
        alAutenticar();
      }
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Error al intentar iniciar sesión.";
      setError(msg);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-[#10384f]/15 bg-white p-6 shadow-xl md:p-8">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#10384f] text-2xl text-[#d1ef3d] shadow-sm">
            🔒
          </div>
          <span className="mt-4 inline-block text-[11px] font-bold uppercase tracking-widest text-[#006b5c]">
            Comité Evaluador Oficial
          </span>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-[#10384f]">
            Panel Administrativo
          </h1>
          <p className="mt-2 text-xs text-[#10384f]/70">
            Ingreso restringido a coordinadores y evaluadores del Bootcamp Cauca
            INNOVA 2026.
          </p>
        </div>

        {error && (
          <div
            className="mt-6 rounded-lg border border-rose-300 bg-rose-50 p-3.5 text-xs font-semibold text-rose-800"
            role="alert"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-bold uppercase tracking-wider text-[#10384f]"
            >
              Correo Electrónico Institucional
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@caucainnova.gov.co"
              className="mt-1.5 w-full rounded-lg border border-[#10384f]/25 bg-white px-3.5 py-2.5 text-sm text-[#10384f] focus:border-[#006b5c] focus:outline-hidden focus:ring-2 focus:ring-[#006b5c]"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-bold uppercase tracking-wider text-[#10384f]"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="mt-1.5 w-full rounded-lg border border-[#10384f]/25 bg-white px-3.5 py-2.5 text-sm text-[#10384f] focus:border-[#006b5c] focus:outline-hidden focus:ring-2 focus:ring-[#006b5c]"
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#10384f] py-3 text-xs font-bold uppercase tracking-wider text-[#d1ef3d] shadow-sm transition hover:bg-[#006b5c] hover:text-[#f5f4ec] disabled:cursor-wait disabled:opacity-70"
          >
            {cargando ? (
              <>
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                  aria-hidden="true"
                />
                <span className="text-amber-50">Verificando credenciales...</span>
              </>
            ) : (
              <span className="text-amber-50">Ingresar al Sistema ↗</span>
            )}
          </button>
        </form>

        <div className="mt-6 border-t border-[#10384f]/10 pt-4 text-center">
          <a
            href="/"
            className="text-xs font-semibold text-[#10384f]/70 underline hover:text-[#10384f]"
          >
            ← Volver al portal público de Cauca INNOVA
          </a>
        </div>
      </div>
    </div>
  );
}
