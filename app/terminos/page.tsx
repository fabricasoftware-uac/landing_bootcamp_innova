import type { Metadata } from "next";
import { SeccionLegal } from "@/components/legal/bloques-legales";
import { PaginaLegal } from "@/components/legal/pagina-legal";
import { FECHA_ACTUALIZACION, responsables } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Términos y condiciones de uso · Cauca INNOVA",
  description:
    "Condiciones para usar el sitio web de la convocatoria Cauca INNOVA para semilleros de investigación del Cauca.",
};

const indice = [
  { id: "sitio", etiqueta: "Qué es este sitio" },
  { id: "aceptacion", etiqueta: "Aceptación" },
  { id: "uso", etiqueta: "Buen uso" },
  { id: "postulacion", etiqueta: "Postulación" },
  { id: "electronico", etiqueta: "Mensajes electrónicos" },
  { id: "autor", etiqueta: "Derechos de autor" },
  { id: "enlaces", etiqueta: "Enlaces a otros sitios" },
  { id: "disponibilidad", etiqueta: "Disponibilidad y errores" },
  { id: "privacidad", etiqueta: "Datos personales y cookies" },
  { id: "cambios", etiqueta: "Cambios" },
  { id: "ley", etiqueta: "Ley aplicable y contacto" },
];

export default function TerminosPage() {
  return (
    <PaginaLegal
      titulo="Términos y condiciones de uso"
      entrada="Las reglas para usar este sitio web. Las condiciones para participar en la convocatoria están en los términos de referencia."
      actualizacion={FECHA_ACTUALIZACION}
      indice={indice}
    >
      <SeccionLegal id="sitio" titulo="Qué es este sitio">
        <p>
          Este sitio informa sobre la convocatoria Cauca INNOVA para semilleros
          de investigación y recibe las postulaciones de los equipos. Lo
          disponen la Gobernación del Cauca, por medio de su Secretaría de
          Desarrollo Económico y Competitividad, y la Corporación Universitaria
          Autónoma del Cauca.
        </p>
      </SeccionLegal>

      <SeccionLegal id="aceptacion" titulo="Aceptación">
        <p>
          Al usar el sitio aceptas estas condiciones. Si no estás de acuerdo, te
          pedimos no usarlo. Participar en la convocatoria tiene sus propias
          reglas, publicadas en los{" "}
          <a href="/terminos-de-referencia">términos de referencia</a>.
        </p>
      </SeccionLegal>

      <SeccionLegal id="uso" titulo="Buen uso">
        <p>Al usar el sitio te comprometes a no:</p>
        <ul>
          <li>Entregar información falsa o suplantar a otra persona.</li>
          <li>
            Registrar datos de terceros sin su conocimiento y permiso, ni subir
            documentos ajenos sin autorización.
          </li>
          <li>Subir archivos con programas dañinos.</li>
          <li>
            Intentar entrar al panel de evaluación o a datos de otras personas
            sin autorización.
          </li>
          <li>
            Afectar el funcionamiento del sitio, por ejemplo con envíos
            automáticos masivos.
          </li>
        </ul>
      </SeccionLegal>

      <SeccionLegal id="postulacion" titulo="Postulación">
        <p>
          Una postulación radicada recibe un número de radicado y no se puede
          modificar desde el formulario. Radicar no garantiza la selección: la
          participación depende del cumplimiento de los requisitos y de la
          confirmación oficial de la organización.
        </p>
        <p>
          Quien envía el formulario responde por la veracidad de lo que declara
          y de los documentos que adjunta.
        </p>
      </SeccionLegal>

      <SeccionLegal id="electronico" titulo="Mensajes electrónicos">
        <p>
          Las casillas que marcas y la información que envías por el formulario
          son mensajes de datos. Según el artículo 5 de la Ley 527 de 1999, no
          se les niegan efectos jurídicos, validez ni fuerza obligatoria por el
          solo hecho de estar en esa forma.
        </p>
      </SeccionLegal>

      <SeccionLegal id="autor" titulo="Derechos de autor">
        <p>
          Los textos, el diseño y los elementos gráficos de este sitio, así como
          los logos de las entidades, pertenecen a sus titulares y están
          protegidos por la Ley 23 de 1982 y las normas sobre marcas. No puedes
          reproducirlos ni modificarlos para otros fines sin autorización.
          Puedes compartir enlaces al sitio y descargar los documentos de la
          convocatoria para consultarlos.
        </p>
        <p>
          Algunas fotografías y videos son de terceros y se usan con sus
          licencias. Los créditos están en el pie de página.
        </p>
        <p>
          Lo que un equipo cree para la convocatoria sigue las reglas de los
          términos de referencia: participar no transfiere automáticamente los
          derechos de propiedad intelectual de los estudiantes o de sus
          instituciones.
        </p>
      </SeccionLegal>

      <SeccionLegal id="enlaces" titulo="Enlaces a otros sitios">
        <p>
          El sitio puede enlazar a páginas de otras entidades. Cada una tiene
          sus propias condiciones y políticas, y no controlamos su contenido.
        </p>
      </SeccionLegal>

      <SeccionLegal id="disponibilidad" titulo="Disponibilidad y errores">
        <p>
          Procuramos mantener el sitio disponible y la información al día, pero
          puede haber interrupciones, fallas técnicas o errores. Cuando un error
          impida radicar, conservarás lo escrito en el formulario mientras no
          cierres la página. Te recomendamos no dejar la postulación para el
          último momento.
        </p>
        <p>Lo anterior no limita los derechos que te reconoce la ley.</p>
      </SeccionLegal>

      <SeccionLegal id="privacidad" titulo="Datos personales y cookies">
        <p>
          El uso de tus datos se explica en la{" "}
          <a href="/privacidad">política de tratamiento de datos personales</a>,
          y lo que el sitio guarda en tu navegador, en la{" "}
          <a href="/cookies">política de cookies</a>.
        </p>
      </SeccionLegal>

      <SeccionLegal id="cambios" titulo="Cambios">
        <p>
          Podemos actualizar estas condiciones. La versión vigente es la que
          aparece aquí, con su fecha de actualización.
        </p>
      </SeccionLegal>

      <SeccionLegal id="ley" titulo="Ley aplicable y contacto">
        <p>Estas condiciones se rigen por las leyes de Colombia.</p>
        <p>Para escribirnos sobre este sitio:</p>
        <ul>
          {responsables.map(({ clave, nombre, correoDatos }) => (
            <li key={clave}>
              {nombre}
              {correoDatos && (
                <>
                  : <a href={`mailto:${correoDatos}`}>{correoDatos}</a>
                </>
              )}
            </li>
          ))}
        </ul>
      </SeccionLegal>
    </PaginaLegal>
  );
}
