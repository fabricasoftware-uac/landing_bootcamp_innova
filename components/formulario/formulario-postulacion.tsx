"use client";

import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useEffect, useRef, useState, useTransition } from "react";
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
import { IndicadorPasos, PASOS_INFO } from "./indicador-pasos";
import { Paso1Semillero } from "./paso-1-semillero";
import { Paso2Integrantes } from "./paso-2-integrantes";
import { Paso3Motivacion } from "./paso-3-motivacion";
import { Paso4Documentos } from "./paso-4-documentos";
import { Paso5RevisionTerminos } from "./paso-5-revision-terminos";
import { TallerProgreso } from "./taller-progreso";
import {
  ESTADO_INICIAL_POSTULACION,
  type FormularioPostulacionState,
} from "./tipos";
import { useBorrador, useConexion } from "./use-borrador";

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
  // Trampa para robots: las personas no la ven; el servidor descarta lo que la llene.
  const [trampa, setTrampa] = useState("");

  const borrador = useBorrador({
    datos,
    paso: pasoActual,
    alRecuperar: (recuperados, paso) => {
      setDatos(recuperados);
      setPasoActual(paso);
    },
  });
  const enLinea = useConexion();

  const contenedorRef = useRef<HTMLDivElement>(null);
  const hojaRef = useRef<HTMLDivElement>(null);
  const pasoAnterior = useRef(pasoActual);

  // Al cambiar de paso, el lector de pantalla y el teclado siguen en la hoja nueva.
  useEffect(() => {
    if (pasoAnterior.current === pasoActual) return;
    pasoAnterior.current = pasoActual;
    hojaRef.current?.focus({ preventScroll: true });
  }, [pasoActual]);

  const scrollAlInicioFormulario = () => {
    if (contenedorRef.current) {
      contenedorRef.current.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
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

        formData.append("sitio_web", trampa);
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
          borrador.borrar();
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
            "No se pudo conectar con el servidor de inscripciones. Por favor verifica tu conexión e inténtalo de nuevo.",
          );
        }
      }
    });
  };

  const reiniciarFormulario = () => {
    borrador.borrar();
    setDatos(ESTADO_INICIAL_POSTULACION);
    setResultadoExito(null);
    setPasoActual(1);
    setErrores({});
    setErrorServidor(null);
    scrollAlInicioFormulario();
  };

  const siguientePaso = PASOS_INFO[pasoActual]?.titulo;

  return (
    <div className="expediente">
      <TallerProgreso
        datos={datos}
        pasoActual={pasoActual}
        terminado={Boolean(resultadoExito)}
      />
      <div ref={contenedorRef} className="expediente-principal">
        {resultadoExito ? (
          <ComprobanteExito
            resultado={resultadoExito}
            datos={datos}
            alReiniciar={reiniciarFormulario}
          />
        ) : (
          <>
            <IndicadorPasos
              pasoActual={pasoActual}
              alSeleccionarPaso={irAPaso}
            />
            <div ref={hojaRef} className="hoja-paso" tabIndex={-1}>
              <label className="trampa" aria-hidden="true">
                Sitio web
                <input
                  type="text"
                  name="sitio_web"
                  tabIndex={-1}
                  autoComplete="off"
                  value={trampa}
                  onChange={(evento) => setTrampa(evento.target.value)}
                />
              </label>
              {!enLinea && (
                <div className="aviso aviso-alerta mb-6" role="status">
                  Estás sin conexión. Tu avance queda guardado en este equipo y
                  podrás radicar cuando vuelva internet.
                </div>
              )}
              {borrador.recuperado && (
                <div className="aviso aviso-borrador mb-6" role="status">
                  <p>
                    Recuperamos tu avance. Si ibas en los documentos, vuelve a
                    adjuntarlos: por seguridad no se guardan.
                  </p>
                  <button
                    type="button"
                    className="enlace-texto"
                    onClick={reiniciarFormulario}
                  >
                    Empezar de cero
                  </button>
                </div>
              )}
              {errorServidor && (
                <div className="aviso aviso-alerta mb-6" role="alert">
                  No fue posible radicar la postulación. {errorServidor}
                </div>
              )}

              <MotionConfig reducedMotion="user">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={pasoActual}
                    initial={{
                      opacity: 0,
                      y: 36,
                      clipPath: "inset(-2rem -2rem 100% -2rem)",
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      clipPath: "inset(-2rem -2rem -2rem -2rem)",
                    }}
                    exit={{ opacity: 0, y: -18 }}
                    transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
                  >
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
                  </motion.div>
                </AnimatePresence>
              </MotionConfig>

              <div className="controles-paso">
                {pasoActual > 1 && (
                  <button
                    type="button"
                    className="boton boton-suave"
                    disabled={isPending}
                    onClick={retrocederPaso}
                  >
                    Volver
                  </button>
                )}
                {pasoActual < PASOS_INFO.length ? (
                  <button
                    type="button"
                    className="boton boton-lima"
                    onClick={avanzarPaso}
                  >
                    Seguir a {siguientePaso} <span className="flecha">→</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="boton boton-lima"
                    disabled={isPending}
                    onClick={manejarEnvio}
                  >
                    {isPending ? (
                      <>
                        <span className="girando" aria-hidden="true" />
                        Radicando…
                      </>
                    ) : (
                      <>
                        Radicar postulación <span className="flecha">→</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
