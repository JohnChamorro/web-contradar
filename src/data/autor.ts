/**
 * Autor de las guías (E-E-A-T). Mismos datos que la tarjeta de /nosotros/:
 * las credenciales van textuales, no se completan ni se adornan. Si John
 * agrega trayectoria (contratación pública, publicaciones, LinkedIn
 * personal), se añade aquí y sale en la caja de autor y en el JSON-LD.
 */
export const AUTOR = {
  nombre: "John Euler Chamorro Fuertes",
  nombreCorto: "John Chamorro",
  rol: "Fundador de ContRadar",
  foto: "/equipo/john-chamorro.webp",
  credencial: "Magíster en Automatización",
  trayectoria: "8 años en datos, 7 en desarrollo",
  /** Lo que hace en ContRadar, en una frase. */
  bio: "Diseñó la arquitectura de datos de ContRadar, que procesa el histórico del SECOP I y II para medir a qué precio se adjudica y quién gana en cada entidad.",
  url: "/nosotros/#john-chamorro",
} as const;
