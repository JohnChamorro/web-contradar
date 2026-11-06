import { defineConfig, devices } from "@playwright/test";

/* Pruebas de navegador del asistente «Pregúntale a ContRadar» (5-nov-2026).
   Corren contra un servidor ya levantado (astro dev o preview):
     WEB_URL=http://localhost:4345 npx playwright test
   La API se simula con page.route en cada prueba: no hace falta backend. */
export default defineConfig({
  testDir: "e2e",
  timeout: 45_000,
  retries: 0,
  workers: 2,
  reporter: [["list"]],
  use: { baseURL: process.env.WEB_URL || "http://localhost:4345", ...devices["Desktop Chrome"] },
});
