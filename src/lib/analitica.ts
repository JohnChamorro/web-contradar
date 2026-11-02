/**
 * ANALÍTICA DE EVENTOS (seo/fase-4). Un solo punto de salida: si Umami está
 * cargado (PUBLIC_UMAMI_SRC + PUBLIC_UMAMI_ID en el despliegue), los eventos
 * van allá; si no, no se hace nada y nada se rompe.
 *
 * Umami, autoalojado, no usa cookies ni guarda la IP: por eso no hace falta
 * banner y se mantiene la promesa escrita en /politica-de-datos/. La razón de
 * no usar GA4 está en Base.astro, junto al beacon de Cloudflare.
 *
 * Eventos (el embudo está en docs/seo/embudo.md):
 *   diagnostico_iniciado   formulario de NIT (hero, guías, sectores…) · origen
 *   prueba_solicitada      alta de prueba enviada con éxito · via (app|respaldo)
 *   whatsapp_click         cualquier enlace a wa.me · pagina
 *   precio_plan_click      CTA de una tarjeta de plan · plan, pago (anual|mensual), pagina
 *   precio_periodo_cambio  interruptor mensual/anual de los precios · de, a
 *   calculadora_k_usada    primer resultado completo de la calculadora K
 *   diagnostico_completado lo emite la APP al pintar el diagnóstico
 *
 * Todos llevan `entrada`: la página por la que esa persona llegó por primera
 * vez (cookie cr_atrib, sin parámetros), para saber qué guía genera clientes.
 * `pagina` es dónde estaba al hacerlo. Lectura en docs/seo/embudo.md.
 */
type Datos = Record<string, string | number | boolean>;

declare global {
  interface Window {
    umami?: { track: (nombre: string, datos?: Datos) => unknown };
  }
}

/** Página de entrada del primer contacto, sin parámetros: la URL puede traer
 *  gclid y utm, y aquí solo interesa la página. */
function entrada(): string {
  try {
    const m = document.cookie.match(/(?:^|;\s*)cr_atrib=([^;]*)/);
    const e = m ? JSON.parse(decodeURIComponent(m[1])).e : null;
    return (typeof e === "string" && e.split(/[?#]/)[0]) || location.pathname;
  } catch {
    return location.pathname;
  }
}

/** Envía el evento. Resuelve cuando salió o a los 300 ms, lo que pase primero:
 *  sirve para esperar antes de navegar sin dejar a nadie colgado. */
export function medir(nombre: string, datos: Datos = {}): Promise<void> {
  const u = window.umami;
  if (!u || /(?:^|;\s*)cr_interno=1/.test(document.cookie)) return Promise.resolve();
  try {
    const envio = Promise.resolve(u.track(nombre, { pagina: location.pathname, entrada: entrada(), ...datos })).then(() => undefined);
    return Promise.race([envio, new Promise<void>((r) => setTimeout(r, 300))]).catch(() => undefined);
  } catch {
    return Promise.resolve();
  }
}

/** Escucha los eventos que emiten los componentes y los clics que se miden solos. */
export function iniciarAnalitica() {
  window.addEventListener("cr:evento", (e) => {
    const d = (e as CustomEvent<{ nombre: string; datos?: Datos }>).detail;
    if (d?.nombre) void medir(d.nombre, d.datos);
  });
  document.addEventListener(
    "click",
    (e) => {
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a) return;
      if (a.href.includes("wa.me/")) void medir("whatsapp_click");
      const plan = a.getAttribute("data-plan");
      // El modo del interruptor de precios en el momento del clic (2-nov-2026).
      if (plan) void medir("precio_plan_click", { plan, pago: document.documentElement.dataset.pago || "anual" });
    },
    { capture: true },
  );
}
