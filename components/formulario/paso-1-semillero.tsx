"use client";

import { CampoTexto, GrupoOpciones, TituloPaso } from "./campos";
import type { PasoProps } from "./tipos";

const TIPOS_INSTITUCION = [
  {
    valor: "basica_media",
    texto: "Educación básica y media",
    detalle: "Colegios públicos y privados del Cauca",
  },
  {
    valor: "superior",
    texto: "Educación superior",
    detalle: "Universidades e instituciones técnicas o tecnológicas",
  },
] as const;

export function Paso1Semillero({
  datos,
  actualizarDatos,
  errores = {},
  limpiarError,
}: PasoProps) {
  const handleChange = (campo: keyof typeof datos, valor: string) => {
    actualizarDatos({ [campo]: valor });
    limpiarError?.(campo);
  };

  return (
    <div className="paso">
      <TituloPaso titulo="Tu semillero">
        Cuéntanos de qué institución y semillero vienen, y quién es el docente
        que avala al equipo.
      </TituloPaso>

      <section className="paso-bloque" aria-labelledby="bloque-institucion">
        <h3 id="bloque-institucion">Institución educativa</h3>
        <CampoTexto
          id="institucion_nombre"
          etiqueta="Nombre de la institución"
          requerido
          valor={datos.institucion_nombre}
          alCambiar={(valor) => handleChange("institucion_nombre", valor)}
          error={errores.institucion_nombre}
          marcador="Por ejemplo: Institución Educativa Técnica San José"
        />
        <GrupoOpciones
          nombre="institucion_tipo"
          leyenda="Nivel de la institución"
          valor={datos.institucion_tipo}
          alCambiar={(valor) => handleChange("institucion_tipo", valor)}
          opciones={TIPOS_INSTITUCION}
          error={errores.institucion_tipo}
        />
        <CampoTexto
          id="semillero_nombre"
          etiqueta="Nombre del semillero de investigación"
          requerido
          valor={datos.semillero_nombre}
          alCambiar={(valor) => handleChange("semillero_nombre", valor)}
          error={errores.semillero_nombre}
          marcador="Por ejemplo: Semillero de Robótica y Sostenibilidad"
        />
      </section>

      <section className="paso-bloque" aria-labelledby="bloque-tutor">
        <h3 id="bloque-tutor">Datos del tutor</h3>
        <p>
          El tutor es el docente que da el aval académico a los tres
          estudiantes.
        </p>
        <div className="paso-rejilla">
          <div className="ancho-completo">
            <CampoTexto
              id="tutor_nombre"
              etiqueta="Nombre y apellidos del tutor"
              requerido
              autocompletar="name"
              valor={datos.tutor_nombre}
              alCambiar={(valor) => handleChange("tutor_nombre", valor)}
              error={errores.tutor_nombre}
            />
          </div>
          <CampoTexto
            id="tutor_email"
            etiqueta="Correo de contacto"
            requerido
            tipo="email"
            autocompletar="email"
            valor={datos.tutor_email}
            alCambiar={(valor) => handleChange("tutor_email", valor)}
            error={errores.tutor_email}
            marcador="docente@institucion.edu.co"
          />
          <CampoTexto
            id="tutor_telefono"
            etiqueta="Celular de contacto"
            requerido
            tipo="tel"
            autocompletar="tel"
            valor={datos.tutor_telefono}
            alCambiar={(valor) => handleChange("tutor_telefono", valor)}
            error={errores.tutor_telefono}
            marcador="310 123 4567"
          />
        </div>
      </section>
    </div>
  );
}
