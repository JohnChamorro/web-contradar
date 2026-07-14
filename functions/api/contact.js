/**
 * Cloudflare Pages Function — POST /api/contact
 * Recibe el formulario "Solicitar acceso", envía un correo vía Resend y
 * ADEMÁS registra la solicitud en el backend de la app para que aparezca en el
 * panel del superadmin como "POR APROBAR" (best-effort: si falla, el correo ya
 * salió y el flujo no se rompe).
 *
 * Variables de entorno (Cloudflare Pages > Settings > Environment variables):
 *   RESEND_API_KEY     (obligatoria)
 *   CONTACT_TO         (destino; default ventas@contradar.com.co)
 *   CONTACT_FROM       (remitente verificado en Resend; default onboarding@resend.dev)
 *   CONTRADAR_API_URL  (base del API de la app, p.ej. https://app.contradar.com.co/api/v1;
 *                       vacía = no se registra en el panel)
 *   LEAD_WEBHOOK_TOKEN (opcional; debe coincidir con el LEAD_WEBHOOK_TOKEN del backend)
 */

// Botón "Ver en administrador" del correo interno: abre el panel de
// solicitudes (POR APROBAR) para confirmar o rechazar de una.
const ADMIN_REQUESTS_URL = "https://app.contradar.com.co/admin?tab=solicitudes";

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

// Fila etiqueta/valor del correo. `raw` = el valor ya viene como HTML seguro.
function row(label, value, raw = false) {
  const v = raw ? value : esc(value) || "—";
  return `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #eef2f7;vertical-align:top;width:120px;">
        <span style="font-size:12px;text-transform:uppercase;letter-spacing:.04em;color:#94a3b8;">${label}</span>
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #eef2f7;vertical-align:top;">
        <span style="font-size:14px;color:#1a2e4a;">${v}</span>
      </td>
    </tr>`;
}

