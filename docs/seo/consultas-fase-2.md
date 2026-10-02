# Consultas SQL de los datos originales de las guías (fase 2)

Cada `<DatoContRadar id="…" />` de las guías nace en `null` en
`src/data/datos-guias/<slug>.ts` y se llena con lo que devuelve la consulta del
mismo id, corrida por John en **producción** (PostgreSQL, base `contradar`).

Reglas que siguen todas:

- **Solo lo adjudicado o contratado** (puertas G2-G5 del plan de autonomía,
  `~/eulertech/contradar/docs/historico/plan-autonomia-datos-jul2026.md` §4.1 y
  `runbook-prod-autonomia.md` etapa E). **Nada que dependa de procesos
  ofertados ni de oferentes** (puerta G6 sin validar): ni `process_bidders`,
  ni `respuestas_al_procedimiento`, ni `analytics.price_bands` (su «regla 1»
  exige más de un oferente).
- Mismas definiciones que la app, citadas en cada consulta. La fuente de cada
  regla está en el repo de la app (`backend/app/services/…`).
- Medianas, nunca medias. **Cada consulta devuelve su `n` junto al valor**: si
  el `n` no aparece al lado de la cifra, la cifra no se publica.
- Solo `SELECT`. Nada escribe. Pensadas para horario valle.

## Cómo correrlo

```bash
# En el VPS (mismo patrón que el runbook; John conoce usuario y conexión):
docker exec -it contradar-postgres psql -U <usuario> -d contradar -X
```

Dentro de `psql`, antes de cualquier consulta:

```sql
SET default_transaction_read_only = on;   -- red de seguridad: nada puede escribir
SET statement_timeout = '120s';
SET jit = off;                            -- en estas agregaciones el JIT solo suma (medido: 648 ms de 3,6 s)
\pset format aligned
\timing on
```

Si una consulta de `historical_processes` llega al tope de 120 s (la tabla
tiene ~20 M filas y no hay índice por `awarded_date`), repetir **solo esa**
con `SET statement_timeout = '300s';` y volver a `'120s'` después.

**Cómo pegar el resultado:** la salida de `psql` tal cual (cabecera + fila(s)),
precedida de una línea `medido: AAAA-MM-DD`. Todas las consultas devuelven el
`id` en la primera columna, así que se pueden pegar varias seguidas sin
etiquetarlas.

---

## 00-precheck · antes de nada

**Mide:** que prod tiene los datos en la forma que las consultas suponen.
**Tablas:** `analytics.historical_contracts`, `analytics.historical_processes`,
`analytics.intel_prorroga`.

```sql
-- a) Contratos por plataforma en 2025 y último día cargado (usa ix_contract_year).
SELECT '00-precheck-contratos' AS id, source, count(*) AS n,
       min(sign_date) AS desde, max(sign_date) AS hasta
FROM analytics.historical_contracts
WHERE year = 2025
GROUP BY source
ORDER BY source;

-- b) Procesos adjudicados con fecha de adjudicación 2025.
SELECT '00-precheck-adjudicados' AS id, source, count(*) AS n
FROM analytics.historical_processes
WHERE year BETWEEN 2024 AND 2026
  AND awarded IS TRUE
  AND awarded_date >= DATE '2025-01-01' AND awarded_date < DATE '2026-01-01'
GROUP BY source;

-- c) intel_prorroga promovida con la adición en valor (1-oct-2026).
SELECT '00-precheck-prorroga' AS id, count(*) AS filas,
       count(pct_valor) AS filas_con_adicion_valor
FROM analytics.intel_prorroga;
```

**Qué esperar:** (a) `secop_ii` alrededor de 1,05 M filas (lo esperado del
backfill D.2 era 1.050.857) y `hasta` = 2025-12-31; (b) `secop_ii` con decenas
de miles, `secop_i` **sin filas** (SECOP I no tiene adjudicación estructurada
en el espejo, plan §2.1); (c) `filas_con_adicion_valor` > 0. Si (c) falla con
«column pct_valor does not exist», `cg-adiciones-share` no se puede correr
hasta promover `estudios/intel/promover_intel_prorroga.sql`.

---

## Definiciones comunes

**Modalidad.** Familia canónica de `app/services/modalidades.py::canonica()`:
SECOP I y II escriben la misma modalidad de 39 formas, y la app las pliega en
~13 familias comparando sin tildes ni mayúsculas, **en este orden** (gana el
primer patrón que case). En SQL:

