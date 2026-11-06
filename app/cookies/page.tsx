import type { Metadata } from "next";
import { SeccionLegal } from "@/components/legal/bloques-legales";
import { PaginaLegal } from "@/components/legal/pagina-legal";
import { FECHA_ACTUALIZACION } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Política de cookies · Cauca INNOVA",
  description:
    "Qué guarda el sitio de Cauca INNOVA en tu navegador, para qué sirve, cuánto dura y cómo borrarlo.",
};

const indice = [
  { id: "que-son", etiqueta: "Qué son" },
  { id: "que-usamos", etiqueta: "Qué guarda este sitio" },
  { id: "que-no", etiqueta: "Qué no usamos" },
  { id: "control", etiqueta: "Cómo borrarlo" },
  { id: "cambios", etiqueta: "Cambios" },
];

export default function CookiesPage() {
  return (
    <PaginaLegal
      titulo="Política de cookies y almacenamiento local"
      entrada="Lo poco que este sitio guarda en tu navegador, explicado sin rodeos."
      actualizacion={FECHA_ACTUALIZACION}
      indice={indice}
    >
      <SeccionLegal id="que-son" titulo="Qué son">
        <p>
          Las cookies son pequeños archivos que un sitio guarda en tu navegador.
          El almacenamiento local cumple una función parecida: deja una nota en
          tu dispositivo para que el sitio la lea después, sin enviarla a
          nuestros servidores.
        </p>
      </SeccionLegal>

      <SeccionLegal id="que-usamos" titulo="Qué guarda este sitio">
        <p>
          Solo lo necesario para que el sitio funcione y para recordar tus
          preferencias:
        </p>
        <ul>
          <li>
            <strong>Preferencias de visita:</strong> si ya viste la animación de
            entrada, si prefieres reducir el movimiento y si cerraste este
            aviso.
          </li>
          <li>
            <strong>Borrador del formulario:</strong> lo que escribes en la
            postulación se guarda solo en tu dispositivo por un máximo de 24
            horas, para que no lo pierdas si se recarga la página o se va el
            internet. No incluye tus documentos adjuntos y se borra al radicar.
            En un equipo compartido, usa "Empezar de cero" antes de irte.
          </li>
          <li>
            <strong>Sesión del panel:</strong> mantiene la sesión de quienes
            evalúan las postulaciones. No aplica a quienes visitan el sitio o se
            postulan.
          </li>
        </ul>
      </SeccionLegal>

      <SeccionLegal id="que-no" titulo="Qué no usamos">
        <p>
          A la fecha de esta política, el sitio no usa cookies de analítica, de
          publicidad ni de redes sociales, y no hace seguimiento de tu
          navegación entre sitios. Si eso cambia, actualizaremos esta página y
          te pediremos tu permiso antes, cuando corresponda.
        </p>
      </SeccionLegal>

      <SeccionLegal id="control" titulo="Cómo borrarlo">
        <p>
          Puedes borrar las cookies y los datos del sitio desde la configuración
          de tu navegador, o bloquearlos. El sitio seguirá funcionando para
          informarte y postular, pero olvidará tus preferencias: la animación de
          entrada volverá a verse, el borrador del formulario se perderá y este
          aviso reaparecerá. Bloquear las cookies impide entrar al panel de
          evaluación.
        </p>
      </SeccionLegal>

      <SeccionLegal id="cambios" titulo="Cambios">
        <p>
          Si el sitio empieza a guardar algo nuevo, lo agregaremos a esta lista
          y cambiaremos la fecha de actualización. Para saber cómo tratamos los
          datos de la postulación, lee la{" "}
          <a href="/privacidad">política de tratamiento de datos personales</a>.
        </p>
      </SeccionLegal>
    </PaginaLegal>
  );
}
