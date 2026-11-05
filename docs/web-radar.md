# Web Radar: la portada con Radar, el asistente

Paquete: `handoff/web-radar` (5-nov-2026). Reemplaza el orden de `web-2027-v3`. Se mantienen
los tokens, el tema oscuro, el logo, la tarjeta del pliego y el menú de siempre.

## Orden

1. **Hero:** el de antes. Radar, encima de la tarjeta, narra lo que hace: leyendo,
   marcando, revisando, llenando y «Listo: 12 de 15». La tarjeta llega al final en 3 s.
2. **Llenado de formatos** (`#formatos`, banda tinta): `FormatosBanda.astro`.
   «Llenar mis formatos» lleva a `#solicitar`.
3. **Cifras del SECOP:** salen de `data/producto` (`CIFRAS`, `DESDE`). Dice
   «proveedores perfilados» y no «empresas», como pide `CIFRAS.empresas`.
4. **Así funciona:** las 4 escenas propias (`EscenaAsi`), como las pidió John el 4-nov.
   No es la tarjeta de la referencia.
5. **Inteligencia** (3 tiles «Ejemplo»), con enlace a `/inteligencia/`.
6. **Alertas diarias**, con enlace a `/producto/busquedas/`.
7. **Todo lo que Radar hace por ti** (`#modulos`, `ModulosRadar.astro`): 9 tarjetas en
   scroll horizontal, cada una con «Ver más» a su página de producto.
8. **Del pliego a la liquidación** (`#proceso`, `ProcesoRadar.astro`): Radar camina
   sobre la línea.
9. **Si le vendes al Estado** (`#para-quien`): 3 fotos con el texto encima.
10. **Precios:** los publicados, con Mensual | Anual. El anual es el precio real
    de `data/producto` (20 % menos).
11. **Equipo** (`#nosotros`).
12. **Preguntas frecuentes** (`#faq`): suma «¿Quién es Radar?» y «¿Radar presenta
    la oferta por mí?» en `FAQ_2027`, así que el FAQPage del `<head>` va igual.
13. **Cierre** (`#cierre`): Radar se asoma (escritorio).
14. **Prueba gratis** (`#solicitar`) y el pie, que ya decía «Un producto de Eulertech».

**Acompañante** (`AcompananteRadar.astro`): aparece desde el 80 % del primer scroll y
se oculta en el cierre. Lleva un mensaje por sección y abre WhatsApp.

## Qué quedó dónde

| Antes | Ahora |
|---|---|
| Gestión (Equipo, Adendas, Contratos) | Tarjetas 4, 5 y 7 de «Todo lo que Radar hace por ti» |
| Cuadrícula de 8 módulos, con enlaces a cada página de producto | Las 9 tarjetas, cada una con «Ver más» a su página. Búsquedas va en Alertas y Asistente IA en Inteligencia |
| Franja de hechos (SECOP I y II, cada mañana, IA, equipo, 7 días) | Cifras del SECOP, más «7 días gratis» en la banda de formatos y en Precios |
| Calendario (mes de ejemplo) | Tarjeta 6, con enlace a `/producto/calendario/` |
| Etapas «Del pliego a la liquidación» | La sección del proceso, con Radar |
| Chat con los documentos | Radar (preguntas frecuentes y acompañante); la página `/inteligencia/` sigue enlazada |
| Banda de foto «Hecho para quienes le venden al Estado» | «Si le vendes al Estado», con fotos |
| Todas las páginas, el menú, el pie y los recursos | Igual, sin cambios |

## Lo que se apartó del paquete

- **El chat de Radar en la web (§5) no está hecho:** necesita un backend que lea el NIT
  y responda, y no hay banderas en la web (regla del 2-nov). Hoy el acompañante abre
  WhatsApp, que es lo que el paquete pide sin chat.
- **«Recomendado» en vez de «El más elegido»:** no tenemos cómo sostener que es el más
  elegido.
- **Sin «pagas solo la diferencia»:** no está verificado en la app.
- **Sin sombras con color literal:** el acompañante usa línea, como pide el sistema.
