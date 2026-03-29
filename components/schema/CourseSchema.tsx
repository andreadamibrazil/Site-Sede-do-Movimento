import { siteConfig } from "@/lib/constants/siteConfig";
import type { SanityTurma } from "@/lib/sanity/types";

interface Props {
  turmas: SanityTurma[];
}

export default function CourseSchema({ turmas }: Props) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Turmas e Horários — ${siteConfig.name}`,
    description: "Grade de aulas de dança, teatro e música da Sede do Movimento.",
    itemListElement: turmas.map((turma, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Course",
        name: turma.title,
        description: turma.description ?? `Aulas de ${turma.title}${turma.ageGroup ? ` para ${turma.ageGroup}` : ""}.${turma.schedule ? ` Horário: ${turma.schedule}.` : ""}`,
        provider: {
          "@type": "EducationalOrganization",
          name: siteConfig.name,
          url: siteConfig.url,
        },
        ...(turma.schedule && {
          courseSchedule: {
            "@type": "Schedule",
            scheduleTimezone: "America/Sao_Paulo",
            repeatFrequency: "P1W",
            description: turma.schedule,
          },
        }),
        ...(turma.ageGroup && {
          audience: {
            "@type": "EducationalAudience",
            educationalRole: "student",
            audienceType: turma.ageGroup,
          },
        }),
        inLanguage: "pt-BR",
        availableLanguage: "Portuguese",
        url: `${siteConfig.url}/ensino/horarios`,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
