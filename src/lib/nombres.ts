/* COPIA de contradar/frontend/src/lib/nombres.ts (commit e9815657 de fix/nombres-constructor, 22-oct-2026).
   Una sola regla para leer los nombres de SECOP en la app y en la web: si
   cambia allá, se copia aquí tal cual (y test/nombres.test.mjs con ella). */
/**
 * Nombres de empresas, entidades y consorcios tal como se leen, no como los
 * grita SECOP (15-oct-2026, docs/maquetas/competencia).
 *
 *   «INGENIERIA INTEGRAL MP S.A.S»  → «Ingeniería Integral MP S.A.S.»
 *   «EMPOCALOTO E.S.P.»             → «Empocaloto E.S.P.»
 *   «UNION TEMPORAL VIAS MORALES»   → «Unión Temporal Vías Morales»
 *
 * Reglas, en este orden:
 *  1. Solo se toca lo que llega en MAYÚSCULA sostenida (≥ 70 % de las letras).
 *     Un nombre ya escrito con mayúsculas y minúsculas («EDUH-Turbo») se
 *     respeta: alguien lo escribió así a propósito.
 *  2. Formas societarias con su grafía de siempre: S.A.S., S.A., Ltda., E.S.P.,
 *     E.S.E.; sin puntos se dejan sin puntos (SAS, ESP, ESE, UT).
 *  3. Siglas conocidas (ICBF, SENA, INVIAS…), palabras con dígitos o «&»
 *     («M&G») y palabras cortas sin vocal («MP», «JJ», «CRC») quedan en
 *     mayúscula. Una palabra de 2–3 letras que no es una palabra corriente
 *     del español («GIA») también: casi siempre es una sigla.
 *  4. Partículas en minúscula salvo al principio: de, del, la, y, en…
 *  5. Tildes de las palabras frecuentes que SECOP publica sin tilde.
 *
 * Sin dependencias: lo importan las pruebas de Node directamente
 * (`npm test`).
 */

const PARTICULAS = new Set(["de", "del", "la", "las", "los", "el", "y", "e", "en", "para", "por", "a", "al", "o", "u", "con", "sin"]);

/** Formas societarias: clave sin puntos → cómo se escribe. Se respeta si
 *  venía con puntos o sin ellos. */
const FORMAS: Record<string, [conPuntos: string, sinPuntos: string]> = {
  SAS: ["S.A.S.", "SAS"],
  SA: ["S.A.", "S.A."],
  LTDA: ["Ltda.", "Ltda."],
  ESP: ["E.S.P.", "ESP"],
  ESE: ["E.S.E.", "ESE"],
  SCA: ["S.C.A.", "SCA"],
  SCS: ["S.C.S.", "SCS"],
  UT: ["U.T.", "UT"],
  EU: ["E.U.", "E.U."],
  EICE: ["E.I.C.E.", "EICE"],
  IPS: ["I.P.S.", "IPS"],
  EPS: ["E.P.S.", "EPS"],
  BIC: ["BIC", "BIC"],
};

/** Siglas que se escriben en mayúscula aunque tengan vocales. */
const SIGLAS = new Set([
  "ICBF", "SENA", "INVIAS", "ANI", "DNP", "DIAN", "IGAC", "SIC", "ESAP", "EPM", "EAAB", "ETB", "IDU", "UAESP",
  "CAR", "CVC", "CRC", "CRQ", "CAM", "UNAD", "UIS", "UPTC", "SECOP", "NIT", "RUP", "SGP", "SGR", "PAE", "TIC",
  "PTAR", "PTAP", "JAC", "INPEC", "FONADE", "ENTERRITORIO", "FINDETER", "UNGRD", "IDEAM", "INS", "INVIMA",
  "SED", "SDA", "IDRD", "IPES", "UMV", "IDIGER", "EMSERPA", "EMCALI", "AAPSA", "ACUAVALLE", "EDESA", "IPSE",
  "EDUH", "EDU", "EMDUPAR", "EMDUCE", "INDEPORTES", "INDER", "IMDER", "ITM", "ITP", "SAMC", "APP", "CCB",
]);
// Siglas que también son nombres: van en mayúscula inicial, no en sigla.
const SIGLAS_NOMBRE = new Set(["EMCALI", "ACUAVALLE", "EDESA", "ENTERRITORIO", "FINDETER", "FONADE", "INDEPORTES", "EMSERPA", "EMDUPAR", "EMDUCE"]);

