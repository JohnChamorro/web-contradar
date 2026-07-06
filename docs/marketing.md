# Marketing & Website — ContRadar

## Marca / naming

- **eulertech** — SIEMPRE en minúsculas, en todo contexto (copy, títulos, meta tags, docs, commits). Nunca "EulerTech" ni "Eulertech", ni siquiera al inicio de una frase o título.
- **ContRadar** — camel case (C y R mayúsculas). El producto es ContRadar; la empresa que lo hace es eulertech.

> ⚠️ Desfase: varias afirmaciones de este documento ("nadie más lo hace", "no existe otra herramienta", "antes que nadie", score "por palabras clave") se corrigieron en el sitio (jul-2026) por riesgo legal/credibilidad. El score real usa RUP + sector/territorio/valor; la ventaja de tiempo es sobre buscadores de terceros, no sobre el portal oficial. Tomar el sitio como fuente vigente, no este doc.

## Propuesta de valor central

**"El 95% del SECOP no es para ti. Te avisamos del 5% que sí."**

Validado con datos reales: ~93-95% de lo publicado en SECOP II es ruido para
cualquier empresa concreta. ContRadar filtra ese ruido y entrega solo lo relevante,
antes que nadie (monitoreo en tiempo real vs. el lag de 24h de los buscadores
genéricos).

---

## Diferenciadores competitivos

### 1. Tiempo real — nadie más lo hace
El portal de datos.gov.co y otros agregadores tienen hasta 24h de lag. ContRadar
escanea directamente el portal de SECOP II de forma continua. En Enterprise, las
alertas llegan en minutos, no al día siguiente. **Este es el argumento de venta #1.**

### 2. CRM integrado (pipeline Kanban)
La competencia genérica solo envía correos. ContRadar incluye un tablero de
gestión de oportunidades (Kanban) donde el equipo puede:
- Mover procesos entre etapas (Nueva → En revisión → Preparando oferta → Ganada)
- Asignar responsables
- Agregar notas y adjuntos
- Ver historial de actividad
- Exportar el pipeline (Enterprise)

**No existe otra herramienta de alertas SECOP con CRM incluido.**

### 3. Score de relevancia
Cada proceso recibe un puntaje ponderado (sector, territorio, valor, palabras
clave). El cliente recibe las **N mejores**, ordenadas. No todo el ruido.

### 4. Transparencia de lo que te pierdes
El sistema registra oportunidades que coincidieron pero no entraron en el top N
del plan. El cliente ve el contador de "oportunidades perdidas" → potente gancho
de upsell. El SECOP no hace esto; ContRadar sí.

### 5. Palabras clave de exclusión
No solo incluir términos, también excluir. "Construcción" sin "mantenimiento de
vías". Otros servicios no permiten exclusiones.

---

## Análisis de precios

| Plan      | Precio/mes  | ROI mínimo esperado          |
|-----------|-------------|------------------------------|
| Vigía     | $180.000    | 1 contrato ≥ $3M → ROI 16x  |
| Radar     | $450.000    | 1 contrato ≥ $10M → ROI 22x |
| Enterprise| $1.100.000  | 1 contrato ≥ $30M → ROI 27x |

### Opinión sobre los precios
- **Vigía ($180K)** es bajo como precio de entrada. El riesgo es que las
  restricciones (1 sector, 5/día, 3 keywords, 1 usuario) frustren al cliente
  antes de ver valor. Considerar trial de 14 días sin tarjeta.
- **Radar ($450K)** es el punto óptimo. Buena relación restricciones/precio.
  La mayoría de PYMES objetivo caerá aquí.
- **Enterprise ($1.1M)** es correcto para constructoras/firmas de ingeniería
  medianas que licitan regularmente en varios departamentos. El CRM completo
  y tiempo real justifican el precio fácilmente.
- **Descuento anual (18%)** es buen incentivo. Debe destacarse más en la landing.
- Los precios están en COP y son **B2B**, lo cual es correcto. No comparar con
  SaaS para consumidores.

### Restricciones que podrían frenar conversión
1. **Vigía: 3 keywords por búsqueda** es muy apretado para alguien que no conoce
   aún el valor del producto.
