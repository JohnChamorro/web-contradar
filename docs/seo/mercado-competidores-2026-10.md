# Mercado de apps de licitaciones en Colombia — octubre de 2026

Consulta hecha el **2 de octubre de 2026** sobre las webs públicas de cada
plataforma (HTML descargado y leído, sitemaps y `robots.txt`). Cada dato lleva
la URL de donde sale. Lo que no se pudo ver se dice; no se rellena.

Base para `/guias/mejores-apps-licitaciones-colombia/` y `/alternativas/*`
(Ley 256 de 1996: solo información pública, con fuente y fecha).

Convenciones:
- «Declara» = lo dice la propia web del competidor. No lo probamos por dentro.
- Precios tal como aparecen, con su aclaración de IVA si la trae.
- No se citan nombres de personas naturales (autores, fundadores, testimonios).

---

## 1. El País Licita — elpaislicita.com

| Campo | Dato | Fuente |
|---|---|---|
| `<title>` | Buscar licitaciones públicas en Colombia \| El País Licita | https://elpaislicita.com/ |
| H1 | Buscar licitaciones públicas en Colombia. Inteligencia a tu alcance. | https://elpaislicita.com/ |
| Qué hace (declara) | Búsqueda con filtros (valor, fecha, modalidad, entidad); alertas por palabra clave, entidad y UNSPSC; chat con IA sobre el pliego («Conversa con las licitaciones»); favoritos y seguimiento; histórico de +1,5 M contratos de SECOP II; «inteligencia comercial» con dashboards; respaldada por el diario El País (Cali); alianza con la Cámara de Comercio de Cali | https://elpaislicita.com/ |
| Cobertura | «Fuente oficial: SECOP II»; histórico «de SECOP II». No menciona SECOP I | https://elpaislicita.com/ |
| Precio público | Sí. **Alertas**: desde COP 60.800/mes + IVA (anual, COP 729.600 sin IVA). **Pro**: desde COP 160.000/mes + IVA (anual, COP 1.920.000 sin IVA). Tarifa menor para afiliados a la CCC (42.560 y 112.000) | https://elpaislicita.com/ (sección Planes) |
| Prueba gratis | 1 mes, «4 cupos incluidos», sin tarjeta; 30 días para afiliados CCC | https://elpaislicita.com/ |
| App móvil | No declara app ni enlace a tiendas | https://elpaislicita.com/ |
| Arquitectura de URLs | **Sector**: `/licitaciones-construccion-colombia`, `-software-`, `-salud-`. **Sector × ciudad/depto.**: `/licitaciones/<sector>/<lugar>` (6 sectores × 5 lugares = 30 URLs: Valle, Cali, Bogotá, Antioquia, Medellín). **Pilares**: `/licitaciones-colombia`, `/licitaciones-secop`, `/buscar-licitaciones-publicas-colombia`, `/contratacion-publica-colombia`. **Ficha por proceso**: `/licitacion/<id SECOP>` (355 sitemaps de hasta 1.000 URLs). Sin entidad, sin comparativas, sin herramientas, sin blog | https://elpaislicita.com/sitemap.xml · https://elpaislicita.com/sitemaps/licitaciones/sitemap.xml |

## 2. LicitIA — licitia.com.co

| Campo | Dato | Fuente |
|---|---|---|
| `<title>` | LicitIA \| Inteligencia Artificial para Licitar en SECOP Colombia | https://licitia.com.co/ |
| H1 | Inteligencia Artificial para Licitar en Colombia. | https://licitia.com.co/ |
| Qué hace (declara) | Radar de afinidad con IA; evaluador de elegibilidad leyendo RUP/RUT/Cámara con OCR; auditoría de riesgos del pliego; generador de propuestas (borrador en Word/Excel, add-on); simulador AIU; kanban; bóveda documental con alertas de vencimiento; «Score de oportunidad», «Zonas calientes», «Curva de descuento»; alertas por correo y Telegram; API e integraciones (Power BI, HubSpot, Salesforce, Zapier); multiempresa; directorio de expertos | https://licitia.com.co/ |
| Cobertura | SECOP I, SECOP II y PAA | https://licitia.com.co/ (sección Funcionalidades) |
| Precio público | Sí, en la FAQ: Starter $15.900/mes · Especialista $29.900 · Empresarial $59.900 · Agencia $159.900 · Corporativo $299.000. No aclara IVA. Pago con MercadoPago, no se renueva solo | https://licitia.com.co/ (FAQ «¿Cuáles son los planes…?») |
| Prueba gratis | 7 días, sin tarjeta | https://licitia.com.co/ |
| App móvil | No. «100% web»; alertas al celular por bot de Telegram | https://licitia.com.co/ (FAQ «¿Necesito instalar algo?») |
| Arquitectura de URLs | 7 URLs en el sitemap: home, `/academia.html`, `/donde-buscar-licitaciones-en-colombia.html`, seguridad, login, términos, privacidad. Sin sector, ciudad, entidad, comparativas ni herramientas públicas (el diagnóstico con RUP vive en la home) | https://licitia.com.co/sitemap.xml |

