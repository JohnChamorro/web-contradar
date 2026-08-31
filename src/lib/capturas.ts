/**
 * Descubrimiento de capturas en tiempo de compilación.
 *
 * POR QUÉ EXISTE. Las capturas de la web las produce John, no el repo, y hasta
 * hoy cada una obligaba a un cambio de código: había que saber el nombre y la
 * extensión exactos, y equivocarse no daba error — daba una imagen rota en
 * producción. Ya pasó con las fotos del equipo, que llegaron como `.JPEG` en
 * mayúscula: en Linux ese es OTRO archivo, y `existsSync("...jpeg")` decía que
 * no había foto sin quejarse de nada.
 *
 * Ahora hay una sola carpeta —`public/capturas/`— y un nombre por pieza. Se lee
 * el directorio y se compara en minúsculas, así que da igual la extensión
 * (webp → png → jpg, en ese orden de preferencia) y da igual la caja.
 *
 * Mientras la captura no exista, cada sección sigue mostrando lo que mostraba:
 * o su respaldo actual, o un marco técnico que dice qué archivo falta. Nunca
 * una imagen rota.
 *
 * Esto corre en el frontmatter de Astro, o sea en build. No llega nada de
 * `node:fs` al navegador.
 */
import fs from "node:fs";

const CARPETA = new URL("../../public/capturas/", import.meta.url);
const ORDEN_EXT = ["webp", "avif", "png", "jpg", "jpeg", "mp4"];

/* EN PRODUCCIÓN se lee UNA vez: el build es un instante y volver a tocar el
   disco por cada slug no aporta nada.

   EN DESARROLLO se relee en cada llamada, y no es un capricho: el módulo queda
   cacheado en el grafo de Vite, así que un archivo nuevo en la carpeta NO
   aparecía hasta reiniciar el servidor. Me costó un rato de creer que la imagen
   no entraba cuando el build sí la tenía. Soltar un archivo y refrescar tiene
   que bastar. */
const leer = (): string[] => (fs.existsSync(CARPETA) ? fs.readdirSync(CARPETA) : []);
const CACHE: string[] = leer();
const archivos = (): string[] => (import.meta.env.DEV ? leer() : CACHE);

/** Ruta pública de la captura `slug`, o `null` si todavía no está. */
export function captura(slug: string): string | null {
  const objetivo = slug.toLowerCase();
  const candidatos = archivos().filter((f) => {
    const punto = f.lastIndexOf(".");
    return punto > 0 && f.slice(0, punto).toLowerCase() === objetivo;
  });
  if (candidatos.length === 0) return null;
  candidatos.sort(
    (a, b) =>
      ORDEN_EXT.indexOf(a.split(".").pop()!.toLowerCase()) -
      ORDEN_EXT.indexOf(b.split(".").pop()!.toLowerCase()),
  );
  return `/capturas/${candidatos[0]}`;
}

/** La captura si está; si no, el respaldo que la sección ya venía usando. */
export function capturaO(slug: string, respaldo: string): string {
  return captura(slug) ?? respaldo;
}
