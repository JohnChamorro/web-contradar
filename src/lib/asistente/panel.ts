/* Panel del asistente «Pregúntale a ContRadar» (5-nov-2026). Se carga con
   import() desde components/asistente/Asistente.astro: nada de esto viaja con la
   página hasta que hace falta.

   Reglas que este archivo cumple (contradar/docs/asistente/seguridad.md):
   - Todo texto de la API o del usuario se pinta con textContent. NUNCA
     innerHTML. Los únicos enlaces que se pintan son rutas propias o
     contradar.com.co / app.contradar.com.co / wa.me (`enlaceSeguro`).
   - Nada de NIT ni datos personales en ninguna URL de WhatsApp: el mensaje se
     arma con campos de una lista blanca (página, opción, plan, sector,
     departamento) y encodeURIComponent.
   - Si la API no responde o está apagada, el panel sigue con lo que no depende
     de datos: planes, video y WhatsApp.
   - role="dialog" + aria-modal, foco atrapado, Esc y el botón Atrás cierran,
     respuestas en aria-live="polite". */
import "./panel.css";
import { API_URL, APP_URL, diagnosticoUrl, whatsappLink } from "../../consts";
import { PAQUETE_PROPUESTAS, PLANES, PRUEBA, busquedasDe, precioMes, type Plan } from "../../data/producto";
import { ASISTENTE_NOMBRE, PERSONAS, PROPUESTAS, REZAGO, VIDEO_FORMATOS } from "../../data/asistente";

type Estado = "reposo" | "pensando" | "respondiendo" | "aviso" | "sin-conexion";
interface Lista { slug: string; name: string }
interface Status { enabled: boolean; ai_enabled?: boolean; sectors?: Lista[]; departments?: Lista[]; lag_note?: string }

const API = `${API_URL}/public/assistant`;
const SITE_KEY = ((import.meta.env.PUBLIC_ASSISTANT_TURNSTILE_SITE_KEY as string | undefined)
  || (import.meta.env.PUBLIC_TURNSTILE_SITE_KEY as string | undefined) || "").trim();
const DOMINIOS = new Set(["contradar.com.co", "www.contradar.com.co", "app.contradar.com.co", "wa.me"]);

