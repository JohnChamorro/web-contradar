/**
 * PRUEBA SOCIAL (seo/fase-4) — APAGADA hasta tener testimonios reales.
 *
 * Reglas:
 * - Solo clientes reales, con AUTORIZACIÓN ESCRITA para publicar su nombre,
 *   cargo, empresa, cita y logo (Ley 1581 de 2012 para los datos personales;
 *   el logo es marca de un tercero). Guarda el documento y anota su fecha aquí.
 * - La cita va textual: no se pule ni se resume sin que el cliente la apruebe.
 * - Nada de estrellas ni calificaciones: sin reseñas verificables, un
 *   AggregateRating viola las políticas de Google. Este bloque NO genera
 *   datos estructurados de reseñas.
 *
 * Para activarlo: agrega al menos un testimonio con su autorización y pon
 * MOSTRAR en true. Runbook: docs/seo/runbook-manual.md → «Prueba social».
 */
export const MOSTRAR_PRUEBA_SOCIAL = false;

export interface Testimonio {
  cita: string;
  nombre: string;
  cargo: string;
  empresa: string;
  /** Ruta en public/clientes/ (cuadrada, 128 px o más). Opcional. */
  foto?: string;
  /** Fecha (AAAA-MM-DD) y referencia del documento de autorización. */
  autorizacion: { fecha: string; documento: string };
}

export interface LogoCliente {
  empresa: string;
  /** SVG o PNG en public/clientes/logos/. */
  archivo: string;
  autorizacion: { fecha: string; documento: string };
}

export const TESTIMONIOS: Testimonio[] = [];
export const LOGOS_CLIENTES: LogoCliente[] = [];
