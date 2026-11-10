"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ESTADO_CONVOCATORIA } from "@/lib/config/convocatoria";
import { enlacesSeccion } from "@/lib/contenido";
import { MarcaAnimada } from "./marca-animada";
import { MenuCompleto } from "./menu-completo";

type Tema = "claro" | "oscuro" | "lima";

const SELECTOR = "[data-tema]";
const LINEA = 50;

function esTema(valor: string | undefined): valor is Tema {
  return valor === "claro" || valor === "oscuro" || valor === "lima";
}

/** Banda de 2 px bajo la barra: no mide nada y funciona con secciones fijadas al scroll. */
function useSeccionBajoCabecera() {
  const [tema, setTema] = useState<Tema>("claro");
  const [abierta, setAbierta] = useState(false);

  useEffect(() => {
    const dentro = new Map<Element, boolean>();
    const decidir = () => {
      let elegido: HTMLElement | null = null;
      // El pie va fijo detrás del contenido y siempre corta la banda: solo cuenta si no hay nada más.
      const seccionEncima = [...dentro].some(
        ([nodo, corta]) =>
          corta && (nodo as HTMLElement).dataset.pie === undefined,
      );
      for (const [nodo, corta] of dentro) {
        if (!corta) continue;
        if (seccionEncima && (nodo as HTMLElement).dataset.pie !== undefined) {
          continue;
        }
        if (
          !elegido ||
          elegido.compareDocumentPosition(nodo) &
            Node.DOCUMENT_POSITION_FOLLOWING
        ) {
          elegido = nodo as HTMLElement;
        }
      }
      if (!elegido) return;
      const valor = elegido.dataset.tema;
      if (esTema(valor)) setTema(valor);
      setAbierta(elegido.dataset.barra === "abierta");
    };
    const abajo = Math.max(0, window.innerHeight - LINEA - 2);
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          dentro.set(entrada.target, entrada.isIntersecting);
        }
        decidir();
      },
      { rootMargin: `-${LINEA}px 0px -${abajo}px 0px` },
    );
    for (const nodo of document.querySelectorAll(SELECTOR)) {
      observador.observe(nodo);
    }
    return () => observador.disconnect();
  }, []);

  return { tema, abierta };
}

/** La barra acompaña toda la lectura: Postular siempre queda a la mano. */
function useDesplazada(): boolean {
  const [desplazada, setDesplazada] = useState(false);

  useEffect(() => {
    let cuadro = 0;
    const medir = () => {
      cuadro = 0;
      setDesplazada(window.scrollY > 40);
    };
    const programar = () => {
      if (!cuadro) cuadro = requestAnimationFrame(medir);
    };
    medir();
    window.addEventListener("scroll", programar, { passive: true });
    return () => {
      cancelAnimationFrame(cuadro);
      window.removeEventListener("scroll", programar);
    };
  }, []);

  return desplazada;
}

export function CabeceraSitio({
  enInicio = false,
  sinPostular = false,
}: {
  enInicio?: boolean;
  sinPostular?: boolean;
}) {
  const prefijo = enInicio ? "" : "/";
  const { tema, abierta } = useSeccionBajoCabecera();
  const [menu, setMenu] = useState<"cerrado" | "abierto" | "cerrando">(
    "cerrado",
  );
  const desplazada = useDesplazada();
  const boton = useRef<HTMLButtonElement>(null);
  const abierto = menu === "abierto";
  const conMenu = menu !== "cerrado";

  const cerrar = useCallback(() => {
    setMenu("cerrando");
    requestAnimationFrame(() => boton.current?.focus({ preventScroll: true }));
  }, []);
  const terminarCierre = useCallback(() => setMenu("cerrado"), []);

  return (
    <>
      <header
        className="cabecera"
        data-tema-actual={conMenu ? "oscuro" : tema}
        data-velo={desplazada && !abierta && !conMenu ? "" : undefined}
        data-menu={conMenu ? "" : undefined}
      >
        <div className="cabecera-fila">
          <a
            className="cabecera-marca"
            href={`${prefijo}#inicio`}
            aria-label="Bootcamp Cauca INNOVA, inicio"
          >
            <MarcaAnimada />
          </a>
          <nav className="cabecera-enlaces" aria-label="Accesos principales">
            {enlacesSeccion.map(({ texto, id }) => (
              <a key={id} href={`${prefijo}#${id}`} data-texto={texto}>
                <span>{texto}</span>
              </a>
            ))}
          </nav>
          <div className="cabecera-derecha">
            {!sinPostular && (
              <a
                className={`cabecera-postular ${!ESTADO_CONVOCATORIA.abierta ? "cabecera-postular-cerrada" : ""}`}
                href="/postulacion"
              >
                {ESTADO_CONVOCATORIA.abierta ? (
                  <>
                    Inscribirse <span aria-hidden="true">→</span>
                  </>
                ) : (
                  <>
                    <span
                      className="cabecera-punto-cerrado"
                      aria-hidden="true"
                    />
                    Cupos agotados
                  </>
                )}
              </a>
            )}
            <button
              ref={boton}
              type="button"
              className="hamburguesa"
              data-abierta={conMenu ? "" : undefined}
              aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={abierto}
              aria-controls="menu-principal"
              onClick={() => (abierto ? cerrar() : setMenu("abierto"))}
            >
              <i />
              <i />
            </button>
          </div>
        </div>
      </header>
      <MenuCompleto
        prefijo={prefijo}
        abierto={abierto}
        alCerrar={cerrar}
        alTerminarCierre={terminarCierre}
      />
    </>
  );
}