```sql
CASE
  WHEN m LIKE '%licitacion%'                                    THEN 'Licitación pública'
  WHEN m LIKE '%menor cuantia%'                                 THEN 'Selección abreviada de menor cuantía'
  WHEN m LIKE '%subasta inversa%' OR m = 'subasta'              THEN 'Selección abreviada subasta inversa'
  WHEN m LIKE '%precalificacion%' OR m LIKE '%lista corta%'     THEN 'Concurso de méritos con precalificación'
  WHEN m LIKE '%concurso de meritos%'                           THEN 'Concurso de méritos abierto'
  WHEN m LIKE '%minima cuantia%'                                THEN 'Mínima cuantía'
  WHEN m LIKE '%contratacion directa%'                          THEN 'Contratación directa'
  WHEN m LIKE '%regimen especial%'                              THEN 'Contratación régimen especial'
  WHEN m LIKE '%convenios con mas de dos partes%'               THEN 'Contratos y convenios con más de dos partes'
  WHEN m LIKE '%seleccion abreviada%'                           THEN 'Selección abreviada (otras causales)'
  WHEN m LIKE '%enajenacion de bienes%'                         THEN 'Enajenación de bienes'
  WHEN m LIKE '%asociacion publico privada%'
    OR m LIKE '%iniciativa privada%'                            THEN 'Asociación público privada'
  WHEN m LIKE '%concurso de diseno%'                            THEN 'Concurso de diseño arquitectónico'
  ELSE 'Sin familia'
END
-- con m = translate(lower(btrim(modality)), 'ÁÉÍÓÚÜÑáéíóúüñ', 'aeiouunaeiouun')
-- (el translate cubre mayúsculas con tilde aunque la base tenga collation C)
```

**Presupuesto y valor adjudicado.** `historical_processes.estimated_value`
(`precio_base` de p6dx) y `historical_processes.awarded_value`
(`valor_total_adjudicacion`), solo con `awarded IS TRUE` (marca `adjudicado =
'Si'` de p6dx; `scripts/ingesta/backfill_historical.py::_award_fields`). Es la
cobertura validada por **G2**. Solo existe para **SECOP II**: SECOP I no tiene
adjudicaciones en el espejo (plan §2.1), así que toda métrica de desvío o de
«procesos adjudicados» es de SECOP II y la frase debe decirlo.

**Desvío %** = `100 × (adjudicado / presupuesto − 1)`. Negativo = se adjudicó
por debajo del presupuesto. Es el mismo modelo que la app llama «baja»
(`price_bands_job.py`: `baja = 100 × (1 − adjudicado/presupuesto)`, o sea
`desvío = −baja`). Limpieza, idéntica a la **regla 2** de
`price_bands_job.py`: presupuesto > 0, adjudicado > 0 y desvío entre −50 % y
0 % (fuera: adjudicado por encima del presupuesto, y bajas de más del 50 %,
que son adjudicaciones por lote o acuerdo marco).

> **Diferencia deliberada con la app.** La banda de puja de la app aplica
> además la **regla 1** (solo procesos con más de un oferente). Esa regla
> depende de oferentes (G6), así que aquí **no se aplica**: el desvío
> publicado es el de **todos** los adjudicados, no el de los competidos, y por
> eso **no coincidirá** con la «zona de puja» de la ficha. La frase debe
> hablar de «procesos adjudicados», no de «procesos con competencia». Se
> acompaña de `pct_al_presupuesto` (la misma medida que la app guarda como
> `at_budget_share`: desvío > −0,01 %) para que el lector sepa cuánta
> adjudicación al presupuesto hay dentro de la mediana.

**Ventana «adjudicados en 2025».** `awarded_date` en 2025. Como no hay índice
por `awarded_date`, se acota con `year BETWEEN 2024 AND 2026`
(`ix_historical_year`; `year` es el año de **publicación**, y el loader pone
el año de carga a lo que llega sin fecha de publicación, de ahí el 2026).
Límite conocido: quedan fuera los procesos publicados en 2023 o antes y
adjudicados en 2025, que son marginales. Los adjudicados **sin**
`awarded_date` tampoco entran (no se pueden fechar).

**Contrato 2025.** `historical_contracts.year = 2025` (= año de
`fecha_de_firma`, `ix_contract_year`). Métricas de mercado → **solo
`source = 'secop_ii'`**: regla del modelo `HistoricalContract` («si una
consulta agrega sobre MUCHOS proveedores, filtra por `source`»), y es la
plataforma cuya cobertura validan G4/G5. Fuera los contratos sin firmar
(`capacidad_residual.estado_sin_firmar`: estado con «borrador» o «enviado
proveedor»).

