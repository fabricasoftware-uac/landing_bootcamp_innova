// biome-ignore-all format: transcripción fija del documento.
// Transcrito de public/documentos/terminos-de-referencia.pdf. Si cambia el PDF, se vuelve a transcribir.

export interface Fragmento {
  texto: string;
  negrita?: boolean;
  cursiva?: boolean;
}

export type BloqueTerminos =
  | { tipo: "titulo"; nivel: 1; texto: string }
  | { tipo: "titulo"; nivel: 2; id: string; numero: string; texto: string }
  | { tipo: "parrafo"; fragmentos: Fragmento[]; centrado?: boolean }
  | { tipo: "lista"; ordenada: boolean; inicio: number; items: Fragmento[][] }
  | { tipo: "tabla"; encabezados: string[]; filas: string[][] };

/** SHA-256 del PDF del que sale este texto. */
export const huellaTerminos = "33926f23b641f2972536588ab2b7238dffb871c586f51a620c15c22a4296f3c6";

export const bloquesTerminos: readonly BloqueTerminos[] = [
  {
    "tipo": "titulo",
    "nivel": 1,
    "texto": "CAUCA INNOVA"
  },
  {
    "tipo": "parrafo",
    "fragmentos": [
      {
        "texto": "Del conocimiento a la solución.",
        "cursiva": true
      }
    ],
    "centrado": true
  },
  {
    "tipo": "titulo",
    "nivel": 1,
    "texto": "TÉRMINOS DE REFERENCIA"
  },
  {
    "tipo": "titulo",
    "nivel": 2,
    "id": "presentacion",
    "numero": "1.",
    "texto": "PRESENTACIÓN"
  },
  {
    "tipo": "parrafo",
    "fragmentos": [
      {
        "texto": "Cauca INNOVA se proyecta como un escenario departamental de articulación, apropiación social del conocimiento y fortalecimiento del ecosistema de Ciencia, Tecnología e Innovación, donde el conocimiento deja de permanecer exclusivamente en las aulas y laboratorios para convertirse en soluciones capaces de responder a los desafíos reales del territorio. En este marco se propone el bootcamp de Semilleros de Investigación Cauca INNOVA, una experiencia intensiva de innovación y co-creación que reunirá estudiantes pertenecientes a semilleros de investigación de las instituciones de educación del departamento."
      }
    ]
  },
  {
    "tipo": "parrafo",
    "fragmentos": [
      {
        "texto": "Esta iniciativa busca conectar el talento joven con los desafíos del territorio, promoviendo el trabajo interdisciplinario, investigación aplicada y el desarrollo de propuestas innovadoras mediante herramientas de ideación, mentorías especializadas y prototipado. Durante el bootcamp los participantes fortalecerán sus capacidades, trabajarán colaborativamente en equipos y enfrentarán retos que deberán resolver mediante propuestas creativas y viables. La experiencia culminará con un espacio de presentación de soluciones ante un jurado especializado, que seleccionará la propuesta ganadora del premio."
      }
    ]
  },
  {
    "tipo": "titulo",
    "nivel": 2,
    "id": "justificacion",
    "numero": "2.",
    "texto": "JUSTIFICACIÓN"
  },
  {
    "tipo": "parrafo",
    "fragmentos": [
      {
        "texto": "El departamento del Cauca cuenta con un importante potencial académico, científico y creativo, donde los semilleros de investigación contribuyen a la formación de nuevos talentos en ciencia, tecnología e innovación. Sin embargo, uno de los principales desafíos consiste en fortalecer la conexión entre el conocimiento generado en estos espacios y las necesidades, problemáticas y oportunidades del territorio. Para ello, es necesario promover escenarios de aprendizaje que permitan a los estudiantes trascender la formación tradicional, intercambiar conocimientos y desarrollar capacidades para proponer soluciones a retos reales."
      }
    ]
  },
  {
    "tipo": "parrafo",
    "fragmentos": [
      {
        "texto": "En este contexto, la Gobernación del Cauca, a través de la Secretaría de Desarrollo Económico y Competitividad y la Uniautónoma del Cauca, impulsan Cauca INNOVA como una estrategia para fortalecer el ecosistema departamental de Ciencia, Tecnología e Innovación."
      }
    ]
  },
  {
    "tipo": "parrafo",
    "fragmentos": [
      {
        "texto": "En el marco de esta iniciativa, el Bootcamp de Semilleros de Investigación Cauca INNOVA se plantea como un espacio intensivo de formación experiencial, aprendizaje colaborativo y co-creación, en el que estudiantes de diferentes instituciones trabajarán alrededor de retos del territorio, fortaleciendo sus habilidades para identificar problemáticas, generar ideas, estructurar propuestas y desarrollar prototipos con potencial de aplicación."
      }
    ]
  },
  {
    "tipo": "parrafo",
    "fragmentos": [
      {
        "texto": "Esta iniciativa busca fortalecer el talento joven, promover el trabajo interdisciplinario, facilitar la articulación entre la academia, el sector productivo y las instituciones, y fomentar una cultura de innovación orientada a la generación de soluciones que contribuyan al desarrollo del Cauca."
      }
    ]
  },
  {
    "tipo": "titulo",
    "nivel": 2,
    "id": "objetivo-de-la-convocatoria",
    "numero": "2.",
    "texto": "OBJETIVO DE LA CONVOCATORIA"
  },
  {
    "tipo": "parrafo",
    "fragmentos": [
      {
        "texto": "Promover la articulación entre los semilleros de investigación de las instituciones de educación y los diferentes actores del ecosistema de Ciencia, Tecnología e Innovación, mediante una experiencia intensiva de innovación y co-creación orientada a la solución de retos reales del territorio."
      }
    ]
  },
  {
    "tipo": "titulo",
    "nivel": 2,
    "id": "dirigido-a",
    "numero": "3.",
    "texto": "DIRIGIDO A"
  },
  {
    "tipo": "parrafo",
    "fragmentos": [
      {
        "texto": "La convocatoria está dirigida a estudiantes que pertenezcan a semilleros de investigación de:"
      }
    ]
  },
  {
    "tipo": "lista",
    "ordenada": false,
    "inicio": 1,
    "items": [
      [
        {
          "texto": "Instituciones de educación superior, instituciones tecnológicas o técnicas."
        }
      ],
      [
        {
          "texto": "Instituciones educativas de educación básica y media del departamento del Cauca."
        }
      ]
    ]
  },
  {
    "tipo": "parrafo",
    "fragmentos": [
      {
        "texto": "Se promoverá la participación de jóvenes investigadores con interés en la ciencia, la tecnología, la innovación, el emprendimiento, la sostenibilidad y la transformación de su entorno."
      }
    ]
  },
  {
    "tipo": "titulo",
    "nivel": 2,
    "id": "cupos-y-conformacion-de-los-equipo",
    "numero": "4.",
    "texto": "CUPOS Y CONFORMACIÓN DE LOS EQUIPO"
  },
  {
    "tipo": "parrafo",
    "fragmentos": [
      {
        "texto": "La convocatoria contará con un máximo de 21 participantes, distribuidos en siete (7) equipos de máximo tres (3) integrantes cada uno. Las postulaciones podrán realizarse por equipos previamente conformados. Cada equipo deberá contar con máximo tres integrantes y presentar una única postulación."
      }
    ]
  },
  {
    "tipo": "parrafo",
    "fragmentos": [
      {
        "texto": "La organización podrá promover la diversidad institucional, disciplinar y territorial en la conformación de los equipos, de acuerdo con las postulaciones recibidas y las condiciones logísticas del bootcamp. Los cupos son limitados y la inscripción no garantiza automáticamente la selección. La participación estará sujeta al cumplimiento de los requisitos y a la confirmación oficial por parte de la organización."
      }
    ]
  },
  {
    "tipo": "titulo",
    "nivel": 2,
    "id": "requisitos-de-participacion",
    "numero": "5.",
    "texto": "REQUISITOS DE PARTICIPACIÓN"
  },
  {
    "tipo": "parrafo",
    "fragmentos": [
      {
        "texto": "Para participar en la convocatoria, los postulantes deberán cumplir con los siguientes requisitos:"
      }
    ]
  },
  {
    "tipo": "lista",
    "ordenada": true,
    "inicio": 1,
    "items": [
      [
        {
          "texto": "Estar matriculados en una institución educativa, institución de educación superior, institución tecnológica o institución de formación técnica con sede en el departamento del Cauca."
        }
      ],
      [
        {
          "texto": "Pertenecer a un semillero de investigación reconocido, registrado o avalado por su institución."
        }
      ],
      [
        {
          "texto": "Contar con disponibilidad para participar presencialmente durante la jornada completa del bootcamp."
        }
      ],
      [
        {
          "texto": "Diligenciar el formulario de inscripción con información veraz y completa."
        }
      ],
      [
        {
          "texto": "Presentar el aval del docente líder, tutor o responsable del semillero de investigación."
        }
      ],
      [
        {
          "texto": "Aceptar las condiciones de participación establecidas en estos términos de referencia."
        }
      ]
    ]
  },
  {
    "tipo": "parrafo",
    "fragmentos": [
      {
        "texto": "Para participantes menores de edad, será necesario presentar la autorización escrita de su padre, madre o representante legal."
      }
    ]
  },
  {
    "tipo": "titulo",
    "nivel": 2,
    "id": "postulacion",
    "numero": "6.",
    "texto": "POSTULACIÓN"
  },
  {
    "tipo": "parrafo",
    "fragmentos": [
      {
        "texto": "Cada equipo deberá presentar:"
      }
    ]
  },
  {
    "tipo": "lista",
    "ordenada": false,
    "inicio": 1,
    "items": [
      [
        {
          "texto": "Formulario de inscripción diligenciado."
        }
      ],
      [
        {
          "texto": "Nombres completos, documentos de identificación, correos electrónicos y teléfonos de contacto de los tres integrantes."
        }
      ],
      [
        {
          "texto": "Nombre de la institución educativa y del semillero de investigación."
        }
      ],
      [
        {
          "texto": "Nombre y datos de contacto del docente tutor o líder del semillero."
        }
      ],
      [
        {
          "texto": "Aval institucional o certificación de pertenencia al semillero."
        }
      ],
      [
        {
          "texto": "Descripción breve de los intereses del equipo y sus motivaciones para participar."
        }
      ],
      [
        {
          "texto": "Autorizaciones de padres, madres o representantes legales, cuando corresponda."
        }
      ],
      [
        {
          "texto": "Aceptación de los términos de referencia y de las condiciones de tratamiento de datos personales."
        }
      ]
    ]
  },
  {
    "tipo": "parrafo",
    "fragmentos": [
      {
        "texto": "La organización podrá solicitar aclaraciones o documentos complementarios cuando sean necesarios para verificar los requisitos."
      }
    ]
  },
  {
    "tipo": "titulo",
    "nivel": 2,
    "id": "metodologia",
    "numero": "7.",
    "texto": "METODOLOGÍA"
  },
  {
    "tipo": "parrafo",
    "fragmentos": [
      {
        "texto": "El Bootcamp de Semilleros de Investigación Cauca INNOVA se desarrollará mediante una metodología de aprendizaje experiencial, activo y colaborativo, fundamentada en principios de innovación educativa, aprendizaje basado en retos y co-creación interdisciplinaria."
      }
    ]
  },
  {
    "tipo": "parrafo",
    "fragmentos": [
      {
        "texto": "Esta metodología busca fortalecer las capacidades de investigación, creatividad, pensamiento crítico, trabajo en equipo y resolución de problemas de los participantes, mediante el acercamiento a desafíos reales del territorio y la construcción colectiva de propuestas innovadoras."
      }
    ]
  },
  {
    "tipo": "parrafo",
    "fragmentos": [
      {
        "texto": "La experiencia se desarrollará a través de cinco momentos:"
      }
    ]
  },
  {
    "tipo": "parrafo",
    "fragmentos": [
      {
        "texto": "Momento 1. Formación y activación.",
        "negrita": true
      },
      {
        "texto": " La jornada comenzará con un espacio práctico de aproximadamente dos horas en el que los participantes recibirán herramientas para abordar retos, generar ideas, construir soluciones, desarrollar prototipos y preparar un pitch."
      }
    ]
  },
  {
    "tipo": "parrafo",
    "fragmentos": [
      {
        "texto": "Momento 2. Presentación de retos.",
        "negrita": true
      },
      {
        "texto": " Empresas, instituciones y actores del ecosistema presentarán desafíos reales relacionados con necesidades del territorio y con las prioridades de Ciencia, Tecnología e Innovación."
      }
    ]
  },
  {
    "tipo": "parrafo",
    "fragmentos": [
      {
        "texto": "Momento 3. Conformación de equipos.",
        "negrita": true
      },
      {
        "texto": " Los participantes conformarán equipos interdisciplinarios e interinstitucionales, combinando conocimientos científicos, tecnológicos, creativos y empresariales."
      }
    ]
  },
  {
    "tipo": "parrafo",
    "fragmentos": [
      {
        "texto": "Momento 4. Laboratorio de co-creación.",
        "negrita": true
      },
      {
        "texto": " Los equipos trabajarán durante la jornada en el desarrollo de sus soluciones. Cada grupo contará con acompañamiento de mentores especializados que orientarán el proceso de acuerdo con las necesidades específicas de cada propuesta."
      }
    ]
  },
  {
    "tipo": "parrafo",
    "fragmentos": [
      {
        "texto": "Momento 5. Ring de Pitch.",
        "negrita": true
      },
      {
        "texto": " Como cierre de la experiencia, los equipos seleccionados presentarán sus soluciones ante un jurado especializado. Cada equipo presentará el reto identificado, la solución propuesta, su elemento innovador, el prototipo o representación de la solución, el impacto esperado y su posibilidad de implementación."
      }
    ]
  },
  {
    "tipo": "parrafo",
    "fragmentos": [
      {
        "texto": "La evaluación podrá considerar criterios como comprensión del reto, pertinencia, innovación, creatividad, viabilidad, impacto potencial, calidad del prototipo y capacidad de comunicación."
      }
    ]
  },
  {
    "tipo": "titulo",
    "nivel": 2,
    "id": "proceso-de-inscripcion",
    "numero": "7.",
    "texto": "PROCESO DE INSCRIPCIÓN"
  },
  {
    "tipo": "parrafo",
    "fragmentos": [
      {
        "texto": "La inscripción se realizará mediante la plataforma oficial https://caucainnova.uniautonoma.edu.co/"
      }
    ]
  },
  {
    "tipo": "titulo",
    "nivel": 2,
    "id": "cronograma-de-la-convocatoria",
    "numero": "8.",
    "texto": "CRONOGRAMA DE LA CONVOCATORIA"
  },
  {
    "tipo": "tabla",
    "encabezados": [
      "Actividad",
      "Fecha"
    ],
    "filas": [
      [
        "Apertura de la convocatoria",
        "6 de noviembre"
      ],
      [
        "Recepción de postulaciones",
        "10 de noviembre"
      ],
      [
        "Revisión y evaluación de postulaciones",
        "11 de noviembre"
      ],
      [
        "Publicación de equipos seleccionados y confirmación de participación",
        "12 de noviembre"
      ],
      [
        "Bootcamp de Investigación",
        "14 de noviembre de 2026"
      ]
    ]
  },
  {
    "tipo": "titulo",
    "nivel": 2,
    "id": "compromisos-de-los-participantes",
    "numero": "9.",
    "texto": "COMPROMISOS DE LOS PARTICIPANTES"
  },
  {
    "tipo": "lista",
    "ordenada": true,
    "inicio": 1,
    "items": [
      [
        {
          "texto": "Participar en la jornada completa del bootcamp."
        }
      ],
      [
        {
          "texto": "Proporcionar información veraz durante la inscripción."
        }
      ],
      [
        {
          "texto": "Cumplir las instrucciones de los facilitadores y mentores."
        }
      ],
      [
        {
          "texto": "Trabajar de manera colaborativa y respetuosa."
        }
      ],
      [
        {
          "texto": "Hacer uso adecuado de las instalaciones, materiales y equipos."
        }
      ],
      [
        {
          "texto": "Respetar los derechos de autor y la propiedad intelectual de terceros."
        }
      ],
      [
        {
          "texto": "Informar sobre el uso de herramientas, recursos o desarrollos preexistentes incorporados a sus soluciones."
        }
      ],
      [
        {
          "texto": "Presentar sus propuestas de manera ética y transparente."
        }
      ],
      [
        {
          "texto": "Cumplir las autorizaciones y protocolos aplicables a menores de edad."
        }
      ],
      [
        {
          "texto": "Aceptar las condiciones de evaluación y premiación comunicadas por la organización."
        }
      ]
    ]
  },
  {
    "tipo": "titulo",
    "nivel": 2,
    "id": "lineas-de-retos-del-bootcamp",
    "numero": "10.",
    "texto": "LÍNEAS DE RETOS DEL BOOTCAMP"
  },
  {
    "tipo": "lista",
    "ordenada": true,
    "inicio": 1,
    "items": [
      [
        {
          "texto": "Agroindustria inteligente y competitiva."
        }
      ],
      [
        {
          "texto": "Agua segura y comunidades sostenibles."
        }
      ],
      [
        {
          "texto": "Economía circular y aprovechamiento de residuos."
        }
      ],
      [
        {
          "texto": "Educación inteligente e inclusiva."
        }
      ],
      [
        {
          "texto": "Emprendimiento juvenil e inclusión económica."
        }
      ],
      [
        {
          "texto": "Turismo sostenible, cultura y territorio."
        }
      ],
      [
        {
          "texto": "Energía limpia."
        }
      ]
    ]
  },
  {
    "tipo": "titulo",
    "nivel": 2,
    "id": "premios-e-incentivos",
    "numero": "11.",
    "texto": "PREMIOS E INCENTIVOS"
  },
  {
    "tipo": "parrafo",
    "fragmentos": [
      {
        "texto": "Los incentivos tecnológicos estarán orientados a fortalecer las capacidades de investigación, innovación y prototipado de los participantes. Como reconocimiento a las propuestas más destacadas del bootcamp, se otorgarán los siguientes premios: un computador y una impresora 3D, destinados a impulsar el desarrollo de nuevas ideas y soluciones innovadoras."
      }
    ]
  },
  {
    "tipo": "titulo",
    "nivel": 2,
    "id": "autorizacion-de-imagen-y-tratamiento-de-datos",
    "numero": "12.",
    "texto": "AUTORIZACIÓN DE IMAGEN Y TRATAMIENTO DE DATOS"
  },
  {
    "tipo": "parrafo",
    "fragmentos": [
      {
        "texto": "La inscripción implica el tratamiento de los datos suministrados exclusivamente conforme a las finalidades informadas en el formulario, los términos de la convocatoria y la normativa colombiana aplicable. Los participantes que cumplan las condiciones de asistencia y participación recibirán un diploma o certificado del Bootcamp de Semilleros de Investigación Cauca INNOVA. La certificación reconocerá su participación en las actividades de formación, innovación, co-creación y desarrollo de soluciones."
      }
    ]
  }
];
