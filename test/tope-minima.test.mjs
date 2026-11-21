import { test } from "node:test";
import assert from "node:assert/strict";
import { leerTope, coherenteConMenor, buscarEntidades, textoBusqueda } from "../src/lib/tope-minima.ts";
import { tramosCuantia, cuantiasCgp } from "../src/data/cuantias.ts";

test("tramos de 2026 con el SMMLV de $1.750.905", () => {
  const t = tramosCuantia(2026);
  assert.deepEqual(t.map((x) => x.minimaPesos), [49_025_340, 78_790_725, 113_808_825, 148_826_925, 175_090_500]);
  assert.deepEqual(t.map((x) => x.menorPesos), [490_253_400, 787_907_250, 1_138_088_250, 1_488_269_250, 1_750_905_000]);
  assert.equal(t[1].desdePesos, 210_108_600_000);
  assert.equal(t[0].etiqueta, "Menos de 120.000 SMMLV");
  assert.equal(t[4].etiqueta, "1.200.000 SMMLV o más");
});

test("un año sin salario decretado no se calcula", () => {
  assert.throws(() => tramosCuantia(2031));
});

test("cuantías del Código General del Proceso", () => {
  assert.deepEqual(cuantiasCgp(2026), { minimaHasta: 70_036_200, menorHasta: 262_635_750 });
});

test("lectura del tope declarado", () => {
  assert.deepEqual(leerTope(49_025_340, 2026), { tipo: "tramo", indice: 0, smmlv: 28 });
  assert.deepEqual(leerTope(175_090_500, 2026), { tipo: "tramo", indice: 4, smmlv: 100 });
  assert.equal(leerTope(39_858_000, 2026).tipo, "anterior");
  assert.equal(leerTope(490_253_400, 2026).tipo, "menor-como-minima");
  const colegio = leerTope(35_018_100, 2026);
  assert.equal(colegio.tipo, "otro");
  assert.equal(colegio.smmlvExacto, true);
  assert.equal(Math.round(colegio.smmlv), 20);
  assert.equal(leerTope(54_000_000, 2026).smmlvExacto, false);
});

test("la mínima es el 10 % de la menor", () => {
  assert.equal(coherenteConMenor(49_025_340, 490_253_400), true);
  assert.equal(coherenteConMenor(35_018_100, 35_018_100), false);
  assert.equal(coherenteConMenor(49_025_340, null), null);
});

test("búsqueda sin tildes, por nombre o municipio", () => {
  const filas = [
    ["Alcaldía de Villa Central", "Cauca", "Villa Central", 49_025_340, 490_253_400, "2026-02-01"],
    ["Hospital de Villa Central ESE", "Cauca", "Villa Central", 49_025_340, 490_253_400, "2026-02-01"],
    ["Gobernación del Macizo", "Cauca", "", 175_090_500, 1_750_905_000, "2026-02-01"],
  ];
  const indice = filas.map(textoBusqueda);
  assert.deepEqual(buscarEntidades(filas, indice, "alcaldia villa", 8), [0]);
  assert.deepEqual(buscarEntidades(filas, indice, "villa central", 8), [0, 1]);
  assert.deepEqual(buscarEntidades(filas, indice, "GOBERNACION", 8), [2]);
  assert.deepEqual(buscarEntidades(filas, indice, "vi", 8), []);
});
