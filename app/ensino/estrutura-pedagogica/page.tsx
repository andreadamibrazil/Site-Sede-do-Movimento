import { Metadata } from "next";
import PageHero from "@/components/sections/PageHero";
import SectionTitle from "@/components/ui/SectionTitle";
import ScrollReveal from "@/components/ui/ScrollReveal";

export const metadata: Metadata = { title: "Estrutura Pedagógica", description: "A estrutura pedagógica da Sede do Movimento." };

export default function EstruturaPedagogicaPage() {
  return (
    <>
      <PageHero eyebrow="Estrutura pedagógica" title="Formação completa por nível" breadcrumbs={[{ label: "Ensino", href: "/ensino" }, { label: "Estrutura Pedagógica" }]} />
      <section className="section-padding bg-white">
        <div className="container-main">
          <SectionTitle eyebrow="Níveis de formação" title="Uma jornada progressiva" subtitle="Do primeiro contato com a arte até a formação pré-profissional, cada etapa é pensada para potencializar o desenvolvimento do aluno." />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { nivel: "INFANTIL", ages: "3 a 6 anos", cor: "from-brand-pink to-brand-pink-600", items: ["Descoberta do corpo e imaginação", "Integração com música e teatro", "Desenvolvimento motor e emocional"] },
              { nivel: "INICIAÇÃO", ages: "7 a 10 anos", cor: "from-brand-secondary to-brand-purple-600", items: ["Base técnica em dança", "Introdução à cena", "Musicalidade e ritmo", "Trabalho em grupo"] },
              { nivel: "DESENVOLVIMENTO", ages: "11 a 14 anos", cor: "from-brand-purple-600 to-brand-purple-800", items: ["Técnica estruturada", "Consciência corporal", "Interpretação e criação", "Primeiras experiências de palco"] },
              { nivel: "AVANÇADO", ages: "15+ anos", cor: "from-brand-purple-900 to-brand-purple-950", items: ["Refinamento técnico", "Criação autoral", "Vivência de mercado", "Preparação para carreira"] },
            ].map((n, i) => (
              <ScrollReveal key={n.nivel} delay={i * 0.1}>
                <div className={`rounded-xl text-white bg-gradient-to-br ${n.cor} p-6`}>
                  <p className="text-white/60 text-xs uppercase tracking-wider mb-1">{n.ages}</p>
                  <h3 className="font-extrabold text-xl mb-4">{n.nivel}</h3>
                  <ul className="space-y-2">
                    {n.items.map((item) => <li key={item} className="text-white/80 text-sm flex items-start gap-2"><span className="text-white mt-0.5">•</span>{item}</li>)}
                  </ul>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