// ── Utilidades de DOM: siempre texto ──────────────────────────────────────
function h<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Record<string, string> = {}, ...hijos: (Node | string | null | false)[]) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  for (const c of hijos) if (c !== null && c !== false) el.append(typeof c === "string" ? document.createTextNode(c) : c);
  return el;
}
/** Solo rutas propias y dominios de la lista blanca; si no, null (no se pinta). */
export function enlaceSeguro(url: string): string | null {
  if (/^\/(?!\/)[\w\-./#?=&%]*$/.test(url)) return url;
  try {
    const u = new URL(url);
    return u.protocol === "https:" && DOMINIOS.has(u.hostname) ? u.href : null;
  } catch { return null; }
}
const medir = (nombre: string, datos?: Record<string, unknown>) =>
  window.dispatchEvent(new CustomEvent("cr:evento", { detail: { nombre, datos } }));
const COP = (n: number) => (n >= 1e6 ? `$${Math.round(n / 1e6).toLocaleString("es-CO")} M` : `$${Math.round(n).toLocaleString("es-CO")}`);
const fecha = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString("es-CO", { day: "numeric", month: "short" });
const oracion = (t: string) => {
  const s = t.trim();
  if (s.length < 4 || s !== s.toUpperCase()) return s;
  const b = s.toLowerCase();
  return b.charAt(0).toUpperCase() + b.slice(1);
};

// ── NIT: el mismo DV de la DIAN que valida el servidor ─────────────────────
const PESOS = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71];
export function dv(base: string): number {
  const t = [...base].reverse().reduce((s, d, i) => s + Number(d) * PESOS[i], 0) % 11;
  return t < 2 ? t : 11 - t;
}
/** Base del NIT o null. Con DV («901234567-7» o 10 dígitos que empiezan por
    8/9) lo comprueba; sin DV acepta NIT o cédula de 6 a 10 dígitos. */
export function nitBase(raw: string): string | null {
  const s = raw.trim();
  if (!/^[\d.\s]{6,15}(-\s*\d)?$/.test(s)) return null;
  let base: string, d: string | null = null;
  if (s.includes("-")) { const [a, b] = s.split("-"); base = a.replace(/\D/g, ""); d = b.trim(); }
  else {
    const x = s.replace(/\D/g, "");
    if (x.length === 10 && "89".includes(x[0])) { base = x.slice(0, 9); d = x[9]; } else base = x;
  }
  if (base.length < 6 || base.length > 10 || base.startsWith("0")) return null;
  if (d !== null && dv(base) !== Number(d)) return null;
  return base;
}

// ── Recomendador: el plan más pequeño que cubre lo que pide ───────────────
export function recomendar(personas: number, propuestas: number): { plan: Plan; paquete: boolean } {
  const cubre = PLANES.find((p) => p.usuarios >= personas && p.propuestasMes >= propuestas);
  if (cubre) return { plan: cubre, paquete: false };
  return { plan: PLANES[PLANES.length - 1], paquete: propuestas > PLANES[PLANES.length - 1].propuestasMes };
}

// ── WhatsApp con contexto, sin datos personales ────────────────────────────
interface Contexto { opcion?: string; plan?: string; sector?: string; departamento?: string }
export function mensajeWhatsApp(c: Contexto, pagina = location.pathname): string {
  const partes = [`Hola, vengo de la web de ContRadar (página ${pagina.slice(0, 80)}).`];
  if (c.opcion) partes.push(`Me interesa: ${c.opcion}.`);
  if (c.plan) partes.push(`Plan sugerido: ${c.plan}.`);
  if (c.sector) partes.push(`Sector: ${c.sector}.`);
  if (c.departamento) partes.push(`Departamento: ${c.departamento}.`);
  return partes.join(" ");
}

// ── Estado del panel ───────────────────────────────────────────────────────
let raiz: HTMLElement | null = null;
let disparador: HTMLButtonElement | null = null;
let log: HTMLElement, acciones: HTMLElement, cara: HTMLElement, tsCaja: HTMLElement;
let status: Status | null = null;
let sesion: { token: string; vence: number } | null = null;
const ctx: Contexto & { nit?: string; sectorSlug?: string; deptoSlug?: string } = {};

function personaje(e: Estado) { cara?.setAttribute("data-estado", e); }

function decir(texto: string, de: "cr" | "tu" = "cr", extra?: Node) {
  const p = h("div", { class: `asp-msg ${de}` }, h("p", {}, texto));
  if (extra) p.append(extra);
  log.append(p);
  p.scrollIntoView({ block: "nearest", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  return p;
}
function limpiarAcciones() { acciones.replaceChildren(); }
function boton(texto: string, alClic: () => void, clase = "asp-op") {
  const b = h("button", { type: "button", class: clase }, texto);
  b.addEventListener("click", alClic);
  return b;
}
function enlace(texto: string, url: string, clase = "asp-op", nueva = false) {
  const seguro = enlaceSeguro(url);
  if (!seguro) return null;
  const a = h("a", { class: clase, href: seguro }, texto);
  if (nueva) { a.target = "_blank"; a.rel = "noopener"; }
  return a;
}
function aWhatsApp(opcion?: string) {
  const a = enlace("Escribirnos por WhatsApp", whatsappLink(mensajeWhatsApp({ ...ctx, opcion })), "asp-op wa", true);
  a?.addEventListener("click", () => medir("assistant_whatsapp", { opcion: opcion ?? "menu" }));
  return a;
}
function volver() { return boton("Volver al menú", menu, "asp-op sec"); }

// ── Red ────────────────────────────────────────────────────────────────────
class ErrorApi extends Error { constructor(public status: number, public cuerpo: any) { super(String(status)); } }
async function pedir(ruta: string, cuerpo?: unknown, conSesion = false): Promise<any> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 8000);
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (conSesion) headers["X-Assistant-Session"] = await token();
    const r = await fetch(`${API}${ruta}`, { method: cuerpo === undefined ? "GET" : "POST", headers,
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo), signal: ctrl.signal, credentials: "omit" });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new ErrorApi(r.status, j);
    return j;
  } finally { clearTimeout(t); }
}
async function conReintento(ruta: string, cuerpo: unknown) {
  try { return await pedir(ruta, cuerpo, true); }
  catch (e) {
    if (e instanceof ErrorApi && e.status === 401) { sesion = null; return pedir(ruta, cuerpo, true); }
    throw e;
  }
}
async function cargarStatus(): Promise<Status> {
  if (status) return status;
  try { status = await pedir("/status"); }
  catch { status = { enabled: false }; }
  if (!status!.enabled) personaje("sin-conexion");
  return status!;
}