**Valor creíble de un contrato.** `0 < value ≤ 1e12` (un billón): el umbral
`_VALOR_IMPOSIBLE` de `ganadas.py`, el mismo tope de los estudios intel. Por
encima hay megaproyectos reales y también erratas; para una mediana es
irrelevante, pero se excluye para no depender de la lista de erratas.

**Sector.** El de la app: **vertical por prefijo UNSPSC**
(`app/services/sectors.py::VERTICALS`), no `official_sector` (no lo usa
ninguna consulta de la app) ni `tipo_de_contrato`. Los prefijos de las
verticales no se solapan, así que cada contrato cae en una o en ninguna.

| slug de la web | vertical (`sectors.py`) | prefijos UNSPSC |
|---|---|---|
| `construccion` | `construction` | 22, 30, 72, 95 |
| `ingenieria-e-interventoria` | `engineering` | 8110 |
| `salud` | `health` | 42, 51, 85 |
| `tecnologia-y-telecomunicaciones` | `technology` | 32, 43, 8111, 8112 |
| *(quinto, lo define otro agente)* | ver la consulta: devuelve las 14 verticales | — |

Ojo con `ingenieria-e-interventoria`: la vertical de la app es solo la familia
UNSPSC 8110 (servicios de ingeniería profesional). Una interventoría que la
entidad codifique en otro segmento (p. ej. el 80, gestión) la app la cuenta en
otra vertical; la cifra publicada debe decir «servicios de
ingeniería (UNSPSC 8110)» o la guía no coincidirá con lo que el usuario ve al
filtrar el sector en la app.

**Consorcio/UT.** Misma regla que la ficha del proceso
(`ficha_proceso.py`: `es_consorcio = is_group or _es_plural(provider_name)`):
marca `es_grupo = 'Si'` de jbjy **o** nombre del contratista que empieza por
«consorcio», «unión temporal», «ut », «u.t.», «promesa de sociedad» o
«estructura plural» (`ganadas.py::_PREFIJOS_PLURAL`).

---

## mc-desvio-mediana

**Mide:** la mediana del desvío % entre lo adjudicado y el presupuesto en
mínima cuantía, procesos SECOP II adjudicados en 2025.
**Tablas:** `analytics.historical_processes`.
**Muestra (n):** `n` = procesos dentro de la limpieza.

```sql
WITH base AS (
  SELECT translate(lower(btrim(hp.modality)), 'ÁÉÍÓÚÜÑáéíóúüñ', 'aeiouunaeiouun') AS m,
         100.0 * (hp.awarded_value / hp.estimated_value - 1) AS desvio
  FROM analytics.historical_processes hp
  WHERE hp.year BETWEEN 2024 AND 2026
    AND hp.source = 'secop_ii'
    AND hp.awarded IS TRUE
    AND hp.awarded_date >= DATE '2025-01-01' AND hp.awarded_date < DATE '2026-01-01'
    AND hp.estimated_value > 0 AND hp.awarded_value > 0
), fam AS (
  SELECT CASE
           WHEN m LIKE '%licitacion%' THEN 'otra'
           WHEN m LIKE '%menor cuantia%' THEN 'otra'
           WHEN m LIKE '%subasta inversa%' OR m = 'subasta' THEN 'otra'
           WHEN m LIKE '%precalificacion%' OR m LIKE '%lista corta%' THEN 'otra'
           WHEN m LIKE '%concurso de meritos%' THEN 'otra'
           WHEN m LIKE '%minima cuantia%' THEN 'Mínima cuantía'
           ELSE 'otra'
         END AS familia, desvio
  FROM base
)
SELECT 'mc-desvio-mediana' AS id,
       round((percentile_cont(0.5) WITHIN GROUP (ORDER BY desvio)
              FILTER (WHERE desvio BETWEEN -50 AND 0))::numeric, 2)            AS valor_pct,
       count(*) FILTER (WHERE desvio BETWEEN -50 AND 0)                        AS n,
       round((percentile_cont(0.25) WITHIN GROUP (ORDER BY desvio)
              FILTER (WHERE desvio BETWEEN -50 AND 0))::numeric, 2)            AS p25_pct,
       round((percentile_cont(0.75) WITHIN GROUP (ORDER BY desvio)
              FILTER (WHERE desvio BETWEEN -50 AND 0))::numeric, 2)            AS p75_pct,
       round(100.0 * count(*) FILTER (WHERE desvio > -0.01 AND desvio <= 0)
             / nullif(count(*) FILTER (WHERE desvio BETWEEN -50 AND 0), 0), 1) AS pct_al_presupuesto,
       count(*)                                                                AS n_antes_limpieza,
       count(*) FILTER (WHERE desvio > 0)                                      AS fuera_sobre_presupuesto,
       count(*) FILTER (WHERE desvio < -50)                                    AS fuera_baja_mayor_50
FROM fam
WHERE familia = 'Mínima cuantía';
```

