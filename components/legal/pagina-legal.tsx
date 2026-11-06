import type { ReactNode } from "react";
import "@/app/legal.css";
import { AccesoPostular } from "@/components/sitio/acceso-postular";
import { CabeceraSitio } from "@/components/sitio/cabecera-sitio";
import { PieSitio } from "@/components/sitio/pie-sitio";
import { IndiceLegal } from "./indice-legal";
import { ProgresoLectura } from "./progreso-lectura";

export interface EntradaIndice {
  id: string;
  etiqueta: string;
}

interface PaginaLegalProps {
  titulo: string;
  entrada: string;
  /** Solo en textos propios: el documento oficial no trae fecha. */
  actualizacion?: string;
  indice: readonly EntradaIndice[];
  acciones?: ReactNode;
  conProgreso?: boolean;
  children: ReactNode;
}

export function PaginaLegal({
  titulo,
  entrada,
  actualizacion,
  indice,
  acciones,
  conProgreso = false,
  children,
}: PaginaLegalProps) {
  return (
    <>
      <a className="legal-saltar" href="#contenido-legal">
        Saltar al contenido
      </a>
      {conProgreso && <ProgresoLectura />}
      <CabeceraSitio />
      <main className="legal" data-tema="claro">
        <div className="marco">
          <header className="legal-cabeza">
            <h1>{titulo}</h1>
            <p className="legal-entrada">{entrada}</p>
            {actualizacion && (
              <p className="legal-fecha">
                Última actualización: {actualizacion}
              </p>
            )}
            {acciones && <div className="legal-acciones">{acciones}</div>}
          </header>
          <div className="legal-cuerpo">
            <IndiceLegal entradas={indice} />
            <article id="contenido-legal" className="legal-texto" tabIndex={-1}>
              {children}
            </article>
          </div>
        </div>
      </main>
      <AccesoPostular />
      <PieSitio />
    </>
  );
}
