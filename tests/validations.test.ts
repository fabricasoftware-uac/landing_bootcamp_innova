import { describe, expect, it } from "vitest";
import {
  archivoOpcionalSchema,
  archivoRequeridoSchema,
  institucionTipoSchema,
  integranteSchema,
  MAX_FILE_SIZE_BYTES,
  paso1SemilleroSchema,
  paso2IntegrantesSchema,
  paso3MotivacionSchema,
  paso5DeclaracionSchema,
  postulacionCompletaSchema,
  tipoDocumentoIdentidadSchema,
} from "@/lib/validations/postulacion";

function crearArchivoMock(
  nombre: string,
  tamanoBytes: number,
  mimeType: string,
): File {
  const buffer = new Uint8Array(tamanoBytes);
  return new File([buffer], nombre, { type: mimeType });
}

function crearIntegrantesMock(menores: [boolean, boolean, boolean]) {
  return [
    {
      nombres_apellidos: "Carlos Andrés Pérez",
      tipo_documento: "CC" as const,
      numero_documento: "1061789456",
      correo_electronico: "carlos.perez@unicauca.edu.co",
      telefono: "3117894561",
      es_menor_edad: menores[0],
    },
    {
      nombres_apellidos: "María Camila López",
      tipo_documento: "TI" as const,
      numero_documento: "1061998877",
      correo_electronico: "maria.lopez@unicauca.edu.co",
      telefono: "3124567890",
      es_menor_edad: menores[1],
    },
    {
      nombres_apellidos: "Juan David Gómez",
      tipo_documento: "CC" as const,
      numero_documento: "1061445566",
      correo_electronico: "juan.gomez@unicauca.edu.co",
      telefono: "3139876543",
      es_menor_edad: menores[2],
    },
  ];
}

const MOTIVACION_VALIDA_LARGA =
  "Nuestro semillero de investigación tiene un interés genuino en resolver las problemáticas de conectividad y agua potable en las zonas rurales del departamento del Cauca a través de prototipos de bajo costo basados en IoT y energías renovables comunitarias.";

describe("Validaciones de Paso 1: Semillero e Institución", () => {
  const datosPaso1Validos = {
    institucion_nombre: "Universidad del Cauca",
    institucion_tipo: "superior" as const,
    semillero_nombre: "Semillero de Teleinformática (GTI)",
    tutor_nombre: "Dr. Roberto Carlos Muñoz",
    tutor_email: "rmunoz@unicauca.edu.co",
    tutor_telefono: "3156789012",
  };

  it("acepta datos completos y válidos para educación superior", () => {
    const res = paso1SemilleroSchema.safeParse(datosPaso1Validos);
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.tutor_email).toBe("rmunoz@unicauca.edu.co");
    }
  });

  it("acepta institución de básica y media", () => {
    const res = paso1SemilleroSchema.safeParse({
      ...datosPaso1Validos,
      institucion_nombre: "Institución Educativa Técnico Industrial",
      institucion_tipo: "basica_media",
      semillero_nombre: "Semillero Pequeños Científicos",
    });
    expect(res.success).toBe(true);
  });

  it("normaliza el email del tutor a minúsculas y elimina espacios en blanco", () => {
    const res = paso1SemilleroSchema.safeParse({
      ...datosPaso1Validos,
      tutor_email: "  TUTOR.LIDER@UNICAUCA.EDU.CO  ",
      institucion_nombre: "  Universidad del Cauca  ",
    });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.tutor_email).toBe("tutor.lider@unicauca.edu.co");
      expect(res.data.institucion_nombre).toBe("Universidad del Cauca");
    }
  });

  it("rechaza institución_tipo diferente a 'basica_media' o 'superior'", () => {
    const res1 = institucionTipoSchema.safeParse("universidad");
    expect(res1.success).toBe(false);

    const res2 = paso1SemilleroSchema.safeParse({
      ...datosPaso1Validos,
      institucion_tipo: "posgrado",
    });
    expect(res2.success).toBe(false);
  });

  it("rechaza campos con menos de 3 caracteres en institución, semillero y tutor", () => {
    const resInst = paso1SemilleroSchema.safeParse({
      ...datosPaso1Validos,
      institucion_nombre: "AB",
    });
    expect(resInst.success).toBe(false);

    const resSemi = paso1SemilleroSchema.safeParse({
      ...datosPaso1Validos,
      semillero_nombre: "XY",
    });
    expect(resSemi.success).toBe(false);

    const resTutor = paso1SemilleroSchema.safeParse({
      ...datosPaso1Validos,
      tutor_nombre: "Dr",
    });
    expect(resTutor.success).toBe(false);
  });

  it("rechaza emails del tutor mal formados", () => {
    const correosInvalidos = [
      "correo-sin-arroba",
      "@unicauca.edu.co",
      "tutor@",
      "tutor @dominio.com",
      "tutor@.com",
    ];

    for (const email of correosInvalidos) {
      const res = paso1SemilleroSchema.safeParse({
        ...datosPaso1Validos,
        tutor_email: email,
      });
      expect(res.success).toBe(false);
    }
  });

  it("rechaza teléfonos del tutor con menos de 7 caracteres", () => {
    const res = paso1SemilleroSchema.safeParse({
      ...datosPaso1Validos,
      tutor_telefono: "123456",
    });
    expect(res.success).toBe(false);
  });
});

