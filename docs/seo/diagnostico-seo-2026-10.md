# Diagnóstico SEO — octubre de 2026

Rama: `seo/fase-1-tecnico`. Fecha: 2026-10-02. La fase 0 completa (inventario
de enlaces internos, revisión de competidores) quedó pendiente porque se
arrancó directo en la fase 1; aquí está lo que la fase 1 necesitaba verificar.

## 1. Stack y despliegue

| Tema | Estado real |
|---|---|
| Framework | Astro 5.18.2 estático, Tailwind 4 como plugin de Vite |
| Integraciones | `@astrojs/sitemap` 3.7.3 (sin otras) |
| `<head>` | `src/layouts/Base.astro`; las guías pasan por `GuideLayout`, los módulos por `ProductoLayout`, lo legal por `LegalLayout` |
| Despliegue | Cloudflare Pages (git → `npm run build` → `dist/`); Pages Functions en `functions/api/` (contact, brief) |
| robots.txt | Archivo estático `public/robots.txt`: `Allow: /` y `Sitemap: …/sitemap-index.xml` |
| Barras finales | Pages publica `/<ruta>/index.html` y redirige con 308 la URL sin barra. Desde esta fase `trailingSlash: "always"` en Astro |
| 404 | `src/pages/404.astro` → `dist/404.html`; Pages responde 404 real (sin el archivo serían soft 404) |
| Analítica | Cloudflare Web Analytics (sin cookies, sin banner) detrás de `PUBLIC_CF_BEACON`. Sin eventos propios |
| Fuentes | Manrope + IBM Plex Mono autoalojadas; las caras latinas van en base64 dentro de `/fonts/caras.css` (render-blocking, 172 KB sin comprimir, ~70 KB brotli). Decisión de ago-2026 para eliminar el salto de fuente |

## 2. Auditoría de veracidad

Verificado contra `~/eulertech/contradar` (develop) el 2-oct-2026.

| Afirmación | Dónde | Origen | ¿Correcta? |
|---|---|---|---|
| «desde 2012» (competencia, mercado, buscador) | home, precios, producto | `ANIO_INICIO_HISTORICO = 2012` (backend/app/constantes.py:14), decisión del 26-ago-2026 que sustituye a 2023; `_ganadas_calc` usa `VENTANA_CANONICA` = 2012 (ganadas.py:426) | **Sí.** La auditoría externa estaba desactualizada |
| «medidos sobre el histórico completo del SECOP» (estadística de la licitación) | meta de /producto/estadistica-de-la-licitacion | Cada bloque tiene su ventana: precio y competidores 2012+, **días de pago 2020-2026**, **adiciones 2018-2024**, PAA 2025+ (backend/estudios/intel/) | **No del todo.** Meta reescrita sin esa frase. Revisar el cuerpo de esa página (pendiente) |
| 20 M de procesos | home, precios | 20,1 M filas `historical_processes`, `year >= 2012` | Sí |
| 11 M de contratos | home | 11.120.698 el 28-ago-2026 | Sí |
| **2,3 M empresas** | banda de cifras de la home | Era el distinct sobre contratos; la app publica `provider_totals` = 2.481.900 | **No → corregido a 2,5 M** (el resto de la web ya decía 2,5 M) |
| 13.145 entidades | home | filas `analytics.entity_stats`, 27-ago-2026 | Sí (la cifra viva puede variar) |
| 658 M registros de 81 fuentes | ExpedienteSection | 658.875.883 filas en 81 datasets, 30-ago-2026 | Sí |
| «más de 1,3 M procesos nuevos en 2026» | — | No está en la web hoy; sería el valor vivo `procesos_year` | No aplica |
| 859.786 proveedores solo en SECOP I | FAQ, CompetenciaShowcase | medido el 26-ago-2026 al diagnosticar un bug de ranking | Sí; se publica con su fecha («medido en agosto de 2026») |
| 7.378 vs 2.789 «alcantarilla» | /producto/busquedas, SectorFoto | Medición manual de John (jul-2026, procesos abiertos); la consulta no quedó guardada | Sí, según John (2-oct). Guardar la consulta al actualizarla |
| Precios Alerta / Ventaja / Dominio | precios, home, JSON-LD | tabla `plans`: mes a mes 190.000 / 550.000 / 990.000; anual 1.824.000 / 5.280.000 / 9.504.000 (= 152.000 / 440.000 / 792.000 al mes) | Sí. **El JSON-LD no estaba mal en la cifra: mezclaba el mínimo anual con el máximo mensual.** Ahora un Offer por plan con los tres periodos |
| «Alerta diaria · las 5 mejores» (Alerta) | precios, home | El tope del correo es `max_results_delivery` (scheduler.py:792): semilla Alerta 5 · Ventaja 10 · Dominio sin tope. `max_results_day` (10) no lo usa el envío | Coincide con la semilla. **Confirmar en prod: `select key, max_results_delivery from plans;`** |
| Prueba: 7 días, 10 análisis, 3 búsquedas, Ventaja | todo el sitio | `DIAS_PRUEBA = 7`, `ANALYSIS_QUOTA_TRIAL = 10`, trial `max_searches = 3` | Sí |
| «Activamos tu cuenta» (FAQ ¿Cómo empiezo?) | /ayuda | Alta inmediata desde el 24-sep/1-oct (`POST /public/prueba/crear`) | **No → reescrita** |
| Términos §3 «No existe registro automático» | /terminos | ídem | **No → reescrita, pendiente de aprobación** |
| Términos §2 «plataforma de seguimiento y alertas» | /terminos | posicionamiento viejo | Reescrita, pendiente de aprobación |