function buildHtml({ name, company, email, whatsapp, sector, message }) {
  const descRaw = message
    ? esc(message).replace(/\n/g, "<br>")
    : "—";
  const mail = `<a href="mailto:${esc(email)}" style="color:#4a90e2;text-decoration:none;">${esc(email)}</a>`;
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Nueva solicitud de acceso</title></head>
<body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fb;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(26,46,74,.08);">
        <tr>
          <td style="background:#1a2e4a;padding:22px 28px;">
            <table cellpadding="0" cellspacing="0" border="0"><tr>
              <td style="vertical-align:middle;padding-right:9px;"><img src="https://contradar.com.co/email-favicon-blanco.png?v=4" width="22" height="20" alt="" style="display:block;border:0;width:22px;height:20px;"></td>
              <td style="vertical-align:middle;"><span style="font-size:18px;font-weight:bold;color:#ffffff;letter-spacing:.02em;">ContRadar<span style="color:#14b8a6;">.</span></span></td>
            </tr></table>
            <div style="font-size:13px;color:#8fb2d9;margin-top:6px;">Nueva solicitud de acceso</div>
          </td>
        </tr>
        <tr>
          <td style="height:4px;background:#14b8a6;"></td>
        </tr>
        <tr>
          <td style="padding:26px 28px;">
            <p style="margin:0 0 18px;font-size:15px;color:#334155;">Llegó una solicitud desde la web:</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              ${row("Nombre", name)}
              ${row("Empresa", company)}
              ${row("Correo", mail, true)}
              ${row("WhatsApp", whatsapp)}
              ${row("Sector", sector)}
              ${row("Proyecto", descRaw, true)}
            </table>
            <div style="margin-top:22px;">
              <a href="${ADMIN_REQUESTS_URL}" style="display:inline-block;background:#4a90e2;color:#fff;text-decoration:none;padding:10px 20px;border-radius:9px;font-size:14px;font-weight:bold;">Ver en administrador &#8594;</a>
              <a href="mailto:${esc(email)}" style="display:inline-block;margin-left:8px;border:1px solid #cbd5e1;color:#475569;text-decoration:none;padding:9px 18px;border-radius:9px;font-size:14px;font-weight:600;">Responder a ${esc(name) || esc(email)}</a>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 28px;border-top:1px solid #eef2f7;">
            <span style="font-size:12px;color:#94a3b8;">Enviado automáticamente desde contradar.com.co · Responde a este correo para contactar al solicitante.</span>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
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
  const message = (data.message || "").trim();
  const whatsapp = (data.whatsapp || "").trim();

  // Solo el correo es obligatorio; el resto es opcional.
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return json({ error: "Un correo válido es obligatorio" }, 400);
  }

  if (!env.RESEND_API_KEY) {
    return json({ error: "Servicio de correo no configurado" }, 500);
  }

  const to = env.CONTACT_TO || "ventas@contradar.com.co";
  const from = env.CONTACT_FROM || "ContRadar <onboarding@resend.dev>";

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
      subject: `Solicitud de acceso — ${company || name || email}`,
      html: buildHtml({ name, company, email, whatsapp, sector, message }),
    }),
  });

  if (!res.ok) {
    return json({ error: "No se pudo enviar la solicitud" }, 502);
  }

  // Registro en el panel del superadmin (POR APROBAR). Best-effort: el correo
  // ya salió; si el backend no responde, no se rompe el flujo del visitante.
  if (env.CONTRADAR_API_URL) {
    try {
      await fetch(`${env.CONTRADAR_API_URL.replace(/\/$/, "")}/public/trial-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(env.LEAD_WEBHOOK_TOKEN ? { "X-Lead-Token": env.LEAD_WEBHOOK_TOKEN } : {}),
        },
        body: JSON.stringify({
          name,
          company,
          email,
          whatsapp,
          sector,
          message,
          ip: request.headers.get("CF-Connecting-IP") || "",
        }),
      });
    } catch {
      // ignora: el panel se puede alimentar luego desde el correo
    }
  }

  // Auto-respuesta al solicitante (best-effort: no rompe el flujo si falla).
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject: "Recibimos tu solicitud — ContRadar",
        html: autoReplyHtml(name),
      }),
    });
  } catch {
    // ignora: el lead interno ya se envió
  }

  return json({ ok: true });
}

function autoReplyHtml(name) {
  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>ContRadar</title></head>
<body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fb;padding:32px 16px;"><tr><td align="center">
<table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(26,46,74,.08);">
<tr><td style="background:#1a2e4a;padding:20px 26px;">
<table cellpadding="0" cellspacing="0" border="0"><tr>
<td style="vertical-align:middle;padding-right:9px;"><img src="https://contradar.com.co/email-favicon-blanco.png?v=4" width="22" height="20" alt="" style="display:block;border:0;width:22px;height:20px;"></td>
<td style="vertical-align:middle;"><span style="font-size:18px;font-weight:bold;color:#fff;">ContRadar<span style="color:#14b8a6;">.</span></span></td>
</tr></table>
</td></tr>
<tr><td style="height:4px;background:#14b8a6;"></td></tr>
<tr><td style="padding:26px;">
<div style="font-size:18px;font-weight:bold;color:#1a2e4a;">¡Gracias${name ? `, ${esc(name)}` : ""}!</div>
<p style="font-size:14px;color:#334155;line-height:1.7;margin-top:10px;">Recibimos tu solicitud de acceso a <b>ContRadar</b>. Te contactaremos muy pronto para activar tu prueba de 14 días. Al entrar, un asistente guiado configura tus búsquedas en 2 minutos.</p>
<p style="font-size:13px;color:#64748B;margin-top:16px;">Mientras tanto, si tienes cualquier duda, responde este correo.</p>
</td></tr>
<tr><td style="padding:16px 26px;border-top:1px solid #eef2f7;"><span style="font-size:12px;color:#94a3b8;">ContRadar · Monitoreo de licitaciones SECOP</span></td></tr>
</table></td></tr></table>
</body></html>`;
}
