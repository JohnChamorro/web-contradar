# Web y app 2027: rediseño completo con tema oscuro

Hay dos trabajos, uno por repo:

| Trabajo | Repo | Referencia |
|---|---|---|
| **Web** (landing larga) | `~/eulertech/web-contradar` | `referencias/Web 2027 v2.dc.html` = marco `#16a` |
| **App**: shell, Inicio, Expediente y el módulo **Calendario** (nuevo) | `~/eulertech/contradar` | `referencias/App 2027 v2.dc.html` = marcos `#16b`, `#16c` y `#16d` |

Abre `referencias/Web y app 2027.dc.html` en el navegador: tiene los cuatro marcos lado a lado.
- Las dos referencias tienen el **botón de tema oscuro**. Úsalo para ver los dos temas.
- La app se navega desde su menú: Inicio, Mis licitaciones y Calendario.
- Las props `pantalla` (inicio, expediente, calendario) y `tema` (claro, oscuro) se pueden cambiar.

**Replícalo tal cual**: mismas proporciones, radios, pesos, tamaños, textos y orden. La maqueta usa estilos inline solo para verse sola. **No copies el HTML**: constrúyelo con los componentes y tokens del repo (`contradar-design/tokens.css`, la escala de 8 escalones, Manrope y IBM Plex Mono). Donde un valor de la maqueta no exista como token, **créalo** (§2).

**Hazlo por fases, con un PR por fase:**
1. Tokens y tema oscuro.
2. Shell de la app y el Inicio.
3. Expediente.
4. Calendario.
5. La web.

Antes de empezar, dime qué ya existe de IA (resumen del pliego, chat, llenado) y de calendario, y espera mi visto bueno.

## 0. Regla de oro
- **No se pierde ninguna función.** Lo que hoy existe y no aparece en la maqueta **se adapta de la forma más sencilla posible**, siguiendo este orden:
  1. Una fila dentro de un widget que ya existe.
  2. Una opción del menú `···`.
  3. Un enlace «Ver más» o «Ver completo».
  4. Solo si nada de eso sirve, un widget nuevo del mismo estilo: título de 2 o 3 palabras + un número o una lista corta.
- Nunca agregues una pantalla nueva sin preguntar.
- En el PR, incluye la tabla «función → dónde quedó».
- Los textos y cifras de las maquetas son **ejemplos**: usa datos reales. Si falta un dato, oculta la fila.
- Las funciones de IA (resumen del pliego, chat con documentos, llenado automático) se conectan a lo que ya exista en el backend. Si algo no existe todavía, deja el componente detrás de una bandera (`feature.ia_resumen`, `feature.ia_chat`, `feature.ia_llenado`). Que no se muestre roto.

## 1. Pantallas (igual que en los paquetes anteriores)
**La prioridad es el PC de 14″ y 15,6″.** Prueba en 1366×768, 1440×900, 1536×864 y 1920×1080. Para 27″, prueba en 2560×1440 con contenido de máximo 2080 px. Prueba también con zoom al 110 % y al 125 %. Nunca debe haber scroll horizontal.

- **App, mosaico de widgets.** Usa una rejilla CSS de 4 columnas en el Inicio y de 4 + 290 px en el Expediente.
  - **Menos de 1200 px de contenido:** el Inicio pasa a 2 columnas. En el Expediente, la columna derecha baja después del cuerpo y los widgets de la fila de datos quedan 2×2.
  - **1920 px o más:** el Inicio puede pasar a 6 columnas, con el calendario más ancho.
- **Menú lateral flotante de 236 px.** Por debajo de 1280 px se colapsa a íconos de 72 px, con tooltip.
- **Web:** el ancho de diseño es 1440, centrado con un máximo de 1440 en pantallas grandes.
  - En 1366 todo escala con `clamp()`: titulares de 80 → 56 px y paddings de 56 → 32 px.
  - La versión celular (menos de 760 px) apila todo en una columna. El círculo del hero baja debajo del texto y las tarjetas flotantes se ocultan.

