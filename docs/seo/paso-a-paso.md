# Paso a paso para John

En orden. Marca cada casilla al terminar. Si un paso falla, para y avísame con
lo que viste. El detalle largo de cada tema está en `runbook-manual.md` (te
indico la sección).

---

## Bloque 1 — Revisar y desplegar la app (≈ 30 min)

La rama `seo/app` no trae migraciones. Toca backend (textos del K) y frontend.

- [ ] **1.1 Revisa los cambios.** En tu equipo:
  ```bash
  cd ~/eulertech/contradar
  git diff develop...seo/app --stat
  ```
  Deben salir 22 archivos. El detalle de qué ve el usuario está en
  `web-contradar/docs/seo/informe-final.md` → «Cambios de la app».
- [ ] **1.2 Fusiona en develop** (ojo: tu copia principal está en develop):
  ```bash
  cd ~/eulertech/contradar
  git checkout develop
  git merge --no-ff seo/app -m "Merge seo/app: SEO, Umami, K residual y Términos"
  ```
- [ ] **1.3 Lleva develop a main y súbelo**, como lo haces siempre
  (`docs/operacion/flujo-desarrollo.md`), y `git push`.
- [ ] **1.4 En el VPS** (tu procedimiento de `docs/operacion/despliegue.md`):
  ```bash
  git merge-base --is-ancestor HEAD origin/main && git pull origin main
  docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build web backend
  ```
- [ ] **1.5 Verifica**:
  ```bash
  curl -s https://app.contradar.com.co/robots.txt | head -3
  ```
  Debe decir `# robots.txt de app.contradar.com.co` (texto, no HTML).
  Entra a la app → **Términos**: la sección 3 debe hablar de cuenta de prueba
  activa en el momento. En tu perfil de licitante, el campo dice «Socios y
  profesionales vinculados».

## Bloque 2 — Desplegar la web (≈ 20 min)

- [ ] **2.1 Mírala en local antes** (ya está corriendo): http://localhost:4321
  Revisa la portada, `/precios/`, `/licitaciones-colombia/`,
  `/guias/mejores-apps-licitaciones-colombia/`,
  `/herramientas/calculadora-capacidad-residual/` y `/diagnostico/`.
- [ ] **2.2 Fusiona y sube**:
  ```bash
  cd ~/eulertech/web-contradar
  git checkout main
  git merge --no-ff seo/web -m "Merge seo/web: plan SEO fases 1-4"
  git push origin main
  ```
  Cloudflare Pages construye solo (2-3 min). Míralo en
  dash.cloudflare.com → Workers & Pages → web-contradar → Deployments: el
  último debe quedar en **Success**.
- [ ] **2.3 Prueba de humo de la prueba gratis** (lo más importante: antes no
  funcionaba): abre https://contradar.com.co/#solicitar en una ventana de
  incógnito, pon un correo tuyo que NO tenga cuenta, marca la autorización y
  envía. **Debe entrar directo a la app.** Si en cambio sale «¡Solicitud
  recibida!», avísame.
- [ ] **2.4 Verifica**:
  ```bash
  curl -s https://contradar.com.co/sitemap-index.xml
  curl -s https://contradar.com.co/sitemap-paginas-0.xml | grep -c "<lastmod>"
  curl -sI https://contradar.com.co/guias/apps-para-licitaciones-colombia/ | grep -i "location\|HTTP"
  curl -s https://contradar.com.co/6cd3f559f2eafbb26561dc2ce203cead.txt; echo
  ```
  Esperado: el índice lista `sitemap-paginas-0.xml`; el conteo de `lastmod` es
  40 (si sale 0, ve a runbook §1.6); la URL vieja responde `301` hacia
  `/guias/mejores-apps-licitaciones-colombia/`; el último comando imprime la
  clave `6cd3f559…`.

## Bloque 3 — Google y Bing (≈ 30 min, el mismo día del bloque 2)

- [ ] **3.1 Search Console** → https://search.google.com/search-console →
  elige la propiedad de dominio `contradar.com.co` (ya está verificada por DNS).
- [ ] **3.2 Sitemap**: menú **Sitemaps** → en «Agregar un sitemap» escribe
  `sitemap-index.xml` → **Enviar**. Si estaba `sitemap-0.xml`, quítalo
  (tres puntos → Quitar). En 1-3 días debe decir «Correcto».
- [ ] **3.3 Pide indexación de lo nuevo**: arriba, en «Inspeccionar cualquier
  URL», pega cada una, espera y pulsa **Solicitar indexación**. Google deja
  unas 10 al día; hazlas en este orden, 10 por día:
  1. `https://contradar.com.co/`
  2. `https://contradar.com.co/licitaciones-colombia/`
  3. `https://contradar.com.co/guias/mejores-apps-licitaciones-colombia/`
  4. `https://contradar.com.co/herramientas/calculadora-capacidad-residual/`
  5. `https://contradar.com.co/diagnostico/`
  6. `https://contradar.com.co/precios/`
  7. `https://contradar.com.co/guias/como-ganar-una-licitacion/`
  8. `https://contradar.com.co/guias/capacidad-residual/`
  9. `https://contradar.com.co/guias/minima-cuantia/`
  10. `https://contradar.com.co/guias/que-es-el-rup/`
  Día 2: las otras 7 guías, `/sectores/` y sus 5 páginas. Día 3: `/alternativas/` y sus 3.
