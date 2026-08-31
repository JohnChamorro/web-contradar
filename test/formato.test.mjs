/**
 * Casos límite del formateador de cifras (hallazgo C5).
 * Se ejecuta con:  node --test test/
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { moneda, porcentaje } from "../src/lib/formato.ts";

test("moneda exacta: punto de millar, sin decimales", () => {
  assert.equal(moneda(0), "$0");
  assert.equal(moneda(152000), "$152.000");
  assert.equal(moneda(1850000000), "$1.850.000.000");
  assert.equal(moneda(1234.6), "$1.235");
});

test("moneda abreviada: un decimal solo si aporta, y coma decimal", () => {
  assert.equal(moneda(200000000, "abreviado"), "$200 M");
  assert.equal(moneda(2500000, "abreviado"), "$2,5 M");
  assert.equal(moneda(4000000, "abreviado"), "$4 M");
  assert.equal(moneda(1000000000, "abreviado"), "$1.000 M");
});

test("porcentaje: coma decimal, un decimal como mucho, sin relleno", () => {
  assert.equal(porcentaje(0.22), "0,2");   // la calculadora imprimía "0.220"
  assert.equal(porcentaje(17), "17");
  assert.equal(porcentaje(6.05), "6,1");
  assert.equal(porcentaje(100), "100");
});

test("un valor pequeño pero real no se imprime como cero", () => {
  // La calculadora daba «0» para contratos muy grandes: falso, y encima
  // desactivaba el argumento («representa el 0 % del valor»).
  assert.equal(porcentaje(0.044), "<0,1");
  assert.equal(porcentaje(0.099), "<0,1");
  assert.equal(porcentaje(0), "0");
  assert.equal(porcentaje(0.1), "0,1");
});

test("valores no finitos no rompen la página", () => {
  assert.equal(moneda(NaN), "—");
  assert.equal(porcentaje(Infinity), "—");
});
