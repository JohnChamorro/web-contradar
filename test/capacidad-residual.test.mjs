import { test } from "node:test";
import assert from "node:assert/strict";
import {
  puntajeExperiencia,
  puntajeFinanciero,
  puntajeTecnico,
  saldoContrato,
  calcularK,
} from "../src/lib/capacidad-residual.ts";

test("tramos de experiencia (E)", () => {
  assert.equal(puntajeExperiencia(0), 0);
  assert.equal(puntajeExperiencia(3), 60);
  assert.equal(puntajeExperiencia(3.01), 80);
  assert.equal(puntajeExperiencia(6), 80);
  assert.equal(puntajeExperiencia(10), 100);
  assert.equal(puntajeExperiencia(10.5), 120);
});

test("tramos de liquidez (CF) y profesionales (CT)", () => {
  assert.equal(puntajeFinanciero(0.5), 20);
  assert.equal(puntajeFinanciero(0.75), 25);
  assert.equal(puntajeFinanciero(1), 30);
  assert.equal(puntajeFinanciero(1.5), 35);
  assert.equal(puntajeFinanciero(2), 40);
  assert.equal(puntajeTecnico(0), 0);
  assert.equal(puntajeTecnico(5), 20);
  assert.equal(puntajeTecnico(6), 30);
  assert.equal(puntajeTecnico(11), 40);
});

test("saldo de contrato: tope de 360 días y participación", () => {
  // 1.200 M a 12 meses, quedan 180 días, 50 % → 1.200/360 × 180 × 0,5 = 300 M
  assert.equal(saldoContrato({ valor: 1_200_000_000, plazoMeses: 12, diasPendientes: 180, participacion: 50 }), 300_000_000);
  // Más de 360 días pendientes cuenta 360
  assert.equal(
    saldoContrato({ valor: 2_400_000_000, plazoMeses: 24, diasPendientes: 600, participacion: 100 }),
    1_200_000_000,
  );
});

test("K completo", () => {
  const r = calcularK({
    co: 3_000_000_000,
    experienciaSmmlv: 4_000,
    presupuesto: 1_750_905_000, // 1.000 SMMLV
    anticipo: 0,
    plazoMeses: 6,
    smmlv: 1_750_905,
    liquidez: 1.2,
    profesionales: 8,
    contratos: [{ valor: 1_200_000_000, plazoMeses: 12, diasPendientes: 180, participacion: 50 }],
  });
  assert.equal(r.e, 80); // 4.000 / 1.000 = 4
  assert.equal(r.cf, 35);
  assert.equal(r.ct, 30);
  assert.equal(r.bruto, 3_000_000_000 * 1.45);
  assert.equal(r.kProponente, 4_350_000_000 - 300_000_000);
  assert.equal(r.kProceso, 1_750_905_000);
  assert.equal(r.cumple, true);
});

test("K del proceso con plazo mayor a 12 meses", () => {
  const r = calcularK({
    co: 0, experienciaSmmlv: 0, presupuesto: 2_400_000_000, anticipo: 400_000_000,
    plazoMeses: 24, smmlv: 1_750_905, liquidez: 0, profesionales: 0, contratos: [],
  });
  assert.equal(r.kProceso, 1_000_000_000);
});
