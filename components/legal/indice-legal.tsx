import type { EntradaIndice } from "./pagina-legal";

function ListaIndice({ entradas }: { entradas: readonly EntradaIndice[] }) {
  return (
    <ol>
      {entradas.map(({ id, etiqueta }) => (
        <li key={id}>
          <a href={`#${id}`}>{etiqueta}</a>
        </li>
      ))}
    </ol>
  );
}

/*
 * Dos versiones del mismo índice porque cambian de forma, no solo de tamaño:
 * lateral fijo en escritorio y desplegable en móvil. El CSS muestra una sola.
 */
export function IndiceLegal({
  entradas,
}: {
  entradas: readonly EntradaIndice[];
}) {
  return (
    <div className="legal-indice">
      <nav className="legal-indice-lateral" aria-label="Índice del documento">
        <p>En este documento</p>
        <ListaIndice entradas={entradas} />
      </nav>
      <details className="legal-indice-movil">
        <summary>Índice del documento</summary>
        <nav aria-label="Índice del documento">
          <ListaIndice entradas={entradas} />
        </nav>
      </details>
    </div>
  );
}
