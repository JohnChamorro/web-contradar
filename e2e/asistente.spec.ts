import { expect, test, type Page } from "@playwright/test";
import { PLANES, precioMes } from "../src/data/producto";

/* Los precios salen de la misma fuente que /precios: la prueba no los escribe a mano. */
const anual = (i: number) => `$${precioMes(PLANES[i], "anual").toLocaleString("es-CO")} al mes con pago anual`;

/* «Pregúntale a ContRadar» en la web. La API del asistente se simula aquí:
   /status, /session, /open-processes, /nit y /prospect. Turnstile también. */

const API = "**/public/assistant/**";
const EJEMPLOS = [
  { title: "MEJORAMIENTO DE VÍAS TERCIARIAS EN LA VEREDA EL PLACER", entity: "MUNICIPIO DE EJEMPLO", value: 2340000000, closes: "2026-11-20" },
];

async function apiViva(page: Page, extra: Record<string, unknown> = {}) {
  await page.addInitScript(() => {
    // Turnstile de mentira: entrega un token al instante.
    (window as any).turnstile = { render: (_el: unknown, o: any) => { setTimeout(() => o.callback("tok-prueba-123456"), 10); return "w1"; }, remove: () => {} };
  });
  await page.route(API, async (route) => {
    const url = route.request().url();
    const json = (b: unknown, status = 200) => route.fulfill({ status, contentType: "application/json", body: JSON.stringify(b) });
    if (url.endsWith("/status")) return json({ enabled: true, ai_enabled: false, lag_note: "Trabajamos con los datos abiertos del SECOP, que se actualizan una vez al día, así que lo normal es ver una licitación al día siguiente de publicada.",
      sectors: [{ slug: "obra", name: "Obra" }], departments: [{ slug: "cauca", name: "Cauca" }] });
    if (url.endsWith("/session")) return json({ token: "v1.x.y", expires_in: 1800 });
    if (url.endsWith("/open-processes")) return json({ count: 28, sector_name: "Obra", department_name: "Cauca", examples: extra.examples ?? EJEMPLOS, lag_note: "Trabajamos con los datos abiertos del SECOP, que se actualizan una vez al día, así que lo normal es ver una licitación al día siguiente de publicada." });
    if (url.endsWith("/nit")) return json(extra.nit429 ? { detail: "limite", message: "Hiciste muchas consultas seguidas. Espera un rato o escríbenos por WhatsApp y te ayudamos." } : { ok: true }, extra.nit429 ? 429 : 200);
    if (url.endsWith("/prospect")) return json({ prospect_id: "p".repeat(32) });
    return json({}, 404);
  });
}
const apiCaida = (page: Page) => page.route(API, (r) => r.abort());
const panel = (page: Page) => page.getByRole("dialog", { name: "Pregúntale a ContRadar" });
const abrir = async (page: Page) => { await page.locator(".asis-btn").click(); await expect(panel(page)).toBeVisible(); };

for (const [w, h] of [[375, 812], [768, 1024], [1366, 768], [1920, 1080]] as const) {
  test(`botón visible y sin choques a ${w}px`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await apiCaida(page);
    for (const ruta of ["/", "/precios/", "/funcionalidades/"]) {
      await page.goto(ruta);
      const b = await page.locator(".asis-btn").boundingBox();
      expect(b, ruta).not.toBeNull();
      expect(b!.x + b!.width).toBeLessThanOrEqual(w);
      expect(b!.y + b!.height).toBeLessThanOrEqual(h);
      expect(b!.width).toBeGreaterThanOrEqual(w < 760 ? 56 : 64);
      // No tapa ningún «Prueba gratis» visible.
      for (const c of await page.getByRole("link", { name: /Prueba gratis/ }).all()) {
        const r = await c.boundingBox();
        if (!r || !(await c.isVisible())) continue;
        const cruza = r.x < b!.x + b!.width && r.x + r.width > b!.x && r.y < b!.y + b!.height && r.y + r.height > b!.y;
        expect(cruza, `${ruta}: tapa «Prueba gratis»`).toBe(false);
      }
      const ancho = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
      expect(ancho[0], `${ruta}: scroll horizontal`).toBeLessThanOrEqual(ancho[1]);
    }
  });
}

