import { diagnosticoUrl } from "../consts";
import { moneda } from "../lib/formato";
import { ahorroAnual, plan, precioMes, PRUEBA, CIFRAS } from "./producto";
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

export type Plan = {
  name: string;
  tagline: string;
  price: string;
  featured?: boolean;
  features: string[];
};

export const FAQ: { q: string; a: string }[] = [
  {
    q: "¿Qué hace ContRadar que no haga un buscador del SECOP?",
    // Recortada a tres líneas (John, 24-sep): lo demás lo cuenta la página
    // de estadística de la licitación.
    a: "Buscar el proceso es el punto de partida, no el producto. Al abrir una licitación te mostramos ocho bloques de estadística: a qué precio se adjudica en tu sector y tu zona, quién se presenta y en cuántos días paga la entidad, cada cifra con su muestra.",
  },
  {
    q: "¿De dónde salen los datos?",
    a: "De los datos abiertos oficiales del Estado colombiano: SECOP I y SECOP II, publicados por Colombia Compra Eficiente. Descargamos y procesamos el histórico completo para poder cruzar las fuentes entre sí; el tamaño exacto de la muestra está en la portada. Todo lo que verás es verificable contra la fuente.",
  },
  {
    q: "¿Cómo me llegan las alertas?",
    a: "Revisamos el SECOP todos los días y te llega un correo al día, a la hora que elijas. Te llegan todas las que coinciden con tus búsquedas, sin tope diario en ningún plan, siempre ordenadas por su puntaje de relevancia para tu empresa. También puedes buscar tú mismo cuando quieras: el buscador manual es ilimitado en los tres planes.",
  },
  {
    q: "¿Qué tan relevante es lo que recibo?",
    a: "Cada proceso recibe un puntaje de 0 a 100 según cuatro cosas: el ajuste temático (tus palabras y tu sector contra el objeto), el territorio, el ajuste de valor y qué tan reciente es. Desde el plan Ventaja, pasas el cursor por el número y la app te dice cuánto puso cada una. Tu RUP financiero no suma puntos: acota — si se queda corto frente a los requisitos del pliego, el puntaje baja y te lo dice. Si una búsqueda no acierta, la ajustas y el puntaje se recalcula.",
  },
  {
    q: "¿Qué es eso de «gestión de equipo»?",
    a: "Licitar no lo hace una persona. Desde el plan Ventaja, dentro de ContRadar repartes quién responde por cada proceso, comentas con menciones, llevas el checklist de la propuesta y guardas los pliegos organizados. Y cuando ganas, el contrato sigue ahí: hitos, pólizas, actas y avisos antes de que algo se venza.",
  },
  {
    q: "¿Analizan el pliego con inteligencia artificial?",
    a: "Sí, en todos los planes: leemos el pliego de la licitación y te resumimos lo que pide —experiencia, indicadores financieros y cronograma—, cada requisito con su página. Si un dato no está claro en el documento, te lo decimos en vez de suponerlo. Desde Ventaja, además, ves qué cambió en cada adenda y le puedes hacer preguntas al pliego. Y antes de que lo abras te mostramos, desde Ventaja, a qué precio se adjudica en tu sector y tu zona, quién se suele presentar y en cuántos días paga la entidad.",
  },
  {
    q: "¿Cubren SECOP I o solo SECOP II?",
    a: `Los dos, siempre. Es importante: hay ${CIFRAS.soloSecopI} empresas (medido en ${CIFRAS.soloSecopIFecha}) que ganan contratos que solo se publican en SECOP I. Si solo miras SECOP II, a esos no los ves.`,
  },
  {
    q: "¿Puedo cambiar de plan después?",
    a: "Sí, cuando quieras, hacia arriba o hacia abajo. No hay permanencia mínima ni penalización por cancelar. Si pagas anual y cancelas antes, no hay reembolso por los meses restantes — pero tampoco cobro extra.",
  },
  {
    q: "¿Cómo empiezo?",
    // Reescrita el 2-oct-2026: la prueba ya se crea en el acto desde el
    // formulario (POST /public/prueba/crear), no la activamos a mano.
    a: `Llena el formulario de prueba gratis: ${PRUEBA.alta} y entras directo a la app, sin esperar a que te contactemos. Con tu NIT armamos tu búsqueda por sector y zona: entras y ya ves las licitaciones abiertas para tu empresa. Si quieres, te la mostramos en 15 minutos por videollamada. La prueba es de ${PRUEBA.dias} días con ${PRUEBA.plan} completo, sin tarjeta.`,
  },
];

