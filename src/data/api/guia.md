<!-- GENERADO por scripts/guia-api.mjs desde contradar/docs/api-clientes.md. No se edita aquí. -->

Guía para quien conecta su sistema (ERP, sistema de compras, tablero interno) con
ContRadar. Viene con el **plan Dominio**.

**Qué es:** una API de **solo lectura** que entrega los procesos de **tu empresa** en
ContRadar, con sus documentos, adendas y resultado:

- los que **sigue** en Mis licitaciones, en cualquier etapa (Revisando, Preparando,
  Enviada, Ganada, En ejecución, Perdida), y
- los de su **bandeja** de Búsquedas (le llegaron por sus búsquedas y aún no decide).

**No** salen los que la empresa **descartó** («No nos interesa») ni los que
**archivó**, aunque los hubiera seguido antes: si los sacó de su vista, tampoco salen
por la API. Si después los restaura, vuelven a salir.

**Qué no es:** no da acceso al mercado completo ni al histórico general de SECOP, no
crea ni modifica nada, no envía avisos (no hay webhooks) y no es tiempo real.


---

## Autenticación

1. En la app, un **administrador** de la empresa entra a **Mi empresa › API** y pulsa
   **Crear clave**. Le pone un nombre (el sistema que la va a usar), y si quiere, una
   fecha de vencimiento y la lista de IPs desde las que se puede usar.
   Si tu servidor tiene IPv6, suele salir por ella y no por la IPv4: pon las dos
   (o el bloque, p. ej. `2001:db8:1234::/64`). Para saber cuál vemos, llama a `/yo`
   sin lista de IPs: el campo `ip` la dice.
2. La clave se muestra **una sola vez**. ContRadar no la guarda: si se pierde, se
   revoca y se crea otra.
3. Cada petición lleva la clave en la cabecera:

```
Authorization: Bearer cr_live_ab12cd34ef_<64 caracteres>
```

- Hasta **5 claves activas** por empresa. Usa una por sistema: si una se filtra, la
  revocas sin cortar las demás.
- **Crear** una clave pide **siempre** la contraseña del administrador. Si su cuenta
  nació con el enlace del correo y nunca eligió contraseña, la pantalla le pide
  crearla primero (Mi perfil › Correo y contraseña).
- **Revocar** basta con la sesión del administrador y la confirmación en pantalla.
- Cada alta y cada revocación llegan **por correo a todos los administradores** de la
  empresa (nombre de la clave, prefijo, quién, desde qué IP y cuándo). Si recibes uno
  que no reconoces, revoca la clave y cambia tu contraseña.
- La clave es de la **empresa**, no de la persona: si quien la creó deja la empresa,
  sigue funcionando y la lista lo marca para que decidas si la revocas.
- **Es servidor a servidor.** La API no responde a navegadores de otros sitios (no
  tiene CORS): no pongas la clave en una página web ni en una app de celular.
- Si la empresa deja el plan Dominio o la suscripción queda suspendida, las claves
  dejan de funcionar en la siguiente petición (`403`), pero no se borran: vuelven a
  funcionar al regularizar.

Dirección base:

```
https://app.contradar.com.co/api/integracion/v1
```

Descripción técnica (OpenAPI 3.1, solo estas rutas):
`https://app.contradar.com.co/api/integracion/v1/openapi.json`

> Todos los datos de ejemplo de esta guía son ficticios: empresas, entidades, NIT,
> procesos, claves e IP.

Para probar la conexión:

```bash
export CR_CLAVE="cr_live_…"
curl -s https://app.contradar.com.co/api/integracion/v1/yo \
  -H "Authorization: Bearer $CR_CLAVE"
```

