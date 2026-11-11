"use client";

import { type ReactNode, useState } from "react";
import type { PostulacionAdminDetalle } from "@/app/actions/admin";
import type { AccionesPanel } from "@/components/admin/acciones";
import {
  contarFaltantes,
  type DocumentoEsperado,
  documentosEsperados,
  fechaLarga,
  formatearPeso,
  NIVEL_LARGO,
  tipoArchivo,
} from "@/components/admin/dominio";
import {
  IconoCheck,
  IconoCopiar,
  IconoDocumento,
  IconoExterno,
  IconoFalta,
} from "@/components/admin/iconos";

type P = PostulacionAdminDetalle;

function BotonCopiar({ texto, etiqueta }: { texto: string; etiqueta: string }) {
  const [copiado, setCopiado] = useState(false);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 1600);
    } catch {
      // Sin permiso de portapapeles el dato sigue visible y seleccionable.
    }
  };

  return (
    <button
      type="button"
      className="adm-copiar"
      onClick={copiar}
      aria-label={copiado ? `${etiqueta} copiado` : `Copiar ${etiqueta}`}
      title={copiado ? "Copiado" : "Copiar"}
    >
      {copiado ? <IconoCheck /> : <IconoCopiar />}
    </button>
  );
}

function Dato({
  etiqueta,
  children,
  copiar,
}: {
  etiqueta: string;
  children: ReactNode;
  copiar?: string;
}) {
  return (
    <div className="adm-dato">
      <dt>{etiqueta}</dt>
      <dd>
        <span>{children}</span>
        {copiar && <BotonCopiar texto={copiar} etiqueta={etiqueta} />}
      </dd>
    </div>
  );
}

/** El dominio no se parte: si el correo no cabe, baja completo a la segunda línea. */
function Correo({ valor }: { valor: string }) {
  const corte = valor.indexOf("@");
  if (corte < 0) return valor;
  return (
    <>
      {valor.slice(0, corte)}
      <span className="adm-correo-dominio">{valor.slice(corte)}</span>
    </>
  );
}

function Grupo({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="adm-grupo">
      <h3>{titulo}</h3>
      {children}
    </section>
  );
}

function ChequeoDocumentos({
  p,
  alVerDocumentos,
}: {
  p: P;
  alVerDocumentos: () => void;
}) {
  const esperados = documentosEsperados(p);
  const faltantes = contarFaltantes(p);
  const titulo =
    faltantes === 0
      ? `Documentos completos (${esperados.length})`
      : `Documentos: faltan ${faltantes} de ${esperados.length}`;

  return (
    <Grupo titulo={titulo}>
      <ul className="adm-chequeo">
        {esperados.map((d) => (
          <li key={d.tipo} data-falta={!d.archivo}>
            {d.archivo ? <IconoCheck /> : <IconoFalta />}
            <span>{d.nombre}</span>
            {!d.archivo && <em>Falta</em>}
          </li>
        ))}
      </ul>
      <button type="button" className="adm-enlace" onClick={alVerDocumentos}>
        Ver documentos
      </button>
    </Grupo>
  );
}

export function PestanaResumen({
  p,
  alVerDocumentos,
}: {
  p: P;
  alVerDocumentos: () => void;
}) {
  const evaluacion = p.evaluaciones;
  return (
    <div className="adm-hoja adm-resumen">
      <Grupo titulo="Docente tutor">
        <dl>
          <Dato etiqueta="Nombre">{p.tutor_nombre}</Dato>
          <Dato etiqueta="Correo" copiar={p.tutor_email}>
            <Correo valor={p.tutor_email} />
          </Dato>
          <Dato etiqueta="Teléfono" copiar={p.tutor_telefono}>
            {p.tutor_telefono}
          </Dato>
        </dl>
      </Grupo>
      <Grupo titulo="Institución">
        <dl>
          <Dato etiqueta="Nombre">{p.institucion_nombre}</Dato>
          <Dato etiqueta="Nivel">{NIVEL_LARGO[p.institucion_tipo]}</Dato>
          <Dato etiqueta="Semillero">{p.semillero_nombre}</Dato>
        </dl>
      </Grupo>
      <Grupo titulo="Fechas">
        <dl>
          <Dato etiqueta="Radicada el">{fechaLarga(p.created_at)}</Dato>
          <Dato etiqueta="Última actualización">
            {fechaLarga(p.updated_at)}
          </Dato>
          <Dato etiqueta="Evaluada el">
            {evaluacion ? (
              fechaLarga(evaluacion.evaluado_el)
            ) : (
              <span className="adm-suave">Sin evaluar</span>
            )}
          </Dato>
        </dl>
      </Grupo>
      <ChequeoDocumentos p={p} alVerDocumentos={alVerDocumentos} />
    </div>
  );
}

