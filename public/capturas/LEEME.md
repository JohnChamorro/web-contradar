# Capturas de la web — sueltas el archivo aquí y ya

Esta carpeta es el único sitio donde van las capturas y vídeos del producto.
**No hay que tocar código**: el sitio lee este directorio al compilar y usa lo
que encuentre.

## Las tres reglas

1. **El nombre manda, la extensión no.** `perfil-competidor.webp`,
   `perfil-competidor.PNG` o `perfil-competidor.jpg` valen igual. Si hay varias,
   gana la mejor: `webp` → `avif` → `png` → `jpg`.
2. **Mayúsculas y minúsculas dan igual.** `Perfil-Competidor.WEBP` entra.
   (Esto existe porque las fotos del equipo llegaron en `.JPEG` mayúscula y en
   Linux ese es otro archivo: el sitio decía «no hay foto» sin quejarse.)
3. **Nada de espacios en el nombre.** Un espacio en una URL no lo sirve todo
   proxy. Ya nos pasó con `Busqueda automatica.png`.

Una imagen y un vídeo **no pueden compartir nombre base**: el descubrimiento
acepta `.mp4`, así que `algo.mp4` podría acabar de póster de sí mismo. Por eso
los vídeos llevan sufijo `-video`.

## Lo que el sitio ya está esperando

Suelta cualquiera de estos y aparece en el siguiente despliegue.

| Archivo | Dónde sale | Tamaño | Qué debe verse |
|---|---|---|---|
| `mis-contratos.webp` | Mis contratos — **hoy se ve el hueco** | 2400×1500 | Hitos, pólizas con vigencia y el estado de cada entrega |
| `perfil-competidor.webp` | Análisis de competencia | 2400×1500 | Cabecera + contratos y valor por año + a quién le gana + dónde opera |
| `mis-licitaciones.webp` | Póster del vídeo del tablero | 2400×1500 | Los **seis** carriles, con responsables. Que se vea Perdidas al final |
| `mis-licitaciones-video.mp4` | Vídeo del tablero | ≤12 s · 1600×1000 · ≤4 MB | Arrastrar una tarjeta de carril a carril |
| `puntaje-relevancia.webp` | Puntaje de relevancia | 2000×1250 | La lista con el anillo y el desglose por dimensión abierto |
| `buscador-paa.webp` | Plan anual (PAA) | 2000×1250 | El buscador con resultados y filtros |
| `busqueda-inteligente.png` | Póster del vídeo de búsqueda | 1400×788 | *(ya está el de julio)* |
| `busqueda-sinonimos.mp4` | Vídeo de búsqueda por sinónimos | ≤10 s · 1400×788 | *(ya está el de julio; reemplazable)* |

## Reservados — dilo y los monto

Estas secciones hoy están dibujadas en HTML y **no envejecen**, así que la
captura solo vale la pena si se ve mejor que la maqueta. El nombre ya está
apartado; avísame cuando tengas el archivo y lo conecto.

`panel-estadistica` · `ruedo-proponentes` · `perfil-contratante` ·
`sondeos-rfi` · `correo-alerta` · `capacidad-residual` · `visor-pliegos` ·
`busqueda-automatica-form` · `ayuda-en-pantalla`

## Reglas de contenido (valen para todas)

- **Ningún nombre real** de cliente, competidor ni persona. Usa el diccionario:
  Gobernación del Altiplano · Alcaldía de Villa Central · Constructora
  Meridiano S.A.S. · Consorcio Vías del Norte · Ingeniería Vertex Ltda. ·
  Obras y Proyectos Arco S.A.S.
- Modo claro, ventana limpia, sin barra de marcadores ni pestañas.
- Sin datos de prueba visibles («John nombre», «test», correos internos).
