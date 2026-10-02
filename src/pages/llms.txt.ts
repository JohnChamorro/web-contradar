/* /llms.txt — resumen para asistentes de IA (ChatGPT, Gemini, Perplexity…),
   según la propuesta de llmstxt.org. Se genera en el build desde la fuente
   única (src/data/producto.ts) para que no pueda decir un precio o una cifra
   distinta de la que dice la web. */
import type { APIRoute } from "astro";
import { ENTIDAD, PLANES, PRUEBA, CIFRAS, DESDE, precioMes } from "../data/producto";
import { moneda } from "../lib/formato";
import { GUIAS } from "../data/guias";

const u = (ruta: string) => new URL(ruta, ENTIDAD.url).href;

export const GET: APIRoute = () => {
  const planes = PLANES.map(
    (p) =>
      `- ${p.nombre}: ${moneda(precioMes(p, "anual"))}/mes en plan anual o ${moneda(p.total.mensual)} mes a mes; ` +
      `${p.usuarios} ${p.usuarios === 1 ? "usuario" : "usuarios"}, ` +
      `${p.analisisMes === null ? "análisis sin tope" : `${p.analisisMes} análisis de empresa o contratante al mes`}.`,
  ).join("\n");

  const texto = `# ${ENTIDAD.nombre}

> ${ENTIDAD.descripcionCorta}

${ENTIDAD.nombre} es una app web de licitaciones para empresas que le venden al Estado colombiano. Su enfoque es ayudar a ganar licitaciones, no solo a encontrarlas: antes de ofertar muestra a qué precio se adjudica en cada entidad, quién se suele presentar y en cuántos días paga, con datos abiertos oficiales del SECOP I y SECOP II. La hace ${ENTIDAD.marcaEmpresa}, en ${ENTIDAD.ciudad} (${ENTIDAD.departamento}, Colombia).

Para quién: gerentes comerciales y analistas de licitaciones de empresas de construcción, ingeniería, interventoría, salud, tecnología y suministros que licitan en Colombia.

## Qué hace

- Estadística de cada licitación: precio de adjudicación frente al presupuesto, oferentes habituales y días de pago de la entidad. Cada cifra declara sobre cuántos casos está medida.
- Análisis de competencia: contratos ganados por cada empresa, entidades que le compran, precios y consorcios, en SECOP I y II desde ${DESDE}.
- Búsquedas automáticas con puntaje de relevancia 0–100 y alerta diaria por correo; sondeos de mercado (RFI) y Plan Anual de Adquisiciones (PAA).
- Gestión de licitaciones en equipo y de contratos ganados (hitos, pólizas, actas, liquidación), con capacidad residual (K) para obra pública.

## Datos

Fuente: datos abiertos del SECOP I y SECOP II (Colombia Compra Eficiente). Base: ${CIFRAS.procesos} de procesos y ${CIFRAS.contratos} de contratos desde ${DESDE}, ${CIFRAS.empresas} de empresas perfiladas y ${CIFRAS.entidades} entidades contratantes.

## Precios (COP, sin permanencia)

${planes}

Prueba gratis: ${PRUEBA.dias} días del plan ${PRUEBA.plan} con ${PRUEBA.analisis} análisis, sin tarjeta; la cuenta se crea en el momento.

## Páginas clave

- [Inicio](${u("/")}): qué es ContRadar.
- [Funcionalidades](${u("/funcionalidades/")}): los módulos.
- [Estadística de la licitación](${u("/producto/estadistica-de-la-licitacion/")}): a qué precio se gana una licitación.
- [Análisis de competencia](${u("/producto/analisis-de-competencia/")}): contra quién compites.
- [Búsquedas y alertas](${u("/producto/busquedas/")}): alertas de licitaciones SECOP con puntaje.
- [Precios](${u("/precios/")}): planes y prueba gratis.
- [Diagnóstico gratis por NIT](${ENTIDAD.appUrl}/diagnostico): cómo le va a una empresa en el SECOP.
- [Nosotros](${u("/nosotros/")}): el equipo.

## Guías

- [Licitaciones en Colombia](${u("/licitaciones-colombia/")}): cómo funcionan y cómo ganarlas (página pilar).
${GUIAS.map((g) => `- [${g.titulo}](${u(`/guias/${g.slug}/`)}): ${g.resumen}`).join("\n")}

## Herramientas gratis

- [Calculadora de capacidad residual (K)](${u("/herramientas/calculadora-capacidad-residual/")}): metodología de Colombia Compra Eficiente, en el navegador.

## Contacto

${ENTIDAD.email} · WhatsApp ${ENTIDAD.telefono}
`;
  return new Response(texto, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
