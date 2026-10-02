// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import { lastmodDe } from "./scripts/lastmod.mjs";

/* Fuera del sitemap, pero SIGUEN indexables (no llevan noindex): los textos
   legales no responden ninguna búsqueda que nos traiga clientes y el sitemap
   es la lista de lo que queremos que Google priorice. Que existan y se puedan
   rastrear desde el pie sí suma confianza, por eso no se bloquean. */
const FUERA_DEL_SITEMAP = ["/terminos/", "/politica-de-datos/"];

// https://astro.build
export default defineConfig({
  // Dominio público de la landing. Cámbialo si usas otro.
  site: "https://contradar.com.co",
  /* Barra final SIEMPRE: así se publica cada página (dist/<ruta>/index.html),
     así la sirve Cloudflare Pages —redirige con 308 la versión sin barra— y
     así van el canonical y el sitemap. Un enlace interno sin barra cuesta un
     salto de redirección. */
  trailingSlash: "always",
  /* El CSS de Astro va DENTRO del HTML (seo/fase-4, LCP). Eran tres hojas de
     2-14 KB, cada una con su propia petición render-blocking: en móvil 4G
     sumaban ~600-850 ms antes del primer pintado (Lighthouse sobre
     producción, 2-oct-2026). caras.css sigue aparte: es grande y se cachea
     entre páginas, que es justo lo que no gana incrustándola. */
  build: { inlineStylesheets: "always" },
  integrations: [
    sitemap({
      filter: (url) => !FUERA_DEL_SITEMAP.includes(new URL(url).pathname),
      serialize(item) {
        const fecha = lastmodDe(item.url);
        if (fecha) item.lastmod = fecha.toISOString();
        return item;
      },
      /* Un archivo por familia. Hoy todo cae en «paginas»; cuando lleguen las
         páginas programáticas (fase 3) cada una tendrá su propio
         sitemap-<familia>-N.xml y Search Console las mostrará por separado,
         que es lo que permite medir cuántas indexa de cada tipo. */
      chunks: {
        paginas: (item) => item,
      },
    }),
  ],
  // Tailwind 4 entra como plugin de Vite, no como integración de Astro:
  // @astrojs/tailwind quedó descontinuado y arrastraba PostCSS + autoprefixer
  // en cada petición del dev server. El motor de v4 va en Rust.
  vite: { plugins: [tailwindcss()] },
});
