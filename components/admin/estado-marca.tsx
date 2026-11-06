import { ETIQUETA_ESTADO } from "@/components/admin/dominio";
import type { PostulacionEstado } from "@/lib/supabase/types";

/** El estado siempre dice su nombre: el color solo lo acompaña. */
export function EstadoMarca({ estado }: { estado: PostulacionEstado }) {
  return (
    <span className="adm-estado" data-estado={estado}>
      <span className="adm-estado-punto" aria-hidden="true" />
      {ETIQUETA_ESTADO[estado]}
    </span>
  );
}
