"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import {
  type DocumentoEsperado,
  formatearPeso,
  tipoArchivo,
} from "@/components/admin/dominio";
import {
  IconoCerrar,
  IconoDescarga,
  IconoExterno,
} from "@/components/admin/iconos";

interface VisorDocumentoModalProps {
  documento: DocumentoEsperado;
  alCerrar: () => void;
}

const SELECTOR_FOCO =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function atraparFoco(e: KeyboardEvent, contenedor: HTMLElement) {
  const elementos = Array.from(
    contenedor.querySelectorAll<HTMLElement>(SELECTOR_FOCO),
  ).filter((el) => el.offsetParent !== null);

  const primero = elementos[0];
  const ultimo = elementos[elementos.length - 1];

  if (!primero || !ultimo) {
    e.preventDefault();
    return;
  }

  const activo = document.activeElement;
  if (e.shiftKey && (activo === primero || activo === contenedor)) {
    e.preventDefault();
    ultimo.focus();
  } else if (!e.shiftKey && activo === ultimo) {
    e.preventDefault();
    primero.focus();
  }
}

export function VisorDocumentoModal({
  documento,
  alCerrar,
}: VisorDocumentoModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const reducido = useReducedMotion();
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState(false);

  const archivo = documento.archivo;

  useEffect(() => {
    const previo = document.activeElement as HTMLElement | null;
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    panelRef.current?.focus();

    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        alCerrar();
      } else if (e.key === "Tab" && panelRef.current) {
        atraparFoco(e, panelRef.current);
      }
    };

    document.addEventListener("keydown", alTeclear);
    return () => {
      document.removeEventListener("keydown", alTeclear);
      document.body.style.overflow = overflowPrevio;
      previo?.focus();
    };
  }, [alCerrar]);

  if (!archivo) return null;

  const urlDocumento = `/api/admin/documento?path=${encodeURIComponent(archivo.storage_path)}`;
  const urlDescarga = `${urlDocumento}&descargar=1`;

  const mime = archivo.mime_type.toLowerCase();
  const ruta = archivo.storage_path.toLowerCase();
  const esPdf = mime.includes("pdf") || ruta.endsWith(".pdf");
  const esImagen =
    mime.startsWith("image/") || /\.(png|jpe?g|webp)$/i.test(ruta);

  return (
    <div
      className="adm-visor-telon"
      onClick={alCerrar}
      onKeyDown={(e) => {
        if (e.key === "Escape") alCerrar();
      }}
      role="presentation"
    >
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-visor-documento"
        tabIndex={-1}
        className="adm-visor-modal"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: reducido ? 1 : 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: reducido ? 1 : 0.98 }}
        transition={{ duration: reducido ? 0.01 : 0.16 }}
      >
        <header className="adm-visor-cabecera">
          <div className="adm-visor-info">
            <h3 id="titulo-visor-documento">{documento.nombre}</h3>
            <p className="adm-suave">
              {documento.categoria} · {tipoArchivo(archivo.mime_type)} ·{" "}
              {formatearPeso(archivo.tamano_bytes)}
            </p>
          </div>
          <div className="adm-visor-acciones">
            <a
              href={urlDocumento}
              target="_blank"
              rel="noopener noreferrer"
              className="adm-boton adm-boton-suave"
              title="Abrir en pestaña nueva"
            >
              <IconoExterno />
              <span className="adm-solo-ancho">Abrir en pestaña</span>
            </a>
            <a
              href={urlDescarga}
              className="adm-boton adm-boton-suave"
              title="Descargar archivo"
            >
              <IconoDescarga />
              <span className="adm-solo-ancho">Descargar</span>
            </a>
            <button
              type="button"
              className="adm-boton adm-boton-icono"
              onClick={alCerrar}
              aria-label="Cerrar visor de documento"
              title="Cerrar (Escape)"
            >
              <IconoCerrar />
            </button>
          </div>
        </header>

        <div className="adm-visor-cuerpo">
          {cargando && !errorCarga && (
            <div className="adm-visor-cargando" aria-live="polite">
              <div className="adm-visor-spinner" aria-hidden="true" />
              <span>Cargando vista previa…</span>
            </div>
          )}

          {errorCarga ? (
            <div className="adm-visor-error" role="alert">
              <p>
                No se pudo mostrar la vista previa en el navegador. Puedes abrir
                el documento directamente o descargarlo.
              </p>
              <div className="adm-visor-error-acciones">
                <a
                  href={urlDocumento}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="adm-boton adm-boton-primario"
                >
                  <IconoExterno />
                  Abrir en pestaña nueva
                </a>
                <a href={urlDescarga} className="adm-boton adm-boton-suave">
                  <IconoDescarga />
                  Descargar archivo
                </a>
              </div>
            </div>
          ) : esPdf ? (
            <iframe
              src={urlDocumento}
              className="adm-visor-iframe"
              title={`Vista previa de ${documento.nombre}`}
              onLoad={() => setCargando(false)}
              onError={() => {
                setCargando(false);
                setErrorCarga(true);
              }}
            />
          ) : esImagen ? (
            <div className="adm-visor-img-contenedor">
              <img
                src={urlDocumento}
                alt={documento.nombre}
                className="adm-visor-img"
                onLoad={() => setCargando(false)}
                onError={() => {
                  setCargando(false);
                  setErrorCarga(true);
                }}
              />
            </div>
          ) : (
            <div className="adm-visor-formato-no-soportado">
              <p>
                Este tipo de archivo no cuenta con vista previa en el navegador.
              </p>
              <a
                href={urlDescarga}
                className="adm-boton adm-boton-primario"
                onClick={() => setCargando(false)}
              >
                <IconoDescarga />
                Descargar documento
              </a>
            </div>
          )}
        </div>

        <footer className="adm-visor-pie">
          <p className="adm-suave">
            ¿Tienes problemas con la vista previa?{" "}
            <a
              href={urlDocumento}
              target="_blank"
              rel="noopener noreferrer"
              className="adm-enlace"
            >
              Abrir en pestaña nueva
            </a>{" "}
            o{" "}
            <a href={urlDescarga} className="adm-enlace">
              descargar archivo
            </a>
            .
          </p>
        </footer>
      </motion.div>
    </div>
  );
}
