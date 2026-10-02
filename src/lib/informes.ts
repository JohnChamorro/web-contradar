/**
 * Informes de datos (/informes/<tema>-<año>/), piezas para prensa y enlaces.
 * Cada informe es un JSON en src/data/informes/ armado con resultados REALES
 * de las consultas de docs/seo/consultas-fase-2.md (o del snapshot). Sin
 * archivos no se genera nada: ni el informe ni el hub.
 * Plantilla y reglas: docs/seo/diseno-programatico.md §9.
 */
export interface Informe {
  slug: string;
  titulo: string;
  /** El hallazgo en una frase: va en el lead y en la description. */
  hallazgo: string;
  publicado: string;
  corte: string;
  metodologia: { fuente: string; ventana: string; muestra: string; limpieza: string };
  secciones: {
    titulo: string;
    texto: string;
    /** Toda cifra va en tabla: es la versión accesible y la que se cita. */
    tabla?: { columnas: string[]; filas: (string | number)[][] };
  }[];
}

const mods = import.meta.glob<{ default: Informe }>("../data/informes/*.json", { eager: true });
export const INFORMES: Informe[] = Object.values(mods)
  .map((m) => m.default)
  .sort((a, b) => b.publicado.localeCompare(a.publicado));