## 2. Tokens nuevos y tema oscuro (fase 1)
Agrégalos a `tokens.css` con `[data-theme="dark"]` en `<html>`.
- Por defecto el tema es **claro**.
- La preferencia se guarda por usuario: en `localStorage` en la web y en el perfil en la app.
- Si el usuario no eligió, se respeta `prefers-color-scheme`.

| Token | Claro | Oscuro |
|---|---|---|
| `--bg-app` | `#F4F7FA` (app) / `#FFFFFF` (web) | `#050B15` |
| `--surface` (widget) | `#FFFFFF` | `#0E1A2B` |
| `--surface-2` (pista de barras, celdas) | `#EEF2F6` / `#F4F7FA` | `#16263B` / `#0E1A2B` |
| `--ink` | `#0A1628` | `#F2F5F8` |
| `--muted` | `#5A6E82` | `#9DAEC2` |
| `--line` | `#DCE3EA` | `#1E2E44` |
| `--action` (botón primario) | `#0D4488` | `#2F6FBF` |
| `--link` | `#0D4488` | `#74ABEA` |
| `--soft` (azul-050, «Para hoy», activo) | `#EDF4FC` | `#10233D` |
| `--alert` | `#A5231A` | `#FF8A7A` |
| `--warn-bg` / `--warn` | `#FDF3E3` / `#9E5900` | `#2A1F0C` / `#F2B347` |
| `--panel-ink` (widgets tinta: «Cómo te va», «El pliego, resumido», barra fija) | `#0A1628` | `#0A1628` (igual en los dos temas) |
| `--radar-ring` | `rgba(13,68,136,.13)` | `rgba(116,171,234,.2)` |

- **Radios nuevos:** `--radius-widget: 24px` (app), `--radius-tile: 28–36px` (bloques grandes de la web), `--radius-shell: 22px` (menú flotante), y píldora para botones de la web y chips.
- **Logo:** en oscuro se usan `cr-mark-blanco.svg` y `cr-wordmark-blanco.svg`.
- **Jade, ámbar y sello** no cambian entre temas, salvo las versiones claras de texto: jade-300 `#3AAE8C` y ámbar `#F2B347`.
- **Botón de tema:** un círculo partido (mitad llena), de 34 a 40 px.
  - En la web va en el menú superior.
  - En la app va junto al usuario, abajo del menú lateral.

### Actualiza el `CLAUDE.md` del repo
**Reemplaza** la regla de «Cards» por esta:

> **Widgets en la app, documento en los detalles largos.** El Inicio, el Expediente y el Calendario usan widgets: superficie con radio de 24 px, línea de 1 px y sin sombra. Cada widget es una cosa, con un título de 2 o 3 palabras y un número o una lista corta. No pongas una caja dentro de otra caja. Dentro de un widget, separa con líneas, no con cajas.
>
> **El color de fondo se reserva para lo que pide atención:**
> - `--soft`: Para hoy, la pestaña o el paso activo y el chat.
> - `--panel-ink`: el resumen del pliego con IA y «Cómo te va».
> - `--warn-bg`: un dato que falta o que urge.
> - `--action`: el siguiente paso.
>
> Las cifras van en el color del texto.

Agrega también: **«Firma visual: el radar.** Anillos concéntricos finos con un barrido cónico lento (9 s), solo en el hero de la web, en el cierre y en estados vacíos. Nunca en tablas ni en formularios.»

## 3. App: shell (fase 2)
- **Fondo `--bg-app` con un padding de 14 px.**
- **Menú lateral flotante** de 236 px, con radio de 22 px y línea de 1 px. Lleva:
  - El logo.
  - Los ítems de 42 px con conteo mono a la derecha. El ítem activo va en `--soft` y `--link`.
  - **Calendario** con la etiqueta ámbar «Nuevo» durante 30 días.
  - Abajo, el usuario y el botón de tema.
  - Ayuda y Cerrar sesión van en el menú del usuario. Administración y Super Admin quedan en el menú si el rol los tiene.
