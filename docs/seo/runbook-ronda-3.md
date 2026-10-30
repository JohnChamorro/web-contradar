# Runbook de la ronda SEO 3

Lo manual, clic por clic. Lo de desplegar va aparte, en la sección 3.

## 1. Antes de seguir: exportar los CSV

Crea la carpeta `docs/seo/data/` y guarda ahí todo. Nómbralos como se indica.

**Consultas por página** (la mínima cuantía y las 11 del Bloque B):

1. [Search Console](https://search.google.com/search-console) → propiedad de contradar.com.co.
2. Menú izquierdo → **Rendimiento** → **Resultados de búsqueda**.
3. Arriba: **Fecha** → **Últimos 28 días** → **Aplicar**.
4. **+ Nuevo** → **Página…** → «URLs que contienen» → pega la ruta → **Aplicar**.
5. Baja a la tabla → pestaña **Consultas**.
6. Arriba a la derecha → **Exportar** → **Descargar CSV**. Se baja un .zip: guarda `Consultas.csv`.
7. Renómbralo `consultas-<guia>.csv`.
8. Quita el filtro de página y repite con la siguiente.

Rutas, en orden: `/guias/minima-cuantia/`, `/guias/poliza-de-seriedad-de-la-oferta/`,
`/guias/secop-i-vs-secop-ii/`, `/guias/seleccion-abreviada/`,
`/guias/requisitos-habilitantes/`, `/guias/que-es-el-rup/`,
`/guias/consorcios-y-uniones-temporales/`, `/guias/como-calcular-la-oferta-economica/`,
`/guias/como-buscar-licitaciones-en-secop/`, `/guias/que-es-el-paa/`,
`/licitaciones-colombia/`, `/guias/como-ganar-una-licitacion/`.

**URLs de cada motivo de no indexación:**

1. Menú izquierdo → **Indexación** → **Páginas**.
2. Baja a «Por qué las páginas no se indexan» y haz clic en un motivo.
3. Arriba a la derecha → **Exportar** → **Descargar CSV**.
4. Guarda `Tabla.csv` como `noindexadas-<motivo>.csv`: `redireccion`, `404`, `noindex`, `robots`, `sin-indexar`.
5. Vuelve atrás y repite con los otros cuatro.

## 2. Los SQL de los datos propios

Comandos para correr **en el VPS**, sin `ssh` delante. Solo lectura. Tardan unos 30 s
en dev, y el bucle imprime el avance cada 15 s.

```bash
cd /root/contradar
# Copia aquí estas consultas de docs/seo/consultas-fase-2.md, en este orden: la puerta de
# secop-share-secop-i, mc-precio-2026, mc-municipios-tope, mc-tope-paa-2026,
# modalidad-precio-2025, cb-competitivos-dia, sectores-2025 y paa-lineas-2026
nano /tmp/mc.sql
docker cp /tmp/mc.sql contradar-postgres:/tmp/mc.sql
docker exec -d -e PGAPPNAME=mc_r3 contradar-postgres bash -c 'psql -U contradar -d contradar -f /tmp/mc.sql > /tmp/mc.log 2>&1'
sleep 3
for i in $(seq 1 80); do
  n=$(docker exec contradar-postgres psql -U contradar -d contradar -Atc "select count(*) from pg_stat_activity where application_name='mc_r3'")
  echo "$(date +%T) activas: $n"
  [ "$n" = "0" ] && break; sleep 15
done
docker exec contradar-postgres cat /tmp/mc.log
docker exec contradar-postgres rm -f /tmp/mc.sql /tmp/mc.log
```

Pégame la salida. Si no corres esas consultas, la guía igual se publica bien: las
cajas sin valor no se pintan.

## 3. Despliegue (solo cuando lo decidas)

Hoy todo está en `develop`, **que no se publica**. Producción sigue en `main`.

Orden cuando quieras publicar:

1. **Backend primero.** Lo de la ronda 2 ya está en `main` de contradar, pero **no en
   PRD** (el 30-oct, `/public/abiertos-web` y `/public/capacidad-residual/` dan 404).
   Si publicas la web antes, «Traer mis contratos» de la calculadora dará error y no
   habrá listados de abiertos.
2. `seo/ronda-3-medicion` ya está unida a `develop` de contradar (589d2fe0). Llévala a `main`
   y despliega como siempre. No trae migraciones.
3. Agrega `CF_PAGES_DEPLOY_HOOK` en `.env.production` y `ABIERTOS_URL` en Pages
   (ronda 2). Sin ellas no hay listados y nada se rompe.
4. Publica la web llevando `develop` a `main`. **Ojo:** `develop` trae también los
   precios de noviembre: publícalo solo cuando ese lanzamiento esté en PRD.

## 4. Después de cada despliegue

1. Search Console → barra superior **Inspeccionar cualquier URL** → pega la URL → **Solicitar indexación**. Prioridad:
   1. `/guias/minima-cuantia/`
   2. `/guias/capacidad-residual/`
   3. `/herramientas/calculadora-capacidad-residual/`
   4. `/guias/poliza-de-seriedad-de-la-oferta/`
   5. `/guias/secop-i-vs-secop-ii/`
   6. `/guias/seleccion-abreviada/`
   Google limita las solicitudes por día; sigue al día siguiente si te frena.
2. **Indexación** → **Páginas** → motivo **No se ha encontrado (404)** → **Validar corrección**. Repite con **Página con redirección**.
3. En tu PC:
   ```bash
   cd ~/eulertech/web-contradar
   npm run indexnow
   ```
   El script es `scripts/indexnow.mjs`, no `.sh`. Avisa a Bing y otros; Google no participa.
4. Marca tu navegador como interno una sola vez: abre `https://contradar.com.co/?cr_interno=1`.

## 5. Seguimiento

1. Espera **2 a 4 semanas** antes de juzgar un title: los cambios tardan en verse.
2. Search Console → **Rendimiento** → **Fecha** → **Comparar** → **Personalizado**: los 28 días posteriores al despliegue contra 1-28 oct.
3. Filtra por página y anota clics, impresiones, CTR y posición en `seguimiento-posiciones.md`.
4. **Lo que más importa:** CTR y posición de `/guias/minima-cuantia/` (base: 0,8 % y 6,0), y de la búsqueda «minima cuantia 2026» (727 impresiones, posición 7 a 8,6).
5. Leads por guía: `embudo.md`, sección «Cómo leer guía → diagnóstico → prueba».