export function PestanaEquipo({ p }: { p: P }) {
  return (
    <ul className="adm-hoja adm-equipo">
      {p.integrantes.map((i) => (
        <li key={i.id}>
          <p className="adm-equipo-orden">
            Estudiante {i.orden_integrante}
            <span data-menor={i.es_menor_edad}>
              {i.es_menor_edad ? "Menor de edad" : "Mayor de edad"}
            </span>
          </p>
          <h3>{i.nombres_apellidos}</h3>
          <dl>
            <Dato etiqueta="Documento" copiar={i.numero_documento}>
              {i.tipo_documento} {i.numero_documento}
            </Dato>
            <Dato etiqueta="Correo" copiar={i.correo_electronico}>
              <Correo valor={i.correo_electronico} />
            </Dato>
            <Dato etiqueta="Teléfono" copiar={i.telefono}>
              {i.telefono}
            </Dato>
          </dl>
        </li>
      ))}
    </ul>
  );
}

export function PestanaMotivacion({ p }: { p: P }) {
  const texto = p.motivacion_intereses.trim();
  const palabras = texto === "" ? 0 : texto.split(/\s+/).length;
  return (
    <article className="adm-hoja adm-motivacion">
      <div className="adm-motivacion-texto">{p.motivacion_intereses}</div>
      <dl>
        <Dato etiqueta="Peso del criterio">30%</Dato>
        <Dato etiqueta="Palabras">{palabras}</Dato>
        <Dato etiqueta="Caracteres">{texto.length}</Dato>
      </dl>
    </article>
  );
}

function TarjetaDocumento({
  documento,
  cargando,
  alAbrir,
}: {
  documento: DocumentoEsperado;
  cargando: boolean;
  alAbrir: (ruta: string) => void;
}) {
  const { archivo } = documento;
  if (!archivo) {
    return (
      <li className="adm-documento" data-falta="true">
        <IconoFalta />
        <h3>{documento.nombre}</h3>
        <p>{documento.categoria} · Sin cargar</p>
      </li>
    );
  }
  return (
    <li className="adm-documento">
      <IconoDocumento />
      <h3>{documento.nombre}</h3>
      <p>
        {documento.categoria} · {tipoArchivo(archivo.mime_type)} ·{" "}
        {formatearPeso(archivo.tamano_bytes)}
      </p>
      <button
        type="button"
        className="adm-boton adm-boton-suave"
        disabled={cargando}
        onClick={() => alAbrir(archivo.storage_path)}
        aria-label={`Ver ${documento.nombre}`}
      >
        <IconoExterno />
        {cargando ? "Abriendo…" : "Ver documento"}
      </button>
    </li>
  );
}

function useAbrirDocumento(acciones: AccionesPanel) {
  const [cargando, setCargando] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const abrir = async (ruta: string) => {
    setCargando(ruta);
    setError(null);
    try {
      const res = await acciones.urlDocumento(ruta);
      if (res.success && res.data?.signedUrl) {
        window.open(res.data.signedUrl, "_blank", "noopener,noreferrer");
      } else {
        setError(res.error || "No se pudo obtener el documento.");
      }
    } catch (err) {
      console.error("Error al abrir el documento:", err);
      setError(
        "No pudimos abrir el documento. Revisa tu conexión e inténtalo de nuevo.",
      );
    } finally {
      setCargando(null);
    }
  };

  return { abrir, cargando, error };
}

export function PestanaDocumentos({
  p,
  acciones,
}: {
  p: P;
  acciones: AccionesPanel;
}) {
  const { abrir, cargando, error } = useAbrirDocumento(acciones);
  return (
    <>
      {error && (
        <p className="adm-aviso" role="alert">
          {error}
        </p>
      )}
      <ul className="adm-documentos">
        {documentosEsperados(p).map((d) => (
          <TarjetaDocumento
            key={d.tipo}
            documento={d}
            cargando={cargando === d.archivo?.storage_path}
            alAbrir={abrir}
          />
        ))}
      </ul>
    </>
  );
}
