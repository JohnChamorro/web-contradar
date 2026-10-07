# Despliegue de la web — runbook

**El orden fijo, en cada despliegue de contradar.com.co:**

```
build → deploy → purga de caché → indexnow
```

Ningún paso se salta y ninguno cambia de sitio. Con la regla «Cache Everything»
de Cloudflare (ver `paquete-seo-2026-10-07.md` §E12), el HTML viejo queda en el
borde hasta 4 h: sin purga, Bing y Google leen la versión anterior, y IndexNow lee
el sitemap viejo y no encuentra nada que enviar.

Actualizado el 7-oct-2026 (antes el envío era `scripts/indexnow.sh`, que mandaba
«lo que tenga lastmod de hoy»; ahora compara con el último envío).

---

## 1. Build (en tu PC, opcional pero recomendado)

Cloudflare Pages construye solo al recibir el push; este build local es para
ver los fallos antes de que lleguen allá.

```bash
cd ~/eulertech/web-contradar
npm run build && npm test
```

**Debe salir:** `43 page(s) built` (o el número que toque) y `# fail 0`. Las dos
advertencias `__VITE_PUBLIC_ASSET__… didn't resolve at build time` son de las
fuentes y salen siempre.

## 2. Deploy (en tu PC)

`main` es la rama de producción de Pages: el push **es** el despliegue.

```bash
cd ~/eulertech/web-contradar
git switch main
git merge --ff-only <rama>        # o git merge <rama> si no es fast-forward
git push origin main
```

Mira el despliegue: https://dash.cloudflare.com → **Workers & Pages** →
`web-contradar` → **Deployments**. El primero debe pasar a **Success** en 2-4
min. Mientras tanto, este vigilante da parte cada 30 s y sale solo cuando el
sitio publicado ya trae tu commit (el sitemap cambia de lastmod):

```bash
antes=$(curl -s https://contradar.com.co/sitemap-paginas-0.xml | md5sum)
for i in $(seq 1 20); do
  ahora=$(curl -s -H 'cache-control: no-cache' https://contradar.com.co/sitemap-paginas-0.xml | md5sum)
  [ "$ahora" != "$antes" ] && { echo "$(date +%T) PUBLICADO (sitemap nuevo)"; break; }
  echo "$(date +%T) todavía el sitemap anterior… ($i/20)"; sleep 30
done
```

Si el despliegue no cambia ninguna página de contenido (solo estilo o el marco
común), el sitemap no cambia y el bucle llega a 20 sin salir: es correcto, mira
**Deployments** para confirmar **Success**.

> Con la regla de caché ya activa, el vigilante puede ver el sitemap viejo
> hasta purgar. En ese caso, haz primero el paso 3 y vuelve a correrlo.

## 3. Purga de caché (en el dashboard de Cloudflare)

1. https://dash.cloudflare.com → zona **contradar.com.co** → **Caching** →
   **Configuration** → **Purge Cache**.
2. **Custom Purge** → **Hostname** → `contradar.com.co` → **Purge**. Si tu plan
   no muestra «Hostname», usa **Purge Everything** (también vacía la caché de
   `app.contradar.com.co`, que solo hace que sus archivos estáticos se vuelvan a
   pedir una vez: no rompe nada).
3. Comprueba que el borde ya sirve lo nuevo:

```bash
curl -sI https://contradar.com.co/ | grep -iE '^(HTTP|cf-cache-status|age)'
# primera vez tras purgar: cf-cache-status: MISS (o EXPIRED); la segunda: HIT
```

## 4. IndexNow (en tu PC)

```bash
cd ~/eulertech/web-contradar
npm run indexnow -- --seco     # mira qué enviaría
npm run indexnow               # envía
```

**Debe salir:**

```
IndexNow: el sitemap publicado tiene 40 URL.
Criterio: comparado con el envío del 2026-10-…: 0 nueva(s), 3 modificada(s).
Enviando 3 URL:
  https://contradar.com.co/guias/minima-cuantia/
  …
IndexNow respondió HTTP 200 para 3 URL (ok)
Listo: 3 URL enviadas.
```

- `HTTP 200` o `202` = bien. `403` = la clave no se sirve (revisa
  `https://contradar.com.co/6cd3f559f2eafbb26561dc2ce203cead.txt`); `422` = URL de
  otro host; `429` = demasiados envíos, espera una hora.
- «No hay páginas nuevas ni modificadas» justo después de un cambio de
  contenido = **no se purgó** o el despliegue no terminó. Vuelve al paso 3.
- El script comprueba la clave antes de enviar y **solo envía páginas HTML**
  (nunca .svg, .png, .css ni .js). Recuerda qué envió en
  `.indexnow/ultimo-envio.json` (fuera de git). La primera vez en una máquina
  sin ese archivo envía lo que tenga lastmod de los últimos 2 días; después,
  solo lo nuevo o cambiado.
- Otras formas: `--desde 2026-10-01`, `--todas` (todo el sitemap, para la
  primera vez o un cambio de dominio) o URLs sueltas al final.

**Qué NO se usa** (decisión del 7-oct): ni la Submission API de Bing ni la
Indexing API de Google. IndexNow ya cubre Bing y la de Google solo admite
ofertas de empleo y eventos en vivo. Para Google basta el sitemap con su
lastmod real: lo lee solo.

---

## Despliegue del paquete del 7-oct-2026

Dos ramas, **sin fusionar y sin subir**:

| Repo | Rama | Commits | Qué lleva |
|---|---|---|---|
| web-contradar | `seo/indexacion-oct7` | `7f8c093`, `d4ef136`, `15c2f38` | IndexNow nuevo, 301, migas, títulos de las guías, CTA del K, cookie de origen, texto de la política |
| contradar | `feat/polling-atribucion` (worktree `~/eulertech/contradar-seo`) | `ea2d023`, `154f33d` | polling de notificaciones e interruptor, `altas_prueba.atribucion` + migración `c7f2e1a12286`, columna «Origen» en Pruebas |

### Antes de nada: dos decisiones tuyas

1. **El texto de la cookie en la política de datos** (commit `15c2f38`, sección 6).
   La política decía «las únicas cookies que usamos son las técnicas…»; con la
   cookie de origen eso deja de ser cierto. **Si no lo apruebas, no publiques
   `d4ef136` tampoco**: la cookie sin el texto deja la política mintiendo.
2. **El orden de la migración frente a la de cuentas de cobro.** `c7f2e1a12286`
   (esta) y `eef24c18a6e7` (cuentas de cobro, rama `feat/cuenta-cobro`) cuelgan
   las dos de `e715cb669a21`. La que entre **segunda** a develop cambia su
   `down_revision` por la otra. Comprobarlo antes de subir:

   ```bash
   # en tu PC, ya fusionada en develop
   cd ~/eulertech/contradar/backend && .venv/bin/python -m alembic heads
   # debe salir UNA sola cabeza
   ```

### Orden

```
(1) App: fusionar y desplegar en el VPS   ← la API ya acepta `atribucion`
(2) Web: build → deploy → purga → indexnow (§1-§4)
```

La web publicada antes que la app no rompe nada (la API ignora el campo que no
conoce), pero las altas de ese intervalo se quedarían sin origen.

### (1) App

**En tu PC:**

```bash
cd ~/eulertech/contradar
git switch develop && git merge feat/polling-atribucion
git switch main && git merge develop
git push origin develop main
git worktree remove ../contradar-seo
```

**En el VPS:**

```bash
cd /root/contradar
git rev-parse HEAD | tee /root/commit_antes_atribucion
bash scripts/backup_core.sh
git pull origin main
docker compose -f docker-compose.prod.yml --env-file .env.production build backend web > /tmp/build_atrib.log 2>&1 &
while kill -0 $! 2>/dev/null; do echo "$(date +%T) construyendo… $(tail -1 /tmp/build_atrib.log | cut -c1-120)"; sleep 30; done
tail -3 /tmp/build_atrib.log
docker compose -f docker-compose.prod.yml --env-file .env.production up -d backend web
for i in $(seq 1 30); do
  s=$(docker inspect -f '{{.State.Health.Status}}' contradar-backend)
  echo "$(date +%T) backend: $s"; [ "$s" = healthy ] && break; sleep 5
done
docker exec contradar-postgres psql -U contradar -d contradar -Atc "select version_num from alembic_version;"
docker exec contradar-postgres psql -U contradar -d contradar -Atc "select count(*) from information_schema.columns where table_name='altas_prueba' and column_name='atribucion';"
```

**Debe salir:** `backend: healthy`, la revisión `c7f2e1a12286` (o la de cuentas
de cobro, si entró después y colgó de esta) y `1`. La migración corre sola al
arrancar el backend: es un `ADD COLUMN` nulo, sin reescribir la tabla, con
`lock_timeout` de 30 s.

Rollback: `git checkout $(cat /root/commit_antes_atribucion)` y reconstruir. La
columna puede quedarse: nada la lee en el código anterior.

### (2) Web

§1 → §4 de arriba, con `<rama>` = `seo/indexacion-oct7`. Después:

```bash
# en tu PC
curl -sI https://contradar.com.co/sitemap.xml | grep -iE '^(HTTP|location)'     # 301 → /sitemap-index.xml
curl -sI https://contradar.com.co/favicon.png | grep -iE '^(HTTP|location)'     # 301 → /favicon-48x48.png
curl -s https://contradar.com.co/guias/minima-cuantia/ | grep -o '<title>[^<]*'  # Mínima cuantía 2026: …
curl -s https://contradar.com.co/terminos/ | grep -c BreadcrumbList              # 1
```

### Prueba de punta a punta del origen

1. Ventana de incógnito → `https://contradar.com.co/precios/?utm_source=prueba&utm_medium=email`.
2. DevTools → **Application** → **Cookies** → `https://contradar.com.co`:
   debe estar `cr_atrib`, dominio `.contradar.com.co`, caduca en 90 días.
3. Pide una prueba con un correo tuyo (`+prueba-oct7`).
4. Panel de superadmin → **Pruebas**: la columna **Origen** dice **Correo**, con
   la fecha debajo; al pasar el ratón, `utm_source=prueba · utm_medium=email` y
   «Entró por: /precios/?utm_source=…».
5. Borra la prueba (interruptor de borrado → archivar → borrar).

### Polling, comprobar a la semana

Cloudflare → zona → **Analytics & Logs** → **HTTP Traffic** → filtro *Path*
`/api/v1/notifications` y luego `/api/v1/admin/borrado-permiso`. Lo esperado:
notificaciones de ~25.000/mes a menos de 7.000 (90 s en vez de 25 s, y nada con
la pestaña oculta); el permiso de borrado, de 1.260 a menos de 100.
