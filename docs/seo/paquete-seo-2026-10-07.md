# Paquete SEO, indexación y rendimiento — 7 de octubre de 2026

Origen: hallazgos de Search Console, Bing Webmaster Tools y Cloudflare. Primero
el diagnóstico (medido contra el código y contra el sitio publicado), después lo
de bajo riesgo aplicado en ramas **sin fusionar y sin subir**. Producción no se
tocó: lo único que se hizo contra contradar.com.co fueron lecturas (`curl`) y un
`npm run indexnow -- --seco`, que lee el sitemap y no envía nada.

Despliegue: `despliegue-web.md`.

## Tabla de hallazgos

| # | Problema | Lo que había (medido el 7-oct) | Impacto | Arreglo | Esfuerzo | Estado |
|---|---|---|---|---|---|---|
| 1 | Barra final en sitemap, canonical y enlaces | **Ya estaba resuelto** desde el 2-oct (`trailingSlash: "always"`). Build de 43 páginas: 0 enlaces internos sin barra, 0 a `http://contradar…`, 0 canonical sin barra. La versión sin barra responde **308** a la de barra | Ninguno hoy | Nada | — | Verificado |
| 2a | Datos estructurados de la home | Ya publica `Organization`, `WebSite`, `SoftwareApplication` con **3 Offer en COP** (Alerta/Ventaja/Dominio, 9 `UnitPriceSpecification` mes/semestre/año) y `FAQPage`. Bing cuenta «2 tipos» porque su informe agrupa por los tipos que usa para resultados enriquecidos, no por los que hay | Bajo | Nada en la home | — | Verificado |
| 2b | `Organization.name` = «ContRadar» | Hoy es **eulertech** con `Brand` ContRadar, por **decisión tuya del 2-oct** (commit `f399215`: «eulertech como publisher»). Pedirlo ahora contradice esa decisión | Medio: decide qué nombre ve Google como editor de las guías | `alternateName: "ContRadar"` y eulertech sigue de `name` (decisión del 8-oct) | 5 min | **Aplicado** |
| 2c | `sameAs` con Instagram | Solo LinkedIn. **No hay URL de Instagram en ningún repo** y el código dice «SOLO perfiles que existan» | Bajo | No hay cuenta de Instagram (John, 8-oct): `sameAs` queda solo con LinkedIn | — | Cerrado |
| 2d | `BreadcrumbList` en todas | Faltaba en `/terminos/` y `/politica-de-datos/`. La home no lleva a propósito (una miga de un elemento no aporta) | Bajo | `LegalLayout` pasa sus migas | 5 min | **Aplicado** |
| 2e | `Article` en las guías | **Ya estaba**: `GuideLayout` (14 guías), `SectorLayout`, `AlternativaLayout` y el pilar, con autor y publisher por `@id` | — | Nada | — | Verificado |
| 3 | `/guias/minima-cuantia/` (pos. ~9 en «mínima cuantía 2026») | La **tabla de topes 2026, la FAQ y el CTA al diagnóstico ya existían**. Faltaba «Mínima cuantía 2026» al inicio del title y de la description | Medio: el title es lo que decide el clic en la posición 9 | Title «Mínima cuantía 2026: topes por entidad, plazos y cómo se gana»; description empieza igual y da el rango ($49 a $175 M). Cifras para verificar: abajo | 10 min | **Aplicado** |
| 4 | `/guias/capacidad-residual/` | Title «Capacidad residual (K): cómo se calcula…»; sin CTA al K de Dominio | Medio | Title «Cómo calcular la capacidad residual (K) paso a paso, con ejemplo», H1 «Cómo calcular la capacidad residual (K de contratación)», bloque «Plan Dominio · Tu K calculado y al día» → `/precios/` | 20 min | **Aplicado** |
| 5 | Los 2 URLs con 404 en Search Console | No tengo acceso a Search Console. El build no tiene enlaces internos rotos, así que vienen de fuera o del pasado. Probadas en vivo: **`/sitemap.xml` → 404** (la ruta que Bing y otros piden por defecto) y **`/favicon.png` → 404** (borrado el 27-jul) | Bajo | 301 de las dos en `public/_redirects`, además de la de `/guias/apps-para-licitaciones-colombia/` que ya existía | 5 min | **Aplicado** |
| 6 | `lastmod` real por página | **Ya estaba** desde el 2-oct: `scripts/lastmod.mjs` toma la fecha del último commit de la página y de lo que importa (sin el marco común), y trae la historia completa en el clon superficial de Pages. 40/40 URL con lastmod | — | Nada | — | Verificado |
| 7 | IndexNow automático | `scripts/indexnow.sh` mandaba «lo que tenga lastmod de hoy»: si desplegabas al día siguiente del commit, no mandaba nada; si desplegabas dos veces el mismo día, repetía | Medio | **`npm run indexnow`** (`scripts/indexnow.mjs`): compara el sitemap publicado con el último envío aceptado, solo HTML, verifica la clave antes de enviar, registra cuántas y la respuesta. Va después de la purga. Probado en seco contra producción: clave OK, 40 URL leídas | 1 h | **Aplicado** |
| 8 | Submission API de Bing / Indexing API de Google | No se usa ninguna (comprobado en el repo) | — | Nada; anotado en el runbook | — | Verificado |
| 9 | `/api/v1/notifications`: 25.000/mes | `NotificationBell` cada **25 s**, también con la pestaña oculta. 25.000 llamadas ≈ 174 h de pestañas abiertas al mes | Medio: carga del VPS y ruido en los 4xx (ver E13) | **90 s**, pausa con `visibilityState === "hidden"`, consulta inmediata al volver | 30 min | **Aplicado** (app) |
| 10 | `/api/v1/admin/borrado-permiso`: 1.260/mes | **Quién:** `InterruptorBorrado` (panel de superadmin, pestañas Empresas y Pruebas; solo tú). **Por qué:** preguntaba cada 30 s para enterarse del vencimiento de 30 min, **aunque estuviera apagado** y con la pestaña oculta. 1.260 × 30 s ≈ 10,5 h de panel abierto al mes | Bajo | Sin sondeo: una consulta al abrir, un temporizador exacto al vencer (la hora ya la da `hasta`) y una al volver a la pestaña. De 1.260 a < 100 | 20 min | **Aplicado** (app) |
| 11 | Atribución de pruebas | La web pasaba un `ref` (último toque, 30 min) y `altas_prueba` guardaba solo `utm` (el botón). No había primer contacto, ni utm_*, ni página de entrada | Alto: hoy no se sabe qué canal trae pruebas | Cookie de primera parte `cr_atrib` (.contradar.com.co, 90 días, no se pisa) en la web **y** en la app (/diagnostico, /prueba); viaja con el alta; columna `altas_prueba.atribucion` (JSONB, migración `c7f2e1a12286`); columna **Origen** en Pruebas (Google, Google Ads, Correo, WhatsApp, LinkedIn, IA, Directo o el dominio) | 3 h | **Aplicado**; texto de la política aprobado el 8-oct |
| 12 | Cache Everything | HTML sale `cf-cache-status: DYNAMIC`, TTFB **0,33 s**; un archivo en caché de borde, **0,25 s** | Bajo-medio: ~75 ms menos de TTFB en el HTML | — | — | **Descartado** (John, 13-oct): la web está en Cloudflare Pages y no necesita regla de caché; la purga del runbook pasa a opcional |
| 13 | 36.000 respuestas 4xx al mes | Sin acceso a la API de Cloudflare | Desconocido hasta separar por host | Guía E13 | 20 min | Guía |
| 14 | Rastreadores de IA | `robots.txt` permite todo y Cloudflare no le está añadiendo bloqueos (el publicado es solo el nuestro) | Medio: visibilidad en ChatGPT/Perplexity/Claude | Guía E14 | 10 min | Guía |
| 15 | Proteger `analitica.contradar.com.co` | Responde 200 sin barrera (solo el login de Umami). **Ojo:** el tracker `/script.js` y `/api/send` los cargan la web y la app; si Access tapa todo el host, **la analítica deja de medir sin avisar** | Medio | Guía E15, con excepción para esas dos rutas | 15 min | Guía |