**Pegar:** la fila completa. Se publica `valor_pct` (p. ej. «−6,4 %», o
«6,4 % por debajo del presupuesto») con `n` procesos.

## sa-desvio-subasta

**Mide:** la mediana del desvío % en selección abreviada por subasta inversa,
procesos SECOP II adjudicados en 2025.
**Tablas:** `analytics.historical_processes`.
**Muestra (n):** `n`.

```sql
WITH base AS (
  SELECT translate(lower(btrim(hp.modality)), 'ÁÉÍÓÚÜÑáéíóúüñ', 'aeiouunaeiouun') AS m,
         100.0 * (hp.awarded_value / hp.estimated_value - 1) AS desvio
  FROM analytics.historical_processes hp
  WHERE hp.year BETWEEN 2024 AND 2026
    AND hp.source = 'secop_ii'
    AND hp.awarded IS TRUE
    AND hp.awarded_date >= DATE '2025-01-01' AND hp.awarded_date < DATE '2026-01-01'
    AND hp.estimated_value > 0 AND hp.awarded_value > 0
), fam AS (
  SELECT CASE
           WHEN m LIKE '%licitacion%' THEN 'otra'
           WHEN m LIKE '%menor cuantia%' THEN 'otra'
           WHEN m LIKE '%subasta inversa%' OR m = 'subasta' THEN 'Selección abreviada subasta inversa'
           ELSE 'otra'
         END AS familia, desvio
  FROM base
)
SELECT 'sa-desvio-subasta' AS id,
       round((percentile_cont(0.5) WITHIN GROUP (ORDER BY desvio)
              FILTER (WHERE desvio BETWEEN -50 AND 0))::numeric, 2)            AS valor_pct,
       count(*) FILTER (WHERE desvio BETWEEN -50 AND 0)                        AS n,
       round((percentile_cont(0.25) WITHIN GROUP (ORDER BY desvio)
              FILTER (WHERE desvio BETWEEN -50 AND 0))::numeric, 2)            AS p25_pct,
       round((percentile_cont(0.75) WITHIN GROUP (ORDER BY desvio)
              FILTER (WHERE desvio BETWEEN -50 AND 0))::numeric, 2)            AS p75_pct,
       round(100.0 * count(*) FILTER (WHERE desvio > -0.01 AND desvio <= 0)
             / nullif(count(*) FILTER (WHERE desvio BETWEEN -50 AND 0), 0), 1) AS pct_al_presupuesto,
       count(*)                                                                AS n_antes_limpieza,
       count(*) FILTER (WHERE desvio > 0)                                      AS fuera_sobre_presupuesto,
       count(*) FILTER (WHERE desvio < -50)                                    AS fuera_baja_mayor_50
FROM fam
WHERE familia = 'Selección abreviada subasta inversa';
```

**Pegar:** la fila completa.

## oe-desvio-por-modalidad

**Mide:** la mediana del desvío % por familia de modalidad, procesos SECOP II
adjudicados en 2025 (tabla).
**Tablas:** `analytics.historical_processes`.
**Muestra (n):** `n` por fila. **Publicar solo las filas con `n ≥ 30`**
(`MIN_N_USAR` de `price_bands_job.py`); las de menos, fuera de la tabla.