Todas las cifras de planes, prueba y base viven ahora en `src/data/producto.ts`.

## 3. Cobertura validada (para las fases 2 y 3)

- Puertas G2-G5 (lo **ganado**) verdes en desarrollo; el runbook advierte que eso no vale para prod.
- **G6 (procesos ofertados) no está validada**: la única medición, en un NIT, dio 46 % de ofertados en el espejo. No se publica ninguna métrica basada en oferentes/perdidas hasta que esté verde.

## 4. App (app.contradar.com.co)

- `/robots.txt` **no existe**: nginx devuelve el `index.html` del SPA (200, HTML).
- `index.html` lleva `noindex, follow` global: login, privadas **y /diagnostico** quedan fuera del índice. Correcto para lo privado; la landing pública del diagnóstico se hará en la web (fase 4).
- Diagnóstico: `GET /api/v1/public/diagnostico/{nit}`, sin autenticación, con cupos por IP y Turnstile; datos locales 2012→hoy.

## 5. Rendimiento (Lighthouse 12.8, `astro preview` local, sin compresión)

| Página | Antes móvil | Después móvil | Antes escritorio | Después escritorio |
|---|---|---|---|---|
| / | 90 · LCP 3,3 s · CLS 0 | 92 · LCP 3,1 s · CLS 0 | 99 · LCP 0,8 s | 100 · LCP 0,7 s |
| /precios/ | 96 · LCP 2,4 s | 95 · LCP 2,5 s | 100 · 0,6 s | 100 · 0,6 s |
| /producto/analisis-de-competencia/ | 96 · LCP 2,5 s | 95 · LCP 2,6 s | 100 · 0,7 s | 100 · 0,6 s |
| /guias/que-es-el-paa/ | 97 · LCP 2,3 s | 96 · LCP 2,5 s | 100 · 0,6 s | 100 · 0,5 s |

SEO 100 y TBT 0 ms en todas, antes y después. Las variaciones de ±0,1-0,2 s
en las páginas internas son ruido entre corridas (no cambió nada de su carga).

- **Elemento LCP del hero**: en móvil y escritorio es **texto** (el párrafo
  bajo el H1), no la foto. Por eso no se precarga la foto: le robaría ancho de
  banda al texto. `Base.astro` acepta `precargarImagen` para cuando el LCP
  sea una imagen.
- El 86 % del LCP móvil era *render delay*: el bloque de texto tenía
  `data-reveal` (opacidad 0 hasta que corre el JS). Quitado.
- Lo que queda: `caras.css` render-blocking. Medido en local sin compresión;
  en producción va con brotli. Medir con PageSpeed tras desplegar antes de
  tocar la estrategia de fuentes.
- Peso de imágenes de la home: 144 KB móvil, 402 KB escritorio. Fuentes: 0 KB
  como «font» porque viajan dentro de `caras.css`.

## 6. Fuentes y tokens

`tokens.css` (generado) declara `--font-body: 'Archivo'`; `global.css:43-44`
lo sobrescribe con Manrope, que es lo que se renderiza. Además
`contradar-loaders.css:135` usa `font-variation-settings: 'wdth' 108`, resto de
Archivo que en Manrope no hace nada. **Propuesta**: cambiar `--font-display`
y `--font-body` a Manrope en `~/eulertech/contradar-design/tokens.css` (la
fuente), propagar con `sync-tokens.sh` y quitar el override de `global.css` y
el `wdth` del loader. No se editó nada de esto.

## 7. Actualización de cifras (2-oct-2026, tarde)

Comparadas con `GET /api/v1/public/stats` (el endpoint público que alimenta la
banda en vivo): procesos 19.764.912, contratos 11.129.337, empresas 2.647.147,
entidades 13.129. El respaldo estático decía «20 M» (redondeo hacia arriba) y
«13.145» (por encima del valor real). Ahora `CIFRAS` en `src/data/producto.ts`
copia el endpoint redondeando HACIA ABAJO, igual que la banda en vivo
(19,7 M · 11,1 M · 2,6 M · 13.129), y todo texto fijo del sitio lee de ahí.
