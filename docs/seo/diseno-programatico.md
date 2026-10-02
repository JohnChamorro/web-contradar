# Diseño — SEO programático con datos propios (fase 3)

Estado: **propuesta para el checkpoint 2**. No hay generación masiva hasta que
John apruebe. Fecha: 2026-10-02.

Base: inventario de métricas del repo `contradar` (develop), hecho en solo
lectura el 2-oct-2026. Rutas citadas con archivo:línea en ese repo.

## 0. Lo que cambia el plan original

1. **«PRD no hace análisis».** Las tablas `analytics.intel_*` se calculan en
   desarrollo sobre el lago Parquet con DuckDB y viajan a producción con
   `pg_dump` (`docs/operacion/operaciones.md:193-220`,
   `backend/estudios/intel/construir_intel.sh`). El snapshot de la web debe
   salir **del mismo lugar, en desarrollo**: cero consultas nuevas contra el
   VPS de 7 GB.
2. **No todas las métricas del encargo están validadas.** Las puertas G1-G6
   validan las tablas espejo (`historical_*`), no las `intel_*`. De las 10
   `intel_*`, 7 salen de datasets no cotejados contra su fuente
   (`docs/historico/diagnostico-estado-20260824.md:320-340`). Ver la tabla de §3.
3. **El NIT no identifica sola a una entidad.** El SENA tiene 81 nombres bajo
   un NIT y hay 354 NIT repartidos en varios municipios
   (`app/services/entidades.py:1-30`). La llave es **(NIT, departamento)**.
4. **No hay columna «es persona jurídica».** Regla segura disponible:
   NIT de persona jurídica `^[89]\d{8}$` o proponente plural (`is_group`).
   Todo lo demás se excluye, aunque sea un comerciante con matrícula.
5. **«13.145 entidades» no tiene consulta que lo respalde** (solo un
   documento de marketing). `/public/stats` cuenta `distinct entity_nit`
   desde 2012 y `intel_entidad` tiene 12.311 filas. La cifra de la portada se
   revisa con el snapshot.

## 1. Tipos de página

| Tipo | URL | Cantidad | Indexable |
|---|---|---|---|
| Entidad | `/entidades/<slug>-<nit>/` (si el NIT es ambiguo: `/entidades/<slug>-<nit>-<depto>/`) | las que pasen el umbral (§2) | por tandas (§6) |
| Hub nacional | `/entidades/` | 1 | sí |
| Hub por departamento | `/entidades/<departamento>/` | 33 | sí |
| Sector × departamento | `/licitaciones/<sector>/<departamento>/` | ≤ 14 × 33 = 462, solo las que pasen el umbral | sí, tras la tanda 1 |
| Informe | `/informes/<tema>-<año>/` | 1-4 al año | sí |

**Contenido de la página de entidad** (orden de lectura del licitante):

1. Cabecera: nombre, departamento y municipio, procesos abiertos hoy (conteo con
   fecha de corte, enlace a la app; nunca consulta en vivo).
2. **Cuánto contrata**: contratos y valor adjudicado por año (2023-2025), con n.
3. **En qué**: top de sectores (verticales UNSPSC de `sectors.py`).
4. **Cómo**: distribución por modalidad.
5. **A qué precio adjudica**: mediana del desvío frente al presupuesto
   (`analytics.price_bands`, nivel entidad y entidad × modalidad), con n e IC.
6. **Cuántos se presentan**: mediana de oferentes (`competition_intensity`).
7. **Quién le gana**: top 10 proveedores **personas jurídicas** por valor.
8. Bloques en espera de validación (§3): días de pago, adiciones, ejecución
   fuera del municipio, líneas del PAA.
9. Texto narrativo condicional (§4), FAQ de la entidad, CTA (§8).

## 2. Umbrales de publicación

Una entidad se **genera** si cumple las tres:

- **≥ 30 contratos adjudicados** en SECOP II en 2023-2025 (ventana con G4 al 99 %).
- **≥ 3 bloques con muestra suficiente**: volumen siempre; desvío con n ≥ 10
  procesos con competencia; oferentes con n ≥ 10; top de proveedores con ≥ 5
  personas jurídicas distintas; modalidad con ≥ 2 modalidades.