```sql
WITH base AS (
  SELECT translate(lower(btrim(hp.modality)), 'ÁÉÍÓÚÜÑáéíóúüñ', 'aeiouunaeiouun') AS m,
         100.0 * (hp.awarded_value / hp.estimated_value - 1) AS desvio
  FROM analytics.historical_processes hp
  WHERE hp.year BETWEEN 2024 AND 2026
    AND hp.source = 'secop_ii'
    AND hp.awarded IS TRUE
    AND hp.awarded_date >= DATE '2025-01-01' AND hp.awarded_date < DATE '2026-01-01'
    AND hp.estimated_value > 0 AND hp.awarded_value > 0
), fam AS (
  SELECT CASE
           WHEN m LIKE '%licitacion%'                                THEN 'Licitación pública'
           WHEN m LIKE '%menor cuantia%'                             THEN 'Selección abreviada de menor cuantía'
           WHEN m LIKE '%subasta inversa%' OR m = 'subasta'          THEN 'Selección abreviada subasta inversa'
           WHEN m LIKE '%precalificacion%' OR m LIKE '%lista corta%' THEN 'Concurso de méritos con precalificación'
           WHEN m LIKE '%concurso de meritos%'                       THEN 'Concurso de méritos abierto'
           WHEN m LIKE '%minima cuantia%'                            THEN 'Mínima cuantía'
           WHEN m LIKE '%contratacion directa%'                      THEN 'Contratación directa'
           WHEN m LIKE '%regimen especial%'                          THEN 'Contratación régimen especial'
           WHEN m LIKE '%convenios con mas de dos partes%'           THEN 'Contratos y convenios con más de dos partes'
           WHEN m LIKE '%seleccion abreviada%'                       THEN 'Selección abreviada (otras causales)'
           WHEN m LIKE '%enajenacion de bienes%'                     THEN 'Enajenación de bienes'
           WHEN m LIKE '%asociacion publico privada%'
             OR m LIKE '%iniciativa privada%'                        THEN 'Asociación público privada'
           WHEN m LIKE '%concurso de diseno%'                        THEN 'Concurso de diseño arquitectónico'
           ELSE 'Sin familia'
         END AS familia, desvio
  FROM base
)
SELECT 'oe-desvio-por-modalidad' AS id,
       familia,
       round((percentile_cont(0.5) WITHIN GROUP (ORDER BY desvio)
              FILTER (WHERE desvio BETWEEN -50 AND 0))::numeric, 2)            AS valor_pct,
       count(*) FILTER (WHERE desvio BETWEEN -50 AND 0)                        AS n,
       round((percentile_cont(0.25) WITHIN GROUP (ORDER BY desvio)
              FILTER (WHERE desvio BETWEEN -50 AND 0))::numeric, 2)            AS p25_pct,
       round((percentile_cont(0.75) WITHIN GROUP (ORDER BY desvio)
              FILTER (WHERE desvio BETWEEN -50 AND 0))::numeric, 2)            AS p75_pct,
       round(100.0 * count(*) FILTER (WHERE desvio > -0.01 AND desvio <= 0)
             / nullif(count(*) FILTER (WHERE desvio BETWEEN -50 AND 0), 0), 1) AS pct_al_presupuesto,
       count(*)                                                                AS n_antes_limpieza
FROM fam
GROUP BY familia
ORDER BY n DESC
LIMIT 20;
```

**Pegar:** la tabla completa. Contratación directa y régimen especial saldrán
con mediana 0 y `pct_al_presupuesto` alto: es dato real (no hay puja), y la
guía debe explicarlo en vez de esconder esas filas.

## mc-participacion

**Mide:** qué % de los procesos SECOP II adjudicados en 2025 fueron de mínima
cuantía.
**Tablas:** `analytics.historical_processes`.
**Muestra (n):** `n_total` (denominador) y `n_mc` (numerador).

```sql
WITH base AS (
  SELECT translate(lower(btrim(hp.modality)), 'ÁÉÍÓÚÜÑáéíóúüñ', 'aeiouunaeiouun') AS m
  FROM analytics.historical_processes hp
  WHERE hp.year BETWEEN 2024 AND 2026
    AND hp.source = 'secop_ii'
    AND hp.awarded IS TRUE
    AND hp.awarded_date >= DATE '2025-01-01' AND hp.awarded_date < DATE '2026-01-01'
), fam AS (
  SELECT CASE
           WHEN m LIKE '%licitacion%'                                THEN 'competitiva'
           WHEN m LIKE '%menor cuantia%'                             THEN 'competitiva'
           WHEN m LIKE '%subasta inversa%' OR m = 'subasta'          THEN 'competitiva'
           WHEN m LIKE '%precalificacion%' OR m LIKE '%lista corta%' THEN 'competitiva'
           WHEN m LIKE '%concurso de meritos%'                       THEN 'competitiva'
           WHEN m LIKE '%minima cuantia%'                            THEN 'mc'
           WHEN m LIKE '%contratacion directa%'                      THEN 'directa_o_especial'
           WHEN m LIKE '%regimen especial%'                          THEN 'directa_o_especial'
           ELSE 'otra'
         END AS grupo
  FROM base
)
SELECT 'mc-participacion' AS id,
       round(100.0 * count(*) FILTER (WHERE grupo = 'mc') / nullif(count(*), 0), 1) AS valor_pct,
       count(*) FILTER (WHERE grupo = 'mc')                                       AS n_mc,
       count(*)                                                                   AS n_total,
       -- Variante: sobre las modalidades de convocatoria pública (sin directa ni
       -- régimen especial). Publicar la que diga la frase, nunca mezclarlas.
       round(100.0 * count(*) FILTER (WHERE grupo = 'mc')
             / nullif(count(*) FILTER (WHERE grupo IN ('mc', 'competitiva')), 0), 1) AS valor_pct_sobre_convocatorias,
       count(*) FILTER (WHERE grupo IN ('mc', 'competitiva'))                     AS n_convocatorias
FROM fam;
```

