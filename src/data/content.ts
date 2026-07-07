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
      "1 búsqueda activa · 1 sector · 1 departamento",
      "Alerta diaria a la hora que elijas · hasta 5 licitaciones",
      "Score de relevancia por nivel (Alta / Media / Baja)",
      "CRM de seguimiento básico · hasta 10 licitaciones",
      "Análisis de mercado En Vivo (básico)",
      "Historial 1 mes · 1 usuario",
    ],
  },
  {
    name: "Radar",
    tagline: "Para empresas que licitan en serio",
    price: "$472.000",
    featured: true,
    features: [
      "3 búsquedas activas · 2 deptos · 4 ciudades",
      "Alerta diaria · hasta 10 licitaciones + buscador manual (20/mes)",
      "Score con desglose completo + descarga de pliegos",
      "CRM completo: asignación, comentarios y checklist · hasta 20",
      "Dashboard completo + Reporte ROI mensual",
      "Análisis histórico 2023-2025 · 3 usuarios",
    ],
  },
  {
    name: "Enterprise",
    tagline: "Para toda tu organización",
    price: "$880.000",
    features: [
      "6 búsquedas · 5 deptos · 8 ciudades · 3 sectores",
      "Sin tope de licitaciones/día · buscador manual ilimitado",
      "CRM sin tope + exportar a CSV · 5 usuarios",
      "Análisis de Competencia — quién gana y a qué precio",
      "Radar PAA — oportunidades desde que se planean",
      "Historial 365 días · subir documentos · validación de dominio",
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
