import { Metadata } from "next";
import { getPageMetadata } from "@/lib/utils/getPageMetadata";
import PageHero from "@/components/sections/PageHero";
import SectionTitle from "@/components/ui/SectionTitle";
import ScrollReveal from "@/components/ui/ScrollReveal";
import PlaceholderImage from "@/components/ui/PlaceholderImage";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("ensino/formacao-infantil", {
    title: "Formação Infantil",
    description: "Formação artística para crianças a partir de 2 anos no Rio Comprido. Baby class, ballet infantil, teatro e música com metodologia holística e professores DRT.",
  });
}

export default function FormacaoInfantilPage() {
  return (
    <>
      <PageHero eyebrow="Formação infantil" title="Arte desde o início" subtitle="Formação sensível, criativa e progressiva para crianças a partir de 2 anos." breadcrumbs={[{ label: "Ensino", href: "/ensino" }, { label: "Formação Infantil" }]} />
      <section className="section-padding bg-white">
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-16">
            <ScrollReveal>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-6">Mais que aprender técnicas</h2>
              <p className="text-gray-500 leading-relaxed mb-4">Na Sede do Movimento, a formação infantil acontece dentro do universo das artes cênicas, integrando os núcleos de dança, música e teatro de forma sensível, criativa e progressiva.</p>
              <p className="text-gray-500 leading-relaxed mb-6">A criança é estimulada a explorar o corpo, a escuta e a expressão, desenvolvendo sua identidade artística desde cedo, respeitando seu tempo e suas descobertas.</p>
              <ul className="space-y-3">
                {["Aulas Temáticas, aproximando as famílias do processo", "Vivências e encontros criativos ao longo do ano", "Apresentações em diferentes formatos e espaços", "Espetáculo de final de ano com estrutura profissional"].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-gray-700 text-sm">
                    <div className="w-5 h-5 rounded-full bg-brand-pink-100 flex items-center justify-center shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-brand-pink" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <div className="aspect-[4/3] rounded-2xl overflow-hidden">
                <PlaceholderImage className="w-full h-full rounded-none border-none" label="Formação infantil" />
              </div>
            </ScrollReveal>
          </div>
          <SectionTitle eyebrow="Turmas infantis" title="Faixas etárias" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { faixa: "Berçário Artístico", ages: "2 a 3 anos", desc: "Descoberta do corpo, movimento e imaginação com música e histórias." },
              { faixa: "Infantil I", ages: "4 a 6 anos", desc: "Integração dança, música e teatro. Desenvolvimento motor e emocional." },
              { faixa: "Infantil II", ages: "7 a 9 anos", desc: "Base técnica em dança, introdução à cena e trabalho em grupo." },
              { faixa: "Juvenil", ages: "10 a 12 anos", desc: "Técnica estruturada, consciência corporal e primeiras experiências de palco." },
            ].map((t, i) => (
              <ScrollReveal key={t.faixa} delay={i * 0.08}>
                <div className="bg-white border border-gray-100 rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-all">
                  <div className="text-3xl mb-3">✨</div>
                  <p className="font-bold text-gray-900 mb-1">{t.faixa}</p>
                  <p className="text-brand-purple-600 text-xs font-semibold mb-3">{t.ages}</p>
                  <p className="text-gray-500 text-sm leading-relaxed">{t.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
