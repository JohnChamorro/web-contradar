# Informe final — plan SEO de ContRadar (octubre de 2026)

Fecha: 2026-10-02. Fase 5 (Google Play) descartada por John.

## Ramas

| Repo | Rama | Base | Qué trae |
|---|---|---|---|
| web-contradar | `seo/web` | `main` | Fases 1, 2, 3 (lista para el snapshot) y 4, hotfix de la CSP, accesibilidad y LCP |
| contradar (app) | `seo/app` | `develop` | robots.txt, tokens, evento de Umami, textos del muro, K residual, Términos, exportador del snapshot |
| contradar-design | `seo/fase-1-tecnico` | `master` | Manrope en los tokens y rótulo de pagos AA (ya sincronizado a los dos repos) |

Ningún commit lleva co-autoría. Nada está fusionado ni desplegado.

## Qué cambió, por fase

**Fase 1 — técnico.** Fuente única de producto (`src/data/producto.ts`):
planes, prueba y cifras; títulos y metas por intención; JSON-LD
(Organization con LinkedIn, WebSite, SoftwareApplication con un Offer por plan,
BreadcrumbList, FAQPage, Article con autor Person); sin meta keywords;
«App de licitaciones en Colombia» dentro del H1; sitemap con lastmod real
y familias separadas; `llms.txt`; IndexNow; `alt` y dimensiones en todas las
imágenes; Términos §2-§3 actualizados (web y app).

**Fase 2 — contenido.** Pilar `/licitaciones-colombia/`; 10 guías nuevas con
fuentes oficiales verificadas; comparativa `/guias/mejores-apps-licitaciones-colombia/`
(301 desde la URL vieja) y 3 páginas de alternativas con hub (Ley 256:
fuente y fecha por dato, invitación a corregir); 5 sectores con 43 códigos
UNSPSC cotejados; calculadora de capacidad residual (K) contrastada con la
guía CCE-REC-GI-22; migas, autor, FAQ visible, relacionadas, columna
«Recursos» en el pie; datos originales de ContRadar listos para pegar
(`docs/seo/consultas-fase-2.md`).

**Fase 3 — programático.** Diseño (`diseno-programatico.md`), exportador en la
app que corre en DEV, descarga en el build (`SNAPSHOT_URL`), páginas por
entidad, hubs nacional y por departamento, sector × departamento, buscador
estático, umbrales, `noindex` y sitemaps separados. Probado de punta a punta con
la maqueta. **No hay páginas reales hasta que corras el exportador.**

**Fase 4 — conversión.** `/diagnostico/` indexable; eventos del embudo con
Umami (web y app); UTM de la casa en todos los enlaces a la app; prueba social
lista detrás de un flag apagado; `embudo.md`.

**Fase 6 — runbook.** `runbook-manual.md`, con LinkedIn (§10).

## Antes / después

| Métrica | Antes | Después |
|---|---|---|
| URLs en el sitemap | 19 | 40 (+ entidades cuando haya snapshot) |
| Páginas | 20 | 43 |
| Lighthouse móvil home (local, simulado) | 90 · LCP 3,3 s · a11y 96 | 98 · LCP 2,3 s · a11y 100 |
| Lighthouse móvil precios / competencia / guía | 96-97 · a11y 96 | 99 · a11y 100 |
| LCP home con throttling real (brotli, 4G) | — | 2,3-2,4 s |
| Contraste AA | fallaba en todas las páginas | 0 fallos en las 43 |
| JSON-LD | 2 bloques, AggregateOffer inconsistente | válido en todas; 0 URLs sin barra final |
| Enlaces internos rotos | — | 0 |

## Hallazgos que no eran SEO

1. **La CSP bloqueaba el alta inmediata de la prueba** desde el commit 7326544:
   toda alta caía al respaldo manual. Arreglado en `seo/web` (commit 286888b).
   Si quieres desplegarlo antes que el resto: `git cherry-pick 286888b` sobre `main`.
2. **Manrope se incrustaba cinco veces** (es una fuente variable) y, al
   corregirlo, apareció un conflicto de caras que hacía caer el texto a Arial:
   resuelto con una sola cara de rango 200-800 en latin y latin-ext.
3. **Cifras**: «20 M» redondeaba hacia arriba y «13.145» estaba por encima del
   valor real; ahora copian `/public/stats` redondeado hacia abajo.
4. **PAA**: la guía decía «plan Dominio»; está en Ventaja, Dominio y la prueba.

## Cambios de la app (`seo/app`), en lenguaje de usuario

Lo que **ve** el usuario de la app:
- Perfil del licitante: el campo «Profesionales vinculados» pasa a «Socios y
  profesionales vinculados», con la definición de la guía de CCE.
- Bloque de K del pliego: la invitación a completar el perfil dice «socios y profesionales».
- Muro de cupo agotado del diagnóstico: «Recibimos tu solicitud. Hoy te escribimos para activar tu radar» (sin «en breve» ni exclamaciones; sigue siendo manual).
- Términos y condiciones: §2 y §3 con el alta inmediata.
- El título del cargador de pantalla vuelve a salir en Manrope (salía en Arial).
- Rótulo del bloque de pagos un poco más oscuro (contraste AA).

Lo que **no** ve:
- `robots.txt` propio (bloquea solo `/api/`).
- Evento `diagnostico_completado` a Umami (solo si se configuran las variables).
- Comentarios corregidos en el cálculo del K (cita de la Ley 80 y origen de la CO mínima). La constante de $511.708.497 ya era correcta: es el umbral Mipyme 2026 de CCE.
- Exportador del snapshot de la web (se corre a mano en desarrollo).

Tests: 131 en verde (exportador, K y SCE), typecheck del frontend sin errores.

## Lo que tienes que hacer (orden)

1. Revisar y fusionar `seo/app` → desplegar la app.
2. Revisar y fusionar `seo/web` → Cloudflare Pages despliega la web. Prueba de humo: llenar el formulario de prueba y comprobar que entra a la app.
3. `runbook-manual.md` §1-§3: sitemap en Search Console y Bing, `scripts/indexnow.sh --todas`, inspección de URLs.
4. Correr en prod `select name, label, max_results_delivery from plans order by name;` y las consultas de `consultas-fase-2.md`; pegarme resultados.
5. Umami (§4) y luego las variables `PUBLIC_UMAMI_*` y `VITE_UMAMI_*`.
6. Fase 3: correr el exportador en dev, subir a R2, poner `SNAPSHOT_URL` (`docs/operacion/snapshot-web.md` en contradar).
7. LinkedIn de la empresa (§10): perfil completo y las 8 primeras publicaciones.

## Decisiones pendientes

- ¿El muro de cupo del diagnóstico también debe crear la cuenta en el acto? Recomiendo que sí: es el último camino manual.
- Alerta: confirma `max_results_delivery` en prod (la web dice 5, como la semilla).
- Datos de autor que quieras sumar (trayectoria en contratación pública, LinkedIn personal).

## Riesgos

- El exportador no se ha corrido contra datos: su tiempo (20-45 min estimados) y tamaño son estimaciones.
- `intel_pagos`, `intel_prorroga`, `intel_territorio` y PAA siguen fuera de las páginas por entidad hasta cotejarlos.
- El SMMLV 2026 está en litigio (Decreto 0159 transitorio): la calculadora lo deja editable.
- Google Business Profile: no elegible (negocio solo en línea); no crearlo.
