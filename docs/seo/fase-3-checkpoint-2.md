# Fase 3 · checkpoint 2: primera corrida real y 3 ejemplos

> Ronda SEO 2, punto 3 (22-oct-2026). Complementa `diseno-programatico.md`
> (el diseño) y `licitaciones-abiertas.md` (el punto 2, que comparte bucket,
> descarga y plantillas). **Nada se generó en masa ni se subió a ningún
> lado**: el snapshot de prueba vive solo en el scratchpad de la sesión.

## Diagnóstico

**Qué había antes de hoy.** El diseño, las plantillas (`/entidades/[slug]`,
`/licitaciones/[sector]/[depto]`), el exportador
(`contradar/backend/scripts/exportar_snapshot_web.py`) y el runbook ya
existían, pero **el exportador nunca se había corrido**: moría en la primera
consulta (`SHOW transaction_read_only` dentro de un cursor de servidor). La web
solo se había visto con la maqueta.

**Qué pasa ahora.** Arreglado en `contradar` rama
`fix/snapshot-web-solo-lectura` (9433ea3) y corrida de prueba hecha en dev,
en transacción READ ONLY:

| | |
|---|---|
| Comando | `--corte 2026-10-22 --limite 50` |
| Duración | **28,5 min** (los dos agregados sector × departamento son 14,7 de ellos) |
| Llaves (NIT, depto) con ≥ 30 contratos | 4.187 (502 sin nombre o departamento; 673 NIT ambiguos partidos por departamento) |
| Exportadas | 50 entidades, las 50 indexables; 366 cruces sector × departamento |
| Tamaño | 665 KB JSON, 141 KB gzip |
| Personas naturales entre los proveedores | **0** |
| Build de la web con ese snapshot | 475 páginas en 13 s; sin desborde a 360 px |

**Qué pasará después.** Con los 4 arreglos de abajo y el visto bueno de John,
corrida completa (sin `--limite`), subida a R2 y tanda 1 de 400 entidades.

## Los 3 ejemplos

Capturas (escritorio 1366 y móvil 360) en el scratchpad de la sesión:
`ej-invias-…`, `ej-alcaldia-del-distrito-turistic-…`,
`ej-gobernacion-del-cauca-…` y `ej-cauca-…` (construcción × Cauca).

| | INVIAS | Alcaldía de Cartagena | Gobernación del Cauca |
|---|---|---|---|
| Tipo | nacional, obra | distrital, todos los bloques | departamental, muestra delgada |
| URL | `/entidades/invias-bogota-d-c-800215807/` | `/entidades/alcaldia-del-distrito-turistico-y-cultural-de-cartagena-de-indias-890480184/` | `/entidades/gobernacion-del-cauca-891580016/` |
| Contratos 2023-2025 | 11.767 | 24.043 | 10.392 |
| Valor adjudicado | $5.927 mil M | $4.110 mil M | $2.069 mil M |
| Desvío típico (mínima cuantía) | −20,0 % (n = 2.155; nacional −6,5 %) | −15,2 % (n = 515) | 0,0 % (n = 11) ⚠ |
| Oferentes (mediana) | — (sin fila de entidad) | 2 (n = 155) | 1 (n = 32) |
| Top proveedor | UT Vías Calarcá-Cajamarca, $221 mil M | UT Nutrición Cartagena, $385 mil M | CRIC, $338 mil M |
| Abiertos el 22-oct | 9 | 21 | 4 |

Y **construcción × Cauca** (`/licitaciones/construccion/cauca/`): 1.018
contratos por $658 mil M, mediana $62 M, 47 entidades compradoras; encabezan
la Gobernación (209 contratos), un «Fondo Municipal de Vivienda de…» (nombre cortado en la muestra) y la
Alcaldía de Popayán. Hoy sale con `noindex` (tanda posterior), como manda el
diseño.

## Lo que hay que arreglar antes de generar en masa

La regla del diagnóstico: se compara contra lo que ya se sabe antes de
creerlo. Cuatro cosas no pasan:

1. **Nombres en mayúscula sostenida (47 de 50) y con basura.** «LICITACIONES
   DE ALCALDÍA DEL DISTRITO TURÍSTICO…» en el H1 va contra la regla 12 del
   sistema visual; «GOBERNACIÓN DE BOLÍVAR//» sale tal cual en «Otras
   entidades». Arreglo: normalizar en el exportador (minúsculas con
   mayúscula inicial por palabra, conservando siglas conocidas como INVIAS,
   ICBF, SENA; quitar signos sueltos al final).
2. **La RFI aparece como modalidad (44 de 50).** «Solicitud de información a
   los Proveedores» no es una forma de contratar: es un sondeo. Va fuera de
   «Modalidades». Y unificar variantes («Licitación pública» / «Licitación
   pública Obra Publica»; «Contratación directa» / «Contratación Directa (con
   ofertas)»).
3. **Desvío de exactamente 0,0 % en 9 de 50.** En concurso de méritos es
   correcto (no se compite por precio; IDU) y ese bloque no debería pintarse
   para esa modalidad. Pero en mínima cuantía no cuadra con la media nacional
   de −6,5 %: Agencia Logística de las FF. MM. sale 0,0 % con n = 2.381. Antes
   de publicar: cotejar 10 procesos de esa entidad contra el SECOP (presupuesto
   y valor adjudicado) para saber si es real o si `price_bands` toma un
   presupuesto que ya es el adjudicado.
4. **Secretaría Distrital de Integración Social: $20,7 billones en 2023-2025**
   (5,7 / 7,2 / 7,8 por año) con 140.674 contratos, 132.071 de ellos de
   servicios profesionales. Es más de lo que cabe en el presupuesto de una
   secretaría de Bogotá (del orden de $2 billones al año, cifra de memoria por
   confirmar). Cotejar el total de un año contra la fuente antes de publicar;
   hasta entonces, sacarla de la tanda 1.

Los cuatro se arreglan en el exportador (1, 2) y con dos cotejos (3, 4). Ningún
cambio de plantilla en la web, salvo no pintar el desvío de concurso de
méritos.

## Lo que comparte con el punto 2

- **Mismo bucket R2** y misma descarga en `prebuild`
  (`scripts/descargar-snapshot.mjs` con `SNAPSHOT_URL` y, nuevo,
  `ABIERTOS_URL`).
- **El conteo «Tiene N procesos abiertos»** de cada entidad pasa a salir del
  archivo diario de abiertos y no del mensual (hoy dice «al 2026-10-22» y se
  queda así un mes).
- **Misma tabla de procesos** para la entidad (sus abiertos), el sector, el
  departamento y el sector × departamento.

## Decisiones para John

1. ¿Aprobados los umbrales y las métricas v1 tal como salieron en la prueba?
2. ¿Los 4 arreglos antes de la corrida completa? (Recomendado: sí; 1 y 2 son
   código, 3 y 4 son cotejos de una hora.)
3. Crear el bucket R2 y el token de solo lectura (sigue pendiente del
   checkpoint 1).
4. Desplegar el arreglo del exportador: **no hace falta en PRD** (corre en
   dev); basta con llevar `fix/snapshot-web-solo-lectura` a develop.