- **Barra superior** de 44 px, sin fondo:
  - Migas.
  - Buscador global de 320 px con «Ctrl K». Busca licitación, empresa o NIT.
  - **«Pregúntale a ContRadar»**: píldora tinta con un punto jade. Abre el chat de IA como panel lateral de 420 px que entra desde la derecha (`--motion-slow`). El chat sabe en qué pantalla está el usuario.
  - La campana con el contador en sello.
  - Este botón reemplaza al flotante de la esquina.
- El footer de hoy («Toda la contratación pública… · Términos…») sale de la app y queda solo en la web. En la app, los enlaces legales van en el menú del usuario.

## 4. App: Inicio (`#16b`)
- «Hola, {nombre}» + fecha, y a la derecha «Ver de: Todo el equipo ▾».
- **Rejilla de widgets de 4 columnas × 3 filas:**
  - **Para hoy** (2 columnas, `--soft`): 3 celdas con número mono de 46 px, el texto y la acción. El número del plazo vencido va en `--alert`. Si una celda está en 0 se oculta; si todas están en 0, el widget dice «Todo al día». La mínima cuantía entra como una línea más, como en el paquete «Modo sencillo».
  - **Cómo te va** (`--panel-ink`): «1 de cada N» + «Mejor / Como / Peor que el resto» en jade, gris o ámbar.
  - **Capacidad libre (K):** anillo de 96 px con el % comprometido y la cifra libre.
  - **Tus oportunidades** (2 columnas): el total, la barra por etapas y las 6 etapas con su conteo. Usa **los mismos datos y colores del bloque de hoy**: solo cambia el envoltorio a widget.
  - **Calendario del mes** (2×2): mini-mes con un punto de color por evento, el día de hoy con borde y «Abrir calendario →».
  - **Meta del año:** % grande + barra jade.
  - **Tu equipo:** personas con su conteo; «Sin asignar» en ámbar.

## 5. App: Expediente (`#16c`)
- **Cabecera:**
  - Título en 2 líneas como máximo, en 28 px.
  - «Entidad · Lugar · código mono».
  - A la derecha, «Etapa: ▾» y `···`.
- **Pasos:** píldoras Decidir ✓ · **Preparar** (activa, en tinta) · Resultado. A la derecha, «Documentos (N)».
- **Rejilla de 4 columnas + columna derecha de 290 px.**
  1. **Fila de datos** (4 widgets):
     - Presupuesto (+ modalidad).
     - Encaje: anillo + frase.
     - Cierre: `--warn-bg` si falta o urge, con «Ponla tú».
     - **Para presentar:** widget en `--action`, con «0 de 15» y «12 se pueden llenar con IA →».
  2. **El pliego, resumido** (3 columnas, `--panel-ink`):
     - Etiqueta «IA · N documentos leídos».
     - Filas de requisito | valor | **Cumples** (jade-300) o **Falta** (ámbar) | página mono, enlazada al PDF en esa página.
     - Abajo, «Ver completo →».
     - Si la entidad no ha publicado los documentos, el widget dice «La entidad aún no publica los documentos. Te avisamos cuando SECOP los suba.» (el estado de hoy).
  3. **Pregúntale al pliego** (1 columna, `--soft`):
     - Las últimas 1 o 2 preguntas como burbujas: el usuario en `--action` y la respuesta en `--surface`, con su página.
     - Abajo, un campo para escribir.
     - Al escribir, se abre el panel de chat completo.
  4. **Antes de ofertar** (4 columnas):
     - 4 cifras con divisores: Las ganadoras bajan · Suelen ofertar · Paga el 90 % en · Quien más le gana. Cada una con su frase corta y su enlace.
     - Debajo, filas con ícono de estado (✓ jade o ! ámbar), etiqueta, **conclusión en negrita** + frase, y la acción: Capacidad K, Garantía de seriedad y Requisitos financieros.
     - **«Basado en N procesos · confianza alta/baja» pasa a tooltip** del enlace «¿De dónde sale?».
  5. **Fila de 2 + 2:**
     - «Si ganas · de dónde sale la plata»: barras tinta.
     - «Si ganas · le adicionan» + «Fuera del municipio».
  6. **Fila de 2 + 2:**
     - «Sobre esta licitación»: Modalidad, Lugar, Plataforma, «Ver en SECOP ↗» y «Más datos del proceso ▾».
     - «Aliados para consorcio», con el botón «Buscar aliados».
