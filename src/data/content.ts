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
    title: "Defines tu perfil",
    body: "Eliges tu sector, los departamentos y ciudades donde trabajas, el rango de valor y las palabras clave de tu negocio.",
  },
  {
    n: "②",
    title: "Monitoreamos 24/7",
    body: "ContRadar revisa SECOP II de forma continua y le pone un puntaje de relevancia a cada proceso según tu perfil.",
  },
  {
    n: "③",
    title: "Recibes solo lo relevante",
    body: "Te llega un correo con las mejores oportunidades, ordenadas por relevancia, con entidad, valor, lugar y fecha de cierre.",
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
    price: "$180.000",
    features: [
      "1 entrega diaria por correo",
      "Hasta 5 oportunidades por día",
      "1 sector · 1 locación",
      "3 búsquedas / palabras clave",
      "Historial de alertas",
    ],
  },
  {
    name: "Radar",
    tagline: "Para empresas que licitan en serio",
    price: "$450.000",
    featured: true,
    features: [
      "Entregas cada 6 horas (hasta 20/día)",
      "1 sector · 3 locaciones",
      "6 búsquedas / palabras clave",
      "Add-ons: búsquedas, deptos y ciudades extra",
      "Historial y reportes",
    ],
  },
  {
    name: "Enterprise",
    tagline: "Cobertura total, en tiempo real",
    price: "$1.100.000",
    features: [
      "Alertas en tiempo real, sin tope diario",
      "Hasta 3 sectores · 6 locaciones",
      "18 búsquedas / palabras clave",
      "Soporte por WhatsApp",
      "Gestión de búsquedas asistida por nuestro equipo",
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
    a: "Por correo electrónico. Según tu plan llegan una vez al día, cada pocas horas o en tiempo real. Cada alerta trae las mejores oportunidades ordenadas por relevancia.",
  },
  {
    q: "¿Qué tan relevante es lo que recibo?",
    a: "Cada proceso recibe un puntaje según tu sector, territorio, valor y palabras clave. Solo te enviamos lo que mejor encaja, no todo el ruido del portal.",
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
