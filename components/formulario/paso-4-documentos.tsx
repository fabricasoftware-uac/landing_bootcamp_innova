"use client";

import { type ChangeEvent, type DragEvent, useRef, useState } from "react";
import { comprimirImagenEnNavegador } from "@/lib/utils/optimizar-imagen-cliente";
import {
  ALLOWED_FILE_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
} from "@/lib/validations/postulacion";
import { TituloPaso } from "./campos";
import type { PasoProps } from "./tipos";

type CampoArchivo =
  | "aval_semillero"
  | "doc_identidad_1"
  | "doc_identidad_2"
  | "doc_identidad_3"
  | "autorizacion_menores";

/* Aviso antes del tope de 4,4 MB con que el formulario frena el envío. */
const PESO_RECOMENDADO_BYTES = 4.2 * 1024 * 1024;

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
  error?: string | undefined;
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
  const [errorLocal, setErrorLocal] = useState<string | null>(null);
  const [comprimiendo, setComprimiendo] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const formatosAceptados = soloPdf
    ? "application/pdf"
    : ".pdf,image/jpeg,image/png,image/jpg";

  const formatosTexto = soloPdf ? "Solo PDF" : "PDF, JPEG o PNG";

  const validarYAsignar = async (archivo: File) => {
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

    let procesado = archivo;
    if (archivo.type.startsWith("image/")) {
      setComprimiendo(true);
      try {
        procesado = await comprimirImagenEnNavegador(archivo);
      } catch {
        // Si no se puede comprimir, sirve el original: el tope de peso lo revisa después.
      } finally {
        setComprimiendo(false);
      }
    }

    alSeleccionarArchivo(procesado);
  };

  const alArrastrarSobre = (evento: DragEvent<HTMLDivElement>) => {
    // Sin esto el navegador abre el archivo en lugar de entregárnoslo.
    evento.preventDefault();
  };

  const alSoltar = (evento: DragEvent<HTMLDivElement>) => {
    evento.preventDefault();
    const archivo = evento.dataTransfer.files?.[0];
    if (archivo) validarYAsignar(archivo);
  };

  const alElegir = (evento: ChangeEvent<HTMLInputElement>) => {
    const archivo = evento.target.files?.[0];
    if (archivo) validarYAsignar(archivo);
  };

  const quitar = () => {
    alSeleccionarArchivo(null);
    setErrorLocal(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const errorVisible = error || errorLocal;

  return (
    <div
      className="adjunto"
      data-listo={archivoActual ? "" : undefined}
      data-error={errorVisible ? "" : undefined}
      onDragOver={alArrastrarSobre}
      onDrop={alSoltar}
    >
      <div>
        <strong>{titulo}</strong>
        <small>
          {obligatorio ? "Obligatorio" : "Opcional"}. {descripcion}{" "}
          {formatosTexto}, máximo 10 MB.
        </small>
        {comprimiendo && (
          <small role="status">Reduciendo el peso de la imagen…</small>
        )}
        {archivoActual && (
          <small>
            Adjunto: {archivoActual.name} ({formatearTamano(archivoActual.size)}
            )
          </small>
        )}
        {errorVisible && (
          <small id={`error-${id}`} className="campo-error" role="alert">
            {errorVisible}
          </small>
        )}
      </div>

      <div className="adjunto-acciones">
        <input
          ref={inputRef}
          id={id}
          name={id}
          type="file"
          accept={formatosAceptados}
          onChange={alElegir}
          className="peer sr-only"
          aria-describedby={errorVisible ? `error-${id}` : undefined}
        />
        <label
          htmlFor={id}
          className="boton boton-suave peer-focus-visible:outline-3 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-verde"
        >
          {archivoActual ? "Cambiar archivo" : "Elegir archivo"}
          <span className="sr-only">: {titulo}</span>
        </label>
        {archivoActual && (
          <button
            type="button"
            className="enlace-texto min-h-11"
            onClick={quitar}
          >
            Quitar
            <span className="sr-only"> {titulo}</span>
          </button>
        )}
      </div>
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

  const actualizarArchivo = (campo: CampoArchivo, archivo: File | null) => {
    actualizarDatos({ [campo]: archivo });
    limpiarError?.(campo);
  };

  const documentosIdentidad = [
    { campo: "doc_identidad_1", archivo: datos.doc_identidad_1 },
    { campo: "doc_identidad_2", archivo: datos.doc_identidad_2 },
    { campo: "doc_identidad_3", archivo: datos.doc_identidad_3 },
  ] as const;

  const pesoTotal =
    (datos.aval_semillero?.size ?? 0) +
    (datos.doc_identidad_1?.size ?? 0) +
    (datos.doc_identidad_2?.size ?? 0) +
    (datos.doc_identidad_3?.size ?? 0) +
    (datos.autorizacion_menores?.size ?? 0);
  const excedePeso = pesoTotal > PESO_RECOMENDADO_BYTES;

  return (
    <div className="paso">
      <TituloPaso titulo="Los documentos">
        Adjunta cada soporte en PDF o en una imagen legible. Cada archivo pesa
        máximo 10&nbsp;MB y entre todos no deben pasar de 4,2&nbsp;MB. Las fotos
        se reducen solas.
      </TituloPaso>

      {pesoTotal > 0 && (
        <div className="peso-total" data-excede={excedePeso ? "" : undefined}>
          <p>
            <strong>Peso total:</strong> {formatearTamano(pesoTotal)} de
            4,2&nbsp;MB
          </p>
          <div className="medidor" aria-hidden="true">
            <span
              style={{
                transform: `scaleX(${Math.min(1, pesoTotal / PESO_RECOMENDADO_BYTES)})`,
              }}
            />
          </div>
          {excedePeso && (
            <p role="alert">
              Supera el límite de subida. Comprime los PDF antes de seguir.
            </p>
          )}
        </div>
      )}

      {hayMenoresDeEdad ? (
        <p className="aviso aviso-alerta">
          Hay estudiantes menores de 18 años, así que la autorización firmada
          por su madre, padre o representante legal es{" "}
          <strong>obligatoria</strong>.
        </p>
      ) : (
        <p className="aviso">
          Todo el equipo es mayor de edad: no necesitas la autorización de
          acudientes.
        </p>
      )}

      <section className="paso-bloque" aria-labelledby="bloque-aval">
        <h3 id="bloque-aval">Aval del semillero</h3>
        <SelectorArchivo
          id="aval_semillero"
          titulo="Aval o certificación del semillero"
          descripcion="Carta o constancia de la institución que certifique el semillero y el aval del docente tutor."
          soloPdf
          archivoActual={datos.aval_semillero}
          alSeleccionarArchivo={(archivo) =>
            actualizarArchivo("aval_semillero", archivo)
          }
          error={errores.aval_semillero}
        />
      </section>

      <section className="paso-bloque" aria-labelledby="bloque-identidad">
        <h3 id="bloque-identidad">Documentos de identidad</h3>
        <p>Copia legible por ambas caras de cada estudiante.</p>
        {documentosIdentidad.map(({ campo, archivo }, posicion) => {
          const integrante = datos.integrantes[posicion];
          const nombre =
            integrante?.nombres_apellidos || `Estudiante ${posicion + 1}`;
          return (
            <SelectorArchivo
              key={campo}
              id={campo}
              titulo={`Documento de ${nombre}`}
              descripcion={`${integrante?.tipo_documento ?? ""} ${integrante?.numero_documento || "sin número"}.`}
              archivoActual={archivo}
              alSeleccionarArchivo={(f) => actualizarArchivo(campo, f)}
              error={errores[campo]}
            />
          );
        })}
      </section>

      <section className="paso-bloque" aria-labelledby="bloque-autorizacion">
        <h3 id="bloque-autorizacion">Autorización para menores de edad</h3>
        <SelectorArchivo
          id="autorizacion_menores"
          titulo="Autorización de madre, padre o acudiente"
          descripcion={
            hayMenoresDeEdad
              ? "Documento firmado, con fotocopia de la cédula de quien autoriza."
              : "No la necesitas porque todo el equipo declaró ser mayor de edad."
          }
          obligatorio={hayMenoresDeEdad}
          archivoActual={datos.autorizacion_menores}
          alSeleccionarArchivo={(archivo) =>
            actualizarArchivo("autorizacion_menores", archivo)
          }
          error={errores.autorizacion_menores}
        />
      </section>
    </div>
  );
}