### Encontrado de paso

- `colSpan={11}` en la fila vacía de Pruebas cuando la tabla ya tenía 12
  columnas (13 con Origen): corregido a 13.
- `DATA_POLICY_VERSION` sigue en `"2026-07-21"` (backend, `routers/public.py`)
  aunque la política cambió el 6-oct y cambiaría hoy. No lo toqué: es la
  versión que queda como prueba del consentimiento de cada alta y decidir si
  sube es tuyo.
- El contenedor `contradar-backend` de dev está `unhealthy` (su comprobación de
  salud se queda sin respuesta). No es de este paquete; lo dejo anotado.

## 13-oct: estado del paquete y tres puntos nuevos (Search Console)

Revisado contra `main` de los dos repos y contra el sitio publicado
(`curl`, solo lectura). Del 1 al 11 **todo está en producción**: la web desde
el 8-oct (`ff46edc`, `7f8c093`), la app desde el 13-oct (`769a37a`, migración
`c7f2e1a12286`). Del 12 al 15 la guía está escrita, pero en Cloudflare **no se
ha aplicado nada**: `/precios/` sale `cf-cache-status: DYNAMIC` dos veces
seguidas y `analitica.contradar.com.co` responde 200 sin Access. El 13 y el 14
no se pueden comprobar sin acceso al dashboard.

