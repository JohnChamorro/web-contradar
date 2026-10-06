/** Constantes de marca y enlaces externos. Edita aquí, no en los componentes. */

export const SITE_NAME = "ContRadar";

/** Panel del producto (repo secop-alerts). Cambia cuando definas el subdominio. */
// `PUBLIC_APP_URL` solo para probar en local contra un backend de dev
// (http://localhost:3000 + su API): sin ella, siempre producción.
export const APP_URL = (import.meta.env.PUBLIC_APP_URL as string | undefined) || "https://app.contradar.com.co";
/** API de la app. En local, `PUBLIC_API_URL` (p. ej. http://localhost:8011/api/v1). */
export const API_URL = (import.meta.env.PUBLIC_API_URL as string | undefined) || `${APP_URL}/api/v1`;
export const LOGIN_URL = `${APP_URL}/login`;

/** Correo de contacto / destino del formulario de solicitud de acceso. */
export const CONTACT_EMAIL = "soporte@contradar.com.co";

/** WhatsApp de contacto (una sola fuente de verdad — si cambia, se cambia aquí). */
export const WHATSAPP_NUMBER = "573239236742";
/** Link wa.me con mensaje predefinido por contexto. */
export const whatsappLink = (msg: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;

/* EL LITERAL DEL CTA PRIMARIO, UNA SOLA VEZ (31-ago-2026, hallazgo C4).
   Convivían seis: «Prueba gratis», «Empezar mi prueba gratis», «Probar gratis
   7 días», «Solicitar acceso», «Activa tu prueba gratis» y «Empezar». Ahora
   sale de aquí y no puede volver a divergir: test/cta.test.mjs falla si
   alguna variante reaparece en las plantillas.

   Se eligió «Solicitar acceso» y no «Empezar prueba gratis» por una razón de
   honestidad, no de estilo: el flujo NO es autoservicio. El propio formulario
   dice «Te contactamos para activar tu cuenta» (AccessForm.astro:118) y la
   FAQ lo repite (content.ts). Un botón que dice «Empezar» promete que el
   producto se abre al pulsarlo, y no se abre. */
/* Cambiado el 2-sep-2026 (John): «Solicitar acceso» transmitía fricción de
   beta cerrada y escondía la oferta real (7 días gratis, sin tarjeta). El
   razonamiento viejo de más arriba queda como historia. */
export const CTA_PRIMARIO = "Empezar mi prueba gratis";

/** Única excepción: el plan Dominio se vende hablando, no probando. */
export const CTA_DOMINIO = "Hablar con un asesor";

export const SITE_DESCRIPTION =
  "Inteligencia de licitaciones para ganar contratos públicos en Colombia: ContRadar te dice contra quién compites y a qué precio se adjudica en cada entidad del SECOP I y II. Búsquedas con puntaje 0–100, análisis de competencia y de contratantes, y seguimiento en equipo de la alerta a la liquidación.";

/* UTM DE LA CASA (seo/fase-2). Todo enlace de la web hacia la app lleva:
     utm_source=web · utm_medium=<tipo de página> · utm_campaign=<página o pieza>
   Tipos de página: home, nav, footer, guia, producto, herramienta, sector,
   comparativa, pilar, precios. Así el embudo de la fase 4 se lee por origen
   sin adivinar. */
export const conUtm = (url: string, medio: string, campana: string) => {
  const u = new URL(url);
  u.searchParams.set("utm_source", "web");
  u.searchParams.set("utm_medium", medio);
  u.searchParams.set("utm_campaign", campana);
  return u.href;
};
export const diagnosticoUrl = (medio: string, campana: string) =>
  conUtm(`${APP_URL}/diagnostico`, medio, campana);
