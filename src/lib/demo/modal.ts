/* Agendar demo · lógica de la ventana (handoff agendar-demo, 5-nov-2026).
   Ver components/demo/DemoModal.astro para la estructura y data/demo.ts para la
   configuración.

   - Entradas: cualquier elemento con data-cta="demo" (y data-ubicacion). La URL
     abre la ventana con ?demo=1 (/demo redirige ahí).
   - Calendly: widget INLINE. Su script se baja solo al abrir por primera vez, o al
     pasar el puntero o el foco por una entrada (precarga). Escucha sus postMessage
     (calendly.date_and_time_selected, calendly.event_scheduled).
   - Medición: un solo listener manda cta_click {cta, ubicacion} para data-cta
     (demo | trial) y para los enlaces a #solicitar; el resto de eventos los manda
     esta ventana. Todos pasan por «cr:evento» (lib/analitica.ts). */
import { API_URL } from "../../consts";
import { CALENDLY_COLORES, CALENDLY_URL } from "../../data/demo";

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (o: {
        url: string;
        parentElement: HTMLElement;
        prefill?: { name?: string; email?: string; customAnswers?: Record<string, string> };
        utm?: Record<string, string>;
      }) => void;
    };
  }
}

const SCRIPT = "https://assets.calendly.com/assets/external/widget.js";
const ORIGEN_CALENDLY = "https://calendly.com";
const LENTO_MS = 12000;

type Paso = 1 | 2 | "ok";
interface Cita { inicio: string; fin: string; enlace: string | null; email?: string | null; nit?: string | null; nombre?: string | null }

const medir = (nombre: string, datos?: Record<string, unknown>) =>
  window.dispatchEvent(new CustomEvent("cr:evento", { detail: { nombre, datos } }));

let cargando: Promise<void> | null = null;
function cargarCalendly(): Promise<void> {
  if (window.Calendly) return Promise.resolve();
  return (cargando ??= new Promise<void>((ok, ko) => {
    const s = document.createElement("script");
    s.src = SCRIPT;
    s.async = true;
    s.onload = () => ok();
    s.onerror = () => { cargando = null; s.remove(); ko(new Error("calendly")); };
    document.head.appendChild(s);
  }));
}

/** Lo que ya sabemos de la persona: la URL (correos, diagnóstico), lo escrito en
 *  el hero o el cierre (NIT) y lo escrito en el formulario de prueba. */
function precarga() {
  const q = new URLSearchParams(location.search);
  const valor = (sel: string) => (document.querySelector<HTMLInputElement>(sel)?.value || "").trim();
  const nitEscrito = [...document.querySelectorAll<HTMLInputElement>('form input[name="nit"]')]
    .map((i) => i.value.replace(/\D/g, "")).find((v) => v.length >= 6) || "";
  const limpio = (v: string | null, max = 120) => (v || "").trim().slice(0, max);
  return {
    name: limpio(q.get("nombre")),
    email: limpio(q.get("email")) || valor("#f-email"),
    nit: (limpio(q.get("nit"), 15) || nitEscrito).replace(/\D/g, ""),
    whatsapp: limpio(q.get("whatsapp"), 20) || valor("#f-whatsapp"),
    empresa: limpio(q.get("empresa")) || valor("#f-company"),
  };
}

function utms(ubicacion: string) {
  const q = new URLSearchParams(location.search);
  return {
    utmSource: q.get("utm_source") || "contradar.com.co",
    utmMedium: q.get("utm_medium") || "web",
    utmCampaign: q.get("utm_campaign") || "demo",
    utmContent: ubicacion,
  };
}

function urlCalendly() {
  const oscuro = document.documentElement.dataset.theme === "dark";
  const u = new URL(CALENDLY_URL);
  const colores = oscuro ? CALENDLY_COLORES.oscuro : CALENDLY_COLORES.claro;
  for (const [k, v] of Object.entries(colores)) u.searchParams.set(k, v);
  u.searchParams.set("hide_gdpr_banner", "1");
  u.searchParams.set("hide_event_type_details", "1");
  u.searchParams.set("hide_landing_page_details", "1");
  return u.toString();
}

