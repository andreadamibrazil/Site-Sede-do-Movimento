import { siteConfig } from "@/lib/constants/siteConfig";

interface Course {
  modalidade: string;
  dia: string;
  hora: string;
  nivel: string;
  vagas?: string;
}

interface Props {
  courses: Course[];
}

/**
 * Schema markup para turmas/cursos.
 * Tipo: ItemList + Course
 * Permite que o Google e IAs entendam quais modalidades e horários a escola oferece.
 *
 * TODO: quando a página de horários for migrada para buscar turmas do Sanity,
 * passar os dados do Sanity como prop aqui em vez do array hardcoded.
 */
export default function CourseSchema({ courses }: Props) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Turmas e Horários — ${siteConfig.name}`,
    description: "Grade de aulas de dança, teatro e música da Sede do Movimento.",
    itemListElement: courses.map((course, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Course",
        name: `${course.modalidade} — ${course.nivel}`,
        description: `Aulas de ${course.modalidade} para ${course.nivel}. Horário: ${course.dia}, ${course.hora}.`,
        provider: {
          "@type": "EducationalOrganization",
          name: siteConfig.name,
          url: siteConfig.url,
        },
        courseSchedule: {
          "@type": "Schedule",
          byDay: course.dia,
          startTime: course.hora.split("–")[0]?.trim(),
          endTime: course.hora.split("–")[1]?.trim(),
        },
        audience: {
          "@type": "EducationalAudience",
          educationalRole: "student",
          audienceType: course.nivel,
        },
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
