"use client";

import { FantasmaCauca, PiezaCauca } from "@/components/sitio/pieza-cauca";
import { paginaTerminos } from "@/lib/contenido";
import { CAPAS_PIEZA } from "@/lib/pieza-cauca";
import { PASOS_INFO } from "./indicador-pasos";
import type { FormularioPostulacionState } from "./tipos";

const CHISPAS = [0, 1, 2, 3, 4, 5];

const MENSAJES = [
  { desde: 1, texto: "Pieza lista para radicar." },
  { desde: 0.8, texto: "Última pasada de la boquilla." },
  { desde: 0.5, texto: "Más de la mitad del Cauca impreso." },
  { desde: 0.2, texto: "Va tomando forma." },
  { desde: 0.01, texto: "La primera capa ya agarró." },
  { desde: 0, texto: "Cama lista. Cada dato imprime tu pieza." },
];

const lleno = (valor: string) => valor.trim().length > 0;

/** Cuenta solo lo que el equipo debe completar, sin pedirle nada a los valores por defecto. */
export function calcularAvance(datos: FormularioPostulacionState): number {
  const hayMenores = datos.integrantes.some((i) => i.es_menor_edad);
  const puntos = [
    lleno(datos.institucion_nombre),
    lleno(datos.semillero_nombre),
    lleno(datos.tutor_nombre),
    lleno(datos.tutor_email),
    lleno(datos.tutor_telefono),
    ...datos.integrantes.flatMap((i) => [
      lleno(i.nombres_apellidos),
      lleno(i.numero_documento),
      lleno(i.correo_electronico),
      lleno(i.telefono),
    ]),
    datos.motivacion_intereses.trim().length >= 50,
    Boolean(datos.aval_semillero),
    Boolean(datos.doc_identidad_1),
    Boolean(datos.doc_identidad_2),
    Boolean(datos.doc_identidad_3),
    ...(hayMenores ? [Boolean(datos.autorizacion_menores)] : []),
    datos.acepta_terminos,
    datos.acepta_tratamiento_datos,
    datos.declara_veracidad,
  ];
  return puntos.filter(Boolean).length / puntos.length;
}

function iniciales(nombre: string): string {
  const [primero = "", segundo = ""] = nombre.trim().split(/\s+/);
  return `${primero.charAt(0)}${segundo.charAt(0)}`.toUpperCase();
}

interface TallerProgresoProps {
  datos: FormularioPostulacionState;
  pasoActual: number;
  terminado: boolean;
}

function Pieza({ capas }: { capas: number }) {
  return (
    <div className="taller-pieza">
      <FantasmaCauca />
      <PiezaCauca
        capas={capas}
        etiqueta={`Prototipo del Cauca con ${capas} de ${CAPAS_PIEZA} capas impresas`}
      />
      {/* Cambiar la clave reinicia la chispa cada vez que se gana una capa. */}
      <span key={capas} className="taller-chispas" aria-hidden="true">
        {capas > 0 &&
          CHISPAS.map((chispa) => (
            <i key={chispa} style={{ "--n": chispa } as React.CSSProperties} />
          ))}
      </span>
    </div>
  );
}

/** La pieza se imprime con los datos, no con los pasos: cada campo se nota. */
export function TallerProgreso({
  datos,
  pasoActual,
  terminado,
}: TallerProgresoProps) {
  const avance = terminado ? 1 : calcularAvance(datos);
  const porcentaje = Math.round(avance * 100);
  const capas = Math.ceil(avance * CAPAS_PIEZA);
  const mensaje =
    MENSAJES.find(({ desde }) => avance >= desde)?.texto ?? MENSAJES[5]?.texto;
  const paso = PASOS_INFO[pasoActual - 1];

  return (
    <>
      <aside className="taller" aria-label="Avance de la postulación">
        <div className="taller-cama">
          <Pieza capas={capas} />
          <p className="taller-cifra" aria-hidden="true">
            {porcentaje}
            <span>%</span>
          </p>
        </div>
        <p className="taller-mensaje" role="status">
          {mensaje}
        </p>
        <div className="taller-equipo">
          <p>
            {lleno(datos.semillero_nombre)
              ? datos.semillero_nombre
              : "Tu semillero"}
          </p>
          <ul aria-label="Integrantes del equipo">
            {datos.integrantes.map((integrante, indice) => {
              const nombre = integrante.nombres_apellidos;
              const orden = indice + 1;
              return (
                <li key={orden} data-lleno={lleno(nombre) ? "" : undefined}>
                  <span aria-hidden="true">
                    {lleno(nombre) ? iniciales(nombre) : orden}
                  </span>
                  <small>
                    {lleno(nombre) ? nombre : `Estudiante ${orden}`}
                  </small>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="taller-ayuda">
          <p>
            Ten a la mano el aval del semillero y el documento de cada
            estudiante.
          </p>
          <p>
            ¿Dudas? Mira los{" "}
            <a href={paginaTerminos} target="_blank" rel="noreferrer">
              términos
            </a>{" "}
            o las <a href="/#preguntas">preguntas</a>.
          </p>
        </div>
      </aside>

      <div className="taller-barra" aria-hidden="true">
        <Pieza capas={capas} />
        <p>
          <strong>{terminado ? "Radicada" : paso?.titulo}</strong>
          <small>{mensaje}</small>
        </p>
        <p className="taller-barra-cifra">{porcentaje}%</p>
        <span
          className="taller-barra-filamento"
          style={{ transform: `scaleX(${avance})` }}
        />
      </div>
    </>
  );
}