describe("Validaciones de Paso 2: Integrantes (Restricción de exactamente 3)", () => {
  const integranteBase = {
    nombres_apellidos: "Ana Sofía Benavides",
    tipo_documento: "CC" as const,
    numero_documento: "1061987456",
    correo_electronico: "ana.benavides@unicauca.edu.co",
    telefono: "3104561234",
    es_menor_edad: false,
  };

  it("acepta un equipo conformado por exactamente 3 integrantes válidos", () => {
    const res = paso2IntegrantesSchema.safeParse({
      integrantes: crearIntegrantesMock([false, false, false]),
    });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.integrantes).toHaveLength(3);
    }
  });

  it("rechaza equipo con 0 integrantes", () => {
    const res = paso2IntegrantesSchema.safeParse({
      integrantes: [],
    });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues[0]?.message).toContain("exactamente 3");
    }
  });

  it("rechaza equipo con 1 integrante", () => {
    const res = paso2IntegrantesSchema.safeParse({
      integrantes: [integranteBase],
    });
    expect(res.success).toBe(false);
  });

  it("rechaza equipo con 2 integrantes", () => {
    const res = paso2IntegrantesSchema.safeParse({
      integrantes: [
        integranteBase,
        { ...integranteBase, numero_documento: "1061987457" },
      ],
    });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues[0]?.message).toContain("exactamente 3");
    }
  });

  it("rechaza equipo con 4 integrantes (más de 3)", () => {
    const res = paso2IntegrantesSchema.safeParse({
      integrantes: [
        ...crearIntegrantesMock([false, false, false]),
        {
          nombres_apellidos: "Cuarto Integrante Sobrante",
          tipo_documento: "CC",
          numero_documento: "1061000000",
          correo_electronico: "cuarto@unicauca.edu.co",
          telefono: "3109999999",
          es_menor_edad: false,
        },
      ],
    });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues[0]?.message).toContain("exactamente 3");
    }
  });

  it("valida tipos de documento permitidos: CC, TI, CE, Pasaporte", () => {
    const tiposPermitidos = ["CC", "TI", "CE", "Pasaporte"] as const;
    for (const tipo of tiposPermitidos) {
      expect(tipoDocumentoIdentidadSchema.safeParse(tipo).success).toBe(true);
    }

    const tiposInvalidos = ["DNI", "RUT", "NIT", "CURP", "CEDULA", ""];
    for (const tipo of tiposInvalidos) {
      expect(tipoDocumentoIdentidadSchema.safeParse(tipo).success).toBe(false);
    }
  });

  it("valida integridad de campos del integrante individual", () => {
    // Nombres muy cortos
    expect(
      integranteSchema.safeParse({ ...integranteBase, nombres_apellidos: "Al" })
        .success,
    ).toBe(false);

    // Número de documento muy corto (< 4)
    expect(
      integranteSchema.safeParse({ ...integranteBase, numero_documento: "123" })
        .success,
    ).toBe(false);

    // Email inválido
    expect(
      integranteSchema.safeParse({
        ...integranteBase,
        correo_electronico: "invalido",
      }).success,
    ).toBe(false);

    // Teléfono < 7 caracteres
    expect(
      integranteSchema.safeParse({ ...integranteBase, telefono: "12345" })
        .success,
    ).toBe(false);

    // es_menor_edad no booleano
    expect(
      integranteSchema.safeParse({
        ...integranteBase,
        es_menor_edad: "si" as unknown as boolean,
      }).success,
    ).toBe(false);
  });
});

