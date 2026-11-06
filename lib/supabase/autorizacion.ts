import "server-only";
import { createClient } from "./server";

export interface Administrador {
  id: string;
}

/**
 * Devuelve al administrador de la sesión o null. Las Server Actions son endpoints
 * públicos: esta comprobación va antes de usar el cliente de service role.
 * getUser() valida el token contra Supabase; el rol sale de app_metadata, que el
 * usuario no puede escribir. Cualquier fallo deniega.
 */
export async function obtenerAdministrador(): Promise<Administrador | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) return null;
    if (user.app_metadata?.role !== "admin") {
      console.error("Acceso admin denegado a un usuario sin rol:", user.id);
      return null;
    }

    return { id: user.id };
  } catch (error) {
    console.error("Error al verificar la sesión admin:", error);
    return null;
  }
}