const BOGOTA = "America/Bogota";
function cuando(iso: string) {
  const d = new Date(iso);
  const dia = new Intl.DateTimeFormat("es-CO", { weekday: "long", day: "numeric", month: "long", timeZone: BOGOTA }).format(d);
  const hora = new Intl.DateTimeFormat("es-CO", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: BOGOTA }).format(d);
  const d2 = dia.replace(",", "");
  return `${d2.charAt(0).toUpperCase()}${d2.slice(1)} · ${hora}`;
}
const compacto = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

function enlacesCalendario(c: Cita) {
  const titulo = "Demo ContRadar";
  const detalle = `Demo de 20 minutos con ContRadar.${c.enlace ? ` Enlace: ${c.enlace}` : ""}`;
  const g = new URL("https://calendar.google.com/calendar/render");
  g.searchParams.set("action", "TEMPLATE");
  g.searchParams.set("text", titulo);
  g.searchParams.set("dates", `${compacto(c.inicio)}/${compacto(c.fin)}`);
  g.searchParams.set("details", detalle);
  if (c.enlace) g.searchParams.set("location", c.enlace);
  const o = new URL("https://outlook.live.com/calendar/0/deeplink/compose");
  o.searchParams.set("subject", titulo);
  o.searchParams.set("startdt", new Date(c.inicio).toISOString());
  o.searchParams.set("enddt", new Date(c.fin).toISOString());
  o.searchParams.set("body", detalle);
  if (c.enlace) o.searchParams.set("location", c.enlace);
  const esc = (s: string) => s.replace(/[\\,;]/g, (m) => `\\${m}`).replace(/\n/g, "\\n");
  const ics = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//ContRadar//Demo//ES", "BEGIN:VEVENT",
    `UID:${compacto(c.inicio)}-demo@contradar.com.co`, `DTSTAMP:${compacto(new Date().toISOString())}`,
    `DTSTART:${compacto(c.inicio)}`, `DTEND:${compacto(c.fin)}`, `SUMMARY:${esc(titulo)}`,
    `DESCRIPTION:${esc(detalle)}`, ...(c.enlace ? [`LOCATION:${esc(c.enlace)}`] : []),
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
  return { google: g.toString(), outlook: o.toString(), ics: URL.createObjectURL(new Blob([ics], { type: "text/calendar" })) };
}

