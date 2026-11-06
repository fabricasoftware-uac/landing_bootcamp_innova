import { LogoCauca, LogoMascara } from "@/components/sitio/logos";

const CLAVE_INTRO = "cauca-intro-v3";

/*
 * La marca debe existir antes de pintar: si esperara a la hidratación, quien ya vio
 * la intro la vería un instante. Solo se marca al inicio para no cortarla a mitad.
 */
const SCRIPT_INTRO = `try{if(sessionStorage.getItem("${CLAVE_INTRO}")){document.documentElement.dataset.intro="no"}sessionStorage.setItem("${CLAVE_INTRO}","1")}catch(e){}var r=matchMedia("(prefers-reduced-motion: reduce)").matches;try{r=r||localStorage.getItem("cauca-movimiento")==="reducido"}catch(e){}document.documentElement.dataset.escenas=r?"no":"si"`;

const CAPAS = ["uno", "dos", "tres", "cuatro", "lima", "seis"] as const;

const LOGOS_CARGA = [
  "/logos/uniautonoma-grifo.svg",
  "/logos/uniautonoma-letras.svg",
  "/logos/gobernacion-compacto.svg",
];

/**
 * Solo CSS: la salida está en la propia animación, así que no puede quedarse
 * bloqueando la página aunque falle el JavaScript.
 */
export function CargaInicial() {
  return (
    <>
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: script fijo sin datos externos */}
      <script dangerouslySetInnerHTML={{ __html: SCRIPT_INTRO }} />
      {LOGOS_CARGA.map((logo) => (
        <link
          key={logo}
          rel="preload"
          as="image"
          href={logo}
          crossOrigin="anonymous"
        />
      ))}
      <div className="carga" aria-hidden="true">
        <div className="carga-logos">
          <div className="carga-uni">
            <LogoMascara nombre="uniautonoma-grifo" clase="carga-grifo" />
            <LogoMascara nombre="uniautonoma-letras" clase="carga-letras" />
          </div>
          <div className="carga-cauca">
            <LogoCauca />
          </div>
          <div className="carga-gobernacion">
            <LogoMascara nombre="gobernacion-compacto" />
          </div>
        </div>
        <div className="carga-capas">
          {CAPAS.map((capa, indice) => (
            <span
              key={capa}
              className={`carga-capa carga-${capa}`}
              style={{ animationDelay: `${120 + indice * 130}ms` }}
            />
          ))}
        </div>
      </div>
    </>
  );
}
