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

## Web y app 2027: widgets, tema oscuro y radar — regla de John, 30-oct-2026

Referencia: `handoff/web-y-app-2027/` (marco `#16a`). **Esto ya es el sistema de diseño** (guía `contradar-ui`). La portada se escribe en `components/inicio/Inicio2027.astro`; el resto del sitio hereda el molde desde el final de `styles/global.css`.

Tema oscuro: `data-theme="dark"` en `<html>`, por defecto claro, recordado en `localStorage` y respetando `prefers-color-scheme`. Sobre un fondo de color el texto es `--on-action`, nunca `--papel-000`.

**Firma visual: el radar.** Anillos concéntricos finos con un barrido cónico lento (9 s), solo en el hero de la web, en el cierre y en estados vacíos. Nunca en tablas ni en formularios.
