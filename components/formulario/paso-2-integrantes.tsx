"use client";

import {
  TIPOS_DOCUMENTO_IDENTIDAD,
  type TipoDocumentoIdentidad,
} from "@/lib/validations/postulacion";
import { CampoSelector, CampoTexto, Casilla, TituloPaso } from "./campos";
import type { PasoProps } from "./tipos";

const ETIQUETAS_DOCUMENTO: Record<TipoDocumentoIdentidad, string> = {
  TI: "Tarjeta de identidad (TI)",
  CC: "Cédula de ciudadanía (CC)",
  CE: "Cédula de extranjería (CE)",
  Pasaporte: "Pasaporte",
};

const OPCIONES_DOCUMENTO = TIPOS_DOCUMENTO_IDENTIDAD.map((tipo) => ({
  valor: tipo,
  texto: ETIQUETAS_DOCUMENTO[tipo],
}));

const INDICES = [0, 1, 2] as const;

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

  // El validador puede reportar la ruta con punto o con corchetes.
  const getError = (indice: number, campo: string) =>
    errores[`integrantes.${indice}.${campo}`] ||
    errores[`integrantes[${indice}].${campo}`];

  const hayMenoresDeEdad = datos.integrantes.some((i) => i.es_menor_edad);

  return (
    <div className="paso">
      <TituloPaso titulo="Tu equipo">
        Son exactamente 3 estudiantes del semillero, matriculados en una
        institución del Cauca.
      </TituloPaso>

      {errores.integrantes && (
        <p className="aviso aviso-alerta" role="alert">
          {errores.integrantes}
        </p>
      )}

      {hayMenoresDeEdad && (
        <p className="aviso">
          Marcaste a alguien menor de 18 años. En el paso de documentos te
          pediremos la autorización firmada por su madre, padre o representante
          legal.
        </p>
      )}

      {INDICES.map((indice) => {
        const integrante = datos.integrantes[indice];
        const prefijo = `integrante_${indice}`;

        return (
          <section
            key={prefijo}
            className="paso-bloque"
            data-lleno={integrante.nombres_apellidos.trim() ? "" : undefined}
            aria-labelledby={`${prefijo}_titulo`}
          >
            <h3 id={`${prefijo}_titulo`}>
              <span aria-hidden="true">{indice + 1}</span>
              {integrante.nombres_apellidos.trim() ||
                `Estudiante ${indice + 1}`}
            </h3>
            <div className="paso-rejilla">
              <div className="ancho-completo">
                <CampoTexto
                  id={`${prefijo}_nombres`}
                  etiqueta="Nombres y apellidos completos"
                  requerido
                  valor={integrante.nombres_apellidos}
                  alCambiar={(valor) =>
                    actualizarIntegrante(indice, "nombres_apellidos", valor)
                  }
                  error={getError(indice, "nombres_apellidos")}
                />
              </div>
              <CampoSelector
                id={`${prefijo}_tipo_doc`}
                etiqueta="Tipo de documento"
                requerido
                valor={integrante.tipo_documento}
                alCambiar={(valor) =>
                  actualizarIntegrante(
                    indice,
                    "tipo_documento",
                    valor as TipoDocumentoIdentidad,
                  )
                }
                opciones={OPCIONES_DOCUMENTO}
                error={getError(indice, "tipo_documento")}
              />
              <CampoTexto
                id={`${prefijo}_numero_doc`}
                etiqueta="Número de documento"
                requerido
                valor={integrante.numero_documento}
                alCambiar={(valor) =>
                  actualizarIntegrante(indice, "numero_documento", valor)
                }
                error={getError(indice, "numero_documento")}
              />
              <CampoTexto
                id={`${prefijo}_correo`}
                etiqueta="Correo electrónico"
                requerido
                tipo="email"
                valor={integrante.correo_electronico}
                alCambiar={(valor) =>
                  actualizarIntegrante(indice, "correo_electronico", valor)
                }
                error={getError(indice, "correo_electronico")}
                marcador="estudiante@correo.com"
              />
              <CampoTexto
                id={`${prefijo}_telefono`}
                etiqueta="Celular"
                requerido
                tipo="tel"
                valor={integrante.telefono}
                alCambiar={(valor) =>
                  actualizarIntegrante(indice, "telefono", valor)
                }
                error={getError(indice, "telefono")}
                marcador="312 456 7890"
              />
              <div className="ancho-completo">
                <Casilla
                  id={`${prefijo}_menor`}
                  marcada={integrante.es_menor_edad}
                  alCambiar={(marcada) =>
                    actualizarIntegrante(indice, "es_menor_edad", marcada)
                  }
                >
                  Esta persona es menor de 18 años
                </Casilla>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