| # | Problema | Lo que había (13-oct) | Arreglo | Estado |
|---|---|---|---|---|
| 16 | Google rastrea `/api/contact`, `/api/brief` y `/cdn-cgi/l/email-protection` y le dan 404 | `robots.txt` solo traía `Allow: /` y la línea Sitemap. `/api/*` son las Pages Functions del formulario (solo POST: un GET da 404). `/cdn-cgi/l/email-protection` lo genera la **ofuscación de correos de Cloudflare**, que reescribe los `mailto:` del HTML | `Disallow: /api/` y `Disallow: /cdn-cgi/`; el Sitemap sigue declarado. Esos 404 no penalizan a nadie: es ruido en el informe y rastreo gastado | **Aplicado** (rama `seo/gsc-13oct`) |
| 17 | `/guias/minima-cuantia/` sube +3.591 % en impresiones | Title, description, tabla de topes 2026, FAQ y CTA al diagnóstico **ya estaban publicados** desde el 8-oct (punto 3; el SMMLV lo verificaste ese día). Lo que faltaba eran enlaces: **la home no la enlazaba** y 8 de las 13 guías tampoco | Enlace «Mínima cuantía 2026» en el pie (columna Recursos): sale en las 43 páginas, home incluida. Enlace en el texto, en la primera mención de «mínima cuantía», en 5 guías (buscar en SECOP, oferta económica, cómo ganar, RUP, habilitantes) y en «Sigue leyendo» de 3 (capacidad residual, mejores apps, PAA) | **Aplicado** (rama `seo/gsc-13oct`) |
| 18 | `app.contradar.com.co/diagnostico?utm_source=web&utm_medium=nav&utm_campaign=menu` en «Rastreada: actualmente sin indexar» | Es la **herramienta** dentro de la app, no una página de contenido: el HTML es el armazón del SPA (6,5 kB, title «ContRadar — Ingresar») con `noindex, follow` desde el 13-jul (`881afb3`). Llega a Google porque el menú de la web enlaza ahí, con UTM, desde las 43 páginas | No darle contenido ni indexarla; ya está fusionada con `contradar.com.co/diagnostico/`. Propuesta abajo | **Propuesto**, sin aplicar: lo decides tú |