export function iniciarDemo() {
  const raiz = document.querySelector<HTMLElement>("[data-demo-modal]");
  if (!raiz || raiz.dataset.listo) return;
  raiz.dataset.listo = "1";
  const $ = <T extends HTMLElement = HTMLElement>(s: string) => raiz.querySelector<T>(s)!;
  const caja = $("[data-demo-caja]");
  const pasos = $("[data-demo-pasos]");
  const cal = $("[data-demo-cal]");
  const widget = $("[data-demo-widget]");
  const sin = $("[data-demo-sin]");
  const estado = $("[data-demo-estado]");
  const ok = $("[data-demo-ok]");
  const salir = $("[data-demo-salir]");
  const reducido = matchMedia("(prefers-reduced-motion: reduce)");

  let abierto = false, paso: Paso = 1, ubicacion = "url", iniciado = false;
  let disparador: HTMLElement | null = null;
  let invitee: string | null = null;
  let lento = 0;

  const ponPaso = (p: Paso) => {
    paso = p;
    if (p !== "ok") pasos.dataset.paso = String(p);
  };

  const cargado = () => {
    window.clearTimeout(lento);
    cal.classList.add("cargado");
    sin.hidden = true;
    estado.textContent = "";
  };

  const montar = async () => {
    if (!CALENDLY_URL) {
      // Sin enlace de Calendly todavía: no es un error, se agenda por WhatsApp.
      $("[data-demo-sin-t]").textContent = "Agendemos por WhatsApp.";
      cal.classList.add("cargado");
      sin.hidden = false;
      return;
    }
    if (iniciado) return;
    lento = window.setTimeout(() => { if (!cal.classList.contains("cargado")) { sin.hidden = false; estado.textContent = "La agenda está tardando más de lo normal."; } }, LENTO_MS);
    try {
      await cargarCalendly();
    } catch {
      window.clearTimeout(lento);
      cal.classList.add("cargado");
      sin.hidden = false;
      return;
    }
    if (iniciado || !window.Calendly) return;
    iniciado = true;
    const p = precarga();
    const customAnswers: Record<string, string> = {};
    if (p.nit) customAnswers.a1 = p.nit;
    if (p.whatsapp) customAnswers.a2 = p.whatsapp;
    if (p.empresa) customAnswers.a3 = p.empresa;
    window.Calendly.initInlineWidget({
      url: urlCalendly(),
      parentElement: widget,
      prefill: { ...(p.name ? { name: p.name } : {}), ...(p.email ? { email: p.email } : {}), customAnswers },
      utm: utms(ubicacion),
    });
    // El iframe avisa al cargar; si Calendly manda su primer mensaje antes, también vale.
    const marco = widget.querySelector("iframe");
    marco?.addEventListener("load", cargado, { once: true });
  };

  // ── Abrir y cerrar ──
  const enfocables = () => [...caja.querySelectorAll<HTMLElement>('button, a[href], input, iframe, [tabindex]:not([tabindex="-1"])')]
    .filter((e) => !e.closest("[hidden]") && e.getClientRects().length > 0);

  const abrir = (donde: string, quien: HTMLElement | null) => {
    if (abierto) return;
    abierto = true;
    ubicacion = donde;
    disparador = quien;
    raiz.hidden = false;
    raiz.classList.remove("cerrando");
    document.documentElement.style.overflow = "hidden";
    document.documentElement.dataset.demoAbierta = "1";
    caja.focus({ preventScroll: true });
    medir("demo_abierta", { ubicacion });
    void montar();
  };

  const limpiarUrl = () => {
    const u = new URL(location.href);
    let cambio = false;
    for (const k of ["demo", "nit", "email", "nombre", "empresa", "whatsapp"]) if (u.searchParams.has(k)) { u.searchParams.delete(k); cambio = true; }
    if (cambio) history.replaceState(history.state, "", u.pathname + u.search + u.hash);
  };

  const cerrar = (forzar = false) => {
    if (!abierto) return;
    if (!forzar && paso === 2) { salir.hidden = false; salir.querySelector<HTMLElement>("[data-salir-no]")?.focus(); return; }
    if (paso !== "ok") medir("demo_cerrada_sin_agendar", { paso });
    abierto = false;
    salir.hidden = true;
    const fin = () => {
      raiz.hidden = true;
      raiz.classList.remove("cerrando");
      document.documentElement.style.overflow = "";
      delete document.documentElement.dataset.demoAbierta;
      disparador?.focus?.({ preventScroll: true });
    };
    if (reducido.matches) fin();
    else { raiz.classList.add("cerrando"); window.setTimeout(fin, 150); }
    limpiarUrl();
  };

  raiz.querySelectorAll<HTMLElement>("[data-demo-cerrar]").forEach((b) => b.addEventListener("click", () => cerrar()));
  $("[data-salir-no]").addEventListener("click", () => { salir.hidden = true; caja.focus({ preventScroll: true }); });
  $("[data-salir-si]").addEventListener("click", () => cerrar(true));

  document.addEventListener("keydown", (e) => {
    if (!abierto) return;
    if (e.key === "Escape") {
      e.preventDefault();
      if (!$("[data-ok-menu]").hidden) { $("[data-ok-menu]").hidden = true; $("[data-ok-cal]").setAttribute("aria-expanded", "false"); return; }
      if (!salir.hidden) { salir.hidden = true; caja.focus({ preventScroll: true }); return; }
      cerrar();
      return;
    }
    if (e.key !== "Tab") return;
    // Foco atrapado: de la última pieza vuelve a la primera, y al revés.
    const f = salir.hidden ? enfocables() : [...salir.querySelectorAll<HTMLElement>("button")];
    if (!f.length) return;
    const primero = f[0], ultimo = f[f.length - 1];
    if (e.shiftKey && (document.activeElement === primero || document.activeElement === caja)) { e.preventDefault(); ultimo.focus(); }
    else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
  });
  // Si el foco se escapa (p. ej. al salir del iframe de Calendly), vuelve adentro.
  document.addEventListener("focusin", (e) => {
    if (abierto && !raiz.contains(e.target as Node)) caja.focus({ preventScroll: true });
  });

  // ── Entradas y medición de CTA ──
  document.addEventListener("click", (e) => {
    const el = (e.target as Element | null)?.closest?.<HTMLElement>("[data-cta], a[href$='#solicitar']");
    if (!el) return;
    const cta = el.dataset.cta || "trial";
    if (cta === "interno") return;
    const donde = el.dataset.ubicacion || el.closest("section[id]")?.id || "pagina";
    medir("cta_click", { cta, ubicacion: donde });
    if (cta === "demo") { e.preventDefault(); abrir(donde, el); }
  }, true);
  // Desde el asistente («Agendar una demo de 20 min»): abre con el foco de vuelta
  // en el botón del asistente.
  addEventListener("cr:abrir-demo", (e) => {
    const donde = (e as CustomEvent<{ ubicacion?: string }>).detail?.ubicacion || "evento";
    medir("cta_click", { cta: "demo", ubicacion: donde });
    abrir(donde, document.querySelector<HTMLElement>(".asis-btn") ?? (document.activeElement as HTMLElement | null));
  });
  const precargar = (e: Event) => {
    if ((e.target as Element | null)?.closest?.("[data-cta='demo']") && CALENDLY_URL) void cargarCalendly().catch(() => undefined);
  };
  document.addEventListener("pointerover", precargar, { passive: true });
  document.addEventListener("focusin", precargar);

  // ── Mensajes de Calendly ──
  window.addEventListener("message", (e) => {
    if (e.origin !== ORIGEN_CALENDLY) return;
    const d = e.data as { event?: string; payload?: { event?: { uri?: string }; invitee?: { uri?: string } } } | null;
    if (!d || typeof d.event !== "string" || !d.event.startsWith("calendly.")) return;
    cargado();
    if (d.event === "calendly.date_and_time_selected") {
      ponPaso(2);
      medir("demo_hora_elegida", { ubicacion });
    } else if (d.event === "calendly.event_scheduled") {
      invitee = d.payload?.invitee?.uri ?? null;
      void confirmar(d.payload?.event?.uri ?? null);
    }
  });

  // ── Confirmación (#32d) ──
  let cita: Cita | null = null;
  const confirmar = async (eventUri: string | null) => {
    ponPaso("ok");
    medir("demo_agendada", { ubicacion });
    pasos.hidden = true;
    cal.hidden = true;
    ok.hidden = false;
    ok.focus({ preventScroll: true });
    const filas = $("[data-ok-filas]");
    const correo = $("[data-ok-correo]");
    try {
      if (!invitee) throw new Error("sin invitee");
      const ctl = new AbortController();
      const t = window.setTimeout(() => ctl.abort(), 8000);
      const r = await fetch(`${API_URL}/public/demo/cita?${new URLSearchParams({ invitee, ...(eventUri ? { evento: eventUri } : {}) })}`, { signal: ctl.signal });
      window.clearTimeout(t);
      if (!r.ok) throw new Error(String(r.status));
      cita = (await r.json()) as Cita;
      if (!cita?.inicio) throw new Error("sin datos");
      $("[data-ok-cuando]").textContent = cuando(cita.inicio);
      const donde = $("[data-ok-donde]");
      donde.textContent = cita.enlace ? cita.enlace.replace(/^https?:\/\//, "") : "Te llega en la invitación";
      $("[data-ok-copiar]").hidden = !cita.enlace;
      filas.hidden = false;
      const l = enlacesCalendario(cita);
      $<HTMLAnchorElement>("[data-ok-google]").href = l.google;
      $<HTMLAnchorElement>("[data-ok-outlook]").href = l.outlook;
      $<HTMLAnchorElement>("[data-ok-ics]").href = l.ics;
      $("[data-ok-calmenu]").hidden = false;
    } catch {
      // Sin la API, la confirmación sale igual, sin filas.
      filas.hidden = true;
      correo.hidden = false;
    }
  };

  $("[data-ok-copiar]").addEventListener("click", async (e) => {
    const b = e.currentTarget as HTMLButtonElement;
    if (!cita?.enlace) return;
    try { await navigator.clipboard.writeText(cita.enlace); b.textContent = "Copiado"; } catch { b.textContent = "No se pudo copiar"; }
    window.setTimeout(() => { b.textContent = "Copiar"; }, 2000);
  });
  const menu = $("[data-ok-menu]");
  const botonCal = $("[data-ok-cal]");
  botonCal.addEventListener("click", () => {
    menu.hidden = !menu.hidden;
    botonCal.setAttribute("aria-expanded", String(!menu.hidden));
  });
  document.addEventListener("click", (e) => {
    if (!menu.hidden && !(e.target as Element).closest?.("[data-ok-calmenu]")) { menu.hidden = true; botonCal.setAttribute("aria-expanded", "false"); }
  });

  // Pliego: enlace de SECOP o PDF, guardado en la demo agendada.
  const formPliego = $<HTMLFormElement>("[data-ok-pliego]");
  $("[data-ok-pliego-abrir]").addEventListener("click", () => {
    formPliego.hidden = false;
    formPliego.querySelector<HTMLInputElement>("input[type=url]")?.focus();
  });
  formPliego.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = $("[data-ok-pliego-msg]");
    const enlace = (formPliego.elements.namedItem("enlace") as HTMLInputElement).value.trim();
    const archivo = (formPliego.elements.namedItem("archivo") as HTMLInputElement).files?.[0] ?? null;
    msg.className = "ok-msg";
    if (!enlace && !archivo) { msg.textContent = "Pega el enlace del proceso o sube el PDF."; msg.classList.add("mal"); return; }
    if (enlace && !/^https:\/\/([a-z0-9-]+\.)*(secop\.gov\.co|contratos\.gov\.co|colombiacompra\.gov\.co)\//i.test(enlace)) {
      msg.textContent = "El enlace tiene que ser de SECOP (secop.gov.co o contratos.gov.co)."; msg.classList.add("mal"); return;
    }
    if (archivo && (archivo.size > 20 * 1024 * 1024 || !/\.pdf$/i.test(archivo.name))) {
      msg.textContent = "Sube un PDF de hasta 20 MB."; msg.classList.add("mal"); return;
    }
    if (!invitee) { msg.textContent = "Tráelo a la llamada: no pudimos asociarlo a tu demo."; msg.classList.add("mal"); return; }
    const fd = new FormData();
    fd.set("invitee", invitee);
    if (enlace) fd.set("enlace", enlace);
    if (archivo) fd.set("archivo", archivo);
    msg.textContent = "Guardando…";
    try {
      const r = await fetch(`${API_URL}/public/demo/pliego`, { method: "POST", body: fd });
      if (!r.ok) throw new Error(String(r.status));
      msg.textContent = "Listo, lo revisamos antes de la llamada.";
      msg.classList.add("bien");
      medir("demo_pliego_agregado", { tipo: archivo ? "pdf" : "enlace" });
    } catch {
      msg.textContent = "No pudimos guardarlo. Tráelo a la llamada o escríbenos por WhatsApp.";
      msg.classList.add("mal");
    }
  });

  // «Probar 7 días gratis»: al formulario de prueba con correo y NIT ya escritos.
  $("[data-ok-prueba]").addEventListener("click", () => {
    medir("demo_confirmacion_trial_click", { ubicacion });
    const p = precarga();
    const datos = { email: cita?.email || p.email, nit: (cita?.nit || p.nit || "").replace(/\D/g, "") };
    cerrar(true);
    if (!document.getElementById("solicitar")) {
      try { sessionStorage.setItem("cr.prueba.precarga", JSON.stringify(datos)); } catch { /* sin almacenamiento */ }
      location.href = "/#solicitar";
      return;
    }
    rellenarPrueba(datos);
    window.setTimeout(() => {
      const a = document.createElement("a");
      a.href = "#solicitar";
      a.hidden = true;
      a.dataset.cta = "interno";
      document.body.appendChild(a);
      a.click();
      a.remove();
    }, 160);
  });

  // Llegada desde otra página con la precarga guardada.
  try {
    const guardado = sessionStorage.getItem("cr.prueba.precarga");
    if (guardado && document.getElementById("access-form")) {
      sessionStorage.removeItem("cr.prueba.precarga");
      rellenarPrueba(JSON.parse(guardado));
    }
  } catch { /* sin almacenamiento */ }

  // ── La URL abre la ventana: ?demo=1 (y /demo, que redirige aquí). ──
  if (new URLSearchParams(location.search).get("demo") === "1") {
    const arrancar = () => abrir("url", null);
    // Con la entrada 30a corriendo, espera a que termine.
    if (document.documentElement.hasAttribute("data-hero-intro")) addEventListener("cr:hero-listo", arrancar, { once: true });
    else arrancar();
  }
}

function rellenarPrueba(d: { email?: string | null; nit?: string | null }) {
  const pon = (sel: string, v?: string | null) => {
    const i = document.querySelector<HTMLInputElement>(sel);
    if (i && v && !i.value) { i.value = v; i.dispatchEvent(new Event("input", { bubbles: true })); }
  };
  pon("#f-email", d.email);
  pon("#f-nit", d.nit);
}
