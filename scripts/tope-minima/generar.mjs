#!/usr/bin/env node
/* Genera public/datos/tope-minima-cuantia.json: el tope de mínima cuantía que
   cada entidad declara en su Plan Anual de Adquisiciones de SECOP II.

   Uso (desde la raíz de la web, con la base de desarrollo arriba):
     node --experimental-strip-types scripts/tope-minima/generar.mjs

   Lee de la base CURADA de desarrollo (`contradar`), solo lectura, con psql
   dentro del contenedor de Postgres. No toca PRD: «PRD no hace análisis»
   (docs/seo/diseno-programatico.md §0). El archivo resultante se confirma en
   el repo; se regenera cuando cambie el año o cada trimestre.

   Variables: TOPE_CONTENEDOR (contradar-postgres), TOPE_BASE (contradar),
   TOPE_ANIO (el de src/data/cuantias.ts). */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { nombreEmpresa } from "../../src/lib/nombres.ts";
import { ANIO_CUANTIAS, SMMLV } from "../../src/data/cuantias.ts";
import { leerTope } from "../../src/lib/tope-minima.ts";

const aqui = dirname(fileURLToPath(import.meta.url));
const raiz = join(aqui, "..", "..");
const CONTENEDOR = process.env.TOPE_CONTENEDOR ?? "contradar-postgres";
const BASE = process.env.TOPE_BASE ?? "contradar";
const ANIO = Number(process.env.TOPE_ANIO ?? ANIO_CUANTIAS);

/** Corre un .sql de esta carpeta y devuelve las filas como objetos. */
function consultar(archivo) {
  const sql = readFileSync(join(aqui, archivo), "utf8")
    .split("\n").filter((l) => !l.startsWith("--") && !l.startsWith("\\set")).join(" ")
    .replaceAll(":anno", String(ANIO)).trim().replace(/;$/, "");
  const csv = execFileSync(
    "docker",
    ["exec", "-i", CONTENEDOR, "sh", "-c", `psql -U "$POSTGRES_USER" -d ${BASE} -v ON_ERROR_STOP=1`],
    { input: `\\copy (${sql}) to stdout with csv header\n`, maxBuffer: 256 * 1024 * 1024, encoding: "utf8" },
  );
  return leerCsv(csv);
}

function leerCsv(texto) {
  const filas = [];
  let campo = "", fila = [], comillas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (comillas) {
      if (c === '"' && texto[i + 1] === '"') { campo += '"'; i++; }
      else if (c === '"') comillas = false;
      else campo += c;
    } else if (c === '"') comillas = true;
    else if (c === ",") { fila.push(campo); campo = ""; }
    else if (c === "\n") { fila.push(campo); filas.push(fila); fila = []; campo = ""; }
    else if (c !== "\r") campo += c;
  }
  if (campo || fila.length) { fila.push(campo); filas.push(fila); }
  const [cab, ...resto] = filas;
  return resto.filter((f) => f.length === cab.length).map((f) => Object.fromEntries(cab.map((k, i) => [k, f[i]])));
}

/* SECOP escribe el mismo departamento de varias formas. */
const DEPTOS = new Map([
  ["distrito capital de bogota", "Bogotá D.C."], ["bogota d.c.", "Bogotá D.C."], ["bogota", "Bogotá D.C."],
  ["san andres, providencia y santa catalina", "San Andrés y Providencia"],
  ["archipielago de san andres, providencia y santa catalina", "San Andrés y Providencia"],
]);
const plano = (t) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
const depto = (d) => (d ? DEPTOS.get(plano(d)) ?? d.trim() : "");
const limpio = (t) => t.replace(/[*+]+/g, " ").replace(/\/+\s*$/, "").replace(/\s+/g, " ").trim();

console.log(`Topes declarados en el PAA ${ANIO}…`);
const topes = consultar("consulta.sql");
console.log(`  ${topes.length} entidades. Ubicación por procesos de SECOP II (~1 min)…`);
const lugares = new Map(consultar("lugar.sql").map((l) => [l.codigo_entidad, l]));

/* Un lugar se acepta si es claramente el de la entidad: 80 % de sus procesos
   en SECOP II. Un lugar dudoso no se publica: es peor decir
   mal dónde queda una alcaldía que no decirlo. */
const PARTE_MINIMA = 0.8;
const sinLugar = (t) => !t || /^no definid/i.test(t.trim());
const entidades = [];
let sinValor = 0, corte = "";
for (const t of topes) {
  const minima = Math.round(Number(t.ppto_minima_cuantia));
  if (!(minima > 0)) { sinValor++; continue; }
  const menor = Math.round(Number(t.ppto_menor_cuantia)) || null;
  const l = lugares.get(t.codigo_entidad);
  /* Solo vale el lugar de sus procesos en SECOP II. El departamento que
     traen las líneas del plan NO sirve para ubicar a la entidad: medido el
     21-nov-2026, ponía a la Alcaldía de Caucasia en Cauca y a la de Istmina
     en Cesar. */
  const d = l && Number(l.parte_depto) >= PARTE_MINIMA && !sinLugar(l.depto) ? depto(l.depto) : "";
  const m = d && Number(l.parte_municipio) >= PARTE_MINIMA && !sinLugar(l.municipio) ? limpio(l.municipio) : "";
  if (t.fecha > corte) corte = t.fecha;
  entidades.push([nombreEmpresa(limpio(t.nombre_entidad)), d, m, minima, menor, t.fecha]);
}
entidades.sort((a, b) => a[0].localeCompare(b[0], "es"));

/* Resumen medido, para que la página nunca cite una cifra escrita a mano. */
const resumen = { entidades: entidades.length, tramo: [0, 0, 0, 0, 0], anterior: 0, menorComoMinima: 0, otro: 0, conLugar: 0 };
for (const e of entidades) {
  const r = leerTope(e[3], ANIO);
  if (r.tipo === "tramo") resumen.tramo[r.indice]++;
  else if (r.tipo === "anterior") resumen.anterior++;
  else if (r.tipo === "menor-como-minima") resumen.menorComoMinima++;
  else resumen.otro++;
  if (e[1]) resumen.conLugar++;
}

const salida = {
  anio: ANIO,
  smmlv: SMMLV[ANIO],
  /** Última modificación de un PAA incluida en el archivo. */
  corte,
  generado: new Date().toISOString().slice(0, 10),
  fuente: "Plan Anual de Adquisiciones de cada entidad en SECOP II (datos abiertos)",
  columnas: ["nombre", "departamento", "municipio", "minima", "menor", "fecha"],
  resumen,
  entidades,
};
const destino = join(raiz, "public", "datos", "tope-minima-cuantia.json");
mkdirSync(dirname(destino), { recursive: true });
writeFileSync(destino, JSON.stringify(salida));
console.log(`  ${entidades.length} entidades con tope (${sinValor} sin valor, fuera). Corte ${corte}.`);
console.log(`  Con departamento: ${resumen.conLugar}. Tramo exacto: ${resumen.tramo.reduce((a, b) => a + b, 0)}.`);
console.log(`→ ${destino}`);