## 3. iaLicitaciones (Colombia) — ialicitaciones.com/co/

| Campo | Dato | Fuente |
|---|---|---|
| `<title>` | iaLicitaciones Colombia — IA para ganar Contratación Pública | https://ialicitaciones.com/co/ |
| H1 | Gana más licitaciones con Inteligencia Artificial | https://ialicitaciones.com/co/ |
| Qué hace (declara) | Detector de oportunidades con alertas; análisis de pliegos con OCR y checklist; «memoria técnica en 1 clic» exportable a DOCX; kanban; score de encaje; inteligencia de mercado; +30 integraciones. Producto de origen español (PLACSP, TED) con versión Colombia | https://ialicitaciones.com/co/ |
| Cobertura | En Colombia: **SECOP II** («+8.000 procesos nuevos/mes»). No menciona SECOP I | https://ialicitaciones.com/co/ (sección Cobertura) |
| Precio público | Sí, **en euros**: Starter €29/mes · Pro €99/mes · Business €299/mes (anual −20 %) | https://ialicitaciones.com/co/ (sección Planes y precios) |
| Prueba gratis | 7 días del plan Pro | https://ialicitaciones.com/co/ |
| App móvil | No declara app | https://ialicitaciones.com/co/ |
| Arquitectura de URLs | Sitio global. Para Colombia solo `/co/`. El resto es de España/Europa: `/comparativa/ialicitaciones-vs-<rival>/` (7, todos rivales españoles), `/casos-de-uso/<sector>/` (9), `/licitaciones-por-sector/`, `/licitaciones-por-comunidad/` (España), `/glosario/`, `/academia/`, `/blog/`, `/mejores-herramientas-licitaciones-2026/`, `/ranking-software-licitaciones-2026/`, páginas por IA (`/chatgpt-licitaciones/`, `/claude-licitaciones/`, `/gemini-licitaciones/`) | enlaces de https://ialicitaciones.com/co/ |

## 4. Licitarus — licitarus.com

| Campo | Dato | Fuente |
|---|---|---|
| `<title>` | Software de licitaciones públicas en Colombia · Licitarus | https://www.licitarus.com/ |
| H1 | Que licitar sea un negocio. | https://www.licitarus.com/ |
| Qué hace (declara) | Búsqueda en lenguaje natural y con filtros (RUP, entidad, categoría); alertas por correo; IA que lee el pliego: resumen, red flags, score de viabilidad y requisitos cruzados con el RUP, citando página del pliego y norma; chat sobre el pliego; tablero por etapas con tareas y sincronización con Google Calendar; aviso de adendas; ficha por empresa (con quién contrata, cuántos contratos gana, estados financieros, capacidad restante en Pro); quién ofertó y con cuánto; «Insumos» para proveedores de materiales; registro público de novedades | https://www.licitarus.com/ |
| Cobertura | 12 fuentes: SECOP II, SECOP I, Fiduprevisora, EPM, Bolsa Mercantil, SAM.gov (EE. UU.), Triple A, Agua de los Patios, Aguas de Manizales, AMB Bucaramanga, Empocaldas, ESU Medellín | https://www.licitarus.com/ (FAQ «¿En qué fuentes busca…?») |
| Precio público | Sí. **Gratis** (1 usuario, 3 análisis por única vez). **Pro**: $690.000/mes, o $5.900.000/año; 5 usuarios, 30 análisis/mes. **Empresa**: a convenir. Paquetes sueltos: 3 análisis $150.000, 10 $480.000, 25 $1.150.000. «Incluyen IVA» | https://www.licitarus.com/ (sección precios y FAQ «¿Cuánto cuesta?») |
| Prueba gratis | Plan gratis con 3 análisis, sin tarjeta | https://www.licitarus.com/ |
| App móvil | No declara app | https://www.licitarus.com/ |
| Arquitectura de URLs | La más desarrollada del mercado. **Sector**: `/licitaciones-de/<sector>` (6). **Lugar**: `/lugares/<departamento>` (33). **Modalidad**: `/modalidades/<modalidad>` (6). **UNSPSC**: `/categorias/<código>` (233). **Entidad**: `/entidades/<nit>` (3.425). **Empresa**: `/proveedores/<nit>`. **Herramientas**: `/trm`, `/analisis-precios`. **Comparativas** (en blog): `/blog/licitarus-vs-licitaciones-info`, `/blog/notebooklm-vs-licitarus`, `/blog/licitarus-vs-consultor-licitaciones`. Blog ~45 artículos, centro de ayuda `/ayuda/*` (~28), `/novedades` | https://www.licitarus.com/sitemap.xml y sus hijos (`estatico`, `programaticas`, `entidades`, `categorias`, `lugares`, `modalidades`) |

