import type { CSSProperties } from "react";
import { CAJA_LOGO_CAUCA, PIEZAS_LOGO_CAUCA } from "@/lib/logo-cauca";

/** Va en línea, partido en piezas, para animarlo; toma el color del texto que lo rodea. */
export function LogoCauca({ clase = "" }: { clase?: string }) {
  return (
    <svg
      className={`logo-cauca ${clase}`}
      viewBox={CAJA_LOGO_CAUCA}
      role="img"
      aria-label="Cauca INNOVA"
      fill="currentColor"
      fillRule="evenodd"
    >
      <path className="logo-recuadro" d={PIEZAS_LOGO_CAUCA.recuadro} />
      <path className="logo-firma" d={PIEZAS_LOGO_CAUCA.firma} />
      <path className="logo-innova" d={PIEZAS_LOGO_CAUCA.innova} />
    </svg>
  );
}

const LOGOS = {
  "gobernacion-compacto": {
    proporcion: "1290 / 488",
    alt: "Gobernación del Cauca",
  },
  gobernacion: {
    proporcion: "1342 / 880",
    alt: "Gobernación del Cauca, Secretaría de Desarrollo Económico y Competitividad",
  },
  uniautonoma: {
    proporcion: "7162 / 1498",
    alt: "Corporación Universitaria Autónoma del Cauca",
  },
  "uniautonoma-grifo": {
    proporcion: "1702 / 1498",
    alt: "Grifo de la Corporación Universitaria Autónoma del Cauca",
  },
  "uniautonoma-letras": {
    proporcion: "2770 / 563",
    alt: "Uniautónoma del Cauca",
  },
} as const;

/*
 * Estos dos pesan más de 40 KB: como máscara se cachean aparte, no inflan el JavaScript
 * y aun así toman el color de cada sección.
 */
export function LogoMascara({
  nombre,
  clase = "",
}: {
  nombre: keyof typeof LOGOS;
  clase?: string;
}) {
  const { proporcion, alt } = LOGOS[nombre];
  const url = `url(/logos/${nombre}.svg)`;
  const estilo: CSSProperties = {
    aspectRatio: proporcion,
    maskImage: url,
    WebkitMaskImage: url,
  };
  return (
    <span
      className={`logo-mascara ${clase}`}
      role="img"
      aria-label={alt}
      style={estilo}
    />
  );
}
