/*
 * Datos del responsable y del tratamiento. Cada valor sale de una fuente oficial
 * listada en docs/legal.md; lo que no se pudo verificar queda en null a propósito
 * y la página muestra DATO_PENDIENTE. No completes un null sin citar la fuente.
 */

export const FECHA_ACTUALIZACION = "6 de noviembre de 2026";
export const DATO_PENDIENTE = "La organización publicará este dato";

export interface DocumentoOficial {
  nombre: string;
  url: string;
}

export interface ResponsableTratamiento {
  clave: string;
  nombre: string;
  nit: string | null;
  dependencia: string | null;
  domicilio: string;
  direccion: string | null;
  correoDatos: string | null;
  telefono: string | null;
  sitio: string;
  politicas: readonly DocumentoOficial[];
}

export const responsables: readonly ResponsableTratamiento[] = [
  {
    clave: "gobernacion",
    nombre: "Departamento del Cauca (Gobernación del Cauca)",
    nit: "891.580.016-8",
    dependencia: "Secretaría de Desarrollo Económico y Competitividad",
    domicilio: "Popayán, Cauca, Colombia",
    direccion:
      "Sede central: Carrera 7 Calle 4 Esquina. Secretaría: Carrera 6 Calle 22N, Edificio de Infraestructura",
    correoDatos: "contactenos@cauca.gov.co",
    telefono: "+57 314 517 9711",
    sitio: "https://www.cauca.gov.co",
    politicas: [
      {
        nombre: "Política de tratamiento de datos personales (GT-PL-01)",
        url: "https://intranet.cauca.gov.co/phocadownload/politicas/politica-tratamiento-datos-personales.pdf",
      },
      {
        nombre: "Políticas de privacidad y condiciones de uso",
        url: "https://www.cauca.gov.co/Paginas/Politicas-de-Privacidad-y-Condiciones-de-Uso.aspx",
      },
    ],
  },
  {
    clave: "uniautonoma",
    nombre: "Corporación Universitaria Autónoma del Cauca",
    nit: "891.501.766-6",
    dependencia: null,
    domicilio: "Popayán, Cauca, Colombia",
    direccion: "Calle 5 No. 3-85",
    correoDatos: "habeasdata@uniautonoma.edu.co",
    // Sus fuentes dan números distintos y con el formato anterior a 2021: ver docs/legal.md.
    telefono: null,
    sitio: "https://portal.uniautonoma.edu.co",
    politicas: [
      {
        nombre:
          "Política de tratamiento de datos personales (Resolución 0186 de 2018)",
        url: "https://portal.uniautonoma.edu.co/wp-content/uploads/2025/05/POLITICA-TRATAMIENTO-DATOS-PERSONALES-RES-0186-DE-2018.pdf",
      },
    ],
  },
];

/** Región de los servidores de Supabase: no se conoce desde el código. */
export const regionAlmacenamiento: string | null = null;

/** Tiempo de conservación después de la convocatoria: lo define la organización. */
export const plazoConservacion: string | null = null;

export interface EntradaAlmacenamiento {
  nombre: string;
  tipo: string;
  proposito: string;
  duracion: string;
}

/** Inventario real del navegador. Si el código agrega una clave, se declara aquí. */
