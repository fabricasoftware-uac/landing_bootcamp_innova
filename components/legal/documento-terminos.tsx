import type { BloqueTerminos, Fragmento } from "@/lib/terminos-referencia";
import { TablaLegal } from "./bloques-legales";

function TextoFragmento({ fragmento }: { fragmento: Fragmento }) {
  const { texto, negrita, cursiva } = fragmento;
  const contenido = cursiva ? <em>{texto}</em> : texto;
  return negrita ? <strong>{contenido}</strong> : contenido;
}

function Fragmentos({ fragmentos }: { fragmentos: readonly Fragmento[] }) {
  return fragmentos.map((fragmento, posicion) => (
    <TextoFragmento
      // biome-ignore lint/suspicious/noArrayIndexKey: documento generado y fijo, nunca se reordena
      key={`${posicion}-${fragmento.texto}`}
      fragmento={fragmento}
    />
  ));
}

function ListaTerminos({
  bloque,
}: {
  bloque: Extract<BloqueTerminos, { tipo: "lista" }>;
}) {
  const items = bloque.items.map((item) => (
    <li key={item.map(({ texto }) => texto).join("")}>
      <Fragmentos fragmentos={item} />
    </li>
  ));
  return bloque.ordenada ? (
    <ol start={bloque.inicio}>{items}</ol>
  ) : (
    <ul>{items}</ul>
  );
}

function TablaTerminos({
  bloque,
}: {
  bloque: Extract<BloqueTerminos, { tipo: "tabla" }>;
}) {
  return (
    <TablaLegal
      descripcion={bloque.encabezados.join(" y ")}
      encabezados={bloque.encabezados}
    >
      {bloque.filas.map((fila) => (
        <tr key={fila.join("|")}>
          {fila.map((celda, columna) => (
            <td
              // biome-ignore lint/suspicious/noArrayIndexKey: documento generado y fijo, nunca se reordena
              key={`${columna}-${celda}`}
            >
              {celda}
            </td>
          ))}
        </tr>
      ))}
    </TablaLegal>
  );
}

function BloqueDocumento({ bloque }: { bloque: BloqueTerminos }) {
  switch (bloque.tipo) {
    case "titulo":
      // El nivel 1 es la portada del documento: el título de la página ya es el h1.
      return bloque.nivel === 1 ? (
        <p className="terminos-portada">{bloque.texto}</p>
      ) : (
        <h2 id={bloque.id}>
          {bloque.numero} {bloque.texto}
        </h2>
      );
    case "parrafo":
      return (
        <p className={bloque.centrado ? "terminos-centrado" : undefined}>
          <Fragmentos fragmentos={bloque.fragmentos} />
        </p>
      );
    case "lista":
      return <ListaTerminos bloque={bloque} />;
    case "tabla":
      return <TablaTerminos bloque={bloque} />;
  }
}

/** Pinta el documento oficial tal como viene: aquí no se corrige ni se resume nada. */
export function DocumentoTerminos({
  bloques,
}: {
  bloques: readonly BloqueTerminos[];
}) {
  return bloques.map((bloque, posicion) => (
    <BloqueDocumento
      // biome-ignore lint/suspicious/noArrayIndexKey: documento generado y fijo, nunca se reordena
      key={`${bloque.tipo}-${posicion}`}
      bloque={bloque}
    />
  ));
}
