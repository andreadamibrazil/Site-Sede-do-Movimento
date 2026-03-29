import { siteConfig } from "@/lib/constants/siteConfig";
import type { Espetaculo } from "@/types";

interface Props {
  espetaculos: Espetaculo[];
}

/**
 * Schema markup para espetáculos da Sede do Movimento.
 * Tipo: ItemList + Event
 * Informa ao Google e IAs datas, locais e descrições dos espetáculos.
 *
 * TODO: quando espetaculos do Sanity estiverem populados,
 * migrar para buscar de allEspetaculosQuery e passar como prop.
 */
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
    ...(esp.bannerSrc && { image: esp.bannerSrc }),
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
