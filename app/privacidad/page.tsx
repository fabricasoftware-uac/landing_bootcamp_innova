import type { Metadata } from "next";
import {
  DatoPublicable,
  EnlaceExterno,
  SeccionLegal,
  TablaLegal,
} from "@/components/legal/bloques-legales";
import { PaginaLegal } from "@/components/legal/pagina-legal";
import {
  FECHA_ACTUALIZACION,
  plazoConservacion,
  type ResponsableTratamiento,
  regionAlmacenamiento,
  responsables,
} from "@/lib/legal";

export const metadata: Metadata = {
  title: "Política de tratamiento de datos · Cauca INNOVA",
  description:
    "Qué datos personales recoge la convocatoria Cauca INNOVA, para qué se usan, quién responde por ellos y cómo ejercer tus derechos.",
};

const indice = [
  { id: "responsables", etiqueta: "Quién responde por tus datos" },
  { id: "encargados", etiqueta: "Quién más los trata" },
  { id: "datos", etiqueta: "Qué datos recogemos" },
  { id: "finalidades", etiqueta: "Para qué los usamos" },
  { id: "autorizacion", etiqueta: "Tu autorización" },
  { id: "menores", etiqueta: "Menores de edad" },
  { id: "sensibles", etiqueta: "Datos sensibles" },
  { id: "derechos", etiqueta: "Tus derechos" },
  { id: "ejercer", etiqueta: "Cómo ejercerlos y en qué plazos" },
  { id: "conservacion", etiqueta: "Cuánto tiempo los guardamos" },
  { id: "seguridad", etiqueta: "Cómo los protegemos" },
  { id: "imagen", etiqueta: "Fotos, videos y divulgación" },
  { id: "vigencia", etiqueta: "Vigencia y cambios" },
];

const datosRecogidos = [
  [
    "Institución y semillero",
    "Nombre y tipo de institución, nombre del semillero.",
  ],
  ["Docente tutor", "Nombre, correo electrónico y teléfono."],
  [
    "Tres estudiantes",
    "Nombres y apellidos, tipo y número de documento, correo electrónico, teléfono e indicación de si es menor de edad.",
  ],
  ["Motivación", "El texto del equipo sobre sus intereses y motivaciones."],
  [
    "Documentos adjuntos",
    "Copia del documento de identidad de cada estudiante, aval del semillero y, cuando hay menores de edad, la autorización del padre, la madre o el representante legal.",
  ],
  [
    "Evaluación",
    "Verificación de requisitos, puntajes, observaciones y estado de la postulación, registrados por el comité.",
  ],
] as const;

