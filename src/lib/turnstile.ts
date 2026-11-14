/* Turnstile bajo demanda (14-nov-2026).

   POR QUÉ: con el <script> de Turnstile en cada página, Cloudflare bajaba
   ~1,8 MB (su reto) en cuanto abría la página, aunque nadie fuera a llenar el
   formulario. Era el 86 % del peso de la portada (Lighthouse, 14-nov: 2.057 KB
   → 280 KB sin él; LCP móvil 2,98 s → 2,61 s).

   CÓMO: el script se pide con render=explicit la primera vez que alguien toca
   la zona de un formulario (foco, toque o clic). El widget se pinta en la misma
   caja de siempre (`.cf-turnstile`, con su alto reservado: no salta nada), y al
   enviar se espera a que el token esté listo. La seguridad no cambia: sin token
   el servidor rechaza igual.

   Un solo cargador para toda la web: el asistente (lib/asistente/panel.ts)
   también lo usa, así el script nunca se baja dos veces. */

const URL_SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

type Turnstile = {
  render: (caja: Element, opciones: Record<string, unknown>) => string;
  reset: (caja?: Element | string) => void;
  remove: (caja: Element | string) => void;
};

let carga: Promise<Turnstile> | null = null;

export function cargarTurnstile(): Promise<Turnstile> {
  return (carga ??= new Promise((ok, mal) => {
    const ya = (window as unknown as { turnstile?: Turnstile }).turnstile;
    if (ya) return ok(ya);
    const s = document.createElement("script");
    s.src = URL_SCRIPT;
    s.async = true;
    s.onload = () => {
      const ts = (window as unknown as { turnstile?: Turnstile }).turnstile;
      if (ts) ok(ts);
      else { carga = null; mal(new Error("turnstile")); }
    };
    s.onerror = () => { carga = null; mal(new Error("turnstile")); };
    document.head.append(s);
  }));
}

const pintadas = new WeakMap<Element, Promise<void>>();

/** Pinta el widget en su caja (una sola vez), con las opciones de sus data-*. */
function pintar(caja: Element): Promise<void> {
  let p = pintadas.get(caja);
  if (!p) {
    p = cargarTurnstile().then((ts) => {
      const d = (caja as HTMLElement).dataset;
      ts.render(caja, {
        sitekey: d.sitekey,
        theme: d.theme || "auto",
        size: d.size || "normal",
      });
    });
    p.catch(() => pintadas.delete(caja)); // si falló la red, se reintenta al próximo toque
    pintadas.set(caja, p);
  }
  return p;
}

/** Arma la carga perezosa: el primer foco, toque o clic dentro de `zona` baja
 *  Turnstile y pinta el widget de `caja`. */
export function captchaPerezoso(zona: Element | null, caja: Element | null): void {
  if (!zona || !caja) return;
  const ir = () => { pintar(caja).catch(() => {}); };
  zona.addEventListener("focusin", ir, { once: true });
  zona.addEventListener("pointerdown", ir, { once: true, passive: true });
}

/** El token del widget de `caja`. Si aún no se pintó, lo pinta y espera.
 *  Devuelve "" si no hay caja (captcha apagado) o si no llegó a tiempo: el
 *  servidor responde entonces «captcha_requerido» y el formulario lo dice. */
export async function tokenCaptcha(caja: Element | null, esperaMs = 12000): Promise<string> {
  if (!caja) return "";
  try { await pintar(caja); } catch { return ""; }
  const campo = () => caja.querySelector<HTMLInputElement>("[name='cf-turnstile-response']")?.value ?? "";
  const fin = Date.now() + esperaMs;
  while (!campo() && Date.now() < fin) await new Promise((r) => setTimeout(r, 120));
  return campo();
}

/** Captcha nuevo tras un envío: los tokens son de un solo uso. */
export function reiniciarCaptcha(caja: Element | null): void {
  if (!caja || !pintadas.has(caja)) return;
  (window as unknown as { turnstile?: Turnstile }).turnstile?.reset(caja);
}
