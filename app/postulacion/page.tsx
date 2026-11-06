import type { Metadata } from "next";
import { FormularioPostulacion } from "@/components/formulario/formulario-postulacion";
import { CabeceraSitio } from "@/components/sitio/cabecera-sitio";
import { PieSitio } from "@/components/sitio/pie-sitio";
import "./postulacion.css";

export const metadata: Metadata = {
  title: "Postula a tu equipo · Bootcamp Cauca INNOVA 2026",
  description:
    "Formulario oficial de postulación al Bootcamp de Semilleros de Investigación Cauca INNOVA, 14 de noviembre de 2026. Registra a tu equipo de tres estudiantes y a su tutor.",
  openGraph: {
    title: "Postula a tu equipo · Bootcamp Cauca INNOVA 2026",
    description:
      "Formulario oficial para semilleros de colegios y universidades del Cauca.",
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
          <header className="postulacion-cabeza">
            <h1>
              Imprime tu <span>postulación.</span>
            </h1>
            <p>
              Cinco pasos. Tu avance queda guardado 24 horas en este equipo, sin
              los documentos.
            </p>
          </header>
          <FormularioPostulacion />
        </div>
      </main>
      <PieSitio />
    </div>
  );
}