describe("Validaciones de Paso 3: Motivación e Intereses", () => {
  it("rechaza textos con menos de 50 caracteres", () => {
    const textosCortos = [
      "",
      "Nos gusta innovar",
      "Queremos participar en el Bootcamp de semilleros.", // 49 chars
    ];

    for (const texto of textosCortos) {
      const res = paso3MotivacionSchema.safeParse({
        motivacion_intereses: texto,
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0]?.message).toContain(
          "al menos 50 caracteres",
        );
      }
    }
  });

  it("rechaza textos con más de 2500 caracteres", () => {
    const texto2501 = "a".repeat(2501);
    const res = paso3MotivacionSchema.safeParse({
      motivacion_intereses: texto2501,
    });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues[0]?.message).toContain(
        "no debe exceder los 2500 caracteres",
      );
    }
  });

  it("acepta textos con exactamente 50 caracteres y en rangos válidos", () => {
    const texto50 = "12345678901234567890123456789012345678901234567890";
    expect(texto50.length).toBe(50);

    const res50 = paso3MotivacionSchema.safeParse({
      motivacion_intereses: texto50,
    });
    expect(res50.success).toBe(true);

    const resLarga = paso3MotivacionSchema.safeParse({
      motivacion_intereses: MOTIVACION_VALIDA_LARGA,
    });
    expect(resLarga.success).toBe(true);

    const texto2500 = "a".repeat(2500);
    const res2500 = paso3MotivacionSchema.safeParse({
      motivacion_intereses: texto2500,
    });
    expect(res2500.success).toBe(true);
  });

  it("aplica trim y no cuenta espacios en blanco al inicio o final para evadir el mínimo", () => {
    const espaciosYCorto = "        Hola mundo        ";
    const res = paso3MotivacionSchema.safeParse({
      motivacion_intereses: espaciosYCorto,
    });
    expect(res.success).toBe(false);
  });
});

