# Créditos de fotos — public/fotos/

Fotos de archivo de Unsplash (licencia Unsplash, uso comercial permitido).
Autoalojadas: cero llamadas a Unsplash desde producción.

Cuando llegue la sesión fotográfica real, reemplazar cada archivo `.jpg` con el
mismo nombre y regenerar su `.webp`:

```bash
convert NOMBRE.jpg -quality 82 NOMBRE.webp
```

| Archivo | Tema | Origen |
|---|---|---|
| uso.jpg | Escritorio con analítica en pantalla | https://images.unsplash.com/photo-1460925895917-afdab827c52f |
| obra.jpg | Obreros en obra (estructura y varilla) | https://images.unsplash.com/photo-1504307651254-35680f356dfd |
| firma.jpg | Firma de documentos | https://images.unsplash.com/photo-1450101499163-c8848c66ca85 |
| territorio.jpg | Obra panorámica, equipo en placa | https://images.unsplash.com/photo-1541888946425-d81bb19240f5 |
| sector-construccion.jpg | Construcción — obreros en estructura | https://images.unsplash.com/photo-1504307651254-35680f356dfd |
| sector-ingenieria.jpg | Ingeniería — trabajo técnico en campo | https://images.unsplash.com/photo-1581092918056-0c4c3acd3789 |
| sector-salud.jpg | Salud — personal en centro médico | https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d |
| sector-telecomunicaciones.jpg | Telecomunicaciones — torre y red | https://images.unsplash.com/photo-1544197150-b99a580bb7a8 |
| hero-trabajo.jpg | Manos al teclado; en la pantalla, MONTAJE del tablero real de la app (dashboard-inicio.webp compuesto por perspectiva, 1-sep-2026) | https://images.unsplash.com/photo-1498050108023-c5249f4df085 |

Las cuatro `sector-*` se bajaron el 2026-09-01 a `w=1200&q=80`, se recortaron
a 4:3 y se sirvieron a 800×600 (van en tarjetas pequeñas): 19–87 KB en webp.
`obra.jpg` quedó sin uso al sustituirse la foto única de la sección por estas
cuatro; se conserva por si vuelve a hacer falta.

Descargadas el 2026-07-26 con parámetros `w=1600&q=80&auto=format&fit=crop`
(territorio: `w=2000`).
