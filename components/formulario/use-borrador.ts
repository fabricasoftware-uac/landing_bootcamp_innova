"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ESTADO_INICIAL_POSTULACION,
  type FormularioPostulacionState,
} from "./tipos";

const CLAVE = "cauca-borrador-postulacion";
const VIGENCIA_MS = 24 * 60 * 60 * 1000;
const ESPERA_GUARDADO_MS = 400;
const ULTIMO_PASO_SIN_ARCHIVOS = 4;

type CamposTexto = Omit<
  FormularioPostulacionState,
  | "aval_semillero"
  | "doc_identidad_1"
  | "doc_identidad_2"
  | "doc_identidad_3"
  | "autorizacion_menores"
  | "acepta_terminos"
  | "acepta_tratamiento_datos"
  | "declara_veracidad"
>;

/*
 * Ni archivos ni casillas legales: las copias de documentos no deben quedar en un equipo
 * que puede ser compartido, y la aceptación debe darse de nuevo.
 */
function soloTexto(datos: FormularioPostulacionState): CamposTexto {
  return {
    institucion_nombre: datos.institucion_nombre,
    institucion_tipo: datos.institucion_tipo,
    semillero_nombre: datos.semillero_nombre,
    tutor_nombre: datos.tutor_nombre,
    tutor_email: datos.tutor_email,
    tutor_telefono: datos.tutor_telefono,
    integrantes: datos.integrantes,
    motivacion_intereses: datos.motivacion_intereses,
  };
}

function tieneContenido(datos: FormularioPostulacionState): boolean {
  return (
    Boolean(datos.institucion_nombre || datos.semillero_nombre) ||
    Boolean(datos.tutor_nombre || datos.motivacion_intereses) ||
    datos.integrantes.some((i) => i.nombres_apellidos || i.numero_documento)
  );
}

interface BorradorGuardado {
  guardado: number;
  paso: number;
  datos: CamposTexto;
}

function esBorrador(valor: unknown): valor is BorradorGuardado {
  if (typeof valor !== "object" || valor === null) return false;
  const v = valor as Partial<BorradorGuardado>;
  return (
    typeof v.guardado === "number" &&
    typeof v.paso === "number" &&
    typeof v.datos === "object" &&
    v.datos !== null &&
    Array.isArray(v.datos.integrantes) &&
    v.datos.integrantes.length === 3
  );
}

function leerBorrador(): BorradorGuardado | null {
  try {
    const crudo = localStorage.getItem(CLAVE);
    if (!crudo) return null;
    const valor: unknown = JSON.parse(crudo);
    if (!esBorrador(valor) || Date.now() - valor.guardado > VIGENCIA_MS) {
      localStorage.removeItem(CLAVE);
      return null;
    }
    return valor;
  } catch {
    // Almacenamiento bloqueado o dato dañado: el formulario arranca vacío.
    return null;
  }
}

interface OpcionesBorrador {
  datos: FormularioPostulacionState;
  paso: number;
  alRecuperar: (datos: FormularioPostulacionState, paso: number) => void;
}

/** Guarda el avance por 24 horas para sobrevivir a una recarga o a un corte de internet. */
export function useBorrador({ datos, paso, alRecuperar }: OpcionesBorrador) {
  const [recuperado, setRecuperado] = useState(false);
  const listo = useRef(false);
  const recuperar = useRef(alRecuperar);
  recuperar.current = alRecuperar;

  useEffect(() => {
    const borrador = leerBorrador();
    if (borrador) {
      recuperar.current(
        { ...ESTADO_INICIAL_POSTULACION, ...borrador.datos },
        Math.min(borrador.paso, ULTIMO_PASO_SIN_ARCHIVOS),
      );
      setRecuperado(true);
    }
    listo.current = true;
  }, []);

  useEffect(() => {
    if (!listo.current || !tieneContenido(datos)) return;
    const espera = window.setTimeout(() => {
      try {
        const borrador: BorradorGuardado = {
          guardado: Date.now(),
          paso,
          datos: soloTexto(datos),
        };
        localStorage.setItem(CLAVE, JSON.stringify(borrador));
      } catch {
        // Sin almacenamiento el formulario sigue funcionando, solo sin respaldo.
      }
    }, ESPERA_GUARDADO_MS);
    return () => window.clearTimeout(espera);
  }, [datos, paso]);

  const borrar = useCallback(() => {
    listo.current = false;
    setRecuperado(false);
    try {
      localStorage.removeItem(CLAVE);
    } catch {
      // Si no se pudo leer, tampoco hay nada que borrar.
    }
    listo.current = true;
  }, []);

  return { recuperado, borrar, ocultarAviso: () => setRecuperado(false) };
}

export function useConexion(): boolean {
  const [enLinea, setEnLinea] = useState(true);

  useEffect(() => {
    const actualizar = () => setEnLinea(navigator.onLine);
    actualizar();
    window.addEventListener("online", actualizar);
    window.addEventListener("offline", actualizar);
    return () => {
      window.removeEventListener("online", actualizar);
      window.removeEventListener("offline", actualizar);
    };
  }, []);

  return enLinea;
}
