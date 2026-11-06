"use client";

import type { ReactNode } from "react";
import type { PostulacionAdminDetalle } from "@/app/actions/admin";
import {
  contarMenores,
  ETIQUETA_NIVEL,
  fechaCorta,
  ORDEN_ESTADO,
  puntajeTotal,
} from "@/components/admin/dominio";
import { EstadoMarca } from "@/components/admin/estado-marca";
import {
  IconoChevronDerecha,
  IconoFlechaDerecha,
  IconoOrden,
} from "@/components/admin/iconos";

export type ColumnaOrden =
  | "radicado"
  | "semillero"
  | "tutor"
  | "nivel"
  | "menores"
  | "puntaje"
  | "estado"
  | "fecha";

export interface Orden {
  columna: ColumnaOrden;
  ascendente: boolean;
}

type P = PostulacionAdminDetalle;

const VALOR_ORDEN: Record<ColumnaOrden, (p: P) => string | number> = {
  radicado: (p) => p.radicado_codigo,
  semillero: (p) => p.semillero_nombre,
  tutor: (p) => p.tutor_nombre,
  nivel: (p) => p.institucion_tipo,
  menores: contarMenores,
  puntaje: (p) => puntajeTotal(p) ?? -1,
  estado: (p) => ORDEN_ESTADO[p.estado],
  fecha: (p) => p.created_at,
};

export function ordenarPostulaciones(lista: P[], orden: Orden): P[] {
  const valor = VALOR_ORDEN[orden.columna];
  const signo = orden.ascendente ? 1 : -1;
  return [...lista].sort((a, b) => {
    const [x, y] = [valor(a), valor(b)];
    if (typeof x === "number" && typeof y === "number") {
      return (x - y) * signo;
    }
    return String(x).localeCompare(String(y), "es") * signo;
  });
}

const COLUMNAS: {
  id: ColumnaOrden;
  etiqueta: string;
  clase?: string;
}[] = [
  { id: "radicado", etiqueta: "Radicado" },
  { id: "semillero", etiqueta: "Semillero e institución" },
  { id: "tutor", etiqueta: "Tutor" },
  { id: "nivel", etiqueta: "Nivel" },
  { id: "menores", etiqueta: "Menores", clase: "adm-num" },
  { id: "puntaje", etiqueta: "Puntaje", clase: "adm-num" },
  { id: "estado", etiqueta: "Estado" },
  { id: "fecha", etiqueta: "Fecha", clase: "adm-num" },
];

function Radicado({ codigo }: { codigo: string }) {
  const corte = codigo.lastIndexOf("-") + 1;
  return (
    <span className="adm-radicado">
      <span>{codigo.slice(0, corte)}</span>
      {codigo.slice(corte)}
    </span>
  );
}

function Puntaje({ valor }: { valor: number | null }) {
  if (valor === null) {
    return (
      <span className="adm-suave">
        <span aria-hidden="true">—</span>
        <span className="sr-only">Sin evaluar</span>
      </span>
    );
  }
  return (
    <span className="adm-puntaje">
      {valor}
      <span> /100</span>
    </span>
  );
}

function Encabezado({
  columna,
  orden,
  alOrdenar,
}: {
  columna: (typeof COLUMNAS)[number];
  orden: Orden;
  alOrdenar: (columna: ColumnaOrden) => void;
}) {
  const activa = orden.columna === columna.id;
  const direccion = orden.ascendente ? "ascending" : "descending";
  return (
    <th
      scope="col"
      className={columna.clase}
      aria-sort={activa ? direccion : "none"}
    >
      <button type="button" onClick={() => alOrdenar(columna.id)}>
        {columna.etiqueta}
        {activa && <IconoOrden ascendente={orden.ascendente} />}
      </button>
    </th>
  );
}

function Fila({ p, alAbrir }: { p: P; alAbrir: (p: P) => void }) {
  return (
    <tr className="adm-fila">
      <td>
        <button
          type="button"
          className="adm-fila-boton"
          onClick={() => alAbrir(p)}
          aria-label={`Abrir expediente ${p.radicado_codigo}, ${p.semillero_nombre}`}
        >
          <Radicado codigo={p.radicado_codigo} />
        </button>
      </td>
      <td>
        <span className="adm-dos-lineas">
          <strong title={p.semillero_nombre}>{p.semillero_nombre}</strong>
          <span title={p.institucion_nombre}>{p.institucion_nombre}</span>
        </span>
      </td>
      <td className="adm-truncar" title={p.tutor_nombre}>
        {p.tutor_nombre}
      </td>
      <td className="adm-truncar">{ETIQUETA_NIVEL[p.institucion_tipo]}</td>
      <td className="adm-num">{contarMenores(p)}</td>
      <td className="adm-num">
        <Puntaje valor={puntajeTotal(p)} />
      </td>
      <td>
        <EstadoMarca estado={p.estado} />
      </td>
      <td className="adm-num adm-suave">{fechaCorta(p.created_at)}</td>
      <td className="adm-fila-flecha">
        <IconoFlechaDerecha />
      </td>
    </tr>
  );
}