test("se apila encima de la barra fija de la calculadora", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await apiCaida(page);
  await page.goto("/herramientas/calculadora-capacidad-residual/");
  await page.evaluate(() => { const b = document.getElementById("k-barra")!; b.hidden = false; b.style.display = "block"; });
  await page.waitForTimeout(300);
  const boton = await page.locator(".asis-btn").boundingBox();
  const barra = await page.locator("#k-barra").boundingBox();
  expect(boton!.y + boton!.height).toBeLessThanOrEqual(barra!.y + 1);
});

test("abre y cierra con clic, Esc y el botón Atrás", async ({ page }) => {
  await apiViva(page);
  await page.goto("/precios/");
  const url = page.url();
  await abrir(page);
  await page.getByRole("button", { name: "Cerrar", exact: true }).click();
  await expect(panel(page)).toBeHidden();
  await abrir(page);
  await page.keyboard.press("Escape");
  await expect(panel(page)).toBeHidden();
  await expect(page.locator(".asis-btn")).toBeFocused();
  await abrir(page);
  await page.goBack();
  await expect(panel(page)).toBeHidden();
  expect(page.url()).toBe(url);
});

test("el foco queda atrapado en el panel", async ({ page }) => {
  await apiViva(page);
  await page.goto("/precios/");
  await abrir(page);
  await expect(panel(page)).toHaveAttribute("aria-modal", "true");
  await expect(panel(page).locator("[aria-live='polite']")).toHaveCount(1);
  for (let i = 0; i < 20; i++) {
    await page.keyboard.press("Tab");
    expect(await page.evaluate(() => !!document.activeElement?.closest(".asp"))).toBe(true);
  }
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press("Shift+Tab");
    expect(await page.evaluate(() => !!document.activeElement?.closest(".asp"))).toBe(true);
  }
});

test("el globo sale una sola vez por sesión", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await apiCaida(page);
  await page.goto("/precios/");
  await expect(page.locator("[data-asis-globo]")).toBeHidden();
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight * 0.6));
  const globo = page.locator("[data-asis-globo]");
  await expect(globo).toBeVisible();
  await expect(globo).toContainText("¿Qué plan te sirve? Son 2 preguntas.");
  await page.getByRole("button", { name: "Cerrar la invitación" }).click();
  await expect(globo).toBeHidden();
  await page.reload();
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight * 0.6));
  await page.waitForTimeout(800);
  await expect(globo).toBeHidden();
});

test("el globo no sale en celular", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await apiCaida(page);
  await page.goto("/precios/");
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight * 0.6));
  await page.waitForTimeout(800);
  await expect(page.locator("[data-asis-globo]")).toBeHidden();
});

test("con movimiento reducido el personaje queda quieto", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await apiCaida(page);
  await page.goto("/precios/");
  const anim = await page.locator(".asis-btn .rb-cuna").evaluate((e) => getComputedStyle(e).animationName);
  expect(anim).toBe("none");
});

test("modo oscuro: el panel usa la superficie del tema", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await apiViva(page);
  await page.goto("/precios/");
  await abrir(page);
  const [fondo, superficie] = await page.evaluate(() => {
    const p = document.querySelector(".asp")!;
    const tmp = document.createElement("div");
    tmp.style.background = "var(--surface)"; document.body.append(tmp);
    const s = getComputedStyle(tmp).backgroundColor; tmp.remove();
    return [getComputedStyle(p).backgroundColor, s];
  });
  expect(fondo).toBe(superficie);
  expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe("dark");
});

test("con la API caída sigue con planes y WhatsApp", async ({ page }) => {
  await apiCaida(page);
  await page.goto("/precios/");
  await abrir(page);
  await page.getByRole("button", { name: "¿Hay licitaciones para mi empresa?" }).click();
  await expect(panel(page)).toContainText("Ahora no podemos consultar");
  await expect(panel(page).getByRole("link", { name: "Escribirnos por WhatsApp" })).toBeVisible();
  await page.getByRole("button", { name: "Volver al menú" }).click();
  await page.getByRole("button", { name: "¿Qué plan te sirve?" }).click();
  await page.getByRole("button", { name: "Solo yo" }).click();
  await page.getByRole("button", { name: "1 al mes" }).click();
  await expect(panel(page)).toContainText("Te sirve Alerta.");
  await expect(panel(page)).toContainText(anual(0));
});