- **Columna derecha** (un solo widget, con secciones separadas por líneas):
  - Responsable + Asignar.
  - Interés: un control segmentado Alta/Media/Baja.
  - Fechas: el cierre faltante en `--warn`.
  - Tareas: casillas + «+ Nueva tarea». El formulario con fecha y responsable se abre en línea al tocar.
  - Comentarios: campo de una línea que crece, con @menciones, y «Ver actividad».
- **Barra fija de abajo** (`--panel-ink`, radio de 20 px, 72 px de alto, flotando a 20 px del borde):
  - «0 de 15 listos para presentar» + «12 se pueden llenar con tus datos · 3 los subes tú» + barra de avance.
  - Botón secundario «Ya la enviamos por SECOP».
  - **Botón primario blanco «Llenar los 12 con IA».** Abre la cola de llenado: cada formato con vista previa, «Revisar» y «Aceptar». **Nada se marca como listo sin que el usuario lo revise.**
  - La barra cambia según la etapa, como en 2f/2g: en Decidir dice «No nos interesa / Sí, nos presentamos»; en Presentada, «Registrar resultado».

## 6. App: Calendario, módulo nuevo (`#16d`)
- **Ruta:** `/calendario`. Va en el menú después de Mis contratos.
- **Cabecera:** «Calendario» + Mes | Semana | Agenda + «‹ Noviembre 2026 ›» + Hoy + **«+ Nuevo evento»** (el único botón primario).
- **Columna izquierda** (250 px):
  - **Qué ver:** capas con casilla de color y conteo. Licitaciones (azul), Contratos (jade), Pólizas (ámbar), Pagos (jade-300) e Internos (`#46618B`).
  - **Próximos 7 días:** lista con una barrita de color, la fecha (en sello si es hoy), el título y el origen.
- **Mes:** rejilla de 7×6 con celdas `--surface` y línea de 1 px. Hoy va en `--soft` con borde `--link` de 2 px.
  - Cada evento es una píldora de color con **un nombre corto de 1 o 2 palabras** («Cierre Funza», «Póliza», «Reunión»). El nombre largo va en el detalle.
  - Si hay más de 2 eventos en un día, se muestra «+N más».
- **Fuentes:**
  - Los eventos del SECOP y de los contratos **entran solos**: cierres, observaciones, audiencias, pólizas, informes, cobros, fin de ejecución, recibo y liquidación.
  - Los **eventos internos** los crea el usuario con título, fecha y hora, responsable(s), «vinculado a» (opcional: licitación o contrato) y recordatorio.
  - Tocar un evento abre un panel lateral con el detalle y el enlace a su licitación o contrato.
  - Los eventos automáticos no se pueden borrar, solo ocultar.
- **Semana y Agenda:** usa el mismo estilo. Semana va en columnas por día con franjas horarias; Agenda es una lista por día.
- Reemplaza el «Mi calendario» de hoy. Si ya tiene funciones (por ejemplo, exportar o sincronizar con Google o Outlook), van en `···` del encabezado.

