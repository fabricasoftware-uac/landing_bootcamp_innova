"use client";

import { documentoTerminos } from "@/lib/contenido";
import type { PasoProps } from "./tipos";

interface Paso5RevisionProps extends PasoProps {
  irAPaso: (paso: number) => void;
}

const SLOTS_INTEGRANTES = [
  "estudiante-lider-1",
  "estudiante-segundo-2",
  "estudiante-tercero-3",
] as const;

export function Paso5RevisionTerminos({
  datos,
  actualizarDatos,
  errores = {},
  limpiarError,
  irAPaso,
}: Paso5RevisionProps) {
  const handleCheckboxChange = (
    campo: "acepta_terminos" | "acepta_tratamiento_datos" | "declara_veracidad",
    valor: boolean,
  ) => {
    actualizarDatos({ [campo]: valor });
    if (limpiarError) {
      limpiarError(campo);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-[#10384f] md:text-3xl">
          Revisión Consolidada y Términos Legales
        </h2>
        <p className="mt-2 text-sm text-[#10384f]/80 md:text-base">
          Verifica con atención la información antes de generar el radicado
          oficial. Puedes regresar a cualquier paso para corregir si es
          necesario.
        </p>
      </div>

      {/* Resumen Consolidado */}
      <div className="space-y-6">
        {/* Bloque 1: Institución y Semillero */}
        <div className="rounded-xl border border-[#10384f]/15 bg-white/70 p-5 shadow-xs backdrop-blur-xs md:p-6">
          <div className="flex items-center justify-between border-b border-[#10384f]/10 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#006b5c]">
              1. Institución y Semillero
            </h3>
            <button
              type="button"
              onClick={() => irAPaso(1)}
              className="text-xs font-bold text-[#006b5c] underline hover:text-[#10384f]"
            >
              Modificar ✎
            </button>
          </div>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2 text-xs">
            <div>
              <dt className="text-[#10384f]/60">Institución Educativa:</dt>
              <dd className="font-bold text-[#10384f]">
                {datos.institucion_nombre || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-[#10384f]/60">Nivel de formación:</dt>
              <dd className="font-bold text-[#10384f]">
                {datos.institucion_tipo === "basica_media"
                  ? "Básica y Media (Colegio)"
                  : "Educación Superior"}
              </dd>
            </div>
            <div>
              <dt className="text-[#10384f]/60">Semillero de Investigación:</dt>
              <dd className="font-bold text-[#10384f]">
                {datos.semillero_nombre || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-[#10384f]/60">Docente Tutor / Asesor:</dt>
              <dd className="font-bold text-[#10384f]">
                {datos.tutor_nombre || "—"} ({datos.tutor_email})
              </dd>
            </div>
          </dl>
        </div>

        {/* Bloque 2: Integrantes */}
        <div className="rounded-xl border border-[#10384f]/15 bg-white/70 p-5 shadow-xs backdrop-blur-xs md:p-6">
          <div className="flex items-center justify-between border-b border-[#10384f]/10 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#006b5c]">
              2. Integrantes del Equipo (3 Estudiantes)
            </h3>
            <button
              type="button"
              onClick={() => irAPaso(2)}
              className="text-xs font-bold text-[#006b5c] underline hover:text-[#10384f]"
            >
              Modificar ✎
            </button>
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {SLOTS_INTEGRANTES.map((slotId, posicion) => {
              const int = datos.integrantes[posicion];
              if (!int) return null;
              return (
                <div
                  key={slotId}
                  className="rounded-lg border border-[#10384f]/10 bg-white p-3 text-xs"
                >
                  <div className="flex items-center justify-between font-bold text-[#10384f]">
                    <span>Estudiante 0{posicion + 1}</span>
                    {int.es_menor_edad ? (
                      <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                        Menor de edad
                      </span>
                    ) : (
                      <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800">
                        Mayor de edad
                      </span>
                    )}
                  </div>
                  <p className="mt-1 font-semibold text-[#006b5c]">
                    {int.nombres_apellidos || "—"}
                  </p>
                  <p className="text-[11px] text-[#10384f]/70">
                    {int.tipo_documento}: {int.numero_documento || "—"}
                  </p>
                  <p className="truncate text-[11px] text-[#10384f]/70">
                    {int.correo_electronico}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bloque 3: Motivación */}
        <div className="rounded-xl border border-[#10384f]/15 bg-white/70 p-5 shadow-xs backdrop-blur-xs md:p-6">
          <div className="flex items-center justify-between border-b border-[#10384f]/10 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#006b5c]">
              3. Motivación e Intereses (Criterio TDR 30%)
            </h3>
            <button
              type="button"
              onClick={() => irAPaso(3)}
              className="text-xs font-bold text-[#006b5c] underline hover:text-[#10384f]"
            >
              Modificar ✎
            </button>
          </div>
          <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-[#10384f]/90 italic">
            &ldquo;{datos.motivacion_intereses}&rdquo;
          </p>
          <p className="mt-2 text-[11px] font-medium text-[#10384f]/60">
            Total caracteres: {datos.motivacion_intereses.trim().length}
          </p>
        </div>

        {/* Bloque 4: Documentos */}
        <div className="rounded-xl border border-[#10384f]/15 bg-white/70 p-5 shadow-xs backdrop-blur-xs md:p-6">
          <div className="flex items-center justify-between border-b border-[#10384f]/10 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#006b5c]">
              4. Documentos Adjuntos
            </h3>
            <button
              type="button"
              onClick={() => irAPaso(4)}
              className="text-xs font-bold text-[#006b5c] underline hover:text-[#10384f]"
            >
              Modificar ✎
            </button>
          </div>
          <ul className="mt-3 divide-y divide-[#10384f]/10 text-xs">
            <li className="flex items-center justify-between py-1.5">
              <span className="text-[#10384f]/80">Aval del Semillero:</span>
              <span className="font-semibold text-[#006b5c]">
                {datos.aval_semillero?.name || "Pendiente"}
              </span>
            </li>
            <li className="flex items-center justify-between py-1.5">
              <span className="text-[#10384f]/80">Doc. Integrante 1:</span>
              <span className="font-semibold text-[#006b5c]">
                {datos.doc_identidad_1?.name || "Pendiente"}
              </span>
            </li>
            <li className="flex items-center justify-between py-1.5">
              <span className="text-[#10384f]/80">Doc. Integrante 2:</span>
              <span className="font-semibold text-[#006b5c]">
                {datos.doc_identidad_2?.name || "Pendiente"}
              </span>
            </li>
            <li className="flex items-center justify-between py-1.5">
              <span className="text-[#10384f]/80">Doc. Integrante 3:</span>
              <span className="font-semibold text-[#006b5c]">
                {datos.doc_identidad_3?.name || "Pendiente"}
              </span>
            </li>
            <li className="flex items-center justify-between py-1.5">
              <span className="text-[#10384f]/80">
                Autorización de Menores:
              </span>
              <span className="font-semibold text-[#006b5c]">
                {datos.autorizacion_menores?.name ||
                  (datos.integrantes.some((i) => i.es_menor_edad)
                    ? "Pendiente"
                    : "No requerida")}
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Términos y Declaraciones Legales */}
      <div className="rounded-xl border-2 border-[#10384f]/30 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-[#10384f]">
          Declaraciones y Consentimiento Legal Obligatorio
        </h3>

        <div className="space-y-4">
          {/* Checkbox 1: Términos y condiciones */}
          <div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={datos.acepta_terminos}
                onChange={(e) =>
                  handleCheckboxChange("acepta_terminos", e.target.checked)
                }
                className="mt-1 h-5 w-5 rounded-sm border-[#10384f]/40 text-[#006b5c] focus:ring-[#006b5c]"
              />
              <span className="text-xs leading-relaxed text-[#10384f] md:text-sm">
                Acepto los{" "}
                <a
                  href={documentoTerminos}
                  download
                  className="font-bold text-[#006b5c] underline hover:text-[#10384f]"
                >
                  Términos de Referencia oficiales del Festival Cauca INNOVA
                  2026
                </a>
                , certificando que el semillero y sus 3 integrantes se
                comprometen a la asistencia presencial completa a la jornada (15
                de noviembre de 2026).
              </span>
            </label>
            {errores.acepta_terminos && (
              <p
                className="mt-1 pl-8 text-xs font-semibold text-rose-600"
                role="alert"
              >
                {errores.acepta_terminos}
              </p>
            )}
          </div>

          {/* Checkbox 2: Habeas data */}
          <div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={datos.acepta_tratamiento_datos}
                onChange={(e) =>
                  handleCheckboxChange(
                    "acepta_tratamiento_datos",
                    e.target.checked,
                  )
                }
                className="mt-1 h-5 w-5 rounded-sm border-[#10384f]/40 text-[#006b5c] focus:ring-[#006b5c]"
              />
              <span className="text-xs leading-relaxed text-[#10384f] md:text-sm">
                Autorizo expresamente el tratamiento de datos personales de los
                estudiantes y el docente tutor conforme a la{" "}
                <strong>Ley Estatutaria 1581 de 2012 (Habeas Data)</strong> para
                los fines organizativos, académicos, de evaluación y
                certificación del evento por parte de la Gobernación del Cauca y
                Uniautónoma.
              </span>
            </label>
            {errores.acepta_tratamiento_datos && (
              <p
                className="mt-1 pl-8 text-xs font-semibold text-rose-600"
                role="alert"
              >
                {errores.acepta_tratamiento_datos}
              </p>
            )}
          </div>

          {/* Checkbox 3: Veracidad */}
          <div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={datos.declara_veracidad}
                onChange={(e) =>
                  handleCheckboxChange("declara_veracidad", e.target.checked)
                }
                className="mt-1 h-5 w-5 rounded-sm border-[#10384f]/40 text-[#006b5c] focus:ring-[#006b5c]"
              />
              <span className="text-xs leading-relaxed text-[#10384f] md:text-sm">
                Certifico bajo la gravedad de juramento que la información
                suministrada y los documentos adjuntos son legítimos, verídicos
                y corresponden a estudiantes con matrícula activa en el
                departamento del Cauca.
              </span>
            </label>
            {errores.declara_veracidad && (
              <p
                className="mt-1 pl-8 text-xs font-semibold text-rose-600"
                role="alert"
              >
                {errores.declara_veracidad}
              </p>
            )}
          </div>
        </div>

        <div className="mt-5 rounded-lg bg-[#10384f]/5 p-3.5 text-xs text-[#10384f]/80">
          <strong>Aviso importante:</strong> Al hacer clic en &quot;Finalizar y
          Radicar Inscripción&quot;, el sistema generará de forma automática tu
          número de Radicado Oficial único. No se admitirán modificaciones
          posteriores a los datos enviados.
        </div>
      </div>
    </div>
  );
}
