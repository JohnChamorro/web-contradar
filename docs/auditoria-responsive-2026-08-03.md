# Auditoría responsive — landing ContRadar

**Fecha:** 2026-08-03 · **Repo:** `web-contradar` · **Rama:** `main` (`299fb0a`)
**Alcance:** solo lectura. No se modificó ningún archivo fuera de este informe.

---

## Resumen ejecutivo

La landing **no está calibrada para 1920px**: está calibrada para **1024px**. Ese
es el breakpoint más alto que existe en todo el código — no hay ni un `xl:`, ni un
`2xl:`, ni una sola `@media` por encima de 1024px. En un monitor de 2560px el
contenido se detiene en 1400px y deja 580px de margen muerto a cada lado.

El sistema de diseño **sí** trae una escala tipográfica fluida con `clamp()` en
`tokens.css`… y la landing **no la usa**. `var(--fs-*)` aparece exactamente **una
vez** en todo el repo, y es dentro de un archivo sincronizado, no en código de la
landing. La tipografía real vive en clases Tailwind sueltas y en 89 tamaños
arbitrarios escritos a mano.

La buena noticia para la decisión: **la app tampoco consume esos tokens**. El
acoplamiento que temías no existe hoy, así que hacer fluida la web es una
operación local y de bajo riesgo.

---

## Tabla de diagnóstico

