# Google Ads — campañas por intención

> Ronda SEO 2 (22-oct-2026). Plan para que John lo monte en Google Ads; nada
> de esto se activa solo. Precios y promesas salen de `src/data/producto.ts`.
> **No hay CPC medidos**: los presupuestos son un punto de partida a calibrar
> con el Planificador de palabras clave y las dos primeras semanas.

## Diagnóstico

- **Qué pasa ahora.** No hay campañas. En orgánico ya somos #1-#6 en
  «mejores apps de licitaciones colombia 2026», «calculadora capacidad
  residual», «app de licitaciones colombia» y «análisis de competencia
  licitaciones», y estamos fuera del top 20 en «app de licitaciones»,
  «plataforma de licitaciones colombia», «licitaciones colombia», «alertas de
  licitaciones secop», «cómo ganar una licitación» y «licitaciones de
  construcción colombia» (`seguimiento-posiciones.md`).
- **La medición es el punto delicado.** La web mide con Umami, sin cookies ni
  etiquetas de terceros, y `/politica-de-datos/` §6 lo promete («no tenemos
  Google Analytics, ni Meta Pixel, ni nada equivalente»). Sin la etiqueta de
  Google, **Ads no ve conversiones** y la puja automática va a ciegas.
- **Lo que ya tenemos y sirve.** La cookie propia `cr_atrib` guarda la URL de
  entrada —con su `gclid` cuando se llega desde un anuncio— y viaja con cada
  alta de prueba y cada diagnóstico (`Base.astro`, `crAtribucion()`; la app la
  guarda en `public._origen_web`).
- **Qué pasará después.** Ads paga por las búsquedas que hoy no ganamos en
  orgánico y deja de pagar por las que ya ganamos; cada conversión vuelve a
  Ads por importación offline sin poner su etiqueta en la web.

## Medición de conversiones

**Decidido por John el 22-oct-2026: opción A**, importación offline por
`gclid`. Hecho en `seo/ronda-2-gclid` (web: cookie y política de datos) y en
`feat/ads-gclid` del repo `contradar` (saneado y
`backend/scripts/exportar_conversiones_ads.py`). Detalle de la decisión:

| Opción | Cómo | Política de datos | Recomendación |
|---|---|---|---|
| **A. Importación offline por `gclid`** | La app ya recibe la URL de entrada; se guarda el `gclid` en un campo propio y cada semana se exporta un CSV (gclid, conversión, fecha y hora) que se sube en Ads → Conversiones → Subidas | Cambia una frase: hoy dice que `cr_atrib` «no se comparte con nadie»; con esto, el identificador del clic vuelve a Google | **Sí** |
| B. Etiqueta de Google (gtag) solo en `/ads/*` | Script de Google con cookies `_gcl_*` | Rompe la promesa del §6 y pide aviso de cookies | No |
| C. Sin conversiones | Puja por clics | Nada cambia | Solo las 2 primeras semanas, mientras se monta A |

Para A hacían falta dos cambios pequeños, ya hechos:

1. `Base.astro`: guardar `gclid` en su propio campo de `cr_atrib` (`g`). Hoy va
   dentro de la URL de entrada, que se corta a 200 caracteres: con la ruta y
   los `utm_*`, un `gclid` de ~100 caracteres puede quedar truncado.
2. `/politica-de-datos/` §6: «Si llegas desde un anuncio de Google, guardamos
   también el identificador del clic (`gclid`) y, si pides una prueba o un
   diagnóstico, se lo informamos a Google Ads para saber qué anuncio
   funcionó. No le enviamos tu nombre, tu correo ni tu NIT.»

**Conversiones a crear en Ads** (todas «Importar → Otras fuentes»):

| Conversión | Evento de la web (Umami) | En Ads | Valor |
|---|---|---|---|
| Prueba creada | `prueba_solicitada` | **Principal** | sin valor (o el precio de Ventaja mensual, $249.000, si se quiere ROAS) |
| Diagnóstico iniciado | `diagnostico_iniciado` | Secundaria | — |
| Clic en WhatsApp | `whatsapp_click` | Secundaria; **no importable** (no hay alta que lleve el `gclid`): se lee en Umami con `pagina` = `/ads/*` | — |

**Verificado el 22-oct** (Playwright sobre el build, con Umami simulado y la
API de alta interceptada; no se creó ninguna cuenta): en las tres landings,
el formulario de NIT emite `diagnostico_iniciado` con `origen: "ads"`, el
enlace de WhatsApp emite `whatsapp_click` y el alta de prueba emite
`prueba_solicitada` con `via: "app"` **antes** de navegar a la app.