/* LAS CUATRO DE LA PORTADA (John, 24-sep-2026): resuelven objeciones de compra
   —tarjeta, permanencia, confianza en los datos, «¿me sirve?»—. Las nueve de
   arriba siguen completas en /ayuda (Recursos → Preguntas frecuentes), con su
   FAQPage. Comprobado contra la configuración real ese día: prueba de 7 días
   sin tarjeta, sin permanencia; el anual, desde el 2-nov-2026, cuesta 20 % menos
   y ahorra $360.000 a $1.440.000 según el plan (antes cobraba 10 meses).
   `enlace`: el fragmento de la respuesta que va enlazado. */
export const FAQ_HOME: { q: string; a: string; enlace?: { texto: string; href: string } }[] = [
  {
    q: "¿Necesito tarjeta para la prueba?",
    a: `No. Son ${PRUEBA.dias} días completos con tu radar configurado. Al terminar decides si continúas.`,
  },
  {
    q: "¿Puedo cancelar cuando quiera?",
    a: `Sí. No hay permanencia. Si pagas el año, ahorras desde ${moneda(ahorroAnual(plan("vigia")))}.`,
  },
  {
    q: "¿De dónde salen los datos y qué tan confiables son?",
    a: "De SECOP I y II y Colombia Compra Eficiente. Cada cifra dice sobre cuántos procesos está medida y, si un dato no existe, lo decimos.",
  },
  {
    q: "¿En qué se diferencia de otras apps de licitaciones?",
    a: "ContRadar lee el pliego, cruza tu RUP y te muestra a qué precio se adjudica en tu sector y tu zona. Lo comparamos con 10 apps en una comparativa con precios y lo que declara cada una.",
    enlace: {
      texto: "comparativa con precios",
      href: "/guias/mejores-apps-licitaciones-colombia/",
    },
  },
  {
    q: "¿Me sirve si mi empresa es pequeña o apenas empieza a licitar?",
    a: "Sí. El diagnóstico gratuito te muestra qué has ganado y quién gana en tu sector y tu zona.",
    enlace: {
      texto: "diagnóstico gratuito",
      href: diagnosticoUrl("home", "faq"),
    },
  },
  {
    q: "¿ContRadar es un software de licitaciones que hay que instalar?",
    a: "No. Es una plataforma de licitaciones en la web: entras desde el navegador del computador o del celular y tu equipo trabaja sobre los mismos procesos. No hay nada que instalar ni que actualizar.",
  },
];

export const SECTORS_FOR_FORM = VERTICALS.map((v) => v.label);

/** Las preguntas de la portada (Web y app 2027). */
export const FAQ_2027: { q: string; a: string }[] = [
  { q: "¿De dónde salen los datos?", a: "De SECOP I y II y Colombia Compra Eficiente, en sus datos abiertos oficiales. Cada cifra dice sobre cuántos procesos está medida y, si un dato no existe, lo decimos." },
  { q: "¿La IA se inventa cosas?", a: "Responde con lo que dicen los documentos del proceso y te da la página para que lo verifiques. Lo que viene escaneado todavía no lo lee, y te lo decimos. Es una ayuda: revisa siempre el pliego antes de presentar." },
  { q: "¿Puedo usarlo con mi equipo?", a: "Sí. Asignan responsables, reparten tareas y se avisan con @ en los comentarios. Cuántos usuarios entran depende del plan." },
  { q: "¿Qué pasa al terminar la prueba?", a: "Decides si continúas. No pedimos tarjeta, así que nada se cobra solo. Si eliges un plan, sigues con lo que ya tenías." },
  { q: "¿Mis documentos son privados?", a: "Sí. Lo que subes solo lo ve tu empresa: cada empresa está separada de las demás en la base de datos." },
];
