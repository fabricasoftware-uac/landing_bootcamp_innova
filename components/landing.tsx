import { AccesoPostular } from "@/components/sitio/acceso-postular";
import { CabeceraSitio } from "@/components/sitio/cabecera-sitio";
import { PieSitio } from "@/components/sitio/pie-sitio";
import { CargaInicial } from "./landing/carga-inicial";
import { Cifras } from "./landing/cifras";
import { EscenaProceso } from "./landing/escena-proceso";
import { JornadaTiquetes } from "./landing/jornada-tiquetes";
import { MapaCauca } from "./landing/mapa-cauca";
import { Movimiento } from "./landing/movimiento";
import { Portada } from "./landing/portada";
import { PreguntasFrecuentes } from "./landing/preguntas-frecuentes";
import { PreparaExpediente } from "./landing/prepara-expediente";
import { Recorrido } from "./landing/recorrido";

export function Landing() {
  return (
    <div id="inicio">
      <CargaInicial />
      <a className="saltar" href="#jornada">
        Saltar al contenido
      </a>
      <CabeceraSitio enInicio />
      <main className="contenido">
        <Portada />
        <Cifras />
        <JornadaTiquetes />
        <MapaCauca />
        <EscenaProceso />
        <PreparaExpediente />
        <Recorrido />
        <PreguntasFrecuentes />
      </main>
      <AccesoPostular />
      <PieSitio />
      <Movimiento />
    </div>
  );
}
