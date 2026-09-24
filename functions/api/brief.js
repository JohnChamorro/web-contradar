/**
 * Cloudflare Pages Function — POST /api/brief
 * El formulario de /servicios-a-medida/ (propuesta 6a, 24-sep-2026): el cliente
 * cuenta qué quiere que construyamos.
 *
 * Hace dos cosas, las dos por Resend:
 *   1. un correo a ventas@ («Servicio a medida — {empresa}») con todos los
 *      campos y el reply-to del cliente: se responde directo desde el correo;
 *   2. una confirmación al cliente, en texto sencillo, firmada «Equipo
 *      ContRadar», con el remitente habitual.
 *
 * NO se registra en el panel de la app: hoy no hay dónde guardar estos
 * encargos (pendiente en docs/producto/pendientes-desarrollo.md de la app).
 *
 * Mismas variables y mismas defensas que /api/contact (ver ahí el porqué):
 *   RESEND_API_KEY, CONTACT_TO (default ventas@contradar.com.co), CONTACT_FROM,
 *   TURNSTILE_SECRET_KEY y el binding LEADS_KV para el tope por IP. Las
 *   funciones de Turnstile y del tope están copiadas tal cual de contact.js:
 *   las Functions de Pages no comparten módulos sin un paso de build.
 */

const MAX_POR_IP_HORA = 5;

const TIPOS = {
  erp: "Integración con tu ERP",
  analisis: "Módulos de análisis",
  automatizacion: "Automatizaciones",
  informes: "Informes y tableros",
  api: "Datos por API",
  otro: "Otro",
};
const PRESUPUESTOS = { lt10: "< $10 M", "10-50": "$10–50 M", gt50: "> $50 M", nose: "No sé" };
const PLAZOS = { "1m": "1 mes", "3m": "3 meses", sinprisa: "Sin prisa" };

async function verificarTurnstile(env, token, ip) {
  if (!env.TURNSTILE_SECRET_KEY) return true;
  if (!token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY, response: token, remoteip: ip }),
    });
    const data = await res.json();
    return data.success === true;
  } catch {
    return true;
  }
}

async function bajoElTope(env, ip) {
  if (!env.LEADS_KV || !ip) return true;
  const key = `brief:${ip}`;
  try {
    const n = Number((await env.LEADS_KV.get(key)) || 0);
    if (n >= MAX_POR_IP_HORA) return false;
    await env.LEADS_KV.put(key, String(n + 1), { expirationTtl: 3600 });
  } catch {
    return true;
  }
  return true;
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json" } });
}

function esc(s) {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function fila(etiqueta, valor) {
  const v = esc(valor) || "—";
  return `<tr>
    <td style="padding:10px 0;border-bottom:1px solid #E9EEF3;vertical-align:top;width:150px;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#7E8FA1;">${etiqueta}</td>
    <td style="padding:10px 0;border-bottom:1px solid #E9EEF3;vertical-align:top;font-size:14px;line-height:1.55;color:#0D1B2A;white-space:pre-wrap;">${v}</td>
  </tr>`;
}

function correoVentas(d) {
  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Servicio a medida</title></head>
<body style="margin:0;padding:24px;background:#FFFFFF;font-family:Arial,Helvetica,sans-serif;color:#0D1B2A;">
<p style="margin:0 0 4px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#7E8FA1;">Servicio a medida · web</p>
<h1 style="margin:0 0 18px;font-size:22px;">${esc(d.company)}</h1>
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;border-top:1px solid #0D1B2A;">
${fila("Nombre", d.name)}
${fila("Empresa", d.company)}
${fila("Correo", d.email)}
${fila("WhatsApp", d.whatsapp)}
${fila("Tipo de proyecto", d.tipos.join(", "))}
${fila("Qué quiere", d.idea)}
${fila("Presupuesto", d.presupuesto)}
${fila("Para cuándo", d.plazo)}
${fila("Autorización de datos", "Sí")}
</table>
<p style="margin:18px 0 0;font-size:13px;color:#5A6E82;">Responde a este correo y le llega directo a ${esc(d.email)}.</p>
</body></html>`;
}

function confirmacionTexto(nombre) {
  return `Hola${nombre ? ` ${nombre}` : ""}:

Recibimos tu solicitud de un servicio a medida. La revisamos y te respondemos en 2 días hábiles con una primera propuesta, sin compromiso.

Si quieres agregar algo, responde este correo.

Equipo ContRadar
https://contradar.com.co`;
}

export async function onRequestPost({ request, env }) {
  let data;
  try {
    data = await request.json();
  } catch {
    return json({ error: "Cuerpo inválido" }, 400);
  }

  const txt = (v, max = 300) => String(v ?? "").trim().slice(0, max);
  const d = {
    name: txt(data.name),
    company: txt(data.company),
    email: txt(data.email),
    whatsapp: txt(data.whatsapp, 40),
    idea: txt(data.idea, 5000),
    tipos: (Array.isArray(data.type) ? data.type : data.type ? [data.type] : [])
      .map((t) => TIPOS[t]).filter(Boolean),
    presupuesto: PRESUPUESTOS[data.budget] || "",
    plazo: PLAZOS[data.when] || "",
  };
  const consent = data.consent === true || data.consent === "true" || data.consent === "on";

  if (!d.name || !d.company || !d.idea) {
    return json({ error: "Faltan datos obligatorios." }, 400);
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email)) {
    return json({ error: "Un correo válido es obligatorio" }, 400);
  }
  if (!consent) {
    return json({ error: "Debes autorizar el tratamiento de datos personales." }, 400);
  }

  const ip = request.headers.get("CF-Connecting-IP") || "";
  // Trampa: si viene lleno es un bot; se responde ok sin enviar nada.
  if (txt(data.website)) return json({ ok: true });

  const captcha = String(data.turnstile_token || data["cf-turnstile-response"] || "").trim();
  if (!(await verificarTurnstile(env, captcha, ip))) {
    return json({ error: "No pudimos verificar que eres una persona. Recarga la página e intenta de nuevo." }, 403);
  }
  if (!(await bajoElTope(env, ip))) {
    return json({ error: "Recibimos varias solicitudes desde tu conexión. Intenta de nuevo en un rato." }, 429);
  }
  if (!env.RESEND_API_KEY) {
    return json({ error: "Servicio de correo no configurado" }, 500);
  }

  const to = env.CONTACT_TO || "ventas@contradar.com.co";
  const from = env.CONTACT_FROM || "ContRadar <onboarding@resend.dev>";
  const enviar = (cuerpo) =>
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, ...cuerpo }),
    });

  const res = await enviar({
    to: [to],
    reply_to: d.email,
    subject: `Servicio a medida — ${d.company}`,
    html: correoVentas(d),
  });
  if (!res.ok) {
    return json({ error: "No se pudo enviar la solicitud" }, 502);
  }

  // Confirmación al cliente (best-effort: la solicitud ya llegó a ventas).
  try {
    await enviar({
      to: [d.email],
      reply_to: to,
      subject: "Recibimos tu solicitud — ContRadar",
      text: confirmacionTexto(d.name),
    });
  } catch {
    // ignora
  }

  return json({ ok: true });
}