- Llave (NIT, departamento) sin ambigüedad de nombre, o resuelta por departamento.

Se genera **con `noindex`** si pasa el primer criterio pero no el segundo.
No se genera si no llega a 30 contratos. Cada bloque que no llegue a su n
mínimo **no se pinta** (no se pinta «sin datos» en una página indexable).

Sector × departamento: ≥ 100 contratos en 2023-2025 y ≥ 10 entidades compradoras.

## 3. Métricas: cuáles se publican ya y cuáles esperan

| Métrica | Fuente | Validación | Publicar en v1 |
|---|---|---|---|
| Contratos y valor por año | `historical_contracts` (SECOP II) | G4 99 % en 2023-25 | **Sí** |
| Modalidad | `historical_processes` | G2/G3 | **Sí** |
| Sector (vertical UNSPSC) | `historical_contracts` + `sectors.py` | G4 | **Sí** |
| Desvío adjudicado vs presupuesto | `price_bands` (niveles 5 y 8; desde 2012; recalculado cada noche en prod) | lo adjudicado (G2-G5); no depende de G6 | **Sí**, con n e IC95 |
| Oferentes típicos | `competition_intensity` (de `respuestas_al_procedimiento`) | no depende de G6; sin puerta propia | **Sí**, rotulado «según las respuestas publicadas en el SECOP» |
| Top proveedores | `historical_contracts` | G4 | **Sí**, solo `^[89]\d{8}$` o `is_group` |
| Días hasta el pago (p50/p90) | `intel_pagos` (SECOP II 2020-26) | fuente uymx **no cotejada** | **No** hasta cotejarla |
| Probabilidad de adición | `intel_prorroga` (`pct_valor`) | promovida el 1-oct; despliegue pendiente | **No** hasta confirmar en prod |
| % ejecutado fuera del municipio | `intel_territorio` | «algo inflada» sin DIVIPOLA | **No** |
| Líneas del PAA | `intel_paa` / `paa2_items` | fuente 9sue no cotejada; `paa2_items` trae contacto, correo y teléfono | **No**; si se activa, sin columnas de contacto |
| Procesos abiertos hoy | `opportunities` | vivo | **Solo conteo** con fecha de corte |

Regla: una puerta verde prueba la cobertura del conjunto que mide, no del que
lee la página. Antes de activar un bloque en espera, su `intel_*` necesita un
cotejo contra la fuente igual al de las puertas.

## 4. Texto único por página

Plantillas con frases condicionales sobre los datos, comparando con la
referencia nacional (que el script calcula: `price_bands` nivel 3 por
modalidad; la nacional global se calcula en el lago):

- Volumen: «Entre 2023 y 2025 adjudicó N contratos por $X; el {año} fue su año de más contratación» / «…y su contratación cayó X % en 2025».
- Precio: si el desvío mediano está por debajo de la nacional de su modalidad
  principal → «adjudica con descuentos más hondos que la media: hay competencia
  por precio»; si está cerca de 0 → «adjudica casi al presupuesto».
- Competencia: oferentes ≤ 2 → «poca competencia»; ≥ 6 → «procesos muy disputados».
- Concentración: si el top 3 de proveedores suma > 50 % del valor → «mercado
  concentrado»; si < 20 % → «mercado abierto».
- Modalidad: «X % de lo que contrata va por mínima cuantía» (enlaza a la guía).

Con 4-6 frases elegidas entre 3-4 variantes por regla, más los datos propios,
no hay dos páginas iguales. Se descarta toda frase cuyo dato no pase su n.

## 5. Arquitectura de datos

| | (a) Script en el repo `contradar` que exporta el snapshot | (b) Endpoint de exportación cacheado | (c) **Script en DEV sobre el lago + intel ya construidas, snapshot a R2** |
|---|---|---|---|
| Dónde corre | prod (lee Postgres) | prod (API) | **dev** (DuckDB sobre Parquet + Postgres de dev) |
| Carga en el VPS | consultas pesadas sobre `historical_processes` (33 GB): 28 s en la entidad grande | igual, y además expone una superficie nueva | **ninguna** |
| Coherencia con la regla «PRD no hace análisis» | no | no | **sí** |
| Tamaño del snapshot | 55-110 MB JSON, 12-20 MB gzip | igual | igual, partido en un NDJSON por departamento |
| Tiempo de build (13 mil páginas) | ~4-8 min en Pages | igual | igual (tanda 1: < 1 min) |
| Git | no entra: se descarga en el build | no entra | no entra: `prebuild` descarga de R2 |
| Actualización | mensual, a mano | automática | **mensual** junto con el `construir_intel.sh` que ya existe |

