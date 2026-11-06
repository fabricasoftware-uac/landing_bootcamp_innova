"use client";

import type { ReactNode } from "react";
import { Casilla, TituloPaso } from "./campos";
import type { PasoProps } from "./tipos";

interface Paso5RevisionProps extends PasoProps {
  irAPaso: (paso: number) => void;
}

const SLOTS_INTEGRANTES = [
  "estudiante-lider-1",
  "estudiante-segundo-2",
  "estudiante-tercero-3",
] as const;

interface BloqueResumenProps {
  titulo: string;
  paso: number;
  irAPaso: (paso: number) => void;
  children: ReactNode;
}

function BloqueResumen({
  titulo,
  paso,
  irAPaso,
  children,
}: BloqueResumenProps) {
  return (
    <section className="resumen-bloque">
      <header>
        <h3>{titulo}</h3>
        <button
          type="button"
          className="enlace-texto min-h-11 px-2"
          onClick={() => irAPaso(paso)}
        >
          Editar<span className="sr-only">: {titulo}</span>
        </button>
      </header>
      {children}
    </section>
  );
}

function Dato({
  etiqueta,
  children,
}: {
  etiqueta: string;
  children: ReactNode;
}) {
  return (
    <div className="mt-3 first:mt-0">
      <dt className="resumen-etiqueta">{etiqueta}</dt>
      <dd className="font-bold break-words">{children}</dd>
    </div>
  );
}

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
    limpiarError?.(campo);
  };

  const hayMenoresDeEdad = datos.integrantes.some((i) => i.es_menor_edad);

  const documentos = [
    {
      clave: "aval",
      nombre: "Aval del semillero",
      archivo: datos.aval_semillero,
    },
    {
      clave: "id1",
      nombre: "Documento del estudiante 1",
      archivo: datos.doc_identidad_1,
    },
    {
      clave: "id2",
      nombre: "Documento del estudiante 2",
      archivo: datos.doc_identidad_2,
    },
    {
      clave: "id3",
      nombre: "Documento del estudiante 3",
      archivo: datos.doc_identidad_3,
    },
  ] as const;

  return (
    <div className="paso">
      <TituloPaso titulo="Revisa y radica">
        Mira que todo esté bien. Una vez radicada, la postulación no se puede
        modificar.
      </TituloPaso>

      <div className="resumen">
        <BloqueResumen
          titulo="Institución y semillero"
          paso={1}
          irAPaso={irAPaso}
        >
          <dl>
            <Dato etiqueta="Institución">
              {datos.institucion_nombre || "—"}
            </Dato>
            <Dato etiqueta="Nivel">
              {datos.institucion_tipo === "basica_media"
                ? "Educación básica y media"
                : "Educación superior"}
            </Dato>
            <Dato etiqueta="Semillero">{datos.semillero_nombre || "—"}</Dato>
            <Dato etiqueta="Tutor">
              {datos.tutor_nombre || "—"}
              {datos.tutor_email && (
                <span className="block font-normal">{datos.tutor_email}</span>
              )}
            </Dato>
          </dl>
        </BloqueResumen>

        <BloqueResumen titulo="Equipo" paso={2} irAPaso={irAPaso}>
          <dl>
            {SLOTS_INTEGRANTES.map((slotId, posicion) => {
              const integrante = datos.integrantes[posicion];
              if (!integrante) return null;
              return (
                <Dato key={slotId} etiqueta={`Estudiante ${posicion + 1}`}>
                  {integrante.nombres_apellidos || "—"}
                  <span className="block font-normal">
                    {integrante.tipo_documento}{" "}
                    {integrante.numero_documento || "—"} ·{" "}
                    {integrante.es_menor_edad
                      ? "Menor de edad"
                      : "Mayor de edad"}
                  </span>
                  {integrante.correo_electronico && (
                    <span className="block font-normal">
                      {integrante.correo_electronico}
                    </span>
                  )}
                </Dato>
              );
            })}
          </dl>
        </BloqueResumen>

        <BloqueResumen titulo="Motivación" paso={3} irAPaso={irAPaso}>
          <p className="line-clamp-3">{datos.motivacion_intereses}</p>
          <p className="resumen-etiqueta mt-2">
            {datos.motivacion_intereses.trim().length} caracteres
          </p>
        </BloqueResumen>

        <BloqueResumen titulo="Documentos" paso={4} irAPaso={irAPaso}>
          <dl>
            {documentos.map(({ clave, nombre, archivo }) => (
              <Dato key={clave} etiqueta={nombre}>
                {archivo?.name || "Pendiente"}
              </Dato>
            ))}
            <Dato etiqueta="Autorización de menores">
              {datos.autorizacion_menores?.name ||
                (hayMenoresDeEdad ? "Pendiente" : "No se necesita")}
            </Dato>
          </dl>
        </BloqueResumen>
      </div>

      <section className="paso-bloque" aria-labelledby="bloque-declaraciones">
        <h3 id="bloque-declaraciones">Declaraciones obligatorias</h3>

        <Casilla
          id="acepta_terminos"
          marcada={datos.acepta_terminos}
          alCambiar={(marcada) =>
            handleCheckboxChange("acepta_terminos", marcada)
          }
          error={errores.acepta_terminos}
        >
          Acepto los{" "}
          <a
            href="/terminos-de-referencia"
            target="_blank"
            rel="noreferrer"
            className="enlace-texto"
          >
            Términos de Referencia oficiales del Bootcamp Cauca INNOVA 2026
          </a>
          , certificando que el semillero y sus 3 integrantes se comprometen a
          la asistencia presencial completa a la jornada (14 de noviembre de
          2026).
        </Casilla>

        <Casilla
          id="acepta_tratamiento_datos"
          marcada={datos.acepta_tratamiento_datos}
          alCambiar={(marcada) =>
            handleCheckboxChange("acepta_tratamiento_datos", marcada)
          }
          error={errores.acepta_tratamiento_datos}
        >
          Autorizo expresamente el tratamiento de datos personales de los
          estudiantes y el docente tutor conforme a la{" "}
          <a
            href="/privacidad"
            target="_blank"
            rel="noreferrer"
            className="enlace-texto"
          >
            <strong>Ley Estatutaria 1581 de 2012 (Habeas Data)</strong>
          </a>{" "}
          para los fines organizativos, académicos, de evaluación y
          certificación del evento por parte de la Gobernación del Cauca y
          Uniautónoma.
        </Casilla>

        <Casilla
          id="declara_veracidad"
          marcada={datos.declara_veracidad}
          alCambiar={(marcada) =>
            handleCheckboxChange("declara_veracidad", marcada)
          }
          error={errores.declara_veracidad}
        >
          Certifico bajo la gravedad de juramento que la información
          suministrada y los documentos adjuntos son legítimos, verídicos y
          corresponden a estudiantes con matrícula activa en el departamento del
          Cauca.
        </Casilla>

        <p className="aviso">
          <strong>Antes de radicar:</strong> al pulsar &quot;Radicar
          postulación&quot; el sistema te entrega un número de radicado único.
          No se admiten cambios a los datos enviados.
        </p>
      </section>
    </div>
  );
}
