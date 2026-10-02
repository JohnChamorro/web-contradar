/**
 * REGISTRO DE SECTORES (seo/fase-2). Una entrada por página publicada en
 * /sectores/<slug>/. Lo leen el hub /sectores/, el layout de sector y sus
 * componentes (códigos UNSPSC y vocabulario).
 *
 * CÓDIGOS UNSPSC: cada código y su nombre se copiaron TEXTUALES del
 * clasificador que publica Colombia Compra Eficiente (traducción al castellano
 * de la versión 14 de UNSPSC, archivo clasificador_de_bienes_y_servicios_v14_1.xls
 * descargado de operaciones.colombiacompra.gov.co el 2026-10-02). Un código
 * que no esté en ese archivo NO entra aquí. Si CCE publica una versión nueva,
 * se revisan uno a uno contra ella.
 *
 * VOCABULARIO: palabras con las que las entidades nombran lo mismo en el
 * objeto del proceso. Es lo que explica que buscar una sola palabra deje
 * procesos por fuera (el caso «alcantarilla» de BusquedaInteligente.astro).
 */

export type NivelUnspsc = "Segmento" | "Familia" | "Clase" | "Producto";

export interface CodigoUnspsc {
  /** 8 dígitos, como los pide el SECOP (la clase 721410 es 72141000). */
  codigo: string;
  nombre: string;
  nivel: NivelUnspsc;
}

export interface Sector {
  slug: string;
  /** Nombre corto para tarjetas, migas y enlaces. */
  nombre: string;
  /** Icono Lucide (lo resuelve el hub). */
  icono: "building-2" | "drafting-compass" | "hospital" | "laptop" | "droplets";
  /** Una línea para la tarjeta del hub. */
  resumen: string;
  codigos: CodigoUnspsc[];
  vocabulario: string[];
}

/** Archivo oficial del que salen los códigos (va en `fuentes` de cada página). */
export const FUENTE_UNSPSC = {
  titulo: "Clasificador de bienes y servicios (UNSPSC v14 en castellano) — Colombia Compra Eficiente",
  url: "https://operaciones.colombiacompra.gov.co/clasificador-de-bienes-y-servicios",
  nota: "códigos y nombres copiados del archivo clasificador_de_bienes_y_servicios_v14_1.xls",
};

/** Guía oficial de CCE para codificar (dice qué se codifica y dónde). */
export const FUENTE_GUIA_UNSPSC = {
  titulo: "Guía para la codificación de bienes y servicios (G-CBS-02, v2, marzo de 2026) — Colombia Compra Eficiente",
  url: "https://colombiacompra.gov.co/wp-content/uploads/2025/05/Guia-para-la-codificacion-de-Bienes-y-Servicios-de-acuerdo-con-el-codigo-estandar-de-productos-y-servicios-de-Naciones-Unidas-G-CBS-02-V2-MAR2026.pdf",
  nota: "uso del UNSPSC en el PAA, el RUP y los requisitos habilitantes",
};

/* Normas verificadas el 2026-10-02 en secretariasenado.gov.co (http: el sitio
   no responde por https), en su texto vigente con sus modificaciones. Cada
   página toma las que cita. */
const SENADO = "http://www.secretariasenado.gov.co/senado/basedoc";
export const NORMAS = {
  ley80: { titulo: "Ley 80 de 1993", url: `${SENADO}/ley_0080_1993.html` },
  ley1150: { titulo: "Ley 1150 de 2007", url: `${SENADO}/ley_1150_2007.html` },
  ley1474: { titulo: "Ley 1474 de 2011", url: `${SENADO}/ley_1474_2011_pr001.html` },
  ley1882: { titulo: "Ley 1882 de 2018", url: `${SENADO}/ley_1882_2018.html` },
  ley2022: { titulo: "Ley 2022 de 2020", url: `${SENADO}/ley_2022_2020.html` },
  ley100: { titulo: "Ley 100 de 1993", url: `${SENADO}/ley_0100_1993_pr004.html` },
  ley142: { titulo: "Ley 142 de 1994", url: `${SENADO}/ley_0142_1994.html` },
  documentosTipo: {
    titulo: "Documentos tipo vigentes — Colombia Compra Eficiente",
    url: "https://www.colombiacompra.gov.co/documentos-tipo/vigentes",
  },
} as const;

