import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { CUBOS_PIEZA } from "@/lib/pieza-cauca";

/**
 * Impresora 3D dibujada por código: así el cabezal, la bobina y la pieza se mueven de verdad
 * y se ve nítida a cualquier tamaño. Va en su propio módulo para cargarla solo al acercarse.
 */
export interface EscenaImpresora {
  fijarAvance: (avance: number) => void;
  fijarGiro: (giro: number) => void;
  redimensionar: () => void;
  activar: (activa: boolean) => void;
  destruir: () => void;
}

const COLOR = {
  cuerpo: 0x1b4d6e,
  interior: 0x0f3550,
  acero: 0xc9d3d8,
  filamento: 0xd4f03f,
  laton: 0xd9a441,
};

const LADO_VOXEL = 0.2;
const ALTO_VOXEL = 0.13;
const BASE_PIEZA = -1.32;

function rectangulo(
  trazo: THREE.Shape | THREE.Path,
  x: number,
  y: number,
  ancho: number,
  alto: number,
  r: number,
): void {
  trazo.moveTo(x + r, y);
  trazo.lineTo(x + ancho - r, y);
  trazo.quadraticCurveTo(x + ancho, y, x + ancho, y + r);
  trazo.lineTo(x + ancho, y + alto - r);
  trazo.quadraticCurveTo(x + ancho, y + alto, x + ancho - r, y + alto);
  trazo.lineTo(x + r, y + alto);
  trazo.quadraticCurveTo(x, y + alto, x, y + alto - r);
  trazo.lineTo(x, y + r);
  trazo.quadraticCurveTo(x, y, x + r, y);
}

function crearMarco(material: THREE.Material): THREE.Mesh {
  const forma = new THREE.Shape();
  rectangulo(forma, -3, -2.5, 6, 5, 0.75);
  const hueco = new THREE.Path();
  rectangulo(hueco, -2.35, -1.55, 4.7, 3.45, 0.5);
  forma.holes.push(hueco);
  const geometria = new THREE.ExtrudeGeometry(forma, {
    depth: 0.42,
    bevelEnabled: true,
    bevelSize: 0.09,
    bevelThickness: 0.09,
    bevelSegments: 5,
    curveSegments: 18,
  });
  geometria.center();
  const malla = new THREE.Mesh(geometria, material);
  malla.castShadow = true;
  return malla;
}

function barra(radio: number, largo: number, material: THREE.Material) {
  const malla = new THREE.Mesh(
    new THREE.CylinderGeometry(radio, radio, largo, 20),
    material,
  );
  malla.castShadow = true;
  return malla;
}

function crearChasis(cuerpo: THREE.Material, oscuro: THREE.Material) {
  const chasis = new THREE.Group();
  const frente = crearMarco(cuerpo);
  frente.position.z = 2.2;
  const fondo = crearMarco(cuerpo);
  fondo.position.z = -2.2;
  chasis.add(frente, fondo);

  for (const [x, y] of [
    [-2.72, 2.2],
    [2.72, 2.2],
    [-2.72, -2.2],
    [2.72, -2.2],
  ] as const) {
    const riel = new THREE.Mesh(
      new RoundedBoxGeometry(0.55, 0.55, 4.4, 5, 0.2),
      cuerpo,
    );
    riel.position.set(x, y, 0);
    riel.castShadow = true;
    chasis.add(riel);
  }

  const piso = new THREE.Mesh(
    new RoundedBoxGeometry(5.2, 0.5, 4.4, 4, 0.12),
    oscuro,
  );
  piso.position.y = -2.1;
  chasis.add(piso);

  for (const [x, z] of [
    [-2.3, 1.9],
    [2.3, 1.9],
    [-2.3, -1.9],
    [2.3, -1.9],
  ] as const) {
    const pata = barra(0.32, 0.26, oscuro);
    pata.position.set(x, -2.72, z);
    chasis.add(pata);
  }
  return chasis;
}