**Pegar:** la fila completa. La frase debe decir «de los procesos adjudicados
en SECOP II en 2025» (SECOP I no tiene adjudicaciones en el espejo).

## cuut-share-obra

**Mide:** qué % de los contratos de obra firmados en 2025 en SECOP II se
adjudicaron a un consorcio o unión temporal.
**Tablas:** `analytics.historical_contracts` (+ `analytics.provider_groups`
como contraste, por `ix_provider_group_codigo`).
**Muestra (n):** `n_obra` (denominador) y `n_cuut`.

Obra = grupo «obra» de `tipos_contrato.py` (tipo de contrato que empieza por
«obra», sin tildes ni mayúsculas).

```sql
WITH obra AS (
  SELECT c.is_group, c.provider_code, c.value,
         translate(lower(btrim(coalesce(c.provider_name, ''))),
                   'ÁÉÍÓÚÜÑáéíóúüñ', 'aeiouunaeiouun') AS nom
  FROM analytics.historical_contracts c
  WHERE c.year = 2025
    AND c.source = 'secop_ii'
    AND translate(lower(btrim(coalesce(c.contract_type, ''))),
                  'ÁÉÍÓÚÜÑáéíóúüñ', 'aeiouunaeiouun') LIKE 'obra%'
    AND lower(coalesce(c.status, '')) NOT LIKE '%borrador%'
    AND lower(coalesce(c.status, '')) NOT LIKE '%enviado proveedor%'
), marcado AS (
  SELECT value,
         (is_group IS TRUE
          OR nom LIKE 'consorcio%' OR nom LIKE 'union temporal%'
          OR nom LIKE 'ut %' OR nom LIKE 'u.t.%'
          OR nom LIKE 'promesa de sociedad%' OR nom LIKE 'estructura plural%') AS es_cuut,
         (provider_code IS NOT NULL AND EXISTS (
            SELECT 1 FROM analytics.provider_groups g
            WHERE g.codigo_grupo = obra.provider_code)) AS en_ceth
  FROM obra
)
SELECT 'cuut-share-obra' AS id,
       round(100.0 * count(*) FILTER (WHERE es_cuut) / nullif(count(*), 0), 1) AS valor_pct,
       count(*) FILTER (WHERE es_cuut)                                         AS n_cuut,
       count(*)                                                                AS n_obra,
       -- Mismo corte, pero por VALOR (solo valores creíbles, 0 < v <= 1e12).
       round(100.0 * sum(value) FILTER (WHERE es_cuut AND value > 0 AND value <= 1e12)
             / nullif(sum(value) FILTER (WHERE value > 0 AND value <= 1e12), 0), 1) AS valor_pct_por_monto,
       -- Contraste: contratos cuyo proveedor es un grupo de CETH (puente G3/G5)
       -- y que la regla de la app NO marcó. Debe ser pequeño; si no lo es, avisar.
       count(*) FILTER (WHERE en_ceth AND NOT es_cuut)                         AS ceth_no_marcados
FROM marcado;
```

**Pegar:** la fila completa. Se publica `valor_pct` con `n_obra`. Si
`ceth_no_marcados` pasa del 2 % de `n_obra`, no publicar y avisar: la regla de
la ficha se estaría quedando corta.

## cg-adiciones-share

**Mide:** qué % de los contratos tuvo al menos una adición en valor.
**Tablas:** `analytics.intel_prorroga` (la carga `estudios/intel/a7_intel_prorroga.sql`
desde el lago; la misma tabla que lee la ficha).
**Muestra (n):** `n_base` (contratos con valor original conocido) y
`n_con_adicion`.

**Ventana: la de `a7_intel_prorroga.sql`, no 2025.** Solo años cerrados, para
que el contrato haya tenido tiempo de modificarse, y una medida por plataforma
porque miden cosas distintas:

- **SECOP I:** contratos **firmados 2018-2024**, valor entre $1 M y $1 billón;
  adición en valor = tiene al menos una fila con `adicion_en_valor > 0` en
  7fix. Todos tienen valor original (la cuantía), así que la base es el total.
- **SECOP II:** contratos **firmados 2020-2024 y cerrados** (estado
  `terminado`, `Modificado` o `Cerrado`), valor entre $1 M y $1 billón;
  adición en valor = valor vigente > 1,01 × valor adjudicado del proceso. La
  base son solo los contratos cuyo valor adjudicado se conoce (~74 %):
  contarla sobre todos subestimaría el porcentaje.