// Turnstile: el script se baja solo cuando se pide un dato. Su token es de un
// solo uso y se cambia por un token de sesión de 30 min.
let tsScript: Promise<void> | null = null;
function cargarTurnstile(): Promise<void> {
  return (tsScript ??= new Promise((ok, mal) => {
    if ((window as any).turnstile) return ok();
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true;
    s.onload = () => ok();
    s.onerror = () => { tsScript = null; mal(new Error("turnstile")); };
    document.head.append(s);
  }));
}
async function token(): Promise<string> {
  if (sesion && sesion.vence > Date.now() + 30_000) return sesion.token;
  if (!SITE_KEY) throw new ErrorApi(503, {});
  await cargarTurnstile();
  const ts = (window as any).turnstile;
  const tsToken: string = await new Promise((ok, mal) => {
    const id = ts.render(tsCaja, {
      sitekey: SITE_KEY, appearance: "interaction-only", action: "assistant",
      callback: (t: string) => { ok(t); setTimeout(() => ts.remove(id), 0); },
      "error-callback": () => { mal(new ErrorApi(401, {})); ts.remove(id); },
      "timeout-callback": () => { mal(new ErrorApi(401, {})); ts.remove(id); },
    });
  });
  const r = await pedir("/session", { turnstile_token: tsToken });
  sesion = { token: r.token, vence: Date.now() + r.expires_in * 1000 };
  return sesion.token;
}

function fallo(e: unknown, opcion: string) {
  limpiarAcciones();
  if (e instanceof ErrorApi && e.status === 429) {
    personaje("aviso");
    medir("assistant_rate_limited", { opcion });
    decir(e.cuerpo?.message || "Hiciste muchas consultas seguidas. Espera un rato o escríbenos por WhatsApp y te ayudamos.");
  } else {
    personaje("sin-conexion");
    decir(e instanceof ErrorApi && e.cuerpo?.message ? e.cuerpo.message
      : "No pudimos consultar los datos en este momento. Escríbenos por WhatsApp y te ayudamos.");
  }
  acciones.append(...[aWhatsApp(opcion), volver()].filter(Boolean) as Node[]);
}

// ── Menú ───────────────────────────────────────────────────────────────────
const OPCIONES = {
  licitaciones: "¿Hay licitaciones para mi empresa?",
  nit: "Diagnóstico de mi NIT",
  plan: "¿Qué plan te sirve?",
  formatos: "Ver cómo llenamos los formatos",
  persona: "Hablar con una persona",
  pregunta: "Hacer otra pregunta",
} as const;

async function menu() {
  personaje("reposo");
  limpiarAcciones();
  const st = await cargarStatus();
  const conDatos = st.enabled && !!SITE_KEY;
  const lista = h("div", { class: "asp-menu", role: "group", "aria-label": "Qué quieres hacer" });
  lista.append(
    boton(OPCIONES.licitaciones, () => elegir("licitaciones", conDatos ? licitaciones : sinDatos)),
    boton(OPCIONES.nit, () => elegir("nit", diagnostico)),
    boton(OPCIONES.plan, () => elegir("plan", plan)),
    boton(OPCIONES.formatos, () => elegir("formatos", formatos)),
  );
  if (st.ai_enabled && conDatos) lista.append(boton(OPCIONES.pregunta, () => elegir("pregunta", pregunta)));
  lista.append(boton(OPCIONES.persona, () => elegir("persona", persona)));
  acciones.append(lista);
  (lista.firstElementChild as HTMLElement | null)?.focus({ preventScroll: true });
}
function elegir(k: keyof typeof OPCIONES, f: () => void) {
  medir("assistant_option", { opcion: k });
  decir(OPCIONES[k], "tu");
  limpiarAcciones();
  f();
}
function sinDatos() {
  personaje("sin-conexion");
  decir("Ahora no podemos consultar las licitaciones desde aquí. Escríbenos y te decimos cuáles hay para tu empresa hoy.");
  acciones.append(...[aWhatsApp(OPCIONES.licitaciones), volver()].filter(Boolean) as Node[]);
}

