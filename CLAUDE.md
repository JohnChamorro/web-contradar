# web-contradar — reglas del proyecto

La landing de ContRadar (Astro + Cloudflare Pages). La app y su backend viven en
`~/eulertech/contradar`.

## Push a main = despliegue a producción — regla de John, 2026-10-13

**En web-contradar, push a main = despliegue a producción. Nunca hacer push a
main; solo John.** Cloudflare Pages publica `main` en contradar.com.co en cuanto
llega el push: no hay paso intermedio ni aprobación. Tampoco se hace push de
otras ramas: las sube John para ver la vista previa de Pages.

`.claude/settings.json` niega `git push` para que la regla no dependa de la
memoria de nadie.

Pasó el 13-oct-2026: otra sesión que compartía la carpeta hizo `checkout main`,
fusionó una rama en revisión y la empujó; los cambios salieron a producción sin
visto bueno.

## Una sesión, un worktree

**Cada sesión trabaja en su propio `git worktree`; nunca dos sesiones en la misma
carpeta.** Dos sesiones en un árbol comparten HEAD: un `git switch` de una le
cambia la rama a la otra sin aviso, y sus commits caen donde no deben. Antes de
cada commit, `git branch --show-current`.

```bash
git worktree add ../web-contradar-<tema> -b <rama> origin/main
```

Despliegue y su orden: `docs/seo/despliegue-web.md`.

## Logo — regla de John, 2-nov-2026 (logo 2027, opción F, con su adenda)

**Logo.** El símbolo es una C con la cuña del barrido y el punto detectado.
- El nombre «ContRadar» va en Manrope 800, con −2 %, en **dos colores**: «Cont» en tinta y «Radar» en azul `#0D4488` sobre fondo claro; en fondo oscuro, «Cont» en blanco y «Radar» en `#74ABEA`.
- El azul de «Radar» siempre es el mismo del símbolo.
- En un solo color, todo tinta o todo blanco.
- El símbolo no baja de 16 px.
- No lleva sombras, contornos ni degradados, y no se rota.

En la web: `<Logo>` (`src/components/Logo.astro`, en línea, colores de `--logo-cont` / `--logo-radar`), en la barra a 32 px + nombre de 23 px. La cuña solo se anima en la carga: el velo de carga (`#cr-splash`, solo si tarda más de 400 ms) y una vuelta del logo de la barra en la portada, una vez por sesión. Fuente de los archivos: `contradar-design/marca/generar.py`; los PNG de correo viven en `public/marca/email/` y `public/email-*.png`.

## Web y app 2027: widgets, tema oscuro y radar — regla de John, 30-oct-2026

Referencia: `handoff/web-y-app-2027/` (marco `#16a`). **Esto ya es el sistema de diseño** (guía `contradar-ui`). La portada se escribe en `components/inicio/Inicio2027.astro`; el resto del sitio hereda el molde desde el final de `styles/global.css`.

Tema oscuro: `data-theme="dark"` en `<html>`, por defecto claro, recordado en `localStorage` y respetando `prefers-color-scheme`. Sobre un fondo de color el texto es `--on-action`, nunca `--papel-000`.

**Firma visual: el radar.** Anillos concéntricos finos con un barrido cónico lento (9 s), solo en el hero de la web, en el cierre y en estados vacíos. Nunca en tablas ni en formularios.