Se suman las filas de nivel `L3` (sector × plataforma, sin umbral de muestra),
que juntas son el universo completo de la tabla `base` del estudio.

```sql
SELECT 'cg-adiciones-share' AS id,
       coalesce(plataforma, 'AMBAS') AS plataforma,
       round(100.0 * sum(afectados_valor) / nullif(sum(contratos_valor), 0), 1) AS valor_pct,
       sum(afectados_valor)                                                     AS n_con_adicion,
       sum(contratos_valor)                                                     AS n_base,
       sum(contratos)                                                           AS n_contratos_ventana,
       -- Mismo dato solo para obra (tipo de contrato «Obra»), para las guías de obra.
       round(100.0 * sum(afectados_valor) FILTER (WHERE lower(sector) LIKE 'obra%')
             / nullif(sum(contratos_valor) FILTER (WHERE lower(sector) LIKE 'obra%'), 0), 1) AS valor_pct_obra,
       sum(contratos_valor) FILTER (WHERE lower(sector) LIKE 'obra%')           AS n_base_obra
FROM analytics.intel_prorroga
WHERE nivel = 'L3'
GROUP BY ROLLUP (plataforma)
ORDER BY grouping(plataforma), 2;
```

**Pegar:** las tres filas (SECOP I, SECOP II, AMBAS). **Publicar por
plataforma**, cada una con su ventana; la fila `AMBAS` mezcla dos medidas
distintas y es solo de referencia. Ejemplo de frase: «En SECOP II, el X % de
los contratos firmados entre 2020 y 2024 y ya cerrados terminó valiendo más
de lo adjudicado (n = …)».

## sector-&lt;slug&gt;-contratos-2025 y sector-&lt;slug&gt;-mediana-2025

**Mide:** cuántos contratos se firmaron en 2025 en SECOP II en el sector y la
mediana de su valor.
**Tablas:** `analytics.historical_contracts` (`ix_contract_year`).
**Muestra (n):** `n_contratos` para el conteo; `n_con_valor` para la mediana.

Devuelve **las 14 verticales** de la app de una vez (un solo recorrido de
2025), con el slug de la web donde ya existe; el quinto sector se lee en su
fila sin tocar la consulta. Para quedarse con uno, cambiar la variable
`slug` (o dejar `todos`).

```sql
\set slug 'todos'

WITH c AS (
  SELECT c.value,
         left(c.unspsc_code, 2) AS s2,
         left(c.unspsc_code, 4) AS s4,
         translate(lower(btrim(coalesce(c.contract_type, ''))),
                   'ÁÉÍÓÚÜÑáéíóúüñ', 'aeiouunaeiouun') LIKE 'prestacion de servicios%' AS es_prestacion
  FROM analytics.historical_contracts c
  WHERE c.year = 2025
    AND c.source = 'secop_ii'
    AND lower(coalesce(c.status, '')) NOT LIKE '%borrador%'
    AND lower(coalesce(c.status, '')) NOT LIKE '%enviado proveedor%'
), v AS (
  SELECT value, es_prestacion,
         CASE
           -- app/services/sectors.py::VERTICALS (prefijos disjuntos)
           WHEN s4 = '8110'                                         THEN 'engineering'
           WHEN s4 IN ('8111', '8112') OR s2 IN ('32', '43')        THEN 'technology'
           WHEN s2 IN ('22', '30', '72', '95')                      THEN 'construction'
           WHEN s2 IN ('42', '51', '85')                            THEN 'health'
           WHEN s2 IN ('15', '26', '39', '40', '71', '83')          THEN 'energy_utilities'
           WHEN s2 IN ('47', '76', '77')                            THEN 'environment'
           WHEN s2 IN ('24', '25', '78')                            THEN 'transport'
           WHEN s2 IN ('49', '55', '60', '86')                      THEN 'education_culture'
           WHEN s2 IN ('41', '45')                                  THEN 'laboratory'
           WHEN s2 IN ('11', '12', '13', '20', '21', '23', '27', '31', '73') THEN 'industry'
           WHEN s2 IN ('10', '14', '50', '53', '70', '90', '91')    THEN 'agro_consumer'
           WHEN s2 IN ('44', '52', '54', '56')                      THEN 'furnishings'
           WHEN s2 IN ('46', '92')                                  THEN 'security_defense'
           WHEN s2 IN ('48', '64', '80', '82', '84', '93', '94')    THEN 'admin_services'
           ELSE 'sin_sector'
         END AS vertical
  FROM c
), s AS (
  SELECT vertical,
         CASE vertical
           WHEN 'construction' THEN 'construccion'
           WHEN 'engineering'  THEN 'ingenieria-e-interventoria'
           WHEN 'health'       THEN 'salud'
           WHEN 'technology'   THEN 'tecnologia-y-telecomunicaciones'
           ELSE '(' || vertical || ')'   -- sin slug aún: el quinto sale de aquí
         END AS slug,
         value, es_prestacion
  FROM v
)
SELECT 'sector-' || slug || '-2025' AS id,
       slug,
       vertical,
       count(*)                                                              AS n_contratos,
       round((percentile_cont(0.5) WITHIN GROUP (ORDER BY value)
              FILTER (WHERE value > 0 AND value <= 1e12))::numeric, 0)       AS mediana_valor,
       count(*) FILTER (WHERE value > 0 AND value <= 1e12)                   AS n_con_valor,
       -- Sin «prestación de servicios» (contratos de personas): lo que la app
       -- excluye por defecto en buscador y alertas (tipos_contrato.EXCLUIDOS_POR_DEFECTO).
       count(*) FILTER (WHERE NOT es_prestacion)                             AS n_contratos_sin_prestacion,
       round((percentile_cont(0.5) WITHIN GROUP (ORDER BY value)
              FILTER (WHERE NOT es_prestacion AND value > 0 AND value <= 1e12))::numeric, 0) AS mediana_sin_prestacion,
       count(*) FILTER (WHERE NOT es_prestacion AND value > 0 AND value <= 1e12) AS n_con_valor_sin_prestacion
FROM s
WHERE :'slug' = 'todos' OR slug = :'slug'
GROUP BY slug, vertical
ORDER BY n_contratos DESC
LIMIT 20;
```

