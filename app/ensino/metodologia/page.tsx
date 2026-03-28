import { Metadata } from "next";
import { getPageMetadata } from "@/lib/utils/getPageMetadata";
import PageHero from "@/components/sections/PageHero";
import SectionTitle from "@/components/ui/SectionTitle";
import ScrollReveal from "@/components/ui/ScrollReveal";
import Accordion from "@/components/ui/Accordion";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("ensino/metodologia", {
    title: "Metodologia",
    description: "O Método Movimento Integrado da Sede do Movimento.",
  });
}

const faq = [
  { id: "q1", question: "O que é o Método Movimento Integrado?", answer: "É um sistema formativo único em artes cênicas que integra dança, teatro e música, aliado ao desenvolvimento da inteligência emocional, pensamento criativo e visão de futuro. Um método brasileiro contemporâneo que conecta arte, educação e sustentabilidade." },
  { id: "q2", question: "A partir de que idade posso começar?", answer: "Temos turmas a partir de 2 anos de idade, na formação infantil (berçário artístico) até adultos sem limite de idade. Cada turma é desenvolvida de acordo com as necessidades específicas de cada faixa etária." },
  { id: "q3", question: "Qual é a frequência das aulas?", answer: "A frequência varia por modalidade e jornada. Em geral, as turmas têm entre 1 e 3 aulas semanais. A dedicação regular é fundamental para o desenvolvimento artístico consistente." },
  { id: "q4", question: "Meu filho precisa ter experiência prévia?", answer: "Não. Aceitamos alunos de todos os níveis, do iniciante ao avançado. A avaliação de nível é feita no momento da matrícula para encaminhar o aluno para a turma mais adequada." },
];

export default function MetodologiaPage() {
  return (
    <>
      <PageHero eyebrow="Metodologia" title="Método Movimento Integrado" subtitle="Corpo • Emoção • Criação • Mundo" breadcrumbs={[{ label: "Ensino", href: "/ensino" }, { label: "Metodologia" }]} />
      <section className="section-padding bg-white">
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">
            <ScrollReveal>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-6">Um método único</h2>
              <p className="text-gray-500 leading-relaxed mb-4">Desenvolvemos um sistema formativo que vai além da técnica. Nosso método integra quatro dimensões do desenvolvimento humano, formando não apenas bailarinos e atores, mas cidadãos conscientes, criativos e preparados para o mundo.</p>
              <p className="text-gray-500 leading-relaxed">Baseado nos princípios dos Objetivos de Desenvolvimento Sustentável (ODS), nossa metodologia conecta arte, educação e responsabilidade socioambiental.</p>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { num: "1", title: "Corpo", items: ["Técnica em dança", "Consciência corporal", "Prevenção de lesões"], color: "from-brand-purple-600 to-brand-secondary" },
                  { num: "2", title: "Expressão", items: ["Teatro e cena", "Musicalidade", "Improvisação"], color: "from-brand-pink-600 to-brand-pink" },
                  { num: "3", title: "Consciência", items: ["Inteligência emocional", "Trabalho coletivo", "Identidade artística"], color: "from-brand-secondary to-brand-purple-400" },
                  { num: "4", title: "Projeção", items: ["Economia criativa", "Mercado artístico", "Autonomia profissional"], color: "from-brand-pink to-brand-secondary" },
                ].map((p) => (
                  <div key={p.num} className={`rounded-xl p-5 text-white bg-gradient-to-br ${p.color}`}>
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm mb-3">{p.num}</div>
                    <p className="font-bold text-lg mb-3">{p.title}</p>
                    <ul className="space-y-1">
                      {p.items.map((item) => <li key={item} className="text-white/80 text-xs">• {item}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
          <SectionTitle eyebrow="Dúvidas frequentes" title="Perguntas sobre nossa metodologia" />
          <div className="max-w-2xl mx-auto">
            <Accordion items={faq} />
          </div>
        </div>
      </section>
    </>
  );
}