## 7. Web (`#16a`, fase 5)
Las secciones van en este orden, **con textos tal cual**:
1. **Hero** (860 px, fondo claro):
   - **Radar:** 6 anillos finos + resplandor radial suave + barrido cónico de 9 s, centrado a la derecha. Con `prefers-reduced-motion`, sin barrido.
   - **Foto circular** de 440 px con borde del color del fondo de 8 px.
   - **Tarjetas flotantes:** «De dónde sale la plata», el encaje 92 en azul, «Competidores probables» y la punteada «Te llegó hoy».
   - **Menú:** el logo, una píldora de navegación (Funcionalidades · Inteligencia con etiqueta «IA» · Precios · Recursos · Nosotros), el botón de tema, Ingresar (borde) y **Prueba gratis** (tinta).
   - **Texto:** eyebrow mono; H1 de 80 px en dos pesos, «Ofertar a ciegas» (300) / «se acabó.» (800); campo NIT subrayado; botón píldora tinta «Ver mi diagnóstico» con el círculo azul y la flecha.
2. **Franja de 4 hechos** con divisores.
3. **IA:** «El pliego, leído. / Los formatos, llenos.»
   - Tile tinta grande con el resumen del pliego.
   - Tile del chat con documentos.
   - Tile de llenado automático.
4. **Cuatro preguntas. Cuatro respuestas.** En 2×2, alternando claro y tinta.
5. **Banda con foto grande** (560 px, radio de 36 px) con degradado tinta abajo y el texto «Hecho para quienes / le venden al Estado.»
6. **Todo tu trabajo. Un solo lugar.** 8 módulos en 4×2. Asistente IA en tinta; Calendario en `--soft` con «Nuevo».
7. **Calendario:** texto + el mes con eventos y las capas.
8. **Del pliego a la liquidación:** 6 etapas con círculos numerados.
9. **Si vendes al Estado, es para ti:** 3 fotos verticales de 380 px (Constructoras, Ingenierías y consultoras, Proveedores).
10. **Diagnóstico gratis:** banda `--soft` con el campo NIT y el botón.
11. **Preguntas frecuentes:** acordeón de filas de 76 px con un «+» en círculo.
12. **Cierre tinta** con anillos: «10 días gratis. / Sin tarjeta.», con el botón blanco y la flecha azul, y «Ver precios».
13. **Footer** de 4 columnas + línea legal.

Más reglas de la web:
- **Fotos:** los recuadros punteados de la maqueta son espacios para fotos. Usa fotos reales del equipo o de los clientes si las hay; si no, fotos de banco **colombianas y de obra u oficina reales**, nada de personas genéricas con laptops. Pídeme la selección final antes de publicar.
  - Formato: `<picture>` con AVIF/WebP y `loading="lazy"` (excepto el hero).
- **Animación:** al entrar en pantalla, cada sección sube con un fundido de 12 px y 300 ms, una sola vez.
- **Lo que ya exista en la web actual** (precios, recursos, blog, nosotros, legales, formulario de servicios a medida, testimonios si hay) se enlaza desde el menú o el footer, o entra como sección con el mismo molde: título en dos pesos + tiles.

## 8. Aceptación
- [ ] El tema oscuro funciona en la web y en la app, se recuerda y respeta `prefers-color-scheme`. Contraste AA en los dos temas.
- [ ] Inicio, Expediente y Calendario se ven como `#16b`, `#16c` y `#16d` en 1440 y 1920, y se acomodan sin scroll horizontal en 1366.
- [ ] El Expediente conserva **todas** las funciones de hoy (tabla en el PR), más el resumen IA, el chat y el llenado, cada uno detrás de su bandera.
- [ ] El Calendario muestra los eventos automáticos y los internos, con capas, «Próximos 7 días» y «+ Nuevo evento».
- [ ] La web sigue el orden y los textos de §7. El radar respeta reduced-motion. Las fotos cargan diferido.
- [ ] La regla nueva de widgets y la firma del radar quedaron en el `CLAUDE.md` del repo.
