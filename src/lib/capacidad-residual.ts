/**
 * Capacidad residual (K) en obra pública — cálculo puro, sin DOM.
 *
 * MISMA FÓRMULA que la app (~/eulertech/contradar, backend/app/services/
 * kr_proponente.py y capacidad_residual.py), que cita la «Guía para determinar
 * y verificar la capacidad residual del proponente en los procesos de
 * contratación de obra pública» de Colombia Compra Eficiente (CCE-REC-GI-22) y
 * el Decreto 1082 de 2015, art. 2.2.1.1.1.6.4. Si cambia allá, cambia aquí.
 * test/capacidad-residual.test.mjs fija los casos de la guía.
 *
 *   K proponente = CO × (E + CF + CT) / 100 − SCE
 *   K proceso    = presupuesto − anticipo            si plazo ≤ 12 meses
 *                = (presupuesto − anticipo) × 12 / plazo   si plazo > 12 meses
 */

/** E: experiencia ÷ presupuesto, ambos en SMMLV. Máximo 120. */
export function puntajeExperiencia(relacion: number): number {
  if (!(relacion > 0)) return 0;
  if (relacion <= 3) return 60;
  if (relacion <= 6) return 80;
  if (relacion <= 10) return 100;
  return 120;
}

/** CF: índice de liquidez (activo corriente ÷ pasivo corriente). Máximo 40. */
export function puntajeFinanciero(liquidez: number): number {
  if (!(liquidez >= 0)) return 0;
  if (liquidez <= 0.5) return 20;
  if (liquidez <= 0.75) return 25;
  if (liquidez <= 1) return 30;
  if (liquidez <= 1.5) return 35;
  return 40;
}

/** CT: profesionales vinculados a la planta. Máximo 40. */
export function puntajeTecnico(profesionales: number): number {
  if (!(profesionales >= 1)) return 0;
  if (profesionales <= 5) return 20;
  if (profesionales <= 10) return 30;
  return 40;
}

export interface ContratoEnEjecucion {
  /** Valor total del contrato, COP. */
  valor: number;
  /** Plazo total, en meses. */
  plazoMeses: number;
  /** Días que faltan por ejecutar. Se toman como máximo 360 (12 meses). */
  diasPendientes: number;
  /** Participación en el consorcio o UT, 0-100. 100 si es propio. */
  participacion: number;
}

/** Saldo de un contrato en ejecución: lo que falta por ejecutar en los próximos 12 meses. */
export function saldoContrato(c: ContratoEnEjecucion): number {
  if (!(c.valor > 0) || !(c.plazoMeses > 0)) return 0;
  const dias = Math.min(Math.max(c.diasPendientes, 0), 360);
  return (c.valor / (c.plazoMeses * 30)) * dias * (Math.min(Math.max(c.participacion, 0), 100) / 100);
}

export interface EntradaK {
  /** Mayor ingreso operacional de los últimos 5 años, COP. */
  co: number;
  /** Valor de la experiencia en obra acreditada, en SMMLV. */
  experienciaSmmlv: number;
  presupuesto: number;
  anticipo: number;
  plazoMeses: number;
  smmlv: number;
  liquidez: number;
  profesionales: number;
  contratos: ContratoEnEjecucion[];
}

export function calcularK(x: EntradaK) {
  const presupuestoSmmlv = x.smmlv > 0 ? x.presupuesto / x.smmlv : 0;
  const relacionE = presupuestoSmmlv > 0 ? x.experienciaSmmlv / presupuestoSmmlv : 0;
  const e = puntajeExperiencia(relacionE);
  const cf = puntajeFinanciero(x.liquidez);
  const ct = puntajeTecnico(x.profesionales);
  const sce = x.contratos.reduce((s, c) => s + saldoContrato(c), 0);
  const bruto = (x.co * (e + cf + ct)) / 100;
  const kProponente = bruto - sce;
  const neto = Math.max(x.presupuesto - x.anticipo, 0);
  const kProceso = x.plazoMeses > 12 ? (neto * 12) / x.plazoMeses : neto;
  return { relacionE, e, cf, ct, sce, bruto, kProponente, kProceso, cumple: kProponente >= kProceso && kProceso > 0 };
}
