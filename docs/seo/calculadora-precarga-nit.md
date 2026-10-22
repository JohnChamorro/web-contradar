# Calculadora de K: precarga de contratos en ejecución desde el NIT

> Propuesta, ronda SEO 2 (22-oct-2026). **No hay código de backend todavía.**
> Se implementa en el repo `contradar` solo si John aprueba las decisiones del
> final.

## Diagnóstico

**Qué pasa ahora.** La calculadora
(`/herramientas/calculadora-capacidad-residual/`) es 100 % manual y corre en el
navegador: quien la usa teclea cada contrato en ejecución (valor, plazo, días
por ejecutar, participación). Es el bloque que más cuesta llenar, y donde más
se equivoca la gente: olvida contratos de SECOP I y los de consorcio.

**Qué ya existe en el backend.** El motor está hecho y validado:
`degradacion.provider_projects_local(db, nit)` + `capacidad_residual.public_sce`.
Es el mismo que calcula la «capacidad comprometida» de los competidores en
Competencia: suma SECOP II (`historical_contracts`, directos y vía consorcio) y
SECOP I (`secop1_contracts`), pondera por participación, aplica el tope de 360
días, excluye liquidación (Concepto C-392/2022) y solo cuenta obra
(`cuenta_para_sce`). Y `GET /public/diagnostico/{nit}` ya tiene la defensa en
capas que necesita un endpoint público con NIT: ráfaga por IP, cupo diario por
IP, cupo de NIT distintos, Turnstile solo en consultas frías, presupuesto
global de frías y caché en memoria y en base.

**Medido en dev (22-oct, dentro del contenedor del backend, transacción READ ONLY):**

| NIT (empresa) | Tiempo | Vigentes | Con SCE > 0 | SCE total |
|---|---:|---:|---:|---:|
| 901380930 | 21,75 s (primera consulta, en frío) | 100 (tope de la lista) | 23 | $4.472 M |
| 901848014 | 0,03 s | 88 | 9 | $1.046 M |
| 901126551 | 0,02 s | 45 | 15 | $9.085 M |
| 860002184 | 0,50 s | 100 | 0 | $0 |

La primera consulta en frío tarda ~22 s (páginas de disco); después, entre 20
y 500 ms. Por eso la caché y el presupuesto global no son opcionales.

**Qué pasará después.** Quien escribe su NIT ve sus contratos de obra en
ejecución precargados en el bloque 3, cada uno con su enlace al SECOP, los
revisa y completa los que no están en datos abiertos (privados, régimen
especial). El resto del formulario (CO, experiencia, liquidez, profesionales)
**sigue siendo manual**: sale del RUP y de los estados financieros, que no son
datos abiertos.

## El endpoint

```
GET /public/capacidad-residual/{nit}
```

- **Solo personas jurídicas**: NIT `^[89]\d{8}$` (con o sin DV, se normaliza).
  Una cédula responde `400 solo_empresas`. Mismo criterio que las páginas
  programáticas: nada de personas naturales en superficies públicas.
- **Sin autenticación, sin escrituras** (salvo los contadores de cupo).
- **Respuesta** (solo lo necesario para llenar el formulario):

```json
{
  "nit": "901126551",
  "corte": "2026-10-21",
  "contratos": [
    {
      "fuente": "SECOP II",
      "entidad": "MUNICIPIO DE …",
      "valor": 1200000000,
      "plazo_meses": 10,
      "dias_por_ejecutar": 120,
      "participacion": 100,
      "sce": 480000000,
      "url": "https://community.secop.gov.co/…"
    }
  ],
  "sce_total": 9085000000,
  "fuera": { "sin_plazo": 2 }
}
```

  `plazo_meses` y `dias_por_ejecutar` salen de `sce_detalle` (los mismos días
  que usó para el SCE: un suspendido cuenta como si reanudara hoy), para que la
  fórmula del navegador dé exactamente el mismo saldo que el backend. Los
  contratos que `sce_detalle` marca «incompletos» (sin plazo o sin %) no se
  precargan: se cuentan en `fuera` y la página dice «2 contratos sin plazo en
  el SECOP: agrégalos a mano».

  **No** se devuelven el objeto del contrato ni nombres de supervisores o
  personas: solo entidad, cifras, fechas y enlace.

- **Defensa** (copiada de `diagnostico`, con nombres propios):
  - `check_ip("k_nit", ip, 8/min)` y `check_ip("k_nit_dia", ip, 25/día)`.
  - Turnstile solo cuando hay que calcular en frío.
  - Presupuesto global de consultas frías por día (propuesta: 300); al
    agotarse, `503` con `Retry-After` y la calculadora sigue funcionando a mano.
  - Caché en memoria por NIT hasta el siguiente refresco de los pollers
    (TTL ≤ 24 h, invalidada a las 03:30 con la ventana del buscador).
  - `Cache-Control: public, max-age=3600` para que Cloudflare pueda servir
    repetidos si se añade una regla de caché para esa ruta (opcional).
- **CORS**: añadir `https://contradar.com.co` a `cors_origins` si no está.
- **Coste en el VPS (7 GB)**: es `def` síncrono (va al threadpool, no bloquea
  el event loop), una consulta por NIT frío y cero trabajo en los cacheados. El
  techo lo pone el presupuesto global, no el tráfico.

## En la calculadora (web)

- Campo «NIT de tu empresa» + botón «Traer mis contratos del SECOP» encima del
  bloque 3.
- Las filas precargadas llevan «Del SECOP · ver contrato» y se pueden editar o
  quitar; las manuales siguen igual.
- El texto de privacidad cambia, porque deja de ser cierto que «nada sale del
  equipo»: «Si usas la precarga, enviamos solo tu NIT para buscar tus
  contratos; el resto se calcula en tu navegador».
- Evento `calculadora_k_precarga` (con `contratos: n`), sin el NIT.
- Si el endpoint falla o se agota el cupo, mensaje con la causa y la
  calculadora sigue a mano (vacío tipo 5: qué pasó y reintentar).

## Decisiones para John

1. ¿Se aprueba el endpoint con estas defensas y el presupuesto de 300 frías al día?
2. ¿El NIT consultado se guarda como lead (como en el diagnóstico) o **no se
   guarda**? La propuesta es no guardarlo: la calculadora promete privacidad.
3. ¿Se comparte el cupo de NIT distintos con el diagnóstico o va aparte?

## Plan si se aprueba

1. `contradar`: rama `feat/k-precarga-publica` — endpoint, tests de límite,
   de persona natural (400) y de que el SCE del endpoint = el de Competencia
   para los cuatro NIT de arriba.
2. Despliegue del backend (John) **antes** de la web.
3. `web-contradar`: rama `seo/ronda-2-calculadora-precarga` — botón, filas
   precargadas, textos y evento.
