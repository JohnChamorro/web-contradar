# ContRadar — Web (landing)

Landing de marketing de **ContRadar** (producto de *eulertech*). Repo separado del producto
(`secop-alerts`): este es público/marketing, aquel es privado/producto.

- **Stack:** [Astro](https://astro.build) + Tailwind CSS. HTML estático (0 JS por defecto), ideal para SEO.
- **Dominios previstos:** `contradar.com.co` (esta landing) · `app.contradar.com.co` (el producto React).
- **Deploy:** Cloudflare Pages (CDN global, SSL automático). El formulario usa una Pages Function con Resend.

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # genera dist/
npm run preview  # sirve dist/ localmente
```

## Estructura

```
src/
  consts.ts            # marca + enlaces (APP_URL, LOGIN_URL, CONTACT_EMAIL)
  data/content.ts      # TODO el copy (sectores, pasos, planes, FAQ) — editar aquí
  layouts/Base.astro   # <head>, SEO/OG, fuente Inter
  components/          # Nav, Hero, EmailMock, Problem, HowItWorks,
                       # Verticals, Pricing, Faq, AccessForm, Footer
  pages/index.astro    # ensambla las secciones
functions/api/contact.js  # Cloudflare Pages Function (formulario → Resend)
public/                # favicon.svg, robots.txt
```

## Editar contenido

- **Textos/planes/sectores/FAQ:** `src/data/content.ts`.
- **Enlaces y correo:** `src/consts.ts` (cambia `APP_URL` cuando definas el subdominio del producto).
- **Colores/fuente:** `tailwind.config.mjs` (espejan la marca del producto).

## Deploy en Cloudflare Pages

1. Sube este repo a GitHub (privado o público).
2. Cloudflare → **Pages** → *Connect to Git* → este repo.
3. Build settings:
   - Framework preset: **Astro**
   - Build command: `npm run build`
   - Output directory: `dist`
4. **Environment variables** (Settings → Environment variables):
   - `RESEND_API_KEY` — tu API key de Resend
   - `CONTACT_TO` — correo destino (ej. `hola@contradar.com.co`)
   - `CONTACT_FROM` — remitente verificado en Resend (en pruebas: `ContRadar <onboarding@resend.dev>`)
5. Dominio: apunta `contradar.com.co` a este proyecto Pages (Custom domains).

El endpoint `functions/api/contact.js` lo detecta Cloudflare Pages automáticamente (carpeta `functions/`).

## Pendiente

- Reemplazar `onboarding@resend.dev` por dominio verificado en Resend.
- Prueba social (testimonios) cuando haya clientes fundadores.
- Confirmar el correo de contacto y el subdominio del producto.
- Activar registro self-service en el producto (hoy el acceso es por solicitud manual).
