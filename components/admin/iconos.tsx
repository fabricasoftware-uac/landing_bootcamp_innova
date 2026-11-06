import type { ReactNode } from "react";

/** Un solo juego de iconos: trazo de 1.5 a 18 px, decorativos para lectores de pantalla. */
function Icono({ children }: { children: ReactNode }) {
  return (
    <svg
      className="adm-icono"
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const IconoLista = () => (
  <Icono>
    <path d="M3 4.5h12M3 9h12M3 13.5h12" />
  </Icono>
);

export const IconoExterno = () => (
  <Icono>
    <path d="M7.5 3.5H4A1.5 1.5 0 0 0 2.5 5v9A1.5 1.5 0 0 0 4 15.5h9a1.5 1.5 0 0 0 1.5-1.5v-3.5" />
    <path d="M10.5 2.5h5v5M15.5 2.5 8.5 9.5" />
  </Icono>
);

export const IconoSalir = () => (
  <Icono>
    <path d="M7 2.5H4A1.5 1.5 0 0 0 2.5 4v10A1.5 1.5 0 0 0 4 15.5h3" />
    <path d="M12 12.5 15.5 9 12 5.5M15.5 9H7" />
  </Icono>
);

export const IconoRefrescar = () => (
  <Icono>
    <path d="M15 9a6 6 0 1 1-1.8-4.3L15 6.5" />
    <path d="M15 2.5v4h-4" />
  </Icono>
);

export const IconoDescarga = () => (
  <Icono>
    <path d="M9 2.5v9M5.5 8 9 11.5 12.5 8" />
    <path d="M3 13v1A1.5 1.5 0 0 0 4.5 15.5h9A1.5 1.5 0 0 0 15 14v-1" />
  </Icono>
);

export const IconoBuscar = () => (
  <Icono>
    <circle cx="8" cy="8" r="5" />
    <path d="m15.5 15.5-3.9-3.9" />
  </Icono>
);

export const IconoFlechaDerecha = () => (
  <Icono>
    <path d="M3 9h12M10.5 4.5 15 9l-4.5 4.5" />
  </Icono>
);

export const IconoFlechaIzquierda = () => (
  <Icono>
    <path d="M15 9H3M7.5 4.5 3 9l4.5 4.5" />
  </Icono>
);

export const IconoChevronIzquierda = () => (
  <Icono>
    <path d="m11 4-5 5 5 5" />
  </Icono>
);

export const IconoChevronDerecha = () => (
  <Icono>
    <path d="m7 4 5 5-5 5" />
  </Icono>
);

export const IconoOrden = ({ ascendente }: { ascendente: boolean }) => (
  <Icono>
    <path d={ascendente ? "m5 11 4-4 4 4" : "m5 7 4 4 4-4"} />
  </Icono>
);

export const IconoCopiar = () => (
  <Icono>
    <rect x="6.5" y="6.5" width="9" height="9" rx="1.5" />
    <path d="M11.5 6.5V4A1.5 1.5 0 0 0 10 2.5H4A1.5 1.5 0 0 0 2.5 4v6A1.5 1.5 0 0 0 4 11.5h2.5" />
  </Icono>
);

export const IconoCheck = () => (
  <Icono>
    <path d="m3.5 9.5 3.5 3.5 7.5-8" />
  </Icono>
);

export const IconoFalta = () => (
  <Icono>
    <circle cx="9" cy="9" r="6.5" />
    <path d="M9 5.5v4M9 12.5v.01" />
  </Icono>
);

export const IconoDocumento = () => (
  <Icono>
    <path d="M10.5 2.5H5A1.5 1.5 0 0 0 3.5 4v10A1.5 1.5 0 0 0 5 15.5h8a1.5 1.5 0 0 0 1.5-1.5V6.5z" />
    <path d="M10.5 2.5v4h4" />
  </Icono>
);

export const IconoMas = () => (
  <Icono>
    <path d="M9 4v10M4 9h10" />
  </Icono>
);

export const IconoMenos = () => (
  <Icono>
    <path d="M4 9h10" />
  </Icono>
);