```json
{
  "empresa": "Constructora Cordillera del Sur S.A.S.",
  "plan": "Dominio",
  "clave": {"nombre": "ERP de compras", "prefijo": "ab12cd34ef", "expira_at": null},
  "limites": {"por_minuto": 60, "por_dia": 10000},
  "uso": {"hoy": 1, "restantes_hoy": 9999, "ultimo_minuto": 1},
  "ip": "192.0.2.10",
  "hora_servidor": "2026-11-23T10:17:59.372606-05:00"
}
```

---

## Endpoints

Todos son `GET`, responden JSON en UTF-8 y van bajo `/api/integracion/v1`.

| Endpoint | Qué entrega |
|---|---|
| `GET /yo` | Tu empresa, plan, límites y uso de hoy de la clave |
| `GET /procesos` | Tus procesos, paginados, con filtros |
| `GET /procesos/{secop_id}` | La ficha de un proceso |
| `GET /procesos/{secop_id}/documentos` | La lista de documentos publicada en SECOP |
| `GET /procesos/{secop_id}/adendas` | Las adendas detectadas y, si se leyeron, qué cambió |
| `GET /adjudicaciones` | Quién ganó tus procesos, por cuánto y quiénes se presentaron |

### `GET /procesos`

| Parámetro | Tipo | Qué hace |
|---|---|---|
| `actualizado_desde` | fecha y hora ISO-8601 | Solo procesos que cambiaron desde ese momento. Sin zona se asume la de Colombia |
| `estado` | texto | Estado exacto de SECOP («Publicado», «Adjudicado», «Celebrado»…), sin distinguir mayúsculas |
| `departamento` | texto | Departamento de la **entidad**, sin distinguir tildes ni mayúsculas |
| `municipio` | texto | Municipio de la **entidad** |
| `entidad_nit` | texto | NIT de la entidad, con o sin dígito de verificación |
| `modalidad` | texto | Parte del nombre de la modalidad: `minima cuantia`, `licitacion` |
| `seguido` | `true` / `false` | `true` = solo los que sigues; `false` = solo la bandeja |
| `limite` | entero | Filas por página. Por defecto 100, máximo 500 |
| `cursor` | texto | El `siguiente_cursor` de la respuesta anterior |

```bash
curl -s "https://app.contradar.com.co/api/integracion/v1/procesos?modalidad=minima%20cuantia&departamento=Cauca&limite=100" \
  -H "Authorization: Bearer $CR_CLAVE"
```

```json
{
  "datos": [
    {
      "secop_id": "CO1.REQ.1234567",
      "referencia": "MC-012-2026",
      "plataforma": "SECOP II",
      "entidad": {"nombre": "Alcaldía de Villa Central", "nit": "800123456"},
      "departamento": "Cauca",
      "municipio": "Popayán",
      "modalidad": "Mínima cuantía",
      "tipo_contrato": "Obra",
      "nombre": "Mejoramiento de vía terciaria",
      "objeto": "Mejoramiento de la vía terciaria vereda El Placer",
      "estado": "Publicado",
      "presupuesto": 85000000,
      "fecha_publicacion": "2026-11-18T09:12:00-05:00",
      "fecha_cierre": "2026-11-25T17:00:00-05:00",
      "fecha_cierre_secop": "2026-11-25T17:00:00-05:00",
      "cierre_ajustado_por_tu_empresa": false,
      "enlace": "https://community.secop.gov.co/Public/Tendering/OpportunityDetail/Index?noticeUID=CO1.NTC.1234567",
      "n_documentos": 6,
      "seguimiento": {"seguido": true, "etapa": "participating", "etapa_nombre": "Preparando",
                      "seguido_desde": "2026-11-19T08:30:00-05:00"},
      "recibido_at": "2026-11-18T13:00:00-05:00",
      "actualizado_at": "2026-11-20T04:41:09.123456-05:00"
    }
  ],
  "siguiente_cursor": "eyJ0IjoiMjAyNi0xMS0yMFQwOTo0MTowOS4xMjM0NTYrMDA6MDAiLCJpIjoxMjN9"
}
```

### `GET /procesos/{secop_id}`