function resumenFila(p: P): string {
  const menores = contarMenores(p);
  return [
    ETIQUETA_NIVEL[p.institucion_tipo],
    menores === 1 ? "1 menor" : `${menores} menores`,
    fechaCorta(p.created_at),
  ].join(" · ");
}

function ItemLista({ p, alAbrir }: { p: P; alAbrir: (p: P) => void }) {
  return (
    <li>
      <button type="button" className="adm-item" onClick={() => alAbrir(p)}>
        <span className="adm-item-linea">
          <Radicado codigo={p.radicado_codigo} />
          <EstadoMarca estado={p.estado} />
        </span>
        <span className="adm-item-linea">
          <strong className="adm-item-titulo">{p.semillero_nombre}</strong>
          <Puntaje valor={puntajeTotal(p)} />
        </span>
        <span className="adm-item-sub">{p.institucion_nombre}</span>
        <span className="adm-item-sub">{p.tutor_nombre}</span>
        <span className="adm-item-sub">{resumenFila(p)}</span>
        <span className="adm-item-flecha">
          <IconoChevronDerecha />
        </span>
      </button>
    </li>
  );
}

const FILAS_ESQUELETO = ["e1", "e2", "e3", "e4", "e5", "e6"];

function Esqueleto() {
  return (
    <div className="adm-tabla-marco" role="status">
      <span className="sr-only">Cargando postulaciones…</span>
      {FILAS_ESQUELETO.map((id) => (
        <div key={id} className="adm-esqueleto-fila" aria-hidden="true">
          <span className="adm-esqueleto" />
          <span className="adm-esqueleto" />
          <span className="adm-esqueleto" />
          <span className="adm-esqueleto" />
        </div>
      ))}
    </div>
  );
}

function Mensaje({
  titulo,
  children,
  rol,
}: {
  titulo: string;
  children?: ReactNode;
  rol?: "alert";
}) {
  return (
    <div className="adm-tabla-marco adm-mensaje" role={rol}>
      <p>{titulo}</p>
      {children}
    </div>
  );
}

interface TablaPostulacionesProps {
  /** Ya filtradas y en orden. */
  postulaciones: P[];
  totalSinFiltrar: number;
  orden: Orden;
  cargando: boolean;
  error: string | null;
  alOrdenar: (columna: ColumnaOrden) => void;
  alSeleccionarPostulacion: (postulacion: P) => void;
  alReintentar: () => void;
  alLimpiarFiltros: () => void;
}

export function TablaPostulaciones({
  postulaciones,
  totalSinFiltrar,
  orden,
  cargando,
  error,
  alOrdenar,
  alSeleccionarPostulacion,
  alReintentar,
  alLimpiarFiltros,
}: TablaPostulacionesProps) {
  if (cargando && totalSinFiltrar === 0) return <Esqueleto />;

  if (error && totalSinFiltrar === 0) {
    return (
      <Mensaje titulo={error} rol="alert">
        <button
          type="button"
          className="adm-boton adm-boton-suave"
          onClick={alReintentar}
        >
          Reintentar
        </button>
      </Mensaje>
    );
  }

  if (totalSinFiltrar === 0) {
    return (
      <Mensaje titulo="Todavía no hay postulaciones radicadas.">
        <p className="adm-suave">
          Las nuevas aparecerán aquí apenas un equipo envíe su formulario.
        </p>
      </Mensaje>
    );
  }

  if (postulaciones.length === 0) {
    return (
      <Mensaje titulo="Ninguna postulación coincide con esta búsqueda.">
        <button
          type="button"
          className="adm-boton adm-boton-suave"
          onClick={alLimpiarFiltros}
        >
          Quitar filtros
        </button>
      </Mensaje>
    );
  }

  return (
    <div className="adm-tabla-marco">
      <table className="adm-tabla">
        <caption className="sr-only">
          Postulaciones al Bootcamp Cauca INNOVA
        </caption>
        <thead>
          <tr>
            {COLUMNAS.map((c) => (
              <Encabezado
                key={c.id}
                columna={c}
                orden={orden}
                alOrdenar={alOrdenar}
              />
            ))}
            <th scope="col">
              <span className="sr-only">Abrir</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {postulaciones.map((p) => (
            <Fila key={p.id} p={p} alAbrir={alSeleccionarPostulacion} />
          ))}
        </tbody>
      </table>
      <ul className="adm-lista">
        {postulaciones.map((p) => (
          <ItemLista key={p.id} p={p} alAbrir={alSeleccionarPostulacion} />
        ))}
      </ul>
    </div>
  );
}
