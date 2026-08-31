# Lo que necesito de tu lado

**Lista viva.** Se actualiza en cada sesión: lo entregado se tacha, lo nuevo
entra al final con su fecha. Última revisión: 30-ago-2026.

---

## 1. Material gráfico — la app cambió y el que hay está viejo

Todo lo que la web enseña hoy salió de una versión anterior del producto. Estas
son las capturas y los vídeos que hay que rehacer, en orden de impacto.

### Prioridad alta — sostienen las secciones que más venden

| # | Qué | Dónde se usa | Tamaño | Qué debe verse |
|---|---|---|---|---|
| **A1** | **Panel de análisis de la licitación** | Sección del análisis (home y funcionalidades). Hoy hay una réplica en HTML | 2400×1500, WebP | La ficha con el panel abierto y **al menos cinco bloques con dato**, donde se lean los rótulos de evidencia («basado en 47 procesos de esta entidad») y un chip de confianza. Sector obra |
| **A2** | **Perfil de empresa, pestaña Resumen** | `CompetenciaShowcase` — reemplaza `AnalisisCompetencia2.png` | 2400×1500 | Cabecera + «Contratos y valor por año» + «A quién le gana más» + «Dónde opera» |
| **A3** | **Ruedo de proponentes** | Sección de competencia | 1800×1200 | La lista de rivales ante una entidad, con ofertas y ganadas |
| **A4** | **Puntaje de relevancia** | `ScoreSection` — reemplaza `Score.png` | 2000×1250 | La lista con el anillo de score y el desglose por dimensión abierto |
| **A5** | **Mis contratos, con gestión** | `EjecucionSection` — ✅ entregada | 2400×1500 | Hitos, pólizas y el semáforo de salud. Es el módulo que nadie más tiene |
| **A6** | **Mis licitaciones, con gestión** | `CRMShowcase` — reemplaza `Seguimiento.png` | 2400×1500 | El tablero de cinco etapas con responsables y comentarios |

### Prioridad media

| # | Qué | Dónde | Tamaño |
|---|---|---|---|
| A7 | Perfil de contratante con los plazos de pago | Sección de contratantes | 2400×1500 |
| A8 | Buscador PAA | `PAASection` — reemplaza `RadarPAA.png` | 2000×1250 |
| A9 | Sondeos (RFI), listado con procesos abiertos | `SondeosSection` | 2000×1250 |
| A10 | Correo de alerta, con la cabecera nueva | Refuerzo — reemplaza `Correo.png` | 1200×1600 vertical |
| A11 | Capacidad Residual (K) con la curva a 12 meses | `CapacidadResidualSection` | 1600×1200 |
| A12 | Visor de pliegos abierto sobre un PDF | Sección del análisis | 1800×1200 |

### ~~Marcas de medios de pago de Wompi~~ — resuelto el 29-ago, no te lo pido

Los diez marcadores ya están en el repo y no hace falta que consigas nada.
Salieron del sitio del que tenían que salir: **el propio Web Checkout de Wompi**
(`https://checkout.wompi.co/bundle.js`), que los lleva embebidos y —lo que
importa— trae además la tabla `PaymentMethod.*` que dice qué icono es de qué
medio. Así la correspondencia la pone Wompi, no nuestro ojo.

Un ejemplo de por qué eso importó: el círculo rojo del bundle **no es Daviplata,
es Sufi**. Por parecido lo habríamos puesto mal.

Dos son PNG y no por descuido: Wompi no publica vector ni de PSE ni de
Daviplata (su «SVG» de Daviplata es un PNG metido en un `<pattern>`). Van a
1010×800 y 189×190, de sobra para 48 px al doble de densidad.

Viven en `public/wompi/metodos/` de los dos repos y se sirven tal cual: nada
recoloreado, nada redibujado.

### Cómo entregar A5 (y por qué esa es la forma)

El hueco de **Mis contratos** ya está reservado en la página con su proporción
final (8:5). Para que aparezca no hay que tocar código: se suelta el archivo en
`public/` con el nombre `mis-contratos.webp` (también valen `.png`, `.jpg`) y
listo — el componente lee el directorio en tiempo de compilación y lo encuentra
solo, comparando en minúsculas. Mientras no esté, se ve un marco técnico que
dice qué va ahí; nunca una imagen rota.

Es el mismo mecanismo de las fotos del equipo en `/nosotros`, y existe por lo
que pasó allí: los archivos llegaron con extensión `.JPEG` en mayúscula y en
Linux eso es un archivo distinto. Adivinar la extensión falla en silencio.

### Nuevo el 30-ago: dos secciones que aún no tienen captura

| # | Qué | Dónde | Tamaño | Qué debe verse |
|---|---|---|---|---|
| A13 | **Formulario de una búsqueda automática**, abierto | `BusquedasComoFunciona` — hoy la sección se explica sin captura | 2000×1250 | Los seis campos con datos: sectores, palabras incluir/excluir, territorio, rango de valor, tipo de contrato y el selector SECOP I/II |
| A14 | **La ayuda abierta sobre una pantalla real** | `AyudaSection` — hoy hay una maqueta en HTML | 1400×1100 vertical | El panel de ayuda encima de la ficha de una licitación, respondiendo sobre una cifra del análisis |

