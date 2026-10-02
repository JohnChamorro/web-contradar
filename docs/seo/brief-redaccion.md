# Brief de redacción — guías y páginas de contenido

Para cualquiera que escriba en `src/pages/guias/`, `/alternativas/`,
`/sectores/<sector>/` o la pilar. Las reglas no se negocian.

## Voz

- Español de Colombia, **tuteo** (como el resto de la web). Frase corta, voz activa.
- Cero relleno y cero muletillas de texto generado: nada de «en el dinámico
  mundo de», «sin lugar a dudas», «es importante destacar», «en conclusión»,
  «potenciar», «impulsar», «revolucionar», «solución integral», «de última
  generación», «líder».
- El primer párrafo (`<p class="lead">`) **responde la búsqueda** en 2-3
  frases. Lo demás desarrolla.
- Cantidades en numeral. Cifras con `<span class="dato">`.
- Posicionamiento: la categoría es **ganar**, no buscar. ContRadar aparece
  donde ayuda de verdad (una o dos menciones con enlace al módulo), nunca
  como anuncio en cada sección.

## Veracidad

- **Toda afirmación normativa se verifica en la fuente oficial** antes de
  escribirla (WebFetch a la norma o guía), y la fuente va en `fuentes` con
  enlace: Ley 80 de 1993, Ley 1150 de 2007, Ley 1882 de 2018, Decreto 1082 de
  2015, guías y manuales de Colombia Compra Eficiente, Secretaría del
  Senado (secretariasenado.gov.co), Función Pública (funcionpublica.gov.co),
  colombiacompra.gov.co, confecamaras.org.co / rues.org.co (RUP).
- Si no puedes verificar un dato en una fuente oficial, **no lo escribas**.
  Si una cifra cambia cada año (SMMLV, topes de cuantía), di el año y de dónde
  sale el valor.
- **Cero cifras inventadas.** Los datos propios de ContRadar van con
  `<DatoContRadar id="…" />` y nacen en `null` (ver abajo).
- Nada sobre procesos *ofertados* (perdidas, tasa de éxito, rivales) como
  dato de ContRadar: su cobertura no está validada (puerta G6).
- Datos de producto (planes, precios, prueba): **importa de
  `src/data/producto.ts`**, nunca los escribas a mano.
- Protección de datos (Ley 1581 de 2012): ningún nombre de persona natural
  contratista ni cédula. Solo entidades públicas y personas jurídicas.

## Comparativas con competidores (Ley 256 de 1996)

- Solo información pública y verificable, con fecha («información pública a
  octubre de 2026») y enlace a la fuente de cada afirmación.
- Tono respetuoso, sin denigrar. Si no encuentras el precio público, di «no
  publica precio» — no lo estimes.
- ContRadar incluido con sus límites reales (qué no hace).
- Línea final que invita a los competidores a pedir correcciones
  (soporte@contradar.com.co).

## Estructura técnica de una guía

```astro
---
import GuideLayout from "../../layouts/GuideLayout.astro";
import DatoContRadar from "../../components/guias/DatoContRadar.astro";
const faq = [{ q: "…", a: "…" }];          // 3-5 preguntas reales; se ven y van a FAQPage
const fuentes = [{ titulo: "Decreto 1082 de 2015", url: "https://…", nota: "art. 2.2.1.2.1.5.1" }];
---
<GuideLayout
  title="… (≤ 60 caracteres, con la búsqueda principal)"
  description="… (140-160 caracteres, beneficio + invitación)"
  h1="…"
  slug="<slug registrado en src/data/guias.ts>"
  datePublished="2026-10-02"
  faq={faq}
  fuentes={fuentes}
  consultadas="2026-10-02"
  relacionadas={["slug-a", "slug-b"]}
>
  <p class="lead">…</p>
  <h2>…</h2> …
  <DatoContRadar id="…" />
  <!-- La FAQ se pinta al final del cuerpo como <h2>Preguntas frecuentes</h2> + <h3>/<p>. -->
</GuideLayout>
```

- Clases disponibles dentro de la guía: `lead`, `callout` (caja de nota),
  `<div class="tabla-scroll"><table>…</table></div>` para tablas.
- 1.200-2.200 palabras según la intención. Jerarquía real: H2 → H3, sin saltos.
- Enlaces internos: al menos 3 (otras guías, el módulo de producto
  pertinente, la pilar `/licitaciones-colombia/`). Siempre con barra final.
- El layout ya pone: migas, CTA de diagnóstico por NIT, fuentes, autor y
  relacionadas. No los repitas en el cuerpo.

## Datos originales de ContRadar

1. Pon `<DatoContRadar id="<id>" />` donde aporte.
2. Declara el id en `src/data/datos-guias/<slug>.ts`:
   ```ts
   import type { DatoGuia } from "../datos-guias";
   export default {
     "<id>": { frase: "La mediana … fue {valor} …", valor: null, muestra: null,
               periodo: "procesos adjudicados en 2025", consulta: "<id>", medido: null },
   } satisfies Record<string, DatoGuia>;
   ```
3. La consulta SQL que lo mide va en `docs/seo/consultas-fase-2.md` con el
   mismo id. John la corre en prod y pega el resultado; hasta entonces el
   componente no pinta nada.
