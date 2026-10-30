# Seguimiento de posiciones — Google Colombia

Una fila por consulta y una columna por medición. Se mide a mano en una ventana
de incógnito con ubicación Colombia (o en Search Console → Rendimiento →
Consultas, 28 días, filtro país Colombia) y se anota la posición orgánica de
`contradar.com.co`; «—» = fuera del top 20. Al lado, qué URL nuestra aparece.

Lo que se busca con cada medición: **qué subió, qué bajó y por qué**. Un cambio
sin causa conocida se anota igual, con «sin causa clara».

## Línea base — 22-oct-2026 (antes de la ronda SEO 2)

| Consulta | 22-oct | URL nuestra | Quién gana hoy |
|---|---:|---|---|
| mejores apps de licitaciones colombia 2026 | **1** | /guias/mejores-apps-licitaciones-colombia/ | — (somos #1) |
| calculadora capacidad residual | **2** | /herramientas/ (calculadora de K) | la app de CCE |
| app de licitaciones colombia | **5** | /guias/mejores-apps-licitaciones-colombia/ | comparativas y apps |
| análisis de competencia licitaciones | **6** | /producto/analisis-de-competencia/ (por confirmar) | — |
| software de licitaciones colombia | **14** | por confirmar | guiatic, Capterra, GetApp |
| app de licitaciones | — | — | — |
| plataforma de licitaciones colombia | — | — | — |
| licitaciones colombia | — | — | páginas que muestran procesos abiertos (licitacionescolombia.co/branch/…, licitaciones.info) |
| alertas de licitaciones secop | — | — | ídem: listados de procesos abiertos |
| cómo ganar una licitación | — | — | — |
| licitaciones de construcción colombia | — | — | listados de procesos abiertos por sector |

Lectura de la línea base:
- La comparativa es la página que más rankea: no se toca su URL, título ni H1.
- En las consultas de **intención transaccional** («licitaciones colombia»,
  «alertas SECOP», «licitaciones de construcción») gana quien **muestra
  procesos abiertos**. Una guía no compite ahí: hace falta una página que liste.
- En «software de licitaciones» pesan los **directorios** (guiatic, Capterra,
  GetApp): estar en ellos cuenta tanto como la página propia.

## Mediciones siguientes

| Consulta | 22-oct | 5-nov | 19-nov | 3-dic |
|---|---:|---:|---:|---:|
| mejores apps de licitaciones colombia 2026 | 1 | | | |
| calculadora capacidad residual | 2 | | | |
| app de licitaciones colombia | 5 | | | |
| análisis de competencia licitaciones | 6 | | | |
| software de licitaciones colombia | 14 | | | |
| app de licitaciones | — | | | |
| plataforma de licitaciones colombia | — | | | |
| licitaciones colombia | — | | | |
| alertas de licitaciones secop | — | | | |
| cómo ganar una licitación | — | | | |
| licitaciones de construcción colombia | — | | | |

Cada dos semanas, en el mismo orden. Search Console tarda en reflejar una
página nueva: se pide su indexación (runbook manual) el día que se publica.

## Qué cambió entre mediciones

La fecha es la del **despliegue a producción** (la pone John al publicar),
no la del commit: es la que se compara con la curva de posiciones.

| Fecha | Cambio publicado | Rama |
|---|---|---|
| _(al desplegar)_ | Comparativa revisada (precios de Licitarus, El País Licita → GremIA), fecha «Revisada» visible, enlazada desde la home y la pilar; enlaces a la home y a Mis contratos | `seo/ronda-2-comparativa` |
| _(al desplegar)_ | Title y meta de SECOP I vs II, mínima cuantía, cómo ganar y capacidad residual; cada guía enlaza a la home y a `/producto/*`; FAQ «¿es un software que hay que instalar?» en la home | `seo/ronda-2-contenido` |
| _(al desplegar)_ | Calculadora de K: ejemplo resuelto, FAQ con schema, WebApplication completo | `seo/ronda-2-calculadora` |
| _(al desplegar)_ | Landings `/ads/*` (noindex; no deberían mover el orgánico) | `seo/ronda-2-ads` |
| _(al desplegar)_ | `gclid` en la cookie de origen y política de datos §6 (no cambia el orgánico) | `seo/ronda-2-gclid` |
| _(al desplegar)_ | Calculadora: «Traer mis contratos» desde el NIT | `seo/ronda-2-calculadora-precarga` |
| _(al desplegar)_ | Licitaciones abiertas hoy: 33 páginas `/licitaciones/<departamento>/` y bloques en obra e interventoría (miden «licitaciones [departamento]» y «licitaciones de construcción colombia») | `seo/ronda-2-abiertos` |
| _(al subir el snapshot)_ | Páginas por entidad: tanda 1 de 400 | `seo/ronda-2-programatico` + `SNAPSHOT_URL` |
| _(al pegar los valores de PRD)_ | Datos propios `cr-plazo-obra` y `secop-share-secop-i` visibles en sus guías; ese día, `dateModified` | `seo/ronda-2-contenido` |

## Línea base de la ronda 3 (Search Console, 1 al 28 de oct de 2026)

150 clics · 10,2 mil impresiones · CTR 1,5 % · posición media 6,4. El 16 de
octubre eran 80 clics. **Se mide contra esta tabla**, 28 días después de cada
despliegue y sin juzgar un title antes de 2 a 4 semanas.

| Página | Clics | Impr. | CTR | Pos. |
|---|---:|---:|---:|---:|
| /guias/minima-cuantia/ | 43 | 5.070 | 0,8 % | 6,0 |
| / (home, casi todo búsquedas de marca) | 43 | 126 | 34,1 % | 3,6 |
| /guias/poliza-de-seriedad-de-la-oferta/ | 12 | 743 | 1,6 % | 5,8 |
| /guias/secop-i-vs-secop-ii/ | 6 | 599 | 1,0 % | 8,3 |
| /herramientas/calculadora-capacidad-residual/ | 6 | 146 | 4,1 % | 7,1 |
| /sectores/salud/ | 5 | 40 | 12,5 % | 4,2 |
| /guias/capacidad-residual/ (Google avisa −89 % de impresiones) | 4 | 548 | 0,7 % | 6,2 |
| /guias/seleccion-abreviada/ | 4 | 471 | 0,8 % | 7,1 |
| /guias/como-calcular-la-oferta-economica/ | 3 | 194 | 1,5 % | 5,9 |
| /guias/mejores-apps-licitaciones-colombia/ | 3 | 172 | 1,7 % | 7,2 |
| /guias/requisitos-habilitantes/ | 2 | 333 | 0,6 % | 5,8 |
| /guias/que-es-el-rup/ | 0 | 306 | 0 % | 7,5 |
| /guias/consorcios-y-uniones-temporales/ | 1 | 253 | 0,4 % | 7,2 |
| /licitaciones-colombia/ | 1 | 225 | 0,4 % | 9,5 |
| /producto/* + /precios + /funcionalidades | 2 en total | ~145 | — | 4,7–22 |

**Búsquedas de mínima cuantía** (posición 7 a 8,6): «minima cuantia 2026» 727
impr. · «valor minima cuantia 2026» 207 · «cuanto es la minima cuantia en colombia
2026» 87 · «mínima cuantía 2026» 68 · «minima cuantia en colombia 2026» 61 · «valor
de la minima cuantia 2026» 53 · «en cuanto esta la minima cuantia 2026» 47 · «valor
minima cuantia 2026 municipios de sexta categoria» 22.

**Otras:** «que es el rup» (pos. 9), «capacidad residual» (11,6), «k residual»
(9,6), «licitaciones colombia» (42), «software de licitaciones» (47).

**Indexación:** 43 indexadas y 22 sin indexar: 13 con redirección, 3 con 404, 4
con noindex, 1 bloqueada por robots.txt y 1 rastreada sin indexar.