// 1. ¿Hay licitaciones para mi empresa?
function licitaciones() {
  const st = status!;
  decir("¿En qué sector trabajas?");
  const chips = h("div", { class: "asp-chips", role: "group", "aria-label": "Sector" });
  for (const s of st.sectors || []) chips.append(boton(s.name, () => {
    ctx.sector = s.name; ctx.sectorSlug = s.slug;
    decir(s.name, "tu");
    limpiarAcciones();
    departamento();
  }, "asp-chip"));
  acciones.append(chips, volver());
  (chips.firstElementChild as HTMLElement | null)?.focus({ preventScroll: true });
}
function departamento() {
  decir("¿En qué departamento?");
  const id = "asp-depto";
  const sel = h("select", { id, class: "asp-campo" }, h("option", { value: "" }, "Elige el departamento"));
  for (const d of status!.departments || []) sel.append(h("option", { value: d.slug }, d.name));
  const form = h("form", { class: "asp-form" },
    h("label", { for: id, class: "asp-label" }, "Departamento"), sel,
    h("button", { type: "submit", class: "asp-prim" }, "Ver licitaciones"));
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const d = (status!.departments || []).find((x) => x.slug === sel.value);
    if (!d) { sel.focus(); return; }
    ctx.departamento = d.name; ctx.deptoSlug = d.slug;
    decir(d.name, "tu");
    buscar();
  });
  acciones.append(form, volver());
  sel.focus({ preventScroll: true });
}
async function buscar() {
  limpiarAcciones();
  personaje("pensando");
  const espera = decir("Estamos mirando lo que está abierto hoy…");
  try {
    const r = await conReintento("/open-processes", { sector: ctx.sectorSlug, department: ctx.deptoSlug });
    espera.remove();
    personaje("respondiendo");
    medir("assistant_open_processes", { sector: ctx.sectorSlug, departamento: ctx.deptoSlug, n: r.count });
    const n = Number(r.count) || 0;
    const titulo = n === 0
      ? `Hoy no vemos procesos abiertos de ${String(r.sector_name).toLowerCase()} en ${r.department_name}.`
      : `Hoy hay ${n.toLocaleString("es-CO")} ${n === 1 ? "proceso abierto" : "procesos abiertos"} de ${String(r.sector_name).toLowerCase()} en ${r.department_name}.`;
    const lista = h("ul", { class: "asp-lista" });
    for (const e of (r.examples || []).slice(0, 3)) {
      lista.append(h("li", {},
        h("span", { class: "asp-ej-t" }, oracion(String(e.title || ""))),
        h("span", { class: "asp-ej-m" }, `${oracion(String(e.entity || ""))} · ${COP(Number(e.value) || 0)} · cierra el ${fecha(String(e.closes))}`)));
    }
    decir(titulo, "cr", lista.childElementCount ? lista : undefined);
    decir(r.lag_note || REZAGO).classList.add("nota");
    acciones.append(prueba("Míralas todas en la prueba gratis"), ...[aWhatsApp(OPCIONES.licitaciones)].filter(Boolean) as Node[], volver());
    setTimeout(() => personaje("reposo"), 1600);
  } catch (e) { espera.remove(); fallo(e, "licitaciones"); }
}

