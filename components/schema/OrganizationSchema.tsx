import { siteConfig } from "@/lib/constants/siteConfig";

/**
 * Schema markup para a Sede do Movimento.
 * Tipo: EducationalOrganization + LocalBusiness
 * Informa ao Google e IAs (ChatGPT, Copilot, Gemini) o que é a escola,
 * onde fica, como contatar e quais redes sociais tem.
 *
 * TODO: quando siteSettings do Sanity estiver populado com endereço real,
 * migrar os dados de contato daqui para buscar do Sanity dinamicamente.
 */
export default function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": ["EducationalOrganization", "LocalBusiness"],
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    telephone: siteConfig.phone,
    email: siteConfig.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: siteConfig.address.city,
      addressRegion: siteConfig.address.state,
      postalCode: siteConfig.address.zip,
      streetAddress: siteConfig.address.street,
      addressCountry: "BR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: -22.9205,
      longitude: -43.1930,
    },
    sameAs: [
      siteConfig.social.instagram,
      siteConfig.social.youtube,
      siteConfig.social.facebook,
      siteConfig.social.tiktok,
    ],
    hasMap: siteConfig.social.whatsapp,
    priceRange: "$$",
    currenciesAccepted: "BRL",
    paymentAccepted: "Dinheiro, Cartão de crédito, PIX",
    openingHours: ["Mo-Fr 09:00-21:00", "Sa 09:00-17:00"],
    image: `${siteConfig.url}/og-image.jpg`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