## 5. LicitaYa — licitaya.co

| Campo | Dato | Fuente |
|---|---|---|
| `<title>` | LicitaYa \| Alertas de Licitaciones Públicas Colombia — SECOP I y II con IA | https://www.licitaya.co/ |
| H1 | Encuentra licitaciones, evalúa con IA y actúa antes que tu competencia | https://www.licitaya.co/ |
| Qué hace (declara) | Alertas por perfil de negocio; análisis del RUP y de cada proceso con IA (resumen, requisitos clave, «si calificas»); subcuentas; alertas por correo, SMS y notificación push | https://www.licitaya.co/ · ficha de Google Play |
| Cobertura | SECOP I, SECOP II y «entidades descentralizadas»; la ficha de Google Play nombra Ecopetrol, SENA, Findeter | https://www.licitaya.co/ · https://play.google.com/store/apps/details?id=co.licitaya.app |
| Precio público | Sí: Basic $49.999/mes · Pro $66.999 · Business $90.999 · Enterprise $129.999 (3 a 25 análisis con IA al mes según plan). No aclara IVA | https://www.licitaya.co/ (sección Planes) |
| Prueba gratis | 3 días | https://www.licitaya.co/ |
| App móvil | Sí, iOS y Android | https://play.google.com/store/apps/details?id=co.licitaya.app · https://apps.apple.com/us/app/licitaciones-licitaya/id1520344319 |
| Arquitectura de URLs | Solo home, login, registro, términos y privacidad. `/sitemap.xml` responde 404. Sin sector, ciudad, entidad, blog ni comparativas | https://www.licitaya.co/ · https://www.licitaya.co/sitemap.xml |

## 6. Licitaciones.info — licitaciones.info/colombia

| Campo | Dato | Fuente |
|---|---|---|
| `<title>` | Licitaciones Colombia | https://licitaciones.info/colombia |
| H1 | La página no tiene H1 en el HTML (contenido montado con JavaScript); el único encabezado servido es el H2 «Descarga la App de Licitaciones…» | https://licitaciones.info/colombia |
| Qué hace (declara) | Perfiles de negocio ilimitados (actividad económica, modalidad, ubicación, cuantía); búsqueda por palabra clave y filtros; exportar a CSV; carpetas; subcuentas y notas para trabajo en equipo; rastreo de procesos (documentos nuevos, adendas, cambio de estado); descarga de documentos «sin descifrar captcha»; clasificación manual de procesos por actividad económica | https://licitaciones.info/colombia/funcionalidades · https://licitaciones.info/colombia/nosotros |
| Cobertura | SECOP I, SECOP II y otras fuentes (SENA, hospitales, Findeter, Ecopetrol, EPM, empresas de servicios públicos, cajas de compensación, universidades, BID, PNUD…); también Ecuador y otros países | https://play.google.com/store/apps/details?id=com.setcon.licitacionesinfo |
| Precio público | Sí, por periodo de acceso (todas las funciones en todos los planes): 30 días $240.000 · 4 meses $420.000 · 7 meses $700.000 · 14 meses $1.150.000 · 28 meses $2.000.000 (COP). La tarjeta no aclara IVA. Los precios se cargan con JavaScript desde `/colombia/planes/getPlanes` | https://licitaciones.info/colombia/planes |
| Prueba gratis | No encontré una prueba gratis declarada en la página de planes (otros sitios la mencionan; no lo pudimos confirmar) | https://licitaciones.info/colombia/planes |
| App móvil | Sí, Android e iOS | https://play.google.com/store/apps/details?id=com.setcon.licitacionesinfo · https://apps.apple.com/us/app/licitaciones/id1210052711 |
| Otros datos | «Más de 6000 empresas han utilizado nuestra plataforma»; sede en Manizales | https://licitaciones.info/colombia/nosotros |
| Arquitectura de URLs | Home + `/colombia/{funcionalidades,planes,nosotros,contacto}` y subdominios por país. Sin sitemap (devuelve la app). Sin sector, ciudad, entidad, blog ni comparativas indexables | https://licitaciones.info/robots.txt · https://licitaciones.info/sitemap.xml |

