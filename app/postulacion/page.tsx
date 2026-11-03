import type { Metadata } from "next";
import { FormularioPostulacion } from "@/components/formulario/formulario-postulacion";

export const metadata: Metadata = {
  title: "Inscripción de Semilleros · Festival Cauca INNOVA 2026",
  description:
    "Formulario oficial de postulación para el Festival de Semilleros de Investigación Cauca INNOVA. 15 de noviembre de 2026. Registra tu equipo de 3 estudiantes y docente tutor.",
  keywords: [
    "Cauca INNOVA",
    "Festival de Semilleros",
    "Investigación Cauca",
    "Inscripciones Semilleros",
    "Gobernación del Cauca",
    "Uniautónoma del Cauca",
    "Prototipado",
  ],
  openGraph: {
    title: "Inscripción de Semilleros · Festival Cauca INNOVA 2026",
    description:
      "Diligencia la postulación oficial de tu semillero de colegio o universidad del Cauca. Jornada intensiva de prototipado e innovación.",
  },
};

export default function PostulacionPage() {
  return (
    <div className="min-h-screen bg-[#f5f4ec] text-[#10384f]">
      {/* Cabecera de navegación */}
      <header className="sticky top-0 z-40 border-b border-[#10384f]/15 bg-[#f5f4ec]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 md:py-4">
          <a
            href="/"
            className="flex items-center gap-3 transition hover:opacity-85"
            aria-label="Ir al inicio del Festival Cauca INNOVA"
          >
            <img
              src="/images/redesign/cauca-innova-logo.png"
              width="160"
              height="80"
              alt="Cauca INNOVA"
              className="h-9 w-auto object-contain sm:h-11"
            />
          </a>

          <div className="flex items-center gap-4">
            <span className="hidden text-xs font-bold uppercase tracking-wider text-[#006b5c] sm:inline-block">
              15 Noviembre 2026
            </span>
            <a
              href="/"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#10384f]/20 bg-white px-3.5 py-2 text-xs font-bold text-[#10384f] shadow-2xs transition hover:bg-[#10384f]/5"
            >
              <span>← Volver al sitio</span>
            </a>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 md:py-12">
        {/* Encabezado del formulario */}
        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#006b5c]/30 bg-[#006b5c]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#006b5c]">
            <span className="h-2 w-2 rounded-full bg-[#006b5c] animate-pulse" />
            Convocatoria Oficial Abierta
          </div>

          <h1 className="mt-3 text-3xl font-black tracking-tight text-[#10384f] sm:text-4xl md:text-5xl">
            Postulación de Semillero
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#10384f]/80 sm:text-base">
            Festival de Semilleros de Investigación Cauca INNOVA. Jornada
            presencial intensiva de formación, mentoría y prototipado para siete
            equipos de tres estudiantes.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-semibold text-[#10384f]/70">
            <span>📅 15 de noviembre de 2026</span>
            <span>📍 Departamento del Cauca</span>
            <span>👥 1 tutor + 3 estudiantes</span>
            <span>📄 Aval institucional requerido</span>
          </div>
        </div>

        {/* Wizard Multi-Paso */}
        <div className="rounded-2xl border border-[#10384f]/15 bg-white/60 p-5 shadow-sm backdrop-blur-xs sm:p-8 md:p-10">
          <FormularioPostulacion />
        </div>
      </main>

      {/* Pie de página institucional */}
      <footer className="mt-16 border-t border-[#10384f]/15 bg-[#10384f] py-8 text-xs text-[#f5f4ec]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-center sm:flex-row sm:px-6 sm:text-left">
          <div>
            <p className="font-bold">
              Festival de Semilleros de Investigación Cauca INNOVA
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
