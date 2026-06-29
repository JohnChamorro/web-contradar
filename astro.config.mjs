// @ts-check
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";

// https://astro.build
export default defineConfig({
  // Dominio público de la landing. Cámbialo si usas otro.
  site: "https://contradar.com.co",
  integrations: [tailwind(), sitemap()],
});
