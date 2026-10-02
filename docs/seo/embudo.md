# Embudo y analítica — NIT → diagnóstico → prueba → pago

Revisado: 2026-10-02 (seo/fase-4).

## El embudo

| Paso | Dónde ocurre | Evento | Datos del evento |
|---|---|---|---|
| 1. Llega | cualquier página de la web | página vista (automática) | utm_* de la URL |
| 2. Escribe su NIT | hero, `/diagnostico/`, guías, sectores, pilar | `diagnostico_iniciado` | `origen` (= utm_medium: home, guia, sector, pilar, diagnostico…), `pagina` |
| 3. Ve su diagnóstico | app `/diagnostico` | `diagnostico_completado` | lo emite la APP (ver abajo) |
| 4. Pide la prueba | formulario `#solicitar` de la web | `prueba_solicitada` | `via`: `app` (cuenta creada en el acto) o `respaldo` (la app no respondió) |
| 5. Paga | app, Wompi | (medir en la app) | plan, periodo |

Eventos de apoyo: `whatsapp_click` (cualquier enlace a wa.me), `precio_plan_click`
(`plan`: Alerta · Ventaja · Dominio), `calculadora_k_usada` (primer resultado
completo de la calculadora K).

Todos salen por `src/lib/analitica.ts` → `medir(nombre, datos)`. Un componente
nuevo emite con `window.dispatchEvent(new CustomEvent("cr:evento", { detail: { nombre, datos } }))`.

## UTM de la casa

Todo enlace de la web hacia la app se arma con `diagnosticoUrl(medio, campaña)`
o `conUtm(url, medio, campaña)` de `src/consts.ts`:

- `utm_source=web`
- `utm_medium` = tipo de página: `home`, `nav`, `footer`, `guia`, `producto`, `herramienta`, `sector`, `comparativa`, `pilar`, `diagnostico`
- `utm_campaign` = la página o pieza: el slug de la guía, `hero`, `faq`, `menu`…

Campañas externas (Google Ads, LinkedIn, correos): `utm_source` = la red
(`google`, `linkedin`, `correo`), `utm_medium` = `cpc` / `social` / `email`,
`utm_campaign` = nombre de la campaña en minúsculas con guiones.

## Qué herramienta de analítica

Hoy: **Cloudflare Web Analytics** (páginas vistas, sin cookies). No tiene
eventos personalizados, así que no sirve para el embudo.

| Opción | Cookies / banner | Datos fuera del país | Costo en el VPS de 7 GB | Veredicto |
|---|---|---|---|---|
| **Umami autoalojado** | Sin cookies, no guarda la IP → sin banner | No | Un contenedor Node de ~150-250 MB de RAM y una base `umami` en el Postgres que ya existe (unos MB al mes con este tráfico) | **Recomendado** |
| Plausible CE autoalojado | Sin cookies | No | Necesita ClickHouse: 2 GB de RAM recomendados solo para él | Demasiado para el VPS |
| GA4 | Cookies → banner de consentimiento | Sí (EE. UU.): cláusula de transferencia en la política de datos | 0 en el VPS | Rompe lo que promete `/politica-de-datos/` y suma un banner |

Recomendación: Umami en `analitica.contradar.com.co` (la CSP de `public/_headers`
ya lo permite). Pasos en `docs/seo/runbook-manual.md` → «Analítica». Una vez
arriba, en Cloudflare Pages se definen `PUBLIC_UMAMI_SRC`
(`https://analitica.contradar.com.co/script.js`) y `PUBLIC_UMAMI_ID`.

## `diagnostico_completado` en la app

El diagnóstico se pinta en la app, así que el evento lo emite la app. Rama
`seo/fase-4-conversion` del repo `contradar`: el tracker de Umami se carga con
`VITE_UMAMI_SRC` / `VITE_UMAMI_ID` y `Diagnostico.tsx` llama
`umami.track("diagnostico_completado", { con_historial })` cuando llega la
respuesta. Mismo sitio de Umami para web y app (dominios
`contradar.com.co,app.contradar.com.co`), para ver el embudo de punta a punta.

## Conversiones a marcar (Umami → objetivos; Google Ads → conversiones)

1. `prueba_solicitada` (principal).
2. `diagnostico_completado` (secundaria).
3. `precio_plan_click` con `plan = Dominio` y `whatsapp_click` (intención de venta asistida).
