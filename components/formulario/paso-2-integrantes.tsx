"use client";

import {
  TIPOS_DOCUMENTO_IDENTIDAD,
  type TipoDocumentoIdentidad,
} from "@/lib/validations/postulacion";
import type { PasoProps } from "./tipos";

export function Paso2Integrantes({
  datos,
  actualizarDatos,
  errores = {},
  limpiarError,
}: PasoProps) {
  const actualizarIntegrante = (
    indice: 0 | 1 | 2,
    campo: string,
    valor: string | boolean,
  ) => {
    const nuevosIntegrantes = [...datos.integrantes] as [
      (typeof datos.integrantes)[0],
      (typeof datos.integrantes)[1],
      (typeof datos.integrantes)[2],
    ];

    nuevosIntegrantes[indice] = {
      ...nuevosIntegrantes[indice],
      [campo]: valor,
    };

    actualizarDatos({ integrantes: nuevosIntegrantes });

    if (limpiarError) {
      limpiarError(`integrantes.${indice}.${campo}`);
      limpiarError(`integrantes[${indice}].${campo}`);
      limpiarError("integrantes");
    }
  };

  const getError = (indice: number, campo: string) => {
    return (
      errores[`integrantes.${indice}.${campo}`] ||
      errores[`integrantes[${indice}].${campo}`]
    );
  };

  const hayMenoresDeEdad = datos.integrantes.some((i) => i.es_menor_edad);

  const titulosIntegrantes = [
    {
      label: "Estudiante 1 · Líder de Equipo",
      desc: "Principal contacto del semillero",
    },
    { label: "Estudiante 2", desc: "Segundo integrante del equipo" },
    { label: "Estudiante 3", desc: "Tercer integrante del equipo" },
  ] as const;

  return (
    <div className="space-y-8">
      <div className="mb-6 sm:mb-8">
        <h2 className="font-sans text-xl font-bold tracking-tight text-[#10384f] sm:text-2xl">
          Equipo de Tres Estudiantes
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[#10384f]/75 sm:text-base">
          De acuerdo con los Términos de Referencia, el equipo debe estar
          integrado por <strong>exactamente 3 estudiantes</strong> vinculados al
          semillero y matriculados en una institución del Cauca.
        </p>
      </div>

      {errores.integrantes && (
        <div
          className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm font-semibold text-rose-800"
          role="alert"
        >
          {errores.integrantes}
        </div>
      )}

      {hayMenoresDeEdad && (
        <div className="flex items-start gap-3.5 rounded-2xl border border-[#006b5c]/30 bg-[#006b5c]/10 p-5 text-sm text-[#10384f] leading-relaxed">
          <p>
            Has indicado que uno o más integrantes son menores de 18 años. En el{" "}
            <strong>Paso 4 (Documentos)</strong> se habilitará con carácter
            obligatorio la subida del formato de autorización firmado por padres
            o representantes legales.
          </p>
        </div>
      )}

      <div className="space-y-6">
        {([0, 1, 2] as const).map((indice) => {
          const integrante = datos.integrantes[indice];
          const info = titulosIntegrantes[indice] ?? {
            label: `Estudiante 0${indice + 1}`,
            desc: "",
          };

          return (
            <div
              key={indice}
              className="rounded-2xl border border-[#10384f]/15 bg-[#faf9f5] p-6 shadow-2xs sm:p-7 md:p-8"
            >
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[#10384f]/10 pb-4">
                <div className="flex items-center gap-3.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#10384f] text-xs font-black text-[#d1ef3d]">
                    0{indice + 1}
                  </span>
                  <div>
                    <h3 className="text-base font-extrabold text-[#10384f]">
                      {info.label}
                    </h3>
                    <p className="mt-0.5 text-xs text-[#10384f]/60">
                      {info.desc}
                    </p>
                  </div>
                </div>

                {/* Switch menor de edad */}
                <label className="inline-flex cursor-pointer items-center gap-2.5 rounded-full border border-[#10384f]/20 bg-white px-3.5 py-1.5 text-xs font-semibold text-[#10384f] shadow-2xs transition-colors hover:border-[#10384f]/40 hover:bg-[#f5f4ec]">
                  <input
                    type="checkbox"
                    checked={integrante.es_menor_edad}
                    onChange={(e) =>
                      actualizarIntegrante(
                        indice,
                        "es_menor_edad",
                        e.target.checked,
                      )
                    }
                    className="h-4 w-4 rounded-sm border-[#10384f]/30 text-[#006b5c] focus:ring-[#006b5c]"
                  />
                  <span>¿Es menor de 18 años?</span>
                </label>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Nombres y Apellidos */}
                <div className="md:col-span-2">
                  <label
                    htmlFor={`integrante_${indice}_nombres`}
                    className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#10384f]"
                  >
                    Nombres y Apellidos Completos{" "}
                    <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id={`integrante_${indice}_nombres`}
                    type="text"
                    required
                    value={integrante.nombres_apellidos}
                    onChange={(e) =>
                      actualizarIntegrante(
                        indice,
                        "nombres_apellidos",
                        e.target.value,
                      )
                    }
                    placeholder="Ej: Sofia Valentina Muñoz Burbano"
                    className={`w-full rounded-xl border px-4 py-3 text-sm text-[#10384f] placeholder:text-[#10384f]/40 transition focus:outline-hidden focus:ring-2 ${
                      getError(indice, "nombres_apellidos")
                        ? "border-rose-500 bg-rose-50/50 focus:ring-rose-500"
                        : "border-[#10384f]/20 bg-white focus:border-[#006b5c] focus:ring-[#006b5c]"
                    }`}
                    aria-invalid={Boolean(
                      getError(indice, "nombres_apellidos"),
                    )}
                  />
                  {getError(indice, "nombres_apellidos") && (
                    <p
                      className="mt-1.5 text-xs font-semibold text-rose-600"
                      role="alert"
                    >
                      {getError(indice, "nombres_apellidos")}
                    </p>
                  )}
                </div>

                {/* Tipo de Documento */}
                <div>
                  <label
                    htmlFor={`integrante_${indice}_tipo_doc`}
                    className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#10384f]"
                  >
                    Tipo de Documento <span className="text-rose-600">*</span>
                  </label>
                  <select
                    id={`integrante_${indice}_tipo_doc`}
                    value={integrante.tipo_documento}
                    onChange={(e) =>
                      actualizarIntegrante(
                        indice,
                        "tipo_documento",
                        e.target.value as TipoDocumentoIdentidad,
                      )
                    }
                    className="w-full rounded-xl border border-[#10384f]/20 bg-white px-4 py-3 text-sm text-[#10384f] focus:border-[#006b5c] focus:outline-hidden focus:ring-2 focus:ring-[#006b5c] transition"
                  >
                    {TIPOS_DOCUMENTO_IDENTIDAD.map((tipo) => (
                      <option key={tipo} value={tipo}>
                        {tipo === "TI"
                          ? "Tarjeta de Identidad (TI)"
                          : tipo === "CC"
                            ? "Cédula de Ciudadanía (CC)"
                            : tipo === "CE"
                              ? "Cédula de Extranjería (CE)"
                              : "Pasaporte"}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Número de Documento */}
                <div>
                  <label
                    htmlFor={`integrante_${indice}_numero_doc`}
                    className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#10384f]"
                  >
                    Número de Documento <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id={`integrante_${indice}_numero_doc`}
                    type="text"
                    required
                    value={integrante.numero_documento}
                    onChange={(e) =>
                      actualizarIntegrante(
                        indice,
                        "numero_documento",
                        e.target.value,
                      )
                    }
                    placeholder="Ej: 1061789456"
                    className={`w-full rounded-xl border px-4 py-3 text-sm text-[#10384f] placeholder:text-[#10384f]/40 transition focus:outline-hidden focus:ring-2 ${
                      getError(indice, "numero_documento")
                        ? "border-rose-500 bg-rose-50/50 focus:ring-rose-500"
                        : "border-[#10384f]/20 bg-white focus:border-[#006b5c] focus:ring-[#006b5c]"
                    }`}
                    aria-invalid={Boolean(getError(indice, "numero_documento"))}
                  />
                  {getError(indice, "numero_documento") && (
                    <p
                      className="mt-1.5 text-xs font-semibold text-rose-600"
                      role="alert"
                    >
                      {getError(indice, "numero_documento")}
                    </p>
                  )}
                </div>

                {/* Correo Electrónico */}
                <div>
                  <label
                    htmlFor={`integrante_${indice}_correo`}
                    className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#10384f]"
                  >
                    Correo Electrónico <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id={`integrante_${indice}_correo`}
                    type="email"
                    required
                    value={integrante.correo_electronico}
                    onChange={(e) =>
                      actualizarIntegrante(
                        indice,
                        "correo_electronico",
                        e.target.value,
                      )
                    }
                    placeholder="estudiante@correo.com"
                    className={`w-full rounded-xl border px-4 py-3 text-sm text-[#10384f] placeholder:text-[#10384f]/40 transition focus:outline-hidden focus:ring-2 ${
                      getError(indice, "correo_electronico")
                        ? "border-rose-500 bg-rose-50/50 focus:ring-rose-500"
                        : "border-[#10384f]/20 bg-white focus:border-[#006b5c] focus:ring-[#006b5c]"
                    }`}
                    aria-invalid={Boolean(
                      getError(indice, "correo_electronico"),
                    )}
                  />
                  {getError(indice, "correo_electronico") && (
                    <p
                      className="mt-1.5 text-xs font-semibold text-rose-600"
                      role="alert"
                    >
                      {getError(indice, "correo_electronico")}
                    </p>
                  )}
                </div>

                {/* Teléfono */}
                <div>
                  <label
                    htmlFor={`integrante_${indice}_telefono`}
                    className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#10384f]"
                  >
                    Teléfono Celular <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id={`integrante_${indice}_telefono`}
                    type="tel"
                    required
                    value={integrante.telefono}
                    onChange={(e) =>
                      actualizarIntegrante(indice, "telefono", e.target.value)
                    }
                    placeholder="312 456 7890"
                    className={`w-full rounded-xl border px-4 py-3 text-sm text-[#10384f] placeholder:text-[#10384f]/40 transition focus:outline-hidden focus:ring-2 ${
                      getError(indice, "telefono")
                        ? "border-rose-500 bg-rose-50/50 focus:ring-rose-500"
                        : "border-[#10384f]/20 bg-white focus:border-[#006b5c] focus:ring-[#006b5c]"
                    }`}
                    aria-invalid={Boolean(getError(indice, "telefono"))}
                  />
                  {getError(indice, "telefono") && (
                    <p
                      className="mt-1.5 text-xs font-semibold text-rose-600"
                      role="alert"
                    >
                      {getError(indice, "telefono")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
