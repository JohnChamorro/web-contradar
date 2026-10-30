# Indexación: diagnóstico de la ronda 3 (Bloque F)

Rastreo de **producción** el 30-oct-2026: sitemap, todos los enlaces internos y
todas las URLs que han existido en `src/pages` según el historial de git. Search
Console reporta 43 indexadas y 22 sin indexar. **Sin los CSV por motivo no se puede
nombrar cada URL**: aquí está lo comprobado y lo que falta. No se añadió ninguna
redirección a ciegas.

## Comprobado

| Revisión | Resultado |
|---|---|
| URLs del sitemap | 40, todas responden 200 |
| Páginas alcanzables por enlaces internos | 43, todas responden 200 |
| Enlaces internos a una URL que redirige o da 404 | 0 (producción y `develop`) |
| Canonical distinto de la URL de la página | 0 |
| Páginas de producción con `noindex` | 0 alcanzables por enlaces; la 404 lleva `noindex` |
| URLs históricas de `src/pages` que dan 404 | 0 |

## Por motivo

| Motivo (Search Console) | Páginas | Qué es, hasta donde se puede saber | Acción |
|---|---:|---|---|
| Página con redirección | 13 | Las variantes normales: `http://`, `www.`, sin barra final (`/precios` → `/precios/`, 308) y `/guias/apps-para-licitaciones-colombia/` → la comparativa (301). Todas llegan a la URL final en un salto. Es esperable: Google las reporta aunque estén bien | **Hecho:** el sitemap, los canonical y los enlaces de la web ya apuntan a la URL final. **Hecho:** la app enlazaba `/precios`, `/nosotros` sin barra (`contradar` rama `seo/ronda-3-medicion`). Con el CSV se confirma que no haya ninguna rara |
| 404 | 3 | **Sin identificar.** Ninguna sale de un enlace ni del historial. `/api/contact` y `/cdn-cgi/l/email-protection` dan 404, pero ya están en `Disallow`. Otras candidatas: rutas viejas probadas por rastreadores | Con el CSV: 301 a la equivalente si la hay; si es basura de rastreador, dejar el 404 |
| Noindex | 4 | No están en contradar.com.co. Si la propiedad de Search Console es de dominio, serán de `app.contradar.com.co`, cuyas páginas llevan `noindex, follow` a propósito (`/diagnostico`, `/prueba`, entrar) | Confirmar con el CSV. Si son de la app: intencional. Ojo: las `/ads/*`, las entidades fuera de tanda y los departamentos con menos de 10 abiertas también llevarán `noindex` cuando se desplieguen, a propósito |
| Bloqueada por robots.txt | 1 | `/api/…` o `/cdn-cgi/…`, las dos con `Disallow` desde el 13-oct, intencional | Confirmar con el CSV |
| Rastreada, sin indexar | 1 | Sin identificar. Por lo que tiene menos enlaces y contenido, candidatas: `/terminos/`, `/politica-de-datos/` o `/alternativas/licitaciones-info/` | Si es legal: ignorar. Si es una guía: enlazarla desde más páginas o consolidarla |

Una probable: la página 404 declara como canonical `/404/`, que redirige a `/404`.
No afecta a nadie porque esa página no se indexa, pero puede sumar una entrada al
informe.

## Lo que falta

Exportar las URLs de cada motivo (`runbook-ronda-3.md`, paso 1) y dejarlas en
`docs/seo/data/`. Con eso completo esta tabla y hago las 301 que correspondan.
