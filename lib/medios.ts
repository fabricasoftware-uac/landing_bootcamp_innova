/**
 * Catálogo único de medios externos: agregar o cambiar un clip o foto empieza aquí.
 * Los videos viven en public/video como <nombre>.mp4 (1600 px), <nombre>-movil.mp4 (854 px)
 * y <nombre>.webp (póster). Receta de compresión en docs/medios.md.
 */
export interface Credito {
  titulo: string;
  autor: string;
  licencia: string;
  enlace: string;
}

export const CREDITOS = {
  dibujan: {
    titulo: "Boceto a mano",
    autor: "Ivan S",
    licencia: "Pexels",
    enlace:
      "https://www.pexels.com/video/a-person-drawing-on-a-white-paper-8126367/",
  },
  imprimen: {
    titulo: "Impresora 3D",
    autor: "Jakub Zerdzicki",
    licencia: "Pexels",
    enlace: "https://www.pexels.com/video/3d-printer-head-19378586/",
  },
  prueban: {
    titulo: "Pruebas de un prototipo",
    autor: "Mikhail Nilov",
    licencia: "Pexels",
    enlace:
      "https://www.pexels.com/video/engineers-working-on-a-robot-9244545/",
  },
  presentan: {
    titulo: "Equipo frente a un tablero",
    autor: "Alena Darmel",
    licencia: "Pexels",
    enlace:
      "https://www.pexels.com/video/people-having-a-discussion-at-work-7659665/",
  },
  pie: {
    titulo: "Impresora 3D en el taller",
    autor: "Jakub Zerdzicki",
    licencia: "Pexels",
    enlace:
      "https://www.pexels.com/video/modern-3d-printing-equipment-workshop-30260830/",
  },
  equipo: {
    titulo: "Equipo armando un robot",
    autor: "Mikhail Nilov",
    licencia: "Pexels",
    enlace: "https://www.pexels.com/video/coworkers-in-a-meeting-7683084/",
  },
  prepara: {
    titulo: "Trabajo con electrónica",
    autor: "Mikhail Nilov",
    licencia: "Pexels",
    enlace:
      "https://www.pexels.com/video/young-men-wearing-safety-glasses-talking-to-each-other-9244515/",
  },
  postula: {
    titulo: "Equipo planeando",
    autor: "Artem Podrez",
    licencia: "Pexels",
    enlace:
      "https://www.pexels.com/video/a-woman-making-a-presentation-in-a-business-meeting-5726136/",
  },
  seleccion: {
    titulo: "Presentación ante público",
    autor: "RDNE Stock project",
    licencia: "Pexels",
    enlace:
      "https://www.pexels.com/video/man-discussing-in-front-of-people-sitting-5762401/",
  },
  ideacion: {
    titulo: "Equipo en el taller",
    autor: "Mikhail Nilov",
    licencia: "Pexels",
    enlace: "https://www.pexels.com/photo/people-sitting-at-the-table-9242834/",
  },
  mentoria: {
    titulo: "Trabajo en electrónica",
    autor: "Bulat843 🌙",
    licencia: "Pexels",
    enlace:
      "https://www.pexels.com/photo/technician-soldering-circuit-board-at-workbench-38264272/",
  },
  prototipado: {
    titulo: "Impresora 3D",
    autor: "Jakub Zerdzicki",
    licencia: "Pexels",
    enlace:
      "https://www.pexels.com/photo/close-up-of-a-3d-printer-extruding-orange-plastic-31137405/",
  },
  jurado: {
    titulo: "Presentación en sala",
    autor: "Yan Krukau",
    licencia: "Pexels",
    enlace:
      "https://www.pexels.com/photo/a-man-in-blue-suit-jacket-standing-beside-the-whiteboard-7693148/",
  },
  menu1: {
    titulo: "Impresora 3D",
    autor: "Jakub Zerdzicki",
    licencia: "Pexels",
    enlace:
      "https://www.pexels.com/photo/vibrant-3d-printing-process-in-action-30720501/",
  },
  menu2: {
    titulo: "Soldadura de circuito",
    autor: "https://kaboompics.com/",
    licencia: "Pexels",
    enlace:
      "https://www.pexels.com/photo/man-doing-art-and-craft-at-table-at-home-7285977/",
  },
  menu3: {
    titulo: "Prototipo electrónico",
    autor: "Vladimir Srajber",
    licencia: "Pexels",
    enlace:
      "https://www.pexels.com/photo/kid-creating-an-electronic-device-15923763/",
  },
  menu4: {
    titulo: "Laboratorio de electrónica",
    autor: "Multitech Institute",
    licencia: "Pexels",
    enlace:
      "https://www.pexels.com/photo/man-working-in-electronics-and-ac-repair-lab-31800980/",
  },
  menu5: {
    titulo: "Presentación",
    autor: "Mikael Blomkvist",
    licencia: "Pexels",
    enlace:
      "https://www.pexels.com/photo/a-man-standing-in-front-of-the-room-6476782/",
  },
  popayan: {
    titulo: "Catedral de Popayán",
    autor: "Julian Alexis Daza Andrade",
    licencia: "CC BY-SA 3.0",
    enlace: "https://commons.wikimedia.org/w/index.php?curid=21101379",
  },
  purace: {
    titulo: "Frailejones en Puracé",
    autor: "Bernard Gagnon",
    licencia: "CC BY-SA 4.0",
    enlace: "https://commons.wikimedia.org/w/index.php?curid=97505367",
  },
  tierradentro: {
    titulo: "Pirámide de San Francisco, Tierradentro",
    autor: "CarlosE Duarte",
    licencia: "CC BY 3.0",
    enlace: "https://commons.wikimedia.org/w/index.php?curid=60588755",
  },
  guapi: {
    titulo: "Guapi, Cauca",
    autor: "Angeles2023",
    licencia: "CC BY-SA 4.0",
    enlace: "https://commons.wikimedia.org/w/index.php?curid=128257415",
  },
} as const satisfies Record<string, Credito>;

export type NombreMedio = keyof typeof CREDITOS;