### 18 en detalle: el diagnóstico de la app

**Qué pasa ahora.** La URL que marca Search Console es la herramienta del
diagnóstico dentro de la app. La versión con contenido ya existe y es la
indexable: `contradar.com.co/diagnostico/` (seo/fase-4), con canonical propio,
`index, follow`, FAQ y migas. La de la app lleva `noindex` a propósito, así que
**no indexarla es el resultado correcto**: darle contenido propio la pondría a
competir con la de la web por «diagnóstico de licitaciones gratis».

Lo raro es la etiqueta: una página con `noindex` suele salir como «Excluida
por la etiqueta noindex», no como «Rastreada: actualmente sin indexar». En
**Inspección de URL → Cobertura**, mira «¿Se permite la indexación?». Si dice
«No: se ha detectado "noindex"», el informe solo está agrupando distinto y no
hay nada que hacer. Si dice «Sí», Google no está viendo la etiqueta y eso sí
habría que perseguirlo (una cabecera `X-Robots-Tag: noindex` en el nginx de la
app lo resolvería sin depender del HTML).

**Lo que sí está mal: el menú.** El enlace «Diagnóstico» del menú, que aparece
en las 43 páginas y es el enlace interno más fuerte del sitio, apunta a la
**app**, que tiene noindex, y no a la página indexable. La de la web solo la
enlazan el pie y algunas guías. Además, cada botón lleva UTM distintas
(`nav/menu`, `home/hero`, `guia/<slug>`…), y cada combinación es una URL más
que Google rastrea y descarta.

**Propuesta, de menor a mayor cambio:**

1. **Menú → `/diagnostico/` de la web** (2 líneas en `Nav.astro`). El enlace
   fuerte pasa a la página que puede posicionar. El precio: un clic más para
   quien entra por el menú, porque la landing tiene su propio formulario de
   NIT, que manda a la app. El hero y los CTA de las guías se quedan como
   están. Antes de decidir conviene mirar en Umami cuántas visitas al
   diagnóstico llegan por el menú (`utm_medium=nav`).
2. **Sin UTM en los enlaces internos web → app.** Google desaconseja UTM en
   enlaces internos. El botón concreto se puede pasar en el fragmento
   (`/diagnostico#o=nav-menu`), que Google ignora, y la cookie `cr_atrib` ya
   guarda el primer contacto. Hay que tocar `frontend/src/lib/atribucion.ts`
   para que lea el fragmento: dos repos y un cambio de medición, por eso no
   está aplicado.
3. **De paso:** `app.contradar.com.co/sitemap.xml` responde 200 con el HTML del
   SPA (el mismo fallo que tenía `robots.txt` antes del 2-oct). Una
   `location = /sitemap.xml { return 404; }` en el nginx de la app lo cierra.
   Es ruido, no un problema.

**Por qué el pie y no la FAQ de la portada.** Lo obvio era una quinta pregunta
en la FAQ de la home, que admite un enlace. No la añadí: esas cuatro preguntas
son decisión tuya del 24-sep («resuelven objeciones de compra») y una de
contenido rompería ese criterio. El pie pone el enlace en la home y además en
todo el sitio. Si prefieres un enlace dentro del cuerpo de la portada, la
pregunta está redactada: «¿Sirve para procesos de mínima cuantía?».

**Consorcios** es la única guía que sigue sin enlazarla en el cuerpo: no
menciona la mínima cuantía y su «Sigue leyendo» ya trae cuatro. Le llega por
el pie.

**Medido en el build (43 páginas):** las 43 enlazan
`/guias/minima-cuantia/`, ningún enlace sin barra final y `robots.txt` con las
dos líneas `Disallow` y el `Sitemap`.

**Para acabar con la causa del `/cdn-cgi/` (decisión tuya, no aplicada):**
Cloudflare → **Scrape Shield → Email Address Obfuscation** → apagado. El
`robots.txt` ya frena a Google; apagarlo además quita el enlace del HTML. El
precio: los correos de la web quedan a la vista de los raspadores de spam.

