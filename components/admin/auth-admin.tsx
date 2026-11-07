"use client";

import { type FormEvent, useState } from "react";
import { LogoCauca, LogoMascara } from "@/components/sitio/logos";
import { VideoPerezoso } from "@/components/sitio/video-perezoso";
import { POLIGONO_SILUETA } from "@/lib/pieza-cauca";
import { createClient } from "@/lib/supabase/client";

interface AuthAdminProps {
  alAutenticar: () => void;
  /** Aviso amable previo (p. ej. falta de configuración), sin detalle técnico. */
  avisoInicial?: string | null;
}

/** Logos institucionales; enlazan a la portada pública. */
export function MarcasAdmin() {
  return (
    <a href="/" title="Ir a la portada pública" className="marcas-admin">
      <LogoCauca />
      <LogoMascara nombre="gobernacion" />
      <LogoMascara nombre="uniautonoma" />
    </a>
  );
}

function IconoOjo({ tachado }: { tachado: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
      {tachado && <path d="M4 4l16 16" />}
    </svg>
  );
}

const MENSAJE_CREDENCIALES = "Correo o contraseña incorrectos.";
const MENSAJE_SIN_SERVICIO =
  "No pudimos iniciar sesión en este momento. Inténtalo de nuevo en unos minutos.";

export function AuthAdmin({ alAutenticar, avisoInicial }: AuthAdminProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const aviso = error ?? avisoInicial ?? null;

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
        // El detalle real va al log del navegador; la pantalla solo ve un mensaje amable.
        console.error("Error de autenticación admin:", authError);
        setError(
          authError.message === "Invalid login credentials"
            ? MENSAJE_CREDENCIALES
            : MENSAJE_SIN_SERVICIO,
        );
        return;
      }

      if (data?.session) {
        alAutenticar();
      }
    } catch (err) {
      console.error("Error al iniciar sesión admin:", err);
      setError(MENSAJE_SIN_SERVICIO);
    } finally {
      setCargando(false);
    }
  };

  return (
    <section aria-labelledby="titulo-ingreso" className="ingreso">
      <div className="ingreso-escena" aria-hidden="true">
        <div className="ingreso-mapa" style={{ clipPath: POLIGONO_SILUETA }}>
          <VideoPerezoso nombre="imprimen" clase="ingreso-video" />
        </div>
        <p>
          Aquí las ideas
          <span>se vuelven prototipos.</span>
        </p>
      </div>

      <div className="ingreso-hoja">
        <a href="/" className="ingreso-volver">
          <span aria-hidden="true">←</span> Volver al sitio
        </a>

        <div className="ingreso-centro">
          <MarcasAdmin />
          <h1 id="titulo-ingreso">Hola de nuevo</h1>
          <p className="ingreso-bajada">Panel de postulaciones</p>

          {aviso && (
            <p className="aviso aviso-alerta mt-5" role="alert">
              {aviso}
            </p>
          )}

          <form onSubmit={handleSubmit} className="ingreso-formulario">
            <div className="ingreso-campo">
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=" "
                aria-invalid={aviso ? true : undefined}
              />
              <label htmlFor="email">Correo institucional</label>
            </div>

            <div className="ingreso-campo">
              <input
                id="password"
                type={verPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=" "
                aria-invalid={aviso ? true : undefined}
              />
              <label htmlFor="password">Contraseña</label>
              <button
                type="button"
                className="ingreso-ojo"
                onClick={() => setVerPassword((v) => !v)}
                aria-pressed={verPassword}
                aria-controls="password"
                aria-label={
                  verPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
              >
                <IconoOjo tachado={verPassword} />
              </button>
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="boton w-full"
              aria-busy={cargando}
            >
              {cargando ? "Verificando…" : "Ingresar"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
