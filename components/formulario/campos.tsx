"use client";

import type { ReactNode } from "react";

interface CampoBaseProps {
  id: string;
  etiqueta: string;
  error?: string | undefined;
  ayuda?: ReactNode;
  requerido?: boolean;
}

function Requerido({ requerido }: { requerido: boolean | undefined }) {
  if (!requerido) return null;
  return (
    <span className="campo-requerido" title="Obligatorio">
      {" "}
      *
    </span>
  );
}

function PieCampo({
  id,
  error,
  ayuda,
}: Pick<CampoBaseProps, "id" | "error" | "ayuda">) {
  return (
    <>
      {ayuda && !error && (
        <p id={`${id}-ayuda`} className="campo-ayuda">
          {ayuda}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="campo-error" role="alert">
          {error}
        </p>
      )}
    </>
  );
}

function describir(
  id: string,
  error: string | undefined,
  ayuda: ReactNode,
): string | undefined {
  if (error) return `${id}-error`;
  return ayuda ? `${id}-ayuda` : undefined;
}

interface CampoTextoProps extends CampoBaseProps {
  valor: string;
  alCambiar: (valor: string) => void;
  tipo?: "text" | "email" | "tel" | "number";
  marcador?: string;
  autocompletar?: string;
  modoEntrada?: "text" | "email" | "tel" | "numeric";
  longitudMaxima?: number;
}

export function CampoTexto({
  id,
  etiqueta,
  error,
  ayuda,
  requerido,
  valor,
  alCambiar,
  tipo = "text",
  marcador,
  autocompletar,
  modoEntrada,
  longitudMaxima,
}: CampoTextoProps) {
  return (
    <div>
      <label className="campo-etiqueta" htmlFor={id}>
        {etiqueta}
        <Requerido requerido={requerido} />
      </label>
      <div
        className="campo-caja"
        data-lleno={valor.trim() && !error ? "" : undefined}
      >
        <input
          id={id}
          className="campo-control"
          type={tipo}
          value={valor}
          required={requerido}
          placeholder={marcador}
          autoComplete={autocompletar}
          inputMode={modoEntrada}
          maxLength={longitudMaxima}
          aria-invalid={Boolean(error)}
          aria-describedby={describir(id, error, ayuda)}
          onChange={(evento) => alCambiar(evento.target.value)}
        />
      </div>
      <PieCampo id={id} error={error} ayuda={ayuda} />
    </div>
  );
}

interface CampoSelectorProps extends CampoBaseProps {
  valor: string;
  alCambiar: (valor: string) => void;
  opciones: readonly { valor: string; texto: string }[];
}

export function CampoSelector({
  id,
  etiqueta,
  error,
  ayuda,
  requerido,
  valor,
  alCambiar,
  opciones,
}: CampoSelectorProps) {
  return (
    <div>
      <label className="campo-etiqueta" htmlFor={id}>
        {etiqueta}
        <Requerido requerido={requerido} />
      </label>
      <select
        id={id}
        className="campo-control"
        value={valor}
        required={requerido}
        aria-invalid={Boolean(error)}
        aria-describedby={describir(id, error, ayuda)}
        onChange={(evento) => alCambiar(evento.target.value)}
      >
        {opciones.map((opcion) => (
          <option key={opcion.valor} value={opcion.valor}>
            {opcion.texto}
          </option>
        ))}
      </select>
      <PieCampo id={id} error={error} ayuda={ayuda} />
    </div>
  );
}

interface CampoAreaProps extends CampoBaseProps {
  valor: string;
  alCambiar: (valor: string) => void;
  marcador?: string;
  filas?: number;
  invalido?: boolean;
}

export function CampoArea({
  id,
  etiqueta,
  error,
  ayuda,
  requerido,
  valor,
  alCambiar,
  marcador,
  filas = 8,
  invalido = false,
}: CampoAreaProps) {
  return (
    <div>
      <label className="campo-etiqueta" htmlFor={id}>
        {etiqueta}
        <Requerido requerido={requerido} />
      </label>
      <textarea
        id={id}
        className="campo-control"
        rows={filas}
        value={valor}
        required={requerido}
        placeholder={marcador}
        aria-invalid={Boolean(error) || invalido}
        aria-describedby={describir(id, error, ayuda)}
        onChange={(evento) => alCambiar(evento.target.value)}
      />
      <PieCampo id={id} error={error} ayuda={ayuda} />
    </div>
  );
}

interface OpcionesProps {
  nombre: string;
  leyenda: string;
  valor: string;
  alCambiar: (valor: string) => void;
  opciones: readonly { valor: string; texto: string; detalle?: string }[];
  error?: string | undefined;
}

/** Opción única con filas grandes: más cómodas que un selector en el móvil. */
export function GrupoOpciones({
  nombre,
  leyenda,
  valor,
  alCambiar,
  opciones,
  error,
}: OpcionesProps) {
  return (
    <fieldset className="grupo-opciones">
      <legend className="campo-etiqueta">{leyenda}</legend>
      <div className="grupo-opciones-lista">
        {opciones.map((opcion) => (
          <label key={opcion.valor} className="opcion">
            <input
              type="radio"
              name={nombre}
              value={opcion.valor}
              checked={valor === opcion.valor}
              onChange={() => alCambiar(opcion.valor)}
            />
            <span className="opcion-marca" aria-hidden="true" />
            <span>
              <strong>{opcion.texto}</strong>
              {opcion.detalle && <small>{opcion.detalle}</small>}
            </span>
          </label>
        ))}
      </div>
      {error && (
        <p className="campo-error" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}

interface CasillaProps {
  id: string;
  marcada: boolean;
  alCambiar: (marcada: boolean) => void;
  children: ReactNode;
  error?: string | undefined;
}

export function Casilla({
  id,
  marcada,
  alCambiar,
  children,
  error,
}: CasillaProps) {
  return (
    <div>
      <label className="opcion" htmlFor={id}>
        <input
          id={id}
          type="checkbox"
          checked={marcada}
          aria-invalid={Boolean(error)}
          onChange={(evento) => alCambiar(evento.target.checked)}
        />
        <span
          className="opcion-marca opcion-marca-casilla"
          aria-hidden="true"
        />
        <span>{children}</span>
      </label>
      {error && (
        <p className="campo-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/** Encabezado común de cada paso. */
export function TituloPaso({
  titulo,
  children,
}: {
  titulo: string;
  children: ReactNode;
}) {
  return (
    <header className="paso-cabeza">
      <h2 className="text-titulo">{titulo}</h2>
      <p className="text-entrada">{children}</p>
    </header>
  );
}