## Landings

`/ads/<intención>/`, con `noindex, follow` y fuera del sitemap (no compiten
con la home ni con `/producto/*`). Contenido en `src/data/ads.ts`.

| Landing | Primer CTA | Para la campaña |
|---|---|---|
| `/ads/plataforma-licitaciones/` | Prueba gratis | 1 · Plataforma / software |
| `/ads/alertas-secop/` | Prueba gratis | 2 · Alertas |
| `/ads/competencia/` | Diagnóstico por NIT | 3 · Competencia y precio |
| `/herramientas/calculadora-capacidad-residual/` | (la herramienta) | 4 · Capacidad residual |

**URL final de cada anuncio**: la landing + sufijo de URL final de la cuenta
`utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_content={creative}&utm_term={keyword}`.
Así `cr_atrib` y la app ven «google / cpc» sin tocar nada más.

## Campañas

Una campaña de Búsqueda por intención, solo Colombia, idioma español, red de
búsqueda sin socios ni Display. Concordancia de **frase** y **exacta** al
principio; la amplia solo cuando haya 30+ conversiones importadas.

### 1 · Plataforma / software de licitaciones (comercial)

- **Palabras**: "plataforma de licitaciones", "software de licitaciones",
  "app de licitaciones", [plataforma de licitaciones colombia],
  [software para licitaciones], "programa para licitaciones", "herramienta
  para licitaciones".
- **No** pujar por «app de licitaciones colombia» ni «mejores apps de
  licitaciones colombia» en exacta: ya estamos #5 y #1 en orgánico. Revisar en
  4 semanas con el informe de pagadas + orgánicas.

### 2 · Alertas del SECOP

- **Palabras**: "alertas de licitaciones", "alertas secop", "alertas de
  licitaciones secop", "notificaciones secop", "avisos de licitaciones",
  [licitaciones secop ii alertas].

### 3 · Competencia y precio

- **Palabras**: "análisis de competencia licitaciones" (estamos #6: pujar
  solo en frase y medir canibalización), "a qué precio adjudica",
  "competidores en licitaciones", "quién gana licitaciones", "historial de
  contratos de una empresa secop".

### 4 · Capacidad residual

- **Palabras**: "capacidad residual", "k de contratación", "cómo calcular la
  capacidad residual", [capacidad residual obra pública].
- **No** pujar por «calculadora capacidad residual»: estamos #2 en orgánico.
- Presupuesto bajo: es tráfico de herramienta, convierte en diagnóstico y
  prueba más tarde.

### Negativas (lista compartida para las cuatro)

`gratis descargar`, `pdf`, `curso`, `diplomado`, `empleo`, `trabajo`,
`vacantes`, `ley 80 pdf`, `tesis`, `monografía`, `qué es el secop`
(informativa: la cubre la guía), `secop login`, `secop ii iniciar sesión`,
`registrarse en secop`, `crear usuario secop`, `colombia compra eficiente
teléfono`, `licitaciones chile`, `licitaciones méxico`, `licitaciones perú`,
`licitaciones españa`, `mercado público`, `compranet`, `subasta de carros`,
`subasta de vehículos`, `remate`, `dian subasta`.

Y negativas **de marca ajena**: no pujar por nombres de otras apps (Licitarus,
LicitaYa, GremIA, LicitIA, Licitaciones.info, Colombia Licita…). La
comparativa ya responde esa búsqueda en orgánico y pujar por marcas ajenas
invita a que pujen por la nuestra.

### Anuncios (adaptables de búsqueda)

Títulos (máx. 30 caracteres) y descripciones (máx. 90), comprobados con
`wc -m`. Fijar el título 1 solo en la campaña 4.

**Campaña 1**

- Títulos: «Plataforma de licitaciones» · «Licitaciones del SECOP I y II» ·
  «Prueba 7 días sin tarjeta» · «Mira a qué precio adjudican» · «Contra quién
  compites» · «Gestiona tus licitaciones» · «Desde $111.000 al mes» ·
  «ContRadar» · «Búsquedas automáticas» · «Tu equipo en un tablero».
- Descripciones: «Procesos de SECOP I y II con puntaje 0-100 según tu empresa,
  cada mañana.» · «Mira a qué precio adjudica cada entidad y contra quién
  compites. Prueba gratis.» · «Licitaciones y contratos en equipo, en la web.
  Nada que instalar. 7 días sin tarjeta.»

**Campaña 2**

