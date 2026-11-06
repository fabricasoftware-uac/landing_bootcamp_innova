import type { CSSProperties } from "react";
import {
  ALTO_PIEZA,
  ANCHO_PIEZA,
  CAPAS_PIEZA,
  CELDAS_SILUETA,
  COLUMNAS_SILUETA,
  CUBOS_PIEZA,
  FILAS_SILUETA,
  TRAZO_FANTASMA,
} from "@/lib/pieza-cauca";

interface PiezaCaucaProps {
  /** Capas visibles. La pieza completa tiene seis. */
  capas?: number;
  /** Reproduce la impresión al cargar, solo con CSS para no depender de la hidratación. */
  imprimeAlCargar?: boolean;
  etiqueta: string;
  clase?: string;
}

export function PiezaCauca({
  capas = CAPAS_PIEZA,
  imprimeAlCargar = false,
  etiqueta,
  clase = "",
}: PiezaCaucaProps) {
  return (
    <svg
      className={`pieza ${imprimeAlCargar ? "pieza-imprime" : ""} ${clase}`}
      viewBox={`0 0 ${ANCHO_PIEZA} ${ALTO_PIEZA}`}
      role="img"
      aria-label={etiqueta}
    >
      {CUBOS_PIEZA.map((cubo) => (
        <g
          key={cubo.id}
          className="pieza-cubo"
          data-oculta={cubo.capa >= capas ? "" : undefined}
          style={
            { "--capa": cubo.capa, "--orden": cubo.orden } as CSSProperties
          }
        >
          {cubo.caras.map((cara) => (
            <polygon
              key={cara.puntos}
              points={cara.puntos}
              fill={cara.color}
              stroke={cara.color}
              strokeWidth="0.6"
            />
          ))}
        </g>
      ))}
    </svg>
  );
}

export function FantasmaCauca() {
  return (
    <svg
      className="pieza pieza-fantasma"
      viewBox={`0 0 ${ANCHO_PIEZA} ${ALTO_PIEZA}`}
      aria-hidden="true"
    >
      <path d={TRAZO_FANTASMA} />
    </svg>
  );
}

/** Silueta plana del Cauca, en el color del texto que la rodea. */
export function SiluetaCauca({ clase = "" }: { clase?: string }) {
  return (
    <svg
      className={clase}
      viewBox={`0 0 ${COLUMNAS_SILUETA} ${FILAS_SILUETA}`}
      aria-hidden="true"
      shapeRendering="crispEdges"
    >
      {CELDAS_SILUETA.map(({ columna, fila }) => (
        <rect
          key={`${columna}-${fila}`}
          x={columna}
          y={fila}
          width="1.02"
          height="1.02"
          fill="currentColor"
        />
      ))}
    </svg>
  );
}