export const SECTORES: Sector[] = [
  {
    slug: "construccion",
    nombre: "Construcción y obra civil",
    icono: "building-2",
    resumen: "Vías, edificaciones y mantenimiento de infraestructura: licitación con pliegos tipo, K residual y los códigos de la familia 72.",
    codigos: [
      { codigo: "72141000", nombre: "Servicios de construcción de autopistas y carreteras", nivel: "Clase" },
      { codigo: "72141100", nombre: "Servicios de pavimentación y superficies de edificios de infraestructura", nivel: "Clase" },
      { codigo: "72141107", nombre: "Servicio de construcción y reparación de puentes", nivel: "Producto" },
      { codigo: "72121400", nombre: "Servicios de construcción de edificios públicos especializados", nivel: "Clase" },
      { codigo: "72121406", nombre: "Servicio de construcción de edificios de escuelas", nivel: "Producto" },
      { codigo: "72103300", nombre: "Servicios de mantenimiento y reparación de infraestructura", nivel: "Clase" },
      { codigo: "72152700", nombre: "Servicios de instalación y reparación de concreto", nivel: "Clase" },
      { codigo: "72153600", nombre: "Servicios de terminado interior, dotación y remodelación", nivel: "Clase" },
    ],
    vocabulario: [
      "obra civil", "construcción", "mejoramiento", "rehabilitación", "adecuación",
      "mantenimiento", "pavimentación", "placa huella", "remodelación", "obras de urbanismo",
      "andenes", "vía terciaria",
    ],
  },
  {
    slug: "ingenieria-e-interventoria",
    nombre: "Ingeniería e interventoría",
    icono: "drafting-compass",
    resumen: "Estudios, diseños e interventoría: concurso de méritos, sin precio como factor de escogencia, y por qué no hay un código «interventoría».",
    codigos: [
      { codigo: "81101500", nombre: "Ingeniería civil", nivel: "Clase" },
      { codigo: "81101510", nombre: "Ingeniería de carreteras", nivel: "Producto" },
      { codigo: "81101505", nombre: "Ingeniería estructural", nivel: "Producto" },
      { codigo: "81101514", nombre: "Ingeniería geotécnica o geosísmica", nivel: "Producto" },
      { codigo: "81101513", nombre: "Gestión de construcción de edificios", nivel: "Producto" },
      { codigo: "81102200", nombre: "Ingeniería de transporte", nivel: "Clase" },
      { codigo: "80101600", nombre: "Gerencia de proyectos", nivel: "Clase" },
      { codigo: "80101601", nombre: "Estudios de factibilidad o selección de ideas de proyectos", nivel: "Producto" },
    ],
    vocabulario: [
      "interventoría", "interventoría técnica, administrativa y financiera", "supervisión técnica",
      "consultoría", "estudios y diseños", "diseños de detalle", "estudios de prefactibilidad",
      "factibilidad", "gerencia de proyecto", "levantamiento topográfico", "estudio de suelos",
      "actualización de diseños",
    ],
  },
  {
    slug: "salud",
    nombre: "Salud",
    icono: "hospital",
    resumen: "ESE, hospitales y secretarías de salud: régimen privado, servicios de salud por selección abreviada y la dotación con sus códigos.",
    codigos: [
      { codigo: "42000000", nombre: "Equipo Médico, Accesorios y Suministros", nivel: "Segmento" },
      { codigo: "42190000", nombre: "Productos de centro médico", nivel: "Familia" },
      { codigo: "42200000", nombre: "Productos de hacer imágenes diagnósticas médicas y de medicina nuclear", nivel: "Familia" },
      { codigo: "42290000", nombre: "Productos quirúrgicos", nivel: "Familia" },
      { codigo: "51000000", nombre: "Medicamentos y Productos Farmacéuticos", nivel: "Segmento" },
      { codigo: "25101703", nombre: "Ambulancias", nivel: "Producto" },
      { codigo: "85101500", nombre: "Centros de salud", nivel: "Clase" },
      { codigo: "85121800", nombre: "Laboratorios médicos", nivel: "Clase" },
      { codigo: "85161500", nombre: "Reparación de equipo médico o quirúrgico", nivel: "Clase" },
    ],
    vocabulario: [
      "dotación hospitalaria", "equipos biomédicos", "dispositivos médicos", "insumos médico-quirúrgicos",
      "material médico quirúrgico", "mantenimiento biomédico", "mantenimiento preventivo y correctivo",
      "medicamentos", "reactivos de laboratorio", "plan de intervenciones colectivas", "PIC",
      "ambulancia",
    ],
  },
  {
    slug: "tecnologia-y-telecomunicaciones",
    nombre: "Tecnología y telecomunicaciones",
    icono: "laptop",
    resumen: "Software, equipos, conectividad y soporte: acuerdos marco, subasta inversa para lo uniforme y concurso o licitación para lo demás.",
    codigos: [
      { codigo: "43210000", nombre: "Equipo informático y accesorios", nivel: "Familia" },
      { codigo: "43230000", nombre: "Software", nivel: "Familia" },
      { codigo: "43222500", nombre: "Equipo de seguridad de red", nivel: "Clase" },
      { codigo: "81111500", nombre: "Ingeniería de software o hardware", nivel: "Clase" },
      { codigo: "81112000", nombre: "Servicios de datos", nivel: "Clase" },
      { codigo: "81112100", nombre: "Servicios de internet", nivel: "Clase" },
      { codigo: "81112200", nombre: "Mantenimiento y soporte de software", nivel: "Clase" },
      { codigo: "81161700", nombre: "Servicios de telecomunicaciones", nivel: "Clase" },
      { codigo: "83112300", nombre: "Servicios de telecomunicaciones por fibra", nivel: "Clase" },
    ],
    vocabulario: [
      "licenciamiento", "licencias", "software", "desarrollo a la medida", "sistema de información",
      "mesa de ayuda", "soporte técnico", "conectividad", "canal de internet", "centro de datos",
      "servicios en la nube", "ciberseguridad", "equipos de cómputo", "zonas wifi",
    ],
  },
  {
    slug: "agua-y-saneamiento",
    nombre: "Agua y saneamiento",
    icono: "droplets",
    resumen: "Acueducto, alcantarillado y tratamiento: pliegos tipo propios, empresas de servicios públicos con régimen privado y un vocabulario que cambia de municipio a municipio.",
    codigos: [
      { codigo: "83101500", nombre: "Servicios de acueducto y alcantarillado", nivel: "Clase" },
      { codigo: "72141119", nombre: "Servicio de construcción de acueductos", nivel: "Producto" },
      { codigo: "72141120", nombre: "Servicio de construcción de líneas de alcantarillado", nivel: "Producto" },
      { codigo: "72141121", nombre: "Servicio de construcción de tubería maestra de agua", nivel: "Producto" },
      { codigo: "72141125", nombre: "Servicio de construcción de estaciones de bombeo", nivel: "Producto" },
      { codigo: "72152800", nombre: "Servicios de perforación de pozos de agua", nivel: "Clase" },
      { codigo: "47101500", nombre: "Equipo para el tratamiento y suministro de agua", nivel: "Clase" },
      { codigo: "40171500", nombre: "Tubos y tuberías comerciales", nivel: "Clase" },
      { codigo: "77121700", nombre: "Contaminación del agua", nivel: "Clase" },
    ],
    vocabulario: [
      "alcantarilla", "alcantarillado", "saneamiento básico", "acueducto", "aguas residuales",
      "colector", "drenaje", "PTAR", "PTAP", "emisario final", "redes hidrosanitarias",
      "unidades sanitarias", "pozos sépticos", "plan maestro de acueducto y alcantarillado",
    ],
  },
];

export const sector = (slug: string) => {
  const s = SECTORES.find((x) => x.slug === slug);
  if (!s) throw new Error(`Sector no registrado en src/data/sectores.ts: ${slug}`);
  return s;
};
