import { Metadata } from "next";
import { getPageMetadata } from "@/lib/utils/getPageMetadata";
import PageHero from "@/components/sections/PageHero";
import SectionTitle from "@/components/ui/SectionTitle";
import ScrollReveal from "@/components/ui/ScrollReveal";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("ensino/modalidades", {
    title: "Modalidades",
    description: "Aulas de dança, teatro e música na Sede do Movimento.",
  });
}

const modalidades = [
  { name: "Ballet Clássico", area: "Dança", desc: "Formação clássica rigorosa, com foco em postura, técnica e expressão. Turmas do nível infantil ao avançado.", emoji: "🩰", ages: "2 a 18+" },
  { name: "Jazz", area: "Dança", desc: "Técnica americana de jazz dance com trabalho de ritmo, expressão cênica e musicalidade.", emoji: "🎷", ages: "5 a 17+" },
  { name: "Sapateado", area: "Dança", desc: "Tap dance americano com foco em percussão corporal, ritmo e apresentação.", emoji: "👞", ages: "5 a 18+" },
  { name: "Danças Urbanas", area: "Dança", desc: "Hip hop, street dance e breaking. Cultura urbana e expressão autoral.", emoji: "🎤", ages: "5 a 18+" },
  { name: "Contemporâneo", area: "Dança", desc: "Dança contemporânea com pesquisa de movimento, improviso e criação autoral.", emoji: "💫", ages: "11 a 18+" },
  { name: "Teatro", area: "Teatro", desc: "Presença cênica, interpretação, improvisação, dramaturgia e criação coletiva.", emoji: "🎭", ages: "4 a 18+" },
  { name: "Canto", area: "Música", desc: "Técnica vocal, musicalização, teoria musical e performance integrada às artes cênicas.", emoji: "🎵", ages: "2 a 18+" },
];

export default function ModalidadesPage() {
  return (
    <>
      <PageHero eyebrow="Modalidades" title="Dança, Teatro e Música" subtitle="Aulas para todas as idades e níveis, com professores especializados e formação técnica completa." breadcrumbs={[{ label: "Ensino", href: "/ensino" }, { label: "Modalidades" }]} />
      <section className="section-padding bg-white">
        <div className="container-main">
          <SectionTitle eyebrow="Nossas aulas" title="Escolha sua jornada" />
          <div className="space-y-6">
            {modalidades.map((mod, i) => (
              <ScrollReveal key={mod.name} delay={i * 0.06}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-brand-light flex items-center justify-center text-2xl shrink-0">{mod.emoji}</div>
                    <div>
                      <p className="font-bold text-gray-900">{mod.name}</p>
                      <span className="text-brand-purple-600 text-xs font-semibold uppercase tracking-wide">{mod.area}</span>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-gray-500 text-sm leading-relaxed">{mod.desc}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 mb-2">Idades</p>
                    <p className="font-semibold text-gray-900 text-sm">{mod.ages}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
