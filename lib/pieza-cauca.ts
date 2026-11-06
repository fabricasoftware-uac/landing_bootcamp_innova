/**
 * Geometría de la pieza: la silueta pixelada del logo de Cauca INNOVA, muestreada
 * del archivo original y extruida por capas. Se calcula aquí, y no en un componente,
 * para que el SVG salga del servidor idéntico en cada render.
 */
const SILUETA = [
  "....#.....##..",
  "....##...###..",
  "..##########..",
  "..############",
  "##############",
  "############..",
  "############..",
  "..#########...",
  "..########....",
  ".....#####....",
  ".....######...",
  ".....######...",
  "........###...",
  "..........#...",
  "..........#...",
] as const;

export const CAPAS_PIEZA = 6;

const ANCHO_CELDA = 26;
const ALTO_CELDA = 23;
const SESGO = 4;
const ALTO_CAPA = 14;
const MARGEN = 4;

const FILAS = SILUETA.length;
const COLUMNAS = SILUETA[0].length;

/** Tres tonos planos por capa: arriba, frente y lateral. La última es la cumbre blanca. */
const TONOS_CAPA = [
  ["#0f3550", "#0a2b41", "#072233"],
  ["#1b4d6e", "#143e5a", "#0f3550"],
  ["#2f6d92", "#245a7c", "#1b4d6e"],
  ["#4f8fb0", "#3f7a99", "#2f6d92"],
  ["#a9c9d8", "#8db3c6", "#7199ae"],
  ["#d4f03f", "#b5d62c", "#97b720"],
] as const;

export interface CaraCubo {
  puntos: string;
  color: string;
}

export interface CuboPieza {
  id: string;
  capa: number;
  orden: number;
  caras: CaraCubo[];
}

function estaLlena(columna: number, fila: number): boolean {
  return SILUETA[fila]?.[columna] === "#";
}

/** Distancia al borde de la silueta: da el relieve, más alto hacia la cordillera. */
function calcularAlturas(): number[][] {
  const distancias = SILUETA.map((fila) =>
    [...fila].map((celda) => (celda === "#" ? Number.POSITIVE_INFINITY : 0)),
  );
  const vecinas = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ] as const;
  for (let pasada = 0; pasada < FILAS + COLUMNAS; pasada++) {
    for (let fila = 0; fila < FILAS; fila++) {
      for (let columna = 0; columna < COLUMNAS; columna++) {
        if (!estaLlena(columna, fila)) continue;
        const menor = Math.min(
          ...vecinas.map(
            ([dc, df]) => distancias[fila + df]?.[columna + dc] ?? 0,
          ),
        );
        const actual = distancias[fila]?.[columna] ?? 0;
        const filaActual = distancias[fila];
        if (filaActual) filaActual[columna] = Math.min(actual, menor + 1);
      }
    }
  }
  return distancias.map((fila, indiceFila) =>
    fila.map((distancia, columna) => {
      if (distancia === 0) return 0;
      const cordillera = columna >= 5 && indiceFila >= 2 && indiceFila <= 8;
      return Math.min(CAPAS_PIEZA, distancia + (cordillera ? 2 : 0));
    }),
  );
}

function proyectar(columna: number, fila: number, capa: number) {
  return {
    x: MARGEN + columna * ANCHO_CELDA + fila * SESGO,
    y: MARGEN + fila * ALTO_CELDA + (CAPAS_PIEZA - capa) * ALTO_CAPA,
  };
}

function poligono(puntos: { x: number; y: number }[]): string {
  return puntos.map((p) => `${p.x},${p.y}`).join(" ");
}

function crearCubo(
  columna: number,
  fila: number,
  capa: number,
  alturas: number[][],
): CaraCubo[] {
  const a = proyectar(columna, fila, capa + 1);
  const b = proyectar(columna + 1, fila, capa + 1);
  const c = proyectar(columna + 1, fila + 1, capa + 1);
  const d = proyectar(columna, fila + 1, capa + 1);
  const abajo = (p: { x: number; y: number }) => ({
    x: p.x,
    y: p.y + ALTO_CAPA,
  });
  const tono = TONOS_CAPA[capa] ?? TONOS_CAPA[0];
  const caras: CaraCubo[] = [];

  const delanteTapa = (alturas[fila + 1]?.[columna] ?? 0) > capa;
  const ladoTapa = (alturas[fila]?.[columna - 1] ?? 0) > capa;
  if (!ladoTapa) {
    caras.push({
      puntos: poligono([a, d, abajo(d), abajo(a)]),
      color: tono[2],
    });
  }
  if (!delanteTapa) {
    caras.push({
      puntos: poligono([d, c, abajo(c), abajo(d)]),
      color: tono[1],
    });
  }
  // La tapa siempre se dibuja: el componente interactivo oculta capas superiores
  // y sin ella quedarían huecos en la capa que pasa a ser la de arriba.
  caras.push({ puntos: poligono([a, b, c, d]), color: tono[0] });
  return caras;
}

