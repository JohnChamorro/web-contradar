# Mapa de palabras clave — ContRadar

Una intención = una URL. Si dos páginas persiguen la misma búsqueda, Google
elige una al azar y las dos pierden (canibalización). Antes de crear una
página, busca aquí su grupo; si ya tiene dueña, enlaza a ella en vez de
competirle.

Revisado: 2026-10-02 (seo/fase-2).

## Comercial (quiero una herramienta)

| Grupo | Búsquedas | URL dueña | Apoyo (enlaza a la dueña) |
|---|---|---|---|
| App / plataforma | app de licitaciones, app licitaciones Colombia, plataforma de licitaciones, software de licitaciones | `/` | `/funcionalidades/` («plataforma de licitaciones» como secundaria) |
| Alertas | alertas de licitaciones, alertas SECOP, monitoreo SECOP, buscador de licitaciones | `/producto/busquedas/` | `/producto/notificaciones/` (avisos de cambios, NO alertas de procesos nuevos) |
| Precio de la herramienta | precio app de licitaciones, cuánto cuesta ContRadar | `/precios/` | — |
| Diagnóstico | diagnóstico de licitaciones gratis, cómo le va a mi empresa en el SECOP | `/diagnostico/` (fase 4) | CTA de NIT en todas las guías |

## Diferenciador (donde no hay rival)

| Grupo | Búsquedas | URL dueña | Apoyo |
|---|---|---|---|
| Competencia | análisis de competencia en licitaciones, quién gana licitaciones, competidores SECOP | `/producto/analisis-de-competencia/` | guía cómo ganar |
| Precio de adjudicación | a qué precio se gana una licitación, precio de adjudicación, histórico de adjudicaciones SECOP | `/producto/estadistica-de-la-licitacion/` | guía oferta económica |
| Por entidad | quién gana licitaciones en [entidad], cuánto tarda en pagar [entidad] | `/entidades/<slug>-<nit>/` (fase 3) | hubs `/entidades/` |

## Informacional (quiero aprender)

| Grupo | Búsquedas | URL dueña |
|---|---|---|
| Pilar | licitaciones Colombia, qué es una licitación pública, cómo licitar con el Estado, modalidades de contratación, licitación pública vs concurso de méritos | `/licitaciones-colombia/` |
| Buscar | cómo buscar licitaciones en SECOP | `/guias/como-buscar-licitaciones-en-secop/` |
| Plataformas del Estado | SECOP I vs SECOP II, diferencia SECOP I y II | `/guias/secop-i-vs-secop-ii/` |
| PAA | qué es el PAA, plan anual de adquisiciones | `/guias/que-es-el-paa/` |
| Mínima cuantía | mínima cuantía, qué es mínima cuantía, tope mínima cuantía 2026 | `/guias/minima-cuantia/` |
| Selección abreviada | selección abreviada, menor cuantía, subasta inversa | `/guias/seleccion-abreviada/` |
| RUP | qué es el RUP, cómo actualizar el RUP, renovar RUP | `/guias/que-es-el-rup/` |
| Habilitantes | requisitos habilitantes, capacidad financiera licitación, indicadores financieros | `/guias/requisitos-habilitantes/` |
| K residual | capacidad residual, K de contratación, cómo se calcula la capacidad residual | `/guias/capacidad-residual/` (explica) · `/herramientas/calculadora-capacidad-residual/` (calcula: «calculadora capacidad residual») |
| Asociaciones | consorcio o unión temporal, diferencia consorcio y unión temporal | `/guias/consorcios-y-uniones-temporales/` |
| Garantía | póliza de seriedad de la oferta, garantía de seriedad | `/guias/poliza-de-seriedad-de-la-oferta/` |
| Precio de la oferta | cómo hacer la oferta económica, cómo calcular la oferta, AIU, precio artificialmente bajo | `/guias/como-calcular-la-oferta-economica/` |
| Ganar | cómo ganar una licitación, consejos para ganar licitaciones | `/guias/como-ganar-una-licitacion/` |

## Comparativa

| Grupo | Búsquedas | URL dueña |
|---|---|---|
| Ranking | mejores plataformas de licitaciones Colombia 2026, mejores apps de licitaciones, apps para licitaciones | `/guias/mejores-apps-licitaciones-colombia/` (301 desde `/guias/apps-para-licitaciones-colombia/`) |
| Alternativas | alternativas a Licitaciones.info · a Fromus · a LicitIA | `/alternativas/licitaciones-info/` · `/alternativas/fromus/` · `/alternativas/licitia/` |

## Sectorial y local

| Grupo | Búsquedas | URL dueña |
|---|---|---|
| Sector | licitaciones de construcción / obra pública, licitaciones de interventoría, licitaciones de salud, licitaciones de tecnología | `/sectores/<sector>/` |
| Hub sectores | licitaciones por sector | `/sectores/` |
| Local | licitaciones [departamento], licitaciones [ciudad], licitaciones de [entidad], licitaciones de [sector] en [departamento] | fase 3 (programático) |

## Reglas de convivencia

- `/producto/busquedas/` es dueña de «alertas»; `/producto/notificaciones/` habla de *avisos de cambios* y no usa «alertas de licitaciones» en title ni H1.
- La guía de K **explica** y la calculadora **calcula**: la guía enlaza a la calculadora en el primer pantallazo y la calculadora enlaza a la guía para la explicación larga.
- Las guías de modalidad (mínima cuantía, selección abreviada) no compiten con la pilar: la pilar resume las cinco modalidades en un párrafo cada una y enlaza a la guía.
