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
   Precios = tabla `plans` (migraciones a6b7c8d9e0f1 y 0f5ecdcc2ee4).
   Semestral y anual son el TOTAL del periodo; el «al mes» que pinta la web
   es total / meses. Cuotas: config.py ANALYSIS_QUOTA_* (-1 = sin tope). */

export type PeriodoId = "mensual" | "semestral" | "anual";
export type PlanId = "vigia" | "radar" | "enterprise";

export interface Plan {
  /** Clave histórica de la web (data-price-el, ROI). En la app: alerta/ventaja/dominio. */
  id: PlanId;
  nombre: string;
  /** Total cobrado por periodo, en COP. */
  total: Record<PeriodoId, number>;
  usuarios: number;
  /** Análisis al mes (licitación, empresa o entidad; un solo cupo, se renueva el día 1); null = sin tope. */
  analisisMes: number | null;
  busquedas: number;
}

export const MESES: Record<PeriodoId, number> = { mensual: 1, semestral: 6, anual: 12 };

export const PLANES: Plan[] = [
  {
    id: "vigia",
    nombre: "Alerta",
    total: { mensual: 190_000, semestral: 1_003_200, anual: 1_824_000 },
    usuarios: 1,
    analisisMes: 5,
    busquedas: 1,
  },
  {
    id: "radar",
    nombre: "Ventaja",
    total: { mensual: 550_000, semestral: 2_904_000, anual: 5_280_000 },
    usuarios: 3,
    analisisMes: 30,
    busquedas: 3,
  },
  {
    id: "enterprise",
    nombre: "Dominio",
    total: { mensual: 990_000, semestral: 5_227_200, anual: 9_504_000 },
    usuarios: 5,
    analisisMes: null,
    busquedas: 6,
  },
];

export const plan = (id: PlanId) => PLANES.find((p) => p.id === id)!;

/** Precio al mes en un periodo (lo que pinta la tarjeta). */
export const precioMes = (p: Plan, periodo: PeriodoId) => Math.round(p.total[periodo] / MESES[periodo]);

/** Lo más barato que se puede pagar al mes: Alerta en plan anual. */
export const PRECIO_DESDE = precioMes(PLANES[0], "anual");

/* ── Prueba ───────────────────────────────────────────────────────────────
   alta_prueba.py: DIAS_PRUEBA = 7; ANALYSIS_QUOTA_TRIAL = 10; el trial tiene
   max_searches 3 y max_users 3. Alta inmediata desde la web
   (POST /public/prueba/crear, prueba_self_service.py), sin tarjeta. */

export const PRUEBA = {
  dias: 7,
  analisis: 10,
  busquedas: 3,
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

/* Valores de GET /api/v1/public/stats el 2-oct-2026, redondeados HACIA
   ABAJO como lo hace la banda en vivo (FullBleedCTA): esto es el respaldo y
   el texto fijo, no puede decir más que la base. Al refrescar, copia lo que
   devuelva el endpoint y la fecha. */
export const CIFRAS_CORTE = "2026-10-02";
export const CIFRAS = {
  /** total_procesos = 19.764.912 (year >= 2012). */
  procesos: "19,7 M",
  procesosLargo: "19,7 millones",
  /** total_contratos = 11.129.337 (valor > 0). */
  contratos: "11,1 M",
  /** total_proveedores = 2.647.147 (analytics.provider_totals, consorcios
   *  incluidos). Son PROVEEDORES —empresas, consorcios y también personas
   *  naturales—: se publica siempre como «proveedores perfilados», nunca
   *  como «empresas». */
  empresas: "2,6 M",
  empresasLargo: "2,6 millones",
  /** total_entidades = 13.129 (entity_nit distintos, year >= 2012). */
  entidades: "13.129",
  /** 658.875.883 filas en 81 datasets, 30-ago-2026. */
  registros: "658 M",
  fuentes: 81,
  /** Proveedores que solo aparecen en SECOP I, medido el 26-ago-2026. Es una
   *  medición puntual, no un indicador vivo: se publica SIEMPRE con su fecha. */
  soloSecopI: "859.786",
  soloSecopIFecha: "agosto de 2026",
} as const;
