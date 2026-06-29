/**
 * Cloudflare Pages Function — POST /api/contact
 * Recibe el formulario "Solicitar acceso" y envía un correo vía Resend.
 *
 * Variables de entorno (Cloudflare Pages > Settings > Environment variables):
 *   RESEND_API_KEY  (obligatoria)
 *   CONTACT_TO      (destino; default hola@contradar.com.co)
 *   CONTACT_FROM    (remitente verificado en Resend; default onboarding@resend.dev)
 */

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function onRequestPost({ request, env }) {
  let data;
  try {
    data = await request.json();
  } catch {
    return json({ error: "Cuerpo inválido" }, 400);
  }

  const name = (data.name || "").trim();
  const email = (data.email || "").trim();
  const company = (data.company || "").trim();
  const sector = (data.sector || "").trim();

  if (!name || !email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return json({ error: "Nombre y correo válido son obligatorios" }, 400);
  }

  if (!env.RESEND_API_KEY) {
    return json({ error: "Servicio de correo no configurado" }, 500);
  }

  const to = env.CONTACT_TO || "hola@contradar.com.co";
  const from = env.CONTACT_FROM || "ContRadar <onboarding@resend.dev>";

  const html = `
    <h2>Nueva solicitud de acceso — ContRadar</h2>
    <p><strong>Nombre:</strong> ${esc(name)}</p>
    <p><strong>Empresa:</strong> ${esc(company) || "—"}</p>
    <p><strong>Correo:</strong> ${esc(email)}</p>
    <p><strong>Sector:</strong> ${esc(sector) || "—"}</p>
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: email,
      subject: `Solicitud de acceso — ${company || name}`,
      html,
    }),
  });

  if (!res.ok) {
    return json({ error: "No se pudo enviar la solicitud" }, 502);
  }

  return json({ ok: true });
}
