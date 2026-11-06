interface Ventana {
  intentos: number;
  vence: number;
}

const MAX_CLAVES = 5000;

/**
 * Límite por clave en memoria. Vale por instancia: en un despliegue con varias
 * instancias frena ráfagas, no un ataque distribuido. Ver docs/seguridad.md.
 */
export function crearLimitador(maximo: number, ventanaMs: number) {
  const ventanas = new Map<string, Ventana>();

  function purgar(ahora: number) {
    for (const [clave, ventana] of ventanas) {
      if (ventana.vence <= ahora) ventanas.delete(clave);
    }
    // Si un ataque llena el mapa con claves vigentes, se sueltan las más antiguas.
    for (const clave of ventanas.keys()) {
      if (ventanas.size < MAX_CLAVES) break;
      ventanas.delete(clave);
    }
  }

  return function consumir(clave: string, ahora = Date.now()): boolean {
    const ventana = ventanas.get(clave);

    if (!ventana || ventana.vence <= ahora) {
      if (ventanas.size >= MAX_CLAVES) purgar(ahora);
      ventanas.set(clave, { intentos: 1, vence: ahora + ventanaMs });
      return true;
    }

    ventana.intentos += 1;
    return ventana.intentos <= maximo;
  };
}
