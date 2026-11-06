"use client";

import { useRef, useState, useTransition } from "react";
import { crearPostulacionAction } from "@/app/actions/postulaciones";
import {
  MAX_FILE_SIZE_BYTES,
  type PostulacionSuccessData,
  paso1SemilleroSchema,
  paso2IntegrantesSchema,
  paso3MotivacionSchema,
  paso5DeclaracionSchema,
} from "@/lib/validations/postulacion";
import { ComprobanteExito } from "./comprobante-exito";
import { IndicadorPasos } from "./indicador-pasos";
import { Paso1Semillero } from "./paso-1-semillero";
import { Paso2Integrantes } from "./paso-2-integrantes";
import { Paso3Motivacion } from "./paso-3-motivacion";
import { Paso4Documentos } from "./paso-4-documentos";
import { Paso5RevisionTerminos } from "./paso-5-revision-terminos";
import {
  ESTADO_INICIAL_POSTULACION,
  type FormularioPostulacionState,
} from "./tipos";

export function FormularioPostulacion() {
  const [pasoActual, setPasoActual] = useState<number>(1);
  const [datos, setDatos] = useState<FormularioPostulacionState>(
    ESTADO_INICIAL_POSTULACION,
  );
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorServidor, setErrorServidor] = useState<string | null>(null);
  const [resultadoExito, setResultadoExito] =
    useState<PostulacionSuccessData | null>(null);
  const [isPending, startTransition] = useTransition();

  const contenedorRef = useRef<HTMLDivElement>(null);

  const scrollAlInicioFormulario = () => {
    if (contenedorRef.current) {
      contenedorRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const actualizarDatos = (parciales: Partial<FormularioPostulacionState>) => {
    setDatos((prev) => ({ ...prev, ...parciales }));
  };

  const limpiarError = (campo: string) => {
    setErrores((prev) => {
      if (!prev[campo]) return prev;
      const copia = { ...prev };
      delete copia[campo];
      return copia;
    });
  };

  // Validaciones locales por paso
  const validarPaso = (paso: number): boolean => {
    setErrores({});
    setErrorServidor(null);

    if (paso === 1) {
      const resultado = paso1SemilleroSchema.safeParse({
        institucion_nombre: datos.institucion_nombre,
        institucion_tipo: datos.institucion_tipo,
        semillero_nombre: datos.semillero_nombre,
        tutor_nombre: datos.tutor_nombre,
        tutor_email: datos.tutor_email,
        tutor_telefono: datos.tutor_telefono,
      });

      if (!resultado.success) {
        const nuevosErrores: Record<string, string> = {};
        for (const issue of resultado.error.issues) {
          const campo = issue.path[0];
          if (campo && typeof campo === "string") {
            nuevosErrores[campo] = issue.message;
          }
        }
        setErrores(nuevosErrores);
        return false;
      }
      return true;
    }

    if (paso === 2) {
      const resultado = paso2IntegrantesSchema.safeParse({
        integrantes: datos.integrantes,
      });

      if (!resultado.success) {
        const nuevosErrores: Record<string, string> = {};
        for (const issue of resultado.error.issues) {
          // issue.path puede ser ['integrantes', 0, 'nombres_apellidos']
          const ruta = issue.path.join(".");
          nuevosErrores[ruta] = issue.message;
        }
        setErrores(nuevosErrores);
        return false;
      }
      return true;
    }

    if (paso === 3) {
      const resultado = paso3MotivacionSchema.safeParse({
        motivacion_intereses: datos.motivacion_intereses,
      });

      if (!resultado.success) {
        const nuevosErrores: Record<string, string> = {};
        for (const issue of resultado.error.issues) {
          const campo = issue.path[0];
          if (campo && typeof campo === "string") {
            nuevosErrores[campo] = issue.message;
          }
        }
        setErrores(nuevosErrores);
        return false;
      }
      return true;
    }

    if (paso === 4) {
      const nuevosErrores: Record<string, string> = {};
      const validarArchivo = (
        archivo: File | null,
        campo: string,
        requerido = true,
        soloPdf = false,
      ) => {
        if (!archivo || archivo.size === 0) {
          if (requerido) {
            nuevosErrores[campo] = "Debe adjuntar este documento obligatorio.";
          }
          return;
        }
        if (archivo.size > MAX_FILE_SIZE_BYTES) {
          nuevosErrores[campo] = "El archivo no debe exceder 10 MB.";
        }
        if (soloPdf && archivo.type !== "application/pdf") {
          nuevosErrores[campo] = "El archivo debe ser un documento PDF (.pdf).";
        }
      };

      validarArchivo(datos.aval_semillero, "aval_semillero", true, true);
      validarArchivo(datos.doc_identidad_1, "doc_identidad_1", true, false);
      validarArchivo(datos.doc_identidad_2, "doc_identidad_2", true, false);
      validarArchivo(datos.doc_identidad_3, "doc_identidad_3", true, false);

      const hayMenores = datos.integrantes.some((i) => i.es_menor_edad);
      if (hayMenores) {
        validarArchivo(
          datos.autorizacion_menores,
          "autorizacion_menores",
          true,
          false,
        );
      }

      if (Object.keys(nuevosErrores).length > 0) {
        setErrores(nuevosErrores);
        return false;
      }
      return true;
    }

    if (paso === 5) {
      const resultado = paso5DeclaracionSchema.safeParse({
        acepta_terminos: datos.acepta_terminos,
        acepta_tratamiento_datos: datos.acepta_tratamiento_datos,
        declara_veracidad: datos.declara_veracidad,
      });

      if (!resultado.success) {
        const nuevosErrores: Record<string, string> = {};
        for (const issue of resultado.error.issues) {
          const campo = issue.path[0];
          if (campo && typeof campo === "string") {
            nuevosErrores[campo] = issue.message;
          }
        }
        setErrores(nuevosErrores);
        return false;
      }
      return true;
    }

    return true;
  };

  const avanzarPaso = () => {
    if (validarPaso(pasoActual)) {
      setPasoActual((prev) => Math.min(prev + 1, 5));
      scrollAlInicioFormulario();
    }
  };

  const retrocederPaso = () => {
    setErrores({});
    setErrorServidor(null);
    setPasoActual((prev) => Math.max(prev - 1, 1));
    scrollAlInicioFormulario();
  };

  const irAPaso = (pasoDestino: number) => {
    if (pasoDestino < pasoActual) {
      setErrores({});
      setErrorServidor(null);
      setPasoActual(pasoDestino);
      scrollAlInicioFormulario();
    }
  };

  // Envío final mediante Server Action
  const manejarEnvio = () => {
    // Validar paso 5
    if (!validarPaso(5)) {
      return;
    }

    setErrorServidor(null);

    startTransition(async () => {
      try {
        const formData = new FormData();

        // 1. Añadir payload estructurado en JSON
        const payload = {
          institucion_nombre: datos.institucion_nombre,
          institucion_tipo: datos.institucion_tipo,
          semillero_nombre: datos.semillero_nombre,
          tutor_nombre: datos.tutor_nombre,
          tutor_email: datos.tutor_email,
          tutor_telefono: datos.tutor_telefono,
          integrantes: datos.integrantes,
          motivacion_intereses: datos.motivacion_intereses,
          acepta_terminos: datos.acepta_terminos,
          acepta_tratamiento_datos: datos.acepta_tratamiento_datos,
          declara_veracidad: datos.declara_veracidad,
        };

        formData.append("datos", JSON.stringify(payload));
        formData.append("payload", JSON.stringify(payload));

        // 2. Añadir campos directos de conveniencia
        formData.append("institucion_nombre", datos.institucion_nombre);
        formData.append("institucion_tipo", datos.institucion_tipo);
        formData.append("semillero_nombre", datos.semillero_nombre);
        formData.append("tutor_nombre", datos.tutor_nombre);
        formData.append("tutor_email", datos.tutor_email);
        formData.append("tutor_telefono", datos.tutor_telefono);
        formData.append("motivacion_intereses", datos.motivacion_intereses);
        formData.append("acepta_terminos", String(datos.acepta_terminos));
        formData.append(
          "acepta_tratamiento_datos",
          String(datos.acepta_tratamiento_datos),
        );
        formData.append("declara_veracidad", String(datos.declara_veracidad));

        // 3. Añadir integrantes serializados
        formData.append("integrantes", JSON.stringify(datos.integrantes));

        // 4. Adjuntar archivos obligatorios
        if (datos.aval_semillero) {
          formData.append("aval_semillero", datos.aval_semillero);
        }
        if (datos.doc_identidad_1) {
          formData.append("doc_identidad_1", datos.doc_identidad_1);
        }
        if (datos.doc_identidad_2) {
          formData.append("doc_identidad_2", datos.doc_identidad_2);
        }
        if (datos.doc_identidad_3) {
          formData.append("doc_identidad_3", datos.doc_identidad_3);
        }
        if (datos.autorizacion_menores) {
          formData.append("autorizacion_menores", datos.autorizacion_menores);
        }

        // 5. Pre-validación de peso acumulado para prevenir rechazo HTTP 413 (Payload Too Large)
        const pesoTotalBytes =
          (datos.aval_semillero?.size || 0) +
          (datos.doc_identidad_1?.size || 0) +
          (datos.doc_identidad_2?.size || 0) +
          (datos.doc_identidad_3?.size || 0) +
          (datos.autorizacion_menores?.size || 0);

        if (pesoTotalBytes > 4.4 * 1024 * 1024) {
          const pesoMB = (pesoTotalBytes / (1024 * 1024)).toFixed(2);
          setErrorServidor(
            `El peso total acumulado de los archivos adjuntos (${pesoMB} MB) supera el límite máximo permitido de subida (4.4 MB). Por favor comprime tus archivos PDF o imágenes en el Paso 4 antes de finalizar la inscripción.`,
          );
          scrollAlInicioFormulario();
          return;
        }

        // Ejecutar Server Action
        const respuesta = await crearPostulacionAction(formData);

        if (respuesta.success) {
          setResultadoExito(respuesta.data);
          scrollAlInicioFormulario();
        } else {
          setErrorServidor(
            respuesta.error ||
              "Ocurrió un error al procesar la postulación. Por favor verifica los datos.",
          );

          if (respuesta.fieldErrors) {
            const erroresMapeados: Record<string, string> = {};
            for (const [key, mensajes] of Object.entries(
              respuesta.fieldErrors,
            )) {
              if (mensajes?.[0]) {
                erroresMapeados[key] = mensajes[0];
              }
            }
            setErrores(erroresMapeados);
          }
        }
      } catch (err) {
        console.error("Error al enviar postulación:", err);
        const errorMsg = err instanceof Error ? err.message : String(err);
        if (
          errorMsg.includes("413") ||
          errorMsg.includes("Body exceeded") ||
          errorMsg.includes("too large") ||
          errorMsg.includes("Payload Too Large") ||
          errorMsg.includes("Failed to fetch")
        ) {
          setErrorServidor(
            "El servidor no pudo recibir los archivos adjuntos debido a su peso acumulado o una interrupción en la subida. Por favor asegúrate de que los PDFs escaneados estén comprimidos y pesen menos de 4 MB en total.",
          );
        } else {
          setErrorServidor(
            `No se pudo conectar con el servidor de inscripciones (${errorMsg || "Error de red"}). Por favor verifica tu conexión e inténtalo de nuevo.`,
          );
        }
      }
    });
  };

  const reiniciarFormulario = () => {
    setDatos(ESTADO_INICIAL_POSTULACION);
    setResultadoExito(null);
    setPasoActual(1);
    setErrores({});
    setErrorServidor(null);
    scrollAlInicioFormulario();
  };

  if (resultadoExito) {
    return (
      <div ref={contenedorRef} className="w-full">
        <ComprobanteExito
          resultado={resultadoExito}
          datos={datos}
          alReiniciar={reiniciarFormulario}
        />
      </div>
    );
  }

  return (
    <div ref={contenedorRef} className="w-full">
      {/* Indicador de pasos */}
      <IndicadorPasos
        pasoActual={pasoActual}
        totalPasos={5}
        alSeleccionarPaso={irAPaso}
      />

      {/* Alerta de error del servidor si ocurre */}
      {errorServidor && (
        <div
          className="mb-6 rounded-xl border border-rose-400 bg-rose-50 p-4 text-sm font-semibold text-rose-900 shadow-xs"
          role="alert"
        >
          <div className="flex items-start gap-3">
            <span className="text-xl" aria-hidden="true">
              ⚠️
            </span>
            <div>
              <p className="font-bold">
                No fue posible completar la inscripción:
              </p>
              <p className="mt-0.5 text-xs font-normal text-rose-800">
                {errorServidor}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Contenido del paso actual */}
      <div className="min-h-[460px]">
        {pasoActual === 1 && (
          <Paso1Semillero
            datos={datos}
            actualizarDatos={actualizarDatos}
            errores={errores}
            limpiarError={limpiarError}
          />
        )}

        {pasoActual === 2 && (
          <Paso2Integrantes
            datos={datos}
            actualizarDatos={actualizarDatos}
            errores={errores}
            limpiarError={limpiarError}
          />
        )}

        {pasoActual === 3 && (
          <Paso3Motivacion
            datos={datos}
            actualizarDatos={actualizarDatos}
            errores={errores}
            limpiarError={limpiarError}
          />
        )}

        {pasoActual === 4 && (
          <Paso4Documentos
            datos={datos}
            actualizarDatos={actualizarDatos}
            errores={errores}
            limpiarError={limpiarError}
          />
        )}

        {pasoActual === 5 && (
          <Paso5RevisionTerminos
            datos={datos}
            actualizarDatos={actualizarDatos}
            errores={errores}
            limpiarError={limpiarError}
            irAPaso={irAPaso}
          />
        )}
      </div>

      {/* Barra de controles de navegación */}
      <div className="mt-10 sm:mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-[#10384f]/15 pt-6 sm:pt-8">
        <div>
          {pasoActual > 1 ? (
            <button
              type="button"
              disabled={isPending}
              onClick={retrocederPaso}
              className="inline-flex items-center gap-2 rounded-xl border border-[#10384f]/25 bg-white px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-[#10384f] shadow-2xs transition hover:bg-[#10384f]/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              ← Anterior
            </button>
          ) : (
            <a
              href="/"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#10384f]/70 hover:text-[#10384f]"
            >
              ← Volver al sitio principal
            </a>
          )}
        </div>

        <div>
          {pasoActual < 5 ? (
            <button
              type="button"
              onClick={avanzarPaso}
              className="inline-flex items-center gap-3 rounded-xl bg-[#10384f] px-7 py-3.5 text-xs font-bold uppercase tracking-wider shadow-sm transition hover:bg-[#006b5c]"
            >
              <span className="text-amber-50">
                Continuar al Paso {pasoActual + 1}
              </span>
            </button>
          ) : (
            <button
              type="button"
              disabled={isPending}
              onClick={manejarEnvio}
              className="inline-flex items-center gap-3 rounded-xl bg-[#006b5c] px-8 py-3.5 text-sm font-black uppercase tracking-wider text-[#d1ef3d] shadow-md transition hover:bg-[#10384f] hover:text-[#f5f4ec] disabled:cursor-wait disabled:opacity-75"
            >
              {isPending ? (
                <>
                  <span
                    className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                    aria-hidden="true"
                  />
                  <span>Radicando Inscripción...</span>
                </>
              ) : (
                <>
                  <span>Finalizar y Radicar Inscripción</span>
                  <span aria-hidden="true">✓</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
