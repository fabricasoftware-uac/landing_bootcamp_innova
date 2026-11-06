"use client";

import type { ReactNode } from "react";
import {
  IconoExterno,
  IconoLista,
  IconoSalir,
} from "@/components/admin/iconos";
import { LogoCauca, LogoMascara } from "@/components/sitio/logos";

interface MarcoAdminProps {
  children: ReactNode;
  /** Quién trabaja en esta sesión, al pie de la barra. */
  sesion: string;
  alCerrarSesion?: () => void;
}

function Marcas() {
  return (
    <a href="/" className="adm-marcas" title="Ir a la portada pública">
      <LogoCauca />
      <span className="adm-marcas-aliados">
        <LogoMascara nombre="gobernacion-compacto" />
        <LogoMascara nombre="uniautonoma" />
      </span>
    </a>
  );
}

function EnlaceSitio() {
  return (
    <a href="/" target="_blank" rel="noreferrer" className="adm-nav-item">
      <IconoExterno />
      <span>Ver sitio</span>
    </a>
  );
}

function BotonCerrar({ alCerrarSesion }: { alCerrarSesion: () => void }) {
  return (
    <button
      type="button"
      onClick={alCerrarSesion}
      className="adm-nav-item"
      aria-label="Cerrar sesión"
    >
      <IconoSalir />
      <span>Cerrar sesión</span>
    </button>
  );
}

export function MarcoAdmin({
  children,
  sesion,
  alCerrarSesion,
}: MarcoAdminProps) {
  return (
    <div className="adm-marco">
      <aside className="adm-lateral">
        <Marcas />
        <nav aria-label="Panel" className="adm-nav">
          <a href="#postulaciones" className="adm-nav-item" aria-current="page">
            <IconoLista />
            <span>Postulaciones</span>
          </a>
          <EnlaceSitio />
        </nav>
        <div className="adm-sesion">
          <p>{sesion}</p>
          {alCerrarSesion && <BotonCerrar alCerrarSesion={alCerrarSesion} />}
        </div>
      </aside>
      <main id="postulaciones" className="adm-principal">
        {children}
      </main>
    </div>
  );
}