**Recomendación: (c).** El script `backend/scripts/exportar_snapshot_web.py`
reutiliza la lógica de `entity_detail` (`analysis.py:2073`) y la escalera
L1→L3 de `intel_bloques.py`, corre en desarrollo con tope de memoria igual que
`construir_intel.sh`, escribe `snapshot/<depto>.ndjson.gz` + `manifest.json`
(fecha de corte, conteos, versión de umbrales) y John lo sube a un bucket R2
privado. En Cloudflare Pages, `npm run prebuild` descarga el snapshot con un
token de solo lectura (variable de entorno) antes de `astro build`. Sin
snapshot, el build sigue y simplemente no genera páginas de entidad.

`lastmod` de cada entidad = fecha de corte del snapshot **solo si sus cifras
cambiaron** (el script guarda un hash por entidad en el manifest).

Límite de Cloudflare Pages: 20.000 archivos por despliegue. Con ~13 mil
entidades + hubs + el resto del sitio queda margen, pero obliga a no generar
entidades bajo el umbral.

## 6. Despliegue gradual

1. **Tanda 1**: las 400 entidades con más valor adjudicado 2023-2025 que pasen
   el umbral, indexables; el resto que pase el umbral se genera con `noindex`.
2. Medir 4-6 semanas en Search Console (sitemap `sitemap-entidades-0.xml`):
   indexadas / enviadas, impresiones por página, «Rastreada: actualmente sin indexar».
3. Si indexadas ≥ 70 % y hay impresiones: tanda 2 (hasta 2.000). Si no:
   enriquecer la plantilla antes de abrir más.

## 7. Schema y navegación

- `GovernmentOrganization` (nombre, `address` con departamento y municipio,
  `identifier` = NIT) como `about` de un `WebPage`, + `BreadcrumbList`
  (Inicio › Entidades › Departamento › Entidad) + `FAQPage` con 3 preguntas cuyas
  respuestas salen de los datos («¿A qué precio adjudica…?», «¿Cuántas empresas
  se presentan…?», «¿Quién le gana más contratos…?»).
- Sitemaps separados vía `chunks` de `astro.config.mjs` (ya preparado en la fase 1):
  `sitemap-entidades-N.xml`, `sitemap-sectores-N.xml`.
- Enlazado: pilar → `/entidades/`; hub de departamento ↔ entidades del
  departamento; página de sector → sector × departamento; cada entidad → 6
  entidades similares del mismo departamento y modalidad.

## 8. Llamada a la acción

«¿Vas a ofertarle a esta entidad? Mira a qué precio adjudica en tu tipo de
proceso» → diagnóstico gratis por NIT (`utm_medium=entidad`,
`utm_campaign=<nit>`) y prueba gratis.

## 9. Informes de datos

Plantilla `/informes/<tema>-<año>/`: titular con el hallazgo, metodología
(fuente, ventana, n, limpieza), 3-5 gráficas accesibles con tabla equivalente,
descarga CSV agregada (nunca personas naturales), fecha de corte y contacto de
prensa. Primeros candidatos, en orden de validación disponible:

1. «A qué precio adjudica el Estado en 2025, por modalidad» (`price_bands`; ya validable).
2. «Las entidades con más competencia y con menos» (`competition_intensity`).
3. «Cuánto tarda en pagar el Estado» — **solo cuando `intel_pagos` esté cotejada**.

## 10. Lo que necesito de John para pasar a implementación

1. Aprobar umbrales (§2) y la lista de métricas v1 (§3).
2. Aprobar la arquitectura (c) y crear el bucket R2 + token de solo lectura.
3. Correr el script de exportación en desarrollo (runbook en la implementación)
   — o permitirme leer la base de desarrollo local para generar las muestras reales.
