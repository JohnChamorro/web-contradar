# Ronda SEO 4 — 21-nov-2026

Rama `seo/ronda-4` (árbol `~/eulertech/web-seo-r4`), fusionada en `develop` local.
**Nada en `main`: John revisa en localhost:4344 y publica.**

Datos de partida: Search Console, últimos 3 meses, exportado el 21-nov-2026
(`docs/seo/data/2026-11-21/`).

## 1. Diagnóstico

**Qué pasaba antes (20-ago a 30-sep):** 0 a 3 clics al día, unas 20 impresiones
al día, 5 a 17 impresiones por semana en las respuestas con IA de Google.

**Qué pasa ahora (oct y nov):** 295 clics y 21.100 impresiones en 3 meses, casi
todo desde la primera semana de octubre; 3 a 13 clics en día hábil (17 el
19-nov, el mejor día). Posición media 5,9. CTR 1,4 %. En respuestas con IA,
6.450 impresiones, de 614 a 1.218 por semana.

| Página | Impresiones | Clics | CTR | Posición |
|---|---:|---:|---:|---:|
| /guias/minima-cuantia/ | 10.694 | 92 | 0,86 % | 5,5 |
| /guias/poliza-de-seriedad-de-la-oferta/ | 1.571 | 19 | 1,21 % | 5,0 |
| /guias/secop-i-vs-secop-ii/ | 1.190 | 13 | 1,09 % | 7,3 |
| /guias/capacidad-residual/ | 1.103 | 17 | 1,54 % | 5,6 |
| /guias/que-es-el-paa/ | 968 | 5 | 0,52 % | 7,0 |
| / | 332 | 78 | 23,5 % | 4,4 |

Lo que explica el CTR bajo:

1. **La mitad de todo es una guía y una pregunta de cifra.** 98 consultas de
   mínima cuantía suman 3.583 impresiones y 6 clics. Quien busca «valor mínima
   cuantía 2026» quiere un número; Google lo muestra en el resultado o en su
   respuesta con IA y la persona no entra. Los títulos ya estaban bien.
2. **Estamos en la primera página, no en el top 3.** «minima cuantia 2026»
   (1.394 impresiones) está en posición 8,0.
3. **La gente usa otras palabras.** «k residual» (posición 9,7) no aparecía en
   ningún título.
4. **La marca no es primera:** «contradar» en posición 2,1.
5. **Búsquedas que no atendíamos:** la mínima cuantía del Código General del
   Proceso (36 impresiones), preguntas del curso de SECOP II sobre el PAA, y
   competidores sin página de comparación (Licitarus 33, Colombia Licita 42).

**Qué pasará con los cambios:** se le da a quien busca la cifra una razón para
entrar que Google no puede resolver en el resultado (el tope de SU entidad), se
atienden las palabras que faltaban y se abre contenido que otros pueden
enlazar. Lo de títulos y secciones se nota en 2 a 4 semanas; la herramienta y
las fichas de entidades, en 1 a 3 meses; la autoridad (enlaces), en 3 a 6. No
se garantiza el top 3 en «mínima cuantía 2026»: ahí compiten Colombia Compra
Eficiente y Función Pública.

## 2. Herramienta: tope de mínima cuantía por entidad

`/herramientas/tope-minima-cuantia/`. Escribes la entidad y ves el tope que
declaró en su PAA de SECOP II, en pesos y en SMMLV, con la fecha del plan y una
lectura: coincide con un tramo de la Ley 1150, es un tope del año anterior, es
una menor cuantía escrita como mínima, o es otro valor.

**Corrige la propuesta del 30-oct** (`propuesta-tope-entidad.md`), que planteaba
mostrar además «lo que da la ley» calculado con el presupuesto total del PAA.
**No se puede:** `ppto_total` es el valor de lo que la entidad planea comprar, no
su presupuesto anual. Un colegio con PAA de $64 M declara tope de $148,8 M
porque usa el presupuesto del ente territorial; la Comisión Colombiana del
Océano, con PAA de $1.638 M, declara el tramo más alto. Calcularlo sería
publicar una cifra inventada.

Medido en dev el 21-nov-2026, último plan 2026 de cada entidad:

| | Entidades |
|---|---:|
| Con plan 2026 en SECOP II | 10.503 |
| Con tope declarado mayor que cero (las que se publican) | 10.185 |
| Tramo exacto de la ley en 2026 | 6.239 (61 %) |
| · de ellas, el tramo más bajo ($49.025.340) | 5.007 |
| Tope de 2025 sin actualizar | 419 |
| Menor cuantía escrita como mínima | 78 |
| Otro valor | 3.449 |

El «otro valor» no es todo error: $35.018.100 son 20 SMMLV, el límite de los
fondos de servicios educativos (Ley 715 de 2001, art. 13); hay también 15, 25,
30 y 50 SMMLV exactos y cifras redondeadas.

**¿Es creíble lo declarado?** Se cruzó con los procesos de mínima cuantía de
2026 de esas entidades en SECOP I y SECOP II (`scripts/tope-minima/validacion.sql`):
1.678 entidades con 3 o más procesos, 60.366 procesos, **171 por encima del tope
(0,28 %)**; el 97,3 % de las entidades no tiene ninguno por encima.

**Dónde queda cada entidad.** Dos fuentes mentían y se descartaron:

- El NIT cruzado con SECOP I: el NIT 890210945 es la Alcaldía de Guavatá
  (Santander) y en SECOP I trae 783 procesos de Guayabal de Síquima
  (Cundinamarca). Cruzando solo por NIT, 2.923 entidades quedaban en otro
  departamento.