test("recomienda Dominio para equipos grandes con los límites reales", async ({ page }) => {
  await apiCaida(page);
  await page.goto("/");
  await abrir(page);
  await page.getByRole("button", { name: "¿Qué plan te sirve?" }).click();
  await page.getByRole("button", { name: "6 a 15" }).click();
  await page.getByRole("button", { name: "6 a 30" }).click();
  await expect(panel(page)).toContainText("Te sirve Dominio.");
  await expect(panel(page)).toContainText("15 usuarios");
  await expect(panel(page)).toContainText("30 propuestas con formatos llenos al mes");
  await expect(panel(page).getByRole("link", { name: "Ver todos los planes" })).toHaveAttribute("href", "/precios/");
});

test("licitaciones abiertas: conteo, 3 ejemplos y nota del rezago", async ({ page }) => {
  await apiViva(page);
  await page.goto("/precios/");
  await abrir(page);
  await page.getByRole("button", { name: "¿Hay licitaciones para mi empresa?" }).click();
  await page.getByRole("button", { name: "Obra" }).click();
  await page.selectOption("#asp-depto", "cauca");
  await page.getByRole("button", { name: "Ver licitaciones" }).click();
  await expect(panel(page)).toContainText("Hoy hay 28 procesos abiertos de obra en Cauca.");
  await expect(panel(page)).toContainText("Mejoramiento de vías terciarias en la vereda el placer");
  await expect(panel(page)).toContainText("$2.340 M");
  await expect(panel(page)).toContainText("Trabajamos con los datos abiertos del SECOP");
  await expect(panel(page).getByRole("button", { name: "Míralas todas en la prueba gratis" })).toBeVisible();
});

test("XSS: lo que llega de la API se pinta como texto", async ({ page }) => {
  const carga = '<img src=x onerror="window.__xss=1">';
  await apiViva(page, { examples: [{ title: carga, entity: "<b>Entidad</b>", value: 1, closes: "2026-11-20" }] });
  await page.goto("/precios/");
  await abrir(page);
  await page.getByRole("button", { name: "¿Hay licitaciones para mi empresa?" }).click();
  await page.getByRole("button", { name: "Obra" }).click();
  await page.selectOption("#asp-depto", "cauca");
  await page.getByRole("button", { name: "Ver licitaciones" }).click();
  await expect(panel(page)).toContainText(carga);
  expect(await panel(page).locator("img, b").count()).toBe(0);
  expect(await page.evaluate(() => (window as any).__xss)).toBeUndefined();
});

test("el enlace de WhatsApp no lleva el NIT ni datos personales", async ({ page }) => {
  await apiViva(page, { nit429: true });
  await page.goto("/precios/");
  await abrir(page);
  await page.getByRole("button", { name: "Diagnóstico de mi NIT" }).click();
  await panel(page).getByLabel("NIT de tu empresa").fill("901234567-7");
  await page.getByRole("button", { name: "Ver mi diagnóstico" }).click();
  const wa = panel(page).getByRole("link", { name: "Escribirnos por WhatsApp" });
  await expect(wa).toBeVisible();
  const href = decodeURIComponent((await wa.getAttribute("href"))!);
  expect(href).toContain("wa.me/");
  expect(href).not.toMatch(/90123456|901234567/);
  expect(href).not.toMatch(/@/);
  expect(href).toContain("página /precios/");
});

test("NIT con DV equivocado no sale del panel", async ({ page }) => {
  await apiViva(page);
  await page.goto("/precios/");
  await abrir(page);
  await page.getByRole("button", { name: "Diagnóstico de mi NIT" }).click();
  await panel(page).getByLabel("NIT de tu empresa").fill("901234567-1");
  await page.getByRole("button", { name: "Ver mi diagnóstico" }).click();
  await expect(panel(page).getByRole("alert")).toContainText("Revisa el NIT");
  expect(page.url()).toContain("/precios/");
});

test("«Empezar mi prueba» guarda solo un id opaco y lleva al formulario", async ({ page }) => {
  await apiViva(page);
  await page.goto("/precios/");
  await abrir(page);
  await page.getByRole("button", { name: "¿Hay licitaciones para mi empresa?" }).click();
  await page.getByRole("button", { name: "Obra" }).click();
  await page.selectOption("#asp-depto", "cauca");
  await page.getByRole("button", { name: "Ver licitaciones" }).click();
  await page.getByRole("button", { name: "Míralas todas en la prueba gratis" }).click();
  await expect(panel(page)).toBeHidden();
  expect(await page.evaluate(() => sessionStorage.getItem("cr_asis_prospecto"))).toBe("p".repeat(32));
  expect(page.url()).not.toMatch(/\d{6,}/);
  await expect(page.locator("#solicitar")).toBeInViewport();
});