La misma información y además `fase`, `portafolio` (`CO1.BDOS.n` en SECOP II),
`codigo_unspsc`, `duracion_dias`, `plazo_texto`, `contrato_firmado_el` y `n_adendas`.

```bash
curl -s https://app.contradar.com.co/api/integracion/v1/procesos/CO1.REQ.1234567 \
  -H "Authorization: Bearer $CR_CLAVE"
```

Un proceso que no está entre los de tu empresa responde `404`, exista o no en SECOP.

### `GET /procesos/{secop_id}/documentos`

```bash
curl -s https://app.contradar.com.co/api/integracion/v1/procesos/CO1.REQ.1234567/documentos \
  -H "Authorization: Bearer $CR_CLAVE"
```

```json
{
  "secop_id": "CO1.REQ.1234567",
  "datos": [
    {"nombre": "Estudios previos.pdf",
     "url": "https://community.secop.gov.co/Public/Archive/RetrieveFile/Index?DocumentId=…",
     "extension": "pdf", "tamano_bytes": 468602, "fecha_publicacion": "2026-11-18"}
  ]
}
```

Es la **lista** que publica SECOP. ContRadar no guarda ni sirve los archivos: el
enlace es el oficial y depende de que SECOP lo mantenga.

### `GET /procesos/{secop_id}/adendas`

```bash
curl -s https://app.contradar.com.co/api/integracion/v1/procesos/CO1.REQ.1234567/adendas \
  -H "Authorization: Bearer $CR_CLAVE"
```

```json
{
  "secop_id": "CO1.REQ.1234567",
  "datos": [
    {"numero": 1, "nombre": "Adenda No. 1.pdf", "url": "https://community.secop.gov.co/…",
     "fuente": "documento", "publicada_at": "2026-11-20T00:00:00-05:00",
     "detectada_at": "2026-11-20T06:15:00-05:00", "estado_lectura": "leida", "confianza": "alta",
     "cambios": [{"categoria": "fechas", "resumen": "Se corre el cierre", "antes": "25/11/2026",
                  "ahora": "28/11/2026", "numeral": "3.1", "pagina": "4", "documento": "Adenda No. 1.pdf"}]}
  ]
}
```

- `fuente`: `documento` (un archivo de adenda), `campo` (SECOP cambió el cierre o el
  presupuesto sin publicar documento todavía) o `historico` (catálogo de documentos
  de SECOP).
- `estado_lectura`: `pendiente`, `leida`, `parcial` o `ilegible`. `cambios` solo
  viene si se leyó; si no, es `null`. Nunca se inventa lo que no se pudo leer.

### `GET /adjudicaciones`

| Parámetro | Tipo | Qué hace |
|---|---|---|
| `desde` | fecha `AAAA-MM-DD` | Solo resultados con fecha de firma o adjudicación desde ese día |
| `limite` | entero | Máximo de filas por página. Por defecto 100, máximo 500 |
| `cursor` | texto | El `siguiente_cursor` de la respuesta anterior |

```bash
curl -s "https://app.contradar.com.co/api/integracion/v1/adjudicaciones?desde=2026-10-01" \
  -H "Authorization: Bearer $CR_CLAVE"
```

```json
{
  "datos": [
    {"secop_id": "CO1.REQ.1234567", "plataforma": "SECOP II",
     "entidad": {"nombre": "Alcaldía de Villa Central", "nit": "800123456"},
     "modalidad": "Mínima cuantía", "presupuesto": 85000000,
     "fuente_resultado": "contrato",
     "ganador": {"nombre": "Estructuras Munchique S.A.S.", "nit": "901234565", "es_consorcio": false},
     "valor_adjudicado": 81200000, "fecha_adjudicacion": "2026-11-10", "estado_contrato": "En ejecución",
     "numero_oferentes": 3, "ofertas_disponibles": true,
     "ofertas": [{"proponente": "Estructuras Munchique S.A.S.", "nit": "901234565", "valor": 81200000, "fecha": "2026-11-02"},
                 {"proponente": "Consorcio Vial Alto Puracé", "nit": "901234561", "valor": 83900000, "fecha": "2026-11-02"}]}
  ],
  "siguiente_cursor": "eyJpIjoxMjN9"
}
```

