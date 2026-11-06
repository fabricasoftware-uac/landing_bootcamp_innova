import type { ReactNode } from "react";
import { DATO_PENDIENTE } from "@/lib/legal";

export function SeccionLegal({
  id,
  titulo,
  children,
}: {
  id: string;
  titulo: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id}>
      <h2 id={id}>{titulo}</h2>
      {children}
    </section>
  );
}

/** Evita escribir "null" o inventar un valor cuando el dato aún no está verificado. */
export function DatoPublicable({ valor }: { valor: string | null }) {
  return valor ?? <em>{DATO_PENDIENTE}</em>;
}

export function EnlaceExterno({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a href={href} target="_blank" rel="noreferrer">
      {children}
      <span className="sr-only"> (abre en otra pestaña)</span>
    </a>
  );
}

interface TablaLegalProps {
  descripcion: string;
  encabezados: readonly string[];
  children: ReactNode;
}

/* Con foco por teclado: una tabla ancha en móvil debe poder desplazarse sin ratón. */
export function TablaLegal({
  descripcion,
  encabezados,
  children,
}: TablaLegalProps) {
  return (
    <div
      className="legal-tabla"
      role="region"
      aria-label={descripcion}
      // biome-ignore lint/a11y/noNoninteractiveTabindex: región desplazable, necesita foco de teclado
      tabIndex={0}
    >
      <table>
        <caption className="sr-only">{descripcion}</caption>
        <thead>
          <tr>
            {encabezados.map((encabezado) => (
              <th key={encabezado} scope="col">
                {encabezado}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
