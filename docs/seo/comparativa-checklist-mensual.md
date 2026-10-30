# Comparativa — revisión mensual

`/guias/mejores-apps-licitaciones-colombia/` es la página que más rankea
(#1 en «mejores apps de licitaciones colombia 2026» y #5 en «app de
licitaciones colombia» el 22-oct). Google premia que esté al día, y la página lo
promete («la revisamos cada mes»), así que la revisión **se hace de verdad** o la
fecha no se toca.

**No se cambian nunca:** la URL, el `<title>` ni el H1.

**Riesgo anotado (30-oct-2026):** «mejores» en el `<title>` y el H1 es un superlativo en una página
que no rankea (Ley 256 de 1996, art. 13). Se conserva por la regla de arriba; la decisión es de John.

**Reglas de texto desde el 30-oct-2026:** nada de «la única», «ninguna otra» ni «nadie más»; lo no
encontrado se escribe «no lo declara en las páginas revisadas». El precio por entidad lleva siempre
«en el plan Dominio». Lo nuevo de ContRadar (formatos, preguntas al pliego, oferta económica) va detrás
de `nov()` de `src/lib/lanzamiento.ts`. Se escribe «llena formatos», nunca «genera la propuesta». Telegram
de ContRadar no se anuncia.

## Cada mes (primera semana), ~45 minutos

1. **Precios y planes.** Abre la web de cada app (la lista está en `fuentes`,
   al final del archivo) y compara con el campo `precio` de su ficha:
   - montos, periodos, si incluye IVA, plan gratis o prueba;
   - si la página carga los precios con JavaScript (Licitaciones.info), mírala
     en el navegador, no con `curl`. Esa web anuncia su prueba solo así.
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
6. **Fechas** (solo si hiciste 1-4), también en las cuatro páginas de `/alternativas/`, que llevan
   a la vista «Revisado el …»:
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
| 30-oct-2026 | revisión 2 | Corrige lo dicho sobre ContRadar (lee el pliego con IA, cruza el RUP; llena formatos tras la bandera). Licitarus: planes Encontrar y Analizar. Licitaciones.info: prueba de 30 días y más de 1.000 portales. iaLicitaciones: SECOP I, II, TVEC y PAA; moneda sin aclarar (tarjeta en €, FAQ en USD). LicitIA: evaluación con IA desde $29.900; sin HubSpot ni Salesforce. Licitum: K-residual e historial de adjudicaciones; ya no dice «cláusulas»; su web volvió a responder a consultas directas. Las capacidades sin otra que las declare bajan de 13 a 4. BuscaSECOP sigue sin resolver DNS. |
| 22-oct-2026 | revisión 1 | Licitarus Pro $690.000 → $790.000/mes ($5.900.000 → $6.900.000/año). El País Licita → GremIA (301 a gremia.com, mismos planes; suma «primer mes gratis»). Sin cambios: LicitIA, Licitum, Fromus, LicitaYa, Licitaciones.info, iaLicitaciones, Colombia Licita. BuscaSECOP sigue sin cargar. |
