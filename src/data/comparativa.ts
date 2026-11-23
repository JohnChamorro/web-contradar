/**
 * LA MATRIZ DE LA COMPARATIVA: qué capacidades declara cada app en su web.
 *
 * Vivía dentro de /guias/mejores-apps-licitaciones-colombia/. Sale a un módulo
 * (21-nov-2026) porque ahora la leen tres sitios: el cuadro resumen y la matriz
 * de la comparativa, y el cuadro «de un vistazo» de cada /alternativas/<app>/.
 * Una sola fuente: una marca no puede decir una cosa en una página y otra en
 * otra.
 *
 * Ley 256 de 1996: cada marca de un competidor sale de sus páginas públicas,
 * con fuente y fecha en docs/seo/mercado-competidores-2026-10.md y en
 * docs/seo/comparativa-checklist-mensual.md. «No lo declara» NO es «no lo
 * tiene»: no probamos las apps por dentro. Los textos que acompañan a los
 * cuadros lo dicen siempre.
 *
 * Valor: 1 = lo declara, ½ = en parte, sin marca = no lo declara en lo revisado.
 */

/* Capacidades, agrupadas por etapa. Fuente de cada marca: la revisión del
   30-oct-2026 en docs/seo/mercado-competidores-2026-10.md, sobre las páginas
   públicas leídas ese día. Valor: 1 = lo declara, ½ = en parte, 0 = no lo declara
   en lo revisado. */
export const GRUPOS = [
  { g: "Dónde buscas", c: [
    { id: "secop", t: "SECOP I y II", d: "Lee las dos plataformas." },
    { id: "prepub", t: "Procesos antes de publicarse", d: "Ves el proceso en borrador o aprobación, antes de que abra." },
    { id: "rfi", t: "Sondeos de mercado (RFI)", d: "La entidad pregunta precios antes de que exista el pliego." },
    { id: "paa", t: "Plan Anual de Adquisiciones", d: "Lo que cada entidad planea comprar en el año." },
    { id: "historico", t: "Histórico declarado (años)", d: "Dice desde qué año mide el mercado." },
  ]},
  { g: "Cómo encuentras", c: [
    { id: "sinonimos", t: "Sinónimos del sector", d: "«Alcantarilla» también encuentra saneamiento y colector." },
    { id: "alias", t: "Alias y siglas de empresas", d: "Encuentra al rival aunque lo escriban de otra forma." },
    { id: "score", t: "Puntaje con su desglose", d: "Dice por qué un proceso te sirve, dimensión por dimensión." },
    { id: "adendas", t: "Aviso de adendas y cambios", d: "Te avisa cuando el proceso cambia." },
    { id: "movil", t: "Alertas en el celular", d: "App móvil, push, Telegram o WhatsApp." },
  ]},
  { g: "El pliego", c: [
    { id: "visor", t: "Visor de pliegos en la app", d: "Abre PDF, Word y Excel sin descargarlos." },
    { id: "ia", t: "Lee el pliego con IA", d: "Resume requisitos y riesgos del documento." },
    { id: "rup", t: "Cruce del pliego con tu RUP", d: "Te dice si calificas según tus indicadores." },
    { id: "docs", t: "Tus documentos en la plataforma", d: "Subes y guardas tus propios documentos." },
    { id: "formatos", t: "Llena formatos", d: "Diligencia con tus datos los formatos del proceso." },
  ]},
  { g: "Para ganar", c: [
    { id: "precio", t: "Precio de adjudicación por entidad", d: "A qué precio adjudica esa entidad frente a su presupuesto." },
    { id: "bandas", t: "Rango de precio ganador", d: "Entre qué precios quedaron las ofertas que ganaron." },
    { id: "perfil", t: "Perfil de cada competidor", d: "Qué ganó, con qué entidades y por cuánto." },
    { id: "consorcios", t: "Consorcios con su participación", d: "Con quién se asocia cada rival y en qué porcentaje." },
    { id: "ruedo", t: "Quién se presenta", d: "Las empresas que ofertan ante esa entidad, no solo la que gana." },
    { id: "pago", t: "En cuántos días paga la entidad", d: "Medido sobre sus pagos reales." },
    { id: "adicion", t: "Probabilidad de adición", d: "Con qué frecuencia la entidad amplía el contrato y cuánto." },
    { id: "fuente", t: "De dónde sale la plata", d: "Regalías (SGR), SGP o presupuesto propio." },
    { id: "lugar", t: "Dónde se ejecuta de verdad", d: "El municipio de la obra, no la sede de la entidad." },
    { id: "diagnostico", t: "Diagnóstico gratis por NIT", d: "Cómo le va a tu empresa en el SECOP, sin registro." },
  ]},
  { g: "Después de ganar", c: [
    { id: "equipo", t: "Tablero en equipo con responsables", d: "Etapas, responsable y comentarios por proceso." },
    { id: "contrato", t: "Gestión del contrato ganado", d: "Hitos, pólizas, actas y liquidación con avisos." },
    { id: "k", t: "Capacidad residual (K) al día", d: "Baja cuando ganas y sube cuando terminas un contrato." },
  ]},
] as const;
export type C = (typeof GRUPOS)[number]["c"][number]["id"];
export type Puntos = Partial<Record<C, 0.5 | 1>>;
export const N_CRIT = GRUPOS.reduce((s, g) => s + g.c.length, 0);
export const valor = (p: Puntos, c: C) => p[c] ?? 0;


