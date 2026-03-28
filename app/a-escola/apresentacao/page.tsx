import { Metadata } from "next";
import { getPageMetadata } from "@/lib/utils/getPageMetadata";
import PageHero from "@/components/sections/PageHero";
import ScrollReveal from "@/components/ui/ScrollReveal";
import PlaceholderImage from "@/components/ui/PlaceholderImage";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("a-escola/apresentacao", {
    title: "Por que existimos",
    description: "A missão, visão e valores da Sede do Movimento.",
  });
}

export default function ApresentacaoPage() {
  return (
    <>
      <PageHero eyebrow="Por que existimos" title="A razão de ser da Sede do Movimento" breadcrumbs={[{ label: "A Escola", href: "/a-escola" }, { label: "Por que existimos" }]} />
      <section className="section-padding bg-white">
        <div className="container-main max-w-container-sm">
          <ScrollReveal>
            <p className="text-xl text-gray-500 leading-relaxed mb-8">
              Quando uma criança entra no universo das artes, ela não aprende apenas dança, teatro ou música. Ela aprende a se expressar, a se reconhecer e a ocupar o mundo com mais coragem.
            </p>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-4">Um espaço que forma além da técnica</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Somos um complexo cultural e incubadora de ações artísticas, onde diferentes linguagens — dança, música, teatro e circo — se conectam para construir uma formação ampla, sensível e contemporânea. Aqui, o movimento vai além do corpo. Ele atravessa o pensamento, a criatividade e a forma de existir no mundo.
            </p>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-4">Arte, educação, sustentabilidade e futuro</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Acreditamos que a arte não é apenas expressão — é também caminho e responsabilidade com o mundo que habitamos. A Sede do Movimento incorpora em suas práticas os princípios dos Objetivos de Desenvolvimento Sustentável (ODS), conectando arte, educação e consciência socioambiental no cotidiano dos alunos.
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              Por isso, integramos à formação artística: desenvolvimento da inteligência emocional, estímulo à autonomia e ao pensamento criativo, introdução à economia criativa e ao mercado artístico, e consciência social, cultural e ambiental.
            </p>
            <div className="bg-brand-light rounded-2xl p-8 mb-8">
              <h3 className="font-bold text-gray-900 text-xl mb-4">Nossos três pilares</h3>
              <div className="grid grid-cols-3 gap-6 text-center">
                {["Saúde", "Família", "Educação"].map((pilar) => (
                  <div key={pilar}>
                    <div className="w-14 h-14 rounded-full bg-white shadow-md flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">✨</span>
                    </div>
                    <p className="font-bold text-gray-900">{pilar}</p>
                  </div>
                ))}
              </div>
            </div>
            <blockquote className="border-l-4 border-brand-purple-600 pl-6 py-2 my-8">
              <p className="text-xl font-semibold text-gray-800 italic leading-relaxed">
                &ldquo;Porque, no final, não é só sobre o que se aprende — é sobre quem você se torna.&rdquo;
              </p>
            </blockquote>
          </ScrollReveal>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-12">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden">
                <PlaceholderImage className="w-full h-full rounded-none border-none" label={`Foto ${i + 1}`} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
