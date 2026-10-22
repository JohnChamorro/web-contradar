// Pruebas de `nombreEmpresa` (docs/maquetas/competencia: «normaliza los
// nombres de SECOP en MAYÚSCULAS… cubre los casos con tests»).
// Corre con `npm test` (Node ejecuta el TypeScript directamente).
import { test } from "node:test";
import assert from "node:assert/strict";

import { nombreEmpresa } from "../src/lib/nombres.ts";

const casos = [
  // Formas societarias con y sin puntos
  ["INGENIERIA INTEGRAL MP S.A.S", "Ingeniería Integral MP S.A.S."],
  ["PROMETEUS SOLUCIONES INTEGRALES S.A.S.", "Prometeus Soluciones Integrales S.A.S."],
  ["CIVILEX SAS", "Civilex SAS"],
  ["SERVICIOS INTEGRALES DE INGENIERIA LTDA", "Servicios Integrales de Ingeniería Ltda."],
  ["EMPOCALOTO E.S.P.", "Empocaloto E.S.P."],
  ["EMPRESA DE ENERGIA DE PEREIRA S.A. E.S.P", "Empresa de Energía de Pereira S.A. E.S.P."],
  ["HOSPITAL SAN JOSE E.S.E.", "Hospital San José E.S.E."],
  // UT y consorcios
  ["UT VIAS MORALES 2025", "UT Vías Morales 2025"],
  ["UNION TEMPORAL INGENIERIA CAUCA", "Unión Temporal Ingeniería Cauca"],
  // Palabras que son propiedades de Object: no pueden romper la regla.
  ["INGENIERO CONSTRUCTOR SAS", "Ingeniero Constructor SAS"],
  ["CONSORCIO CONSTRUCTOR TOSTRING 2024", "Consorcio Constructor Tostring 2024"],
  ["CONSORCIO VIAL PIENDAMO 26", "Consorcio Vial Piendamó 26"],
  // Siglas: sin vocal, cortas no corrientes, conocidas, con & o dígitos
  ["JJ JARAMILLO INGENIERIA SAS", "JJ Jaramillo Ingeniería SAS"],
  ["CONSTRUOBRAS GIA S.A.S.", "Construobras GIA S.A.S."],
  ["M&G CONSTRUCTORES Y CONSULTORES S.A.S.", "M&G Constructores y Consultores S.A.S."],
  ["ICBF REGIONAL CAUCA", "ICBF Regional Cauca"],
  ["SMA CONSTRUCTORA S.A.S. ZOMAC", "SMA Constructora S.A.S. Zomac"],
  // Partículas y palabras corrientes cortas
  ["LA PREVISORA S.A. COMPAÑIA DE SEGUROS", "La Previsora S.A. Compañía de Seguros"],
  ["ALCALDIA MUNICIPIO DE SANTANDER DE QUILICHAO", "Alcaldía Municipio de Santander de Quilichao"],
  ["CONSTRUCTORA RIO SUR", "Constructora Rio Sur"],
  // Personas
  ["GUILLERMO ANDRES BELTRAN ROMERO", "Guillermo Andrés Beltrán Romero"],
  // Puntuación pegada y guiones
  ["SOCIEDAD DE ACUEDUCTOS, ALCANTARILLADOS Y ASEO", "Sociedad de Acueductos, Alcantarillados y Aseo"],
  ["MUNICIPIO DE TIMBIO (CUENTA OFICIAL)", "Municipio de Timbío (Cuenta Oficial)"],
  ["CAUCA - ALCALDIA MUNICIPIO DE SILVIA", "Cauca - Alcaldía Municipio de Silvia"],
  // Lo que ya viene escrito a mano se respeta
  ["EDUH-Turbo", "EDUH-Turbo"],
  ["Ingeniería Integral MP S.A.S.", "Ingeniería Integral MP S.A.S."],
  ["Universidad del Cauca", "Universidad del Cauca"],
  // Vacíos
  ["", ""],
  ["   ", ""],
];

for (const [entrada, esperado] of casos) {
  test(`«${entrada}»`, () => {
    assert.equal(nombreEmpresa(entrada), esperado);
  });
}

test("nulos y espacios repetidos", () => {
  assert.equal(nombreEmpresa(null), "");
  assert.equal(nombreEmpresa(undefined), "");
  assert.equal(nombreEmpresa("  CIVILEX   SAS  "), "Civilex SAS");
});