2. **Vigía: 1 sector + 1 locación** limita mucho el alcance inicial. Si el primer
   mes el cliente no ve oportunidades relevantes, cancela.
3. **Sin trial gratuito** → fricción de compra alta para precio de entrada.

---

## Ideas de features adicionales para evaluar

### Alta prioridad (diferenciadores claros)
1. **WhatsApp alerts** — Colombia usa WhatsApp más que email para negocios. Una
   notificación push a WhatsApp en tiempo real sería un diferenciador enorme.
   Twilio/360dialog lo hacen posible.

2. **Closing date alerts** — "Esta licitación cierra en 48 horas." Alerta
   separada de la alerta de nuevo proceso. Las empresas pierden ofertas por
   descuido, no por no haberlas visto.

3. **Win-rate tracker** — Registrar qué procesos aplicaste, cuáles ganaste.
   Calcular tasa de adjudicación por sector/entidad. Dato único que no existe
   en el mercado.

### Media prioridad
4. **Entity watch** — Seguir a entidades compradoras específicas (ej. "avísame
   de todo lo que publique Invías"). Muy pedido por empresas con contratos
   recurrentes con entidades específicas.

5. **Sector intelligence report** — Digest mensual: cuánto publicó tu sector,
   valor promedio de contratos, entidades más activas. Convierte ContRadar en
   una herramienta de inteligencia de mercado, no solo alertas.

6. **API / Webhooks** — Para Enterprise: enviar alertas a Slack, Teams, sistemas
   internos. Muy valorado por empresas con equipos de licitación estructurados.

### Bajo (largo plazo)
7. **Competitive intel** — Ver qué empresas están ganando contratos en tu sector
   y territorio. Datos públicos de SECOP (adjudicaciones). Posible add-on premium.

8. **Comparador de pliegos** — Cuando se actualizan las adendas de un proceso,
   alertar con el diff de lo que cambió.

---

## Mercados objetivo

### Nicho actual (tracción probada)
- Empresas de obra civil, construcción e infraestructura
- Firmas de ingeniería y consultoría técnica
- Empresas ambientales

### Expansión natural
- Tecnología y software (muchos contratos en SECOP)
- Salud y farmacéutica (volumen alto de contratos públicos)
- Servicios profesionales y administrativos

### Perfil de comprador ideal (ICP)
- Empresa con facturación anual > $500M COP
- Departamento o persona dedicada a licitaciones
- Ya licitó en SECOP antes (sabe el dolor de revisar manualmente)
- 3-20 empleados en el área de operaciones/proyectos

---

## Copy clave y mensajes a reforzar

| Mensaje                                | Dónde usar                          |
|---------------------------------------|--------------------------------------|
| "Tiempo real vs. 24h de lag"          | Hero, Differentiators, comparativas  |
| "95% es ruido para tu empresa"        | Hero, Problem, SEO title             |
| "CRM incluido — nadie más lo da"      | Differentiators, Pricing             |
| "Ves lo que te estás perdiendo"       | Differentiators, email campaigns     |
| "Configuras una vez, funciona solo"   | Hero, HowItWorks, FAQs               |
| "El ROI de 1 contrato cubre el año"   | Pricing, ventas directas             |

---

## SEO — palabras clave objetivo

- `licitaciones colombia alerta` / `alertas licitaciones`
- `monitoreo secop ii`
- `secop ii notificaciones`
- `como ganar licitaciones colombia`
- `software licitaciones publicas colombia`
- `buscar contratos estatales colombia`

---

## Canal de adquisición sugerido

1. **LinkedIn Ads** → targeting CFOs/gerentes de empresas constructoras/ingeniería
2. **Google Ads** → keywords de intención alta ("alertas secop", "monitoreo secop")
3. **Content marketing** → posts/guías sobre "cómo participar en SECOP II"
4. **Comunidades gremiales** → CCI (Cámara Colombiana de Infraestructura),
   ACIEM, agremiaciones de construcción departamentales
5. **Referidos** → descuento 1 mes por referido activo (B2B word-of-mouth)

---

## Contacto y soporte

- Correo: soporte@contradar.com.co
- WhatsApp (Enterprise): activar al vender plan Enterprise
- Web: contradar.com.co
