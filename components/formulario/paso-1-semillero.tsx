"use client";

import type { PasoProps } from "./tipos";

export function Paso1Semillero({
  datos,
  actualizarDatos,
  errores = {},
  limpiarError,
}: PasoProps) {
  const handleChange = (campo: keyof typeof datos, valor: string) => {
    actualizarDatos({ [campo]: valor });
    if (limpiarError) {
      limpiarError(campo);
    }
  };

  return (
    <div className="space-y-8">
      <div className="mb-6 sm:mb-8">
        <h2 className="font-sans text-xl font-bold tracking-tight text-[#10384f] sm:text-2xl">
          Datos de la Institución y Semillero
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[#10384f]/75 sm:text-base">
          Ingresa la información oficial de la institución educativa del Cauca,
          el semillero de investigación participante y el docente tutor
          responsable del aval.
        </p>
      </div>

      <div className="rounded-2xl border border-[#10384f]/15 bg-[#faf9f5] p-6 shadow-2xs sm:p-7 md:p-8">
        <h3 className="mb-5 border-b border-[#10384f]/10 pb-3 text-sm font-bold uppercase tracking-wider text-[#006b5c] sm:text-base">
          1.1 Institución Educativa
        </h3>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Nombre de la institución */}
          <div className="md:col-span-2">
            <label
              htmlFor="institucion_nombre"
              className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#10384f]"
            >
              Nombre de la Institución Educativa{" "}
              <span className="text-rose-600">*</span>
            </label>
            <input
              id="institucion_nombre"
              type="text"
              name="institucion_nombre"
              required
              value={datos.institucion_nombre}
              onChange={(e) =>
                handleChange("institucion_nombre", e.target.value)
              }
              placeholder="Ej: Institución Educativa Técnica San José / Universidad del Cauca"
              className={`w-full rounded-xl border px-4 py-3 text-sm text-[#10384f] placeholder:text-[#10384f]/40 transition focus:outline-hidden focus:ring-2 ${
                errores.institucion_nombre
                  ? "border-rose-500 bg-rose-50/50 focus:ring-rose-500"
                  : "border-[#10384f]/20 bg-white focus:border-[#006b5c] focus:ring-[#006b5c]"
              }`}
              aria-invalid={Boolean(errores.institucion_nombre)}
              aria-describedby={
                errores.institucion_nombre
                  ? "error-institucion_nombre"
                  : undefined
              }
            />
            {errores.institucion_nombre && (
              <p
                id="error-institucion_nombre"
                className="mt-1.5 text-xs font-semibold text-rose-600"
                role="alert"
              >
                {errores.institucion_nombre}
              </p>
            )}
          </div>

          {/* Tipo de institución */}
          <div className="md:col-span-2">
            <fieldset>
              <legend className="mb-2.5 block text-xs font-bold uppercase tracking-wider text-[#10384f]">
                Nivel / Tipo de Institución{" "}
                <span className="text-rose-600">*</span>
              </legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <label
                  className={`flex cursor-pointer items-start gap-3.5 rounded-xl border p-4.5 transition-all sm:p-5 ${
                    datos.institucion_tipo === "basica_media"
                      ? "border-[#006b5c] bg-[#006b5c]/10 text-[#10384f] shadow-xs"
                      : "border-[#10384f]/20 bg-white hover:border-[#10384f]/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="institucion_tipo"
                    value="basica_media"
                    checked={datos.institucion_tipo === "basica_media"}
                    onChange={() =>
                      handleChange("institucion_tipo", "basica_media")
                    }
                    className="mt-1 h-4 w-4 text-[#006b5c] focus:ring-[#006b5c]"
                  />
                  <div>
                    <span className="block text-sm font-bold text-[#10384f]">
                      Educación Básica y Media
                    </span>
                    <span className="mt-1 block text-xs leading-relaxed text-[#10384f]/70">
                      Colegios públicos y privados del departamento del Cauca
                    </span>
                  </div>
                </label>

                <label
                  className={`flex cursor-pointer items-start gap-3.5 rounded-xl border p-4.5 transition-all sm:p-5 ${
                    datos.institucion_tipo === "superior"
                      ? "border-[#006b5c] bg-[#006b5c]/10 text-[#10384f] shadow-xs"
                      : "border-[#10384f]/20 bg-white hover:border-[#10384f]/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="institucion_tipo"
                    value="superior"
                    checked={datos.institucion_tipo === "superior"}
                    onChange={() =>
                      handleChange("institucion_tipo", "superior")
                    }
                    className="mt-1 h-4 w-4 text-[#006b5c] focus:ring-[#006b5c]"
                  />
                  <div>
                    <span className="block text-sm font-bold text-[#10384f]">
                      Educación Superior
                    </span>
                    <span className="mt-1 block text-xs leading-relaxed text-[#10384f]/70">
                      Universidades, instituciones técnicas o tecnológicas
                    </span>
                  </div>
                </label>
              </div>
              {errores.institucion_tipo && (
                <p
                  className="mt-1.5 text-xs font-semibold text-rose-600"
                  role="alert"
                >
                  {errores.institucion_tipo}
                </p>
              )}
            </fieldset>
          </div>

          {/* Nombre del semillero */}
          <div className="md:col-span-2">
            <label
              htmlFor="semillero_nombre"
              className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#10384f]"
            >
              Nombre del Semillero de Investigación{" "}
              <span className="text-rose-600">*</span>
            </label>
            <input
              id="semillero_nombre"
              type="text"
              name="semillero_nombre"
              required
              value={datos.semillero_nombre}
              onChange={(e) => handleChange("semillero_nombre", e.target.value)}
              placeholder="Ej: Semillero de Robótica y Sostenibilidad Territorial - BIOBOT"
              className={`w-full rounded-xl border px-4 py-3 text-sm text-[#10384f] placeholder:text-[#10384f]/40 transition focus:outline-hidden focus:ring-2 ${
                errores.semillero_nombre
                  ? "border-rose-500 bg-rose-50/50 focus:ring-rose-500"
                  : "border-[#10384f]/20 bg-white focus:border-[#006b5c] focus:ring-[#006b5c]"
              }`}
              aria-invalid={Boolean(errores.semillero_nombre)}
              aria-describedby={
                errores.semillero_nombre ? "error-semillero_nombre" : undefined
              }
            />
            {errores.semillero_nombre && (
              <p
                id="error-semillero_nombre"
                className="mt-1.5 text-xs font-semibold text-rose-600"
                role="alert"
              >
                {errores.semillero_nombre}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#10384f]/15 bg-[#faf9f5] p-6 shadow-2xs sm:p-7 md:p-8">
        <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-[#006b5c] sm:text-base">
          1.2 Docente Tutor / Asesor del Semillero
        </h3>
        <p className="mb-6 text-xs leading-relaxed text-[#10384f]/70 sm:text-sm">
          El docente tutor es el responsable académico que emite la
          certificación y aval del equipo de tres estudiantes.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Nombre del tutor */}
          <div className="md:col-span-2">
            <label
              htmlFor="tutor_nombre"
              className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#10384f]"
            >
              Nombre y Apellidos del Tutor{" "}
              <span className="text-rose-600">*</span>
            </label>
            <input
              id="tutor_nombre"
              type="text"
              name="tutor_nombre"
              required
              value={datos.tutor_nombre}
              onChange={(e) => handleChange("tutor_nombre", e.target.value)}
              placeholder="Ej: Profa. Claudia Marcela Gómez Paz"
              className={`w-full rounded-xl border px-4 py-3 text-sm text-[#10384f] placeholder:text-[#10384f]/40 transition focus:outline-hidden focus:ring-2 ${
                errores.tutor_nombre
                  ? "border-rose-500 bg-rose-50/50 focus:ring-rose-500"
                  : "border-[#10384f]/20 bg-white focus:border-[#006b5c] focus:ring-[#006b5c]"
              }`}
              aria-invalid={Boolean(errores.tutor_nombre)}
              aria-describedby={
                errores.tutor_nombre ? "error-tutor_nombre" : undefined
              }
            />
            {errores.tutor_nombre && (
              <p
                id="error-tutor_nombre"
                className="mt-1.5 text-xs font-semibold text-rose-600"
                role="alert"
              >
                {errores.tutor_nombre}
              </p>
            )}
          </div>

          {/* Email del tutor */}
          <div>
            <label
              htmlFor="tutor_email"
              className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#10384f]"
            >
              Correo Institucional / de Contacto{" "}
              <span className="text-rose-600">*</span>
            </label>
            <input
              id="tutor_email"
              type="email"
              name="tutor_email"
              required
              value={datos.tutor_email}
              onChange={(e) => handleChange("tutor_email", e.target.value)}
              placeholder="docente@institucion.edu.co"
              className={`w-full rounded-xl border px-4 py-3 text-sm text-[#10384f] placeholder:text-[#10384f]/40 transition focus:outline-hidden focus:ring-2 ${
                errores.tutor_email
                  ? "border-rose-500 bg-rose-50/50 focus:ring-rose-500"
                  : "border-[#10384f]/20 bg-white focus:border-[#006b5c] focus:ring-[#006b5c]"
              }`}
              aria-invalid={Boolean(errores.tutor_email)}
              aria-describedby={
                errores.tutor_email ? "error-tutor_email" : undefined
              }
            />
            {errores.tutor_email && (
              <p
                id="error-tutor_email"
                className="mt-1.5 text-xs font-semibold text-rose-600"
                role="alert"
              >
                {errores.tutor_email}
              </p>
            )}
          </div>

          {/* Teléfono del tutor */}
          <div>
            <label
              htmlFor="tutor_telefono"
              className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#10384f]"
            >
              Teléfono Celular de Contacto{" "}
              <span className="text-rose-600">*</span>
            </label>
            <input
              id="tutor_telefono"
              type="tel"
              name="tutor_telefono"
              required
              value={datos.tutor_telefono}
              onChange={(e) => handleChange("tutor_telefono", e.target.value)}
              placeholder="310 123 4567"
              className={`w-full rounded-xl border px-4 py-3 text-sm text-[#10384f] placeholder:text-[#10384f]/40 transition focus:outline-hidden focus:ring-2 ${
                errores.tutor_telefono
                  ? "border-rose-500 bg-rose-50/50 focus:ring-rose-500"
                  : "border-[#10384f]/20 bg-white focus:border-[#006b5c] focus:ring-[#006b5c]"
              }`}
              aria-invalid={Boolean(errores.tutor_telefono)}
              aria-describedby={
                errores.tutor_telefono ? "error-tutor_telefono" : undefined
              }
            />
            {errores.tutor_telefono && (
              <p
                id="error-tutor_telefono"
                className="mt-1.5 text-xs font-semibold text-rose-600"
                role="alert"
              >
                {errores.tutor_telefono}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
