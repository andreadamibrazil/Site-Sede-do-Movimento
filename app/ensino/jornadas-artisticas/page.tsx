import { Metadata } from "next";
import { getPageMetadata } from "@/lib/utils/getPageMetadata";
import PageHero from "@/components/sections/PageHero";
import ScrollReveal from "@/components/ui/ScrollReveal";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("ensino/jornadas-artisticas", {
    title: "Jornadas Artísticas",
    description: "As 7 jornadas artísticas da Sede do Movimento.",
  });
}

const jornadas = [
  { name: "Jornada do Ballet", ages: "2 a 18+", emoji: "🩰", desc: "Do ballet bebê ao nível avançado, com formação clássica rigorosa e expressiva. Desenvolvimento técnico progressivo, com apresentações regulares e espetáculo anual." },
  { name: "Jornada do Jazz", ages: "5 a 17+", emoji: "🎷", desc: "Jazz americano com trabalho de ritmo, musicalidade e expressão cênica. Formação completa do iniciante ao nível pré-profissional." },
  { name: "Jornada do Sapateado", ages: "5 a 18+", emoji: "👞", desc: "Tap dance com foco em percussão corporal, ritmo e musicalidade. Uma das modalidades mais completas para o desenvolvimento musical através do corpo." },
  { name: "Jornada das Danças Urbanas", ages: "5 a 18+", emoji: "🎤", desc: "Hip hop, street dance, breaking e afins. Cultura urbana, expressão autoral e técnica sólida em um ambiente inclusivo e energético." },
  { name: "Jornada da Dança Contemporânea", ages: "11 a 18+", emoji: "💫", desc: "Pesquisa de movimento, improvisação e criação autoral. Para alunos que querem explorar as fronteiras da expressão artística." },
  { name: "Jornada do Teatro", ages: "4 a 18+", emoji: "🎭", desc: "Presença cênica, interpretação, improvisação, dramaturgia e criação coletiva. Do teatro infantil à formação pré-profissional." },
  { name: "Jornada de Música – Canto", ages: "2 a 18+", emoji: "🎵", desc: "Técnica vocal, musicalização infantil, teoria musical e performance integrada às artes cênicas. Do canto bebê ao nível avançado." },
];

export default function JornadasPage() {
  return (
    <>
      <PageHero eyebrow="Jornadas artísticas" title="7 caminhos de formação" subtitle="Cada aluno é acompanhado ao longo do seu processo artístico, de acordo com seus interesses e objetivos." breadcrumbs={[{ label: "Ensino", href: "/ensino" }, { label: "Jornadas Artísticas" }]} />
      <section className="section-padding bg-white">
        <div className="container-main">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jornadas.map((j, i) => (
              <ScrollReveal key={j.name} delay={i * 0.07}>
                <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-brand-light flex items-center justify-center text-2xl shrink-0">{j.emoji}</div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">{j.name}</h3>
                      <p className="text-brand-purple-600 text-xs font-semibold mb-3">Idades: {j.ages}</p>
                      <p className="text-gray-500 text-sm leading-relaxed">{j.desc}</p>
                    </div>
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