function crearTablero(oscuro: THREE.Material) {
  const lienzo = document.createElement("canvas");
  lienzo.width = 256;
  lienzo.height = 128;
  const textura = new THREE.CanvasTexture(lienzo);
  textura.colorSpace = THREE.SRGBColorSpace;
  const pantalla = new THREE.Mesh(
    new THREE.PlaneGeometry(1.3, 0.62),
    new THREE.MeshBasicMaterial({ map: textura }),
  );
  pantalla.position.set(-0.3, -2.02, 2.52);
  const perilla = barra(0.2, 0.14, oscuro);
  perilla.rotation.x = Math.PI / 2;
  perilla.position.set(0.85, -2.02, 2.56);

  const pintar = (porcentaje: number) => {
    const c = lienzo.getContext("2d");
    if (!c) return;
    c.fillStyle = "#0a2b41";
    c.fillRect(0, 0, 256, 128);
    c.fillStyle = "#d4f03f";
    c.font = "900 54px Arial";
    c.textAlign = "center";
    c.fillText(`${porcentaje}%`, 128, 74);
    c.fillRect(24, 96, 208 * (porcentaje / 100), 10);
    textura.needsUpdate = true;
  };
  pintar(0);
  return { pantalla, perilla, pintar, textura };
}

function crearCabezal(oscuro: THREE.Material, acero: THREE.Material) {
  const carro = new THREE.Group();
  const bloque = new THREE.Mesh(
    new RoundedBoxGeometry(0.95, 0.8, 0.7, 4, 0.08),
    oscuro,
  );
  bloque.castShadow = true;
  const aro = new THREE.Mesh(
    new THREE.TorusGeometry(0.27, 0.035, 12, 40),
    acero,
  );
  aro.position.z = 0.36;
  const aspas = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.24, 0.03, 8),
    new THREE.MeshStandardMaterial({ color: 0x1b4d6e }),
  );
  aspas.rotation.x = Math.PI / 2;
  aspas.position.z = 0.35;
  const boquilla = new THREE.Mesh(
    new THREE.ConeGeometry(0.11, 0.28, 18),
    new THREE.MeshStandardMaterial({
      color: COLOR.laton,
      metalness: 0.9,
      roughness: 0.25,
    }),
  );
  boquilla.rotation.x = Math.PI;
  boquilla.position.y = -0.53;
  carro.add(bloque, aro, aspas, boquilla);
  return { carro, aspas };
}

function crearBobina(oscuro: THREE.Material) {
  const bobina = new THREE.Group();
  const hilo = new THREE.Mesh(
    new THREE.CylinderGeometry(1.05, 1.05, 0.72, 40),
    new THREE.MeshStandardMaterial({ color: COLOR.filamento, roughness: 0.55 }),
  );
  bobina.add(hilo);
  for (const x of [-0.42, 0.42]) {
    const tapa = barra(1.28, 0.08, oscuro);
    tapa.position.y = x;
    bobina.add(tapa);
  }
  bobina.rotation.z = Math.PI / 2;
  bobina.position.set(3.75, 0.5, -0.9);
  return bobina;
}

interface VoxelPieza {
  x: number;
  y: number;
  z: number;
}

