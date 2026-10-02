/**
 * JSON-LD del sitio, construido desde la fuente única (src/data/producto.ts).
 *
 * Los nodos comunes llevan @id estable para que Google los cruce entre
 * páginas: el Article de una guía apunta al mismo Organization y al mismo
 * Person que la portada, en vez de declarar uno nuevo en cada URL.
 */
import { ENTIDAD, PLANES, MESES, type PeriodoId } from "../data/producto";

const SITIO = ENTIDAD.url;
export const ID = {
  organizacion: `${SITIO}/#organizacion`,
  sitio: `${SITIO}/#sitio`,
  app: `${SITIO}/#app`,
  fundador: `${SITIO}/nosotros/#john-chamorro`,
} as const;

/** "/precios/" o URL absoluta → URL absoluta con barra final. */
export const absoluta = (ruta: string) => {
  const u = new URL(ruta, SITIO);
  if (!u.pathname.endsWith("/") && !u.pathname.includes(".")) u.pathname += "/";
  return u.href;
};

const DURACION: Record<PeriodoId, string> = { mensual: "P1M", semestral: "P6M", anual: "P1Y" };

export const fundador = {
  "@type": "Person",
  "@id": ID.fundador,
  name: ENTIDAD.titular,
  jobTitle: "Fundador de ContRadar",
  url: absoluta("/nosotros/"),
  worksFor: { "@id": ID.organizacion },
};

export function esquemasComunes() {
  const organizacion = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ID.organizacion,
    /* La empresa es eulertech; ContRadar es su marca (y el nombre del sitio
       en WebSite). Así el publisher de las guías es eulertech y el autor,
       la persona (revisión post-SEO, 2-oct-2026). */
    name: ENTIDAD.marcaEmpresa,
    brand: { "@type": "Brand", name: ENTIDAD.nombre, logo: ENTIDAD.logo },
    url: `${SITIO}/`,
    logo: { "@type": "ImageObject", url: ENTIDAD.logo, width: 512, height: 512 },
    image: `${SITIO}/og-image.png`,
    description: ENTIDAD.descripcionCorta,
    email: ENTIDAD.email,
    founder: fundador,
    address: {
      "@type": "PostalAddress",
      addressLocality: ENTIDAD.ciudad,
      addressRegion: ENTIDAD.departamento,
      addressCountry: ENTIDAD.pais,
    },
    areaServed: { "@type": "Country", name: "Colombia" },
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: ENTIDAD.email,
        telephone: ENTIDAD.telefono,
        areaServed: "CO",
        availableLanguage: "es",
      },
      {
        "@type": "ContactPoint",
        contactType: "sales",
        email: ENTIDAD.emailVentas,
        telephone: ENTIDAD.telefono,
        areaServed: "CO",
        availableLanguage: "es",
      },
    ],
    /* sameAs: SOLO perfiles que existan y sean nuestros. La app no va aquí
       (no es un perfil de la entidad). */
    sameAs: [...ENTIDAD.redes],
  };

  const sitio = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": ID.sitio,
    name: ENTIDAD.nombre,
    url: `${SITIO}/`,
    inLanguage: "es-CO",
    publisher: { "@id": ID.organizacion },
  };

  /* Un Offer por plan. `price` es el mes a mes; cada periodo va además como
     UnitPriceSpecification con el TOTAL que se cobra y su duración, que es
     como se factura. Antes era un AggregateOffer que mezclaba el mínimo del
     plan anual (152.000) con el máximo del mes a mes (990.000). */
  const app = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": ID.app,
    name: ENTIDAD.nombre,
    description: ENTIDAD.descripcionCorta,
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "Licitaciones y contratación pública",
    operatingSystem: "Web",
    inLanguage: "es-CO",
    url: `${SITIO}/`,
    installUrl: ENTIDAD.appUrl,
    publisher: { "@id": ID.organizacion },
    offers: PLANES.map((p) => ({
      "@type": "Offer",
      name: `Plan ${p.nombre}`,
      price: p.total.mensual,
      priceCurrency: "COP",
      url: absoluta("/precios/"),
      availability: "https://schema.org/InStock",
      priceSpecification: (Object.keys(MESES) as PeriodoId[]).map((periodo) => ({
        "@type": "UnitPriceSpecification",
        name: periodo,
        price: p.total[periodo],
        priceCurrency: "COP",
        billingDuration: DURACION[periodo],
      })),
    })),
    featureList: [
      "Estadística de cada licitación: precio de adjudicación, oferentes y pagos de la entidad",
      "Análisis de competencia y de entidades contratantes con SECOP I y II desde 2012",
      "Búsquedas automáticas con puntaje de relevancia 0–100 y alerta diaria por correo",
      "Sondeos de mercado (RFI) y Plan Anual de Adquisiciones (PAA)",
      "Gestión de licitaciones en equipo por etapas, con responsables",
      "Gestión de contratos: hitos, pólizas, actas y liquidación",
      "Capacidad residual (K) para obra pública",
    ],
  };

  return [organizacion, sitio, app];
}

export function esquemaMigas(migas: { nombre: string; url: string }[]) {
  const todas = [{ nombre: "Inicio", url: "/" }, ...migas];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: todas.map((m, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: m.nombre,
      item: absoluta(m.url),
    })),
  };
}

export function esquemaFaq(faq: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
