# Lo que necesito de tu lado

**Lista viva.** Se actualiza en cada sesión: lo entregado se tacha, lo nuevo
entra al final con su fecha. Última revisión: 29-ago-2026.

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
| **A5** | **Mis contratos, con gestión** | `EjecucionSection` | 2400×1500 | Hitos, pólizas y el semáforo de salud. Es el módulo que nadie más tiene |
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

- [ ] **Nombre del módulo de análisis.** Hoy está como «Análisis de la
      licitación». Ver las opciones que te pasé.
- [ ] **Titular del hero.** Cinco opciones sobre la mesa.
- [ ] **Días de prueba.** Hoy 10. Mi recomendación es 7.
- [ ] **Nombre de la empresa demo** para las capturas.
- [ ] **Teléfono de WhatsApp** que debe aparecer en la web — hoy sale el que
      está en `consts.ts`; confirma que es el bueno para atención comercial.

---

## 4. Cosas que no son mías y bloquean

- [ ] **Desplegar la app a producción.** Todo lo que la web va a prometer
      —búsqueda ilimitada, visor, sondeos, cuotas de análisis, Mis contratos con
      gestión desde Ventaja, semestral al 12 %— está en `main` del repo de la
      app pero **no en el servidor**. La web no puede salir antes que la app.
- [ ] **Confirmar el precio del semestral** con el 12 % ya aplicado en la
      pasarela de pagos.

---

*Este documento vive en el repo de la web. Si algo se entrega, se tacha aquí
mismo en el commit que lo usa.*
