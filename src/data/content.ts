/** Todo el copy de la landing en un solo sitio (fácil de editar para marketing). */

export const VERTICALS: { emoji: string; label: string }[] = [
  { emoji: "🏗️", label: "Construcción y obra civil" },
  { emoji: "📐", label: "Ingeniería y consultoría técnica" },
  { emoji: "💻", label: "Tecnología, software y telecomunicaciones" },
  { emoji: "⚡", label: "Energía, redes y servicios públicos" },
  { emoji: "🌱", label: "Medio ambiente, agua y residuos" },
  { emoji: "🚚", label: "Transporte, vehículos y logística" },
  { emoji: "🏥", label: "Salud y farmacéutica" },
  { emoji: "🎓", label: "Educación, cultura y deporte" },
  { emoji: "🔬", label: "Laboratorio, medición e instrumentación" },
  { emoji: "🏭", label: "Industria, manufactura y materias primas" },
  { emoji: "🌾", label: "Agro, alimentos y consumo" },
  { emoji: "🛋️", label: "Dotación, mobiliario y bienes de oficina" },
  { emoji: "🛡️", label: "Seguridad, defensa y orden público" },
  { emoji: "💼", label: "Servicios profesionales y administrativos" },
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
    name: "Vigía",
    tagline: "Para empezar a no perderte nada",
    price: "$176.000",
    features: [
      "1 entrega diaria por correo (08:00)",
      "Todas las oportunidades que encajan (sin tope diario)",
      "1 sector · 1 departamento",
      "Filtros: sector · UNSPSC · valor · territorio + 3 términos",
      "Historial 30 días · 1 usuario",
    ],
  },
  {
    name: "Radar",
    tagline: "Para empresas que licitan en serio",
    price: "$472.000",
    featured: true,
    features: [
      "Entregas cada 6 horas (sin tope diario)",
      "3 búsquedas automáticas · filtros completos + 6 términos",
      "1 sector · 2 deptos · 4 ciudades",
      "Sistema de seguimiento (etapas + notas + asignación)",
      "Add-ons: búsquedas, deptos y ciudades extra",
      "Historial 6 meses · 3 usuarios",
    ],
  },
  {
    name: "Enterprise",
    tagline: "Para toda tu organización",
    price: "$880.000",
    features: [
      "Alertas frecuentes, sin tope diario",
      "6 búsquedas automáticas · filtros completos + 18 términos",
      "Hasta 3 sectores · 5 deptos · 8 ciudades",
      "Seguimiento completo + recordatorios + adjuntos + exportar",
      "Soporte por WhatsApp + onboarding asistido",
      "Historial ilimitado · 5 usuarios",
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
    a: "Por correo electrónico. Según tu plan llegan una vez al día o varias veces al día. Cada alerta trae las mejores oportunidades ordenadas por relevancia para tu empresa.",
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
    a: "Solicita acceso con el formulario. Activamos tu cuenta, configuramos tu perfil contigo y desde ese momento empiezas a recibir alertas.",
  },
];

export const SECTORS_FOR_FORM = VERTICALS.map((v) => v.label);
