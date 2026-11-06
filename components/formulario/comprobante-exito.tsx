"use client";

import type { ExitoPostulacionProps } from "./tipos";

const SLOTS_INTEGRANTES = [
  "estudiante-lider-1",
  "estudiante-segundo-2",
  "estudiante-tercero-3",
] as const;

export function ComprobanteExito({
  resultado,
  datos,
  alReiniciar,
}: ExitoPostulacionProps) {
  const fechaActual = new Date().toLocaleDateString("es-CO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleImprimir = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Encabezado del comprobante */}
      <div className="rounded-2xl border-2 border-[#006b5c] bg-white p-6 text-center shadow-lg print:border-none print:p-0 print:shadow-none md:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#006b5c] text-3xl text-[#d1ef3d] print:hidden">
          ✓
        </div>

        <span className="mt-4 inline-block text-xs font-bold uppercase tracking-widest text-[#006b5c]">
          Comprobante Oficial de Radicación
        </span>

        <h1 className="mt-2 text-2xl font-black tracking-tight text-[#10384f] md:text-4xl">
          ¡Inscripción Radicada con Éxito!
        </h1>

        <p className="mx-auto mt-3 max-w-xl text-xs text-[#10384f]/80 md:text-sm">
          El semillero ha completado exitosamente su registro oficial para el{" "}
          <strong>
            Bootcamp de Semilleros de Investigación Cauca INNOVA 2026
          </strong>
          .
        </p>

        {/* Tarjeta de Radicado Oficial */}
        <div className="mx-auto my-6 max-w-md rounded-xl border border-[#006b5c]/30 bg-[#006b5c]/10 p-5 print:border-2 print:border-black">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#10384f]/70">
            Número de Radicado Oficial
          </span>
          <div className="mt-1 font-mono text-2xl font-black tracking-wider text-[#006b5c] md:text-3xl print:text-black">
            {resultado.radicado_codigo}
          </div>
          <span className="mt-1 block text-[11px] text-[#10384f]/60">
            Generado el {fechaActual}
          </span>
        </div>

        {/* Resumen imprimible */}
        <div className="mx-auto mt-6 max-w-2xl text-left border-t border-[#10384f]/15 pt-6 text-xs text-[#10384f]">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#006b5c]">
            Resumen Oficial de la Postulación
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-[#10384f]/10 bg-[#10384f]/5 p-4">
              <span className="block font-semibold text-[#10384f]/60">
                Institución Educativa:
              </span>
              <span className="font-bold text-sm text-[#10384f]">
                {resultado.institucion_nombre}
              </span>
              <span className="block text-[11px] text-[#10384f]/70 mt-0.5">
                Nivel:{" "}
                {datos.institucion_tipo === "basica_media"
                  ? "Básica y Media"
                  : "Educación Superior"}
              </span>
            </div>

            <div className="rounded-xl border border-[#10384f]/10 bg-[#10384f]/5 p-4">
              <span className="block font-semibold text-[#10384f]/60">
                Semillero de Investigación:
              </span>
              <span className="font-bold text-sm text-[#10384f]">
                {resultado.semillero_nombre}
              </span>
              <span className="block text-[11px] text-[#10384f]/70 mt-0.5">
                Tutor: {datos.tutor_nombre} ({datos.tutor_email})
              </span>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-[#10384f]/10 bg-[#10384f]/5 p-4">
            <span className="block font-semibold text-[#10384f]/60 mb-2">
              Equipo de 3 Estudiantes Participantes:
            </span>
            <ol className="space-y-1.5 pl-4 list-decimal font-medium">
              {SLOTS_INTEGRANTES.map((slotId, posicion) => {
                const int = datos.integrantes[posicion];
                if (!int) return null;
                return (
                  <li key={slotId}>
                    <strong className="text-[#10384f]">
                      {int.nombres_apellidos}
                    </strong>{" "}
                    — {int.tipo_documento}: {int.numero_documento} (
                    {int.es_menor_edad ? "Menor de edad" : "Mayor de edad"})
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="mt-4 rounded-xl border border-[#10384f]/10 bg-[#10384f]/5 p-4">
            <span className="block font-semibold text-[#10384f]/60 mb-1.5">
              Documentos de Soporte Verificados:
            </span>
            <ul className="grid gap-1 sm:grid-cols-2 text-[11px] text-[#006b5c] font-medium">
              <li>✓ Aval institucional del semillero</li>
              <li>✓ Documento de identidad Estudiante 1</li>
              <li>✓ Documento de identidad Estudiante 2</li>
              <li>✓ Documento de identidad Estudiante 3</li>
              {datos.integrantes.some((i) => i.es_menor_edad) && (
                <li className="font-bold">
                  ✓ Autorización de padres/acudientes adjunta
                </li>
              )}
            </ul>
          </div>

          <div className="mt-6 rounded-xl border border-[#006b5c]/20 bg-[#006b5c]/5 p-4 sm:p-5 text-xs leading-relaxed text-[#10384f]/80">
            <p>
              <strong>Siguientes pasos:</strong> El comité técnico verificará el
              cumplimiento estricto de requisitos habilitantes. En caso de
              superar los cupos establecidos en los Términos de Referencia, se
              aplicarán los criterios de selección (Motivación 30 %, Pertinencia
              30 %, Diversidad 20 % y Representación Institucional/Territorial
              20 %). Los resultados y la agenda detallada de la jornada del 14
              de noviembre serán comunicados a los correos registrados.
            </p>
          </div>
        </div>

        {/* Botones de acción (ocultos al imprimir) */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 print:hidden">
          <button
            type="button"
            onClick={handleImprimir}
            className="inline-flex items-center gap-2 rounded-xl bg-[#10384f] px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-[#f5f4ec] shadow-sm transition hover:bg-[#006b5c]"
          >
            <span aria-hidden="true">🖨️</span> Imprimir Comprobante Oficial
          </button>

          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-[#10384f]/25 bg-white px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-[#10384f] shadow-2xs transition hover:bg-[#10384f]/5"
          >
            ← Volver al Portal Principal
          </a>

          <button
            type="button"
            onClick={alReiniciar}
            className="text-xs font-semibold text-[#10384f]/70 underline hover:text-[#10384f]"
          >
            Registrar otra postulación
          </button>
        </div>
      </div>
    </div>
  );
}