describe("Validaciones de Paso 4: Archivos y Restricciones Técnicas", () => {
  it("acepta archivos PDF, JPEG y PNG de tamaño válido", () => {
    const pdf = crearArchivoMock("aval.pdf", 1024 * 100, "application/pdf");
    const jpg = crearArchivoMock("doc1.jpg", 1024 * 50, "image/jpeg");
    const png = crearArchivoMock("doc2.png", 1024 * 60, "image/png");

    expect(archivoRequeridoSchema.safeParse(pdf).success).toBe(true);
    expect(archivoRequeridoSchema.safeParse(jpg).success).toBe(true);
    expect(archivoRequeridoSchema.safeParse(png).success).toBe(true);
  });

  it("rechaza archivos vacíos de 0 bytes", () => {
    const archivoVacio = crearArchivoMock("vacio.pdf", 0, "application/pdf");
    const res = archivoRequeridoSchema.safeParse(archivoVacio);
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues[0]?.message).toContain("no puede estar vacío");
    }
  });

  it("rechaza archivos mayores a 10 MB (10 * 1024 * 1024 bytes)", () => {
    const limiteExacto = crearArchivoMock(
      "limite.pdf",
      MAX_FILE_SIZE_BYTES,
      "application/pdf",
    );
    expect(archivoRequeridoSchema.safeParse(limiteExacto).success).toBe(true);

    const archivoExcedido = crearArchivoMock(
      "pesado.pdf",
      MAX_FILE_SIZE_BYTES + 1,
      "application/pdf",
    );
    const res = archivoRequeridoSchema.safeParse(archivoExcedido);
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues[0]?.message).toContain("10 MB");
    }
  });

  it("rechaza tipos de archivos peligrosos o no permitidos (.exe, .sh, scripts, docx, zip)", () => {
    const archivosProhibidos = [
      crearArchivoMock("virus.exe", 1024, "application/x-msdownload"),
      crearArchivoMock("script.sh", 1024, "application/x-sh"),
      crearArchivoMock("codigo.js", 1024, "application/javascript"),
      crearArchivoMock("archivo.zip", 1024, "application/zip"),
      crearArchivoMock(
        "documento.docx",
        1024,
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ),
      crearArchivoMock("pagina.html", 1024, "text/html"),
    ];

    for (const archivo of archivosProhibidos) {
      const res = archivoRequeridoSchema.safeParse(archivo);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0]?.message).toContain(
          "Formato de archivo no permitido",
        );
      }
    }
  });

  it("permite que archivoOpcionalSchema sea undefined o null sin fallar", () => {
    expect(archivoOpcionalSchema.safeParse(undefined).success).toBe(true);
    expect(archivoOpcionalSchema.safeParse(null).success).toBe(true);
  });

  it("valida archivo opcional si se proporciona (debe respetar límites y tipos)", () => {
    const exe = crearArchivoMock(
      "malware.exe",
      1024,
      "application/x-msdownload",
    );
    expect(archivoOpcionalSchema.safeParse(exe).success).toBe(false);

    const pesado = crearArchivoMock(
      "pesado.pdf",
      MAX_FILE_SIZE_BYTES + 10,
      "application/pdf",
    );
    expect(archivoOpcionalSchema.safeParse(pesado).success).toBe(false);

    const valido = crearArchivoMock("auth.pdf", 1024 * 500, "application/pdf");
    expect(archivoOpcionalSchema.safeParse(valido).success).toBe(true);
  });
});

describe("Validaciones de Paso 5: Declaración Juramentada y Términos", () => {
  it("acepta cuando todos los términos y declaraciones son estrictamente true", () => {
    const res = paso5DeclaracionSchema.safeParse({
      acepta_terminos: true,
      acepta_tratamiento_datos: true,
      declara_veracidad: true,
    });
    expect(res.success).toBe(true);
  });

  it("rechaza si no se aceptan los Términos de Referencia", () => {
    const res = paso5DeclaracionSchema.safeParse({
      acepta_terminos: false,
      acepta_tratamiento_datos: true,
      declara_veracidad: true,
    });
    expect(res.success).toBe(false);
  });

  it("rechaza si no se acepta Habeas Data (Tratamiento de Datos)", () => {
    const res = paso5DeclaracionSchema.safeParse({
      acepta_terminos: true,
      acepta_tratamiento_datos: false,
      declara_veracidad: true,
    });
    expect(res.success).toBe(false);
  });

  it("rechaza si no se declara la veracidad bajo juramento", () => {
    const res = paso5DeclaracionSchema.safeParse({
      acepta_terminos: true,
      acepta_tratamiento_datos: true,
      declara_veracidad: false,
    });
    expect(res.success).toBe(false);
  });
});

