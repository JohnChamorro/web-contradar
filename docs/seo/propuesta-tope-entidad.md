# Propuesta: consultar el tope de mínima cuantía de una entidad

Solo propuesta. No se construye sin el visto bueno de John.

**Corrección.** El 30-oct dije que no había presupuesto por entidad. Sí lo hay:
`analytics.paa2_headers` (SECOP II) y `paa1_headers` (SECOP I) traen el presupuesto
total y los topes que cada entidad declara en su PAA.

**Qué pasa hoy.** La guía da 5 tramos y quien lee tiene que averiguar el presupuesto
de la entidad. Eso busca: «valor minima cuantia 2026» suma 207 impresiones al mes.

**Medido en dev, 30-oct, último plan 2026 de cada entidad en SECOP II:**

| | |
|---|---:|
| Entidades con tope declarado | 10.124 |
| Tramo de 28 SMMLV exacto | 48,9 % |
| Los otros 4 tramos exactos | 12,0 % |
| Otro valor | **39,1 %** |

Ese 39,1 % es el problema: hay valores del año anterior ($39.858.000 era el de 2025
con el salario anterior, por confirmar), propios y erratas ($490.253.400 es la menor
cuantía escrita como mínima, 151 planes). Y el 8,6 % de los planes con ese dato no
cumple que la mínima sea el 10 % de la menor.

**Qué pasará si se hace.** Una página `/herramientas/tope-minima-cuantia/`: buscas la
entidad y ves dos cifras con su origen, nunca una sola:

1. **Lo que declaró:** el valor de su PAA, con la fecha.
2. **Lo que da la ley:** el tramo calculado con su presupuesto total del PAA.

Si no coinciden, lo dice y remite a la invitación. Estática, sin consultas en vivo,
con el mismo mecanismo del snapshot de entidades (VPS de 7 GB).

**Antes de construirla:** medir cuántas entidades tienen presupuesto total creíble,
sumar SECOP I y cotejar 20 entidades contra su PAA publicado.