## 7. Fromus — fromus.tech

| Campo | Dato | Fuente |
|---|---|---|
| `<title>` | Licitaciones Colombia 2026 \| Contratación Estatal con IA — Fromus | https://www.fromus.tech/ |
| H1 | Gane más licitaciones sabiendo si sus indicadores dan. / viendo solo las que le sirven. (texto animado) | https://www.fromus.tech/ |
| Qué hace (declara) | Filtro de procesos según la empresa; habilitación financiera (cruza indicadores con el pliego); requisito por requisito con su página; documentos con vigencias; análisis de competidores y radar de entidades; propuesta automática («tabla semántica que auto-llena ~85 %», APU/AIU); seguimiento sincronizado con SECOP II; correo diario; varias empresas; «~15 análisis completos al mes». Documentación para conectar con asistentes de IA (`/docs/conecta-fromus-con-claude`, `/para-ias`) | https://www.fromus.tech/ · https://www.fromus.tech/sitemap.xml |
| Cobertura | SECOP II («Todos los procesos vivos de SECOP… SECOP II, monitoreado a diario») | https://www.fromus.tech/ |
| Precio público | Sí: **$199.000 COP/mes + IVA** por la primera empresa, hasta 5 usuarios, facturación mensual | https://www.fromus.tech/ (sección Precio) |
| Prueba gratis | 3 días, sin tarjeta | https://www.fromus.tech/ |
| App móvil | No declara app | https://www.fromus.tech/ |
| Arquitectura de URLs | Home, `/blog` (~22 artículos, incluidas guías por sector: aseo y cafetería, interventoría, obra, suministros), `/docs`, `/nosotros`, `/para-ias`. Comparativa propia: `/blog/mejores-plataformas-licitaciones-colombia-2026`. Sin páginas por ciudad, entidad ni herramientas | https://www.fromus.tech/sitemap.xml |

## 8. BuscaSECOP — buscasecop.com

**No carga.** El dominio no resolvió DNS el 2 de octubre de 2026 (ni con `curl`
ni con WebFetch: `ENOTFOUND`). Aparece en buscadores y lo cita la guía de
LicitIA, pero no pudimos ver su web: **no se publica ningún dato suyo**.

## 9. Colombia Licita — colombialicita.com

| Campo | Dato | Fuente |
|---|---|---|
| `<title>` | Consulta de Procesos SECOP 1 y 2 - Buscador fácil para SECOP 1 y 2 | https://colombialicita.com/ |
| H1 | Consulta de Procesos SECOP 1 y 2 - Contratos y Licitaciones Públicas en Colombia | https://colombialicita.com/ |
| Qué hace (declara) | Buscador unificado SECOP 1 y 2 con texto exacto, orden por cuantía y filtros (cuantía, fecha, entidad, municipio, tipo, estado); alertas por correo con licencia; acceso a detalles y anexos; sin publicidad con licencia. Sin API, sin capacitaciones. Actualiza cada 1-2 horas; declara cobertura «superior al 98 %». Producto de Activisual | https://colombialicita.com/ · https://colombialicita.com/faq |
| Cobertura | SECOP I y SECOP II | https://colombialicita.com/faq |
| Precio público | Sí, licencia por días: 10 días $25.000 · 30 $66.000 · 90 $171.000 · 180 $288.000 · 360 $468.000 · 720 $720.000. Declara la licencia exenta de IVA | https://colombialicita.com/contribuir |
| Prueba gratis | La búsqueda es pública y sin costo; las alertas y el detalle completo piden licencia | https://colombialicita.com/faq |
| App móvil | No declara app | https://colombialicita.com/ |
| Arquitectura de URLs | `/licitacion/<id>` (ficha por proceso), `/resumen/entidades/<id>`, `/resumen/estados/<id>`, `/resumen/tipos/<id>`, `/concursos`, `/search`, `/sitemap`. Sin páginas de sector ni ciudad con contenido propio; sin blog ni comparativas | https://colombialicita.com/ |