| # | Hallazgo | Evidencia | Impacto |
|---|---|---|---|
| 1 | El marco de contenido topa en **1400px**; por encima de 1556px de viewport nada crece | [tailwind.config.mjs:140](tailwind.config.mjs#L140) `contenido: "min(1400px, 90vw)"` | **Alto** — a 2560px el contenido ocupa 54,7% de la pantalla |
| 2 | **Cero breakpoints por encima de 1024px**. `xl:` = 0 usos, `2xl:` = 0 usos | 146 `sm:`, 6 `md:`, 79 `lg:`, 0 `xl:`, 0 `2xl:`; `@media (min-width:1024px)` ×3 | **Alto** — el diseño no contempla monitor grande |
| 3 | La escala fluida de tokens **está muerta en la landing** | `var(--fs-*)`: 1 ocurrencia, en [contradar-loaders.css:136](src/styles/contradar-loaders.css#L136) (archivo sincronizado) | **Alto** — el trabajo de fluidez ya hecho no llega al usuario |
| 4 | Los tokens de marco/ritmo tampoco se usan | `var(--maxw)`: 0 · `var(--sec-y)`: 0 · `var(--gutter)`: 0 | **Medio** — [tokens.css:120-124](src/styles/tokens.css#L120-L124) es letra muerta aquí |
| 5 | El H1 del hero **se congela en 56px** a partir de 1024px | [Hero.astro:30](src/components/Hero.astro#L30) `text-4xl sm:text-5xl lg:text-[3.5rem]` | **Alto** — es lo primero que se ve pequeño |
| 6 | 38% de los tamaños de fuente arbitrarios están en **px duro** | 55 en `rem`, **34 en `px`** (`text-[10px]` ×17, `text-[11px]` ×12, `text-[9px]` ×3…) | **Medio** — no escalan y algunos son ilegibles en 27" |
| 7 | 75 valores arbitrarios en px duro en utilidades varias | `[48px]` ×13, `[44px]` ×11, `[100px]` ×6, `[10px]` ×17… | **Medio** — ritmo vertical y alturas congelados |
| 8 | Las tarjetas flotantes del hero **no escalan con la foto** | [Hero.astro:98-116](src/components/Hero.astro#L98-L116): `px-4 py-3`, `text-[0.9375rem]`, `text-[1.75rem]`, `text-xs` | **Medio** — se ven proporcionalmente diminutas al crecer la foto |
| 9 | Los `clamp()` de tokens.css topan entre **992px y 1493px** | ver tabla de topes abajo | **Alto** — aunque se consumieran, no responden a monitor grande |
| 10 | `sync-tokens.sh` es **manual**, sin hook ni CI | no aparece en `package.json` ni en `.git/hooks/` | **Bajo** — pero explica por qué nada se propaga solo |

**Nada crítico en accesibilidad de zoom** (ver punto 6 del encargo, abajo): el
`<meta viewport>` es correcto, no hay `font-size` en `vw` puro, y el `font-size`
raíz no está pisado.

---

## 1. Contenedores

**Uno principal, definido en Tailwind, no en tokens:**

| Clase | Valor | Archivo |
|---|---|---|
| `max-w-contenido` | `min(1400px, 90vw)` | [tailwind.config.mjs:140](tailwind.config.mjs#L140) |
| `max-w-cabecera` | `min(1470px, 92vw)` | [tailwind.config.mjs:141](tailwind.config.mjs#L141) |

Centrado siempre con `mx-auto` (p. ej. [Hero.astro:23](src/components/Hero.astro#L23),
[Verticals.astro:39](src/components/Verticals.astro#L39), [ArcoCinco.astro:49](src/components/ArcoCinco.astro#L49)).

**El `min()` engaña.** `min(1400px, 90vw)` sólo deja mandar al `90vw` **por debajo
de 1556px** de viewport (1400 ÷ 0.9). Por encima de eso el resultado es siempre
1400px fijo:

| Viewport | 90vw | Contenedor real | % de pantalla | Margen muerto por lado |
|---|---|---|---|---|
| 1366px | 1229px | **1229px** | 90% | 68px |
| 1556px | 1400px | **1400px** ← punto de congelación | 90% | 78px |
| 1920px | 1728px | **1400px** | 73% | 260px |
| **2560px** | 2304px | **1400px** | **54,7%** | **580px** |

**Contenedores secundarios** (mucho más estrechos, en páginas de texto):
`max-w-3xl` = 768px en [Faq.astro:13](src/components/Faq.astro#L13),
[LegalLayout.astro:25](src/layouts/LegalLayout.astro#L25),
[GuideLayout.astro:68](src/layouts/GuideLayout.astro#L68);
`max-w-4xl` = 896px en [precios.astro:23](src/pages/precios.astro#L23),
[ayuda.astro:29](src/pages/ayuda.astro#L29), [sectores.astro:19](src/pages/sectores.astro#L19).
Para prosa esto es correcto (medida de lectura) y **no debe tocarse**.

**El token del sistema está declarado pero sin usar:**
[tokens.css:122-124](src/styles/tokens.css#L122-L124) define `--maxw: 1200px`,
`--maxw-nav: 1280px`, `--maxw-app: 1440px`. Ninguno tiene consumidores (0 usos en
web y 0 en la app).

---

## 2. Unidades

**Tipografía — 89 tamaños arbitrarios escritos a mano:**

| Unidad | Cantidad | % | Ejemplos |
|---|---|---|---|
| `rem` | 55 | **62%** | `text-[0.6875rem]` ×36, `text-[0.9063rem]` ×4, `text-[3.5rem]` |
| `px` | 34 | **38%** | `text-[10px]` ×17, `text-[11px]` ×12, `text-[9px]` ×3, `text-[15px]`, `text-[13px]` |
| `vw` | 0 | 0% | — |

A esto se suman las clases de escala Tailwind (`text-lg`, `text-4xl`, `text-5xl`…),
que son `rem` por defecto pero de **paso fijo**: no interpolan.

**Espaciado:** la landing usa la escala Tailwind (`py-14`, `py-20`, `gap-10`…),
que es `rem` — correcto. Pero hay **75 valores arbitrarios en px duro**:
`[48px]` ×13, `[44px]` ×11, `[100px]` ×6 (`lg:py-[100px]`, el ritmo vertical de
sección), `[54px]` ×2 (altura de input/botón del hero), `[640px]` ×2.

Los tokens de espacio `--s-1`…`--s-9` ([tokens.css:118-119](src/styles/tokens.css#L118-L119))
son px duros por diseño, pero sólo se consumen 2 veces (`var(--s-5)`).

**Veredicto:** el grueso de la tipografía está en `rem` (bien para zoom), pero
**ningún tamaño interpola** — ni los `rem` ni los `px`. La proporción "px duro"
relevante es 38% de los tamaños arbitrarios y 75 utilidades sueltas.

---

## 3. Breakpoints

**`@media` reales en CSS:**

| Query | Veces | Dónde |
|---|---|---|
| `(prefers-reduced-motion: reduce)` | 5 | global.css y componentes |
| `(min-width: 1024px)` | 3 | [Hero.astro:132](src/components/Hero.astro#L132) (campo diagonal) y otros 2 |
| `(max-width: 379px)` | 1 | ajuste para móvil muy estrecho |

**Prefijos Tailwind:**

| Prefijo | Ancho | Usos |
|---|---|---|
| `sm:` | 640px | 146 |
| `md:` | 768px | 6 |
| `lg:` | 1024px | 79 |
| `xl:` | 1280px | **0** |
| `2xl:` | 1536px | **0** |

**Respuesta directa: no hay ningún breakpoint por encima de 1440px. Ni por encima
de 1024px.** El ancho máximo contemplado hoy por el diseño es **1024px**; de ahí
en adelante el layout es el mismo y sólo lo estira el `min(1400px, 90vw)` del
contenedor, hasta congelarse en 1400px.

---

## 4. Fluidez existente

Fuera de `tokens.css`, en código propio de la landing hay **cuatro** usos:

| Archivo | Línea | Uso |
|---|---|---|
| [tailwind.config.mjs:140-141](tailwind.config.mjs#L140-L141) | — | `min(1400px, 90vw)` / `min(1470px, 92vw)` |
| [Nav.astro:90](src/components/Nav.astro#L90) | 90 | `w-[min(620px,92vw)]` (megapanel) |
| [Nav.astro:121](src/components/Nav.astro#L121) | 121 | `w-[min(280px,90vw)]` |
| [FullBleedCTA.astro:7](src/components/FullBleedCTA.astro#L7) | 7 | `min-h-[clamp(360px,42vw,480px)]` ← **el único `clamp()` propio** |
| [Hero.astro:23](src/components/Hero.astro#L23) | 23 | `lg:min-h-[calc(100svh-4.5rem)]` (unidad de viewport, correcto) |

`contradar-loaders.css` usa `min()` dos veces, pero es archivo sincronizado desde
`contradar-design`, no código de la landing.

**En `tokens.css` sí hay fluidez… sin consumidores.** Y aunque se consumiera,
todos los `clamp()` dejan de crecer muy pronto:

| Token | Definición | Deja de crecer en |
|---|---|---|
| `--fs-dato-xl` | `clamp(1.9rem, 5vw, 3.1rem)` | **992px** |
| `--fs-display-l` | `clamp(1.75rem, 4vw, 2.7rem)` | **1080px** |
| `--fs-dato-l` | `clamp(1.4rem, 2.8vw, 1.9rem)` | **1086px** |
| `--fs-display-m` | `clamp(1.35rem, 2.6vw, 1.75rem)` | **1077px** |
| `--fs-display-xl` | `clamp(2.3rem, 5.6vw, 3.9rem)` | **1114px** |
| `--gutter` | `clamp(20px, 5vw, 56px)` | **1120px** |
| `--sec-y` | `clamp(56px, 8vw, 112px)` | **1400px** |
| `--fs-body-l` | `clamp(1rem, 1.2vw, 1.12rem)` | **1493px** |

Ninguno responde por encima de ~1500px. La escala fluida existente resuelve
móvil→portátil, **no portátil→monitor grande**.

---

## 5. Escala tipográfica

**Sí existe** en [tokens.css:107-115](src/styles/tokens.css#L107-L115):

```css
--fs-display-xl: clamp(2.3rem, 5.6vw, 3.9rem);
--fs-display-l:  clamp(1.75rem, 4vw, 2.7rem);
--fs-display-m:  clamp(1.35rem, 2.6vw, 1.75rem);
--fs-body-l:     clamp(1rem, 1.2vw, 1.12rem);
--fs-body:       .9375rem;   /* 15px — fijo */
--fs-small:      .8125rem;   /* fijo */
--fs-micro:      .6875rem;   /* fijo */
--fs-dato-xl:    clamp(1.9rem, 5vw, 3.1rem);
--fs-dato-l:     clamp(1.4rem, 2.8vw, 1.9rem);
```

**Unidades:** mezcla de `clamp(rem, vw, rem)` para display/dato y `rem` plano para
cuerpo/small/micro. Los tres tamaños de cuerpo son **completamente fijos**.

**¿La landing la consume? NO.** Una sola ocurrencia de `var(--fs-*)` en todo el
repo, y está en [contradar-loaders.css:136](src/styles/contradar-loaders.css#L136),
que es un archivo generado por `sync-tokens.sh`.

La landing **define sus fuentes sueltas**, por dos vías:
- clases de escala Tailwind: `text-4xl sm:text-5xl lg:text-[3.5rem]` ([Hero.astro:30](src/components/Hero.astro#L30))
- 89 tamaños arbitrarios `text-[…]` escritos uno a uno

**Nota lateral (no responsive, pero conviene saberlo):** el `fontFamily.sans` de
[tailwind.config.mjs:144](tailwind.config.mjs#L144) es `Manrope`, mientras
`--font-body` en [tokens.css:102](src/styles/tokens.css#L102) es `Archivo`. Las
familias también divergen entre tokens y Tailwind.

---

## 6. Meta viewport y zoom

**Todo correcto. Sin hallazgos.**

- [Base.astro:43](src/layouts/Base.astro#L43):
  `<meta name="viewport" content="width=device-width, initial-scale=1.0" />`
  Sin `maximum-scale` ni `user-scalable=no` → el zoom del navegador no está bloqueado.
- **Cero `font-size` en `vw` puro.** Los únicos `vw` tipográficos están dentro de
  `clamp()` con mínimo y máximo en `rem`, que es el patrón seguro (el `rem` mínimo
  garantiza que el zoom siga surtiendo efecto).
- El `font-size` de `:root`/`html` **no está pisado** en ningún archivo
  ([global.css](src/styles/global.css) sólo define `scroll-behavior`), así que se
  respeta el tamaño base del navegador y la preferencia del usuario.
- `body { overflow-x: clip }` ([global.css:12](src/styles/global.css#L12)) evita
  scroll horizontal accidental — bien, pero **oculta síntomas**: si al hacer la web
  fluida algo se desborda, no se verá. Conviene quitarlo temporalmente al probar.

---

## 7. Hero y medios

| Elemento | Cómo se dimensiona | Veredicto |
|---|---|---|
| Rejilla del hero | `lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]` ([Hero.astro:23](src/components/Hero.astro#L23)) | **Fluido** ✓ |
| Alto de la 1ª pantalla | `lg:min-h-[calc(100svh-4.5rem)]` ([Hero.astro:23](src/components/Hero.astro#L23)) | **Fluido** ✓ (`svh`, correcto en móvil) |
| Foto de uso | `.foto` con `aspect-[4/3.2]` ([Hero.astro:82](src/components/Hero.astro#L82)) + `img { width:100%; height:100%; object-fit:cover }` ([global.css](src/styles/global.css)) | **Fluido** ✓ — escala con la columna |
| H1 | `text-4xl sm:text-5xl lg:text-[3.5rem]` ([Hero.astro:30](src/components/Hero.astro#L30)) | **Congelado en 56px** desde 1024px ✗ |
| Párrafo | `text-base lg:text-lg` ([Hero.astro:35](src/components/Hero.astro#L35)) | Congelado en 18px ✗ |
| Tarjeta flotante superior | `absolute -top-4 right-0 max-w-[92%] px-4 py-3`, textos `text-[0.9375rem]` / `text-xs` ([Hero.astro:98-105](src/components/Hero.astro#L98-L105)) | **Posición relativa ✓ / tamaño fijo ✗** |
| Tarjeta flotante inferior | `absolute -bottom-2 left-2 px-5 py-4`, cifra `text-[1.75rem]`, rótulos `text-[0.625rem]` / `text-xs` ([Hero.astro:109-116](src/components/Hero.astro#L109-L116)) | **Posición relativa ✓ / tamaño fijo ✗** |
| Input y botón | `min-h-[54px]`, `text-base` ([Hero.astro:65](src/components/Hero.astro#L65), [:70](src/components/Hero.astro#L70)) | px fijo ✗ |

**El problema concreto del hero:** la foto crece con el contenedor pero las dos
tarjetas superpuestas mantienen padding y tipografía fijos. A 2560px la foto es un
~17% más grande que a 1920px mientras las tarjetas son idénticas — de ahí la
sensación de "elementos pegados y pequeños" sobre una imagen grande.

---

## 8. Acoplamiento web/app — la pregunta que decide todo

### ¿`tokens.css` está symlinkeado?

**No.** Hay **tres archivos físicos independientes**:

| Ruta | Rol |
|---|---|
| `~/eulertech/contradar-design/tokens.css` | **fuente de verdad** |
| `~/eulertech/web-contradar/src/styles/tokens.css` | copia generada |
| `~/eulertech/contradar/frontend/src/styles/tokens.css` | copia generada |

La propagación la hace [`contradar-design/sync-tokens.sh`](file:///home/john/eulertech/contradar-design/sync-tokens.sh),
que es un `cat` con cabecera `/* GENERADO desde contradar-design. No editar aquí. */`
volcado sobre los dos destinos.

Verificado: las dos copias son **byte a byte idénticas entre sí**, y idénticas a la
fuente salvo esa línea de cabecera.

El único symlink del repo es de skills, no de estilos:
`.claude/skills/contradar-ui → contradar-design/.claude/skills/contradar-ui`.

### ¿La app heredaría un cambio de escala tipográfica?

**No automáticamente, y hoy tampoco en la práctica.** Dos capas de desacople:

1. **La sincronización es manual.** `sync-tokens.sh` no aparece en ningún
   `package.json`, ni en hooks de git, ni en CI. Alguien tiene que ejecutarlo a
   mano y luego reconstruir cada repo.

2. **Y lo decisivo: la app tampoco consume `--fs-*`.** Mismo conteo que la web —
   **una sola ocurrencia**, en `frontend/src/styles/contradar-loaders.css:136`, el
   mismo archivo sincronizado. La app dimensiona su tipografía con clases Tailwind
   y sus contenedores con `max-w-7xl` (1280px) / `max-w-5xl` (1024px) en
   [`Layout.tsx:87`](file:///home/john/eulertech/contradar/frontend/src/components/Layout.tsx#L87).
   Tampoco usa `--maxw-app`.

**Conclusión:** si hoy cambiaras la escala tipográfica en `tokens.css`, **no
cambiaría nada visible ni en la web ni en la app**. El riesgo de acoplamiento que
motivaba esta pregunta **no existe con el código actual**.

### ¿Qué haría falta para aplicar fluidez SOLO a la web?

Muy poco, precisamente porque no hay acoplamiento real. En orden de menor a mayor
intervención:

1. **Extender `theme.fontSize` en [`tailwind.config.mjs`](tailwind.config.mjs)**
   con valores `clamp()`. Es un archivo exclusivo de la landing; la app tiene el
   suyo. **Cero riesgo de contagio.** Es la vía natural dado que la landing ya
   dimensiona todo con Tailwind.

2. **Tokens de marketing aparte**, p. ej. `src/styles/tokens-marketing.css` con
   `--fs-mkt-*` y `--maxw-mkt`, importado sólo por [`Base.astro`](src/layouts/Base.astro).
   No lo toca `sync-tokens.sh`, así que sobrevive a las sincronizaciones. Útil si
   quieres nombres semánticos propios del sitio público.

3. **Clase raíz de ámbito** (`<html class="landing">` + overrides bajo `.landing`).
   Innecesario aquí: no hay CSS compartido en tiempo de ejecución entre los dos
   repos, son builds separados. Sólo tendría sentido si algún día se sirviera la
   landing dentro de la app.

**Lo que NO hay que hacer:** editar `tokens.css` en `web-contradar`. Está marcado
`GENERADO` y el próximo `sync-tokens.sh` lo pisa sin avisar.

---

## Estrategias propuestas

### A · Escala fluida en el `tailwind.config.mjs` de la landing

Añadir `theme.extend.fontSize` con `clamp()` y subir el techo del contenedor.

```
contenido: "min(1600px, 92vw)"     // desde min(1400px, 90vw)
fontSize:  { '5xl': 'clamp(2.5rem, 3.4vw, 4.25rem)', ... }
```

| Pros | Contras |
|---|---|
| Sólo toca la landing; la app ni se entera | Hay que revisar los 89 `text-[…]` arbitrarios uno a uno |
| Las clases existentes (`text-5xl`, `text-lg`) se vuelven fluidas **sin tocar los componentes** | Los `text-[10px]`/`[11px]` siguen fijos hasta migrarlos |
| Reversible: un archivo, un `git revert` | Divergencia declarada respecto a `tokens.css` |
| Se puede desplegar por fases (primero display, luego cuerpo) | |

**Esfuerzo:** bajo para el 80% del efecto (config + hero), medio para barrer todos
los arbitrarios. **~1 día** para un resultado sólido.

### B · Tokens de marketing propios + consumo explícito

Crear `src/styles/tokens-marketing.css` con una escala fluida pensada para
1440–2560px, importarlo en `Base.astro`, y migrar los componentes a `var(--fs-mkt-*)`.

| Pros | Contras |
|---|---|
| Nombres semánticos; queda un sistema, no parches | Hay que tocar ~30 componentes |
| Inmune a `sync-tokens.sh` | Dos vocabularios tipográficos conviviendo (Tailwind + vars) |
| Base para que algún día `tokens.css` recupere el rol rector | Mayor superficie de revisión visual |

**Esfuerzo:** medio-alto. **2–3 días.**

### C · Breakpoints grandes (`xl:` / `2xl:` / `@media (min-width: 1920px)`)

Dejar la base como está y añadir saltos discretos por encima de 1280/1536/1920.

| Pros | Contras |
|---|---|
| Muy predecible: se ajusta exactamente lo que se ve mal | Saltos visibles al redimensionar |
| No arriesga nada de lo que ya funciona en móvil | Multiplica las clases por componente |
| Se puede aplicar quirúrgicamente sólo al hero | No resuelve los anchos intermedios (1600, 1792…) |
| | Deuda: cada componente nuevo debe acordarse de los 3 saltos |

**Esfuerzo:** bajo por componente, alto en mantenimiento.

---

## ¿Conviene la misma estrategia en la app?

**No. La app pide densidad, no magnificación.** Razones concretas, no de principio:

1. **Son productos distintos.** La landing es un documento de lectura lineal: el
   usuario pasa, lee y decide. Ahí agrandar tipografía y márgenes **es** la mejora.
   La app es una herramienta de trabajo con tablas de licitaciones, tableros y
   comparativas. Su usuario quiere **ver más filas sin scroll**, no letras más
   grandes.

2. **El propio sistema ya lo dice.** `--fs-body: .9375rem` (15px) lleva el
   comentario *"densidad de producto de datos"* ([tokens.css:111](src/styles/tokens.css#L111)).
   Ese 15px es deliberado y no debe crecer con la pantalla.

3. **La app ya usa cifras tabulares y mono** (`.dato`, `font-variant-numeric:
   tabular-nums`). Escalar tipografía con `vw` en tablas rompe la alineación de
   columnas, que es justo lo que esos tokens protegen.

4. **Lo que sí le falta a la app en monitor grande** es aprovechar el ancho:
   `max-w-7xl` = 1280px en [`Layout.tsx:87`](file:///home/john/eulertech/contradar/frontend/src/components/Layout.tsx#L87)
   desperdicia la mitad de un 2560. Pero el arreglo correcto ahí es **subir el tope
   del contenedor y añadir columnas/paneles** (más KPIs por fila, panel lateral de
   detalle sin modal), no agrandar el texto.

**En una frase:** en la web, más ancho = **contenido más grande**; en la app, más
ancho = **más contenido**. Son dos problemas distintos con la misma causa, y el
error caro sería resolverlos con la misma herramienta.

---

## Recomendación

**Estrategia A**, en dos tramos:

**Tramo 1 — el 80% del efecto (medio día).** Tocar sólo `tailwind.config.mjs` y
`Hero.astro`:
- subir `contenido` a `min(1600px, 92vw)` y `cabecera` en proporción
- añadir `theme.extend.fontSize` con `clamp()` para `4xl`, `5xl`, `6xl`, `lg`, `xl`
- cambiar el `lg:text-[3.5rem]` del H1 por una clase de escala fluida
- hacer que las tarjetas flotantes del hero escalen (padding y tipografía en `em`
  respecto a un contenedor con `font-size` fluido)

Esto ataca los hallazgos 1, 2, 5 y 8 de la tabla, que son los que se ven.

**Tramo 2 — barrido (medio día más).** Migrar los 34 `text-[Npx]` a `rem` o a
clases de escala, y los `lg:py-[100px]` a un token de ritmo fluido.

Descarto **B** por ahora: crear un vocabulario nuevo antes de saber qué escala
funciona en 27" es diseñar a ciegas. Si tras el Tramo 1 la escala convence,
promoverla a `tokens.css` como `--fs-mkt-*` es un paso natural y barato.

Descarto **C** como estrategia principal, aunque un `2xl:` puntual es válido para
cambios de *layout* (p. ej. pasar el hero a 3 columnas), que es lo que los
breakpoints hacen bien y `clamp()` no puede hacer.

---

## Decisiones que te quedan por tomar

1. **¿Cuál es el tope de ancho?** ¿1600px, 1800px, o `92vw` sin tope? Cuanto más
   alto, más impacto en 27" y más riesgo de que las líneas de texto queden
   incómodas de leer. Mi apuesta: **1600px**, con la prosa (`max-w-3xl`) intacta.

2. **¿Cuánto debe crecer el H1 del hero?** Hoy 56px. ¿Techo en 68px, 76px, 84px?
   Es la decisión más visible de todas.

3. **¿Se toca el cuerpo de texto?** `--fs-body` es 15px "por densidad". En la
   landing podría ir a 16–17px en pantallas grandes sin traicionar el sistema,
   porque la landing **no** es producto de datos. Requiere tu visto bueno porque
   contradice el comentario del token.

4. **¿Se declara la divergencia?** Si la landing crece su propia escala, conviene
   dejarlo escrito en `tokens.css` o en el skill `contradar-ui` para que la
   próxima sesión no lo "corrija" creyendo que es un descuido.

5. **¿Se abre ticket aparte para la app?** El `max-w-7xl` y la falta de densidad en
   monitor grande son un trabajo distinto, en otro repo, con otro criterio. No
   debería colarse en este.

6. **Menor, pero conviene resolver:** `fontFamily.sans` es `Manrope` en Tailwind y
   `--font-body` es `Archivo` en tokens. ¿Cuál manda?