// 2. Diagnóstico del NIT: valida y abre el diagnóstico que ya existe.
function diagnostico() {
  decir("Escribe el NIT de tu empresa. Te mostramos cómo te ha ido en el SECOP: contratos, con quién compites y qué hay abierto para ti.");
  const id = "asp-nit";
  const input = h("input", { id, class: "asp-campo", inputmode: "numeric", autocomplete: "off", spellcheck: "false", placeholder: "901234567", maxlength: "15" });
  const err = h("p", { class: "asp-err", id: "asp-nit-err", role: "alert" });
  const form = h("form", { class: "asp-form", novalidate: "" },
    h("label", { for: id, class: "asp-label" }, "NIT de tu empresa"), input, err,
    h("button", { type: "submit", class: "asp-prim" }, "Ver mi diagnóstico"));
  input.setAttribute("aria-describedby", "asp-nit-err");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const base = nitBase(input.value);
    if (!base) { err.textContent = "Revisa el NIT: solo números, con o sin dígito de verificación."; input.focus(); return; }
    err.textContent = "";
    ctx.nit = base;
    personaje("pensando");
    if (status?.enabled && SITE_KEY) {
      try { await conReintento("/nit", { nit: base }); }
      catch (x) { if (x instanceof ErrorApi && x.status === 429) { fallo(x, "nit"); return; } }
    }
    medir("diagnostico_iniciado", { origen: "asistente" });
    const url = `${diagnosticoUrl("asistente", "panel")}&nit=${base}`;
    location.assign(url);
  });
  acciones.append(form, volver());
  input.focus({ preventScroll: true });
}

// 3. ¿Qué plan te sirve? Dos preguntas; precios y límites de data/producto.ts.
function plan() {
  decir("¿Cuántas personas lo van a usar?");
  const chips = h("div", { class: "asp-chips", role: "group", "aria-label": "Personas" });
  for (const p of PERSONAS) chips.append(boton(p.etiqueta, () => {
    decir(p.etiqueta, "tu"); limpiarAcciones(); plan2(p.n);
  }, "asp-chip"));
  acciones.append(chips, volver());
  (chips.firstElementChild as HTMLElement | null)?.focus({ preventScroll: true });
}
function plan2(personas: number) {
  decir("¿Cuántas propuestas presentan al mes?");
  const chips = h("div", { class: "asp-chips", role: "group", "aria-label": "Propuestas al mes" });
  for (const p of PROPUESTAS) chips.append(boton(p.etiqueta, () => {
    decir(p.etiqueta, "tu"); limpiarAcciones(); planFin(personas, p.n);
  }, "asp-chip"));
  acciones.append(chips, volver());
  (chips.firstElementChild as HTMLElement | null)?.focus({ preventScroll: true });
}
function planFin(personas: number, propuestas: number) {
  const { plan: p, paquete } = recomendar(personas, propuestas);
  ctx.plan = p.nombre;
  medir("assistant_plan_recommended", { plan: p.id });
  personaje("respondiendo");
  const datos = h("ul", { class: "asp-datos" },
    h("li", {}, `${p.usuarios} ${p.usuarios === 1 ? "usuario" : "usuarios"}`),
    h("li", {}, `${p.propuestasMes} ${p.propuestasMes === 1 ? "propuesta" : "propuestas"} con formatos llenos al mes`),
    h("li", {}, `${p.pliegosMes} pliegos resumidos con IA al mes`),
    h("li", {}, busquedasDe(p).replace(/^./, (c) => c.toUpperCase())),
    h("li", { class: "precio" }, `$${precioMes(p, "anual").toLocaleString("es-CO")} al mes con pago anual · $${precioMes(p, "mensual").toLocaleString("es-CO")} mes a mes`));
  decir(`Te sirve ${p.nombre}.`, "cr", datos);
  if (paquete) decir(`Si presentan más de ${p.propuestasMes} al mes, sumas paquetes de ${PAQUETE_PROPUESTAS.cantidad} propuestas por $${PAQUETE_PROPUESTAS.precio.toLocaleString("es-CO")}.`);
  if (personas > p.usuarios) decir(`Para más de ${p.usuarios} personas, escríbenos y lo ajustamos.`);
  const precios = enlace("Ver todos los planes", "/precios/", "asp-op");
  acciones.append(prueba(`Probar ${PRUEBA.dias} días gratis`), ...[precios, aWhatsApp(OPCIONES.plan)].filter(Boolean) as Node[], volver());
  setTimeout(() => personaje("reposo"), 1600);
}