## Herramientas oficiales (gratuitas)

| Herramienta | Qué es | Fuente |
|---|---|---|
| SECOP II | «Plataforma transaccional para gestionar en línea todos los Procesos de Contratación, con cuentas para entidades y proveedores; y vista pública para cualquier tercero» | https://www.colombiacompra.gov.co/secop/secop-ii |
| SECOP I | Plataforma donde las entidades publican los documentos del proceso, de la planeación a la liquidación | https://www.colombiacompra.gov.co/secop/secop-i |
| Tienda Virtual del Estado Colombiano (TVEC) | Plataforma transaccional donde las entidades compran por Acuerdos Marco de Precios, Agregación de Demanda y mínima cuantía en grandes superficies | https://www.colombiacompra.gov.co/secop/tvec/que-es-la-tienda-virtual |
| OportunidadesCCE | App gratuita anunciada por Colombia Compra Eficiente en 2021. **Su ficha de Google Play (`co.gov.colombiacompra.oprtunidadescce`) respondió 404 el 2-oct-2026**: no la recomendamos sin confirmar que siga viva | https://www.colombiacompra.gov.co/archivos/10026 |

## Artículos «mejores plataformas / apps de licitaciones Colombia 2026»

| URL | Medio / autor | Fecha | Plataformas que incluye |
|---|---|---|---|
| https://www.fromus.tech/blog/mejores-plataformas-licitaciones-colombia-2026 | Blog de Fromus (firmado por una persona del equipo; es comparativa del propio competidor) | 3-jun-2026 | SECOP II, Licitaciones.info, LicitarUS, Alicia, Fromus. Fromus sale como la única que «cubre el proceso de extremo a extremo» |
| https://licitia.com.co/donde-buscar-licitaciones-en-colombia.html | «Equipo de LicitIA» | jul-2026 | SECOP, PAA; Colombia Licita, LicitaYa, BuscaSECOP (buscadores); LicitarUS y El País Licita (análisis con IA); Suite Licita (presupuestos de obra) |
| https://ialicitaciones.com/mejores-herramientas-licitaciones-2026/ | iaLicitaciones | 2026 | **España/Europa**, no Colombia: iaLicitaciones, Licita-IA, PLACSP, ChatGPT, TED |
| https://ialicitaciones.com/ranking-software-licitaciones-2026/ | iaLicitaciones | 2026 | **España**: iaLicitaciones, Tendify, Tendios, BidCrunch, Armilar AI, Gober… |
| https://www.licitarus.com/blog/licitarus-vs-licitaciones-info | Blog de Licitarus | — | Licitarus frente a licitaciones.info |

Ninguna de estas comparativas incluye a ContRadar. Las dos que tratan Colombia
las escribe un competidor que se pone primero.

Otros nombres que aparecieron en la búsqueda y **no** revisamos: Pura
Licitación (puralicitacion.com), Yiki AI (yikiai.com), RuleX
(rulex.org/licitaciones), BuscadorSECOP (buscadorsecop.com), SECOP Colombia
(secopcolombia.co), Alicia, Suite Licita.

---

## Huecos que nadie cubre bien

1. **Precio de adjudicación con histórico largo.** Nadie publica a qué precio
   se adjudicó lo mismo en esa entidad con una serie desde 2012. LicitIA habla
   de una «curva de descuento» y Licitarus de «quién ofertó y con cuánto» en el
   proceso, pero ninguno lo convierte en páginas públicas ni lo explica con
   método. ContRadar tiene SECOP I y II desde 2012: es la página de entidad
   (fase 3) y la guía de oferta económica.
