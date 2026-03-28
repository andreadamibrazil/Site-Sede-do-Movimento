import { Metadata } from "next";
import { getPageMetadata } from "@/lib/utils/getPageMetadata";
import PageHero from "@/components/sections/PageHero";
import SectionTitle from "@/components/ui/SectionTitle";
import TeamGrid from "@/components/sections/TeamGrid";
import { sanityFetch } from "@/sanity/lib/live";
import { allProfessorsQuery } from "@/lib/sanity/queries";
import type { SanityProfessor } from "@/lib/sanity/types";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("ensino/equipe", {
    title: "Equipe",
    description: "Conheça a equipe de professores e coordenadores da Sede do Movimento.",
  });
}

export default async function EquipePage() {
  const { data } = await sanityFetch({ query: allProfessorsQuery });
  const professors = (data as SanityProfessor[]) ?? [];

  const direcao = professors.filter((m) => m.isDirector);
  const docentes = professors.filter((m) => !m.isDirector);

  return (
    <>
      <PageHero
        eyebrow="Equipe"
        title="Especialistas que vivem o que ensinam"
        subtitle="Nossa equipe é formada por artistas atuantes e educadores com formação superior em suas áreas."
        breadcrumbs={[{ label: "Ensino", href: "/ensino" }, { label: "Equipe" }]}
      />
      <section className="section-padding bg-white">
        <div className="container-main">
          {direcao.length > 0 && (
            <>
              <SectionTitle
                eyebrow="Direção artística"
                title="Liderança criativa"
                subtitle="A visão artística que guia toda a escola."
              />
              <TeamGrid members={direcao} className="max-w-xs mx-auto" />
            </>
          )}
          {docentes.length > 0 && (
            <div className={direcao.length > 0 ? "mt-20" : ""}>
              <SectionTitle
                eyebrow="Corpo docente"
                title="Nossos professores"
                subtitle="Especialistas comprometidos com a excelência e a atualização pedagógica contínua."
              />
              <TeamGrid members={docentes} />
            </div>
          )}
          {professors.length === 0 && (
            <p className="text-center text-gray-400 py-16">
              Em breve nossa equipe estará disponível aqui.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
