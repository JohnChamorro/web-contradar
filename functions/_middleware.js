/**
 * 301 de www al ápex.
 *
 * Por qué aquí y no en public/_redirects: el archivo _redirects de Cloudflare
 * Pages solo matchea RUTAS, no hosts. Se probó en producción con
 * `https://www.contradar.com.co/*  https://contradar.com.co/:splat  301`:
 * Pages consumió el archivo (deja de servirse, da 404 como recurso) pero
 * ignoró la regla — www siguió respondiendo 200. La sintaxis de origen con URL
 * absoluta es de Netlify, no de Pages. No lo reintentes por ahí.
 *
 * Alternativa sin código: una Redirect Rule en el panel de Cloudflare, que se
 * resuelve en el borde y no gasta una invocación de Function por petición. Si
 * algún día la configuras, borra este archivo.
 *
 * Este middleware vive en la raíz de functions/, así que ve todas las
 * peticiones: las que no son de www salen por context.next() sin tocar nada
 * (estáticos y functions/api/contact.js incluidos).
 */
export const onRequest = async (context) => {
  const url = new URL(context.request.url);

  if (url.hostname.startsWith("www.")) {
    url.hostname = url.hostname.slice(4);
    return Response.redirect(url.toString(), 301);
  }

  return context.next();
};