/** Los voxeles salen de la misma geometría del logo y se ordenan como se imprimen. */
function crearPieza() {
  const celdas = [...CUBOS_PIEZA]
    .map((cubo) => {
      const [columna = 0, fila = 0] = cubo.id.split("-").map(Number);
      return { columna, fila, capa: cubo.capa };
    })
    .sort(
      (a, b) => a.capa - b.capa || a.fila - b.fila || a.columna - b.columna,
    );
  const geometria = new THREE.BoxGeometry(
    LADO_VOXEL * 0.97,
    ALTO_VOXEL * 0.96,
    LADO_VOXEL * 0.97,
  );
  const material = new THREE.MeshStandardMaterial({ roughness: 0.5 });
  const malla = new THREE.InstancedMesh(geometria, material, celdas.length);
  malla.castShadow = true;
  const matriz = new THREE.Matrix4();
  const tonos = [
    "#8fcf3f",
    "#a6dc3f",
    "#bfe73f",
    "#d4f03f",
    "#e6f58a",
    "#ffffff",
  ];
  const voxeles: VoxelPieza[] = celdas.map(
    ({ columna, fila, capa }, indice) => {
      const posicion = {
        x: (columna - 6.5) * LADO_VOXEL,
        y: BASE_PIEZA + (capa + 0.5) * ALTO_VOXEL,
        z: (fila - 7) * LADO_VOXEL,
      };
      matriz.makeTranslation(posicion.x, posicion.y, posicion.z);
      malla.setMatrixAt(indice, matriz);
      malla.setColorAt(indice, new THREE.Color(tonos[capa] ?? "#ffffff"));
      return posicion;
    },
  );
  malla.count = 0;
  return { malla, voxeles };
}

function crearPiezasSueltas() {
  const grupo = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({
    color: COLOR.filamento,
    roughness: 0.5,
  });
  const hexagono = new THREE.Shape();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const x = Math.cos(a) * 0.55;
    const y = Math.sin(a) * 0.55;
    if (i === 0) hexagono.moveTo(x, y);
    else hexagono.lineTo(x, y);
  }
  const hueco = new THREE.Path();
  hueco.absarc(0, 0, 0.26, 0, Math.PI * 2, true);
  hexagono.holes.push(hueco);
  const tuerca = new THREE.Mesh(
    new THREE.ExtrudeGeometry(hexagono, {
      depth: 0.3,
      bevelSize: 0.04,
      bevelThickness: 0.04,
      bevelSegments: 3,
    }),
    material,
  );
  tuerca.position.set(-4.6, -1.6, 1.6);
  const cubo = new THREE.Mesh(
    new RoundedBoxGeometry(0.75, 0.75, 0.75, 4, 0.1),
    new THREE.MeshStandardMaterial({ color: 0xf2f4ef, roughness: 0.6 }),
  );
  cubo.position.set(4.7, -2, 2);
  grupo.add(tuerca, cubo);
  return { grupo, tuerca, cubo };
}

const suavizar = (a: number, b: number, t: number) => a + (b - a) * t;
const acotar = (v: number) => Math.min(1, Math.max(0, v));

const TOMAS = [
  { pos: [0.6, 1.5, 16.5], mira: [0.2, -0.3, 0], giro: -0.62 },
  { pos: [1.2, 0.9, 11], mira: [0, -0.5, 0], giro: -0.14 },
  { pos: [-1.4, 2, 12.5], mira: [0.2, -0.5, 0], giro: 0.62 },
] as const;