De dónde sale el ganador, en este orden (el mismo de la ficha de la app):

1. `contrato`: el contrato firmado en SECOP II (dataset de contratos).
2. `adjudicacion_secop`: la adjudicación publicada en el proceso.
3. `documento_contrato`: el ganador leído del PDF del contrato cuando SECOP no lo
   publica (solo lecturas de confianza alta o media).

- `numero_oferentes`: cuántos se presentaron, si SECOP lo publica. Nulo si no.
- `ofertas`: el valor ofertado por cada proponente. **Solo SECOP II**: SECOP I no
  publica ofertas por proponente, y ahí viene `ofertas_disponibles: false` y
  `ofertas: null`. Lista vacía = SECOP II sin ofertas publicadas para ese proceso.
- Un proceso por lotes con varios adjudicatarios trae el primero; el valor por lote
  no está disponible.

---

## Paginación

Las listas usan un **cursor opaco y firmado**. No lo armes ni lo modifiques: pásalo
tal cual. Un cursor alterado responde `422 cursor_invalido`; si eso pasa a mitad de
una sincronización (por ejemplo, tras un cambio de llaves de nuestro lado), vuelve a
empezar desde tu último `actualizado_at` guardado.

- `GET /procesos` va en orden de `actualizado_at` y luego de un id interno. Para una
  sincronización incremental:
  1. La primera vez, pide sin `actualizado_desde` y sigue el `siguiente_cursor`
     hasta que llegue `null`. Guarda el mayor `actualizado_at` que viste.
  2. Las siguientes veces, pide `actualizado_desde` = ese valor **menos 10 minutos**
     (margen para cambios que se confirman tarde) y deduplica por `secop_id`
     quedándote con el de mayor `actualizado_at`.
  3. Un proceso que cambie mientras paginas vuelve a salir al final: no se pierde,
     y por eso hay que deduplicar.
  4. Una vez por semana, una resincronización completa: algunos campos derivados
     (como el departamento deducido de la entidad) se corrigen sin cambiar
     `actualizado_at`, y un proceso que tu empresa descarta o archiva deja de salir
     (la resincronización es la forma de saber que ya no está).
- `GET /adjudicaciones` recorre tus procesos en tramos. **Una página puede traer
  menos filas que `limite`, incluso ninguna, y aun así tener `siguiente_cursor`**:
  sigue pidiendo mientras no sea `null`. Como un resultado puede publicarse días
  después de la fecha de firma, usa `desde` con un margen (por ejemplo, 60 días
  atrás) y deduplica por `secop_id`.

```bash
cursor=""
while :; do
  r=$(curl -s "https://app.contradar.com.co/api/integracion/v1/procesos?limite=500${cursor:+&cursor=$cursor}" \
        -H "Authorization: Bearer $CR_CLAVE")
  echo "$r" | jq -c '.datos[]' >> procesos.jsonl
  cursor=$(echo "$r" | jq -r '.siguiente_cursor // empty')
  [ -z "$cursor" ] && break
done
```

---

## Límites y 429

Por **clave**:

| Tope | Valor | Se renueva |
|---|---|---|
| Por minuto, por clave | 60 peticiones | Ventana móvil de 60 s |
| Por día, por clave | 10.000 peticiones | A la medianoche de Colombia (UTC−5) |
| A la vez, por empresa | 3 peticiones en curso | En cuanto termina una |
| Por IP (en la entrada) | 2 por segundo, ráfagas de hasta 20 | Cada medio segundo |

Cada respuesta correcta trae:

| Cabecera | Qué dice |
|---|---|
| `X-RateLimit-Limit` | Tope por minuto |
| `X-RateLimit-Remaining` | Cuántas te quedan en este minuto |
| `X-RateLimit-Reset` | Segundos hasta que se libera cupo en el minuto |
| `X-RateLimit-Limit-Dia` | Tope del día |
| `X-RateLimit-Remaining-Dia` | Cuántas te quedan hoy |

Al pasarte, `HTTP 429` con `Retry-After` (segundos):

- `limite_minuto` / `limite_dia`: con las cabeceras `X-RateLimit-*` del tope agotado.
  Las respuestas `403` de una clave válida (IP no permitida, plan, suscripción)
  también gastan el cupo por minuto.
- `demasiadas_simultaneas`: tu empresa ya tiene 3 peticiones en curso. **Haz las
  peticiones de una en una** (o de a dos); paralelizar no acelera la sincronización.
- `demasiadas_peticiones`: el tope por IP de la entrada.
- `demasiados_intentos`: muchas peticiones con una clave que no sirve (o a rutas que
  no existen) desde la misma IP. Una clave **válida** nunca se frena por esto, aunque
  comparta IP con quien falla.

Espera los segundos de `Retry-After` antes de reintentar: una petición rechazada no
cuenta, pero reintentar en bucle no adelanta nada.

Si el servicio está atendiendo muchas consultas a la vez, responde `503` `ocupado` con
`Retry-After`: reintenta pasado ese tiempo. Cada consulta tiene además un tiempo
máximo (4 s); si una pasa de él, responde `503` `consulta_lenta`: baja el `limite` o
agrega filtros.

---

## Errores

Siempre con la misma forma:

```json
{"error": {"codigo": "no_autorizado", "mensaje": "La clave no es válida. …"}}
```

Programa contra `codigo`; `mensaje` es para personas.