// 4. Cómo llenamos los formatos.
function formatos() {
  if (VIDEO_FORMATOS) {
    const v = h("video", { class: "asp-video", controls: "", preload: "none", playsinline: "", poster: VIDEO_FORMATOS.poster });
    v.muted = true;
    v.append(h("source", { src: VIDEO_FORMATOS.mp4, type: "video/mp4" }));
    decir("Así llenamos los formatos del pliego con los datos de tu empresa:", "cr", v);
  } else {
    decir("Tomamos los datos de tu empresa (RUP, experiencia en SECOP, certificados) y llenamos los formatos del pliego. Tú revisas y apruebas.");
    decir("Estamos grabando un video corto de cómo se ve. Mientras tanto, mira el ejemplo en la portada.", "cr",
      h("div", { class: "asp-video vacio", "data-pendiente": "video-formatos" }, "Video en preparación"));
  }
  const ej = enlace("Ver el ejemplo", "/#formatos", "asp-op");
  acciones.append(prueba("Llenar mis formatos en la prueba"), ...[ej].filter(Boolean) as Node[], volver());
}

// 5. Hablar con una persona.
function persona() {
  decir("Te atiende el equipo de ContRadar por WhatsApp, en horario hábil. Llevamos lo que ya nos contaste para no preguntarte dos veces.");
  acciones.append(...[aWhatsApp(OPCIONES.persona), volver()].filter(Boolean) as Node[]);
}

// 6. Pregunta libre (web-3, detrás de ASSISTANT_AI_ENABLED en la API).
function pregunta() {
  decir("Escribe tu pregunta sobre ContRadar. Respondemos con lo que está publicado en esta web.");
  const id = "asp-q";
  const ta = h("textarea", { id, class: "asp-campo", rows: "3", maxlength: "500" });
  const form = h("form", { class: "asp-form" }, h("label", { for: id, class: "asp-label" }, "Tu pregunta"), ta,
    h("button", { type: "submit", class: "asp-prim" }, "Preguntar"));
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const q = ta.value.replace(/\s+/g, " ").trim();
    if (q.length < 2) { ta.focus(); return; }
    decir(q, "tu");
    limpiarAcciones();
    personaje("pensando");
    const espera = decir("Estamos buscando la respuesta…");
    try {
      const r = await conReintento("/ask", { question: q.slice(0, 500), page: location.pathname.slice(0, 120) });
      espera.remove();
      personaje("respondiendo");
      medir("assistant_ask", { respondida: !!r.answered });
      const fuentes = h("p", { class: "asp-fuentes" });
      for (const f of r.sources || []) {
        const a = enlace(String(f.title || "Ver página"), String(f.url || ""), "asp-fuente");
        if (a) fuentes.append(a);
      }
      decir(String(r.answer || ""), "cr", fuentes.childElementCount ? fuentes : undefined);
      if (r.redirect === "plan") { acciones.append(boton(OPCIONES.plan, () => elegir("plan", plan))); }
      if (!r.answered) acciones.append(...[aWhatsApp(OPCIONES.pregunta)].filter(Boolean) as Node[]);
      acciones.append(boton("Hacer otra pregunta", () => { limpiarAcciones(); pregunta(); }, "asp-op"), volver());
      setTimeout(() => personaje("reposo"), 1600);
    } catch (x) { espera.remove(); fallo(x, "pregunta"); }
  });
  acciones.append(form, volver());
  ta.focus({ preventScroll: true });
}

// ── «Empezar mi prueba»: solo un id opaco viaja; nada de NIT en la URL ──────
function prueba(texto: string) {
  return boton(texto, async () => {
    medir("assistant_trial_cta");
    if ((ctx.nit || ctx.sectorSlug || ctx.deptoSlug) && status?.enabled && SITE_KEY) {
      try {
        const r = await conReintento("/prospect", { nit: ctx.nit ?? null, sector: ctx.sectorSlug ?? null,
          department: ctx.deptoSlug ?? null, page: location.pathname.slice(0, 120) });
        try { sessionStorage.setItem("cr_asis_prospecto", String(r.prospect_id)); } catch { /* sin almacenamiento */ }
      } catch { /* sin prospecto: la prueba sigue igual */ }
    }
    const form = document.getElementById("solicitar");
    cerrar();
    await new Promise((r) => setTimeout(r, 60));   // deja que el Atrás de cerrar() termine
    if (form) {
      const nit = document.getElementById("f-nit") as HTMLInputElement | null;
      if (nit && !nit.value && ctx.nit) nit.value = ctx.nit;   // prellenar no es asignar: la persona lo ve y lo envía
      form.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      (document.getElementById("f-email") as HTMLElement | null)?.focus({ preventScroll: true });
    } else {
      location.assign("/precios/#solicitar");
    }
  }, "asp-prim");
}

