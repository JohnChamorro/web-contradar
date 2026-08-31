/**
 * Versión por CONTENIDO de public/fonts/caras.css.
 *
 * La hoja de caras no lleva hash en el nombre, así que sin esto no se puede
 * cachear a largo plazo: un `immutable` de un año dejaría a los visitantes
 * anclados a la versión vieja si algún día se regenera. Con `?v=<hash>` la URL
 * cambia exactamente cuando cambia el contenido, y solo entonces.
 *
 * Vive en un módulo y no en el frontmatter de Base.astro por una razón
 * concreta: `node:fs` y `node:crypto` importados ahí rompen el análisis del
 * frontmatter («Unterminated string literal»). Ya pasó con las caras en base64
 * y se resolvió igual.
 *
 * Corre en build; nada de esto llega al navegador.
 */
import fs from "node:fs";
import crypto from "node:crypto";

export const VERSION_CARAS: string = crypto
  .createHash("sha256")
  .update(fs.readFileSync(new URL("../../public/fonts/caras.css", import.meta.url)))
  .digest("hex")
  .slice(0, 8);
