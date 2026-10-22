# Licitaciones abiertas por sector y por departamento — propuesta

> Ronda SEO 2, punto 2 (22-oct-2026). **Propuesta con 2 ejemplos reales de
> dev; no hay generación en masa** hasta que John apruebe. Comparte snapshot,
> bucket y plantillas con las páginas por entidad (fase 3,
> `diseno-programatico.md` y `fase-3-checkpoint-2.md`).

## Diagnóstico

**Qué pasa ahora.** El sitio no lista ningún proceso abierto. Las consultas
con intención de listado —«licitaciones de construcción colombia»,
«licitaciones [departamento]»— están fuera del top 20
(`seguimiento-posiciones.md`). `/sectores/<sector>/` explica el sector pero no
muestra qué hay abierto hoy, y `/licitaciones/<sector>/<depto>/` (fase 3) solo
trae agregados históricos 2023-2025.

**Qué hay en los datos (dev, corte 22-oct-2026, transacción READ ONLY,
criterio `estados.condiciones_ofertable_hoy` de la app):**

| | Procesos |
|---|---:|
| Abiertos hoy | 3.901 |
| … de SECOP II (`datos_gov`) / RSS de CCE / SECOP I | 2.356 / 1.157 / 388 |
| … sin fecha de cierre (SECOP I y RSS no la publican) | 1.565 |
| … sin valor | 42 |
| … con departamento | 99 %+ |

**Hallazgo que cambia el diseño: el sector UNSPSC no sirve hoy para SECOP II.**
Desde el 16-sep-2026 la fuente de SECOP II trae `codigo_principal_de_categoria
= "UNSPECIFIED"` (ya documentado en `app/services/sector_vecinos.py` y
reportado a Colombia Compra). En dev: 50.462 de 139.027 filas en septiembre y
105.809 de 110.966 en octubre. De las 2.356 abiertas de SECOP II, solo **40**
tienen código; 2.291 tienen vertical **inferida por vecinos**, que cubre el
91,2 % pero acierta el 26,7 %. Eso vale para el filtro indulgente de
Búsquedas, **no** para una página pública titulada «licitaciones de
construcción»: 3 de cada 4 filas serían de otro sector.

Lo que sí es fiable es el **tipo de contrato** (`contract_type`, la señal que
CLAUDE.md ya da por buena para sector): Obra 664 abiertas, Interventoría y
Consultoría ~150, Suministros/Compraventa ~1.400, Prestación de servicios
~1.300.

**Qué pasará después.** Cada página de sector y de departamento muestra los
procesos abiertos del día con entidad, valor, cierre y enlace al SECOP,
generada en estático desde un archivo diario. Ninguna consulta en vivo.

## Qué se publica (v1)

| Página | URL | Filtro | Estado |
|---|---|---|---|
| Sector obra | bloque nuevo en `/sectores/construccion/` | `contract_type = Obra` | **listo** |
| Sector interventoría | bloque en `/sectores/ingenieria-e-interventoria/` | `contract_type` en Interventoría, Consultoría | **listo** |
| Salud, tecnología, agua | bloque en su `/sectores/<slug>/` | UNSPSC propio | **en espera** hasta que SECOP II vuelva a traer el código; mientras, el bloque no se pinta |
| Departamento | `/licitaciones/<depto>/` (33, nueva) | `department` | **listo** |
| Sector × departamento | bloque en `/licitaciones/<sector>/<depto>/` (ya existe) | los dos anteriores | listo para obra e interventoría |

Una intención = una URL: «licitaciones de construcción» sigue siendo
`/sectores/construccion/` (mapa-keywords.md); no se crea otra página que
compita con ella, se le agrega lo que le faltaba.

**Reglas de cada fila:**

- Solo `condiciones_ofertable_hoy`, sin duplicados (`possible_duplicate_of_id`
  nulo), con valor > 0.
- **Se quitan los que cierran el mismo día del corte**: una página estática que
  muestra un proceso ya cerrado a media tarde hace más daño que no mostrarlo.
- Sin fecha de cierre (SECOP I): se muestra «SECOP I no publica el cierre» y
  solo si se publicó hace ≤ 15 días (el mismo techo de la app).
- Top 20 por valor, y debajo el conteo total y el valor total, con la fecha de
  corte visible.
- **Sin personas naturales**: la entidad es pública. El objeto se recorta a 3
  líneas y se descartan las filas cuyo objeto contenga un patrón de cédula
  (`C.C.`, «cédula»); en la muestra no hubo ninguna.
