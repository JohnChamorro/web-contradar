/**
 * DATOS ORIGINALES DE CONTRADAR PARA LAS GUÍAS (seo/fase-2).
 *
 * Cada entrada es una cifra que solo nosotros podemos publicar porque sale
 * del histórico del SECOP procesado por ContRadar. NINGUNA se inventa: todas
 * nacen en `null` y se llenan cuando John corre la consulta de
 * docs/seo/consultas-fase-2.md en producción y pega el resultado.
 *
 * Mientras `valor` sea null, <DatoContRadar> no pinta nada: la guía se lee
 * completa sin el dato y no queda un hueco.
 *
 * Solo métricas con cobertura validada (lo ADJUDICADO, puertas G2-G5). Nada
 * basado en procesos ofertados mientras G6 no esté verde.
 */
export interface DatoGuia {
  /** La afirmación, con {valor} donde va la cifra. */
  frase: string;
  valor: string | null;
  /** Tamaño de la muestra, ya formateado: «4.812 procesos». */
  muestra: string | null;
  /** Ventana medida: «procesos adjudicados en 2025». */
  periodo: string;
  /** Id de la consulta en docs/seo/consultas-fase-2.md. */
  consulta: string;
  /** Fecha en que se corrió la consulta (AAAA-MM-DD). */
  medido: string | null;
}

/* Cada guía declara sus datos en src/data/datos-guias/<slug>.ts
   (`export default { "<id>": {…} }`) y aquí se juntan en build. Así dos
   guías nunca editan el mismo archivo. */
const modulos = import.meta.glob<{ default: Record<string, DatoGuia> }>("./datos-guias/*.ts", { eager: true });
export const DATOS_GUIAS: Record<string, DatoGuia> = Object.assign(
  {},
  ...Object.values(modulos).map((m) => m.default),
);

export const datoGuia = (id: string): DatoGuia | null => {
  const d = DATOS_GUIAS[id];
  return d && d.valor !== null ? d : null;
};
