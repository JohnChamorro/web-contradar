/**
 * FUENTE ÚNICA DE VERDAD DEL PRODUCTO (seo/fase-1, 2-oct-2026).
 *
 * Planes, precios, prueba, cifras de la base y la descripción canónica de la
 * entidad. Las páginas, el JSON-LD, la FAQ y llms.txt leen de aquí. Antes cada
 * cifra estaba copiada a mano en su componente y por eso el JSON-LD llegó a
 * mezclar el precio mensual de un plan con el anual de otro.
 *
 * CADA VALOR TIENE ORIGEN en el repo de la app (~/eulertech/contradar,
 * develop). Si el producto cambia, se cambia aquí en el mismo commit; si no
 * puedes trazar un valor nuevo hasta el código o los datos, no lo publiques.
 */

/* ── Entidad ──────────────────────────────────────────────────────────── */

export const ENTIDAD = {
  nombre: "ContRadar",
  url: "https://contradar.com.co",
  appUrl: "https://app.contradar.com.co",
  /** Marca de la empresa: siempre en minúscula. */
  marcaEmpresa: "eulertech",
  /** Titular legal, tal como figura en /terminos/ (sección 1). */
  titular: "John Euler Chamorro Fuertes",
  ciudad: "Popayán",
  departamento: "Cauca",
  pais: "CO",
  email: "soporte@contradar.com.co",
  emailVentas: "ventas@contradar.com.co",
  /** Perfiles propios (Organization.sameAs). Solo los que existen. */
  redes: ["https://www.linkedin.com/company/contradar/"],
  /** Mismo número que consts.ts → WHATSAPP_NUMBER. */
  telefono: "+57 323 923 6742",
  logo: "https://contradar.com.co/android-chrome-512x512.png",
  /** Una frase, para JSON-LD, llms.txt y fichas de directorio. */
  descripcionCorta:
    "App de licitaciones para Colombia: análisis y estadística del SECOP I y II para saber contra quién compites y a qué precio se adjudica, con búsquedas automáticas y gestión de licitaciones y contratos en equipo.",
} as const;

/* ── Planes ───────────────────────────────────────────────────────────────
   Precios = tabla `plans` (migración 8df7fe72b0d4, noviembre de 2026; planes
   finales, 19eaca0a923e, 2-nov-2026; Alerta anual, a1e3c5d7f9b1, 5-nov-2026). El anual
   es el TOTAL del año, con 20 % menos en los tres: sale a 111.000 · 208.000 · 479.000
   al mes. Búsquedas = plans.max_searches (-1 = sin tope, aquí null). Cuotas: config.py ANALYSIS_QUOTA_*
   (-1 = sin tope), plans.pliego_limit y plans.anexos_limit. */

export type PeriodoId = "mensual" | "anual";
export type PlanId = "vigia" | "radar" | "enterprise";

export interface Plan {
  /** Clave histórica de la web (ROI). En la app: alerta/ventaja/dominio. */
  id: PlanId;
  nombre: string;
  /** Total cobrado por periodo, en COP. */
  total: Record<PeriodoId, number>;
  usuarios: number;
  /** Análisis al mes (licitación, empresa o entidad; un solo cupo, se renueva el día 1); null = sin tope. */
  analisisMes: number | null;
  /** Pliegos analizados con IA al mes. */
  pliegosMes: number;
  /** Propuestas con formatos llenos al mes. */
  propuestasMes: number;
  /** Búsquedas automáticas; null = sin tope (Dominio). */
  busquedas: number | null;
  /** Licitaciones activas en seguimiento (plans.crm_active_limit); null = sin tope. */
  seguimiento: number | null;
}

export const MESES: Record<PeriodoId, number> = { mensual: 1, anual: 12 };

export const PLANES: Plan[] = [
  {
    id: "vigia",
    nombre: "Alerta",
    total: { mensual: 139_000, anual: 1_332_000 },
    usuarios: 2,
    analisisMes: 5,
    pliegosMes: 2,
    propuestasMes: 1,
    busquedas: 2,
    seguimiento: 10,
  },
  {
    id: "radar",
    nombre: "Ventaja",
    total: { mensual: 260_000, anual: 2_496_000 },
    usuarios: 5,
    analisisMes: 30,
    pliegosMes: 15,
    propuestasMes: 5,
    busquedas: 5,
    seguimiento: 20,
  },
  {
    id: "enterprise",
    nombre: "Dominio",
    total: { mensual: 599_000, anual: 5_748_000 },
    usuarios: 15,
    analisisMes: null,
    pliegosMes: 60,
    propuestasMes: 30,
    busquedas: null,
    seguimiento: null,
  },
];

/** Complementos (2-nov-2026): búsqueda extra en Ventaja y usuario adicional en
 *  Ventaja y Dominio, cada uno al mes. plans.extra_search_price / extra_user_price. */
export const COMPLEMENTO_MES = 39_000;

/** 5 propuestas con formatos más, en cualquier plan; cada una trae su pliego analizado. */
export const PAQUETE_PROPUESTAS = { cantidad: 5, precio: 199_000 } as const;

export const plan = (id: PlanId) => PLANES.find((p) => p.id === id)!;