## Decisiones (respondidas por John el 8-oct-2026)

1. **Texto de la cookie en la política**: aprobado.
2. **`Organization.name`**: se queda eulertech, con `alternateName: "ContRadar"`.
3. **Instagram**: no hay cuenta; `sameAs` solo con LinkedIn.
4. **404 de Search Console**: uno es la guía renombrada, que ya tenía 301; se
   añadieron `/sitemap.xml` y `/favicon.png`.
5. **SMMLV 2026 ($1.750.905)**: correcto; las cifras de abajo quedan verificadas.

## Cifras de mínima cuantía para verificar

Todas salen del SMMLV 2026 de **$1.750.905** (Decreto 1469 de 2025; el
Decreto 159 de 2026, transitorio, fijó el mismo valor). La aritmética la
comprobé y cuadra; **lo que tienes que verificar es el SMMLV y su vigencia**
(la página cita la suspensión del Decreto 1469 y un decreto transitorio: si
hubo un fallo posterior, el valor podría haber cambiado).

| Presupuesto de la entidad | Menor cuantía | Mínima cuantía (10 %) | ☐ |
|---|---|---|---|
| ≥ 1.200.000 SMMLV | 1.000 × SMMLV = $1.750.905.000 | $175.090.500 | ☐ |
| 850.000 a < 1.200.000 | 850 × = $1.488.269.250 | $148.826.925 | ☐ |
| 400.000 a < 850.000 | 650 × = $1.138.088.250 | $113.808.825 | ☐ |
| 120.000 a < 400.000 | 450 × = $787.907.250 | $78.790.725 | ☐ |
| < 120.000 | 280 × = $490.253.400 | $49.025.340 | ☐ |
| Umbral del ejemplo: 120.000 × SMMLV | $210.108.600.000 | — | ☐ |

También en la FAQ («de $49.025.340 … a $175.090.500») y en la description
nueva («de $49 a $175 millones»). Si el SMMLV cambia, son 13 cifras en
`src/pages/guias/minima-cuantia.astro`.

---

## E. Cloudflare, paso a paso

Los nombres de menú son los del dashboard en octubre de 2026; si alguno cambió
de sitio, el buscador de arriba del dashboard lo encuentra por nombre.

### E12. Regla de caché «Cache Everything» para la web

> **Descartado por John el 13-oct-2026.** Se conserva como referencia por si
> algún día se activa; si se activa, la purga del runbook vuelve a ser obligatoria.

**Diagnóstico.** Hoy el HTML de contradar.com.co sale de Pages con
`cache-control: public, max-age=0, must-revalidate` y `cf-cache-status: DYNAMIC`:
cada visita va al almacén de Pages. TTFB medido desde Colombia: **0,33 s** el
HTML, **0,25 s** un archivo que ya está en el borde (`/fonts/caras.css`, HIT).
**Después:** ~75 ms menos en la primera respuesta de cada página. **El precio:**
lo publicado puede quedarse viejo hasta 4 h si no se purga; por eso la purga
entra en el runbook antes de IndexNow.

1. Dashboard → zona **contradar.com.co** → **Caching** → **Cache Rules** →
   **Create rule**.
2. Nombre: `Web: HTML en el borde 4 h`.
3. **Custom filter expression** → **Edit expression** y pega:

   ```
   (http.host eq "contradar.com.co" and not starts_with(http.request.uri.path, "/api/"))
   ```

   - `http.host eq "contradar.com.co"` deja fuera `app.`, `analitica.` y
     cualquier otro subdominio.
   - `/api/` son las Pages Functions de la web (`/api/contact`, `/api/brief`):
     nunca en caché.
4. **Cache eligibility**: *Eligible for cache*.
5. **Edge TTL**: *Ignore cache-control header and use this TTL* → **4 hours**.
   - En **Status code TTL** añade `404` → **1 minute** y `500-599` → *No cache*
     (un 404 de una página recién creada no debe quedarse 4 h).
