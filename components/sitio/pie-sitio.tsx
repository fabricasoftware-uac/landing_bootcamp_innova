import { paginaTerminos } from "@/lib/contenido";
import { BotonSubir } from "./boton-subir";
import { Credito } from "./con-credito";
import { ControlMovimiento } from "./control-movimiento";
import { LogoCauca, LogoMascara } from "./logos";
import { VideoPerezoso } from "./video-perezoso";

const LEGALES = [
  ["Términos de referencia", paginaTerminos],
  ["Privacidad y datos personales", "/privacidad"],
  ["Términos de uso", "/terminos"],
  ["Cookies", "/cookies"],
] as const;

export function PieSitio() {
  return (
    <>
      <div className="pie-centinela" aria-hidden="true" />
      <footer className="pie" data-tema="oscuro" data-pie data-barra="abierta">
        <VideoPerezoso
          nombre="pie"
          clase="pie-video"
          centinela=".pie-centinela"
        />
        <div className="pie-velo" />
        <Credito medio="pie" />

        <div className="pie-contenido">
          <h2 className="pie-titulo" data-titular>
            Nos vemos <span className="acento">creando.</span>
          </h2>
          <a className="pie-postular" href="/postulacion">
            Postular a mi equipo <span aria-hidden="true">→</span>
          </a>
        </div>

        <div className="pie-base">
          <div className="pie-marcas">
            <LogoMascara nombre="uniautonoma" clase="logo-uni" />
            <LogoCauca />
            <LogoMascara nombre="gobernacion" clase="logo-gob" />
          </div>
          <nav className="pie-legales" aria-label="Documentos legales">
            {LEGALES.map(([texto, ruta]) => (
              <a key={ruta} href={ruta}>
                {texto}
              </a>
            ))}
            <ControlMovimiento />
          </nav>
          <div className="pie-autoria">
            <p>
              Creado por{" "}
              <a
                href="https://www.fabsoft.app/"
                target="_blank"
                rel="noreferrer"
              >
                la Fábrica de Software
              </a>
            </p>
            <p>
              Powered by{" "}
              <a
                href="https://www.emprendelab-web.com/"
                target="_blank"
                rel="noreferrer"
              >
                Emprendelab
              </a>{" "}
              y{" "}
              <a
                href="https://portal.uniautonoma.edu.co/"
                target="_blank"
                rel="noreferrer"
              >
                Uniautónoma del Cauca
              </a>
            </p>
          </div>
        </div>
      </footer>
      <BotonSubir />
    </>
  );
}
