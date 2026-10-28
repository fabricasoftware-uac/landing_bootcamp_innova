import {
  agenda,
  criterios,
  documentos,
  documentoTerminos,
  pasos,
  preguntas,
  requisitos,
} from "@/lib/contenido";
import { ImpresoraInteractiva } from "./impresora-interactiva";
import { MarcoSitio } from "./marco-sitio";
import { Portada } from "./portada";
import { RecorridoCreativo } from "./recorrido-creativo";

export function Landing() {
  return (
    <MarcoSitio>
      <Portada />
      <RecorridoCreativo />
      <section className="equipos chapter" aria-labelledby="equipos-title">
        <div className="section-top">
          <span>Talento que se encuentra</span>
          <span>Semilleros del Cauca</span>
        </div>
        <div className="equipos-poster">
          <strong aria-hidden="true">7</strong>
          <div>
            <h2 id="equipos-title">
              <span className="sr-only">7 </span>
              EQUIPOS.
              <br />
              MUCHAS
              <br />
              <em>POSIBILIDADES.</em>
            </h2>
            <p>
              Tres estudiantes por equipo. Máximo 21 participantes de semilleros
              de colegios e instituciones de educación superior del Cauca.
            </p>
          </div>
        </div>
        <p className="caption">
          Una postulación por equipo. La participación requiere revisión de
          requisitos y confirmación oficial.
        </p>
      </section>
      <section
        className="lab chapter"
        id="laboratorio"
        aria-labelledby="lab-title"
      >
        <div className="section-top">
          <span>El laboratorio</span>
          <span>Las ideas también se tocan</span>
        </div>
        <div className="lab-layout">
          <div>
            <h2 id="lab-title">
              DEL «¿Y SI?»
              <br />
              AL <em>«LO HICIMOS».</em>
            </h2>
            <p>
              Una pregunta. Un intento. Otra forma de hacerlo. Aquí el
              conocimiento se convierte en una solución.
            </p>
            <p>
              Activa la máquina y mira cómo una idea toma forma, capa a capa.
            </p>
            <small>Un prototipo digital para empezar a experimentar.</small>
          </div>
          <ImpresoraInteractiva />
        </div>
      </section>
      <section
        className="agenda chapter"
        id="agenda"
        aria-labelledby="agenda-title"
      >
        <div className="section-top">
          <span>Dos jornadas presenciales</span>
          <span>13 y 14 de noviembre de 2026</span>
        </div>
        <div className="agenda-layout">
          <div>
            <h2 id="agenda-title">
              DOS DÍAS.
              <br />
              <em>MODO CREAR.</em>
            </h2>
            <p>
              Formación, ideación, mentorías y prototipado para explorar retos
              reales del territorio.
            </p>
            <div className="agenda-date">
              13—14
              <span>
                NOVIEMBRE
                <br />
                2026
              </span>
            </div>
            <small>
              Asistencia a las dos jornadas completas. Sede y horarios por
              publicar.
            </small>
          </div>
          <ol className="agenda-list">
            {agenda.map((item, i) => (
              <li key={item.titulo}>
                <span className="step-number">0{i + 1}</span>
                <div>
                  <h3>{item.titulo}</h3>
                  <p>{item.texto}</p>
                </div>
                <span aria-hidden="true">↗</span>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section
        className="preparation chapter"
        id="preparacion"
        aria-labelledby="preparacion-title"
      >
        <div className="section-top">
          <span>Participa</span>
          <span>Una postulación. Tres estudiantes.</span>
        </div>
        <div className="section-heading">
          <h2 id="preparacion-title">
            EL SIGUIENTE
            <br />
            PASO ES <em>JUNTOS.</em>
          </h2>
          <p>
            Reúne a tu equipo y prepara los documentos. El formulario oficial y
            los plazos están pendientes de publicación por la organización.
          </p>
        </div>
        <div className="preparation-details">
          <details open>
            <summary>
              Requisitos para participar <span aria-hidden="true">+</span>
            </summary>
            <ul>
              {requisitos.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </details>
          <details>
            <summary>
              Documentos de la postulación <span aria-hidden="true">+</span>
            </summary>
            <ul>
              {documentos.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </details>
        </div>
        <ol className="participation-steps">
          {pasos.map((paso) => (
            <li key={paso}>{paso}</li>
          ))}
        </ol>
        <a className="button" href={documentoTerminos} download>
          Descargar términos (DOCX) <span aria-hidden="true">↗</span>
        </a>
      </section>
      <section
        className="selection chapter"
        id="seleccion"
        aria-labelledby="seleccion-title"
      >
        <div className="section-top">
          <span>Así se selecciona</span>
          <span>Si las postulaciones superan los cupos</span>
        </div>
        <div className="selection-layout">
          <div>
            <h2 id="seleccion-title">
              TU EQUIPO.
              <br />
              <em>SU POTENCIAL.</em>
            </h2>
            <p>
              Requisitos y documentación completa son habilitantes. Estos
              criterios se aplican a la selección de postulaciones habilitadas.
            </p>
            <p>
              Las condiciones de evaluación final y premiación serán comunicadas
              por la organización.
            </p>
          </div>
          <table>
            <caption>Criterios de selección de equipos</caption>
            <thead>
              <tr>
                <th scope="col">Criterio</th>
                <th scope="col">Peso</th>
              </tr>
            </thead>
            <tbody>
              {criterios.map(([criterio, peso]) => (
                <tr key={criterio}>
                  <th scope="row">{criterio}</th>
                  <td>{peso}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row">Total</th>
                <td>100 %</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
      <section
        className="faq chapter"
        id="preguntas"
        aria-labelledby="faq-title"
      >
        <div>
          <span>Antes de lanzarte</span>
          <h2 id="faq-title">
            BUENAS
            <br />
            <em>PREGUNTAS.</em>
          </h2>
          <p>Lo que sabemos y lo que falta por confirmar.</p>
        </div>
        <div className="faq-list">
          {preguntas.map((p) => (
            <details key={p.q} name="preguntas">
              <summary>
                {p.q}
                <span aria-hidden="true">+</span>
              </summary>
              <p>{p.a}</p>
            </details>
          ))}
        </div>
      </section>
    </MarcoSitio>
  );
}
