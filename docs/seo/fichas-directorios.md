# Marca: sameAs y fichas de directorio

> Ronda SEO 2, punto 8 (22-oct-2026). Textos listos para pegar. Cada dato
> sale de `src/data/producto.ts` a esta fecha: si cambia un precio allá, se
> cambia aquí antes de enviar una ficha.

## sameAs del JSON-LD

**Hoy**: `ENTIDAD.redes` = solo `https://www.linkedin.com/company/contradar/`
(`src/lib/esquemas.ts` lo vuelca en `Organization.sameAs`).

**Regla**: solo perfiles que **existen y son nuestros**. Un `sameAs` a un
perfil vacío o ajeno no suma y puede confundir a Google sobre qué entidad
somos.

**Respuesta de John (22-oct-2026): ContRadar solo tiene LinkedIn.** El
`sameAs` queda como está. Se agregan, cuando estén aprobadas, las fichas de
guiatic, Capterra y GetApp.

Cuando haya una URL nueva, el cambio es una línea en `producto.ts` (`redes`), y sale en el
JSON-LD de todas las páginas.

## Datos comunes a las tres fichas

| Campo | Valor |
|---|---|
| Nombre | ContRadar |
| Web | https://contradar.com.co |
| Empresa | eulertech (titular: John Euler Chamorro Fuertes) |
| Sede | Popayán, Cauca, Colombia |
| Correo de ventas | ventas@contradar.com.co |
| Soporte | soporte@contradar.com.co · WhatsApp +57 323 923 6742 |
| Categoría | Software de licitaciones / gestión de licitaciones públicas (*bid management*, *government procurement*) |
| Despliegue | Web (nube); navegador de computador o celular; nada que instalar |
| Idioma | Español |
| Mercado | Colombia |
| Para quién | Empresas que le venden al Estado colombiano: construcción, ingeniería e interventoría, salud, tecnología y suministros |
| Prueba gratis | Sí: 7 días del plan Ventaja, 10 análisis, sin tarjeta; la cuenta queda activa en el momento |
| Versión gratuita | No (el diagnóstico por NIT es gratis, pero es una muestra, no un plan) |
| Precio desde | $124.000 COP al mes (Alerta, plan anual de $1.488.000) |
| Planes | Alerta $149.000/mes · Ventaja $299.000/mes · Dominio $599.000/mes; el plan anual: $1.488.000 · $2.988.000 · $5.988.000 (ahorras $300.000 a $1.200.000); sin permanencia |
| Forma de cobro | Por empresa y periodo (mensual o anual); el valor publicado es el total, sin IVA adicional |
| Usuarios | Alerta 2 · Ventaja 5 · Dominio 15 |
| Logo | https://contradar.com.co/android-chrome-512x512.png |

## Textos

**Lema (≤ 60 caracteres)**

> Licitaciones del SECOP para ganar, no solo para buscar

**Descripción corta (≤ 160 caracteres)**

> App de licitaciones para Colombia: mira a qué precio adjudica cada entidad y contra quién compites en SECOP I y II, con alertas diarias.

**Descripción larga (≈ 900 caracteres)**

> ContRadar es una plataforma web de licitaciones para empresas que le venden
> al Estado colombiano. Su enfoque es ayudar a ganar licitaciones, no solo a
> encontrarlas. Cada mañana busca en SECOP I y SECOP II los procesos que
> encajan con tu empresa y les pone un puntaje de 0 a 100. Antes de ofertar
> te muestra a qué precio adjudica esa entidad frente a su presupuesto,
> quién se suele presentar y qué contratos ha ganado cada competidor, con
> qué entidades y con qué socios. Tu equipo gestiona cada licitación en un
> tablero compartido y, si la ganas, lleva el contrato con sus hitos, pólizas
> y la capacidad residual (K) para obra pública. Todo sale de los datos
> abiertos oficiales del SECOP, desde 2012, y cada cifra dice sobre cuántos
> casos está medida. Prueba gratis de 7 días, sin tarjeta.

**Funciones (lista)**

1. Búsquedas automáticas en SECOP I y II con puntaje de relevancia 0-100 y alerta diaria por correo
2. Estadística de la licitación: precio de adjudicación frente al presupuesto, oferentes habituales
3. Análisis de competencia: contratos ganados, entidades, precios y consorcios de cada empresa
4. Sondeos de mercado (RFI) y Plan Anual de Adquisiciones (PAA)
5. Mis licitaciones: tablero en equipo con responsable, etapas, comentarios y documentos
6. Mis contratos: hitos, pólizas, actas y capacidad residual (K)
7. Notificaciones de adendas, paso a evaluación y vencimientos
8. Diagnóstico gratis por NIT

**Capturas sugeridas** (5, a 1280 × 800, sin datos de prueba visibles —
«John nombre» y similares— ni personas naturales): Búsquedas con puntaje ·
Estadística de una licitación · Ficha de competidor · Tablero de Mis
licitaciones · Calendario de un contrato.

## Por directorio

### guiatic (Colombia)

- Registro como proveedor y alta del producto en su catálogo de software
  (los campos exactos los da su formulario; no los comprobé).
- Categoría: la de licitaciones o compras públicas; si no existe, «Gestión
  comercial / CRM» **no** (no somos un CRM: el léxico de la casa lo prohíbe).
  Pedir que creen «Licitaciones públicas».
- Usar la descripción larga y la lista de funciones tal cual.
- Si pide NIT y datos de contacto comercial, los pone John.

### Capterra y GetApp (Gartner Digital Markets)

- **Un solo registro** en el portal de proveedores de Gartner Digital Markets
  publica en Capterra, GetApp y Software Advice. No hace falta dar de alta
  dos veces.
- Categorías candidatas: *Bid Management* y la de compras o software para
  gobierno que ofrezca el formulario (los nombres exactos los da el portal
  al dar de alta el producto; no los comprobé).
- Listado básico gratis; el pago por clic es opcional y **no** se recomienda
  hasta medir el orgánico de la ficha 2-3 meses.
- Precio: «desde $124.000 COP al mes, facturación anual» y marcar
  «prueba gratis: sí», «versión gratuita: no».
- Reseñas: las piden ellos a clientes reales por correo. **Nunca** reseñas
  propias, de empleados o pagadas: además de ir contra sus reglas, contradice
  `feedback_marketing_honesto` (no prometer lo que no damos).

### Revisión antes de enviar cualquier ficha

- [ ] Precios = `producto.ts` del día.
- [ ] Ninguna cifra de la base sin su fecha (las de `CIFRAS` son del
  2-oct-2026; si se citan, «a octubre de 2026»).
- [ ] Ni «tiempo real», ni «onboarding asistido», ni «garantiza ganar».
- [ ] Capturas sin datos de prueba ni personas naturales.
- [ ] Al aprobarse, agregar la URL de la ficha a `ENTIDAD.redes`.
