import { Metadata } from "next";
import { getPageMetadata } from "@/lib/utils/getPageMetadata";
import PageHero from "@/components/sections/PageHero";
import TimelineSection from "@/components/sections/TimelineSection";
import SectionTitle from "@/components/ui/SectionTitle";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { timelineEntries } from "@/lib/constants/mockData";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("a-escola/historia-e-estrutura", {
    title: "Nossa História",
    description: "A trajetória da Sede do Movimento e sua estrutura.",
  });
}

export default function HistoriaPage() {
  return (
    <>
      <PageHero eyebrow="Nossa história" title="De uma visão a um complexo cultural" subtitle="Carlos Fontinelle e a criação de um ecossistema completo de arte no Rio de Janeiro." breadcrumbs={[{ label: "A Escola", href: "/a-escola" }, { label: "Nossa história" }]} />
      <section className="section-padding bg-white">
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-20">
            <ScrollReveal>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Carlos Fontinelle</h2>
              <p className="text-gray-500 leading-relaxed mb-4">Idealizada e dirigida por Carlos Fontinelle, a Sede é resultado de uma trajetória sólida no cenário artístico nacional e internacional, que conecta criação, produção e formação.</p>
              <p className="text-gray-500 leading-relaxed mb-4">Diretor de Movimento e Coreógrafo em eventos de grande projeção, como a Copa do Mundo FIFA 2014, além de atuar em importantes produções da TV Globo.</p>
              <p className="text-gray-500 leading-relaxed">É fundador da Cia Vivá, companhia premiada que, desde 2012, circula por diversos palcos do Brasil com uma identidade artística própria, e dirige o MoviRio Festival, reconhecido como um dos maiores festivais de dança da América Latina.</p>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <div className="aspect-[4/5] rounded-2xl overflow-hidden">
                <PlaceholderImage className="w-full h-full rounded-none border-none" label="Carlos Fontinelle" />
              </div>
            </ScrollReveal>
          </div>
          <SectionTitle eyebrow="Nossa trajetória" title="Uma história de transformação" />
          <TimelineSection entries={timelineEntries} />
        </div>
      </section>
      <section className="section-padding bg-gray-50">
        <div className="container-main">
          <SectionTitle eyebrow="Nossa estrutura" title="650m² de arte e criação" subtitle="Um casarão histórico transformado em complexo cultural no coração do Rio Comprido." />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden">
                <PlaceholderImage className="w-full h-full rounded-none border-none" label={`Espaço ${i + 1}`} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