- [ ] **3.4 Bing Webmaster Tools** → https://www.bing.com/webmasters →
  **Importar desde Google Search Console** → autoriza → importa
  `contradar.com.co`. Luego **Sitemaps** → confirma `sitemap-index.xml`.
- [ ] **3.5 IndexNow** (avisa a Bing y otros en minutos):
  ```bash
  cd ~/eulertech/web-contradar
  scripts/indexnow.sh --todas
  ```
  Debe terminar en `IndexNow respondió HTTP 200` (o 202). Desde ahora, tras
  cada despliegue: `scripts/indexnow.sh` (envía lo que cambió hoy).

## Bloque 4 — Datos que solo tú puedes sacar (≈ 30 min, cuando puedas)

- [ ] **4.1 Plan Alerta.** En el VPS, en la base de producción:
  ```sql
  select key, max_results_delivery from plans;
  ```
  Pégame el resultado. La web dice que Alerta trae «las 5 mejores» al día.
- [ ] **4.2 Datos propios de las guías y sectores.** Abre
  `web-contradar/docs/seo/consultas-fase-2.md`. Arriba dice cómo conectarte en
  solo lectura. Corre primero `00-precheck` y luego cada consulta, en horario
  valle. Pégame cada resultado con su id: yo lo paso a la web. No hace falta
  hacerlas todas el mismo día.

## Bloque 5 — Analítica con Umami (≈ 1 h)

Sigue `runbook-manual.md` §4 en orden (base de datos propia → contenedor → DNS
`analitica.contradar.com.co` → bloque de nginx con su certificado → primer
acceso → crear el sitio con dominios `contradar.com.co,app.contradar.com.co`).

- [ ] **5.1** Umami responde en https://analitica.contradar.com.co y cambiaste
  la contraseña de `admin`.
- [ ] **5.2** Copia el *Website ID* del sitio.
- [ ] **5.3 Web**: Cloudflare → Workers & Pages → web-contradar → Settings →
  Variables and Secrets → *Add* (Production):
  `PUBLIC_UMAMI_SRC` = `https://analitica.contradar.com.co/script.js` ·
  `PUBLIC_UMAMI_ID` = el Website ID → **Retry deployment** del último despliegue.
- [ ] **5.4 App**: añade al `.env.production` del VPS
  `VITE_UMAMI_SRC=https://analitica.contradar.com.co/script.js` y
  `VITE_UMAMI_ID=<el mismo ID>` → `docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build web`.
- [ ] **5.5 Verifica**: abre la web en incógnito, escribe un NIT en el
  hero y ve al diagnóstico. En Umami → *Realtime* deben aparecer
  `diagnostico_iniciado` y `diagnostico_completado`.
- [ ] **5.6** En Umami crea el *Goal* `prueba_solicitada` (principal) y el
  *Funnel* `diagnostico_iniciado → diagnostico_completado → prueba_solicitada`
  (runbook §4.7).

## Bloque 6 — Páginas por entidad (fase 3, ≈ 1-2 h la primera vez)

Todo en `contradar/docs/operacion/snapshot-web.md`. Resumen:

- [ ] **6.1** En tu equipo, con el stack de DESARROLLO arriba, corre primero
  la prueba con `--limite 50` y revisa el `manifest.json`.
- [ ] **6.2** Corre el export completo (20-45 min estimados). Anota cuánto tardó.
- [ ] **6.3** Crea en Cloudflare R2 el bucket `contradar-snapshots`, súbele el
  `entidades.json.gz` (comando en el runbook) y dale una URL de lectura
  (dominio propio del bucket o r2.dev).
- [ ] **6.4** En Pages añade `SNAPSHOT_URL` = esa URL → Retry deployment. En el
  log del build debe salir `[snapshot] corte … · N entidades`.
- [ ] **6.5** Verifica `https://contradar.com.co/entidades/` y envía en Search
  Console `sitemap-entidades-0.xml` (ya va dentro del índice; solo míralo).
- [ ] **6.6** Cada mes: repite 6.2-6.4 con `--anterior` (está en el runbook).

## Bloque 7 — LinkedIn de la empresa (≈ 1 h, y luego 2 publicaciones por semana)

- [ ] **7.1** Completa la página https://www.linkedin.com/company/contradar/
  con los textos de `runbook-manual.md` §10.1 (logo, portada, eslogan,
  descripción, sitio web, sector, especialidades).
- [ ] **7.2** Publica la primera de las 8 publicaciones listas (§10.2) y
  compártela desde tu perfil personal con una línea tuya.
- [ ] **7.3** Programa las otras 7: dos por semana (§10.3).

## Bloque 8 — Después (sin prisa)

- [ ] Google Business Profile: **no lo crees** (Google no admite negocios solo
  en línea; runbook §5).
- [ ] Google Ads, si quieres aparecer arriba ya: runbook §6 (campañas,
  palabras, negativas y anuncios listos).
- [ ] Directorios (Capterra, G2, Fedesoft): runbook §7, textos listos.
- [ ] Correos a cámaras de comercio, gremios y prensa: runbook §8. Antes de usar
  bases de correos, valida la Ley 1581 con tu asesor.
- [ ] Testimonios: cuando un cliente acepte, runbook §9 y te activo el bloque.
- [ ] Rutina: lunes 15 min en Search Console (§11).