- Nombre de entidad normalizado (en la muestra salen «GOBERNACIÓN DE
  BOLÍVAR//», «DILOF» y nombres cortados a 40 caracteres): se reutiliza la
  regla de nombres de la app y, para siglas, el nombre largo cuando exista.
  El objeto se limpia del prefijo «El contratista se obliga con … a».
- Cada fila enlaza a su URL del SECOP (`community.secop.gov.co` o
  `contratos.gov.co`), con `rel="nofollow"`.
- CTA: «Recibe estos procesos en tu correo cada mañana» → prueba gratis
  (`utm_medium=abiertas`, `utm_campaign=<sector|depto>`).

## Arquitectura

El snapshot mensual de entidades sale de **dev** (análisis pesado, «PRD no
hace análisis»). Los abiertos son otra cosa: **se vencen en días**, y dev no
está garantizado encendido cada mañana (memoria «jobs diarios se pierden si
dev está apagado»). Por eso el archivo diario sale de donde los datos están
vivos.

| | (a) **Job en PRD → R2 → build** (recomendado) | (b) Script en dev cada día |
|---|---|---|
| Frescura | la de los pollers de PRD | depende de que dev esté prendido |
| Carga en el VPS | 1 consulta al día (~10 s en dev en frío) sobre `opportunities` con los índices que ya usa Búsquedas; es una lectura, no un análisis | ninguna |
| Riesgo | bajo; si falla, el build no pinta listados | listado viejo si dev no corrió |
| Tamaño | ≤ 50 páginas × 20 filas ≈ 1.000 filas, < 1 MB gzip | igual |

**Recomendación: (a).**

1. `contradar`: job `exportar_abiertos_web` a las **05:10** (después del poll
   de madrugada y lejos del `ruedo_refresh` de las 06:20; ver
   `docs/operacion/jobs-y-pollers.md`). Una consulta READ ONLY con
   `statement_timeout` de 60 s; escribe `abiertos.json.gz` + su `manifest`
   (corte, conteos, sha256) en el **mismo bucket R2** del snapshot de
   entidades, bajo `abiertos/`.
2. Al terminar, llama al **deploy hook** de Cloudflare Pages: el sitio se
   reconstruye una vez al día (≈ 30 builds al mes de los 500 del plan).
3. `web-contradar`: `scripts/descargar-snapshot.mjs` baja también
   `ABIERTOS_URL`. **Si el archivo tiene más de 36 h, se ignora**: los bloques
   no se pintan y la página queda como hoy. Nunca se publica un listado viejo.
4. Plantillas compartidas con la fase 3: la misma tabla
   (`components/programatico/TablaProcesos.astro`) sirve para el bloque de
   sector, la página de departamento y el sector × departamento; y el conteo
   `abiertosHoy` de cada entidad pasa a salir de este archivo diario en vez del
   mensual.

**Indexación:** `/licitaciones/<depto>/` indexable solo si tiene ≥ 10 abiertas
el día del build; si no, `noindex` ese día (el contenido de la página depende
del listado). Sitemap propio `sitemap-licitaciones-N.xml` con `lastmod` = corte.

## Los 2 ejemplos (dev, corte 22-oct-2026)

Datos reales de la base de desarrollo con las reglas de arriba (sin los que
cierran el 22-oct, sin duplicados).

### Ejemplo 1 · `/sectores/construccion/`, bloque «Licitaciones de obra pública abiertas hoy»

**573 procesos de obra abiertos, por $1.381.161 M** (top 10 de 20 por valor):

| Cierre | Entidad | Municipio | Objeto | Modalidad | Valor |
|---|---|---|---|---|---:|
| 2026-10-23 | Gobernación del Cesar | Valledupar | Construcción de infraestructura hospitalaria en los municipios de El Paso, Manaure, Curumaní y … | Licitación pública | $151.118 M |
| 2026-10-29 | Distrito de Barranquilla | Barranquilla | Obras de infraestructura para el fortalecimiento de la seguridad y convivencia en el distrito … | Licitación pública | $95.947 M |
| 2026-10-26 | DILOF | Bogotá D.C. | Construcción y dotación del comando departamento de policía de Caldas y áreas de apoyo … | Selección abreviada de menor cuantía | $53.100 M |
| 2026-11-19 | Gobernación de Bolívar | Turbaco | Construcción de la infraestructura de la institución educativa Escuela Normal Superior de Mompóx | Licitación pública | $44.485 M |
| 2026-10-28 | Gobernación del Cesar | Valledupar | Mejoramiento de la infraestructura educativa en distintos municipios del departamento del Cesar | Licitación pública | $43.358 M |
| 2026-10-26 | DILOF | Bogotá D.C. | Construcción y dotación de la fase II del comando de policía metropolitana de Neiva … | Selección abreviada de menor cuantía | $40.000 M |
| 2026-10-30 | INDER Medellín | Medellín | Obras de mejoramiento, mantenimiento y/o adecuación de coliseos, canchas cubiertas y demás escenarios … | Licitación pública | $39.408 M |
| 2026-11-19 | Secretaría de Educación de Cali | Cali | Construcción de las obras … por el sistema de precios unitarios fijos | Licitación pública | $37.858 M |
| 2026-10-29 | Empresas Públicas de Cundinamarca | Bogotá D.C. | Construcción y/u optimización de acueductos y alcantarillados en el departamento de Cundinamarca | Licitación pública | $34.261 M |
| 2026-11-12 | Secretaría de Educación de Cali | Cali | Ajustes de los estudios y diseños … por el sistema de precios unitarios fijos | Licitación pública | $32.303 M |

En las dos tablas, entidad y objeto van pasados a minúscula y recortados a
mano para mostrar el objetivo de la normalización; las palabras son las de la
fuente (siglas como «DILOF» se dejan tal cual: no se expanden sin una fuente
que diga qué significan). Cifras, fechas y modalidades, sin tocar.

### Ejemplo 2 · `/licitaciones/cauca/`, «Licitaciones abiertas hoy en Cauca»

**140 procesos abiertos en Cauca, por $48.647 M:**

| Cierre | Entidad | Municipio | Objeto | Tipo | Valor |
|---|---|---|---|---|---:|
| 2026-11-10 | Alcaldía de Santander de Quilichao | Santander de Quilichao | Obras de mejoramiento … | Obra | $13.084 M |
| 2026-10-26 | Gobernación del Cauca | Popayán | Servicio … para la Secretaría de Educación y Cultura | Prestación de servicios | $6.695 M |
| 2026-10-23 | Alcaldía de Popayán | Popayán | Obras de mejoramiento vial de la calzada … | Obra | $6.276 M |
| 2026-10-29 | Policía Metropolitana de Popayán | — | Mantenimiento preventivo y correctivo al parque automotor | Prestación de servicios | $3.108 M |
| 2026-11-09 | Alcaldía de Popayán | Popayán | Obras de mejoramiento del anillo vial de la vereda González, tramo 1 | Obra | $2.787 M |
| 2026-10-30 | E.S.E. Hospital de El Tambo | El Tambo | Construcción de la unidad de atención en salud Cuatro Esquinas | Obra (régimen especial con ofertas) | $2.619 M |
| 2026-10-23 | Alcaldía de Popayán | Popayán | Obras de mejoramiento vial de la carrera … | Obra | $1.545 M |
| 2026-10-28 | Gobernación del Cauca | Popayán | Servicios temporales para la operación … | Prestación de servicios | $1.057 M |
| 2026-10-23 | Policía Metropolitana de Popayán | — | Suministro de seguros obligatorios (SOAT) | Suministros | $592 M |
| 2026-10-29 | Policía Metropolitana de Popayán | — | Suministro de seguros obligatorios (SOAT) | Suministros | $592 M |

Las dos últimas son dos procesos distintos (cierres distintos), no un
duplicado. «Municipio» vacío: la fuente no lo trae para esa entidad; la celda
dice «—».

Debajo de cada tabla: «Corte: 22 de octubre de 2026, 05:10. Fuente: datos
abiertos del SECOP I y II» + CTA a la prueba.

## Decisiones para John

1. ¿Arquitectura (a), con el job en PRD a las 05:10 y el deploy hook diario?
2. ¿v1 con obra e interventoría por tipo de contrato y los otros tres sectores
   en espera del UNSPSC?
3. ¿Top 20 por valor, o por cierre más próximo? (Propuesta: por valor; el
   cierre más próximo cambia todo el listado cada día y se lee como ruido.)
4. Para el deploy hook y el bucket: crear el hook en Pages y darle al VPS una
   llave de R2 de **solo escritura** sobre `abiertos/`.