6. **Browser TTL**: *Respect origin* (el navegador sigue revalidando el HTML;
   lo que cambia es que el borde responde sin ir a Pages).
7. **Deploy**.

**Comprobar** (en tu PC):

```bash
for i in 1 2; do curl -sI https://contradar.com.co/precios/ | grep -iE 'cf-cache-status|age'; done
# 1.ª: MISS · 2.ª: HIT con age > 0
curl -sI https://contradar.com.co/api/contact | grep -i cf-cache-status   # DYNAMIC (nunca HIT)
curl -sI https://app.contradar.com.co/ | grep -i cf-cache-status           # sin cambios respecto a hoy
for i in 1 2 3; do curl -so /dev/null -w "ttfb %{time_starttransfer}s\n" https://contradar.com.co/; done
```

**Purga en cada despliegue** — paso 3 de `despliegue-web.md`: **Caching →
Configuration → Purge Cache → Custom Purge → Hostname `contradar.com.co`** (o
*Purge Everything*). Si algún día conectas un token de API, ese paso se puede
volver un `npm run purgar`; hoy es manual.

Si algo sale mal: desactiva la regla (interruptor en la lista de Cache Rules) y
el sitio vuelve a como está hoy en segundos.

### E13. Las 36.000 respuestas 4xx al mes

**Primero separar por host**, porque la zona sirve tres sitios y cada uno se
arregla distinto.

1. Dashboard → zona → **Analytics & Logs** → **HTTP Traffic**.
2. Rango: **Last 30 days**.
3. **Add filter** → *Edge status code* → *is between* → `400` y `499`.
4. Mira los desgloses **Hosts**, **Paths** y **Status codes** (las tarjetas de
   «Top N» debajo de la gráfica). Haz clic en un host para filtrar por él y
   vuelve a mirar **Paths**.
5. Para lo que bloquea Cloudflare (403 de reglas o de bots): **Security** →
   **Analytics** (o **Security → Events**) → mismo rango.

**Qué hacer según lo que salga:**