/** Precio al mes en un periodo (lo que pinta la tarjeta). */
export const precioMes = (p: Plan, periodo: PeriodoId) => Math.round(p.total[periodo] / MESES[periodo]);

/** «2 búsquedas automáticas» o «búsquedas automáticas sin tope». */
export const busquedasDe = (p: Plan) =>
  p.busquedas == null ? "búsquedas automáticas sin tope"
    : `${p.busquedas} ${p.busquedas === 1 ? "búsqueda automática" : "búsquedas automáticas"}`;

/** Lo que ahorra el anual contra pagar doce meses sueltos. */
export const ahorroAnual = (p: Plan) => p.total.mensual * 12 - p.total.anual;

/** El descuento del anual en %, el menor de los planes (hoy 20 % en los tres). */
export const DESCUENTO_ANUAL = Math.min(...PLANES.map((p) => Math.round((1 - p.total.anual / (p.total.mensual * 12)) * 100)));

/** Lo más barato que se puede pagar al mes: Alerta en plan anual. */
export const PRECIO_DESDE = precioMes(PLANES[0], "anual");

/* ── Prueba ───────────────────────────────────────────────────────────────
   alta_prueba.py: DIAS_PRUEBA = 7; ANALYSIS_QUOTA_TRIAL = 10; el trial tiene
   max_searches 5, max_users 5, pliego_limit 3 y anexos_limit 2 (2-nov-2026). Alta inmediata desde la web
   (POST /public/prueba/crear, prueba_self_service.py), sin tarjeta. */

export const PRUEBA = {
  dias: 7,
  analisis: 10,
  pliegos: 3,
  propuestas: 2,
  busquedas: 5,
  plan: "Ventaja",
  tarjeta: false,
  inmediata: true,
  /** La frase pública del alta, la misma en el formulario, la FAQ y llms.txt.
   *  Solo si la app no responde cae al respaldo manual (/api/contact), y ese
   *  caso tiene su propio aviso en AccessForm. */
  alta: "tu cuenta queda activa en el momento",
} as const;

/* ── Cifras de la base ────────────────────────────────────────────────────
   Ventana canónica de la app: ANIO_INICIO_HISTORICO = 2012 (constantes.py,
   decisión del 26-ago-2026; sustituye a la de 2023). Valores redondeados a
   lo que publica la web; fuente entre paréntesis.
   OJO: no todos los bloques de la estadística usan 2012 — días de pago mide
   2020+ y adiciones 2018-2024 (backend/estudios/intel/). No escribas «desde
   2012» sobre esos bloques. */

export const DESDE = 2012;

/* Desde qué año hay CONTRATOS con su ficha (tabla historical_contracts): SECOP
   II desde 2016 y SECOP I desde 2018. La adjudicación con su ganador sí llega a
   2012, por el SECOP Integrado (445.859 en 2012, 445.258 con NIT). Medido el
   30-oct-2026: docs/rediseno/cifras.md. «11 M de contratos desde 2012» era falso. */
export const DESDE_CONTRATOS = 2016;

/* Desde qué año hay OFERTAS en los datos (13-oct-2026, regla de John: cada
   frase dice el año que sostiene lo que promete). Quién se presentó, quién le
   ganó a quién y a qué precio adjudica una entidad frente a su presupuesto
   salen de las ofertas, y el SECOP solo las publica desde 2015 (SECOP II; SECOP
   I casi no publica oferentes). DESDE (2012) vale para contratos, ganadas y
   mercado. Medido en dev: process_bidders 236 en 2015 → 127.265 en 2018;
   contratos adjudicados del SECOP Integrado 445.859 en 2012. Gemelo de
   ANIO_INICIO_OFERTAS en el backend (constantes.py). */
export const DESDE_OFERTAS = 2015;

/* Valores de GET /api/v1/public/stats en dev el 30-oct-2026, redondeados HACIA
   ABAJO como lo hace la banda en vivo (FullBleedCTA): esto es el respaldo y
   el texto fijo, no puede decir más que la base. Al refrescar, copia lo que
   devuelva el endpoint y la fecha. */
export const CIFRAS_CORTE = "2026-10-30";
export const CIFRAS = {
  /** total_procesos = 19.952.358 (year >= 2012). */
  procesos: "19,9 M",
  procesosLargo: "19,9 millones",
  /** total_contratos = 11.207.120 (valor > 0). */
  contratos: "11,2 M",
  /** total_proveedores = 2.655.282 (analytics.provider_totals, consorcios
   *  incluidos). Son PROVEEDORES —empresas, consorcios y también personas
   *  naturales—: se publica siempre como «proveedores perfilados», nunca
   *  como «empresas». */
  empresas: "2,6 M",
  empresasLargo: "2,6 millones",
  /** total_entidades = 13.147 (entity_nit distintos, year >= 2012). */
  entidades: "13.147",
  /** 658.875.883 filas en 81 datasets, 30-ago-2026. */
  registros: "658 M",
  fuentes: 81,
  /** Proveedores que solo aparecen en SECOP I, medido el 26-ago-2026. Es una
   *  medición puntual, no un indicador vivo: se publica SIEMPRE con su fecha. */
  soloSecopI: "859.786",
  soloSecopIFecha: "agosto de 2026",
} as const;
