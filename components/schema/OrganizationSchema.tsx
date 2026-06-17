import { siteConfig } from "@/lib/constants/siteConfig";
import { sanityFetch } from "@/sanity/lib/live";
import { siteSettingsQuery } from "@/lib/sanity/queries";
import type { SanitySiteSettings } from "@/lib/sanity/types";

export default async function OrganizationSchema() {
  const { data } = await sanityFetch({ query: siteSettingsQuery });
  const s = data as SanitySiteSettings | null;

  const schema = {
    "@context": "https://schema.org",
    "@type": ["EducationalOrganization", "LocalBusiness"],
    "@id": `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    alternateName: "Sede do Movimento — Escola de Artes Cênicas",
    description: siteConfig.description,
    url: siteConfig.url,
    logo: {
      "@type": "ImageObject",
      url: `${siteConfig.url}/logo-sede.png`,
      width: 512,
      height: 512,
    },
    image: `${siteConfig.url}/og-image.jpg`,
    telephone: s?.phone ?? siteConfig.phone,
    email: s?.email ?? siteConfig.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: s?.address ?? siteConfig.address.street,
      addressLocality: siteConfig.address.city,
      addressRegion: siteConfig.address.state,
      postalCode: siteConfig.address.zip,
      addressCountry: "BR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: -22.9205,
      longitude: -43.193,
    },
    hasMap: s?.googleMapsLink ?? "https://maps.google.com/?q=Sede+do+Movimento+Rio+Comprido+Rio+de+Janeiro",
    sameAs: [
      s?.instagram ?? siteConfig.social.instagram,
      s?.youtube ?? siteConfig.social.youtube,
      s?.facebook ?? siteConfig.social.facebook,
      s?.tiktok ?? siteConfig.social.tiktok,
    ].filter(Boolean),
    priceRange: "$$",
    currenciesAccepted: "BRL",
    paymentAccepted: "Dinheiro, Cartão de crédito, PIX, Boleto",
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "21:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday"],
        opens: "09:00",
        closes: "17:00",
      },
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Cursos e Modalidades",
      itemListElement: [
        { "@type": "Offer", itemOffered: { "@type": "Course", name: "Ballet Clássico", url: `${siteConfig.url}/ensino/modalidades` } },
        { "@type": "Offer", itemOffered: { "@type": "Course", name: "Jazz", url: `${siteConfig.url}/ensino/modalidades` } },
        { "@type": "Offer", itemOffered: { "@type": "Course", name: "Sapateado", url: `${siteConfig.url}/ensino/modalidades` } },
        { "@type": "Offer", itemOffered: { "@type": "Course", name: "Teatro Musical", url: `${siteConfig.url}/ensino/modalidades` } },
        { "@type": "Offer", itemOffered: { "@type": "Course", name: "Música", url: `${siteConfig.url}/ensino/modalidades` } },
      ],
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      telephone: s?.phone ?? siteConfig.phone,
      email: s?.email ?? siteConfig.email,
      availableLanguage: "Portuguese",
      areaServed: "BR",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