| HTTP | `codigo` | Cuándo |
|---|---|---|
| 401 | `no_autorizado` | Falta la cabecera, la clave no existe, está revocada o vencida. Es el mismo mensaje en todos los casos |
| 403 | `plan_sin_api` | La empresa no está en el plan Dominio |
| 403 | `suscripcion_bloqueada` | El acceso de la empresa está suspendido por falta de pago |
| 403 | `ip_no_permitida` | La clave tiene lista de IPs y esta no está. El mensaje dice qué IP vimos |
| 404 | `no_encontrado` | El proceso no existe o no es de tu empresa, o la ruta no existe |
| 405 | `metodo_no_permitido` | Usaste algo distinto de `GET` |
| 422 | `parametro_invalido` | Un parámetro no tiene el formato esperado |
| 422 | `cursor_invalido` | El cursor fue modificado, no es de esta lista o ya no es válido |
| 429 | `limite_minuto` · `limite_dia` · `demasiadas_simultaneas` · `demasiadas_peticiones` · `demasiados_intentos` | Ver [Límites](#límites-y-429) |
| 503 | `ocupado` | El servicio está atendiendo muchas consultas; reintenta tras `Retry-After` |
| 503 | `consulta_lenta` | La consulta pasó su tiempo máximo |
| 500 | `error_interno` | Falla nuestra. Reintenta en unos minutos; si sigue, escríbenos con la hora y la cabecera `X-Request-Id` |

---

## Campos

Convenciones:

- **Fechas con hora**: ISO-8601 con zona de Colombia, `2026-11-20T17:00:00-05:00`.
  **Fechas sin hora**: `AAAA-MM-DD`.
- **Montos**: pesos colombianos en **enteros**, sin decimales ni separadores.
- **NIT**: solo dígitos, **sin** dígito de verificación. Una persona natural aparece
  con su cédula.
- **Textos de SECOP** tal como los publica la fuente (pueden venir en mayúsculas).
- `null` = el dato no existe en la fuente o todavía no se conoce.

| Campo | Qué es |
|---|---|
| `secop_id` | Identificador estable: `CO1.REQ.n` en SECOP II, número de constancia en SECOP I, `paa:…` para lo que tu empresa trajo del Plan Anual de Adquisiciones. **Úsalo como clave**; `referencia` se repite entre entidades |
| `plataforma` | `SECOP II`, `SECOP I` o `PAA` |
| `departamento`, `municipio` | Ubicación de la **entidad** contratante, no del lugar de ejecución |
| `nombre` / `objeto` | Nombre corto del proceso y descripción del objeto |
| `estado` | Estado tal como lo publica SECOP |
| `presupuesto` | Presupuesto oficial |
| `fecha_cierre` | El cierre efectivo: si alguien de tu empresa lo ajustó a mano en la app, ese; si no, el de SECOP (`fecha_cierre_secop`). SECOP I muchas veces no publica cierre |
| `enlace` | Página oficial del proceso. `null` cuando SECOP solo entrega su página de inicio de sesión (procesos aún no públicos) |
| `seguimiento.etapa` | Si tu empresa lo sigue: `reviewing` (Revisando), `participating` (Preparando), `presented` (Enviada), `won` (Ganada), `closed` (En ejecución), `lost` (Perdida). `null` = está en la bandeja sin decidir. Lo descartado y lo archivado no sale |
| `recibido_at` | Cuándo llegó a tu empresa |
| `actualizado_at` | Último cambio del proceso o de tu seguimiento |

---

## Frescura de los datos

ContRadar lee los **datos abiertos** de Colombia Compra Eficiente (datos.gov.co) y el
RSS público de SECOP I. **No es tiempo real** y no podemos prometerlo:

- **SECOP II** llega **alrededor de un día después** de publicarse en el portal:
  datos.gov.co se actualiza una vez al día. Lo revisamos cada 15 minutos para tomarlo
  apenas aparezca.
- **Mínima cuantía de SECOP I** puede llegar en **minutos**, por el RSS de Colombia
  Compra.
- **Documentos**: cada hora. No todos los procesos traen su lista en los datos
  abiertos.
- **Adendas**: se detectan desde los documentos; la lectura de qué cambió puede
  tardar o no ser posible (documentos escaneados).
- **Adjudicaciones, oferentes y ofertas**: a diario, de madrugada. En procesos
  recientes la publicación de ofertas por proponente va atrasada en la fuente.
- La **fecha de cierre** es la última que publicó SECOP; no guardamos el historial de
  cambios de cierre.

---

## Condiciones de uso

- **Uso interno**: los datos se usan dentro de tu organización.
- **Sin redistribución**: no se revenden, no se republican en bloque y no alimentan un
  producto que compita con ContRadar.
- **Almacenamiento**: puedes guardar copia local para tu operación; bórrala al terminar
  el contrato, salvo obligación legal.
- **Fuente**: la información proviene de **SECOP / Colombia Compra Eficiente**; cítala
  como fuente. ContRadar no garantiza su completitud ni su actualidad más allá de lo que
  publica la fuente.
- **Datos personales**: algunos adjudicatarios son personas naturales identificadas con
  cédula (dato público de SECOP). Su tratamiento es responsabilidad de quien los recibe,
  conforme a la Ley 1581 de 2012.
- **Topes y suspensión**: los límites de esta guía aplican por clave. Podemos suspender
  una clave ante un uso abusivo, y avisamos a la empresa.
- **Cuida tu clave**: quien la tenga lee los procesos de tu empresa. Si sospechas que se
  filtró, revócala en Mi empresa › API y crea otra.

---

## Cambios

Versión vigente: **v1**. Las rutas de `/api/integracion/v1` no cambian de forma
incompatible: si un día hace falta, sale una `v2` aparte y avisamos con tiempo.

- **23 de noviembre de 2026 · v1.** Lanzamiento: `/yo`, `/procesos`, la ficha, los
  documentos y las adendas de cada proceso, y `/adjudicaciones`. Solo lectura, en el
  plan Dominio.

