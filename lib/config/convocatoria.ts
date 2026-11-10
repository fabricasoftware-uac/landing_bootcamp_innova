export const ESTADO_CONVOCATORIA = {
  abierta: false,
  motivo: "cupos_agotados" as const,
  badge: "Cupos agotados",
  tituloCierre: "Inscripciones cerradas · Cupos agotados",
  mensajeCierre:
    "Agradecemos a todos los semilleros de investigación del departamento del Cauca por su extraordinaria acogida y participación. Los cupos disponibles para el Bootcamp Cauca INNOVA 2026 se han completado en su totalidad.",
  subtituloCierre:
    "El proceso de recepción de postulaciones ha finalizado. Nuestro equipo evaluador se encuentra revisando las propuestas radicadas.",
  cronograma: [
    {
      hito: "Cierre de postulaciones",
      fecha: "10 de noviembre de 2026",
      estado: "completado",
    },
    {
      hito: "Revisión y evaluación",
      fecha: "11 de noviembre de 2026",
      estado: "en_proceso",
    },
    {
      hito: "Publicación de seleccionados",
      fecha: "12 de noviembre de 2026",
      estado: "pendiente",
    },
    {
      hito: "Bootcamp presencial",
      fecha: "14 de noviembre de 2026",
      estado: "pendiente",
    },
  ],
} as const;