describe("Regla Condicional Crítica de Menores de Edad en Postulación Completa", () => {
  const basePostulacionCompleta = {
    institucion_nombre: "Colegio Mayor del Cauca",
    institucion_tipo: "superior" as const,
    semillero_nombre: "Semillero de Diseño y Arte",
    tutor_nombre: "Carlos Eduardo Paz",
    tutor_email: "cpaz@colmayor.edu.co",
    tutor_telefono: "3189998877",
    motivacion_intereses: MOTIVACION_VALIDA_LARGA,
    aval_semillero: crearArchivoMock("aval.pdf", 50000, "application/pdf"),
    doc_identidad_1: crearArchivoMock("doc1.pdf", 50000, "application/pdf"),
    doc_identidad_2: crearArchivoMock("doc2.pdf", 50000, "application/pdf"),
    doc_identidad_3: crearArchivoMock("doc3.pdf", 50000, "application/pdf"),
    acepta_terminos: true as const,
    acepta_tratamiento_datos: true as const,
    declara_veracidad: true as const,
  };

  it("Caso A: Equipo donde todos son mayores de edad -> autorizacion_menores NO es exigida", () => {
    const integrantesTodosMayores = crearIntegrantesMock([false, false, false]);

    const payload = {
      ...basePostulacionCompleta,
      integrantes: integrantesTodosMayores,
      autorizacion_menores: undefined,
    };

    const res = postulacionCompletaSchema.safeParse(payload);
    expect(res.success).toBe(true);
  });

  it("Caso B: Equipo con un menor de edad (integrante 2) SIN autorización -> falla en autorizacion_menores", () => {
    const integrantesConMenor = crearIntegrantesMock([false, true, false]);

    const payload = {
      ...basePostulacionCompleta,
      integrantes: integrantesConMenor,
      autorizacion_menores: undefined,
    };

    const res = postulacionCompletaSchema.safeParse(payload);
    expect(res.success).toBe(false);

    if (!res.success) {
      const issueAuth = res.error.issues.find(
        (i) => i.path[0] === "autorizacion_menores",
      );
      expect(issueAuth).toBeDefined();
      expect(issueAuth?.message).toContain(
        "Al menos uno de los integrantes es menor de 18 años. Es obligatorio adjuntar el formato de autorización",
      );
    }
  });

  it("Caso B: Equipo con los 3 integrantes menores de edad SIN autorización -> falla en autorizacion_menores", () => {
    const integrantesTresMenores = crearIntegrantesMock([true, true, true]);

    const payload = {
      ...basePostulacionCompleta,
      integrantes: integrantesTresMenores,
      autorizacion_menores: null,
    };

    const res = postulacionCompletaSchema.safeParse(payload);
    expect(res.success).toBe(false);

    if (!res.success) {
      const errorPaths = res.error.issues.map((i) => i.path.join("."));
      expect(errorPaths).toContain("autorizacion_menores");
    }
  });

  it("Caso B con archivo válido: Equipo con menor de edad Y formato de autorización adjunto -> pasa exitosamente", () => {
    const integrantesConMenor = crearIntegrantesMock([true, false, false]);
    const archivoAutorizacionValido = crearArchivoMock(
      "autorizacion_acudiente_firmada.pdf",
      1024 * 300,
      "application/pdf",
    );

    const payload = {
      ...basePostulacionCompleta,
      integrantes: integrantesConMenor,
      autorizacion_menores: archivoAutorizacionValido,
    };

    const res = postulacionCompletaSchema.safeParse(payload);
    expect(res.success).toBe(true);
  });

  it("Rechaza postulación completa si el equipo tiene 2 integrantes aunque todos los demás campos sean válidos", () => {
    const soloDosIntegrantes = crearIntegrantesMock([
      false,
      false,
      false,
    ]).slice(0, 2);

    const payload = {
      ...basePostulacionCompleta,
      integrantes: soloDosIntegrantes,
    };

    const res = postulacionCompletaSchema.safeParse(payload);
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues.some((i) => i.path[0] === "integrantes")).toBe(
        true,
      );
    }
  });
});