/** Palabras corrientes de 2–3 letras: sin esta lista, la regla de siglas
 *  dejaría «RIO» o «SAN» en mayúscula. */
const CORTAS = new Set([
  "san", "sur", "rio", "río", "mar", "sol", "paz", "luz", "oro", "red", "via", "vía", "ley", "uno", "dos", "seis",
  "mas", "más", "mil", "fe", "ola", "ala", "eje", "pie", "hoy", "ver", "rey", "fin", "gas", "son", "tal", "sus",
  "mis", "tus", "uso", "lote", "agua", "obra", "ruta", "plan", "casa", "eco", "bio", "pro", "art", "mi", "tu",
  "su", "ese", "esa", "lo", "le", "les", "nos", "ya", "si", "no", "ni", "ha", "va", "dio", "don", "doña",
  "sor", "cia", "cía", "hnos", "ii", "iii", "iv",
]);

/** Tildes de palabras frecuentes en razones sociales y nombres de entidades. */
const TILDES: Record<string, string> = {
  ingenieria: "ingeniería", union: "unión", vias: "vías", via: "vía", construccion: "construcción",
  construcciones: "construcciones", alcaldia: "alcaldía", gobernacion: "gobernación", secretaria: "secretaría",
  corporacion: "corporación", nacion: "nación", educacion: "educación", camara: "cámara", registraduria: "registraduría",
  policia: "policía", compania: "compañía", "compañia": "compañía", tecnologia: "tecnología", tecnologias: "tecnologías",
  energia: "energía", electrica: "eléctrica", electricas: "eléctricas", electrico: "eléctrico", electricos: "eléctricos",
  hidraulica: "hidráulica", hidraulicas: "hidráulicas", mecanica: "mecánica", tecnica: "técnica", tecnicas: "técnicas",
  tecnico: "técnico", tecnicos: "técnicos", publica: "pública", publicas: "públicas", publico: "público",
  publicos: "públicos", geotecnia: "geotecnia", topografia: "topografía", consultoria: "consultoría",
  consultorias: "consultorías", interventoria: "interventoría", interventorias: "interventorías", asesoria: "asesoría",
  asesorias: "asesorías", auditoria: "auditoría", logistica: "logística", ferreteria: "ferretería", papeleria: "papelería",
  medicos: "médicos", medica: "médica", clinica: "clínica", farmaceutica: "farmacéutica", quimica: "química",
  quimicos: "químicos", maquinaria: "maquinaria", mineria: "minería", petroleo: "petróleo", agricola: "agrícola",
  agropecuaria: "agropecuaria", ambiental: "ambiental", innovacion: "innovación", comunicacion: "comunicación",
  comunicaciones: "comunicaciones", informatica: "informática", educativa: "educativa", institucion: "institución",
  administracion: "administración", direccion: "dirección", produccion: "producción", gestion: "gestión",
  soluciones: "soluciones", solucion: "solución", estructuras: "estructuras", civil: "civil", obras: "obras",
  diseno: "diseño", disenos: "diseños", montajes: "montajes", fundacion: "fundación", asociacion: "asociación",
  federacion: "federación", cooperativa: "cooperativa", region: "región", regional: "regional", distrito: "distrito",
  municipio: "municipio", departamento: "departamento", bogota: "Bogotá", medellin: "Medellín", popayan: "Popayán",
  cucuta: "Cúcuta", ibague: "Ibagué", monteria: "Montería", quibdo: "Quibdó", narino: "Nariño", boyaca: "Boyacá",
  bolivar: "Bolívar", cordoba: "Córdoba", choco: "Chocó", caqueta: "Caquetá", guainia: "Guainía", vaupes: "Vaupés",
  atlantico: "Atlántico", quindio: "Quindío", timbio: "Timbío", piendamo: "Piendamó", tulua: "Tuluá",
  "tumaco": "Tumaco", "jamundi": "Jamundí", "zipaquira": "Zipaquirá", "fusagasuga": "Fusagasugá", "sogamoso": "Sogamoso",
  andres: "andrés", jose: "josé", maria: "maría", ramon: "ramón", martin: "martín", garcia: "garcía",
  gonzalez: "gonzález", rodriguez: "rodríguez", martinez: "martínez", gomez: "gómez", lopez: "lópez",
  hernandez: "hernández", perez: "pérez", sanchez: "sánchez", ramirez: "ramírez", diaz: "díaz", jimenez: "jiménez",
  beltran: "beltrán", muñoz: "muñoz", nuñez: "núñez", nunez: "núñez", rios: "ríos", velez: "vélez",
};

