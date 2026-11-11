import type { Metadata } from "next";
import { ConvocatoriaCerrada } from "@/components/formulario/convocatoria-cerrada";
import { FormularioPostulacion } from "@/components/formulario/formulario-postulacion";
import { CabeceraSitio } from "@/components/sitio/cabecera-sitio";
import { PieSitio } from "@/components/sitio/pie-sitio";
import { ESTADO_CONVOCATORIA } from "@/lib/config/convocatoria";
import "./postulacion.css";

export const metadata: Metadata = {
  title: ESTADO_CONVOCATORIA.abierta
    ? "Postula a tu equipo · Bootcamp Cauca INNOVA 2026"
    : `${ESTADO_CONVOCATORIA.tituloCierre} · Bootcamp Cauca INNOVA 2026`,
  description: ESTADO_CONVOCATORIA.abierta
    ? "Formulario oficial de postulación al Bootcamp de Semilleros de Investigación Cauca INNOVA, 14 de noviembre de 2026. Registra a tu equipo de tres estudiantes y a su tutor."
    : ESTADO_CONVOCATORIA.mensajeCierre,
  openGraph: {
    title: ESTADO_CONVOCATORIA.abierta
      ? "Postula a tu equipo · Bootcamp Cauca INNOVA 2026"
      : `${ESTADO_CONVOCATORIA.tituloCierre} · Bootcamp Cauca INNOVA 2026`,
    description: ESTADO_CONVOCATORIA.abierta
      ? "Formulario oficial para semilleros de colegios y universidades del Cauca."
      : ESTADO_CONVOCATORIA.mensajeCierre,
  },
};

export default function PostulacionPage() {
  return (
    <div className="postulacion-pagina">
      <CabeceraSitio sinPostular />
      <main className="postulacion" data-tema="oscuro">
        <div className="marco">
          <a className="postulacion-volver" href="/">
            <span aria-hidden="true">←</span> Volver al sitio
          </a>
          {ESTADO_CONVOCATORIA.abierta ? (
            <>
              <header className="postulacion-cabeza">
                <h1>
                  Imprime tu <span>postulación.</span>
                </h1>
                <p>
                  Cinco pasos. Tu avance queda guardado 24 horas en este equipo,
                  sin los documentos. Consulta también los{" "}
                  <a
                    href="/terminos-de-referencia"
                    style={{ textDecoration: "underline" }}
                  >
                    términos de referencia
                  </a>{" "}
                  o{" "}
                  <a
                    href="/documentos/terminos-de-referencia.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: "underline" }}
                  >
                    ver el PDF oficial
                  </a>
                  .
                </p>
              </header>
              <FormularioPostulacion />
            </>
          ) : (
            <ConvocatoriaCerrada />
          )}
        </div>
      </main>
      <PieSitio />
    </div>
  );
}
