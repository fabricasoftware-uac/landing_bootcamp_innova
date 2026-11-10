import { SiluetaCauca } from "@/components/sitio/pieza-cauca";
import { ESTADO_CONVOCATORIA } from "@/lib/config/convocatoria";
import { paginaTerminos } from "@/lib/contenido";

export function ConvocatoriaCerrada() {
  return (
    <article
      className="convocatoria-cerrada"
      aria-labelledby="titulo-convocatoria-cerrada"
    >
      <header className="convocatoria-cerrada-cabecera">
        <div className="convocatoria-cerrada-pildora">
          <span className="pildora-punto" aria-hidden="true" />
          <span>{ESTADO_CONVOCATORIA.badge} · Convocatoria Cerrada</span>
        </div>
        <div className="sello sello-comprobante" aria-hidden="true">
          <SiluetaCauca clase="sello-mapa" />
          <span>Cauca INNOVA</span>
        </div>
      </header>

      <div className="convocatoria-cerrada-cuerpo">
        <h2 id="titulo-convocatoria-cerrada" className="text-titulo">
          {ESTADO_CONVOCATORIA.tituloCierre}
        </h2>

        <p className="convocatoria-cerrada-mensaje">
          {ESTADO_CONVOCATORIA.mensajeCierre}
        </p>

        <p className="convocatoria-cerrada-subtitulo">
          {ESTADO_CONVOCATORIA.subtituloCierre}
        </p>

        <section
          className="convocatoria-cerrada-cronograma"
          aria-labelledby="titulo-cronograma-cierre"
        >
          <div className="cronograma-cabeza">
            <svg
              className="cronograma-icono"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <h3 id="titulo-cronograma-cierre">Cronograma y próximas etapas</h3>
          </div>

          <ol className="cronograma-lista">
            {ESTADO_CONVOCATORIA.cronograma.map((item, index) => {
              const esCompletado = item.estado === "completado";
              const esEnProceso = item.estado === "en_proceso";

              return (
                <li
                  key={item.hito}
                  className="cronograma-paso"
                  data-estado={item.estado}
                >
                  <div className="cronograma-indicador" aria-hidden="true">
                    <span className="cronograma-numero">{index + 1}</span>
                    {index < ESTADO_CONVOCATORIA.cronograma.length - 1 && (
                      <span className="cronograma-linea" />
                    )}
                  </div>
                  <div className="cronograma-contenido">
                    <div className="cronograma-info">
                      <strong className="cronograma-hito">{item.hito}</strong>
                      <span className="cronograma-fecha">{item.fecha}</span>
                    </div>
                    <span
                      className="cronograma-badge"
                      data-estado={item.estado}
                    >
                      {esCompletado && "Finalizado"}
                      {esEnProceso && "En proceso"}
                      {!esCompletado && !esEnProceso && "Próximamente"}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <aside className="convocatoria-cerrada-aviso">
          <svg
            className="aviso-icono"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <p>
            Los resultados oficiales y las instrucciones de la jornada serán
            notificados a los correos electrónicos de los tutores y estudiantes
            de los semilleros postulados.
          </p>
        </aside>

        <div className="convocatoria-cerrada-acciones">
          <a className="boton boton-lima boton-grande" href="/">
            <span aria-hidden="true">←</span> Volver al inicio
          </a>
          <a className="boton boton-suave" href={paginaTerminos}>
            Términos de referencia
          </a>
          <a
            className="enlace-texto"
            href="/documentos/terminos-de-referencia.pdf"
            download
          >
            Descargar PDF oficial
          </a>
        </div>
      </div>
    </article>
  );
}