function construirCubos(): CuboPieza[] {
  const alturas = calcularAlturas();
  const cubos: CuboPieza[] = [];
  // Orden de pintado de atrás hacia delante: fila, columna inversa y capa.
  for (let fila = 0; fila < FILAS; fila++) {
    for (let columna = COLUMNAS - 1; columna >= 0; columna--) {
      const altura = alturas[fila]?.[columna] ?? 0;
      for (let capa = 0; capa < altura; capa++) {
        cubos.push({
          id: `${columna}-${fila}-${capa}`,
          capa,
          orden: columna + fila,
          caras: crearCubo(columna, fila, capa, alturas),
        });
      }
    }
  }
  return cubos;
}

export const CUBOS_PIEZA: readonly CuboPieza[] = construirCubos();

/** Toda la pieza en un solo trazo: la sombra de lo que falta por imprimir. */
export const TRAZO_FANTASMA = CUBOS_PIEZA.flatMap((cubo) =>
  cubo.caras.map((cara) => `M${cara.puntos}Z`),
).join("");

export const ANCHO_PIEZA = MARGEN * 2 + COLUMNAS * ANCHO_CELDA + FILAS * SESGO;
export const ALTO_PIEZA =
  MARGEN * 2 + FILAS * ALTO_CELDA + (CAPAS_PIEZA + 1) * ALTO_CAPA;

/** Celdas planas de la silueta para el sello y los iconos. */
export const CELDAS_SILUETA: readonly { columna: number; fila: number }[] =
  SILUETA.flatMap((fila, indiceFila) =>
    [...fila].flatMap((celda, columna) =>
      celda === "#" ? [{ columna, fila: indiceFila }] : [],
    ),
  );

export const COLUMNAS_SILUETA = COLUMNAS;
export const FILAS_SILUETA = FILAS;

/** Silueta como trazo, para usarla de máscara sobre fotografías. */
export const TRAZO_SILUETA = CELDAS_SILUETA.map(
  ({ columna, fila }) => `M${columna} ${fila}h1.02v1.02h-1.02Z`,
).join("");

/** Contorno de la silueta en unidades de celda, para recortar video e imágenes. */
function trazarContorno(): readonly (readonly [number, number])[] {
  const llena = (c: number, f: number) => estaLlena(c, f);
  const salidas = new Map<string, [number, number][]>();
  const agregar = (x1: number, y1: number, x2: number, y2: number) => {
    const clave = `${x1},${y1}`;
    salidas.set(clave, [...(salidas.get(clave) ?? []), [x2, y2]]);
  };
  for (const { columna: c, fila: f } of CELDAS_SILUETA) {
    if (!llena(c, f - 1)) agregar(c, f, c + 1, f);
    if (!llena(c + 1, f)) agregar(c + 1, f, c + 1, f + 1);
    if (!llena(c, f + 1)) agregar(c + 1, f + 1, c, f + 1);
    if (!llena(c - 1, f)) agregar(c, f + 1, c, f);
  }
  const inicio = salidas.keys().next().value ?? "0,0";
  const puntos: [number, number][] = [];
  let actual = inicio;
  do {
    const [x, y] = actual.split(",").map(Number) as [number, number];
    puntos.push([x, y]);
    const opciones = salidas.get(actual) ?? [];
    const siguiente = opciones.shift();
    if (!siguiente) break;
    actual = `${siguiente[0]},${siguiente[1]}`;
  } while (actual !== inicio);
  // Solo quedan las esquinas: los puntos intermedios de un tramo recto sobran.
  return puntos.filter((p, i) => {
    const a = puntos[(i - 1 + puntos.length) % puntos.length] ?? p;
    const b = puntos[(i + 1) % puntos.length] ?? p;
    return !(
      (a[0] === p[0] && p[0] === b[0]) ||
      (a[1] === p[1] && p[1] === b[1])
    );
  });
}

export const CONTORNO_SILUETA = trazarContorno();

/** Polígono CSS de la silueta dentro de su propia caja. */
export const POLIGONO_SILUETA = `polygon(${CONTORNO_SILUETA.map(
  ([x, y]) =>
    `${((x / COLUMNAS) * 100).toFixed(2)}% ${((y / FILAS) * 100).toFixed(2)}%`,
).join(",")})`;