2. **SECOP I.** El País Licita, iaLicitaciones y Fromus declaran solo SECOP II.
   Las alcaldías pequeñas y las ESE siguen en SECOP I (ContRadar midió 859.786
   proveedores que solo aparecen allí, agosto de 2026). Es un argumento
   concreto, con cifra y fecha, que nadie más usa.
3. **Páginas por entidad con contenido de decisión.** Solo Licitarus tiene
   `/entidades/<nit>` a escala (3.425) y Colombia Licita un `/resumen/entidades`.
   Nadie responde en esa página «quién gana aquí, a qué precio y cuánto tarda
   en pagar». Es la búsqueda «por entidad» del mapa de keywords.
4. **Comparativas en español de Colombia hechas con fuente.** Las dos
   comparativas colombianas son de un competidor que se pone primero, sin
   enlaces a la fuente de cada precio. Una tabla con URL por dato, fecha y
   límites propios declarados no existe.
5. **Páginas de alternativas.** Nadie tiene `/alternativas/<marca>`. Licitarus
   compite con «vs licitaciones.info» dentro del blog; iaLicitaciones solo con
   rivales españoles.
6. **Sector × departamento con datos.** El País Licita tiene 30 combinaciones
   pero solo en 5 lugares (Valle, Cali, Bogotá, Antioquia, Medellín) y como
   listado de procesos. Licitarus separa sector y lugar pero no los cruza.
   Cauca, Nariño, Huila, Tolima, la Costa: vacíos.
7. **PAA como contenido.** Solo LicitIA menciona el PAA como cobertura; nadie
   tiene páginas públicas por entidad con su plan anual. Encaja con la guía del
   PAA y con el módulo de ContRadar.
8. **Herramientas gratuitas útiles.** Licitarus tiene `/trm` y
   `/analisis-precios`; nadie tiene una calculadora de capacidad residual (K)
   pública con la metodología de CCE. Ya está en el mapa
   (`/herramientas/calculadora-capacidad-residual/`).
9. **Gestión de contratos después de ganar.** Ningún competidor declara
   gestión de contratos (hitos, pólizas, actas, liquidación). Todos terminan en
   la oferta.

## Límites de ContRadar que hay que decir en las comparativas

Del propio repo (`src/components/PlanComparison.astro`, `src/data/producto.ts`):

- No lee el pliego con IA: no resume requisitos ni responde preguntas sobre el
  pliego (tiene visor de pliegos, no análisis).
- No genera la propuesta ni sus anexos.
- No tiene app móvil (es web) ni alertas por Telegram/SMS.
- Cubre SECOP I y II; no portales propios de empresas (EPM, acueductos, Bolsa
  Mercantil).
- El plan Alerta trae solo el conteo en la inteligencia de cada licitación y en
  «el ruedo»; no trae PAA, mercado histórico desde 2012, K residual ni gestión
  completa de contratos.
- Es más caro que los buscadores de alertas: desde $152.000/mes en plan anual
  (Alerta), $190.000 mes a mes.

## Licitum (añadida el 2-oct-2026, a pedido de John)

| Campo | Dato | Fuente |
|---|---|---|
| Acceso a la web | licitum.co responde **403** a consultas automáticas (curl y Chrome sin cabeza). Los datos salen del índice público de su página de inicio en el buscador, consultado el 2-oct-2026, y coinciden con el estudio de mercado de agosto (`contradar/docs/marketing/estudio-mercado-lanzamiento.md`) | https://licitum.co/ |
| Precio público | Explorador $890.000/mes (trimestral $2.400.000, anual $8.500.000) · Profesional $1.890.000/mes (trimestral $5.100.000, anual $17.900.000) · Empresa $3.500.000/mes (trimestral $9.500.000, anual $35.000.000). IVA: no confirmado | https://licitum.co/ |
| Qué declara (plan Empresa) | Evaluación de requisitos del proceso frente a la empresa; análisis de cláusulas con IA; borradores de anexos; consorcios y varios perfiles de empresa; roles comercial, técnico, jurídico y aprobador; SLA de soporte; onboarding dedicado; exportar reportes; API (próximamente) | https://licitum.co/ |

**Antes de cada revisión trimestral**, abre licitum.co en un navegador normal y
confirma los precios: si cambiaron, se actualizan `LICITUM` en
`src/pages/guias/mejores-apps-licitaciones-colombia.astro` y esta tabla.