/** Fecha de la última revisión completa de las webs (AAAA-MM-DD). */
export const REVISADA = "2026-10-30";
/** Apps que se volvieron a revisar después, con su fecha. */
export const REVISADA_DESPUES: Record<string, string> = { Licitarus: "2026-11-21", "Colombia Licita": "2026-11-21" };

export const NUESTRA = "ContRadar";

export const MARCAS: Record<string, Puntos> = {
  "ContRadar": { secop: 1, prepub: 1, rfi: 1, paa: 1, historico: 1, sinonimos: 1, alias: 1, score: 1, adendas: 1, visor: 1, ia: 1, rup: 1, docs: 1, formatos: 1, precio: 1, bandas: 1, perfil: 1, consorcios: 1, ruedo: 1, pago: 1, adicion: 1, fuente: 1, lugar: 1, diagnostico: 1, equipo: 1, contrato: 1, k: 1 },
  "Licitarus": { secop: 1, prepub: 0.5, paa: 1, sinonimos: 0.5, alias: 0.5, score: 0.5, adendas: 1, ia: 1, rup: 1, docs: 1, formatos: 1, precio: 1, bandas: 0.5, perfil: 1, consorcios: 1, ruedo: 1, lugar: 1, equipo: 1, k: 0.5 },
  "LicitIA": { secop: 1, paa: 1, historico: 0.5, score: 0.5, adendas: 1, movil: 1, ia: 1, rup: 1, docs: 1, formatos: 0.5, precio: 0.5, bandas: 0.5, perfil: 1, consorcios: 1, ruedo: 0.5, adicion: 0.5, diagnostico: 0.5, equipo: 1 },
  "Licitum": { secop: 1, adendas: 1, ia: 1, rup: 1, docs: 1, formatos: 1, precio: 0.5, perfil: 0.5, consorcios: 0.5, equipo: 1, k: 0.5 },
  "Fromus": { adendas: 0.5, visor: 0.5, ia: 1, rup: 1, docs: 1, formatos: 0.5, precio: 0.5, perfil: 0.5, equipo: 0.5 },
  "LicitaYa": { secop: 1, adendas: 0.5, movil: 1, ia: 1, rup: 1, equipo: 0.5 },
  /* perfil ½ (23-nov-2026): su página de funcionalidades dice «Analiza a tu
     competencia y estudia la dinámica de contratación de las entidades», sin
     detallar qué muestra. Se cuenta como «en parte», no como ausente. */
  "Licitaciones.info": { secop: 1, adendas: 1, movil: 1, perfil: 0.5, equipo: 0.5 },
  "GremIA (antes El País Licita)": { historico: 0.5, ia: 1, rup: 0.5, perfil: 0.5, equipo: 0.5 },
  "iaLicitaciones": { secop: 1, paa: 1, historico: 0.5, score: 0.5, ia: 1, rup: 1, docs: 1, formatos: 1, precio: 0.5, ruedo: 0.5, equipo: 1, perfil: 0.5, k: 0.5 },
  "Colombia Licita": { secop: 1 },
};

export const CAPACIDADES = GRUPOS.flatMap((g) => g.c);

/** Cuántas capacidades declara una app: completas y en parte. */
export function totales(nombre: string) {
  const p = MARCAS[nombre] ?? {};
  let si = 0, parte = 0;
  for (const c of CAPACIDADES) {
    const v = valor(p, c.id);
    if (v === 1) si++;
    else if (v === 0.5) parte++;
  }
  return { si, parte, de: N_CRIT };
}

/**
 * Orden de los cuadros: por número de capacidades declaradas completas, y a
 * igualdad, en parte y luego alfabético. Es un conteo de lo que cada web
 * declara, no un puntaje de calidad (decisión de John, 21-nov-2026: el cuadro
 * va primero y se tiene que leer en dos segundos).
 */
export const ORDEN = Object.keys(MARCAS).sort((a, b) => {
  const x = totales(a), y = totales(b);
  return y.si - x.si || y.parte - x.parte || a.localeCompare(b, "es");
});

/**
 * Las ocho capacidades del cuadro resumen: dos por etapa del camino, más las
 * alertas en el celular, que ContRadar NO declara. Se deja a propósito: un
 * cuadro donde la casa lo tiene todo no le sirve a quien compara.
 */
export const CLAVES: { id: C; corto: string }[] = [
  { id: "secop", corto: "SECOP I y II" },
  { id: "ia", corto: "Lee el pliego con IA" },
  { id: "rup", corto: "Cruza tu RUP" },
  { id: "formatos", corto: "Llena formatos" },
  { id: "precio", corto: "Precio por entidad" },
  { id: "ruedo", corto: "Quién se presenta" },
  { id: "contrato", corto: "Gestión del contrato" },
  { id: "movil", corto: "Alertas en el celular" },
];

export const etiqueta = (v: number) => (v === 1 ? "lo declara" : v === 0.5 ? "en parte" : "no lo declara");
