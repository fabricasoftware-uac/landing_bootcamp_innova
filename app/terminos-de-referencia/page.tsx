import type { Metadata } from "next";
import { DocumentoTerminos } from "@/components/legal/documento-terminos";
import { PaginaLegal } from "@/components/legal/pagina-legal";
import { documentoTerminos } from "@/lib/contenido";
import { bloquesTerminos } from "@/lib/terminos-referencia";

export const metadata: Metadata = {
  title: "Términos de referencia · Cauca INNOVA",
  description:
    "Documento completo de los términos de referencia de la convocatoria Cauca INNOVA para semilleros de investigación del Cauca.",
};

const indice = bloquesTerminos.flatMap((bloque) =>
  bloque.tipo === "titulo" && bloque.nivel === 2
    ? [{ id: bloque.id, etiqueta: `${bloque.numero} ${bloque.texto}` }]
    : [],
);

export default function TerminosDeReferenciaPage() {
  return (
    <PaginaLegal
      titulo="Términos de referencia"
      entrada="El documento completo de la convocatoria, para leerlo aquí o descargarlo."
      indice={indice}
      conProgreso
      acciones={
        <a className="boton" href={documentoTerminos} download>
          Descargar PDF
        </a>
      }
    >
      <DocumentoTerminos bloques={bloquesTerminos} />
    </PaginaLegal>
  );
}