- Títulos: «Alertas de licitaciones» · «SECOP I y II en tu correo» · «Cada
  mañana, solo lo tuyo» · «Puntaje de 0 a 100» · «Prueba 7 días sin tarjeta» ·
  «Alertas por sector y zona» · «ContRadar».
- Descripciones: «Configura tu búsqueda una vez y recibe solo los procesos que
  encajan con tu empresa.» · «Incluye los procesos que el portal nombra
  distinto. Prueba gratis, sin tarjeta.»

**Campaña 3**

- Títulos: «Análisis de competencia» · «Quién gana en tu sector» · «Diagnóstico
  gratis con tu NIT» · «A qué precio adjudican» · «SECOP I y II desde 2012» ·
  «ContRadar».
- Descripciones: «Escribe tu NIT: mira cuántos procesos ganaste y quién gana en
  tu sector y tu zona.» · «Contratos de cada competidor, con qué entidades, a
  qué precio y con qué socios.»

**Campaña 4**

- Títulos: «Calculadora de K gratis» · «Capacidad residual en 2026» · «Fórmula
  de Colombia Compra» · «Con ejemplo resuelto» · «ContRadar».
- Descripciones: «Calcula tu capacidad residual para obra pública y compárala
  con la del proceso.» · «Experiencia, liquidez, socios y contratos en
  ejecución. En tu navegador.»

Antes de publicar: «Desde $111.000 al mes» es `PRECIO_DESDE` (Alerta, plan
anual) a 22-oct; si cambia `producto.ts`, cambia el anuncio.

### Extensiones (recursos)

- **Enlaces de sitio**: Precios (`/precios/`) · Diagnóstico gratis
  (`/diagnostico/`) · Comparativa de apps
  (`/guias/mejores-apps-licitaciones-colombia/`) · Calculadora de K
  (`/herramientas/calculadora-capacidad-residual/`).
- **Textos destacados**: «7 días sin tarjeta» · «SECOP I y II» · «Puntaje
  0-100» · «Sin instalar nada» · «Soporte por WhatsApp».
- **Fragmentos estructurados** (Tipos): «Búsquedas automáticas, Estadística
  de la licitación, Análisis de competencia, Mis licitaciones, Mis contratos».
- **Llamada / WhatsApp**: +57 323 923 6742 (`producto.ts` → `telefono`), en
  horario de atención.
- **Precio**: Alerta $139.000/mes · Ventaja $260.000/mes · Dominio
  $599.000/mes (total del periodo, sin IVA adicional, como dice la FAQ de
  precios).

### Presupuesto inicial (a calibrar)

| Campaña | Diario | Mes (≈ 30 días) |
|---|---:|---:|
| 1 · Plataforma / software | $25.000 | $750.000 |
| 2 · Alertas | $15.000 | $450.000 |
| 3 · Competencia | $10.000 | $300.000 |
| 4 · Capacidad residual | $5.000 | $150.000 |
| **Total** | **$55.000** | **$1.650.000** |

Puja: «Maximizar clics» con CPC máximo las 2 primeras semanas (sin
conversiones importadas todavía); pasar a «Maximizar conversiones» cuando haya
15+ pruebas importadas en 30 días. Horario: lunes a viernes, 6:00-20:00 (es
B2B; los fines de semana se revisan a las 4 semanas).

Regla de corte a las 4 semanas: campaña con costo por prueba creada mayor que
**un mes del plan Ventaja ($249.000)** se pausa o se rehace.

## Runbook (lo que hace John)

1. Decidir la opción de medición (A recomendada) y, si es A, aprobar los dos
   cambios de arriba (los hago en una rama aparte).
2. Ads → Herramientas → Conversiones: crear «Prueba creada» y «Diagnóstico
   iniciado» como importación offline (clics).
3. Ads → Configuración de la cuenta → Sufijo de URL final: el de arriba.
4. Crear las 4 campañas con palabras, negativas, anuncios, recursos y
   presupuesto de este documento. URL final = la landing de cada una.
5. Desplegar la rama `seo/ronda-2-ads` **antes** de activar las campañas
   (las landings tienen que existir).
6. Cada lunes, en el VPS:
   ```bash
   cd /root/contradar
   docker compose exec -T backend python -m scripts.exportar_conversiones_ads > /root/conversiones-$(date +%F).csv
   cat /root/conversiones-$(date +%F).csv
   ```
   Baja el archivo y súbelo en Ads → Objetivos → Conversiones → Subidas.
   Sin fechas cubre los últimos 7 días; para otro tramo, `--desde AAAA-MM-DD
   --hasta AAAA-MM-DD`. Un mismo clic se cuenta una sola vez.
