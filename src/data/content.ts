/** Todo el copy de la landing en un solo sitio (fácil de editar para marketing). */

/** `icon` es la clave del mapa de iconos Lucide en Verticals.astro (cero emoji como icono). */
export const VERTICALS: { icon: string; label: string }[] = [
  { icon: "building-2", label: "Construcción y obra civil" },
  { icon: "drafting-compass", label: "Ingeniería y consultoría técnica" },
  { icon: "laptop", label: "Tecnología, software y telecomunicaciones" },
  { icon: "zap", label: "Energía, redes y servicios públicos" },
  { icon: "leaf", label: "Medio ambiente, agua y residuos" },
  { icon: "truck", label: "Transporte, vehículos y logística" },
  { icon: "hospital", label: "Salud y farmacéutica" },
  { icon: "graduation-cap", label: "Educación, cultura y deporte" },
  { icon: "microscope", label: "Laboratorio, medición e instrumentación" },
  { icon: "factory", label: "Industria, manufactura y materias primas" },
  { icon: "wheat", label: "Agro, alimentos y consumo" },
  { icon: "armchair", label: "Dotación, mobiliario y bienes de oficina" },
  { icon: "shield", label: "Seguridad, defensa y orden público" },
  { icon: "briefcase", label: "Servicios profesionales y administrativos" },
];

export const STEPS: { n: string; title: string; body: string }[] = [
  {
    n: "①",
    title: "Configuras tu búsqueda",
    body: "Defines sector, UNSPSC, territorio, rango de valor, duración y tus términos de búsqueda. Una vez configurado, funciona solo para siempre.",
  },
  {
    n: "②",
    title: "Monitoreamos SECOP I y II",
    body: "ContRadar consulta directamente la API de SECOP y calcula el score de relevancia de cada proceso según tu perfil.",
  },
  {
    n: "③",
    title: "Recibes, gestionas y ganas",
    body: "La alerta llega a tu correo y entra al sistema de tu equipo. Sin salir de ContRadar, llevas el proceso hasta la adjudicación.",
  },
];

export type Plan = {
  name: string;
  tagline: string;
  price: string;
  featured?: boolean;
  features: string[];
};

export const PLANS: Plan[] = [
  {
    name: "Alerta",
    tagline: "Entérate de todo lo tuyo",
    price: "$152.000",
    features: [
      "1 búsqueda automática · alerta diaria a la hora que elijas",
      "Buscador manual ilimitado sobre 20 millones de procesos desde 2012",
      "5 análisis de empresa o de contratante al mes",
      "Sondeos (RFI): la entidad pregunta antes de que exista el pliego",
      "Visor de pliegos sin descargar · mercado completo del país",
      "Reporte «¿A qué precio ofertar?» — en todos los planes",
      "Mis licitaciones, en versión básica · hasta 10",
    ],
  },
  {
    name: "Ventaja",
    tagline: "Sabe contra quién y a qué precio",
    price: "$440.000",
    featured: true,
    features: [
      "Inteligencia en cada licitación: precio, pagos, prórrogas y competidores",
      "El ruedo completo: quiénes se presentan ante esa entidad y cuántas ganaron",
      "Mis contratos con gestión: hitos, pólizas, actas y avisos de vencimiento",
      "30 análisis de empresa o de contratante al mes",
      "3 búsquedas · las 10 mejores del día · Plan anual (PAA)",
      "Mis licitaciones completo: asignación, comentarios y checklist · hasta 20",
      "Mercado histórico desde 2012 · Reporte ROI mensual · 3 usuarios",
    ],
  },
  {
    name: "Dominio",
    tagline: "El dato de esa entidad, no el del sector",
    price: "$792.000",
    features: [
      "A qué precio quedaron las ganadoras de ESA entidad, no las del sector",
      "Análisis de empresas y contratantes sin tope · 2,5 M de proveedores",
      "Capacidad Residual (K): cuánto puedes seguir contratando hoy",
      "6 búsquedas · hasta 10 zonas · 3 sectores · sin tope diario",
      "Exporta historial y análisis a CSV · 5 usuarios",
      "Historial 365 días · subir documentos propios",
    ],
  },
];

export const FAQ: { q: string; a: string }[] = [
  {
    q: "¿Qué hace ContRadar que no haga un buscador del SECOP?",
    a: "Buscar el proceso es el punto de partida, no el producto. Al abrir una licitación te mostramos ocho bloques calculados sobre el histórico completo del SECOP: a qué precio quedaron las ganadoras de esa entidad, quién se suele presentar, en cuántos días paga, con qué frecuencia prorroga, de dónde sale la plata y si venía en su plan anual. Cada cifra dice sobre cuántos procesos está medida.",
  },
  {
    q: "¿De dónde salen los datos?",
    a: "De los datos abiertos oficiales del Estado colombiano: SECOP I y SECOP II, publicados por Colombia Compra Eficiente. Descargamos y procesamos 81 fuentes —638 millones de registros— para poder cruzarlas entre sí. Todo lo que verás es verificable contra la fuente.",
  },
  {
    q: "¿Cómo me llegan las alertas?",
    a: "Por correo, una vez al día, a la hora que elijas. Lo que cambia por plan es cuántas oportunidades trae cada alerta (5, 10 o sin tope), siempre ordenadas por su puntaje de relevancia para tu empresa. También puedes buscar tú mismo cuando quieras: el buscador manual es ilimitado en los tres planes.",
  },
  {
    q: "¿Qué tan relevante es lo que recibo?",
    a: "Cada proceso recibe un puntaje de 0 a 100 según los datos de tu empresa —incluido tu RUP—, tu sector, tu territorio, el valor y tus términos de búsqueda. Solo te enviamos lo que mejor encaja. Y si una búsqueda no acierta, la ajustas y el puntaje se recalcula.",
  },
  {
    q: "¿Qué es eso de «gestión de equipo»?",
    a: "Licitar no lo hace una persona. Dentro de ContRadar repartes quién responde por cada proceso, comentas con menciones, llevas el checklist de la propuesta y guardas los pliegos organizados. Y cuando ganas, el contrato sigue ahí: hitos, pólizas, actas y avisos antes de que algo se venza. Ninguna otra plataforma del país administra el contrato ganado.",
  },
  {
    q: "¿Analizan el pliego con inteligencia artificial?",
    a: "Todavía no leemos el pliego por ti; está en camino y entrará sin costo adicional para quien ya sea cliente. Lo que hacemos hoy y nadie más hace es decirte, antes de que lo abras, si vale la pena: a qué precio quedaron las ganadoras de esa entidad, quién se suele presentar y en cuántos días paga.",
  },
  {
    q: "¿Cubren SECOP I o solo SECOP II?",
    a: "Los dos, siempre. Es importante: hay 859.786 empresas que ganan contratos que solo se publican en SECOP I. Una herramienta que mire solo SECOP II deja fuera a la mitad de tus competidores.",
  },
  {
    q: "¿Puedo cambiar de plan después?",
    a: "Sí, cuando quieras, hacia arriba o hacia abajo. No hay permanencia mínima ni penalización por cancelar. Si pagas anual y cancelas antes, no hay reembolso por los meses restantes — pero tampoco cobro extra.",
  },
  {
    q: "¿Cómo empiezo?",
    a: "Solicita acceso con el formulario o escríbenos por WhatsApp. Activamos tu cuenta y un asistente guiado configura tus búsquedas en 2 minutos; desde ese momento empiezas a recibir alertas. La prueba es de 7 días con Ventaja completo, sin tarjeta.",
  },
];

export const SECTORS_FOR_FORM = VERTICALS.map((v) => v.label);
