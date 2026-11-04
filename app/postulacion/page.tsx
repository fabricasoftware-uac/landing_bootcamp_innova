import type { Metadata } from "next";
import { FormularioPostulacion } from "@/components/formulario/formulario-postulacion";

export const metadata: Metadata = {
  title: "Inscripción de Semilleros · Bootcamp Cauca INNOVA 2026",
  description:
    "Formulario oficial de postulación para el Bootcamp de Semilleros de Investigación Cauca INNOVA. 15 de noviembre de 2026. Registra tu equipo de 3 estudiantes y docente tutor.",
  keywords: [
    "Cauca INNOVA",
    "Bootcamp de Semilleros",
    "Investigación Cauca",
    "Inscripciones Semilleros",
    "Gobernación del Cauca",
    "Uniautónoma del Cauca",
    "Prototipado",
  ],
  openGraph: {
    title: "Inscripción de Semilleros · Bootcamp Cauca INNOVA 2026",
    description:
      "Diligencia la postulación oficial de tu semillero de colegio o universidad del Cauca. Jornada intensiva de prototipado e innovación.",
  },
};

export default function PostulacionPage() {
  return (
    <div className="min-h-screen bg-[#f5f4ec] text-[#10384f]">
      {/* Cabecera de navegación */}
      <header className="sticky top-0 z-40 h-16 border-b border-[#10384f]/15 bg-[#f5f4ec]/95 backdrop-blur-md">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <a
            href="/"
            className="flex items-center gap-3 transition hover:opacity-85"
            aria-label="Ir al inicio del Bootcamp Cauca INNOVA"
          >
            <div className="flex h-8 sm:h-9 items-center gap-2.5 sm:gap-3">
              <img
                src="/images/redesign/cauca-innova-logo.png"
                alt="Cauca INNOVA"
                className="h-8 w-auto object-contain sm:h-8"
                style={{ maxHeight: "32px", width: "auto" }}
              />
              <span className="h-5 w-px bg-[#10384f]/25" aria-hidden="true" />
              <img
                src="/images/gobernacion-cauca.png"
                alt="Gobernación del Cauca - Secretaría de Desarrollo Económico y Competitividad"
                className="h-7 w-auto object-contain sm:h-8"
                style={{ maxHeight: "28px", width: "auto" }}
              />
            </div>
          </a>

          <div className="flex items-center gap-3 sm:gap-4">
            <span className="hidden text-xs font-bold uppercase tracking-wider text-[#006b5c] sm:inline-block">
              15 Noviembre 2026
            </span>
            <a
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#10384f]/20 bg-white px-3.5 py-1.5 text-xs font-semibold text-[#10384f] shadow-2xs transition hover:border-[#10384f]/40 hover:bg-[#10384f]/5"
            >
              <span>← Volver al sitio</span>
            </a>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 md:py-10">
        {/* Encabezado del formulario */}
        <div className="mb-6 sm:mb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#006b5c]/30 bg-[#006b5c]/10 px-3 py-2 mb-4 text-xs font-bold uppercase tracking-wider text-[#006b5c]">
            <span className="h-2 w-2 rounded-full bg-[#006b5c] animate-pulse" />
            Convocatoria Oficial Abierta
          </div>

          <h1 className="mt-3 font-sans text-2xl font-extrabold tracking-tight text-[#10384f] sm:text-3xl">
            Postulación de Semillero
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#10384f]/75 sm:text-base">
            Bootcamp de Semilleros de Investigación Cauca INNOVA. Jornada
            presencial intensiva de formación, mentoría y prototipado para seis
            equipos de tres estudiantes.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#10384f]/15 bg-white px-3 py-1 text-xs font-medium text-[#10384f]/80 shadow-2xs">
              <span aria-hidden="true">📅</span> 15 de noviembre de 2026
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#10384f]/15 bg-white px-3 py-1 text-xs font-medium text-[#10384f]/80 shadow-2xs">
              <span aria-hidden="true">📍</span> Departamento del Cauca
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#10384f]/15 bg-white px-3 py-1 text-xs font-medium text-[#10384f]/80 shadow-2xs">
              <span aria-hidden="true">👥</span> 1 tutor + 3 estudiantes
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#10384f]/15 bg-white px-3 py-1 text-xs font-medium text-[#10384f]/80 shadow-2xs">
              <span aria-hidden="true">📄</span> Aval institucional requerido
            </span>
          </div>
        </div>

        {/* Wizard Multi-Paso */}
        <div className="rounded-2xl border border-[#10384f]/15 bg-white p-6 shadow-sm sm:p-8 md:p-10">
          <FormularioPostulacion />
        </div>
      </main>

      {/* Pie de página institucional */}
      <footer className="mt-16 border-t border-[#10384f]/15 bg-[#10384f] py-8 text-xs text-[#f5f4ec]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-center sm:flex-row sm:px-6 sm:text-left">
          <div>
            <p className="font-bold">
              Bootcamp de Semilleros de Investigación Cauca INNOVA
            </p>
            <p className="mt-1 text-[#f5f4ec]/70">
              Secretaría de Desarrollo Económico · Gobernación del Cauca en
              alianza con Uniautónoma
            </p>
          </div>

          <div className="flex items-center gap-4 text-[#d1ef3d]">
            <a href="/" className="hover:underline">
              Inicio
            </a>
            <span aria-hidden="true">·</span>
            <a href="/#agenda" className="hover:underline">
              Agenda
            </a>
            <span aria-hidden="true">·</span>
            <a href="/#preparacion" className="hover:underline">
              Términos de Referencia
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
