"use client";

import { type DragEvent, useRef, useState } from "react";
import {
  ALLOWED_FILE_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
} from "@/lib/validations/postulacion";
import type { PasoProps } from "./tipos";

function formatearTamano(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

interface SelectorArchivoProps {
  id: string;
  titulo: string;
  descripcion: string;
  obligatorio?: boolean;
  soloPdf?: boolean;
  archivoActual: File | null;
  alSeleccionarArchivo: (archivo: File | null) => void;
  error?: string;
}

function SelectorArchivo({
  id,
  titulo,
  descripcion,
  obligatorio = true,
  soloPdf = false,
  archivoActual,
  alSeleccionarArchivo,
  error,
}: SelectorArchivoProps) {
  const [arrastrando, setArrastrando] = useState(false);
  const [errorLocal, setErrorLocal] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const formatosAceptados = soloPdf
    ? "application/pdf"
    : ".pdf,image/jpeg,image/png,image/jpg";

  const formatosTexto = soloPdf
    ? "Solo formato PDF (.pdf)"
    : "Formatos admitidos: PDF, JPEG, PNG";

  const validarYAsignar = (archivo: File) => {
    setErrorLocal(null);

    if (archivo.size > MAX_FILE_SIZE_BYTES) {
      setErrorLocal("El archivo excede el tamaño máximo permitido de 10 MB.");
      return;
    }

    if (soloPdf && archivo.type !== "application/pdf") {
      setErrorLocal(
        "Este documento debe ser exclusivamente en formato PDF (.pdf).",
      );
      return;
    }

    if (
      !ALLOWED_FILE_MIME_TYPES.includes(
        archivo.type as (typeof ALLOWED_FILE_MIME_TYPES)[number],
      )
    ) {
      setErrorLocal(
        "Formato no válido. Debe adjuntar un archivo PDF, JPEG o PNG.",
      );
      return;
    }

    alSeleccionarArchivo(archivo);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setArrastrando(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setArrastrando(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setArrastrando(false);
    const files = e.dataTransfer.files;
    if (files?.[0]) {
      validarYAsignar(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.[0]) {
      validarYAsignar(files[0]);
    }
  };

  const errorVisible = error || errorLocal;

  return (
    <div className="rounded-xl border border-[#10384f]/15 bg-white/70 p-5 shadow-xs backdrop-blur-xs md:p-6">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <label
          htmlFor={id}
          className="block text-xs font-bold uppercase tracking-wider text-[#10384f]"
        >
          {titulo}{" "}
          {obligatorio ? (
            <span className="text-rose-600">*</span>
          ) : (
            <span className="text-xs font-normal lowercase text-[#10384f]/60">
              (opcional)
            </span>
          )}
        </label>
        <span className="text-[11px] font-medium text-[#10384f]/60">
          Máx. 10 MB
        </span>
      </div>

      <p className="mb-4 text-xs text-[#10384f]/70">{descripcion}</p>

      {archivoActual ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#006b5c]/30 bg-[#006b5c]/5 p-3.5">
          <div className="flex items-center gap-3">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#006b5c] text-sm font-bold text-[#f5f4ec]"
              aria-hidden="true"
            >
              {archivoActual.name.endsWith(".pdf") ? "PDF" : "IMG"}
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-[#10384f]">
                {archivoActual.name}
              </p>
              <p className="text-[11px] text-[#10384f]/60">
                {formatearTamano(archivoActual.size)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              alSeleccionarArchivo(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="rounded-md border border-rose-200 bg-white px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50"
          >
            Quitar / Cambiar
          </button>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
            arrastrando
              ? "border-[#006b5c] bg-[#006b5c]/10"
              : errorVisible
                ? "border-rose-400 bg-rose-50/30"
                : "border-[#10384f]/20 bg-white/50 hover:border-[#006b5c]/50 hover:bg-white"
          }`}
        >
          <input
            ref={inputRef}
            id={id}
            name={id}
            type="file"
            accept={formatosAceptados}
            onChange={handleFileChange}
            className="sr-only"
            aria-describedby={errorVisible ? `error-${id}` : undefined}
          />

          <span className="mb-2 text-2xl text-[#006b5c]" aria-hidden="true">
            📄
          </span>

          <p className="text-xs font-bold text-[#10384f]">
            Arrastra el archivo aquí o{" "}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-[#006b5c] underline underline-offset-2 hover:text-[#10384f]"
            >
              selecciónalo desde tu equipo
            </button>
          </p>

          <p className="mt-1 text-[11px] text-[#10384f]/60">{formatosTexto}</p>
        </div>
      )}

      {errorVisible && (
        <p
          id={`error-${id}`}
          className="mt-2 text-xs font-semibold text-rose-600"
          role="alert"
        >
          {errorVisible}
        </p>
      )}
    </div>
  );
}

export function Paso4Documentos({
  datos,
  actualizarDatos,
  errores = {},
  limpiarError,
}: PasoProps) {
  const hayMenoresDeEdad = datos.integrantes.some((i) => i.es_menor_edad);

  const actualizarArchivo = (
    campo:
      | "aval_semillero"
      | "doc_identidad_1"
      | "doc_identidad_2"
      | "doc_identidad_3"
      | "autorizacion_menores",
    archivo: File | null,
  ) => {
    actualizarDatos({ [campo]: archivo });
    if (limpiarError) {
      limpiarError(campo);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-[#10384f] md:text-3xl">
          Documentos de Soporte Requeridos
        </h2>
        <p className="mt-2 text-sm text-[#10384f]/80 md:text-base">
          Adjunta los soportes digitales en formato PDF o imagen legible. El
          tamaño máximo por cada archivo es de 10 MB.
        </p>
      </div>

      {/* Alerta de menores de edad */}
      {hayMenoresDeEdad ? (
        <div className="rounded-xl border-2 border-amber-500/80 bg-amber-50/90 p-5 text-[#10384f] shadow-xs">
          <div className="flex items-start gap-3">
            <span className="text-2xl" aria-hidden="true">
              ⚠️
            </span>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-amber-900">
                Atención: Autorización de Menores Obligatoria
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-amber-900/90 md:text-sm">
                Has registrado uno o más integrantes menores de 18 años. De
                acuerdo con la legislación colombiana y los Términos de
                Referencia, es <strong>estrictamente obligatorio</strong>{" "}
                adjuntar el formato de autorización de padres o acudientes
                firmado.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-[#10384f]/15 bg-[#10384f]/5 p-4 text-xs text-[#10384f]/80">
          ℹ️ Todos los integrantes registrados son mayores de edad. La
          autorización de acudientes no es obligatoria para este semillero.
        </div>
      )}

      <div className="space-y-6">
        {/* 1. Aval Institucional */}
        <SelectorArchivo
          id="aval_semillero"
          titulo="1. Aval o Certificación del Semillero (PDF)"
          descripcion="Carta oficial o constancia expedida por la institución educativa que certifique la vinculación activa del semillero y el aval del docente tutor."
          obligatorio={true}
          soloPdf={true}
          archivoActual={datos.aval_semillero}
          alSeleccionarArchivo={(file) =>
            actualizarArchivo("aval_semillero", file)
          }
          error={errores.aval_semillero}
        />

        {/* 2. Documentos de Identidad */}
        <div className="space-y-4 rounded-2xl border border-[#10384f]/15 bg-[#f5f4ec]/50 p-5 md:p-6">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#006b5c]">
              2. Documentos de Identidad de los 3 Estudiantes
            </h3>
            <p className="mt-1 text-xs text-[#10384f]/70">
              Adjunta copia legible por ambas caras en PDF o imagen de cada
              integrante.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <SelectorArchivo
              id="doc_identidad_1"
              titulo={`Doc. Integrante 1 (${datos.integrantes[0].nombres_apellidos || "Estudiante 1"})`}
              descripcion={`Tipo: ${datos.integrantes[0].tipo_documento} - ${datos.integrantes[0].numero_documento || "Sin número"}`}
              obligatorio={true}
              archivoActual={datos.doc_identidad_1}
              alSeleccionarArchivo={(file) =>
                actualizarArchivo("doc_identidad_1", file)
              }
              error={errores.doc_identidad_1}
            />

            <SelectorArchivo
              id="doc_identidad_2"
              titulo={`Doc. Integrante 2 (${datos.integrantes[1].nombres_apellidos || "Estudiante 2"})`}
              descripcion={`Tipo: ${datos.integrantes[1].tipo_documento} - ${datos.integrantes[1].numero_documento || "Sin número"}`}
              obligatorio={true}
              archivoActual={datos.doc_identidad_2}
              alSeleccionarArchivo={(file) =>
                actualizarArchivo("doc_identidad_2", file)
              }
              error={errores.doc_identidad_2}
            />

            <SelectorArchivo
              id="doc_identidad_3"
              titulo={`Doc. Integrante 3 (${datos.integrantes[2].nombres_apellidos || "Estudiante 3"})`}
              descripcion={`Tipo: ${datos.integrantes[2].tipo_documento} - ${datos.integrantes[2].numero_documento || "Sin número"}`}
              obligatorio={true}
              archivoActual={datos.doc_identidad_3}
              alSeleccionarArchivo={(file) =>
                actualizarArchivo("doc_identidad_3", file)
              }
              error={errores.doc_identidad_3}
            />
          </div>
        </div>

        {/* 3. Autorización de Menores */}
        <SelectorArchivo
          id="autorizacion_menores"
          titulo="3. Autorización de Padres o Acudientes para Menores de Edad"
          descripcion={
            hayMenoresDeEdad
              ? "Requerido obligatoriamente por incluir participantes menores de 18 años. Documento firmado con fotocopia de cédula del padre, madre o tutor legal."
              : "Opcional. No requerido ya que todos los integrantes declararon ser mayores de edad."
          }
          obligatorio={hayMenoresDeEdad}
          archivoActual={datos.autorizacion_menores}
          alSeleccionarArchivo={(file) =>
            actualizarArchivo("autorizacion_menores", file)
          }
          error={errores.autorizacion_menores}
        />
      </div>
    </div>
  );
}