function FichaResponsable({
  responsable,
}: {
  responsable: ResponsableTratamiento;
}) {
  const { nombre, nit, dependencia, domicilio, direccion } = responsable;
  const { correoDatos, telefono, sitio, politicas } = responsable;
  return (
    <div className="legal-responsable">
      <h3>{nombre}</h3>
      <dl>
        <dt>NIT</dt>
        <dd>
          <DatoPublicable valor={nit} />
        </dd>
        {dependencia && (
          <>
            <dt>Dependencia a cargo</dt>
            <dd>{dependencia}</dd>
          </>
        )}
        <dt>Domicilio</dt>
        <dd>{domicilio}</dd>
        <dt>Dirección</dt>
        <dd>
          <DatoPublicable valor={direccion} />
        </dd>
        <dt>Correo para datos personales</dt>
        <dd>
          {correoDatos ? (
            <a href={`mailto:${correoDatos}`}>{correoDatos}</a>
          ) : (
            <DatoPublicable valor={null} />
          )}
        </dd>
        <dt>Teléfono</dt>
        <dd>
          <DatoPublicable valor={telefono} />
        </dd>
        <dt>Sitio web</dt>
        <dd>
          <EnlaceExterno href={sitio}>{sitio}</EnlaceExterno>
        </dd>
      </dl>
      <ul>
        {politicas.map(({ nombre: titulo, url }) => (
          <li key={url}>
            <EnlaceExterno href={url}>{titulo}</EnlaceExterno>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function PrivacidadPage() {
  return (
    <PaginaLegal
      titulo="Política de tratamiento de datos personales"
      entrada="Qué datos pedimos para la convocatoria Cauca INNOVA, para qué los usamos y cómo puedes decidir sobre ellos."
      actualizacion={FECHA_ACTUALIZACION}
      indice={indice}
    >
      <p>
        Esta política aplica a los datos que se entregan en el formulario de
        postulación de este sitio. Se rige por la Ley Estatutaria 1581 de 2012 y
        por el Decreto 1377 de 2013, compilado en el Decreto 1074 de 2015.
      </p>

      <SeccionLegal id="responsables" titulo="Quién responde por tus datos">
        <p>
          La convocatoria la organizan la Gobernación del Cauca y la Corporación
          Universitaria Autónoma del Cauca, y ambas deciden sobre el uso de
          estos datos. Por eso actúan como responsables del tratamiento. Puedes
          dirigirte a cualquiera de las dos.
        </p>
        {responsables.map((responsable) => (
          <FichaResponsable key={responsable.clave} responsable={responsable} />
        ))}
        <p>
          Cada entidad tiene además su propia política institucional. Esta
          página explica cómo se aplican a esta convocatoria.
        </p>
      </SeccionLegal>

      <SeccionLegal id="encargados" titulo="Quién más los trata">
        <p>
          Un encargado es quien trata datos por cuenta del responsable,
          siguiendo sus instrucciones. Para esta convocatoria, Supabase presta
          el servicio de base de datos, almacenamiento de archivos e inicio de
          sesión del panel de evaluación.
        </p>
        <p>
          Los servidores de Supabase pueden estar fuera de Colombia. Región de
          almacenamiento: <DatoPublicable valor={regionAlmacenamiento} />.
          Enviar datos a un encargado fuera del país para que los trate por
          cuenta del responsable se conoce como transmisión internacional, y el
          encargado solo puede usarlos para los fines de esta política.
        </p>
        <p>
          Las personas que evalúan acceden a los datos con una cuenta autorizada
          por la organización.
        </p>
      </SeccionLegal>

      <SeccionLegal id="datos" titulo="Qué datos recogemos">
        <TablaLegal
          descripcion="Datos que recoge la convocatoria"
          encabezados={["Sobre", "Datos"]}
        >
          {datosRecogidos.map(([sobre, datos]) => (
            <tr key={sobre}>
              <td>{sobre}</td>
              <td>{datos}</td>
            </tr>
          ))}
        </TablaLegal>
        <p>
          El sistema también guarda la fecha de la postulación y le asigna un
          número de radicado.
        </p>
      </SeccionLegal>

      <SeccionLegal id="finalidades" titulo="Para qué los usamos">
        <p>
          Usamos los datos para los fines organizativos, académicos, de
          evaluación y certificación de la convocatoria:
        </p>
        <ul>
          <li>Recibir y radicar la postulación de cada equipo.</li>
          <li>Verificar los requisitos y los documentos.</li>
          <li>
            Evaluar y seleccionar las postulaciones habilitadas, y manejar la
            lista de espera si la hay.
          </li>
          <li>
            Contactar al equipo y a su tutor para aclaraciones, resultados y
            confirmación de participación.
          </li>
          <li>
            Organizar la jornada, por ejemplo con listas de asistencia, y
            preparar informes de la convocatoria para las entidades
            organizadoras.
          </li>
          <li>Expedir el diploma o certificado de participación.</li>
        </ul>
        <p>
          No usamos estos datos para otros fines sin informarte y pedir tu
          autorización cuando se necesite.
        </p>
      </SeccionLegal>

      <SeccionLegal id="autorizacion" titulo="Tu autorización">
        <p>
          Antes de radicar, el formulario pide marcar una casilla que autoriza
          este tratamiento. Sin esa autorización no se puede enviar la
          postulación. Marcarla es una decisión tuya: el silencio o no responder
          nunca cuenta como autorización.
        </p>
        <p>
          Si registras datos de otra persona, como tus compañeros de equipo o tu
          tutor, hazlo solo con su conocimiento y permiso.
        </p>
      </SeccionLegal>

      <SeccionLegal id="menores" titulo="Menores de edad">
        <p>
          La ley protege de manera especial los datos de niñas, niños y
          adolescentes. Solo los tratamos cuando el uso responde a su interés
          superior y respeta sus derechos fundamentales (Ley 1581 de 2012,
          artículo 7; Decreto 1074 de 2015, artículo 2.2.2.25.2.9; Ley 1098 de
          2006, artículo 33).
        </p>
        <p>
          La autorización la da su padre, madre o representante legal, después
          de escuchar la opinión del menor y valorarla según su madurez,
          autonomía y capacidad para entender el asunto. Por eso, si algún
          integrante es menor de edad, el formulario exige adjuntar esa
          autorización firmada.
        </p>
        <p>
          Las familias pueden ejercer los derechos de esta política en nombre
          del menor.
        </p>
      </SeccionLegal>

      <SeccionLegal id="sensibles" titulo="Datos sensibles">
        <p>
          El formulario no pregunta por origen étnico, salud, religión, opinión
          política ni datos parecidos. Sin embargo, la copia de un documento de
          identidad puede mostrar fotografía, firma o huella, y la ley considera
          sensibles los datos biométricos.
        </p>
        <p>
          No estás obligado a autorizar el tratamiento de datos sensibles, ni a
          responder preguntas sobre datos sensibles o datos de menores de edad.
          Debes saber que los documentos de identidad hacen parte de los
          requisitos del formulario, así que sin ellos la postulación no puede
          radicarse. Si tienes dudas, escribe antes de enviarla a uno de los
          correos de esta página.
        </p>
      </SeccionLegal>

      <SeccionLegal id="derechos" titulo="Tus derechos">
        <p>Como titular de los datos tienes derecho a:</p>
        <ul>
          <li>Conocer, actualizar y rectificar tus datos.</li>
          <li>Pedir prueba de la autorización que diste.</li>
          <li>Saber, si lo pides, cómo se han usado tus datos.</li>
          <li>
            Revocar la autorización o pedir que se supriman tus datos. Esto no
            procede cuando exista un deber legal o contractual de conservarlos.
          </li>
          <li>Acceder gratis a tus datos personales.</li>
          <li>
            Presentar quejas ante la Superintendencia de Industria y Comercio,
            después de haber hecho tu consulta o reclamo ante los responsables.
          </li>
        </ul>
        <p>
          El formulario no se puede editar después de radicado, pero sí puedes
          pedir que corrijan tus datos personales por los canales de esta
          página. Si retiras la autorización durante la convocatoria, es posible
          que la postulación no pueda seguir su evaluación.
        </p>
      </SeccionLegal>

      <SeccionLegal id="ejercer" titulo="Cómo ejercerlos y en qué plazos">
        <p>
          Escribe a uno de los correos para datos personales de esta página.
          Pueden hacerlo el titular, sus causahabientes o su representante,
          demostrando su identidad o representación. Indica tu nombre, el número
          de radicado si lo tienes, qué pides y cómo quieres recibir la
          respuesta.
        </p>
        <h3>Consultas</h3>
        <p>
          Para saber qué datos tenemos sobre ti. Se responden en máximo 10 días
          hábiles desde que se reciben. Si no es posible, te avisamos el motivo
          y la nueva fecha, que no puede pasar de 5 días hábiles más.
        </p>
        <h3>Reclamos</h3>
        <p>
          Para corregir, actualizar o suprimir datos, revocar la autorización o
          avisar de un incumplimiento. Se responden en máximo 15 días hábiles
          desde el día siguiente a recibirlos. Si no es posible, te avisamos el
          motivo y la nueva fecha, que no puede pasar de 8 días hábiles más.
        </p>
        <p>
          Si el reclamo está incompleto, te pedimos completarlo dentro de los 5
          días siguientes. Si pasan 2 meses sin respuesta tuya, se entiende que
          desististe. Si quien lo recibe no es competente, lo traslada en máximo
          2 días hábiles y te informa.
        </p>
      </SeccionLegal>

      <SeccionLegal id="conservacion" titulo="Cuánto tiempo los guardamos">
        <p>
          Guardamos los datos mientras sean necesarios para la convocatoria, la
          certificación y las obligaciones legales, contractuales o de archivo
          que apliquen. Después se suprimen.
        </p>
        <p>
          Plazo de conservación: <DatoPublicable valor={plazoConservacion} />.
        </p>
      </SeccionLegal>

      <SeccionLegal id="seguridad" titulo="Cómo los protegemos">
        <p>
          Mientras diligencias el formulario, lo que escribes se guarda solo en
          tu dispositivo por un máximo de 24 horas para que no lo pierdas. Tus
          documentos adjuntos no se guardan así, y el borrador se elimina al
          radicar.
        </p>
        <p>
          Aplicamos medidas técnicas y administrativas para reducir el riesgo de
          pérdida o acceso indebido. Ningún sistema está libre de riesgo, y
          estas son las medidas concretas de este sitio:
        </p>
        <ul>
          <li>Los documentos adjuntos se guardan en un depósito privado.</li>
          <li>
            Solo las cuentas con rol de administración pueden consultar las
            postulaciones.
          </li>
          <li>
            Cada documento se abre con un enlace temporal que vence a los 5
            minutos.
          </li>
          <li>
            El comité puede exportar la información a una hoja de cálculo para
            su trabajo. Ese archivo debe manejarse con la misma reserva.
          </li>
        </ul>
      </SeccionLegal>

      <SeccionLegal id="imagen" titulo="Fotos, videos y divulgación">
        <p>
          Postular no autoriza el uso de tu imagen. Si la organización quiere
          usar fotografías, videos o información de las propuestas para
          divulgación institucional, pedirá una autorización independiente,
          respetando la protección de datos personales. Para menores de edad,
          esa autorización la da su representante legal.
        </p>
      </SeccionLegal>

      <SeccionLegal id="vigencia" titulo="Vigencia y cambios">
        <p>
          Esta política rige desde la fecha de actualización que aparece al
          inicio de la página. La base de datos de la convocatoria estará
          vigente durante el tiempo indicado en la sección sobre conservación.
        </p>
        <p>
          Si hacemos un cambio importante, lo avisaremos antes de aplicarlo por
          un medio eficiente, como esta página o los datos de contacto
          registrados.
        </p>
      </SeccionLegal>
    </PaginaLegal>
  );
}
