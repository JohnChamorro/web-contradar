/* Agendar demo (handoff agendar-demo, 5-nov-2026). Todo lo que se edita a mano
   de la ventana vive aquí: el enlace del evento de Calendly, quién atiende y los
   textos de la columna izquierda. La ventana: components/demo/DemoModal.astro.
   Cómo está configurado el evento en Calendly: docs/demo-calendly.md. */
import { WHATSAPP_NUMBER } from "../consts";

/** Enlace del evento «Demo ContRadar» en Calendly (p. ej. https://calendly.com/contradar/demo).
 *  Se configura con PUBLIC_CALENDLY_URL; sin él la ventana abre igual y ofrece WhatsApp. */
export const CALENDLY_URL = ((import.meta.env.PUBLIC_CALENDLY_URL as string | undefined) || "").trim();

/** Quién atiende la demo. La foto es la del equipo (public/equipo). */
export const ATIENDE = {
  nombre: "John Chamorro",
  rol: "Fundador de ContRadar",
  foto: "/equipo/john-chamorro.webp",
  iniciales: "JC",
} as const;

/** Lo que pasa en los 20 minutos. */
export const PASOS_DEMO = [
  { t: "Revisamos tu empresa por NIT.", s: "Lo que has ganado, ofertado y tu capacidad." },
  { t: "Leemos contigo un pliego real.", s: "De tu sector y tu región." },
  { t: "Te mostramos tus formatos llenos.", s: "Y resolvemos tus dudas sobre los planes." },
] as const;

/** «¿Prefieres que te escribamos? WhatsApp», con el mensaje ya escrito. */
export const DEMO_WHATSAPP = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hola, quiero ver una demo de ContRadar con mi empresa.")}`;

/** Colores de la marca para el widget (sin #). En tema oscuro, los del modo oscuro. */
export const CALENDLY_COLORES = {
  claro: { primary_color: "0d4488", text_color: "0a1628", background_color: "ffffff" },
  oscuro: { primary_color: "74abea", text_color: "f2f5f8", background_color: "0e1a2b" },
} as const;
