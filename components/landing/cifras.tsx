const CIFRAS = [
  { valor: 7, texto: "equipos seleccionados" },
  { valor: 3, texto: "estudiantes por equipo" },
  { valor: 21, texto: "cupos en todo el Cauca" },
  { valor: 1, texto: "jornada para construir" },
] as const;

export function Cifras() {
  return (
    <section
      className="cifras"
      data-tema="claro"
      aria-labelledby="titulo-cifras"
    >
      <div className="marco">
        <h2 id="titulo-cifras" className="cifras-titulo" data-titular>
          Cupos limitados. Ideas sin límite.
        </h2>
        <dl className="cifras-lista">
          {CIFRAS.map(({ valor, texto }) => (
            <div key={texto} data-rev="sube">
              <dt>{texto}</dt>
              <dd data-contar={valor}>{valor}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
