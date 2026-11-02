# Capturas de la web

Una carpeta por página, con la captura de escritorio y, si es ancha, su versión
para celular (`<nombre>-movil-<tema>.webp`, tomada con la app a 390 px), en
claro y oscuro:

| Carpeta | Página |
|---|---|
| `busquedas/` | /producto/busquedas/ (también #paa y #sondeos) |
| `estadistica/` | /producto/estadistica-de-la-licitacion/ y /inteligencia/ («Antes de ofertar») |
| `competencia/` | /producto/analisis-de-competencia/ |
| `ia/` | /inteligencia/ |
| `mis-licitaciones/` | /producto/mis-licitaciones/ |
| `mis-contratos/` | /producto/mis-contratos/ |
| `calendario/` | /producto/calendario/ |
| `avisos/` | /producto/notificaciones/ |
| `indice/` | miniaturas 16:10 de /funcionalidades/, recortadas de las de arriba |
| `diagnostico/` | /diagnostico/ |

Reglas (2-nov-2026):

- Son pantallas reales de la app con **datos inventados** (intercepción de las
  respuestas de la API): ninguna empresa, NIT, persona ni entidad real.
- Siempre las dos versiones de tema, `-claro` y `-oscuro`, que la página alterna
  con `solo-claro`/`solo-oscuro` en el `<picture>` (o en el `<img>`).
- La de celular entra con `<source media="(max-width: 759.98px)">` dentro del
  `<picture>`; la clase de tema va en el `<picture>`.
- WebP a 2x. Si una captura cambia, se regenera su miniatura de `indice/`.
