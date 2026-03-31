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
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
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
      longitude: -43.1930,
    },
    sameAs: [
      s?.instagram ?? siteConfig.social.instagram,
      s?.youtube ?? siteConfig.social.youtube,
      s?.facebook ?? siteConfig.social.facebook,
      s?.tiktok ?? siteConfig.social.tiktok,
    ].filter(Boolean),
    hasMap: s?.googleMapsLink ?? siteConfig.social.whatsapp,
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
