/* La tarjeta del pliego (Web 2027 v3, handoff/web-2027-v3 §2): qué se ve según su
   avance `p` (0 → 1). La usan el servidor (estado inicial en el HTML) y el
   navegador (la animación), así que las dos cuentas son la misma.

   El avance se reparte en cuartos:
     0 – .25  las hojas pasan y el contador va de 1 a 86
     .25 – .5 se resaltan 4 líneas del pliego y aparecen las 5 filas
     .5 – .75 aparecen los chips, uno a uno
     .75 – 1  la barra sube al 80 % y se llenan 12 de las 15 casillas
   Solo se animan transform y opacity. */

export const PAGINAS = 86;
export const CASILLAS = 15;
export const LLENABLES = 12;
/** Ancho de las líneas de la hoja; la compacta usa las 8 primeras. */
export const LINEAS = ["92%", "70%", "86%", "60%", "90%", "74%", "52%", "84%", "66%", "88%", "58%"];
/** Las líneas que se resaltan (las del requisito que se encontró). */
export const RESALTADAS = [2, 4, 7, 9];

export type Chip = "ok" | "rup" | "falta";
export const FILAS: { k: string; v: string; chip: string; tono: Chip }[] = [
  { k: "Experiencia", v: "2 contratos en vías · 100 % del presupuesto", chip: "Cumples", tono: "ok" },
  { k: "Capacidad K", v: "≥ $2.340 M", chip: "Cumples", tono: "ok" },
  { k: "Liquidez", v: "Índice ≥ 1,5", chip: "Con tu RUP", tono: "rup" },
  { k: "Endeudamiento", v: "≤ 60 %", chip: "Con tu RUP", tono: "rup" },
  { k: "Garantía", v: "10 % por 90 días", chip: "Falta", tono: "falta" },
];

const tramo = (p: number, a: number, b: number) => Math.min(1, Math.max(0, (p - a) / (b - a)));

export interface EstadoPliego {
  /** Giro de la hoja de arriba, en grados (0 = quieta). */
  giro: number;
  pagina: number;
  leyendo: boolean;
  /** Qué líneas van resaltadas. */
  lineas: boolean[];
  /** Por fila: visible y con su chip. */
  filas: { ver: boolean; chip: boolean }[];
  llenas: number;
  /** Escala de la barra de formatos (0 → .8). */
  barra: number;
  formatos: "espera" | "llenando" | "listo";
}

export function estadoPliego(progreso: number): EstadoPliego {
  const p = Math.min(1, Math.max(0, progreso || 0));
  const s1 = tramo(p, 0, 0.25), s2 = tramo(p, 0.25, 0.5), s3 = tramo(p, 0.5, 0.75), s4 = tramo(p, 0.75, 1);
  const vuelta = (s1 * 10) % 1;
  return {
    giro: s1 > 0 && s1 < 1 ? -vuelta * 70 : 0,
    pagina: Math.max(1, Math.round(1 + (PAGINAS - 1) * s1)),
    leyendo: s1 < 1,
    lineas: LINEAS.map((_, i) => { const k = RESALTADAS.indexOf(i); return k >= 0 && s2 > (k + 0.5) / 4; }),
    filas: FILAS.map((_, i) => ({ ver: s2 > i / 5, chip: s3 > (i + 0.5) / 5 })),
    llenas: Math.round(LLENABLES * s4),
    barra: s4 * 0.8,
    formatos: s4 >= 1 ? "listo" : s4 > 0 ? "llenando" : "espera",
  };
}

export const TEXTO_FORMATOS: Record<EstadoPliego["formatos"], string> = {
  espera: "en espera",
  llenando: "llenando…",
  listo: `${CASILLAS - LLENABLES} los llenas tú`,
};

/** Pinta el estado en una tarjeta ya renderizada (navegador). */
export function pintarPliego(el: HTMLElement, progreso: number) {
  const e = estadoPliego(progreso);
  el.dataset.p = String(progreso);
  const hoja = el.querySelector<HTMLElement>(".pc-hoja");
  if (hoja) hoja.style.transform = e.giro ? `perspective(600px) rotateY(${e.giro}deg)` : "";
  const n = el.querySelector(".pc-n");
  if (n) n.textContent = String(e.pagina);
  const leyendo = el.querySelector(".pc-leyendo");
  if (leyendo) leyendo.textContent = e.leyendo ? "leyendo…" : "páginas leídas";
  el.querySelectorAll<HTMLElement>(".pc-linea").forEach((l, i) => l.classList.toggle("on", !!e.lineas[i]));
  el.querySelectorAll<HTMLElement>(".pc-fila").forEach((f, i) => {
    f.classList.toggle("ver", !!e.filas[i]?.ver);
    f.classList.toggle("chip", !!e.filas[i]?.chip);
  });
  const barra = el.querySelector<HTMLElement>(".pc-barra i");
  if (barra) barra.style.transform = `scaleX(${e.barra})`;
  const fn = el.querySelector(".pc-fn");
  if (fn) fn.textContent = String(e.llenas);
  const fe = el.querySelector(".pc-fe");
  if (fe) fe.textContent = TEXTO_FORMATOS[e.formatos];
  el.querySelectorAll<HTMLElement>(".pc-casilla").forEach((c, i) => c.classList.toggle("ok", i < e.llenas));
}
