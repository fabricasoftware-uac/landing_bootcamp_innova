"use client";

import { useRef } from "react";
import { Credito } from "@/components/sitio/con-credito";
import { VideoPerezoso } from "@/components/sitio/video-perezoso";
import {
  criterios,
  documentos,
  paginaTerminos,
  pasosRecorrido,
} from "@/lib/contenido";
import { gsap, prefiereMenosMovimiento, useGSAP } from "@/lib/motion";

const PESO_POR_CAPA = 2.5;

/** Cada criterio es una columna impresa: una capa por cada 2,5 % de su peso. */
function GraficoPesos() {
  return (
    <div className="pesos">
      <table className="sr-only">
        <caption>Criterios de selección de equipos</caption>
        <thead>
          <tr>
            <th scope="col">Criterio</th>
            <th scope="col">Peso</th>
          </tr>
        </thead>
        <tbody>
          {criterios.map(({ texto, peso }) => (
            <tr key={texto}>
              <th scope="row">{texto}</th>
              <td>{peso} %</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pesos-grafico" aria-hidden="true">
        {criterios.map(({ nombre, texto, peso }) => (
          <div
            key={nombre}
            className="peso"
            data-mayor={peso === 30 ? "" : undefined}
          >
            <p className="peso-valor">
              <span data-peso={peso}>{peso}</span> %
            </p>
            <div className="peso-pila">
              {Array.from({ length: peso / PESO_POR_CAPA }, (_, capa) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: capas idénticas y fijas
                <i key={capa} />
              ))}
            </div>
            <p className="peso-nombre">{nombre}</p>
            <p className="peso-detalle">{texto}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContenidoPaso({ indice }: { indice: number }) {
  if (indice === 1) {
    return (
      <ul className="lista-puntos">
        {documentos.map((documento) => (
          <li key={documento}>{documento}</li>
        ))}
      </ul>
    );
  }
  if (indice === 3) return <GraficoPesos />;
  return null;
}

/** Las capas se tienden de abajo arriba, una a cada lado, como la boquilla. */
function animarPesos(disparo: ScrollTrigger.Vars): void {
  for (const [orden, peso] of gsap.utils
    .toArray<HTMLElement>(".peso")
    .entries()) {
    const capas = peso.querySelectorAll(".peso-pila i");
    const valor = peso.querySelector<HTMLElement>("[data-peso]");
    const final = Number(valor?.dataset.peso);
    const contador = { valor: 0 };
    const escena = { trigger: ".pesos-grafico", once: true, ...disparo };
    gsap.fromTo(
      capas,
      { scaleX: 0 },
      {
        scaleX: 1,
        delay: orden * 0.22,
        duration: 0.32,
        ease: "power2.out",
        stagger: 0.07,
        scrollTrigger: escena,
      },
    );
    gsap.to(contador, {
      valor: final,
      delay: orden * 0.22,
      duration: capas.length * 0.07 + 0.3,
      ease: "none",
      onUpdate: () => {
        if (valor) valor.textContent = String(Math.round(contador.valor));
      },
      scrollTrigger: escena,
    });
  }
}

/** La pista avanza de lado con el scroll mientras un filamento se imprime debajo. */
function animarPista(raiz: HTMLElement): void {
  const pista = raiz.querySelector<HTMLElement>(".recorrido-pista");
  if (!pista) return;
  const distancia = () => pista.scrollWidth - window.innerWidth;
  raiz.style.setProperty("--recorrido-largo", `${distancia()}px`);
  const avance = gsap.to(pista, {
    x: () => -distancia(),
    ease: "none",
    scrollTrigger: {
      trigger: raiz,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.6,
      invalidateOnRefresh: true,
    },
  });
  gsap.fromTo(
    ".recorrido-filamento-linea",
    { scaleX: 0 },
    {
      scaleX: 1,
      ease: "none",
      scrollTrigger: {
        trigger: raiz,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.3,
      },
    },
  );
  gsap.fromTo(
    ".recorrido-boquilla",
    { left: "0%" },
    {
      left: "100%",
      ease: "none",
      scrollTrigger: {
        trigger: raiz,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.3,
      },
    },
  );
  animarPesos({ containerAnimation: avance, start: "left 80%" });
  for (const panel of gsap.utils.toArray<HTMLElement>(".recorrido-panel")) {
    const video = panel.querySelector<HTMLElement>(".recorrido-medio-interior");
    const palabra = panel.querySelector<HTMLElement>(".recorrido-verbo");
    const disparo = {
      trigger: panel,
      containerAnimation: avance,
      start: "left right",
      end: "right left",
      scrub: true,
    };
    if (video) {
      gsap.fromTo(
        video,
        { xPercent: -12 },
        { xPercent: 12, ease: "none", scrollTrigger: disparo },
      );
    }
    if (palabra) {
      gsap.fromTo(
        palabra,
        { xPercent: 26 },
        { xPercent: -26, ease: "none", scrollTrigger: disparo },
      );
    }
  }
}

export function Recorrido() {
  const raiz = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefiereMenosMovimiento() || !raiz.current) return;
      const mm = gsap.matchMedia();
      mm.add("(min-width: 900px)", () => {
        if (raiz.current) animarPista(raiz.current);
      });
      mm.add("(max-width: 899px)", () => {
        animarPesos({ start: "top 80%" });
      });
      return () => mm.revert();
    },
    { scope: raiz },
  );

  return (
    <section
      ref={raiz}
      id="recorrido"
      className="recorrido"
      data-tema="oscuro"
      aria-labelledby="titulo-recorrido"
    >
      <div className="recorrido-fijo">
        <div className="recorrido-pista">
          <div className="recorrido-apertura">
            <h2 id="titulo-recorrido" className="text-portada">
              Así llegas
              <span className="acento">a la jornada.</span>
            </h2>
            <p className="text-entrada">
              Cuatro movimientos, desde reunir a tu equipo hasta la selección.
            </p>
          </div>

          {pasosRecorrido.map((paso, indice) => (
            <article
              key={paso.verbo}
              className="recorrido-panel"
              data-grafico={indice === 3 ? "" : undefined}
            >
              <p className="recorrido-verbo" aria-hidden="true">
                {paso.verbo}
              </p>
              <figure className="recorrido-medio con-credito">
                <div className="recorrido-medio-interior">
                  <VideoPerezoso nombre={paso.video} clase="recorrido-video" />
                </div>
                <Credito medio={paso.video} />
              </figure>
              <div className="recorrido-hoja">
                <p className="recorrido-numero">
                  {indice + 1} de {pasosRecorrido.length}
                </p>
                <h3>{paso.titulo}</h3>
                <p>{paso.texto}</p>
                <ContenidoPaso indice={indice} />
              </div>
            </article>
          ))}

          <div className="recorrido-cierre">
            <h3>¿Listos para innovar?</h3>
            <a className="boton boton-lima boton-grande" href="/postulacion">
              Inscribir a mi equipo <span className="flecha">→</span>
            </a>
            <a className="enlace-banner" href={paginaTerminos}>
              Leer los términos de referencia
            </a>
          </div>
        </div>

        <div className="recorrido-filamento" aria-hidden="true">
          <span className="recorrido-filamento-linea" />
          <span className="recorrido-boquilla" />
        </div>
      </div>
    </section>
  );
}
