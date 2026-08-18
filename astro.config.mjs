// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";

// https://astro.build
export default defineConfig({
  // Dominio público de la landing. Cámbialo si usas otro.
  site: "https://contradar.com.co",
  integrations: [sitemap()],
  // Tailwind 4 entra como plugin de Vite, no como integración de Astro:
  // @astrojs/tailwind quedó descontinuado y arrastraba PostCSS + autoprefixer
  // en cada petición del dev server. El motor de v4 va en Rust.
  vite: { plugins: [tailwindcss()] },
});
