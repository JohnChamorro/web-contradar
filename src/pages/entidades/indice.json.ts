/* Índice compacto para el buscador de /entidades/: nombre, departamento y
   URL de cada entidad con página. Vacío si no hay snapshot. */
import type { APIRoute } from "astro";
import { leerSnapshot, publicable, urlEntidad } from "../../lib/entidades";

export const GET: APIRoute = () => {
  const snap = leerSnapshot();
  const filas = (snap?.entidades ?? [])
    .filter((e) => publicable(e) !== "no")
    .map((e) => ({ n: e.nombre, d: e.departamento, u: urlEntidad(e) }));
  return new Response(JSON.stringify(filas), { headers: { "Content-Type": "application/json" } });
};
