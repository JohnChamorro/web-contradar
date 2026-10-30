# Comparativa — revisión mensual

`/guias/mejores-apps-licitaciones-colombia/` es la página que más rankea
(#1 en «mejores apps de licitaciones colombia 2026» y #5 en «app de
licitaciones colombia» el 22-oct). Google premia que esté al día, y la página lo
promete («la revisamos cada mes»), así que la revisión **se hace de verdad** o la
fecha no se toca.

**No se cambian nunca:** la URL, el `<title>` ni el H1.

## Cada mes (primera semana), ~45 minutos

1. **Precios y planes.** Abre la web de cada app (la lista está en `fuentes`,
   al final del archivo) y compara con el campo `precio` de su ficha:
   - montos, periodos, si incluye IVA, plan gratis o prueba;
   - si la página carga los precios con JavaScript (Licitaciones.info), mírala
     en el navegador, no con `curl`.
2. **Nombre y dominio.** Si un dominio redirige a otro (El País Licita → GremIA
   el 22-oct), actualiza el nombre como «Nuevo (antes Viejo)», la fuente y el
   comentario del código.
3. **Capacidades.** Para cada app, revisa en su web las capacidades que hoy
   marcamos con ✓ o ½, y busca capacidades nuevas de la lista de 27. Solo se
   marca lo que **su web declara**.
4. **Apps nuevas o caídas.** Busca en Google «app de licitaciones colombia» y
   «software de licitaciones colombia»: si aparece una app nueva con web y
   precio públicos, agrégala; si una deja de cargar, dilo como con BuscaSECOP
   («su web no cargó el día de la consulta») y no publiques sus datos viejos.
5. **ContRadar.** Su ficha lee precio y prueba de `src/data/producto.ts`:
   confirma que ese archivo coincide con la tabla `plans` de la app.
6. **Fechas** (solo si hiciste 1-4):
   - `dateModified="AAAA-MM-DD"` en el `<GuideLayout>` (sale «Actualizada el…»
     bajo el H1 y en el JSON-LD);
   - `consultadas="AAAA-MM-DD"` en `<Fuentes>`;
   - el párrafo `.revision`: fecha y **qué cambió** en esta revisión (o «sin
     cambios en precios ni nombres»).
7. **Build y prueba:** `npm run build && npm test`; abre la página y valida el
   JSON-LD en https://search.google.com/test/rich-results.
8. **Seguimiento:** anota la posición de las dos consultas en
   `seguimiento-posiciones.md` y la revisión en «Qué cambió entre mediciones».

## Registro

| Fecha | Quién | Cambios |
|---|---|---|
| 22-oct-2026 | revisión 1 | Licitarus Pro $690.000 → $790.000/mes ($5.900.000 → $6.900.000/año). El País Licita → GremIA (301 a gremia.com, mismos planes; suma «primer mes gratis»). Sin cambios: LicitIA, Licitum, Fromus, LicitaYa, Licitaciones.info, iaLicitaciones, Colombia Licita. BuscaSECOP sigue sin cargar. |