const LETRAS = /\p{L}/u;

function capital(p: string): string {
  return p.replace(LETRAS, (c) => c.toUpperCase());
}

/** ¿Llega en mayúscula sostenida? */
function esMayusculaSostenida(t: string): boolean {
  const letras = t.replace(/[^\p{L}]/gu, "");
  if (!letras) return false;
  return letras.replace(/[^\p{Lu}]/gu, "").length / letras.length >= 0.7;
}

function palabra(token: string, i: number): string {
  // Puntuación pegada: «(CUENTA», «ASEO,» → se trata el núcleo.
  const m = /^([^\p{L}\p{N}&]*)(.*?)([^\p{L}\p{N}&.]*)$/u.exec(token);
  if (!m) return token;
  const [, antes, nucleo, despues] = m;
  if (!nucleo) return token;

  // Palabras compuestas con guion: cada parte por su cuenta.
  if (nucleo.includes("-") && !/^-|-$/.test(nucleo)) {
    return antes + nucleo.split("-").map((p, j) => palabra(p, i + j)).join("-") + despues;
  }

  const sinPuntos = nucleo.replace(/\./g, "").toUpperCase();
  const forma = FORMAS[sinPuntos];
  // Las formas societarias de una sola letra por punto («S.A.S», «E.S.P»)
  // y las conocidas sin puntos («SAS», «LTDA»). «SA» suelto sin puntos es
  // demasiado ambiguo («SA» de «Santa»): solo con puntos.
  if (forma && (nucleo.includes(".") || sinPuntos !== "SA")) {
    return antes + (nucleo.includes(".") ? forma[0] : forma[1]) + despues;
  }

  const baja = nucleo.toLowerCase();
  if (i > 0 && PARTICULAS.has(baja)) return antes + baja + despues;

  const soloLetras = nucleo.replace(/[^\p{L}]/gu, "");
  if (SIGLAS.has(soloLetras.toUpperCase()) && !SIGLAS_NOMBRE.has(soloLetras.toUpperCase())) {
    return antes + nucleo.toUpperCase() + despues;
  }
  if (/\d/.test(nucleo) || nucleo.includes("&")) return antes + nucleo.toUpperCase() + despues;
  const sinVocal = !/[aeiouáéíóúü]/i.test(soloLetras);
  if (soloLetras.length >= 2 && soloLetras.length <= 4 && sinVocal) return antes + nucleo.toUpperCase() + despues;
  if (soloLetras.length >= 2 && soloLetras.length <= 3 && !CORTAS.has(baja) && !PARTICULAS.has(baja)) {
    return antes + nucleo.toUpperCase() + despues;
  }

  // `hasOwnProperty`, no `TILDES[baja] ??`: «constructor» (166 proveedores en
  // dev) devolvía la función Object.constructor y capital() reventaba.
  const conTilde = Object.prototype.hasOwnProperty.call(TILDES, baja) ? TILDES[baja] : baja;
  return antes + capital(conTilde) + despues;
}

/** Nombre de empresa, entidad, consorcio o persona para LEERLO. Vacío si no
 *  hay nombre. */
export function nombreEmpresa(raw: string | null | undefined): string {
  const texto = (raw ?? "").trim().replace(/\s+/g, " ");
  if (!texto) return "";
  if (!esMayusculaSostenida(texto)) return texto;
  return texto
    .split(" ")
    .map((t, i) => palabra(t, i))
    .join(" ");
}
