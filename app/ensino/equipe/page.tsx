import { Metadata } from "next";
import PageHero from "@/components/sections/PageHero";
import SectionTitle from "@/components/ui/SectionTitle";
import TeamGrid from "@/components/sections/TeamGrid";
import { teamMembers } from "@/lib/constants/mockData";

export const metadata: Metadata = { title: "Equipe", description: "Conheça a equipe de professores e coordenadores da Sede do Movimento." };

export default function EquipePage() {
  const direcao = teamMembers.filter((m) => m.id === "carlos");
  const professores = teamMembers.filter((m) => m.id !== "carlos");

  return (
    <>
      <PageHero eyebrow="Equipe" title="Especialistas que vivem o que ensinam" subtitle="Nossa equipe é formada por artistas atuantes e educadores com formação superior em suas áreas." breadcrumbs={[{ label: "Ensino", href: "/ensino" }, { label: "Equipe" }]} />
      <section className="section-padding bg-white">
        <div className="container-main">
          <SectionTitle eyebrow="Direção artística" title="Carlos Fontinelle" subtitle="Diretor artístico, coreógrafo e fundador da Sede do Movimento." />
          <TeamGrid members={direcao} className="max-w-xs mx-auto" />
          <div className="mt-20">
            <SectionTitle eyebrow="Corpo docente" title="Nossos professores" subtitle="Especialistas comprometidos com a excelência e a atualização pedagógica contínua." />
            <TeamGrid members={professores} />
          </div>
        </div>
      </section>
    </>
  );
}
