import { siteConfig } from "@/lib/constants/siteConfig";
import type { SanityEspetaculo } from "@/lib/sanity/types";
import { urlFor } from "@/sanity/lib/image";

interface Props {
  espetaculos: SanityEspetaculo[];
}

export default function EventSchema({ espetaculos }: Props) {
  const schemas = espetaculos.map((esp) => ({
    "@context": "https://schema.org",
    "@type": "Event",
    name: esp.title,
    description: esp.description ?? `Espetáculo anual da Sede do Movimento — ${esp.title}`,
    startDate: `${esp.year}-01-01`,
    endDate: `${esp.year}-12-31`,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    ...(esp.coverImage && { image: urlFor(esp.coverImage).width(1200).height(630).url() }),
    location: {
      "@type": "Place",
      name: esp.venue,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Rio de Janeiro",
        addressRegion: "RJ",
        addressCountry: "BR",
      },
    },
    organizer: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    performer: {
      "@type": "PerformingGroup",
      name: `Alunos da ${siteConfig.name}`,
    },
    url: `${siteConfig.url}/a-escola/espetaculos`,
  }));

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
