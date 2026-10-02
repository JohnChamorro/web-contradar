# Paso a paso para John — todo lo que te toca, en orden

Actualizado: 2 de octubre de 2026.

**Cómo usar esto:** ve bloque por bloque, en orden. Cada paso dice qué hacer,
dónde, qué pegar y cómo comprobar que quedó bien. Marca la casilla `[x]` al
terminar. Si algo no sale como dice «Debe salir», **para y mándame lo que
viste** (captura o el texto de la terminal).

**Estado de partida:** los tres repos ya tienen todo fusionado en su rama
principal **en tu equipo**, pero **nada está subido** a GitHub ni desplegado:

| Repo | Carpeta | Rama principal | Commits por subir |
|---|---|---|---|
| Web (landing) | `~/eulertech/web-contradar` | `main` | 61 |
| App | `~/eulertech/contradar` | `main` | 0 (ya subido: incluye `develop`) |
| Sistema visual | `~/eulertech/contradar-design` | `master` | 3 |

**Accesos que vas a necesitar:** terminal en tu equipo, SSH al VPS, cuenta de
Cloudflare (https://dash.cloudflare.com), cuenta de Google con Search Console
(https://search.google.com/search-console), cuenta de Microsoft para Bing
(https://www.bing.com/webmasters) y LinkedIn como administrador de la página.

**Tiempo:** día 1, bloques 1 a 3 (≈ 2 h). Los demás, cuando puedas.

---

## BLOQUE 1 — Subir el código y desplegar la app (≈ 45 min)

### 1.1 Subir el sistema visual

- [ ] En tu terminal:
  ```bash
  cd ~/eulertech/contradar-design
  git push origin master
  ```
  **Debe salir:** `master -> master` sin errores.
  Nota: en GitHub ese repo tiene también una rama `main` con solo el
  «Initial commit». La rama con todo el trabajo es `master`; no hace falta
  tocar `main`.

### 1.2 Subir la app

- [ ] Mira el estado de tu copia de la app:
  ```bash
  cd ~/eulertech/contradar
  git status --short
  ```
  Vas a ver `M backend/scripts/exportar_snapshot_web.py`: es un cambio **sin
  commitear** en `develop` que no hice yo. Revísalo con
  `git diff backend/scripts/exportar_snapshot_web.py` y decide si lo guardas
  (commit) o lo descartas. No afecta el siguiente paso.
- [ ] **`main` de la app ya está en GitHub** (se subió el 2-oct con
  «Merge branch 'develop'»: trae lo de SEO y también tus commits de
  `develop`). Compruébalo:
  ```bash
  git fetch origin
  git log --oneline -3 origin/main
  ```
  **Debe salir** arriba `902ec87 Merge branch 'develop'` (o algo más nuevo).

### 1.3 Desplegar la app en el VPS

Tu procedimiento de siempre (`docs/operacion/despliegue.md`). Como `main`
incluye también tus commits de `develop`, este despliegue trae **una
migración**: `24de14e85b17_diagnostico_cache` (de tu commit de rendimiento del
diagnóstico, no mía). Crea una tabla nueva y vacía, así que es rápida. Lo de
SEO no trae migraciones.

- [ ] Entra al VPS:
  ```bash
  ssh <usuario>@<IP_DEL_VPS>
  cd ~/contradar
  ```
- [ ] Backup (siempre):
  ```bash
  mkdir -p ~/backups
  docker compose -f docker-compose.prod.yml --env-file .env.production exec -T postgres \
    pg_dump -U contradar contradar | gzip > ~/backups/prod_preseo_$(date +%F).sql.gz
  gzip -t ~/backups/prod_preseo_$(date +%F).sql.gz && echo BACKUP OK
  ```
  **Debe salir:** `BACKUP OK`.
- [ ] Traer el código (solo si es avance rápido):
  ```bash
  git fetch origin
  git merge-base --is-ancestor HEAD origin/main && git pull origin main
  ```
  **Debe salir:** `Fast-forward` y una lista de archivos. Si no sale nada y
  el prompt vuelve sin error, el VPS tenía cambios propios: para y avísame.
- [ ] Mira las migraciones pendientes (comando de tu runbook, sección
  «Antes de CUALQUIER despliegue»). **Debe salir solo** `24de14e85b17`
  (diagnostico_cache). Si aparece otra que no conozcas, para.
- [ ] Reconstruye la app:
  ```bash
  docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build web backend
  docker compose -f docker-compose.prod.yml --env-file .env.production logs --tail=50 backend
  ```
- [ ] **Comprueba** (desde el VPS o desde tu equipo):
  ```bash
  curl -s https://app.contradar.com.co/health
  curl -s https://app.contradar.com.co/robots.txt | head -3
  ```
  **Debe salir:** `{"status":"ok"…}` y la línea
  `# robots.txt de app.contradar.com.co (seo/fase-1, 2-oct-2026).`
- [ ] **Comprueba en el navegador:**
  - https://app.contradar.com.co → menú → **Términos**: la sección 3 debe
    empezar por «Puedes crear una cuenta de prueba gratuita…».
  - En tu **perfil de licitante**, el campo de capacidad técnica dice
    **«Socios y profesionales vinculados»**.

---

## BLOQUE 2 — Desplegar la web (≈ 20 min)

### 2.1 Revisión final en local (opcional, 5 min)

- [ ] Si quieres verla antes de publicar:
  ```bash
  cd ~/eulertech/web-contradar
  npm run build && npx astro preview --port 4321
  ```
  y abre http://localhost:4321 (Ctrl+C para cerrar).

### 2.2 Publicar

- [ ] Sube `main` (esto **despliega**: Cloudflare Pages construye solo):
  ```bash
  cd ~/eulertech/web-contradar
  git push origin main
  ```
- [ ] Mira el despliegue: https://dash.cloudflare.com → **Workers & Pages** →
  `web-contradar` → **Deployments**. El primero de la lista debe pasar a
  **Success** en 2-4 minutos. Si sale **Failed**, abre el despliegue →
  **View build log**, copia las últimas 30 líneas y mándamelas.
  - En el log verás `[snapshot] SNAPSHOT_URL vacío: build sin páginas de entidad.`
    Es normal: las páginas por entidad llegan en el bloque 6.

### 2.3 Prueba de humo de la prueba gratis (LA MÁS IMPORTANTE)

Antes de este despliegue, el alta inmediata **no funcionaba en producción**:
la seguridad del navegador (CSP) bloqueaba la llamada a la app y todo caía al
respaldo manual.

- [ ] Abre una **ventana de incógnito** → https://contradar.com.co/#solicitar
- [ ] Pon un correo tuyo que **no** tenga cuenta (por ejemplo
  `cfjohneuler+prueba1@gmail.com`), empresa «Prueba SEO», marca la
  autorización de datos → **Empezar mi prueba gratis**.
- [ ] **Debe pasar:** el botón dice «Entrando…» y **te deja dentro de la app**
  (pantalla de prueba activada).
  **Si en cambio sale «¡Solicitud recibida!»**, la CSP sigue bloqueando:
  avísame.
- [ ] Después borra esa cuenta de prueba desde la administración de la app.

### 2.4 Comprobaciones técnicas

- [ ] En tu terminal:
  ```bash
  curl -s https://contradar.com.co/sitemap-index.xml; echo
  curl -s https://contradar.com.co/sitemap-paginas-0.xml | grep -o "<lastmod>[^<]*" | sort | uniq -c | sort -rn | head -5
  curl -sI https://contradar.com.co/guias/apps-para-licitaciones-colombia/ | grep -iE "^HTTP|^location"
  curl -s https://contradar.com.co/6cd3f559f2eafbb26561dc2ce203cead.txt; echo
  curl -s https://contradar.com.co/llms.txt | head -3
  ```
  **Debe salir**, en orden:
  1. Un XML que lista `https://contradar.com.co/sitemap-paginas-0.xml`.
  2. Varias fechas distintas (cuántas URL tiene cada una). Si sale **una sola
     fecha con 40**, el build no pudo traer la historia de git: mira en el log
     de Pages la línea `[lastmod]` y mándamela.
  3. `HTTP/2 301` y `location: /guias/mejores-apps-licitaciones-colombia/`.
  4. `6cd3f559f2eafbb26561dc2ce203cead`.
  5. `# ContRadar` y la descripción.
- [ ] **Velocidad real:** https://pagespeed.web.dev → pega
  `https://contradar.com.co/` → **Analizar**. En la pestaña **Móvil**, el LCP
  debe estar **por debajo de 2,5 s** y el CLS en **0**. Haz lo mismo con
  `https://contradar.com.co/guias/capacidad-residual/`.
- [ ] **Datos estructurados:** https://search.google.com/test/rich-results →
  pega `https://contradar.com.co/guias/capacidad-residual/` → **Probar URL**.
  **Debe salir:** «La página es apta para resultados enriquecidos», con
  *Fragmentos de ruta de exploración* y *Preguntas frecuentes*, sin errores.

---

## BLOQUE 3 — Google y Bing (≈ 30 min, el mismo día)

### 3.1 Search Console: el sitemap

- [ ] Abre https://search.google.com/search-console → arriba a la izquierda,
  en el selector de propiedades, elige **contradar.com.co** (propiedad de
  dominio; ya está verificada por DNS).
- [ ] Menú izquierdo → **Sitemaps** (dentro de «Indexación»).
- [ ] En «Agregar un sitemap nuevo» escribe `sitemap-index.xml` → **Enviar**.
- [ ] Si en la lista aparece `sitemap-0.xml` (el viejo): clic en él → los tres
  puntos arriba a la derecha → **Quitar sitemap**.
- [ ] **Cómo saber que quedó:** en 1-3 días el estado de `sitemap-index.xml`
  pasa a **Correcto** con unas 40 URL descubiertas.

### 3.2 Search Console: pedir indexación de lo nuevo

Google permite unas 10 solicitudes al día. Haz una tanda diaria:

- [ ] Arriba, en la barra **«Inspeccionar cualquier URL de …»**, pega la URL →
  Enter → espera el resultado → botón **SOLICITAR INDEXACIÓN** → espera el
  aviso «Se ha solicitado la indexación».
- [ ] **Día 1:**
  1. https://contradar.com.co/
  2. https://contradar.com.co/licitaciones-colombia/
  3. https://contradar.com.co/guias/mejores-apps-licitaciones-colombia/
  4. https://contradar.com.co/herramientas/calculadora-capacidad-residual/
  5. https://contradar.com.co/diagnostico/
  6. https://contradar.com.co/precios/
  7. https://contradar.com.co/guias/como-ganar-una-licitacion/
  8. https://contradar.com.co/guias/capacidad-residual/
  9. https://contradar.com.co/guias/minima-cuantia/
  10. https://contradar.com.co/guias/que-es-el-rup/
- [ ] **Día 2:**
  1. https://contradar.com.co/guias/requisitos-habilitantes/
  2. https://contradar.com.co/guias/como-calcular-la-oferta-economica/
  3. https://contradar.com.co/guias/seleccion-abreviada/
  4. https://contradar.com.co/guias/secop-i-vs-secop-ii/
  5. https://contradar.com.co/guias/poliza-de-seriedad-de-la-oferta/
  6. https://contradar.com.co/guias/consorcios-y-uniones-temporales/
  7. https://contradar.com.co/guias/
  8. https://contradar.com.co/sectores/
  9. https://contradar.com.co/sectores/construccion/
  10. https://contradar.com.co/sectores/ingenieria-e-interventoria/
- [ ] **Día 3:**
  1. https://contradar.com.co/sectores/salud/
  2. https://contradar.com.co/sectores/tecnologia-y-telecomunicaciones/
  3. https://contradar.com.co/sectores/agua-y-saneamiento/
  4. https://contradar.com.co/alternativas/
  5. https://contradar.com.co/alternativas/licitaciones-info/
  6. https://contradar.com.co/alternativas/fromus/
  7. https://contradar.com.co/alternativas/licitia/
  8. https://contradar.com.co/herramientas/
  9. https://contradar.com.co/funcionalidades/
  10. https://contradar.com.co/producto/estadistica-de-la-licitacion/

### 3.3 Bing Webmaster Tools

- [ ] Abre https://www.bing.com/webmasters e inicia sesión.
- [ ] Si te ofrece **«Importar desde Google Search Console»**: **Importar** →
  autoriza con tu cuenta de Google → marca `contradar.com.co` → **Importar**.
  (Si ya tenías el sitio en Bing, entra a él directamente.)
- [ ] Menú izquierdo → **Sitemaps** → **Enviar mapa del sitio** →
  `https://contradar.com.co/sitemap-index.xml` → **Enviar**.

### 3.4 IndexNow (avisa a Bing en minutos)

- [ ] En tu terminal:
  ```bash
  cd ~/eulertech/web-contradar
  scripts/indexnow.sh --todas
  ```
  **Debe salir:** la lista de URLs y al final `IndexNow respondió HTTP 200`
  (o `202`, que también vale).
- [ ] **Desde ahora, después de cada despliegue de la web:**
  `scripts/indexnow.sh` (sin nada más: envía lo que cambió hoy).

---

## BLOQUE 4 — Datos que solo tú puedes sacar (≈ 45 min, en horario valle)

Con esto se activan las cifras propias de ContRadar dentro de las guías y los
sectores (hoy no se ven: nacen vacías a propósito).

### 4.1 Entrar a la base de producción en solo lectura

- [ ] En el VPS:
  ```bash
  cd ~/contradar
  docker compose -f docker-compose.prod.yml --env-file .env.production exec postgres \
    psql -U contradar -d contradar -X
  ```
- [ ] Dentro de `psql`, **antes de cualquier consulta**, pega:
  ```sql
  SET default_transaction_read_only = on;
  SET statement_timeout = '120s';
  SET jit = off;
  \pset format aligned
  \timing on
  ```

### 4.2 Plan Alerta

- [ ] Pega:
  ```sql
  select key, max_results_delivery, max_results_day from plans order by key;
  ```
  **Mándame la salida.** La web dice que Alerta trae «las 5 mejores» al día.

### 4.3 Las consultas de las guías

- [ ] Abre en tu equipo `~/eulertech/web-contradar/docs/seo/consultas-fase-2.md`.
- [ ] Copia y pega **primero** la consulta `00-precheck`. Mándame la salida
  antes de seguir: confirma que los datos de producción tienen la forma
  esperada.
- [ ] Luego, una por una, en el orden del documento. Si alguna llega al tope
  de 120 s, repite **solo esa** después de `SET statement_timeout = '300s';`
  y vuelve a `'120s'`.
- [ ] **Cómo mandármelo:** escribe `medido: 2026-10-XX` y debajo pega la
  salida de `psql` tal cual. Puedes pegar varias seguidas: cada una trae su
  `id` en la primera columna.
- [ ] Sal de `psql` con `\q`.

---

## BLOQUE 5 — Analítica con Umami (≈ 1 h 15 min)

Umami mide el embudo (NIT → diagnóstico → prueba) sin cookies y sin banner.
Corre en tu VPS y usa la misma base de Postgres, en una base aparte.

### 5.1 Base de datos de Umami

- [ ] Genera y **guarda en tu gestor de contraseñas** una clave:
  ```bash
  openssl rand -hex 24
  ```
- [ ] En el VPS:
  ```bash
  cd ~/contradar
  docker compose -f docker-compose.prod.yml --env-file .env.production exec postgres \
    psql -U contradar -d postgres
  ```
  y dentro:
  ```sql
  CREATE ROLE umami LOGIN PASSWORD 'PEGA_AQUI_LA_CLAVE';
  CREATE DATABASE umami OWNER umami;
  REVOKE CONNECT ON DATABASE umami FROM PUBLIC;
  \q
  ```
  **Debe salir:** `CREATE ROLE`, `CREATE DATABASE`, `REVOKE`.

### 5.2 Contenedor de Umami

- [ ] Confirma el nombre de la red y del contenedor de Postgres:
  ```bash
  docker network ls | grep contradar
  docker ps --format '{{.Names}}' | grep -i postgres
  ```
  Normalmente: red `contradar_default` y contenedor `contradar-postgres`. Si
  salen otros nombres, úsalos en el comando siguiente.
- [ ] Genera el secreto y arranca Umami:
  ```bash
  APP_SECRET=$(openssl rand -hex 32); echo "$APP_SECRET"   # guárdalo también
  docker run -d --name contradar-umami \
    --network contradar_default \
    --restart always \
    --memory 512m \
    --log-opt max-size=10m --log-opt max-file=3 \
    -e DATABASE_URL='postgresql://umami:PEGA_AQUI_LA_CLAVE@contradar-postgres:5432/umami' \
    -e APP_SECRET="$APP_SECRET" \
    ghcr.io/umami-software/umami:latest
  ```
- [ ] **Comprueba** (espera 30-60 s):
  ```bash
  docker logs --tail 30 contradar-umami
  docker stats --no-stream contradar-umami
  ```
  **Debe salir:** en los logs, migraciones aplicadas y que escucha en el
  puerto 3000; en `stats`, unos 150-250 MB de RAM.
  Documentación: https://docs.umami.is/docs/install

### 5.3 DNS de analitica

- [ ] https://dash.cloudflare.com → dominio **contradar.com.co** → **DNS** →
  **Records** → **Add record**:
  - Type: **A**
  - Name: `analitica`
  - IPv4 address: la IP del VPS (la misma del registro `app`)
  - Proxy status: **DNS only** (nube gris)
  - **Save**
- [ ] Comprueba en tu terminal (puede tardar unos minutos):
  ```bash
  dig +short analitica.contradar.com.co
  ```
  **Debe salir:** la IP del VPS.

### 5.4 Certificado y nginx

Ya dejé `frontend/nginx.conf` preparado en el repo (lo desplegaste en el
bloque 1): `analitica` ya responde el reto del certificado, y su bloque HTTPS
está **comentado** al final del archivo.

- [ ] En el VPS, emite el certificado (primero en prueba):
  ```bash
  cd ~/contradar
  docker compose -f docker-compose.prod.yml --env-file .env.production run --rm --entrypoint certbot certbot \
    certonly --webroot -w /var/www/certbot --dry-run -d analitica.contradar.com.co \
    --email cfjohneuler@gmail.com --agree-tos --no-eff-email
  ```
  **Debe salir:** `The dry run was successful.` Entonces repite el mismo
  comando **sin** `--dry-run`. **Debe salir:** `Successfully received certificate.`
- [ ] **En tu equipo** (no en el VPS), quita los `#` del bloque final de
  `~/eulertech/contradar/frontend/nginx.conf`: desde la línea `# server {`
  que tiene `server_name analitica.contradar.com.co` hasta su `# }` final.
  Quita también el espacio que sigue a cada `#`. Luego:
  ```bash
  cd ~/eulertech/contradar
  git checkout main
  git commit -am "feat(nginx): activa analitica.contradar.com.co (Umami)"
  git push origin main
  ```
  (Si prefieres, mándame un mensaje cuando tengas el certificado y te hago
  yo el commit.)
- [ ] En el VPS:
  ```bash
  cd ~/contradar
  git pull origin main
  docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build web
  curl -sI https://analitica.contradar.com.co/script.js | head -1
  ```
  **Debe salir:** `HTTP/2 200`. Y https://app.contradar.com.co sigue
  funcionando.
- [ ] Tu cron de renovación (`certbot renew`) ya cubre este certificado: no hay
  que hacer nada más.

### 5.5 Primer ingreso y sitio

- [ ] Abre https://analitica.contradar.com.co → usuario **admin**, contraseña
  **umami**.
- [ ] **Cambia la contraseña ya:** arriba a la derecha → **Profile** →
  **Change password**.
- [ ] **Websites** (o **Settings → Websites**) → **Add website**:
  - Name: `ContRadar`
  - Domain: `contradar.com.co`
  - **Save**
- [ ] En ese sitio → **Edit** → pestaña **Tracking code** → copia el valor de
  `data-website-id` (un código tipo `a1b2c3d4-…`). **No pegues el código en
  ningún HTML**: la web y la app ya lo cargan solas.
  Documentación: https://docs.umami.is/docs/add-a-website

### 5.6 Conectar la web y la app

- [ ] **Web:** https://dash.cloudflare.com → **Workers & Pages** →
  `web-contradar` → **Settings** → **Variables and Secrets** → **Add**
  (entorno **Production**), dos variables de texto:
  - `PUBLIC_UMAMI_SRC` = `https://analitica.contradar.com.co/script.js`
  - `PUBLIC_UMAMI_ID` = el `data-website-id`
  → **Save**. Luego **Deployments** → el último → menú de tres puntos →
  **Retry deployment** (las variables solo entran en un despliegue nuevo).
- [ ] **App:** en el VPS, abre `~/contradar/.env.production` y añade al final:
  ```
  VITE_UMAMI_SRC=https://analitica.contradar.com.co/script.js
  VITE_UMAMI_ID=<el mismo data-website-id>
  ```
  y reconstruye:
  ```bash
  docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build web
  ```

### 5.7 Comprobar que mide

Usa Chrome en un **perfil limpio, sin extensiones** (los bloqueadores y la
opción «No rastrear» ocultan tus propias visitas).

- [ ] En Umami abre el sitio → **Realtime**.
- [ ] En otra pestaña, en https://contradar.com.co :
  - Escribe un NIT en el formulario de la portada → en Realtime debe aparecer
    **`diagnostico_iniciado`**.
  - Espera el diagnóstico en la app → **`diagnostico_completado`**.
  - Ve a https://contradar.com.co/precios/ y pulsa el botón de un plan →
    **`precio_plan_click`**.
  - Usa la calculadora https://contradar.com.co/herramientas/calculadora-capacidad-residual/ →
    **`calculadora_k_usada`**.
  - Pulsa un botón de WhatsApp → **`whatsapp_click`**.

### 5.8 Conversiones y embudo

- [ ] **Reports → Goals → Create**, tipo *Event*: `prueba_solicitada`
  (principal) y `diagnostico_completado`.
  Guía: https://docs.umami.is/docs/goals
- [ ] **Reports → Funnel → Create**, ventana 60 min, pasos:
  1. Página `/`
  2. Evento `diagnostico_iniciado`
  3. Evento `diagnostico_completado`
  4. Evento `prueba_solicitada`
  Guía: https://docs.umami.is/docs/funnel

---

## BLOQUE 6 — Páginas por entidad (≈ 2 h la primera vez; luego 30 min al mes)

Genera páginas como `/entidades/alcaldia-de-popayan-…/` con cuánto contrata
cada entidad, a qué precio adjudica y quién le gana. **Se corre en tu equipo,
con el stack de DESARROLLO, nunca en el VPS.** Runbook completo:
`~/eulertech/contradar/docs/operacion/snapshot-web.md`.

### 6.1 Preparar

- [ ] Asegúrate de que tu copia de la app esté en una rama que tenga el
  script (`main` o `develop` después del paso 1.2) y que el stack de
  desarrollo esté arriba (`docker ps` muestra `contradar-backend` y
  `contradar-postgres`).
- [ ] Revisa que los datos de desarrollo estén frescos (sección «0. Antes de
  correrlo» del runbook).

### 6.2 Prueba corta (50 entidades)

- [ ] ```bash
  cd ~/eulertech/contradar
  docker compose exec -T backend python -u -m scripts.exportar_snapshot_web \
    --salida /app/.snapshot-web/prueba --corte $(date +%F) --limite 50
  cat backend/.snapshot-web/prueba/manifest.json
  ```
  **Debe salir:** un JSON con `conteos.entidades` alrededor de 50 y `avisos: []`.
  Mándame el manifest y lo reviso contigo.

### 6.3 Corrida completa (la primera vez, sin `--anterior`)

- [ ] ```bash
  cd ~/eulertech/contradar
  CORTE=$(date +%F)
  mkdir -p backend/.snapshot-web
  docker compose exec -T backend python -u -m scripts.exportar_snapshot_web \
    --salida /app/.snapshot-web/$CORTE --corte $CORTE \
    --tanda1 400 --min-contratos 30 2>&1 | tee backend/.snapshot-web/$CORTE.log
  ```
  Tarda entre 20 y 45 min (estimado). **Anota el tiempo real.**
- [ ] Verifica:
  ```bash
  jq '{corte, version, conteos, bytes, avisos}' backend/.snapshot-web/$CORTE/manifest.json
  gzip -t backend/.snapshot-web/$CORTE/entidades.json.gz && echo GZ OK
  ```
  **Debe salir:** `conteos.entidades` entre 10 y 13 mil, `tanda1` = 400,
  `avisos: []` y `GZ OK`. Mándame la salida.

### 6.4 Bucket en Cloudflare R2 (una sola vez)

- [ ] En tu terminal:
  ```bash
  npx wrangler login              # abre el navegador: autoriza
  npx wrangler r2 bucket create contradar-snapshots
  ```
- [ ] Dominio de lectura: https://dash.cloudflare.com → **R2 Object Storage**
  → **Overview** → `contradar-snapshots` → **Settings** → **Custom Domains**
  → **Add** → escribe `datos.contradar.com.co` → **Continue** → **Connect
  Domain**. En unos minutos el estado pasa de *Initializing* a **Active**.
  Guía oficial: https://developers.cloudflare.com/r2/buckets/public-buckets/#custom-domains
  (No uses la URL `r2.dev`: Cloudflare la limita y la desaconseja para producción.)

### 6.5 Subir el snapshot (cada mes)

- [ ] ```bash
  cd ~/eulertech/contradar
  D=backend/.snapshot-web/$CORTE
  for k in entidades/$CORTE entidades/actual; do
    npx wrangler r2 object put contradar-snapshots/$k/entidades.json.gz \
      --file=$D/entidades.json.gz --content-type=application/gzip --remote
    npx wrangler r2 object put contradar-snapshots/$k/manifest.json \
      --file=$D/manifest.json --content-type=application/json --remote
  done
  ```
  El `--remote` es obligatorio: sin él, Wrangler «sube» a un almacenamiento
  local y nada llega a Cloudflare.
- [ ] Comprueba que se lee desde internet:
  ```bash
  curl -sI https://datos.contradar.com.co/entidades/actual/entidades.json.gz | head -1
  ```
  **Debe salir:** `HTTP/2 200`.

### 6.6 Conectar la web

- [ ] Cloudflare → **Workers & Pages** → `web-contradar` → **Settings** →
  **Variables and Secrets** → **Add** (Production):
  `SNAPSHOT_URL` = `https://datos.contradar.com.co/entidades/actual/entidades.json.gz`
  → **Save** → **Deployments** → **Retry deployment**.
- [ ] En el log del build **debe salir:** `[snapshot] corte 2026-10-XX · NNNNN entidades`.
- [ ] Abre https://contradar.com.co/entidades/ y entra a 3 entidades que
  conozcas. Revisa que las cifras tengan sentido y que **no aparezca ninguna
  persona natural** en «Empresas que más le ganan». Si ves algo raro, para y
  avísame antes de seguir.
- [ ] `cd ~/eulertech/web-contradar && scripts/indexnow.sh`
- [ ] En Search Console → **Sitemaps** verás `sitemap-entidades-0.xml` dentro
  del índice. **Páginas** → filtra por ese sitemap y anota cada semana
  *enviadas* frente a *indexadas*.

### 6.7 Cada mes

- [ ] Repite 6.3 añadiendo el snapshot del mes anterior (para que el
  `lastmod` solo cambie en las entidades cuyas cifras cambiaron):
  ```bash
  ANTERIOR=$(ls -d backend/.snapshot-web/20*/ | sort | tail -1)
  # y en el comando de 6.3 añade:
  #   --anterior /app/.snapshot-web/$(basename $ANTERIOR)/entidades.json.gz
  ```
- [ ] Repite 6.5 y **Retry deployment**.
- [ ] **A las 4-6 semanas de la primera tanda**, si Search Console muestra al
  menos el 70 % de las entidades indexadas: añade en Pages
  `INDEXAR_SECTOR_DEPTO` = `1` y **Retry deployment**. Eso abre a Google las
  páginas de sector por departamento.

---

## BLOQUE 7 — LinkedIn de la empresa ⭐ (≈ 1 h + 2 publicaciones por semana)

La página https://www.linkedin.com/company/contradar/ no tiene publicaciones.
Ya está enlazada en los datos estructurados de la web.

### 7.1 Completar el perfil

- [ ] Entra a https://www.linkedin.com/company/contradar/admin/ → **Edit page**
  («Editar página»). Llena:

| Campo | Qué poner |
|---|---|
| Logo | Logo cuadrado, PNG, 400×400 recomendado (máx. 3 MB) |
| Portada | 1512×256, fondo claro, una línea: «Quién gana y a qué precio, en cada entidad del Estado» |
| Eslogan | `App de licitaciones para Colombia: quién gana y a qué precio en el SECOP I y II, desde 2012.` |
| Descripción | El texto de `runbook-manual.md` §7.4 + «Hecha en Popayán por eulertech.» |
| Sitio web | `https://contradar.com.co/?utm_source=linkedin&utm_medium=social&utm_campaign=perfil` |
| Sector | Desarrollo de software |
| Tamaño | 2-10 empleados |
| Teléfono | +57 323 923 6742 |
| Especialidades | licitaciones públicas, SECOP I, SECOP II, contratación estatal, análisis de competencia, precio de adjudicación, capacidad residual, mínima cuantía, PAA, gestión de contratos |
| Ubicación | Popayán, Cauca, Colombia |
| Botón | «Visitar sitio web» → `https://contradar.com.co/?utm_source=linkedin&utm_medium=social&utm_campaign=boton#solicitar` |

  Especificaciones oficiales de imágenes:
  https://www.linkedin.com/help/linkedin/answer/a563309
- [ ] En **tu perfil personal** → Experiencia → añade «Fundador · ContRadar»
  enlazando la página de la empresa.

### 7.2 Las 8 primeras publicaciones

Los textos están listos en `runbook-manual.md` §10.2 (con sus enlaces y UTM).
Ya revisé que sus cifras coincidan con la web.

- [ ] Semana 1: martes la **1 (presentación)**; jueves la **2 (calculadora K)**.
- [ ] Semana 2: la **3 (mínima cuantía)** y la **4 (SECOP I)**.
- [ ] Semana 3: la **5 (RUP)** y la **6 (oferta económica)**.
- [ ] Semana 4: la **7 (consorcios)** y la **8 (diagnóstico)**.
- [ ] Cada una, con una **imagen propia** (captura de la web o de la app) y
  compartida desde tu perfil personal con una línea tuya: ahí está casi todo
  el alcance de una página nueva.

---

## BLOQUE 8 — Primera semana: mirar que todo se esté indexando (15 min, día 7)

- [ ] Search Console → **Páginas**: las nuevas deben ir pasando a
  «Indexadas». Si alguna dice **«Rastreada: actualmente sin indexar»**, no
  hagas nada durante 2-3 semanas (es normal en páginas nuevas); si sigue
  igual, mándame la lista.
- [ ] Search Console → **Mejoras** → *Fragmentos de ruta de exploración* y
  *Preguntas frecuentes*: sin errores.
- [ ] Umami → **Funnel**: que haya datos en los cuatro pasos.

---

## BLOQUE 9 — Cuando quieras (sin orden fijo)

Todo listo para copiar en `docs/seo/runbook-manual.md`:

- [ ] **Google Ads** para aparecer arriba mientras madura el SEO: §6
  (campañas, palabras clave, negativas, anuncios contados y presupuesto
  inicial). Ojo con §6.6: Umami no habla con Google Ads; ahí está cómo medir
  conversiones sin cookies.
- [ ] **Directorios de software** (Capterra, G2, Fedesoft, CreaTIC): §7, con
  el texto de ficha listo.
- [ ] **Correos a cámaras de comercio, gremios, universidades y prensa**: §8,
  plantillas y destinatarios. **Antes de usar bases de correos, valida la Ley
  1581 con tu asesor.**
- [ ] **Testimonios**: cuando un cliente acepte, §9 (correo, autorización
  escrita) y me avisas para activar el bloque en la web.
- [ ] **Google Business Profile: no lo crees.** Google no admite negocios
  solo en línea (§5).

---

## BLOQUE 10 — Rutina

- [ ] **Cada lunes (15 min):** Search Console → **Rendimiento** → filtra por
  las 15 búsquedas objetivo de `runbook-manual.md` §11 y anota posición y
  clics.
- [ ] **Primer lunes del mes (1 h):** informe de posiciones, clics, embudo de
  Umami y entidades indexadas frente a enviadas; snapshot del mes (bloque 6.7).
- [ ] **Cada 3 meses (medio día):** revisar en navegador los precios de los
  competidores (especialmente Licitum, licitum.co) y avisarme si cambiaron.

---

**Expectativas, sin promesas:** el primer mes, Google indexa y aparece la
marca; de 1 a 3 meses, búsquedas largas y páginas de entidad; de 3 a 6 meses,
los términos donde no tenemos rival (precio de adjudicación, competencia); de
6 a 12 meses, términos genéricos como «app de licitaciones».
