import type { ReactNode } from "react";
import { CREDITOS, type NombreMedio } from "@/lib/medios";

/* Apagados por decisión del cliente, que los ubicará luego. Cambiar a true los muestra. */
const MOSTRAR_CREDITOS = false;

export function Credito({ medio }: { medio: NombreMedio }) {
  if (!MOSTRAR_CREDITOS) return null;
  const { titulo, autor, licencia, enlace } = CREDITOS[medio];
  return (
    <figcaption className="credito">
      <a href={enlace} target="_blank" rel="noreferrer">
        {titulo}. {autor}, {licencia}
      </a>
    </figcaption>
  );
}

export function ConCredito({
  medio,
  clase = "",
  children,
}: {
  medio: NombreMedio;
  clase?: string;
  children: ReactNode;
}) {
  return (
    <figure className={`con-credito ${clase}`}>
      {children}
      <Credito medio={medio} />
    </figure>
  );
}