**Pegar:** la tabla completa (o la fila del slug). De cada fila salen dos ids:

- `sector-<slug>-contratos-2025` ← `n_contratos_sin_prestacion` (recomendado:
  es lo que el usuario ve en la app con el filtro por defecto) o
  `n_contratos` si la frase habla de «todos los contratos, incluidos los de
  prestación de servicios». Decirlo en la frase.
- `sector-<slug>-mediana-2025` ← `mediana_sin_prestacion` con
  `n_con_valor_sin_prestacion` (o `mediana_valor` con `n_con_valor`, en
  pareja con la elección anterior).

El conteo es de **SECOP II**; los contratos de SECOP I de 2025 no entran (ver
`secop-share-secop-i`).

---

## secop-share-secop-i · NO MEDIBLE CON FIABILIDAD HOY

**Lo que pide:** % de los contratos firmados en 2025 publicados en SECOP I.

**Por qué no se publica todavía.** El esquema lo permite
(`historical_contracts.source` distingue `secop_i` de `secop_ii`), pero la
**cobertura de SECOP I en el espejo no la valida ninguna puerta**:

- G4 mide el llenado de columnas de los contratos contra jbjy (SECOP II), no
  el número de filas de SECOP I.
- El backfill D.2 del runbook de prod corre con la fuente por defecto
  (`secop_ii`); los contratos de SECOP I (f789) entran con una corrida aparte
  (`--fuente secop_i`) que no está en el runbook ni tiene verificación
  esperado-vs-traído.

Si SECOP I estuviera cargado a medias, el porcentaje saldría bajo **sin que
nada lo delate**. No se escribe la consulta del dato hasta que exista esa
verificación. Para habilitarlo hace falta: correr el backfill de SECOP I 2025,
comparar `00-precheck` (a), fila `secop_i`, contra el conteo de la fuente
(`f789-7hwg`, `count(distinct uid)` con `fecha_de_firma_del_contrato` en 2025)
y exigir ≥ 95 %, como las demás puertas. Con eso en verde, la consulta es un
`count(*) FILTER (WHERE source = 'secop_i') / count(*)` sobre la misma base
que `00-precheck` (a), y se añade aquí.

## Lo que queda fuera a propósito

- **Desvío sobre procesos competidos** (la «zona de puja» de la app,
  `analytics.price_bands`): exige más de un oferente → G6.
- **Desvío y participación en SECOP I:** no hay adjudicaciones de SECOP I en
  el espejo (plan §2.1). Todas las cifras de desvío y de «procesos
  adjudicados» son de SECOP II, y la frase debe decirlo.
- **Estudios `a2_intel_bandas.sql` y `a4_intel_competidores.sql`:** se
  construyen sobre las ofertas (wi7w) → G6. No se usan para las guías.