// ── Abrir y cerrar ─────────────────────────────────────────────────────────
function construir() {
  const svg = disparador?.querySelector("svg")?.cloneNode(true) as SVGElement | undefined;
  cara = h("span", { class: "asp-cara", "data-tono": "auto", "data-estado": "reposo" });
  if (svg) { svg.setAttribute("data-tono", "auto"); svg.removeAttribute("data-estado"); cara.append(svg); }
  const x = h("button", { type: "button", class: "asp-x", "aria-label": "Cerrar" }, "×");
  x.addEventListener("click", () => cerrar());
  log = h("div", { class: "asp-log", "aria-live": "polite", "aria-relevant": "additions" });
  acciones = h("div", { class: "asp-acc" });
  tsCaja = h("div", { class: "asp-ts" });
  const politica = h("a", { href: "/politica-de-datos/" }, "Cómo tratamos tus datos");
  raiz = h("section", { class: "asp", role: "dialog", "aria-modal": "true", "aria-labelledby": "asp-t" },
    h("header", { class: "asp-cab" }, cara, h("h2", { id: "asp-t" }, ASISTENTE_NOMBRE), x),
    h("div", { class: "asp-cuerpo" }, log, acciones, tsCaja),
    h("footer", { class: "asp-pie" }, "No compartas datos personales en este chat. ", politica));
  raiz.addEventListener("keydown", teclado);
  document.body.append(raiz);
  decir("Hola. Te ayudamos a saber si hay licitaciones para tu empresa, qué plan te sirve o cómo llenamos los formatos. ¿Qué quieres hacer?");
}
function enfocables(): HTMLElement[] {
  return [...raiz!.querySelectorAll<HTMLElement>("button, a[href], input, select, textarea, [tabindex]:not([tabindex='-1'])")]
    .filter((e) => !e.hasAttribute("disabled") && e.offsetParent !== null);
}
function teclado(e: KeyboardEvent) {
  if (e.key === "Escape") { e.preventDefault(); cerrar(); return; }
  if (e.key !== "Tab") return;
  const f = enfocables();
  if (!f.length) return;
  const i = f.indexOf(document.activeElement as HTMLElement);
  if (e.shiftKey && (i <= 0)) { e.preventDefault(); f[f.length - 1].focus(); }
  else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
}
function alAtras() { if (raiz && !raiz.hidden) cerrar(true); }

export function abrir(btn: HTMLButtonElement, origen: string) {
  disparador = btn;
  if (!raiz) { construir(); menu(); }
  if (!raiz!.hidden && raiz!.isConnected && document.documentElement.dataset.asisAbierto) return;
  raiz!.hidden = false;
  document.documentElement.dataset.asisAbierto = "1";
  btn.setAttribute("aria-expanded", "true");
  // El botón Atrás del navegador cierra el panel sin salir de la página.
  history.pushState({ ...(history.state || {}), asis: 1 }, "");
  addEventListener("popstate", alAtras);
  medir("assistant_opened", { origen });
  requestAnimationFrame(() => (enfocables()[1] || enfocables()[0])?.focus());
}
export function cerrar(desdeAtras = false) {
  if (!raiz || raiz.hidden) return;
  raiz.hidden = true;
  delete document.documentElement.dataset.asisAbierto;
  removeEventListener("popstate", alAtras);
  disparador?.setAttribute("aria-expanded", "false");
  if (!desdeAtras && history.state?.asis) history.back();
  disparador?.focus({ preventScroll: true });
}
