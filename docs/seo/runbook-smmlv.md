# Cuando salga el salario mínimo del año nuevo

El decreto sale a finales de diciembre. Ese día cambia lo que más nos busca la
gente: «mínima cuantía 2027». El primero que lo tenga bien gana enero.

**Nunca se escribe un salario que no esté decretado.** Ni «proyectado», ni «se
espera».

## 1. El número (5 min)

`src/data/cuantias.ts`:

```ts
export const SMMLV = {
  2025: 1_423_500,
  2026: 1_750_905,
  2027: <valor del decreto>,   // Decreto NNNN de 2026
};
export const ANIO_CUANTIAS = 2027;
```

Con eso cambian solos: título, descripción, H1, entrada, gráfica, tabla,
preguntas frecuentes y tabla del Código General del Proceso de
`/guias/minima-cuantia/`, y la tabla de `/herramientas/tope-minima-cuantia/`.

```bash
npm test      # los tramos de 2026 siguen fijos en test/tope-minima.test.mjs; añade los de 2027
npm run build
```

## 2. Lo que NO cambia solo (10 min)

En `/guias/minima-cuantia/`:

- Las **fuentes**: el decreto nuevo, con su enlace.
- El recuadro «Ojo con el año y con el salario», que habla del pleito del
  decreto de 2026. Se reescribe o se quita.
- `dateModified` y `consultadas`.
- Los `DatoContRadar` con «2026» en la frase (`src/data/datos-guias/minima-cuantia.ts`).

Otras páginas con el salario escrito a mano (búscalas así):

```bash
grep -rnE "1\.750\.905|1750905|490\.253\.400|49\.025\.340" src
```

El 21-nov-2026 eran: `guias/seleccion-abreviada` (menor cuantía, título
incluido), `licitaciones-colombia`, `guias/poliza-de-seriedad-de-la-oferta` y
la calculadora de capacidad residual (`SMMLV_2026`).

## 3. La herramienta del tope (enero y febrero)

Las entidades publican el PAA nuevo hasta el 31 de enero. Hasta entonces la
herramienta sigue mostrando el plan del año anterior y lo dice («tope de 2026»).
Cuando haya planes de 2027 suficientes (mirar
`select count(distinct codigo_entidad) from analytics.paa2_headers where anno = 2027`
en dev; el 21-nov-2026 eran 14):

```bash
TOPE_ANIO=2027 node --experimental-strip-types scripts/tope-minima/generar.mjs
```

y se revisa que el resumen del archivo tenga sentido (la mayoría en tramo
exacto) antes de publicarlo.

## 4. Avisar a Google

Search Console → Inspección de URLs → `/guias/minima-cuantia/` → Solicitar
indexación. Igual con `/guias/seleccion-abreviada/` y la herramienta.
