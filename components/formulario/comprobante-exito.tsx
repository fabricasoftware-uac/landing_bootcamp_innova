"use client";

import { SiluetaCauca } from "@/components/sitio/pieza-cauca";
import type { ExitoPostulacionProps } from "./tipos";

const DOCUMENTOS_BASE = [
  "Aval institucional del semillero",
  "Documento de identidad, estudiante 1",
  "Documento de identidad, estudiante 2",
  "Documento de identidad, estudiante 3",
] as const;

const PIXELES = Array.from({ length: 28 }, (_, indice) => indice);

export function ComprobanteExito({
  resultado,
  datos,
  alReiniciar,
}: ExitoPostulacionProps) {
  const fecha = new Date().toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const hayMenores = datos.integrantes.some((i) => i.es_menor_edad);
  const nivel =
    datos.institucion_tipo === "basica_media"
      ? "Básica y media"
      : "Educación superior";

  return (
    <div className="comprobante-zona">
      <div className="fiesta" aria-hidden="true">
        {PIXELES.map((pixel) => (
          <i key={pixel} style={{ "--n": pixel } as React.CSSProperties} />
        ))}
      </div>
      <article className="comprobante" aria-labelledby="titulo-comprobante">
        <p className="sello sello-comprobante">
          <SiluetaCauca clase="sello-mapa" />
          Radicado
        </p>
        <h2 id="titulo-comprobante" className="text-titulo">
          Quedó radicada
        </h2>
        <p className="mt-4 text-entrada">
          Tu semillero ya está en la convocatoria del Bootcamp Cauca INNOVA.
          Guarda este número.
        </p>

        <div className="comprobante-numero">
          <span>Número de radicado</span>
          <strong>{resultado.radicado_codigo}</strong>
          <span>{fecha}</span>
        </div>

        <dl className="comprobante-datos">
          <div>
            <dt>Institución</dt>
            <dd>
              {resultado.institucion_nombre}
              <small>{nivel}</small>
            </dd>
          </div>
          <div>
            <dt>Semillero</dt>
            <dd>
              {resultado.semillero_nombre}
              <small>
                Tutor: {datos.tutor_nombre}, {datos.tutor_email}
              </small>
            </dd>
          </div>
          <div>
            <dt>Equipo</dt>
            <dd>
              <ol>
                {datos.integrantes.map((integrante) => (
                  <li key={integrante.numero_documento}>
                    {integrante.nombres_apellidos}
                    <small>
                      {integrante.tipo_documento} {integrante.numero_documento}{" "}
                      · {integrante.es_menor_edad ? "Menor" : "Mayor"} de edad
                    </small>
                  </li>
                ))}
              </ol>
            </dd>
          </div>
          <div>
            <dt>Documentos recibidos</dt>
            <dd>
              <ul>
                {DOCUMENTOS_BASE.map((documento) => (
                  <li key={documento}>{documento}</li>
                ))}
                {hayMenores && <li>Autorización de padres o acudientes</li>}
              </ul>
            </dd>
          </div>
        </dl>

        <p className="comprobante-nota">
          Ahora se revisan los requisitos. Si hay más equipos que cupos se
          aplican los criterios de selección. Los resultados y la agenda de la
          jornada del 14 de noviembre llegarán a los correos registrados.
        </p>
      </article>

      <div className="comprobante-acciones">
        <button
          type="button"
          className="boton boton-lima"
          onClick={() => window.print()}
        >
          Imprimir comprobante
        </button>
        <a className="boton boton-suave" href="/">
          Volver al inicio
        </a>
        <button type="button" className="enlace-texto" onClick={alReiniciar}>
          Registrar otra postulación
        </button>
      </div>
    </div>
  );
}
