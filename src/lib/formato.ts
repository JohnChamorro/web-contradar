/**
 * El ÚNICO sitio donde se decide cómo se escribe una cifra en la web.
 *
 * POR QUÉ EXISTE (31-ago-2026, hallazgo C5 de la auditoría). En la página de
 * precios convivían seis formas de escribir dinero —«$2,5 y $4 millones»,
 * «$152.000», «$50 M», «$1.000 M»— y la calculadora de ROI imprimía
 * `0.220 %`: punto decimal en vez de coma y tres decimales, en una web en
 * español. Con la cifra en mono tabular eso además desalinea las columnas.
 *
 * El sistema visual admite DOS formatos de moneda y solo dos:
 *   exacto     $1.850.000.000   — el precio de un plan, el valor de un proceso
 *   abreviado  $1.850 M         — comparativas, métricas, calculadora
 *
 * Todo pasa por `Intl.NumberFormat('es-CO')`, así que la coma decimal y el
 * punto de millar salen del locale y no de un `replace` a mano.
 */

const CO = (opciones: Intl.NumberFormatOptions = {}) =>
  new Intl.NumberFormat("es-CO", opciones);

/** Un millón de pesos. La abreviatura «M» de la casa son millones, no miles. */
const MILLON = 1_000_000;

/**
 * Dinero en pesos colombianos.
 *
 *   moneda(152000)              → "$152.000"
 *   moneda(1850000000)          → "$1.850.000.000"
 *   moneda(200_000_000, "abreviado") → "$200 M"
 *   moneda(2_500_000, "abreviado")   → "$2,5 M"
 *
 * En abreviado se deja UN decimal como mucho, y solo si aporta: 2,5 lo lleva,
 * 200 no. Sin decimales de relleno, que en mono tabular son ruido.
 */
export function moneda(valor: number, modo: "exacto" | "abreviado" = "exacto"): string {
  if (!Number.isFinite(valor)) return "—";
  if (modo === "exacto") {
    return "$" + CO({ maximumFractionDigits: 0 }).format(Math.round(valor));
  }
  const millones = valor / MILLON;
  const decimales = Math.abs(millones) < 10 && Math.round(millones * 10) % 10 !== 0 ? 1 : 0;
  return (
    "$" +
    CO({ minimumFractionDigits: decimales, maximumFractionDigits: decimales }).format(millones) +
    " M"
  );
}

/**
 * Porcentaje con UN decimal como mucho, coma decimal y sin ceros de relleno.
 * Devuelve solo el número: el signo «%» va aparte en el marcado, para poder
 * darle su propio tamaño.
 *
 *   porcentaje(0.22)  → "0,2"
 *   porcentaje(17)    → "17"
 *   porcentaje(6.05)  → "6,1"
 */
export function porcentaje(valor: number): string {
  if (!Number.isFinite(valor)) return "—";
  // Un valor pequeño pero REAL no puede imprimirse «0»: en la calculadora, un
  // contrato muy grande daba 0,04 % y salía «representa el 0 % del valor»,
  // que es falso y además desactiva el argumento. Se dice que es menor que la
  // resolución que mostramos.
  if (valor !== 0 && Math.abs(valor) < 0.1) return (valor < 0 ? ">-0,1" : "<0,1");
  const decimales = Math.round(valor * 10) % 10 === 0 ? 0 : 1;
  return CO({ minimumFractionDigits: decimales, maximumFractionDigits: decimales }).format(valor);
}
