# Runbook manual de SEO — ContRadar

Para: John. Escrito el 2026-10-02 (fase 6 del plan SEO).
Lo que aquí aparece lo tienes que hacer tú: son pasos en paneles de terceros,
en el VPS o en producción, que el código no puede hacer por ti.

Convenciones:
- **Dónde**: URL exacta o ruta de menú. Los menús de Google y Cloudflare cambian
  de nombre con frecuencia. Si no encuentras uno, busca la palabra clave del paso.
- **(verificar)**: no pude confirmarlo en documentación oficial el 2-oct-2026.
  Compruébalo antes de confiar en ello.
- Cada dato de terceros lleva su fuente oficial, consultada el 2-oct-2026.
- Las rutas de menú de Google las cito como aparecen en la ayuda en inglés.
  La traducción española de la interfaz va entre comillas cuando la conozco;
  si no, va marcada (verificar).

---

## Índice

0. [Orden de despliegue y variables de entorno](#0-orden-de-despliegue-y-variables-de-entorno)
1. [Google Search Console](#1-google-search-console)
2. [Bing Webmaster Tools e IndexNow](#2-bing-webmaster-tools-e-indexnow)
3. [Checklist post-despliegue por fase](#3-checklist-post-despliegue-por-fase)
4. [Analítica: Umami autoalojado](#4-analítica-umami-autoalojado)
5. [Google Business Profile: conclusión](#5-google-business-profile-conclusión)
6. [Google Ads](#6-google-ads)
7. [Directorios de software](#7-directorios-de-software)
8. [Autoridad y enlaces (outreach)](#8-autoridad-y-enlaces-outreach)
9. [Prueba social](#9-prueba-social)
10. [LinkedIn de la empresa](#10-linkedin-de-la-empresa)
11. [Rutina de seguimiento](#11-rutina-de-seguimiento)
12. [Expectativas por horizonte](#12-expectativas-por-horizonte)
13. [Datos que tienes que correr en producción](#13-datos-que-tienes-que-correr-en-producción)

Hallazgos de esta revisión y su estado:

1. ~~El Dockerfile de la app no recibía `VITE_UMAMI_SRC` ni `VITE_UMAMI_ID`.~~
   **Resuelto en `seo/app`**: `frontend/Dockerfile` y `docker-compose.prod.yml`
   ya los pasan al build. Solo tienes que ponerlos en el `.env` de producción (§0.3).
2. **nginx vive dentro del contenedor `contradar-web`**, horneado desde
   `frontend/nginx.conf`. Para publicar `analitica.contradar.com.co` hay que
   añadir un `server` a ese archivo y reconstruir la imagen `web` (§4.4). No
   va en la rama: con el certificado aún sin emitir, nginx no arrancaría.
3. ~~Las frases de los datos de sector no coincidían con su consulta.~~
   **Resuelto**: ahora dicen «contratos firmados en SECOP II, por códigos
   UNSPSC, sin prestación de servicios», igual que la consulta. Agua y
   saneamiento ya no tiene dato propio (no hay vertical que medir).
4. **Hoy, en producción, el sitemap no trae `lastmod`** (`sitemap-0.xml`, versión
   anterior). Tras el despliegue tiene que llamarse `sitemap-paginas-0.xml` y
   traerlo. Si no lo trae, aplica el paso 1.6.

---

## 0. Orden de despliegue y variables de entorno

Sigue este orden; cada paso depende del anterior.

```
(1) Web seo/web → Cloudflare Pages   (incluye hotfix de CSP: alta inmediata de la prueba)
(2) App seo/app → VPS
(3) Umami en el VPS (§4)  →  variables PUBLIC_UMAMI_* en Pages y VITE_UMAMI_* en la app  →  redesplegar ambos
(4) Search Console + Bing + IndexNow (§1, §2)
(5) Checklist post-despliegue (§3)
```

### 0.1 Web: rama `seo/web` en Cloudflare Pages

**Qué hacer**

1. Confirma cuál es la rama de producción de Pages: dashboard de Cloudflare →
   **Workers & Pages** → proyecto `web-contradar` → **Settings** → **Builds &
   deployments** → *Production branch*. Lo esperado es `main` (verificar).
2. Opcional pero recomendado: haz push de `seo/web` y mira la vista previa que
   Pages genera para la rama. Su URL aparece en **Deployments**; el alias suele
   tener la forma `seo-web.web-contradar.pages.dev` (verificar).
   - En la vista previa, la alta de la prueba puede caer al respaldo si la API
     de la app solo acepta CORS desde `contradar.com.co`. Eso no es un fallo
     de la web. La prueba de humo de verdad se hace en el dominio.
3. Fusiona `seo/web` en `main` y haz push. Pages construye solo.

**Cuánto tarda**: el build tarda 1-3 min. Cada build tiene un tope de 20 min y
el plan gratuito permite 500 builds al mes
([límites de Pages](https://developers.cloudflare.com/pages/platform/limits/)).

**Cómo verificar (prueba de humo, en este orden)**

```bash
# a) La CSP nueva está en vivo (debe aparecer app.contradar.com.co en connect-src)
curl -sI https://contradar.com.co/ | grep -i content-security-policy | grep -o 'connect-src[^;]*'

# b) El sitemap nuevo existe y trae lastmod (ver §1.6 si da 0)
curl -s https://contradar.com.co/sitemap-index.xml
curl -s https://contradar.com.co/sitemap-paginas-0.xml | grep -o '<lastmod>' | wc -l

# c) La clave de IndexNow se sirve (debe imprimir la misma clave)
curl -s https://contradar.com.co/6cd3f559f2eafbb26561dc2ce203cead.txt

# d) La 301 de la guía renombrada
curl -sI https://contradar.com.co/guias/apps-para-licitaciones-colombia/ | grep -iE '^(HTTP|location)'
#   esperado: HTTP/2 301  +  location: /guias/mejores-apps-licitaciones-colombia/

# e) Una URL que no existe da 404 real
curl -s -o /dev/null -w '%{http_code}\n' https://contradar.com.co/no-existe/
```

**Prueba de humo del alta inmediata** (lo que arregla el hotfix
`fix(csp): permite app.contradar.com.co en connect-src`):

1. Abre `https://contradar.com.co/#solicitar` en una ventana de incógnito con
   las DevTools abiertas (pestañas **Console** y **Network**).
2. Llena el formulario con un correo de prueba tuyo, por ejemplo
   `tucorreo+prueba-20261002@…` si tu proveedor admite alias con `+`
   (verificar en Zoho).
3. En **Network** debe aparecer `POST https://app.contradar.com.co/api/v1/public/prueba/crear`
   con respuesta 2xx.
4. En **Console** no debe salir ningún error `Refused to connect … Content Security Policy`.
5. El navegador debe **entrar a la app** con la cuenta de prueba creada. Si ves
   el mensaje de respaldo («En breve creamos tu prueba»), la llamada falló:
   revisa el paso (a) y la consola.
6. Borra la cuenta de prueba desde la administración de la app, o déjala vencer
   (7 días).

### 0.2 App: rama `seo/app` en el VPS

> **Cambios de la app (rama `seo/app`, detalle en `docs/seo/informe-final.md`)**
> - `frontend/public/robots.txt`: bloquea solo `/api/`; el `noindex` de cada página se sigue leyendo.
> - Tokens y loaders sincronizados (Manrope en `--font-display`/`--font-body`; el título del loader dejaba de salir en Arial) y bloque de pagos con el rótulo en `grafito-500` (contraste AA).
> - Evento `diagnostico_completado` con Umami (`frontend/src/lib/analitica.ts`), variables `VITE_UMAMI_SRC`/`VITE_UMAMI_ID` en `frontend/Dockerfile` y `docker-compose.prod.yml`, CSP de nginx con `analitica.contradar.com.co`.
> - Textos del muro de cupo del diagnóstico (sigue siendo solicitud manual): sin «en breve» ni exclamaciones.
> - Capacidad residual: cita del anticipo (Ley 80 art. 40 parágrafo), origen de la CO mínima (umbral Mipyme de CCE) y CT = «socios y profesionales vinculados», con su ayuda en el perfil del licitante.
> - Términos §2 y §3 con el alta inmediata de la prueba (igual que la web).
> - Exportador del snapshot de la web (`backend/scripts/exportar_snapshot_web.py`), que se corre en DEV (`docs/operacion/snapshot-web.md`).

Despliégala con tu procedimiento de siempre (`docs/operacion/despliegue.md`
del repo `contradar`). Después verifica:

```bash
curl -s https://app.contradar.com.co/robots.txt | head -5       # texto, no el HTML del SPA
curl -sI https://app.contradar.com.co/ | grep -i content-security-policy | grep -o 'analitica[^ ;]*'
```

### 0.3 Variables de entorno nuevas

**Cloudflare Pages (web)**

Dónde: **Workers & Pages** → `web-contradar` → **Settings** → **Variables and
Secrets** → *Add*. Pon cada variable en **Production** (y en **Preview** solo si
quieres medir las vistas previas, cosa que no conviene). Fuente:
[configuración de builds de Pages](https://developers.cloudflare.com/pages/configuration/build-configuration/).

| Variable | Valor | Cuándo |
|---|---|---|
| `PUBLIC_UMAMI_SRC` | `https://analitica.contradar.com.co/script.js` | cuando Umami responda (§4) |
| `PUBLIC_UMAMI_ID` | el *Website ID* de Umami (UUID) | ídem |
| *(fase 3)* `SNAPSHOT_URL` | URL de lectura del `entidades.json.gz` en R2: con dominio propio del bucket (p. ej. `https://datos.contradar.com.co/web/actual/entidades.json.gz`) o la URL pública `r2.dev` del bucket | cuando subas el primer snapshot (`docs/operacion/snapshot-web.md` del repo contradar) |
| *(fase 3, opcional)* `SNAPSHOT_TOKEN` | solo si pones el bucket detrás de Cloudflare Access o una regla WAF: se manda como `Authorization: Bearer …` | ídem |
| *(fase 3, después)* `INDEXAR_SECTOR_DEPTO` | `1` — abre a Google las páginas `/licitaciones/<sector>/<departamento>/` | tras 4-6 semanas midiendo la tanda 1 de entidades (§11) |

> El snapshot contiene lo mismo que las páginas publican (sin personas
> naturales ni datos de contacto): no es secreto, por eso basta una URL de
> lectura. Lo descarga `scripts/descargar-snapshot.mjs` en el `prebuild`; sin
> la variable, el sitio se construye igual, sin páginas de entidad.

- Las `PUBLIC_*` se hornean en el HTML durante el build. Después de crearlas,
  lanza un despliegue nuevo: **Deployments** → último despliegue de producción →
  **Retry deployment**, o un push. La documentación no lo dice explícitamente
  (verificar), pero así funciona Astro.
- Para SUBIR el snapshot desde tu equipo necesitas un token de R2 con
  permiso de escritura en ese bucket (la web solo lee por URL): R2 →
  **Manage API tokens** → **Object Read & Write**, limitado al bucket del
  snapshot. El *Secret Access Key* se muestra una sola vez. Fuentes:
  [tokens de R2](https://developers.cloudflare.com/r2/api/tokens/) ·
  [crear buckets](https://developers.cloudflare.com/r2/buckets/create-buckets/)
  (los buckets son privados por defecto).
- Límite que importa para la fase 3: 20.000 archivos por sitio en el plan
  gratuito ([límites](https://developers.cloudflare.com/pages/platform/limits/)).

**App (VPS)**

| Variable | Valor |
|---|---|
| `VITE_UMAMI_SRC` | `https://analitica.contradar.com.co/script.js` |
| `VITE_UMAMI_ID` | el **mismo** *Website ID* que la web (un solo sitio en Umami para todo el embudo) |

Ya están declaradas en `frontend/Dockerfile` y `docker-compose.prod.yml`
(rama `seo/app`). Añádelas al `.env` de producción del VPS y reconstruye la
imagen `web` con tu procedimiento de despliegue, por ejemplo:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build web
```

**Verificar**: en `https://app.contradar.com.co/diagnostico`, abre DevTools →
**Network**. Debe cargarse `analitica.contradar.com.co/script.js`, y al
terminar un diagnóstico debe salir un `POST …/api/send`.

---

## 1. Google Search Console

### 1.1 Comprobar que la propiedad ya está verificada

La propiedad **de dominio** `contradar.com.co` está verificada por un registro
TXT de DNS. No hay meta ni archivo `google*.html` en el repo, y no hace falta.
El DNS está en Cloudflare: lo confirman los nameservers
(`alberto.ns.cloudflare.com`, `braelyn.ns.cloudflare.com`) y la doc de despliegue
de la app.

```bash
dig +short TXT contradar.com.co
# debe incluir: "google-site-verification=sGEOTwPxlKQcmiw3UliSlgUPZkjfuGC-5mPet1hi_-I"
```

- **Dónde**: https://search.google.com/search-console → selector de propiedad
  → `contradar.com.co` (icono de dominio, sin `https://`) → **Settings** →
  **Ownership verification** («Configuración» → «Verificación de la propiedad»
  (verificar)). Debe salir tu usuario como propietario verificado con el método
  «DNS TXT record».
- **Si no aparece**: no borres el TXT. Google tarda hasta 2-3 días en ver un TXT
  nuevo ([verificación](https://support.google.com/webmasters/answer/9008080)).
- Al ser de dominio, la propiedad cubre ápex, `www`, `app.`, `http` y `https`.

### 1.2 Enviar el sitemap

- **Dónde**: propiedad → **Sitemaps** → *Add a new sitemap* («Agregar un
  sitemap nuevo»).
- **Valor**: `https://contradar.com.co/sitemap-index.xml`. En el campo puede ir
  solo `sitemap-index.xml`.
- Si aparece un `sitemap-0.xml` viejo, quítalo: el nombre nuevo del hijo es
  `sitemap-paginas-0.xml` y el índice ya apunta a él.
- **Verificar**: el estado debe ser **Success**. *Couldn't fetch* significa que
  Google no pudo descargarlo; *Has errors* significa que lo leyó parcialmente
  ([informe de Sitemaps](https://support.google.com/webmasters/answer/7451001)).
- **Cuánto tarda**: la lectura del sitemap, horas o días. El rastreo de lo que
  lista, «de unos días a unas semanas»
  ([pedir un nuevo rastreo](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl)).
- En la fase 3 aparecerán `sitemap-entidades-N.xml` dentro del mismo índice. No
  hay que reenviar nada: el índice los incluye.

### 1.3 Inspección de URL + Solicitar indexación (lista priorizada)

- **Dónde**: barra superior de Search Console → pega la URL → **Request
  indexing** («Solicitar indexación»).
- Hay **cuota diaria por propiedad** y Google no publica la cifra. Pedirlo dos
  veces no acelera nada. Si llegas a la cuota, sigue al día siguiente con la
  lista ([inspección de URL](https://support.google.com/webmasters/answer/9012289)).
- Pedirlo no garantiza la indexación. Google dice que suele tardar «un día o
  así», pero puede tomar «una o dos semanas».
- Antes de pedir, mira el resultado de **Test live URL**: que no diga
  «noindex», que el canonical sea la misma URL (con barra final) y que la
  página se pueda rastrear.

Hazlo en este orden. Son 27 URLs: probablemente necesitarás 2-3 días.

| # | URL |
|---|---|
| 1 | https://contradar.com.co/ |
| 2 | https://contradar.com.co/precios/ |
| 3 | https://contradar.com.co/licitaciones-colombia/ |
| 4 | https://contradar.com.co/diagnostico/ |
| 5 | https://contradar.com.co/herramientas/calculadora-capacidad-residual/ |
| 6 | https://contradar.com.co/guias/mejores-apps-licitaciones-colombia/ |
| 7 | https://contradar.com.co/guias/capacidad-residual/ |
| 8 | https://contradar.com.co/guias/minima-cuantia/ |
| 9 | https://contradar.com.co/guias/como-calcular-la-oferta-economica/ |
| 10 | https://contradar.com.co/guias/como-ganar-una-licitacion/ |
| 11 | https://contradar.com.co/guias/que-es-el-rup/ |
| 12 | https://contradar.com.co/guias/requisitos-habilitantes/ |
| 13 | https://contradar.com.co/guias/seleccion-abreviada/ |
| 14 | https://contradar.com.co/guias/secop-i-vs-secop-ii/ |
| 15 | https://contradar.com.co/guias/consorcios-y-uniones-temporales/ |
| 16 | https://contradar.com.co/guias/poliza-de-seriedad-de-la-oferta/ |
| 17 | https://contradar.com.co/sectores/ |
| 18 | https://contradar.com.co/sectores/construccion/ |
| 19 | https://contradar.com.co/sectores/ingenieria-e-interventoria/ |
| 20 | https://contradar.com.co/sectores/salud/ |
| 21 | https://contradar.com.co/sectores/tecnologia-y-telecomunicaciones/ |
| 22 | https://contradar.com.co/sectores/agua-y-saneamiento/ |
| 23 | https://contradar.com.co/alternativas/ |
| 24 | https://contradar.com.co/alternativas/licitaciones-info/ |
| 25 | https://contradar.com.co/alternativas/fromus/ |
| 26 | https://contradar.com.co/alternativas/licitia/ |
| 27 | https://contradar.com.co/guias/ (índice) |

Las URLs 7-16 son las 10 guías nuevas de `src/data/guias.ts`. Las que ya existían
(`como-buscar-licitaciones-en-secop`, `que-es-el-paa`) no hace falta pedirlas:
basta el sitemap.

### 1.4 Leer los informes

**Páginas** (Indexing → **Pages**,
[ayuda](https://support.google.com/webmasters/answer/7440203))
- Compara *Indexed* con lo enviado: filtra por sitemap con el selector de
  arriba (*All submitted pages*, o el `sitemap-paginas-0.xml`).
- **Crawled – currently not indexed** («Rastreada: actualmente sin indexar»
  (verificar etiqueta)). Google dice que la página «puede o no indexarse en el
  futuro» y que **no hace falta reenviarla**. Qué hacer:
  1. No pidas indexación una y otra vez.
  2. Si es una guía o sector: mejora lo que la hace distinta (dato propio de §13,
     ejemplo resuelto, tabla) y súmale enlaces internos desde páginas que ya
     estén indexadas (pilar, home, otras guías).
  3. Si es una página de entidad (fase 3) y hay muchas así, es la señal del
     diseño (§6 de `diseno-programatico.md`): **no abras la tanda 2**;
     enriquece la plantilla.
  4. Pasadas 4-6 semanas tras la mejora, vuelve a pedir la indexación una sola vez.
- *Discovered – currently not indexed*: Google aplazó el rastreo. Es normal en
  un sitio nuevo. Espera.
- *Excluded by 'noindex'*: esperado solo en las entidades bajo el umbral de la
  fase 3. `/terminos/` y `/politica-de-datos/` están fuera del sitemap pero
  **sin** noindex: si aparecen aquí, algo cambió.
- *Page with redirect*: esperado para `/guias/apps-para-licitaciones-colombia/`.

**Rendimiento** (**Performance** → *Search results*,
[ayuda](https://support.google.com/webmasters/answer/7576553))
- Métricas: clics, impresiones, CTR y posición media. Pestañas: *Queries*,
  *Pages*, *Countries*, *Devices*.
- Guarda 16 meses. Los últimos días son preliminares (línea punteada).
- Para medir la marca: filtro *Query* → contiene `contradar`.
- Para medir el resto: *Query* → **no** contiene `contradar`.

**Core Web Vitals** (Experience → **Core Web Vitals**,
[ayuda](https://support.google.com/webmasters/answer/9205520))
- Umbrales «bueno», medidos en el percentil 75 de usuarios reales: **LCP ≤ 2,5 s,
  INP ≤ 200 ms, CLS ≤ 0,1** ([web.dev](https://web.dev/articles/vitals)).
- Con poco tráfico verás «No data available». Es normal: el informe necesita
  datos suficientes de CrUX. Mientras tanto, usa PageSpeed Insights (§3).

### 1.5 Cuánto tarda cada cosa

| Acción | Se refleja en |
|---|---|
| Sitemap leído | horas a días |
| URL inspeccionada e indexada | un día a 1-2 semanas |
| Informe de Páginas actualizado | días (va con retraso) |
| Rendimiento con datos | 2-3 días de retraso |
| Core Web Vitals | semanas, solo si hay tráfico suficiente |

### 1.6 Comprobar que el sitemap trae `lastmod`

`scripts/lastmod.mjs` saca la fecha del último commit que tocó cada página. Si
el clon de Git del build es superficial, no hay historia y las URLs salen **sin
`lastmod`**. Es a propósito: es mejor ningún dato que uno falso. A Google le
sirve el `lastmod` solo si es «consistente y verificablemente» exacto; ignora
`priority` y `changefreq`
([construir un sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)).

```bash
curl -s https://contradar.com.co/sitemap-paginas-0.xml | grep -o '<lastmod>[^<]*' | head
```

**Si da 0 resultados:**
- La documentación oficial de Pages no habla de clon superficial ni ofrece una
  opción de profundidad (verificar)
  ([build image](https://developers.cloudflare.com/pages/configuration/build-image/)).
- La solución que circula en el foro de Cloudflare es completar la historia en
  el propio comando de build. Es comunidad, no documentación oficial:
  [hilo 1](https://community.cloudflare.com/t/shallow-clone-of-git-repo/297243),
  [hilo 2](https://community.cloudflare.com/t/git-last-modified-front-matter-attribute-not-respected-with-11ty/408853).
- **Dónde**: **Settings** → **Builds & deployments** → *Build configuration* →
  **Build command**.
- **Valor** (reemplaza `npm run build`):

```bash
if [ "$(git rev-parse --is-shallow-repository)" = "true" ]; then git fetch --unshallow || true; fi; npm run build
```

- Si el `fetch` falla (por ejemplo, por credenciales), el build sigue igual y el
  sitemap sale sin `lastmod`, como hoy. No se rompe nada.
- **Verificar**: en el log del build no debe aparecer un error de `git`, y el
  `curl` de arriba debe devolver fechas.
- Ojo: Cloudflare migró la imagen de build v1 a la v3 el 15-sep-2026 (fuente:
  la misma página de build image). Si el build falla por la versión de Node,
  fija `NODE_VERSION` en las variables.

---

## 2. Bing Webmaster Tools e IndexNow

### 2.1 Importar desde Search Console

- **Dónde**: https://www.bing.com/webmasters → inicia sesión → **My Sites** →
  **Import** → entra con la cuenta de Google de Search Console → *Allow* →
  marca `contradar.com.co` → **Import**.
- **Qué se importa**: el sitio (queda verificado sin hacer nada más), sus
  sitemaps y los usuarios. Bing revisa de vez en cuando que el acceso a GSC
  siga vigente: si lo revocas, tendrás que verificar por otro método. Los datos
  de tráfico pueden tardar hasta 48 h. Fuente: [blog oficial de Bing
  Webmaster](https://blogs.bing.com/webmaster/september-2019/Import-sites-from-Search-Console-to-Bing-Webmaster-Tools).

### 2.2 Sitemap

- **Dónde**: **Sitemaps** → *Submit sitemap*.
- **Valor**: `https://contradar.com.co/sitemap-index.xml`.
- Bing lo descarga al enviarlo y luego lo relee periódicamente. También lo lee
  de `robots.txt`, que ya lo declara.

### 2.3 IndexNow

Google **no** participa en IndexNow. Sí participan Bing, Yandex, Seznam, Naver,
Yep y Amazon, y lo que se envía a uno se comparte con todos
([FAQ de IndexNow](https://www.indexnow.org/faq)).

- La clave ya está en el repo: `public/6cd3f559f2eafbb26561dc2ce203cead.txt`.
  Cumple el formato: 8-128 caracteres, alfanuméricos y guiones
  ([documentación](https://www.indexnow.org/documentation)).
- **Primera vez** (después del despliegue de §0.1, cuando el `curl` (c) devuelva
  la clave):

```bash
cd ~/eulertech/web-contradar
npm run indexnow -- --todas
```

- **Después de cada despliegue** (orden completo en `despliegue-web.md`: build → deploy → purga → indexnow):

```bash
npm run indexnow                       # lo nuevo o cambiado desde el último envío (después de purgar la caché)
npm run indexnow -- --desde 2026-10-01    # si desplegaste hace días
npm run indexnow -- https://contradar.com.co/precios/   # URLs concretas
```

  Sin `lastmod` en el sitemap (§1.6), solo funcionan `--todas` o las URLs a mano.

- **Respuestas**: `200` = recibido. `202` = recibido, con la clave pendiente de
  validar (normal la primera vez). `403` = clave no encontrada en el dominio
  (¿se desplegó el `.txt`?). `422` = URL de otro host. `429` = demasiados
  envíos. Máximo 10.000 URLs por envío
  ([documentación](https://www.indexnow.org/documentation)).
- **Verificar en Bing**: **IndexNow** en el menú lateral. Muestra las URLs
  enviadas, rastreadas e indexadas y el detalle de las últimas 1.000 (verificar
  el nombre exacto del menú). Fuente: [IndexNow Insights, blog de
  Bing](https://blogs.bing.com/webmaster/March-2024/Optimize-your-Impact-with-IndexNow-Insights).
- **Cuánto tarda**: Bing suele rastrear lo enviado por IndexNow en horas o
  pocos días (verificar; no hay cifra oficial).

---

## 3. Checklist post-despliegue por fase

Hazlo después de **cada** despliegue a producción. Marca con una ✔.

### Siempre (cualquier fase)

- [ ] Los `curl` de §0.1 (a-e) dan lo esperado.
- [ ] `npm run indexnow` (o `--todas` la primera vez) responde 200/202.
- [ ] Search Console → Sitemaps: *Success* y la fecha de *Last read* reciente.
- [ ] PageSpeed Insights (https://pagespeed.web.dev) en **móvil** para `/` y la
      página que cambió:
      - **LCP < 2,5 s**, **CLS < 0,1**, INP ≤ 200 ms.
      - Mira primero los datos de campo (usuarios reales de CrUX, 28 días). Si no
        hay, usa los de laboratorio (Lighthouse, simulación)
        ([acerca de PSI](https://developers.google.com/speed/docs/insights/v5/about)).
      - Referencia local antes del despliegue: home móvil LCP 3,1 s, sin
        compresión (`diagnostico-seo-2026-10.md` §5). Si en producción, con
        brotli, sigue > 2,5 s, la causa probable es `caras.css` (render-blocking).
- [ ] Rich Results Test (https://search.google.com/test/rich-results) y
      Schema Markup Validator (https://validator.schema.org/): 0 errores
      ([herramientas de datos estructurados](https://developers.google.com/search/docs/appearance/structured-data)).

### Fase 1 — técnico

- [ ] Inspeccionar `/` y `/precios/`.
- [ ] Rich Results en `/`: Organization, WebSite, SoftwareApplication con un
      Offer por plan y FAQPage. En `/precios/` los tres planes con sus periodos.
- [ ] `https://contradar.com.co/precios` (sin barra) redirige con 308 a `/precios/`.
- [ ] `/terminos/` y `/politica-de-datos/` **no** están en el sitemap, pero cargan.

### Fase 2 — contenido

- [ ] Inspeccionar las 10 guías, `/licitaciones-colombia/`, `/sectores/` y sus
      5 páginas, `/alternativas/` y sus 3, y la calculadora (URLs 3-27 de §1.3).
- [ ] Rich Results en 2 guías al azar: Article + BreadcrumbList (+ FAQPage si
      la guía la lleva).
- [ ] **301**:
      `curl -sI https://contradar.com.co/guias/apps-para-licitaciones-colombia/`
      → `301` y `location: /guias/mejores-apps-licitaciones-colombia/`. Lo mismo
      sin barra final. Un solo salto: comprueba con
      `curl -sIL … | grep -i ^HTTP` que solo aparezca un `301` y luego un `200`.
- [ ] Search Console → Inspección de la URL vieja: «Page with redirect». La
      nueva, indexable.
- [ ] La calculadora K calcula en móvil, y en Umami aparece `calculadora_k_usada`
      (cuando §4 esté listo).

### Fase 3 — programático (cuando la apruebes)

- [ ] El build descargó el snapshot (log de Pages) y el número de archivos
      quedó por debajo de 20.000.
- [ ] Aparece `sitemap-entidades-0.xml` en el índice. Search Console →
      Páginas → filtra por ese sitemap → apunta *enviadas* e *indexadas*.
- [ ] Inspeccionar 5 entidades de la tanda 1 (las de más valor) y 1 bajo el
      umbral: esta debe decir «Excluded by noindex».
- [ ] Rich Results en una entidad: WebPage + GovernmentOrganization +
      BreadcrumbList + FAQPage.
- [ ] `npm run indexnow -- --desde <fecha del snapshot>`.

### Fase 4 — conversión

- [ ] `/diagnostico/` indexable. Con un NIT real lleva a la app con
      `utm_medium=diagnostico`.
- [ ] Umami → Realtime/Events: `diagnostico_iniciado`, `prueba_solicitada`
      (`via=app`), `whatsapp_click`, `precio_plan_click` y, desde la app,
      `diagnostico_completado`.
- [ ] La prueba de humo del alta (§0.1) da `via=app`, no `respaldo`.

---

## 4. Analítica: Umami autoalojado

Por qué Umami y no GA4: `docs/seo/embudo.md`. En resumen, no usa cookies ni
guarda la IP, así que no necesitas banner y no rompe lo que promete
`/politica-de-datos/`. Umami lo dice así: «does not use any cookies»; la IP
«is never stored» ([FAQ](https://docs.umami.is/docs/faq),
[definiciones](https://docs.umami.is/docs/metric-definitions)).

**Recursos**: el VPS tiene 7 GB de RAM. El contenedor Node de Umami ocupa unos
150-250 MB (estimación propia; Umami no publica requisitos de RAM (verificar)).
Le pongo un tope de 512 MB para que nunca compita con Postgres.

**Versión**: la vigente es **Umami v3** (3.4.0 en `master`). La imagen oficial
es `ghcr.io/umami-software/umami:latest`, la del `docker-compose.yml` del repo.
- La doc de instalación todavía nombra el tag `postgresql-latest`, que es de la
  v2: no lo uses.
- Requiere **PostgreSQL ≥ 12.14**; el tuyo es pg16.
- Fuentes: [docker-compose.yml](https://github.com/umami-software/umami/blob/master/docker-compose.yml) ·
  [instalación](https://docs.umami.is/docs/install).

### 4.1 Base de datos y usuario propios en el Postgres existente

En el VPS (el contenedor de Postgres es `contradar-postgres`; el superusuario es
el `POSTGRES_USER` de tu `.env.production`):

```bash
# Genera una contraseña y guárdala en tu gestor
openssl rand -hex 24

docker exec -it contradar-postgres psql -U <POSTGRES_USER> -d postgres
```

```sql
CREATE ROLE umami LOGIN PASSWORD '<la contraseña generada>';
CREATE DATABASE umami OWNER umami;
-- Que solo su dueño (umami) y el superusuario entren a la base umami:
REVOKE CONNECT ON DATABASE umami FROM PUBLIC;
\q
```

Sintaxis: [CREATE ROLE](https://www.postgresql.org/docs/current/sql-createrole.html) ·
[CREATE DATABASE](https://www.postgresql.org/docs/current/sql-createdatabase.html).

El rol `umami` no tiene permisos sobre las tablas de `contradar`, porque nadie se
los dio. Si quieres cerrar también la conexión a esa base, revisa antes qué
roles dependen de `CONNECT` vía `PUBLIC` (verificar). No lo hagas a ciegas.

### 4.2 Contenedor

La red de Docker del stack de producción es `contradar_default` (el proyecto se
llama `contradar` y no declara redes propias). Confírmalo con
`docker network ls | grep contradar`.

```bash
APP_SECRET=$(openssl rand -hex 32)   # guárdalo: si cambia, se cierran las sesiones

docker run -d --name contradar-umami \
  --network contradar_default \
  --restart always \
  --memory 512m \
  --log-opt max-size=10m --log-opt max-file=3 \
  -e DATABASE_URL='postgresql://umami:<contraseña>@contradar-postgres:5432/umami' \
  -e APP_SECRET="$APP_SECRET" \
  ghcr.io/umami-software/umami:latest
```

- Sin `-p`: Umami solo se publica a través de nginx.
- `DATABASE_URL` es la única variable obligatoria
  ([variables](https://docs.umami.is/docs/environment-variables)).
- Las tablas se crean solas en el primer arranque: el arranque Docker corre
  `prisma migrate deploy` ([check-db.js](https://raw.githubusercontent.com/umami-software/umami/master/scripts/check-db.js)).
- Puerto interno: 3000.
- Cuando funcione, fija la versión: cambia `:latest` por el tag que veas en
  `docker inspect contradar-umami | grep -i version`, o por el del release.
  Así una actualización no te cambia el esquema sin avisar.

**Verificar**:

```bash
docker logs --tail 50 contradar-umami        # migraciones aplicadas, "ready" / listening on 3000
docker exec contradar-web wget -qO- http://contradar-umami:3000/api/heartbeat   # (verificar ruta) debe responder
docker stats --no-stream contradar-umami     # RAM real
```

Mejor a mediano plazo: pasa este servicio a `docker-compose.prod.yml`, para que
viva con el resto del stack.

### 4.3 DNS en Cloudflare

- **Dónde**: dashboard de Cloudflare → zona `contradar.com.co` → **DNS** →
  **Records** → *Add record*.
- **Valor**: tipo `A`, nombre `analitica`, IPv4 = la IP del VPS (la misma del
  registro `app`). **Proxy: DNS only (gris)** mientras emites el certificado,
  igual que hiciste con `app` (`docs/operacion/despliegue.md`).
- **Verificar**: `dig +short analitica.contradar.com.co` → la IP del VPS.
- **Cuánto tarda**: minutos.

### 4.4 nginx (dentro de `contradar-web`) y certificado

nginx está horneado en la imagen `web` desde `frontend/nginx.conf`. Son tres
pasos.

**a) Bloque en `:80` para el reto ACME.** En `frontend/nginx.conf`, añade
`analitica.contradar.com.co` al `server_name` del server `:80` que ya existe:

```nginx
server_name app.contradar.com.co analitica.contradar.com.co;
```

Reconstruye (`up -d --build web`) y emite el certificado con tu mismo
procedimiento:

```bash
docker compose -f docker-compose.prod.yml run --rm --entrypoint certbot certbot \
  certonly --webroot -w /var/www/certbot \
  -d analitica.contradar.com.co --email cfjohneuler@gmail.com --agree-tos --no-eff-email
```

**b) Server `:443`.** Añádelo al final de `frontend/nginx.conf`:

```nginx
server {
    listen 443 ssl;
    http2 on;
    server_name analitica.contradar.com.co;

    ssl_certificate     /etc/letsencrypt/live/analitica.contradar.com.co/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/analitica.contradar.com.co/privkey.pem;

    # Resolver de Docker + variable: si Umami está caído, nginx ARRANCA igual
    # (con proxy_pass fijo, un upstream que no resuelve tumba todo el edge,
    # app incluida).
    resolver 127.0.0.11 valid=30s;
    set $umami http://contradar-umami:3000;

    location / {
        proxy_pass $umami;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

- La CSP global del archivo también se aplica a este server. Si el panel de
  Umami se ve en blanco, añade en este `server` un `add_header
  Content-Security-Policy` propio, más laxo. Ojo: en nginx, un `add_header` en
  el `server` anula todos los heredados (lo explica el comentario del propio
  archivo), así que repite allí los que quieras conservar.
- Si `http2 on;` falla por la versión de nginx, usa `listen 443 ssl http2;`.
- Umami lee la IP real de `CF-Connecting-IP` o `X-Real-IP`
  ([ip.ts](https://github.com/umami-software/umami/blob/master/src/lib/ip.ts)).
  Con eso salen bien los países, y la IP no se guarda.
- CORS: Umami ya responde `Access-Control-Allow-Origin: *` en `/script.js` y
  `/api/*` ([next.config.ts](https://github.com/umami-software/umami/blob/master/next.config.ts)).
  No hace falta nada más.

**c) Reconstruir y renovar.**

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build web
curl -sI https://analitica.contradar.com.co/script.js | head -3   # 200
```

Tu cron de renovación (`certbot renew`) ya cubre el certificado nuevo.

### 4.5 Primer acceso y sitio

1. Entra a `https://analitica.contradar.com.co`. El usuario inicial es **admin /
   umami** ([instalación](https://docs.umami.is/docs/install)). **Cambia la
   contraseña ya**: Settings → Profile (verificar ruta).
2. **Websites → Add website** ([añadir sitio](https://docs.umami.is/docs/add-a-website)):
   - *Name*: `ContRadar`
   - *Domain*: `contradar.com.co`. Este campo sirve para filtrar tus propios
     referentes. Un solo sitio cubre web y app.
3. **Edit → Tracking code**: copia el `data-website-id` (UUID)
   ([recoger datos](https://docs.umami.is/docs/collect-data)). Ese es el valor
   de `PUBLIC_UMAMI_ID` y de `VITE_UMAMI_ID`.
4. **No pegues el snippet en ningún HTML.** La web lo inyecta desde
   `Base.astro` y la app desde `frontend/src/lib/analitica.ts`, ya con
   `data-domains`:
   - web: `contradar.com.co`
   - app: `contradar.com.co,app.contradar.com.co`

   `data-domains` limita el tracker a esos hosts
   ([configuración del tracker](https://docs.umami.is/docs/tracker-configuration)).
5. Pega los IDs en Pages y en `.env.production` (§0.3) y redespliega ambos.

**Que web y app compartan un mismo sitio** (mismo `data-website-id` en dos
subdominios) lo confirman los mantenedores en GitHub, no la doc
([discusión 2869](https://github.com/umami-software/umami/discussions/2869)).
Es parcialmente verificado: la doc de métricas aún dice que la sesión incluye
el hostname. Si en Umami no ves pasar la misma visita de la web a la app, el
embudo se mide por eventos (que es lo que importa) y no por sesión.

### 4.6 Verificar eventos en tiempo real

**Ojo**: los dos trackers llevan `data-do-not-track="true"`. Si tu navegador
envía *Do Not Track* (o usa una extensión que bloquea analítica), **no verás
tus propias pruebas**. Para probar, usa un perfil limpio de Chrome sin
extensiones.

1. En Umami abre el sitio → **Realtime** (verificar nombre de la vista).
2. En otra pestaña, en `https://contradar.com.co/`:
   - [ ] Escribe un NIT en el hero → `diagnostico_iniciado` (`origen=home`)
   - [ ] Termina el diagnóstico en la app → `diagnostico_completado` (`con_historial`)
   - [ ] Clic en WhatsApp → `whatsapp_click`
   - [ ] Clic en el botón de un plan en `/precios/` → `precio_plan_click` (`plan`)
   - [ ] Usa la calculadora K → `calculadora_k_usada`
   - [ ] Formulario `#solicitar` → `prueba_solicitada` (`via=app`)
3. **Events** → pestaña *Properties*: ahí ves los datos de cada evento
   ([eventos](https://docs.umami.is/docs/track-events)).

### 4.7 Conversiones (Goals y Funnel)

Umami tiene informes **Goals**, **Funnel**, **Journey**, **Attribution** y
**UTM** ([docs](https://docs.umami.is/docs)).

- **Reports → Goals** ([goals](https://docs.umami.is/docs/goals)), tipo
  *Triggered event*:
  1. `prueba_solicitada` — **principal**
  2. `diagnostico_completado` — secundaria
  3. `precio_plan_click` y `whatsapp_click` — intención de venta asistida
- **Reports → Funnel** ([funnel](https://docs.umami.is/docs/funnel)):
  1. Paso 1: página vista `/`, o la página de entrada que quieras analizar.
  2. Paso 2: evento `diagnostico_iniciado`.
  3. Paso 3: evento `diagnostico_completado`.
  4. Paso 4: evento `prueba_solicitada`.

  Ventana: 60 min.
- **Reports → Attribution** ([attribution](https://docs.umami.is/docs/attribution)):
  conversión = `prueba_solicitada`, modelo *Last-Click*. Ahí ves qué
  `utm_source` y `utm_campaign` traen pruebas.
- El pago (paso 5 del embudo) se mide en la app, no en Umami.

---

## 5. Google Business Profile: conclusión

**No conviene, y además no es elegible. No lo crees.**

Lo que dice Google:
- «Para tener un perfil, el negocio debe tener **contacto en persona con los
  clientes** durante su horario». Entre los **no elegibles** están los
  «negocios solo en línea» (*online-only businesses*)
  ([elegibilidad](https://support.google.com/business/answer/13763036?hl=en)).
- El negocio debe tener un local que los clientes puedan visitar, o ir donde
  el cliente ([directrices](https://support.google.com/business/answer/3038177?hl=en)).
- Un negocio de área de servicio que trabaja desde casa puede ocultar la
  dirección, pero solo si **va a donde el cliente**. El área no debe pasar de
  unas 2 horas de manejo desde la base
  ([área de servicio](https://support.google.com/business/answer/9157481?hl=en)).
- La verificación por video exige mostrar el local o la señalización. Para un
  área de servicio, vehículos o herramientas con marca
  ([verificación por video](https://support.google.com/business/answer/14271705?hl=en)).

ContRadar es un SaaS que se usa en el navegador, para clientes de todo el país,
sin visitas ni desplazamientos. Encaja en «solo en línea». Registrar tu casa en
Popayán violaría las directrices y arriesga la suspensión del perfil.

**Excepción**: si algún día **vendes y capacitas en persona** como servicio
regular (por ejemplo, talleres en sedes de clientes de Cauca y Valle con horario
publicado), podrías evaluar un perfil de área de servicio, con la dirección
oculta, para ese servicio. Hoy no aplica.

La señal local que sí te sirve es la que ya existe: `PostalAddress` (Popayán,
Cauca) en el JSON-LD de `Organization`, las fichas de directorio (§7) y las
menciones de la Cámara de Comercio del Cauca (§8).

---

## 6. Google Ads

Objetivo: comprar clics de intención comercial mientras el SEO madura. Nada
informacional («qué es el RUP»): eso lo cubre el SEO gratis.

### 6.1 Configuración de cuenta (una vez)

- Moneda **COP** y zona horaria **Bogotá**. No se pueden cambiar después
  (verificar).
- **Auto-tagging** activado (Admin → Account settings → Auto-tagging). Añade el
  `gclid` a la URL ([GCLID](https://support.google.com/google-ads/answer/7012522?hl=en)).
- **Final URL suffix**, por campaña (Campaign → Settings → Campaign URL
  options (verificar ruta)):
  `utm_source=google&utm_medium=cpc&utm_campaign=<nombre-de-la-campaña>`.
  Es la convención de `docs/seo/embudo.md`.
- Ubicación: **Colombia**, opción *Presence: people in or regularly in*
  (verificar nombre). Idioma: **español**.
- Red: solo **Búsqueda**. Desmarca *Display Network* y *Search partners* al
  principio.

### 6.2 Estructura de campañas y grupos

| Campaña | Grupo | Palabras clave (concordancia) | URL final |
|---|---|---|---|
| `marca` | Marca | `[contradar]`, `"contradar"`, `[contradar app]`, `[contradar licitaciones]` | `/` |
| `app-plataforma` | App | `[app de licitaciones]`, `"app licitaciones colombia"`, `"app para licitaciones"` | `/` |
| | Plataforma | `"plataforma de licitaciones"`, `"software de licitaciones"`, `"programa para licitaciones"` | `/funcionalidades/` |
| `alertas-secop` | Alertas | `"alertas secop"`, `"alertas de licitaciones"`, `"monitoreo secop"`, `"buscador de licitaciones"` | `/producto/busquedas/` |
| `competencia-precio` | Competencia | `"análisis de competencia licitaciones"`, `"quién gana licitaciones"`, `"competidores secop"` | `/producto/analisis-de-competencia/` |
| | Precio de adjudicación | `"precio de adjudicación"`, `"histórico de adjudicaciones secop"`, `"a qué precio se gana una licitación"` | `/producto/estadistica-de-la-licitacion/` |
| `diagnostico-gratis` | Diagnóstico | `"diagnóstico licitaciones"`, `"mi empresa en el secop"`, `"consultar contratos por nit"` | `/diagnostico/` |

- Las URLs finales son de la **web**, nunca de la app (la app lleva `noindex` y
  no tiene el contexto comercial).
- Concordancias: exacta `[ ]` y de frase `" "` al principio. La amplia (sin
  signos) solo cuando haya conversiones y Smart Bidding. La amplia incluye todo
  lo de las más estrechas, y más
  ([tipos de concordancia](https://support.google.com/google-ads/answer/7478529?hl=en)).
- Mira el **Planificador de palabras clave** (Tools → Keyword Planner) antes
  de lanzar. Los volúmenes de búsqueda y los CPC de Colombia no los verifiqué
  (verificar).

### 6.3 Negativas (lista compartida, en todas las campañas menos `marca`)

**Dónde**: Tools → Shared library → **Negative keyword lists** (verificar ruta).

Las negativas **no** cubren variantes cercanas: hay que añadir a mano el plural
y los sinónimos
([negativas](https://support.google.com/google-ads/answer/2453972?hl=en)).

```
empleo
empleos
trabajo
trabajos
vacante
vacantes
hoja de vida
convocatoria laboral
curso
cursos
diplomado
especialización
capacitación gratis
pdf
tesis
"secop gratis"
"secop ii login"
"secop 2 iniciar sesión"
"registro secop"
"usuario secop"
"contraseña secop"
españa
méxico
perú
chile
ecuador
argentina
"licitaciones españa"
"licitaciones méxico"
"contratación pública españa"
placsp
compranet
mercado público
qué es
significado
definición
ley 80
decreto 1082
modelo de
formato
plantilla
ejemplo
```

- **Ojo con `qué es`, `formato`, `plantilla` y `ejemplo`**: bloquean búsquedas
  informacionales, que es lo que quieres en Ads. No los pongas en
  `competencia-precio` si ves que cortan consultas buenas («ejemplo de oferta
  ganadora»).
- Revisa cada semana **Insights & reports → Search terms** y añade negativas
  nuevas.

### 6.4 Anuncios adaptables de búsqueda (RSA)

Límites: 3-15 títulos de **≤ 30 caracteres**, 2-4 descripciones de **≤ 90** y 2
rutas de ≤ 15
([RSA](https://support.google.com/google-ads/answer/7684791?hl=en)).
- Los conteos de abajo están hechos con `len()` de Python: una tilde cuenta 1.
  Google no lo dice explícitamente para el español (verificar), pero solo el
  coreano, el japonés y el chino cuentan doble.
- Ningún título promete algo que el producto no hace. Los precios salen de
  `src/data/producto.ts`. Si cambian, cambia el anuncio.

**`marca`** — rutas: `/licitaciones` `/prueba`

| Título | n |
|---|---|
| ContRadar: app de licitaciones | 30 |
| Sitio oficial de ContRadar | 26 |
| ContRadar Colombia | 18 |
| Prueba gratis 7 días | 20 |
| Sin tarjeta de crédito | 22 |
| SECOP I y II desde 2012 | 23 |
| Mira contra quién compites | 26 |
| Entra a la app en el acto | 25 |

| Descripción | n |
|---|---|
| App de licitaciones para Colombia: análisis del SECOP I y II y búsquedas automáticas. | 85 |
| Prueba el plan Ventaja 7 días gratis, sin tarjeta. Entras a la app en el acto. | 78 |

**`app-plataforma`** — rutas: `/app` `/licitaciones`

| Título | n |
|---|---|
| App de licitaciones Colombia | 28 |
| Plataforma de licitaciones | 26 |
| Software de licitaciones | 24 |
| Análisis del SECOP I y II | 25 |
| Mira contra quién compites | 26 |
| A qué precio se adjudica | 24 |
| Histórico desde 2012 | 20 |
| Búsquedas automáticas | 21 |
| Gestión de contratos | 20 |
| Trabajo en equipo | 17 |
| Prueba gratis 7 días | 20 |
| Sin tarjeta de crédito | 22 |
| Desde $152.000/mes plan anual | 29 |
| Diagnóstico gratis con tu NIT | 29 |
| Hecha en Colombia | 17 |

| Descripción | n |
|---|---|
| Mira quién gana en cada entidad y a qué precio adjudica. SECOP I y II desde 2012. | 81 |
| Prueba el plan Ventaja 7 días gratis, sin tarjeta. Entras a la app en el acto. | 78 |
| Búsquedas automáticas, análisis de competencia y gestión de contratos en equipo. | 80 |
| Escribe el NIT de tu empresa y mira gratis cómo te ha ido en la contratación pública. | 85 |

**`alertas-secop`** — rutas: `/alertas` `/secop`

| Título | n |
|---|---|
| Alertas de licitaciones SECOP | 29 |
| Búsquedas automáticas diarias | 29 |
| Correo diario con lo que sirve | 30 |
| SECOP I y SECOP II juntos | 25 |
| Plan Alerta: $190.000/mes | 25 |
| Prueba gratis 7 días | 20 |
| Sin tarjeta de crédito | 22 |

| Descripción | n |
|---|---|
| Te llega por correo lo que encaja con tu empresa, del SECOP I y del SECOP II. | 77 |
| Además de avisarte, te muestra quién suele ganar y a qué precio adjudica la entidad. | 84 |
| Prueba el plan Ventaja 7 días gratis, sin tarjeta. Entras a la app en el acto. | 78 |

**`competencia-precio`** — rutas: `/competencia` `/precios`

| Título | n |
|---|---|
| ¿Quién gana en tu entidad? | 26 |
| A qué precio se adjudica | 24 |
| Análisis de competencia | 23 |
| Precio de adjudicación SECOP | 28 |
| Histórico desde 2012 | 20 |
| Mira contra quién compites | 26 |
| Prueba gratis 7 días | 20 |
| Diagnóstico gratis con tu NIT | 29 |

| Descripción | n |
|---|---|
| Antes de ofertar, mira quién le gana a esa entidad y con qué descuento adjudica. | 80 |
| Histórico de adjudicaciones del SECOP I y II desde 2012, por entidad y modalidad. | 81 |
| Prueba el plan Ventaja 7 días gratis, sin tarjeta. Entras a la app en el acto. | 78 |

**`diagnostico-gratis`** — rutas: `/diagnostico` `/nit`

| Título | n |
|---|---|
| Diagnóstico gratis con tu NIT | 29 |
| ¿Cómo te va en el SECOP? | 24 |
| Escribe tu NIT y míralo ya | 26 |
| Gratis y sin registro | 21 |
| SECOP I y II desde 2012 | 23 |

| Descripción | n |
|---|---|
| Escribe el NIT de tu empresa y mira gratis cómo te ha ido en la contratación pública. | 85 |
| Si te sirve, prueba el plan Ventaja 7 días gratis, sin tarjeta. | 63 |

Antes de publicar el título «Gratis y sin registro», confirma que el diagnóstico
de la app sigue sin pedir cuenta. Hoy solo lleva Turnstile y cupos por IP
(`diagnostico-seo-2026-10.md` §4).

### 6.5 Recursos (antes «extensiones»)

- **Sitelinks**: texto ≤ 25 caracteres
  ([sitelinks](https://support.google.com/google-ads/answer/2375416?hl=en)).
  Las líneas de descripción, ≤ 35 cada una (verificar).

| Texto (n) | Descripción 1 | Descripción 2 | URL |
|---|---|---|---|
| Ver precios (11) | Planes, prueba y pagos | Desde $152.000/mes anual | `/precios/` |
| Diagnóstico por NIT (19) | Gratis, con tu NIT | Mira tu historial SECOP | `/diagnostico/` |
| Calculadora de K (16) | K residual con método CCE | Gratis, sin registro | `/herramientas/calculadora-capacidad-residual/` |
| Guías para licitar (18) | Mínima cuantía, RUP, K… | Paso a paso y con fuente | `/guias/` |

- **Textos destacados** (callouts), ≤ 25
  ([callouts](https://support.google.com/google-ads/answer/6079510?hl=en)):
  `Sin tarjeta` (11) · `7 días de prueba` (16) · `SECOP I y II` (12) ·
  `Histórico desde 2012` (20) · `Soporte por WhatsApp` (20) ·
  `Hecha en Colombia` (17).
- **Fragmentos estructurados**: encabezado **Servicios** (o *Catálogo de
  servicios*), con al menos 3 valores
  ([fragmentos](https://support.google.com/google-ads/answer/6280012?hl=es)).
  Valores: `Búsquedas automáticas`, `Análisis de competencia`,
  `Estadística de licitación`, `Gestión de contratos`, `Búsqueda en PAA`.
- **Llamada**: +57 323 923 6742, solo en horario de atención (detalles de este
  recurso: verificar).
- **Formulario de clientes potenciales**: no aplica todavía. Pide historial y
  gasto mínimo en ciertos formatos
  ([lead form](https://support.google.com/google-ads/answer/9423234?hl=en)).

### 6.6 Conversiones: Umami no habla con Google Ads

Umami no envía conversiones a Google Ads. Hay tres caminos:

| Opción | Cómo | Implicación con `/politica-de-datos/` |
|---|---|---|
| **A. Etiqueta de Google (gtag) en la web** | Se instala el tag y se marca `prueba_solicitada` como conversión | Usa **cookies** de publicidad. La política hoy dice «sin cookies de seguimiento» y no hay banner. Tendrías que reescribir la política, añadir un banner y, en la práctica, Consent Mode. Consent Mode v2 es **obligatorio solo para usuarios del EEE, Reino Unido y Suiza** ([política de consentimiento de la UE](https://support.google.com/google-ads/answer/13695607?hl=en)); en Colombia aplica la Ley 1581 (autorización previa, expresa e informada; [SIC](https://sedeelectronica.sic.gov.co/politica-de-tratamiento-de-datos-personales)). **No la recomiendo.** |
| **B. Importación offline por GCLID** (recomendada para empezar) | 1) La web guarda el `gclid` de la URL de llegada y lo envía junto con el correo en `POST /public/prueba/crear` (**requiere código: no está hecho**). 2) La app lo guarda con la cuenta de prueba. 3) Una vez por semana exportas `gclid, nombre de conversión, fecha-hora` y lo subes por **Goals → Conversions → + New conversion action → Import** (vía Data Manager / Google Sheets). Los datos se procesan en 24-48 h. Lo de más de 90 días tras el clic no se importa ([GCLID](https://support.google.com/google-ads/answer/7012522?hl=en) · [Data Manager con Sheets](https://support.google.com/google-ads-data-manager/answer/15146000?hl=en)) | Sin cookies de terceros. El `gclid` unido al correo **es dato personal**: añade a la política de datos que lo guardas para medir campañas, con su finalidad. Si lo guardas en `sessionStorage`, no es cookie, pero la finalidad igual tiene que estar declarada. |
| **C. Conversiones avanzadas para clientes potenciales** | Subes el correo **cifrado con SHA-256** de quien convirtió ([conversiones avanzadas para leads](https://support.google.com/google-ads/answer/11021502?hl=en)). Desde el 15-jun-2026 las cargas por API pasan por Data Manager API (verificar) | Mandar el hash del correo a Google (EE. UU.) es probablemente una **transmisión internacional** de datos personales según la Ley 1581 (verificar con asesor). Hace falta declararlo en la política y tener la autorización del titular. |

**Recomendación**: empieza con **B**. Mientras no haya 15-30 conversiones al
mes, puja por **Maximizar clics** con CPC máximo. Las estrategias automáticas
de CPA objetivo funcionan bien con unas 30 conversiones en 30 días
([CPA objetivo](https://support.google.com/google-ads/answer/6268632?hl=en)).

Conversiones a crear en Google Ads:
1. `prueba_solicitada` — *Primary*, categoría *Sign-up*.
2. `diagnostico_completado` — *Secondary*. Solo si guardas también el `gclid`
   en el diagnóstico.
3. Pago — *Primary* cuando exista. Valor = lo cobrado.

Antes de B y C: **valida con un asesor la actualización de la política de datos
(Ley 1581 de 2012).**

### 6.7 Presupuesto inicial y regla para escalar

- Google puede gastar hasta **2 veces** el presupuesto diario en un día. El
  tope mensual es **30,4 × presupuesto diario**
  ([presupuesto](https://support.google.com/google-ads/answer/2375423?hl=en)).
- Punto de partida sugerido (hipótesis; no tengo CPC verificados de este
  nicho):

| Campaña | COP/día | Tope mensual (×30,4) |
|---|---|---|
| `marca` | 5.000 | 152.000 |
| `app-plataforma` | 15.000 | 456.000 |
| `alertas-secop` | 10.000 | 304.000 |
| `competencia-precio` | 10.000 | 304.000 |
| `diagnostico-gratis` | 5.000 | 152.000 |
| **Total** | **45.000** | **≈ 1.368.000** |

- **Regla para escalar**, revisada cada 2 semanas, nunca a diario:
  - Si una campaña tiene **≥ 5 pruebas** en 14 días y su **costo por prueba ≤
    COP 150.000**, súbele el presupuesto un 20 %. Referencia de ese umbral:
    menos de un mes del plan Alerta mes a mes (190.000).
  - Si tiene **0 pruebas con ≥ 200 clics**, pausa los grupos sin conversión y
    revisa los términos de búsqueda y la página de llegada.
  - Cambia a CPA objetivo cuando la cuenta pase de unas 30 conversiones en 30
    días.
  - Cuando una palabra clave orgánica llegue al top 3 estable en Search Console
    con CTR razonable, baja su puja: deja de pagar lo que ya ganas gratis. La
    marca es la excepción: mantenla si un competidor puja por ella.

---

## 7. Directorios de software

### 7.1 Capterra, GetApp y Software Advice

- Según un tercero, **G2 compró** estas tres marcas a Gartner (cierre en
  feb-2026) y hoy operan como «G2 Digital Markets» (verificar:
  [fuente no oficial](https://blastra.io/guides/how-to-navigate-g2-and-capterra/)).
  Lo coherente con esto: la página de proveedores de **Capterra Colombia**
  manda el registro a `g2digitalmarkets.com`.
- **Dónde**: https://www.capterra.co/company/vendors → registro en
  https://www.g2digitalmarkets.com/ → portal https://app.g2digitalmarkets.com/.
- **Costo**: la ficha básica es **gratis** («En los directorios aparecen todos
  los proveedores, no solo los que pagan»). El pago por clic es opcional
  ([condiciones PPC](https://www.capterra.com/legal/ppc-service-description/)).
  No hay precios oficiales publicados (verificar).
- Una ficha aprobada aparece en Capterra, GetApp y Software Advice
  ([vendors](https://www.capterra.in/company/vendors)).
- Categorías sugeridas: *Software de licitaciones* / *Bid management* /
  *Government contracting* (elige la más cercana disponible).

### 7.2 G2

- **Dónde**: https://sell.g2.com/create-a-profile. El perfil es gratis. Lo
  reclamas y G2 lo aprueba en 1-3 días hábiles (verificar plazo; fuente:
  [términos](https://legal.g2.com/g2-profile-free-service-description)).
- Solo productos B2B, sin betas: ContRadar cumple.

### 7.3 Otros

- **SaaSworthy**: ficha gratis (https://www.saasworthy.com/offerings).
- **Fedesoft** (gremio de la industria de software, Colombia): tiene directorio
  de afiliados, https://fedesoft.org/directorio/. La afiliación es de pago,
  la aprueba la junta y exige empresa constituida en Colombia
  (https://fedesoft.org/afiliate/). Antes de pagar, evalúa si la afiliación vale
  por el directorio.
- **Clúster CreaTIC** (Popayán; lo fundaron Parquesoft Popayán, Unicauca y
  CREPIC): https://clustercreatic.com/convocatorias/contacto/. Es el más natural
  para ti por ubicación. Aparece en el directorio de Fedesoft y en la Red
  Clúster Colombia.
- **Colombia Fintech**: no aplica (ContRadar no es servicio financiero).
- **MinTIC**: no encontré un directorio público de empresas de software
  (verificar). iNNpulsa: sin directorio confirmado (verificar).

### 7.4 Texto de ficha, listo para pegar

Sale de `src/data/producto.ts` (2-oct-2026). Si cambia algo allí, cambia la ficha.

**Nombre**: ContRadar
**Empresa**: eulertech (titular: John Euler Chamorro Fuertes)
**Sitio**: https://contradar.com.co
**País / ciudad**: Colombia · Popayán, Cauca
**Idioma**: español
**Despliegue**: web (navegador), sin app móvil
**Correo**: soporte@contradar.com.co · ventas@contradar.com.co

**Descripción corta** (`ENTIDAD.descripcionCorta`):
> App de licitaciones para Colombia: análisis y estadística del SECOP I y II para saber contra quién compites y a qué precio se adjudica, con búsquedas automáticas y gestión de licitaciones y contratos en equipo.

**Descripción larga**:
> ContRadar procesa el histórico del SECOP I y del SECOP II desde 2012 (20 M de procesos y 11 M de contratos) para que una empresa que licita con el Estado colombiano sepa, antes de ofertar, quién suele ganar en cada entidad y a qué precio se adjudica. Incluye búsquedas automáticas con correo diario, análisis de competencia y de contratantes, estadística de cada licitación, gestión de licitaciones y contratos en equipo y, en el plan Dominio, búsqueda en los Planes Anuales de Adquisiciones (PAA).
>
> Prueba gratis de 7 días con el plan Ventaja: 10 análisis y 3 búsquedas, sin tarjeta. La cuenta se crea en el acto.

**Planes** (COP; semestral y anual son el total del periodo; confirma si
incluyen IVA antes de publicar (verificar)):

| Plan | Mensual | Semestral | Anual (equivale a) | Usuarios | Análisis/mes | Búsquedas |
|---|---|---|---|---|---|---|
| Alerta | 190.000 | 1.003.200 | 1.824.000 (152.000/mes) | 1 | 5 | 1 |
| Ventaja | 550.000 | 2.904.000 | 5.280.000 (440.000/mes) | 3 | 30 | 3 |
| Dominio | 990.000 | 5.227.200 | 9.504.000 (792.000/mes) | 5 | sin tope | 6 |

**Prueba**: 7 días, plan Ventaja, 10 análisis, 3 búsquedas, sin tarjeta.
**Límites que conviene declarar** (te ahorran reseñas malas): no lee el pliego
con IA, no genera la propuesta, no tiene app móvil y no cubre portales propios
de empresas (EPM, acueductos).

**Logo**: `public/android-chrome-512x512.png`. **Capturas**: `public/capturas/`.

---

## 8. Autoridad y enlaces (outreach)

> ⚠️ **ADVERTENCIA — Ley 1581 de 2012.** Escribe solo a canales de contacto
> **institucionales y públicos** (formularios de «Contáctenos», buzones
> generales). Si vas a usar una **base de correos** (comprada, extraída o de
> un tercero) para enviar estos mensajes, **valida antes con un asesor legal**
> que cumpla la Ley 1581 de 2012 y su reglamentación (autorización previa,
> finalidad, transmisión).
> Este runbook no lista correos personales a propósito.

### 8.1 Precedente que puedes citar

El País Licita tiene un programa con la **Cámara de Comercio de Cali** para sus
afiliados:
- 30 días de prueba;
- 30 % de descuento en planes anuales (Alertas 42.560/mes en vez de 60.800;
  Pro 112.000 en vez de 160.000);
- talleres.

Fuente: https://elpaislicita.com/partners/ccc. Solo lo confirma el sitio de El
País Licita; no hallé comunicado de la CCC (verificar antes de citarlo por
escrito ante la cámara).

### 8.2 Plantillas

Antes de enviar, cambia todo lo que va entre `[corchetes]`. No ofrezcas un
descuento que no hayas decidido.

**A. Cámara de Comercio del Cauca** (primera; luego Cali, Bogotá y Confecámaras)

> Asunto: Propuesta de beneficio para afiliados: datos del SECOP para empresas del Cauca
>
> Buenos días, equipo de [área de afiliados / Programa Aliado Plus]:
>
> Soy John Chamorro, fundador de ContRadar, una app de licitaciones hecha en Popayán. Analizamos el histórico del SECOP I y II desde 2012 para que una empresa sepa, antes de ofertar, quién suele ganar en cada entidad y a qué precio se adjudica.
>
> Les propongo un beneficio para los afiliados de la Cámara, como el que ya ofrecen otras cámaras del país con plataformas de licitaciones:
> 1. [Prueba extendida de N días / descuento del N % en plan anual] para afiliados.
> 2. Un taller gratuito, presencial en Popayán o virtual, sobre cómo leer el SECOP antes de ofertar: mínima cuantía, capacidad residual y precio de adjudicación.
> 3. Un informe con datos públicos de la contratación del Cauca para su boletín, con fuente y metodología.
>
> ¿Podemos agendar 20 minutos para revisarlo?
>
> John Chamorro · ContRadar (eulertech) · Popayán · +57 323 923 6742 · https://contradar.com.co

**B. Gremios** (Camacol, CCI, Fenalco, ANDI, SCI)

> Asunto: Contenido gratuito para sus afiliados que licitan con el Estado
>
> Buenos días:
>
> Soy John Chamorro, de ContRadar (Popayán). Publicamos guías gratuitas para quien licita con el Estado colombiano, con fuente en la norma y en Colombia Compra Eficiente, y una calculadora pública de capacidad residual (K) con la metodología de CCE:
> https://contradar.com.co/herramientas/calculadora-capacidad-residual/
>
> Si les sirve para [su boletín / su sección de recursos para afiliados], pueden enlazarla o reproducir fragmentos citando la fuente. También podemos dar una charla virtual de 30 minutos a sus afiliados sobre [capacidad residual / precio de adjudicación en obra pública], sin costo y sin venta en la charla.
>
> Quedo atento.
> John Chamorro · ContRadar · +57 323 923 6742

**C. Universidades** (programas de contratación estatal)

> Asunto: Recurso gratuito para la clase de contratación estatal
>
> Profesor(a) / coordinación del programa:
>
> Soy John Chamorro, de ContRadar. Publicamos una calculadora gratuita de capacidad residual (K) que sigue la guía CCE-REC-GI-22 de Colombia Compra Eficiente, con un ejemplo resuelto paso a paso:
> https://contradar.com.co/guias/capacidad-residual/
>
> Puede servir como material de apoyo. Si quieren usar datos agregados del SECOP para un trabajo de grado o un ejercicio de clase, podemos compartir agregados con su metodología (nunca datos de personas naturales).
>
> Atentamente,
> John Chamorro · ContRadar

**D. Prensa** (ofrecer un informe de datos)

> Asunto: Datos: [hallazgo en una línea, con cifra y año]
>
> Hola, [nombre de la sección]:
>
> En ContRadar procesamos el histórico del SECOP I y II. Este mes medimos [qué], con [n] [procesos/contratos] de [ventana]. El resultado: [hallazgo].
>
> Metodología, fuente y fecha de corte: [URL del informe en /informes/…]. Los datos son públicos y agregados. Puedo explicar el método por teléfono.
>
> John Chamorro · ContRadar · Popayán · +57 323 923 6742

Envía D **solo** con un informe publicado y validado: los candidatos están en
`diseno-programatico.md` §9 y las cifras salen de §13. Nada de cifras sin `n`.

**E. Autores de comparativas donde ContRadar no aparece**

> Asunto: Una plataforma más para su comparativa de apps de licitaciones
>
> Hola:
>
> Leí su artículo «[título]» ([URL]). ContRadar no aparece y creo que puede servir a sus lectores por algo que ninguna de las listadas hace: el precio al que se adjudica cada entidad, con histórico del SECOP I y II desde 2012.
>
> Datos públicos para verificar: precios en https://contradar.com.co/precios/, prueba de 7 días sin tarjeta, y nuestros límites declarados (no leemos el pliego con IA ni tenemos app móvil). Si quieren, les doy una cuenta de prueba para evaluarla.
>
> Gracias,
> John Chamorro · ContRadar

Las comparativas de `mercado-competidores-2026-10.md`, todas del propio
competidor, son las siguientes. Es poco probable que te incluyan, pero cuesta
un correo:
- https://www.fromus.tech/blog/mejores-plataformas-licitaciones-colombia-2026 (blog de Fromus)
- https://licitia.com.co/donde-buscar-licitaciones-en-colombia.html («Equipo de LicitIA»)

Las dos de iaLicitaciones son de España: no aplican. Más rentable: busca cada
trimestre «mejores apps licitaciones Colombia» y escribe a medios y blogs **no
competidores** que publiquen listas.

### 8.3 Destinatarios por tipo (contacto público, consultado el 2-oct-2026)

| Tipo | Organización | Contacto público |
|---|---|---|
| Cámara | Cámara de Comercio del Cauca | https://www.cccauca.org.co (contacto: verificar) · programa de afiliados: https://ccc_old.cccauca.org.co/programa-aliado-plus |
| Cámara | Cámara de Comercio de Cali | https://www.ccc.org.co/afiliados/ (contacto: verificar) |
| Cámara | Cámara de Comercio de Bogotá | https://www.ccb.org.co (contacto: verificar) |
| Cámaras | Confecámaras | https://confecamaras.org.co/contactenos |
| Gremio | Camacol | https://camacol.co/contacto |
| Gremio | Cámara Colombiana de la Infraestructura (CCI) | https://infraestructura.org.co/contacto |
| Gremio | Fenalco | seccionales: https://www.fenalco.com.co/seccionales (contacto nacional: verificar) |
| Gremio | ANDI | https://www.andi.com.co/Home/Pagina/4-contactenos |
| Gremio | Sociedad Colombiana de Ingenieros | https://sci.org.co/contactenos/ |
| Gremio | ACIEM | https://aciem.org (contacto: verificar) |
| Clúster | Clúster CreaTIC (Popayán) | https://clustercreatic.com/convocatorias/contacto/ |
| Gremio TI | Fedesoft | https://fedesoft.org/afiliate/ |
| Universidad | Universidad del Cauca (Esp. y Maestría en Derecho Administrativo) | https://www.unicauca.edu.co/posgrados/programas/especializacion-en-derecho-administrativo |
| Universidad | Universidad Externado (Esp. en Contratación Estatal) | https://www.uexternado.edu.co/programa/derecho/especializacion-contratacion-estatal/ |
| Universidad | Universidad del Rosario (Esp. en Contratación Estatal) | https://urosario.edu.co/en/node/407 |
| Universidad | Universidad Autónoma de Occidente (programa del Rosario en Cali) | https://www.uao.edu.co/programa/especializacion-contratacion-estatal-su-gestion-universidad-rosario/ |
| Universidad | Pontificia Universidad Javeriana (diplomado) | https://educacionvirtual.javeriana.edu.co/contratacion-estatal |
| Universidad | Universidad Nacional (posgrados de Derecho) | https://derecho.bogota.unal.edu.co/formacion/posgrado/posgrado-derecho/ |
| Prensa regional | Proclama del Cauca | https://www.proclamadelcauca.com/contactenos/ |
| Prensa regional | El Liberal (Popayán; el impreso original cerró en 2012, el sitio actual publica) | https://elliberalpopayan.com (contacto: verificar) |
| Prensa regional | El Nuevo Liberal | https://elnuevoliberal.com/sobre-nosotros/ (contacto: verificar) |
| Prensa regional | El País (Cali) | https://www.elpais.com.co/contactenos/ |
| Prensa nacional | Portafolio | https://www.portafolio.co/contacto/ |
| Prensa nacional | La República | https://www.larepublica.co/contactenos |
| Prensa nacional | El Tiempo | https://www.eltiempo.com/ayuda |
| Prensa nacional | Semana, Valora Analitik, Forbes Colombia | contacto editorial: verificar |

Ojo con El País de Cali: tiene su propia plataforma (El País Licita), así que
es competidor. Para prensa, mejor otros medios.

---

## 9. Prueba social

Hoy está **apagada**: `MOSTRAR_PRUEBA_SOCIAL = false` en
`src/data/prueba-social.ts`. No hay testimonios inventados ni estrellas: sin
reseñas verificables, un `AggregateRating` viola las políticas de Google.

### 9.1 Correo para pedir el testimonio

> Asunto: ¿Nos cuentas en dos líneas cómo te ha servido ContRadar?
>
> Hola, [nombre]:
>
> Llevas [tiempo] usando ContRadar y me gustaría publicar en contradar.com.co lo que te ha servido, con tus palabras. Tres preguntas, responde solo las que quieras:
> 1. ¿Qué hacías antes para buscar y analizar licitaciones?
> 2. ¿Qué te ha servido más de ContRadar? Un ejemplo concreto vale oro.
> 3. ¿Se lo recomendarías a otra empresa? ¿Por qué?
>
> Publicaría tu cita **textual**, con tu nombre, cargo y empresa (y el logo, si nos lo autorizas). Antes de publicar te mando el texto final y la autorización para firmar; si no te sientes cómodo, no pasa nada.
>
> Gracias,
> John

### 9.2 Autorización escrita (texto modelo; revísalo con tu asesor)

> **AUTORIZACIÓN PARA EL USO DE TESTIMONIO, NOMBRE, IMAGEN Y MARCA**
>
> Yo, [nombre completo], identificado(a) con [tipo y número de documento], en nombre propio y como [cargo] de [razón social], NIT [número], autorizo de manera previa, expresa e informada a John Euler Chamorro Fuertes, titular de ContRadar (eulertech), para:
>
> 1. Publicar la siguiente cita textual: «[cita exacta]».
> 2. Acompañarla de mi nombre, mi cargo, el nombre de la empresa y [mi fotografía / el logo de la empresa] (táchese lo que no aplique).
> 3. Usarla en el sitio web https://contradar.com.co, en sus perfiles de redes sociales y en material comercial de ContRadar.
>
> **Finalidad**: mostrar a otros usuarios la experiencia de clientes reales. **Vigencia**: hasta que la revoque. Puedo revocarla en cualquier momento escribiendo a soporte@contradar.com.co, y el contenido se retirará del sitio en un máximo de [10] días hábiles. Declaro que conozco la Política de Tratamiento de Datos Personales (https://contradar.com.co/politica-de-datos/) y mis derechos como titular según la Ley 1581 de 2012: conocer, actualizar, rectificar y suprimir mis datos y revocar esta autorización. Como representante de la empresa, declaro que tengo facultad para autorizar el uso de su nombre y su logo.
>
> Firma: ______________ Fecha: ____ / ____ / ______

Guarda el PDF firmado fuera del repo (es dato personal) y anota la fecha y una
referencia del documento en el campo `autorizacion`.

### 9.3 Activar el bloque

En `src/data/prueba-social.ts`:

```ts
export const MOSTRAR_PRUEBA_SOCIAL = true;

export const TESTIMONIOS: Testimonio[] = [
  {
    cita: "Texto exacto aprobado por el cliente.",
    nombre: "Nombre Apellido",
    cargo: "Gerente",
    empresa: "Empresa S.A.S.",
    foto: "/clientes/nombre-apellido.jpg",            // opcional; cuadrada, ≥128 px, en public/clientes/
    autorizacion: { fecha: "2026-11-15", documento: "AUT-001 (Drive/Legal)" },
  },
];

export const LOGOS_CLIENTES: LogoCliente[] = [
  { empresa: "Empresa S.A.S.", archivo: "/clientes/logos/empresa.svg",
    autorizacion: { fecha: "2026-11-15", documento: "AUT-001" } },
];
```

Después: `npm run build`, revisa la home en local (`npm run preview`), haz
commit, despliega y pide indexación de `/` (§1.3).

---

## 10. LinkedIn de la empresa

**Recordatorio que pediste**: https://www.linkedin.com/company/contradar/ **no
tiene publicaciones**. Esta sección es para darle amor. Ya está enlazada desde
el JSON-LD (`Organization.sameAs`, en `ENTIDAD.redes` de `producto.ts`): no hay
que tocar código.

### 10.1 Perfil completo

**Dónde**: entra a la página como administrador → **Edit page** («Editar
página») ([ayuda](https://www.linkedin.com/help/linkedin/answer/a564346)).

| Campo | Qué poner |
|---|---|
| Logo | Variante cuadrada del logo, PNG. Oficial: mínimo 268×268, **recomendado 400×400**, máximo 3 MB ([especificaciones](https://www.linkedin.com/help/linkedin/answer/a563309/image-specifications-for-your-linkedin-pages-and-career-pages)) |
| Portada | **1512×256** según la misma página oficial. Fondo claro, una línea: «Quién gana y a qué precio, en cada entidad del Estado» |
| Nombre | ContRadar |
| Eslogan (*tagline*, ≈120 caracteres (verificar)) | `App de licitaciones para Colombia: quién gana y a qué precio en el SECOP I y II, desde 2012.` (92) |
| Descripción (*overview*, ≈2.000 (verificar)) | La descripción larga de §7.4 + «Hecha en Popayán por eulertech.» |
| Sitio web | `https://contradar.com.co/?utm_source=linkedin&utm_medium=social&utm_campaign=perfil` |
| Sector | *Software Development* («Desarrollo de software»), o el más cercano en la lista |
| Tamaño | 2-10 empleados (o el real) |
| Tipo | Empresa privada / *Self-employed* (el que corresponda a tu figura legal) |
| Teléfono | +57 323 923 6742 |
| Año de fundación | [el real] |
| Especialidades (hasta 20 (verificar)) | licitaciones públicas · SECOP I · SECOP II · contratación estatal · análisis de competencia · precio de adjudicación · capacidad residual · mínima cuantía · PAA · gestión de contratos |
| Ubicación | Popayán, Cauca, Colombia (sede principal) |
| Botón | «Visitar sitio web» → `https://contradar.com.co/?utm_source=linkedin&utm_medium=social&utm_campaign=boton#solicitar` (verificar opciones del botón) |
| URL pública | `linkedin.com/company/contradar` (ya está; solo se puede cambiar una vez cada 30 días: [ayuda](https://www.linkedin.com/help/linkedin/answer/a564298)) |

Y en tu perfil personal: añade ContRadar como experiencia actual, con la página
enlazada. Así tu red ve la empresa.

### 10.2 Las 8 primeras publicaciones

Reglas:
- Ninguna cifra que no esté publicada en la web con su fuente.
- Un enlace por publicación, con UTM:
  `?utm_source=linkedin&utm_medium=social&utm_campaign=<slug>`.
- Una imagen propia (captura o diagrama). Nada de bancos de imágenes.

**1. Presentación**
> Lanzamos ContRadar desde Popayán.
>
> Quien licita con el Estado suele preguntarse lo mismo antes de ofertar: ¿quién gana en esta entidad y a qué precio adjudica?
>
> ContRadar responde eso con el histórico del SECOP I y II desde 2012: 19,7 millones de procesos y 11,1 millones de contratos.
>
> Prueba de 7 días, sin tarjeta: https://contradar.com.co/?utm_source=linkedin&utm_medium=social&utm_campaign=lanzamiento

**2. Calculadora de capacidad residual**
> ¿Cuánto K te queda para la próxima obra?
>
> Publicamos una calculadora gratuita de capacidad residual con la metodología de la guía CCE-REC-GI-22 de Colombia Compra Eficiente: experiencia, capacidad financiera, capacidad técnica y contratos en ejecución.
>
> Sin registro: https://contradar.com.co/herramientas/calculadora-capacidad-residual/?utm_source=linkedin&utm_medium=social&utm_campaign=calculadora-k

**3. Mínima cuantía**
> En mínima cuantía no gana la mejor propuesta técnica: gana el precio más bajo que cumpla las condiciones (Ley 1150 de 2007, art. 2, num. 5).
>
> En la guía explicamos cómo se calcula el tope de 2026 según el presupuesto de cada entidad, los plazos y cómo se evalúa.
>
> https://contradar.com.co/guias/minima-cuantia/?utm_source=linkedin&utm_medium=social&utm_campaign=minima-cuantia

**4. SECOP I sigue vivo**
> «Todo está en SECOP II.» No del todo.
>
> En agosto de 2026 contamos 859.786 proveedores que solo aparecen en SECOP I. Muchas alcaldías pequeñas y ESE siguen publicando allí.
>
> Por qué conviven las dos plataformas y dónde mirar para no perder procesos:
> https://contradar.com.co/guias/secop-i-vs-secop-ii/?utm_source=linkedin&utm_medium=social&utm_campaign=secop-i-vs-ii

**5. RUP**
> Si no renuevas el RUP a más tardar el quinto día hábil de abril, cesan sus efectos y tienes que inscribirte de nuevo, con el plazo de firmeza que eso implica (Decreto 1082 de 2015, art. 2.2.1.1.1.5.1).
>
> Qué certifica el RUP, cuándo queda en firme y los errores que te dejan por fuera:
> https://contradar.com.co/guias/que-es-el-rup/?utm_source=linkedin&utm_medium=social&utm_campaign=rup

(Frase alineada con la guía del RUP, verificada contra el Decreto 1082.)

**6. Oferta económica**
> AIU, IVA sobre la utilidad, redondeos y el riesgo de precio artificialmente bajo: en la oferta económica se pierden licitaciones que ya estaban ganadas en lo técnico.
>
> Paso a paso, del presupuesto oficial al precio que presentas:
> https://contradar.com.co/guias/como-calcular-la-oferta-economica/?utm_source=linkedin&utm_medium=social&utm_campaign=oferta-economica

**7. Consorcio o unión temporal**
> ¿Consorcio o unión temporal? La diferencia está en la responsabilidad ante la entidad, y cambia cómo se suman la experiencia y los indicadores.
>
> Lo que conviene firmar antes de presentarse:
> https://contradar.com.co/guias/consorcios-y-uniones-temporales/?utm_source=linkedin&utm_medium=social&utm_campaign=consorcios

**8. Diagnóstico por NIT**
> Escribe el NIT de tu empresa y mira gratis cómo te ha ido en la contratación pública: no te pedimos registro.
>
> https://contradar.com.co/diagnostico/?utm_source=linkedin&utm_medium=social&utm_campaign=diagnostico

### 10.3 Cadencia

- **2 publicaciones por semana** (martes y jueves en la mañana). Las 8 primeras
  cubren 4 semanas.
- Después: 1 guía o sector, 1 dato propio cuando §13 tenga cifras, y cada mes
  algo del producto (captura de una función).
- Compártelas desde tu perfil personal con una línea tuya: en LinkedIn, el
  alcance de las páginas de empresa nuevas sale casi todo de los perfiles
  personales.
- Mide en Umami → UTM (`utm_source=linkedin`) y en LinkedIn → *Analytics*.

---

## 11. Rutina de seguimiento

### Semanal (15 min, los lunes)

En Search Console → Rendimiento, últimos 7 días contra los 7 anteriores.
Filtro por consulta: posición, impresiones y clics de estas 15.

| # | Palabra clave | URL dueña |
|---|---|---|
| 1 | contradar | `/` |
| 2 | app de licitaciones | `/` |
| 3 | app licitaciones colombia | `/` |
| 4 | plataforma de licitaciones | `/` (apoyo `/funcionalidades/`) |
| 5 | alertas secop | `/producto/busquedas/` |
| 6 | análisis de competencia licitaciones | `/producto/analisis-de-competencia/` |
| 7 | precio de adjudicación | `/producto/estadistica-de-la-licitacion/` |
| 8 | licitaciones colombia | `/licitaciones-colombia/` |
| 9 | cómo buscar licitaciones en secop | `/guias/como-buscar-licitaciones-en-secop/` |
| 10 | secop i vs secop ii | `/guias/secop-i-vs-secop-ii/` |
| 11 | mínima cuantía | `/guias/minima-cuantia/` |
| 12 | capacidad residual | `/guias/capacidad-residual/` |
| 13 | calculadora capacidad residual | `/herramientas/calculadora-capacidad-residual/` |
| 14 | mejores apps de licitaciones colombia | `/guias/mejores-apps-licitaciones-colombia/` |
| 15 | diagnóstico licitaciones gratis | `/diagnostico/` |

Además, cada semana:
- [ ] Umami: `prueba_solicitada` de la semana y por `utm_source`.
- [ ] Google Ads (si está activo): términos de búsqueda → negativas nuevas;
      costo por prueba.
- [ ] Si una consulta la está ganando una URL que **no** es su dueña,
      revisa la canibalización en `mapa-keywords.md`.

### Mensual (1 h, primer lunes del mes)

Un informe corto (puede ser un `.md` en `docs/seo/informes/AAAA-MM.md`):

1. **Posiciones**: las 15 de arriba, mes contra mes.
2. **Clics e impresiones**: con y sin marca (filtro `contradar`).
3. **Embudo**, de Umami:
   - visitas → `diagnostico_iniciado` → `diagnostico_completado` →
     `prueba_solicitada` → pagos (app).
   - Tasa de cada paso.
   - Pruebas por `utm_source`.
4. **Indexación**: Search Console → Páginas, indexadas contra enviadas por
   sitemap (`sitemap-paginas-0.xml` y, en la fase 3, `sitemap-entidades-*`).
   Las de «Rastreada: actualmente sin indexar», con su lista.
5. **Core Web Vitals** / PageSpeed de `/` y de la página con más tráfico.
6. **Enlaces**: Search Console → **Links** → sitios que más enlazan (verificar
   nombre del informe).
7. Decisiones del mes siguiente (máximo 3).

### Trimestral (medio día)

- [ ] **Snapshot de datos**: vuelve a correr las consultas de §13 y actualiza
      `medido`. En la fase 3: snapshot de entidades (`construir_intel.sh` +
      exportación) y nuevo despliegue.
- [ ] **Competidores**: repite el método de `mercado-competidores-2026-10.md`
      (precios, prueba, cobertura y URLs nuevas de cada uno). Guárdalo como
      `mercado-competidores-AAAA-MM.md`, actualiza `/alternativas/*` y la
      comparativa, y cambia sus fechas.
- [ ] Busca de nuevo «mejores apps licitaciones Colombia» → nuevos artículos
      → plantilla E de §8.
- [ ] Revisa precios, prueba y cifras en `src/data/producto.ts` contra la app.

---

## 12. Expectativas por horizonte

Sin promesas: estos son rangos típicos para un dominio joven, sin enlaces
fuertes, en un nicho pequeño. Pueden ser más lentos.

| Horizonte | Qué es razonable esperar | Señal de que va bien | Señal de alarma |
|---|---|---|---|
| **0-1 mes** | Indexación de lo enviado; **primero en «contradar»** (marca); primeras impresiones de cola larga | Páginas indexadas ≥ 80 % del sitemap; marca en posición 1 | Muchas URLs en «Rastreada: sin indexar» o «Descubierta» sin moverse tras 4 semanas |
| **1-3 meses** | Cola larga: guías («capacidad residual», «tope mínima cuantía 2026», «secop i vs secop ii»), calculadora; páginas de entidad de la tanda 1 si la fase 3 está aprobada | Impresiones crecientes en guías; primeras pruebas con origen `guia` | Impresiones sin clics: revisa títulos y descripciones |
| **3-6 meses** | Diferenciadores: «análisis de competencia licitaciones», «precio de adjudicación», búsquedas por entidad; menciones y enlaces de §8 | Posiciones de top 10 en consultas diferenciadoras | Cero enlaces externos a los 6 meses: refuerza §8 |
| **6-12 meses** | Genéricas: «app de licitaciones», «plataforma de licitaciones», «alertas secop», contra rivales con años de dominio | Página 1 en alguna genérica | Si no aparece: Ads sigue siendo el canal para esas consultas |

Google Ads (§6) cubre las genéricas desde el día 1. El SEO reduce ese gasto con
el tiempo; no lo sustituye de inmediato.

---

## 13. Datos que tienes que correr en producción

### 13.1 Consultas de las guías

Origen: `docs/seo/consultas-fase-2.md`. Todo es `SELECT` de solo lectura, con
red de seguridad. Córrelas en horario valle.

```bash
docker exec -it contradar-postgres psql -U <usuario> -d contradar -X
```

```sql
SET default_transaction_read_only = on;
SET statement_timeout = '120s';
SET jit = off;
\pset format aligned
\timing on
```

Orden:

| # | Id | Llena | Archivo |
|---|---|---|---|
| 0 | `00-precheck` (a, b, c) | nada; valida que los datos están | — |
| 1 | `mc-participacion` | `mc-participacion` | `src/data/datos-guias/minima-cuantia.ts` |
| 2 | `mc-desvio-mediana` | `mc-desvio-mediana` | ídem |
| 3 | `sa-desvio-subasta` | `sa-desvio-subasta` | `seleccion-abreviada.ts` |
| 4 | `oe-desvio-por-modalidad` | `oe-desvio-por-modalidad` | `como-calcular-la-oferta-economica.ts` |
| 5 | `cuut-share-obra` | `cuut-share-obra` | `consorcios-y-uniones-temporales.ts` |
| 6 | `cg-adiciones-share` | `cg-adiciones-share` | `como-ganar-una-licitacion.ts` |
| 7 | `sector-<slug>-2025` | `sector-<slug>-contratos-2025` y `-mediana-2025` | `sector-*.ts` (**ver aviso**) |
| — | `secop-share-secop-i` | **no se corre**: no se puede medir con fiabilidad hoy | `secop-i-vs-secop-ii.ts` queda en `null` |

Si una consulta llega a los 120 s: `SET statement_timeout = '300s';`, repite
**solo esa** y vuelve a `'120s'`.

**Si el `00-precheck` no da lo esperado, no sigas.** Lo esperado: `secop_ii`
cerca de 1,05 M contratos en 2025, con `hasta` = 2025-12-31.

**Cómo pegar.** Dos opciones:
- **Me pegas la salida** de `psql` en el chat, tal cual, precedida de
  `medido: AAAA-MM-DD`, y yo lleno los archivos.
- **Lo haces tú**: en el archivo de la guía, para el id de la consulta:

```ts
"mc-desvio-mediana": {
  frase: "En mínima cuantía, la mediana de la diferencia entre el valor adjudicado y el presupuesto oficial fue de {valor}.",
  valor: "6,4 % por debajo del presupuesto",   // ← de valor_pct (ejemplo, NO real)
  muestra: "12.345 procesos",                   // ← de n (ejemplo, NO real)
  periodo: "procesos de mínima cuantía adjudicados en 2025 en SECOP II",
  consulta: "mc-desvio-mediana",
  medido: "2026-10-05",                         // ← día en que corriste la consulta
},
```

  Reglas:
  - Formato colombiano: punto de miles, coma decimal.
  - Medianas.
  - **Sin `n` no se publica**: si `n` sale muy bajo (menos de 30), déjalo en
    `null` y avísame.
  - Después: `npm run build`, commit, despliegue, `npm run indexnow` y
    solicitar indexación de la guía (§1.3).

**⚠ Aviso de sectores (hay que resolverlo antes de pegar).** La consulta
`sector-<slug>-2025` mide **contratos firmados en 2025 en SECOP II**, agrupados
por **vertical UNSPSC de la app**. Los archivos `sector-*.ts` dicen otra cosa:

| Archivo | Lo que dice su frase / universo | Lo que mide la consulta |
|---|---|---|
| `sector-construccion.ts` | «contratos de obra entre SECOP I y SECOP II» (tipo de contrato = Obra) | vertical `construction` (UNSPSC 22, 30, 72, 95), solo SECOP II |
| `sector-ingenieria-e-interventoria.ts` | tipo de contrato Consultoría o Interventoría, SECOP I y II | vertical `engineering` (UNSPSC 8110), solo SECOP II |
| `sector-salud.ts` | sector oficial de la entidad = Salud, SECOP I y II | vertical `health` (UNSPSC 42, 51, 85), solo SECOP II |
| `sector-tecnologia-y-telecomunicaciones.ts` | sector oficial de la entidad = TIC, SECOP I y II | vertical `technology` (8111, 8112, 32, 43), solo SECOP II |
| `sector-agua-y-saneamiento.ts` | UNSPSC 83101500 + 4 productos de 7214, SECOP I y II | **no hay fila**: no es una vertical de la app |

Elige una de dos salidas:
- **(a)** Reescribe frase, `periodo` y comentario de cada archivo para que
  digan «contratos firmados en 2025 en SECOP II con códigos UNSPSC de [sector]».
  Para agua y saneamiento, pídeme una consulta propia con sus códigos.
- **(b)** Pídeme consultas nuevas que midan el universo que hoy dicen los
  archivos.

Hasta entonces, deja esos valores en `null`. Publicar «entre SECOP I y SECOP II»
con un conteo solo de SECOP II sería una afirmación falsa.

### 13.2 Tope del correo por plan

Confirma que «Alerta diaria · las 5 mejores» es lo que hace producción:

```sql
select name, label, max_results_delivery from plans order by name;
```

Lo esperado (semilla): Alerta `5`, Ventaja `10`, Dominio sin tope (`null` o
`-1`).
- **Si coincide**: no hay que hacer nada. Avísame para cerrar el pendiente en
  `diagnostico-seo-2026-10.md`.
- **Si no coincide**: pégame la salida. Hay que cambiar `src/data/producto.ts`,
  la tarjeta de `/precios/` y el JSON-LD en el mismo commit.

### 13.3 Dónde va cada resultado (resumen)

| Resultado | Destino |
|---|---|
| Consultas 1-6 | `src/data/datos-guias/<slug>.ts` (campos `valor`, `muestra`, `medido`) |
| Consulta 7 (sectores) | `src/data/datos-guias/sector-*.ts`, **después** de alinear frases |
| `max_results_delivery` | `src/data/producto.ts` / `/precios/` solo si difiere; si no, nada |
| Fase 3: snapshot | R2 (bucket privado) → `SNAPSHOT_URL` + credenciales en Pages (§0.3) |
