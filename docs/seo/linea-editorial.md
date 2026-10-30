# Línea editorial: «la columna de un experto»

Vale para guías, sectores y pilares. Complementa `brief-redaccion.md`, que sigue
vigente (voz, veracidad, fuentes). Estado: **modelo aplicado solo a
`/guias/minima-cuantia/`**, a la espera del visto bueno de John para el resto.

**Objetivo:** que cada guía se lea como el artículo de un experto que escribe para
ayudar. ContRadar aparece como la fuente de los datos y la herramienta que
construyó el autor. Al final se muestra por qué conviene, con datos.

## Voz

- Primera persona del autor real: John Euler Chamorro Fuertes, fundador de
  ContRadar. Credenciales textuales de `src/data/autor.ts`, sin adornos.
- Colega que explica: directo, práctico, sin jerga de marketing.
- **Ninguna experiencia inventada.** «Yo hacía», «a mí me pasó», «un cliente me
  dijo» solo si John lo confirmó. Si una sección ganaría con una anécdota, se le
  deja la pregunta «¿tienes un caso real para esta sección?»; sin respuesta, va sin
  anécdota.

## Transparencia (obligatoria)

- Firma visible: «Escrito por John Euler Chamorro Fuertes, fundador de ContRadar»,
  con fecha de publicación o de actualización (`Firma.astro`).
- Perfil real: `/nosotros/#john-chamorro`, y caja de autor al final de la guía.
- **Prohibido:** simular un foro o comunidad; inventar usuarios, comentarios,
  preguntas de «lectores» o testimonios; ocultar que el autor es el fundador.
- Las preguntas salen de búsquedas reales de Search Console («la gente busca…») o
  de preguntas de soporte que John pase anonimizadas.

## Estructura de cada guía

1. **Respuesta directa** en las primeras 2 o 3 líneas (`.lead`): la cifra, la
   definición o el paso clave. Tabla justo debajo si aplica.
2. **Explicación de experto:** cómo funciona, qué dice la norma con enlace, y los
   errores que cuestan contratos.
3. **Caja «Lo que muestran los datos»** (`<DatoContRadar>`): cifra propia con muestra
   y corte. Primera mención de ContRadar: como fuente, no como anuncio. Se publica
   solo con valor medido en PRD; mientras tanto, no se pinta.
4. **Mención del autor**, una sola vez, a mitad del texto y ligada al problema exacto
   de quien lee: «por eso construí ContRadar: para…».
5. **Cierre `<PorQueContRadar>`**: comparación de lo que cuesta a mano y lo que hace
   ContRadar, una cifra con su corte y el llamado al diagnóstico o a la prueba.
6. **FAQ** con las variantes reales de búsqueda y schema `FAQPage`.
7. **Enlaces relacionados:** 2 o 3 guías, 1 sector y 1 página de producto
   (`relacionadas` + `masEnlaces`).

## Presupuesto de menciones

**Máximo 3 por guía:** la fuente de datos, la mención del autor y el cierre. Sin
banners en el primer pantallazo.

Nada de «el mejor», «#1» ni «líder» sin prueba verificable: la publicidad debe ser
veraz y comprobable (Ley 1480 de 2011). Se muestra con datos, no se afirma.

Un llamado promete solo lo que entrega esa pantalla. Ejemplo real: el diagnóstico
gratis muestra quién gana en el sector y la zona, no el precio por entidad, que
está en la prueba (`src/pages/diagnostico.astro`).

## Normativa y cifras

- Verificada en la fuente oficial, con enlace y fecha de consulta (`consultadas`).
- Las cifras que dependen del SMMLV dicen el año y se recalculan cada enero.
- Datos propios: SQL en `consultas-fase-2.md`, corridos por John en PRD. Solo
  métricas con cobertura validada: nada que dependa de oferentes mientras la puerta
  G6 no esté verde.
- Nada de personas naturales (Ley 1581).

## Fecha de actualización

`dateModified` solo cuando cambia contenido visible de fondo. Cambiar un title o
añadir un enlace no es actualizar una guía.

## Lista para revisar una guía

- [ ] ¿La búsqueda se responde en las primeras 3 líneas?
- [ ] ¿Cada cifra y cada norma tienen fuente, fecha o muestra?
- [ ] ¿Hay alguna experiencia personal que John no haya confirmado?
- [ ] ¿Cuántas menciones de ContRadar hay? (Máximo 3.)
- [ ] ¿El llamado promete solo lo que entrega?
- [ ] ¿FAQ visible, con schema y con búsquedas reales?
- [ ] ¿2 o 3 guías, 1 sector y 1 producto al final?
- [ ] Build, tests y lectura a 360 px.