export function crearEscena(lienzo: HTMLCanvasElement): EscenaImpresora {
  const renderer = new THREE.WebGLRenderer({
    canvas: lienzo,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.02;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const escena = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const entorno = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  escena.environment = entorno;
  escena.environmentIntensity = 0.75;

  const camara = new THREE.PerspectiveCamera(32, 1, 0.1, 80);
  const luz = new THREE.DirectionalLight(0xffffff, 2.2);
  luz.position.set(5, 11, 8);
  luz.castShadow = true;
  luz.shadow.mapSize.set(1536, 1536);
  luz.shadow.camera.left = -8;
  luz.shadow.camera.right = 8;
  luz.shadow.camera.top = 8;
  luz.shadow.camera.bottom = -8;
  luz.shadow.radius = 5;
  escena.add(luz);

  const cuerpo = new THREE.MeshPhysicalMaterial({
    color: COLOR.cuerpo,
    roughness: 0.42,
    clearcoat: 0.35,
    clearcoatRoughness: 0.5,
  });
  const oscuro = new THREE.MeshStandardMaterial({
    color: COLOR.interior,
    roughness: 0.5,
    metalness: 0.2,
  });
  const acero = new THREE.MeshStandardMaterial({
    color: COLOR.acero,
    metalness: 1,
    roughness: 0.28,
  });

  const impresora = new THREE.Group();
  escena.add(impresora);
  impresora.add(crearChasis(cuerpo, oscuro));

  const tablero = crearTablero(oscuro);
  impresora.add(tablero.pantalla, tablero.perilla);

  const cama = new THREE.Mesh(
    new RoundedBoxGeometry(3.6, 0.1, 3.5, 3, 0.03),
    new THREE.MeshStandardMaterial({ color: 0x1d2b35, roughness: 0.35 }),
  );
  cama.position.y = BASE_PIEZA - 0.05;
  cama.castShadow = true;
  cama.receiveShadow = true;
  impresora.add(cama);

  for (const x of [-2.15, 2.15]) {
    for (const z of [-1.6, 1.5]) {
      const eje = barra(0.05, 3.9, acero);
      eje.position.set(x, 0, z);
      impresora.add(eje);
    }
  }

  const portico = new THREE.Group();
  for (const z of [-0.14, 0.14]) {
    const eje = barra(0.05, 4.4, acero);
    eje.rotation.z = Math.PI / 2;
    eje.position.z = z;
    portico.add(eje);
  }
  for (const x of [-2.15, 2.15]) {
    const soporte = new THREE.Mesh(
      new RoundedBoxGeometry(0.42, 0.42, 0.62, 3, 0.05),
      oscuro,
    );
    soporte.position.x = x;
    portico.add(soporte);
  }
  const { carro, aspas } = crearCabezal(oscuro, acero);
  portico.add(carro);
  impresora.add(portico);

  const bobina = crearBobina(oscuro);
  impresora.add(bobina);
  const { malla: pieza, voxeles } = crearPieza();
  impresora.add(pieza);
  const sueltas = crearPiezasSueltas();
  impresora.add(sueltas.grupo);

  const piso = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 40),
    new THREE.ShadowMaterial({ opacity: 0.16 }),
  );
  piso.rotation.x = -Math.PI / 2;
  piso.position.y = -2.86;
  piso.receiveShadow = true;
  impresora.add(piso);

  const materialTubo = new THREE.MeshStandardMaterial({
    color: COLOR.filamento,
    roughness: 0.4,
  });
  const tubo = new THREE.Mesh(new THREE.BufferGeometry(), materialTubo);
  impresora.add(tubo);

  const estado = {
    avance: 0,
    avanceVisto: 0,
    giro: 0,
    giroVisto: 0,
    voxel: 0,
    porcentaje: -1,
  };
  const cabeza = new THREE.Vector3(0, 0.8, 0);
  const objetivo = new THREE.Vector3();
  const mirada = new THREE.Vector3();
  const reloj = new THREE.Clock();
  let oscilacion = 0;

  const actualizarTubo = () => {
    const curva = new THREE.CatmullRomCurve3([
      new THREE.Vector3(3.75, 1.55, -0.9),
      new THREE.Vector3(2.6, 3.5, -0.6),
      new THREE.Vector3(cabeza.x * 0.6, 3.1, cabeza.z * 0.4),
      new THREE.Vector3(
        carro.position.x,
        portico.position.y + 0.4,
        portico.position.z,
      ),
    ]);
    tubo.geometry.dispose();
    tubo.geometry = new THREE.TubeGeometry(curva, 26, 0.035, 8, false);
  };

  const encuadrar = (p: number) => {
    const tramo = p < 0.5 ? 0 : 1;
    const t = (p - tramo * 0.5) * 2;
    const suave = t * t * (3 - 2 * t);
    const a = TOMAS[tramo] ?? TOMAS[0];
    const b = TOMAS[tramo + 1] ?? TOMAS[2];
    // En vertical la impresora debe caber a lo ancho: la cámara se aleja.
    const aspecto = camara.aspect;
    const alejar = aspecto < 1 ? 1.75 : aspecto < 1.3 ? 1.3 : 1;
    camara.position.set(
      suavizar(a.pos[0], b.pos[0], suave),
      suavizar(a.pos[1], b.pos[1], suave),
      suavizar(a.pos[2], b.pos[2], suave) * alejar,
    );
    mirada.set(
      suavizar(a.mira[0], b.mira[0], suave),
      suavizar(a.mira[1], b.mira[1], suave),
      suavizar(a.mira[2], b.mira[2], suave),
    );
    camara.lookAt(mirada);
    impresora.rotation.y = suavizar(a.giro, b.giro, suave) + estado.giroVisto;
  };

  const imprimir = (p: number, dt: number) => {
    const progreso = acotar((p - 0.16) / 0.62);
    const total = voxeles.length;
    const cuenta = Math.round(progreso * total);
    pieza.count = cuenta;
    const ultimo = voxeles[Math.max(0, cuenta - 1)];
    const imprimiendo = progreso > 0 && progreso < 1;
    if (imprimiendo && ultimo) {
      objetivo.set(ultimo.x, ultimo.y + ALTO_VOXEL + 0.72, ultimo.z);
    } else {
      objetivo.set(progreso >= 1 ? -1.7 : 0, 1, -0.2);
    }
    cabeza.lerp(objetivo, 1 - Math.exp(-dt * 9));
    carro.position.x = cabeza.x;
    portico.position.y = cabeza.y;
    portico.position.z = cabeza.z;
    actualizarTubo();
    if (imprimiendo) bobina.rotation.x += dt * 0.9;
    aspas.rotation.y += dt * (imprimiendo ? 16 : 3);
    const porcentaje = Math.round(progreso * 100);
    if (porcentaje !== estado.porcentaje) {
      estado.porcentaje = porcentaje;
      tablero.pintar(porcentaje);
    }
  };

  const cuadro = () => {
    const dt = Math.min(reloj.getDelta(), 0.05);
    oscilacion += dt;
    estado.avanceVisto +=
      (estado.avance - estado.avanceVisto) * (1 - Math.exp(-dt * 6));
    estado.giroVisto +=
      (estado.giro - estado.giroVisto) * (1 - Math.exp(-dt * 5));
    encuadrar(estado.avanceVisto);
    imprimir(estado.avanceVisto, dt);
    sueltas.tuerca.rotation.set(oscilacion * 0.4, oscilacion * 0.3, 0);
    sueltas.tuerca.position.y = -1.6 + Math.sin(oscilacion * 0.8) * 0.16;
    sueltas.cubo.rotation.y = oscilacion * 0.25;
    sueltas.cubo.position.y = -2 + Math.cos(oscilacion * 0.7) * 0.12;
    renderer.render(escena, camara);
  };

  const redimensionar = () => {
    const { clientWidth: ancho, clientHeight: alto } = lienzo;
    if (!ancho || !alto) return;
    renderer.setSize(ancho, alto, false);
    camara.aspect = ancho / alto;
    camara.updateProjectionMatrix();
  };

  redimensionar();
  encuadrar(0);
  renderer.render(escena, camara);

  return {
    fijarAvance: (avance) => {
      estado.avance = acotar(avance);
    },
    fijarGiro: (giro) => {
      estado.giro = giro;
    },
    redimensionar,
    activar: (activa) => {
      if (activa) reloj.getDelta();
      renderer.setAnimationLoop(activa ? cuadro : null);
    },
    destruir: () => {
      renderer.setAnimationLoop(null);
      tablero.textura.dispose();
      tubo.geometry.dispose();
      entorno.dispose();
      pmrem.dispose();
      renderer.dispose();
    },
  };
}