- El departamento de las líneas del plan (`paa2_items.departamento`): ponía a la
  Alcaldía de Caucasia en Cauca y a la de Istmina en Cesar.

Queda una sola: los procesos de la entidad en SECOP II, por NIT **y** nombre
(`lugar.sql`), y solo si el 80 % cae en el mismo lugar. Resultado: 7.562 con
departamento y 6.759 con municipio. El resto se muestra sin lugar: es peor
decir mal dónde queda una alcaldía que no decirlo.

**Solo SECOP II** en el dato del tope, y está justificado en `consulta.sql`: en
la base no hay cabeceras de PAA de SECOP I.

Regenerar (cada trimestre y al cambiar de año), con la base de dev arriba:

```bash
cd ~/eulertech/web-contradar
node --experimental-strip-types scripts/tope-minima/generar.mjs
npm test
```

## 3. Lo demás que cambió

| Qué | Dónde | Por qué |
|---|---|---|
| Salario mínimo y tramos en un solo archivo | `src/data/cuantias.ts` | La guía de mínima cuantía y la herramienta calculan sus cifras desde ahí. Cambio de año: `runbook-smmlv.md` |
| Enlace a la herramienta desde la entrada de la guía | `guias/minima-cuantia` | Es la razón para entrar |
| Sección y pregunta sobre la mínima cuantía del Código General del Proceso | `guias/minima-cuantia` | 36 impresiones que llegaban a una página que no las respondía |
| «K residual» en título, descripción, entrada y primera pregunta | `guias/capacidad-residual`, calculadora | Es como lo busca la gente (posición 9,7) |
| «¿Para qué sirve el PAA?», fecha de los planes de 2027, enlace al tope | `guias/que-es-el-paa` | Preguntas del curso de SECOP II que llegan por Google; enero es temporada de PAA |
| Alternativa a Licitarus y a Colombia Licita | `alternativas/` | 75 impresiones de marca sin página. Datos de sus webs el 21-nov |
| Licitarus al día en la comparativa | `guias/mejores-apps…` | Cambió planes ($250.000, $750.000, $1.500.000) y ya no declara alertas por WhatsApp. No se tocó URL, título ni H1 |
| Estudio con datos propios | `guias/a-que-precio-se-gana-una-licitacion-de-obra` | Contenido que otros pueden enlazar. **Pide revisión de John antes de publicar** (ver §5) |
| Evento `tope_minima_consultado` | `lib/analitica.ts` | Medir el uso de la herramienta |

No se hizo, a propósito:

- **La segunda pregunta del curso** («campos que SECOP II identifica de las
  necesidades del PAA…»): no encontré la fuente oficial de la respuesta y no se
  publica una respuesta de examen sin ella.
- **Una revisión completa de las 10 apps de la comparativa:** solo se
  revisaron Licitarus y Colombia Licita. La revisión mensual sigue pendiente
  (`comparativa-checklist-mensual.md`).

## 4. Medición: ya existía

Umami está en producción y cada evento lleva `entrada`, la página por la que
la persona llegó la primera vez (`docs/seo/embudo.md`). Para saber cuántas
pruebas salen de cada guía: Umami → Events → `prueba_solicitada` → Properties →
`entrada`. No hubo que construir nada.

## 5. Lo que queda en manos de John

1. **Revisar en localhost:4344** y decidir qué se publica. En especial el
   estudio de precios: usa las cifras de
   `contradar/docs/estudios/estudio-precio-optimo-obra.md` (14-ago-2026), con
   sus cautelas escritas. Si prefieres no publicar todavía la curva de precios,
   se retira la guía y su entrada en `src/data/guias.ts`.
2. **Fichas de entidades.** El respaldo se regeneró el 21-nov
   (`contradar/backend/.snapshot-web/2026-11-21/`). Falta lo de siempre: subir
   `entidades.json.gz` a R2 y poner `SNAPSHOT_URL` en Cloudflare Pages
   (`contradar/docs/operacion/snapshot-web.md`). Sigue contando solo SECOP II:
   sumar SECOP I está pendiente desde la ronda 2.
3. **La marca en primer lugar.** Buscar «contradar» en una ventana de incógnito
   y anotar qué sale arriba. Crear el Perfil de Empresa en Google (Popayán). Los
   datos estructurados de la organización ya están en la web.
4. **Enlaces.** El estudio y la herramienta del tope son lo que se puede
   ofrecer a gremios, cámaras de comercio y medios de construcción.
5. **Decreto del salario mínimo de 2027** (finales de diciembre):
   `runbook-smmlv.md`. Son 15 minutos el día que salga.
6. **Después de publicar:** pedir indexación en Search Console de
   `/herramientas/tope-minima-cuantia/`, `/alternativas/licitarus/`,
   `/alternativas/colombia-licita/` y la guía del estudio.

## 6. Cómo saber si funcionó (medir el 21-dic y el 21-ene)

| Señal | Hoy | Se espera |
|---|---|---|
| CTR de /guias/minima-cuantia/ | 0,86 % | sube; la herramienta recoge clics propios |
| Posición de «k residual» | 9,7 | top 5 |
| Impresiones de /herramientas/tope-minima-cuantia/ | 0 | aparece en «tope / valor mínima cuantía + entidad» |
| «contradar» | 2,1 | 1 |
| Pruebas con `entrada` en una guía (Umami) | sin leer | línea base el 21-dic |
