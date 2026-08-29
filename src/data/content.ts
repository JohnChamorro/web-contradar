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
    q: "¿Qué es SECOP II?",
    a: "Es la plataforma oficial de contratación pública de Colombia, donde el Estado publica todas sus licitaciones. ContRadar lo monitorea por ti y te avisa de lo que te sirve.",
  },
  {
    q: "¿Cómo me llegan las alertas?",
    a: "Por correo electrónico, una vez al día, a la hora que elijas. Lo que cambia por plan es cuántas oportunidades trae cada alerta (5, 10 o sin tope), siempre ordenadas por relevancia para tu empresa.",
  },
  {
    q: "¿Qué tan relevante es lo que recibo?",
    a: "Cada proceso recibe un puntaje según los datos de tu empresa —incluido tu RUP (experiencia y capacidad)—, sector, territorio, valor y tus términos de búsqueda. Solo te enviamos lo que mejor encaja, no todo el ruido del portal.",
  },
  {
    q: "¿Puedo cambiar de plan después?",
    a: "Sí. Puedes subir o bajar de plan cuando quieras según cuántas oportunidades quieras seguir y qué tan rápido.",
  },
  {
    q: "¿Cómo empiezo?",
    a: "Solicita acceso con el formulario. Activamos tu cuenta y un asistente guiado configura tus búsquedas en 2 minutos; desde ese momento empiezas a recibir alertas.",
  },
];

export const SECTORS_FOR_FORM = VERTICALS.map((v) => v.label);