Las dos son opcionales: ambas secciones ya funcionan con la maqueta en HTML,
que además nunca envejece. Solo valen la pena si la captura real se ve mejor
que la maqueta.

### Vídeos y GIF

| # | Qué | Duración | Tamaño |
|---|---|---|---|
| V1 | **De la licitación al análisis**: lista → clic → ficha → «Ver competencia» → aparecen los bloques con sus rótulos | ≤12 s | 1600×1000, ≤4 MB |
| V2 | **Diagnóstico gratis**: NIT en el hero → pantalla cargando → resumen de la empresa | ≤12 s | 1600×1000, ≤4 MB |
| V3 | Búsqueda por sinónimos, actualizado — reemplaza `BusquedaAlcantarilla.mp4` | ≤10 s | 1400×788 |

### Reglas para todas las capturas

- **Ningún nombre real.** Ni de clientes, ni de competidores, ni de personas.
  Usa el diccionario de abajo para que el mismo rival se llame igual en todas.
- Las **entidades públicas** pueden ir reales si el dato es público, pero para
  la landing prefiero también inventadas: es una pieza de marketing, no un
  informe.
- **Modo claro**, ventana limpia, sin barra de marcadores ni pestañas.
- Sin datos de prueba visibles («John nombre», «test», correos internos).

### Diccionario de nombres inventados — usar SIEMPRE estos

Ya están en la web; que las capturas coincidan es lo que separa un sitio
cuidado de un collage.

| Rol | Nombre |
|---|---|
| Entidad contratante | **Gobernación del Altiplano** · **Alcaldía de Villa Central** |
| Rival principal | **Constructora Meridiano S.A.S.** |
| Rival en consorcio | **Consorcio Vías del Norte** |
| Rival tercero | **Ingeniería Vertex Ltda.** |
| Rival cuarto | **Obras y Proyectos Arco S.A.S.** |
| Empresa del cliente (demo) | *(por definir — dime cuál prefieres)* |

---

## 2. Datos de demo que hay que sembrar antes de capturar

Sin esto, la mitad de las capturas salen con pantallas vacías.

- Una **empresa demo** con: 12-18 licitaciones repartidas en las cinco etapas
  del tablero, 3-4 contratos en ejecución con hitos y pólizas, 2 consorcios, un
  Kr calculado y 3 meses de historial para el reporte de ROI.
- Una **licitación de obra de referencia**, real o sembrada, que tenga los ocho
  bloques con buen nivel de evidencia. De ella salen A1, A12 y V1.

---

## 3. Decisiones que necesito de ti

- [x] ~~**Nombre del módulo.**~~ Decidido el 29-ago: **«Estadística de la
      licitación»** y **«Análisis de competencia»**.
- [x] ~~**Días de prueba.**~~ Decidido: **7 días**. Aplicado en la web.
- [ ] **Titular del hero.** Doce opciones sobre la mesa; mi voto es «Lo que el
      pliego no dice, nosotros lo medimos».
- [ ] **Nombre de la empresa demo** para las capturas.
- [ ] **Teléfono de WhatsApp** que debe aparecer en la web — hoy sale el que
      está en `consts.ts`; confirma que es el bueno para atención comercial.

---

## 4. Pendientes de desarrollo en la app (los haces tú al cerrar la web)

Nombres decididos el 29-ago. La web ya los usa; la app todavía no.

| Qué | Dónde | Estado en la web | Estado en la app |
|---|---|---|---|
| **«Estadística de la licitación»** — antes «Inteligencia por licitación» | `frontend/src/components/BloquesInteligencia.tsx` (cabecera del panel), `InteligenciaCompetir.tsx`, mensajes de `plan_gates.py` | ✅ aplicado | ⬜ pendiente |
| **«Análisis de competencia»** — antes «Competencia» a secas | menú lateral (`Layout.tsx`), pestañas de `Analisis.tsx` | ✅ aplicado | ⬜ pendiente |
| **«Gestión de equipo»** como paraguas de Mis licitaciones y Mis contratos | menú lateral, `Reports.tsx`, copy de los gates | ✅ aplicado | ⬜ pendiente |
| **Prueba de 7 días**, antes 10 | `plans.trial`, correos de la secuencia de trial, copy del onboarding | ✅ aplicado | ⬜ pendiente |

> Ojo con el trial: la web ya promete 7 días. Mientras la app siga en 10, no hay
> daño (damos de más), pero los correos de la secuencia dicen «te quedan N días»
> y van a descuadrar.

---

## 5. Cosas que no son mías y bloquean

- [ ] **Desplegar la app a producción.** Todo lo que la web va a prometer
      —búsqueda ilimitada, visor, sondeos, cuotas de análisis, Mis contratos con
      gestión desde Ventaja, semestral al 12 %— está en `main` del repo de la
      app pero **no en el servidor**. La web no puede salir antes que la app.
- [ ] **Confirmar el precio del semestral** con el 12 % ya aplicado en la
      pasarela de pagos.

---

*Este documento vive en el repo de la web. Si algo se entrega, se tacha aquí
mismo en el commit que lo usa.*