| Lo que ves | Qué es | Qué hacer |
|---|---|---|
| `401` en `app.contradar.com.co/api/v1/…` | Sesiones vencidas con la pestaña abierta: el polling sigue preguntando sin sesión | Esperado; baja solo con el cambio a 90 s y la pausa (#9). Si sigue alto, que el frontend pare el polling al primer 401 |
| `404` en `/wp-login.php`, `/xmlrpc.php`, `/.env`, `/wp-admin/…`, `/.git/…` | Escáneres automáticos buscando WordPress o secretos | Inofensivo. Si molesta en las cifras: **Security → WAF → Custom rules** → *Block* con `(http.request.uri.path contains "/wp-" or http.request.uri.path contains "/.env" or http.request.uri.path contains "/.git" or http.request.uri.path eq "/xmlrpc.php")` |
| `404` en URLs que existieron (`/guias/…`, imágenes viejas) | Enlaces externos o caché de buscadores | Una 301 por URL en `public/_redirects`, directa al destino final |
| `404` en `/sitemap.xml`, `/favicon.png` | Rutas por defecto de rastreadores | Ya tienen 301 en esta rama |
| `403` desde *Security Events* | Desafíos de Bot Fight o reglas WAF | Revisa que no haya bots verificados (Googlebot, Bingbot) entre los bloqueados |
| `429` en `app.contradar.com.co` | El `limit_req` de nginx | Esperado; si un usuario real lo dispara, revisar el límite |
| `4xx` en `analitica.contradar.com.co` | Rastreadores o bloqueadores | Ignorar salvo que `/api/send` dé 4xx a usuarios reales |

### E14. AI Crawl Control: permitir la búsqueda de IA

**Diagnóstico.** `https://contradar.com.co/robots.txt` publicado es solo el
nuestro (`Allow: /`): Cloudflare no le añade bloqueos de IA hoy. Lo que falta
es comprobar que ninguna regla de bots los frene en el borde.

1. Dashboard → zona → **AI Crawl Control** (antes «AI Audit»).
2. Pestaña **Crawlers**: pon en **Allow** como mínimo:
   - `OAI-SearchBot` y `ChatGPT-User` (OpenAI)
   - `PerplexityBot` y `Perplexity-User`
   - `Claude-SearchBot` y `Claude-User` (Anthropic)
   - (si aparecen) `Applebot`, `DuckAssistBot`, `MistralAI-User`
3. Los de **entrenamiento** (`GPTBot`, `ClaudeBot`, `Google-Extended`, `CCBot`,
   `Bytespider`…) no los pediste: déjalos como están y decide aparte. Dejar
   entrar a los de búsqueda no obliga a dejar entrar a los de entrenamiento.
4. **Security** → **Bots**:
   - **AI Labyrinth**: **apagado**.
   - **Block AI bots**: **apagado** (si está encendido, tapa también a los de
     búsqueda).
   - **Manage your robots.txt** / *Instruct AI bot traffic with robots.txt*:
     apagado (si lo enciendes, Cloudflare antepone reglas al nuestro).
5. Comprobar en una semana en **AI Crawl Control → Metrics**: deben aparecer
   peticiones de `OAI-SearchBot`/`PerplexityBot` con respuesta 200.

### E15. Cloudflare Access para `analitica.contradar.com.co`

**Diagnóstico.** El panel de Umami responde a cualquiera (lo protege solo su
login). Pero ese host también sirve el **tracker** (`/script.js`, lo carga la
web en cada página) y la **recogida de eventos** (`/api/send`, la llama el
navegador de cada visitante). **Si Access tapa el host entero, la analítica deja
de medir** —el navegador recibe una redirección al login en vez del script— y
no da ningún error visible. Por eso van tres aplicaciones: una que protege todo
y dos que dejan pasar esas rutas (Access aplica la de ruta más específica).

1. Dashboard → **Zero Trust** → **Access** → **Applications** → **Add an
   application** → **Self-hosted**.
2. **Aplicación 1 — el panel**
   - Nombre: `Umami (panel)`.
   - Dominio: `analitica.contradar.com.co`, ruta vacía.
   - Duración de sesión: 24 h.
   - Política: nombre `Solo John`, acción **Allow**, regla **Include → Emails →**
     tu correo.
   - Método de acceso: **One-time PIN** (te llega un código a ese correo).
3. **Aplicación 2 — el tracker (público)**
   - Nombre: `Umami (tracker, público)`.
   - Dominio: `analitica.contradar.com.co`, ruta `script.js`.
   - Política: nombre `Público`, acción **Bypass**, **Include → Everyone**.
4. **Aplicación 3 — la recogida (pública)**
   - Igual que la 2, con ruta `api/send`.
5. **Comprobar** (en tu PC, en este orden):

   ```bash
   curl -sI https://analitica.contradar.com.co/ | grep -iE '^(HTTP|location)'
   # 302 → …cloudflareaccess.com (protegido)
   curl -s -o /dev/null -w '%{http_code}\n' https://analitica.contradar.com.co/script.js
   # 200 (público)
   curl -s -o /dev/null -w '%{http_code}\n' -X POST https://analitica.contradar.com.co/api/send \
     -H 'Content-Type: application/json' -H 'User-Agent: Mozilla/5.0' \
     -d '{"type":"event","payload":{"website":"fe5dc4bf-9890-4105-b5d1-f06b641a18e5","hostname":"contradar.com.co","url":"/prueba-access","language":"es"}}'
   # 200 (público; no debe ser 302 ni 403)
   ```

   Y la prueba de verdad: abre https://contradar.com.co en incógnito y mira en
   el panel de Umami → **Realtime** que aparezca la visita.
6. Si algo falla: en **Applications**, desactiva la aplicación 1 y todo vuelve
   a como está hoy.
