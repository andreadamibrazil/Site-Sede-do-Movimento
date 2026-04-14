import { Metadata } from "next";
import { getPageMetadata } from "@/lib/utils/getPageMetadata";
import Image from "next/image";
import PageHero from "@/components/sections/PageHero";
import ScrollReveal from "@/components/ui/ScrollReveal";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { sanityFetch } from "@/sanity/lib/live";
import { siteSettingsQuery } from "@/lib/sanity/queries";
import { urlFor } from "@/sanity/lib/image";
import type { SanitySiteSettings } from "@/lib/sanity/types";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("ensino/jornadas-artisticas", {
    title: "Jornadas Artísticas",
    description: "Entenda como funciona a formação artística da Sede do Movimento — do primeiro contato com a arte até o nível avançado, em cada fase da vida do seu filho.",
  });
}

const etapas = [
  {
    num: "01",
    emoji: "🌱",
    title: "Descoberta do Movimento",
    ages: "3 a 6 anos",
    desc: "Os primeiros passos no universo artístico. A criança explora o próprio corpo, desenvolve coordenação e ritmo em um ambiente completamente lúdico. Não existe pressão técnica — só descoberta, alegria e afeto.",
    modalidades: ["Baby Class", "Musicalização Infantil", "Teatro Infantil"],
  },
  {
    num: "02",
    emoji: "✨",
    title: "Iniciação Artística",
    ages: "6 a 9 anos",
    desc: "A criança começa a ter contato com os primeiros fundamentos técnicos de forma suave e progressiva. Foco em atenção, disciplina leve e construção de referências artísticas.",
    modalidades: ["Ballet Infantil", "Jazz Kids", "Sapateado Iniciante", "Teatro"],
  },
  {
    num: "03",
    emoji: "🎨",
    title: "Formação Básica",
    ages: "9 a 12 anos",
    desc: "Desenvolvimento técnico consistente e crescente. O aluno constrói consciência corporal, expressão artística própria e repertório. Fase de consolidação e primeiros desafios cênicos.",
    modalidades: ["Ballet", "Jazz", "Teatro", "Sapateado", "Danças Urbanas"],
  },
  {
    num: "04",
    emoji: "💫",
    title: "Desenvolvimento Artístico",
    ages: "12 a 15 anos",
    desc: "Autonomia, identidade e presença em cena. O aluno já tem vocabulário técnico e começa a explorar sua voz artística. Participação em espetáculos e projetos mais complexos.",
    modalidades: ["Ballet", "Contemporânea", "Jazz", "Teatro", "Canto"],
  },
  {
    num: "05",
    emoji: "🌟",
    title: "Aperfeiçoamento e Avançado",
    ages: "15 anos em diante",
    desc: "Refinamento técnico, performance e preparação para o palco. Para quem quer levar a arte a sério — seja como caminho profissional ou como formação artística completa.",
    modalidades: ["Ballet Avançado", "Contemporânea", "Canto Avançado", "Teatro Pré-profissional"],
  },
];

export default async function JornadasPage() {
  const { data } = await sanityFetch({ query: siteSettingsQuery });
  const imagens = (data as SanitySiteSettings | null)?.imagens;

  return (
    <>
      <PageHero
        eyebrow="Formação artística"
        title="Como seu filho evolui na Sede"
        subtitle="Uma jornada progressiva do primeiro contato com a arte até o nível avançado — organizada por fases, idades e objetivos."
        breadcrumbs={[{ label: "Ensino", href: "/ensino" }, { label: "Jornadas Artísticas" }]}
      />

      <section className="section-padding bg-white">
        <div className="container-main max-w-container-sm">

          {/* Intro */}
          <ScrollReveal>
            <div className="bg-brand-light rounded-2xl p-6 md:p-8 mb-14 text-center">
              <p className="text-gray-700 leading-relaxed">
                Na Sede do Movimento, cada aluno percorre um caminho de desenvolvimento artístico organizado por fases. Independente da modalidade escolhida — dança, teatro ou música — a evolução segue uma progressão clara, respeitando a idade e os objetivos de cada pessoa.
              </p>
            </div>
          </ScrollReveal>

          {/* Timeline */}
          <div className="relative">
            {/* Vertical connecting line */}
            <div
              className="absolute left-5 md:left-7 top-5 bottom-5 w-px bg-gradient-to-b from-brand-purple-600 via-brand-purple-400 to-brand-purple-100"
              aria-hidden
            />

            <div className="space-y-8 md:space-y-10">
              {etapas.map((etapa, i) => (
                <ScrollReveal key={etapa.title} delay={i * 0.08}>
                  <div className="relative pl-16 md:pl-20">
                    {/* Step circle */}
                    <div className="absolute left-0 top-0 w-10 h-10 md:w-14 md:h-14 rounded-full bg-white border-2 border-brand-purple-600 flex flex-col items-center justify-center shadow-brand-md z-10">
                      <span className="text-base md:text-xl leading-none">{etapa.emoji}</span>
                      <span className="text-[8px] md:text-[9px] font-bold text-brand-purple-600 leading-none mt-0.5">{etapa.num}</span>
                    </div>

                    {/* Content card */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-brand-md transition-shadow duration-300 p-6 md:p-8">
                      <div className="flex flex-wrap items-start gap-3 mb-3">
                        <h3 className="font-extrabold text-gray-900 text-xl md:text-2xl leading-tight">{etapa.title}</h3>
                        <span className="shrink-0 text-sm font-bold text-brand-purple-600 bg-brand-purple-600/10 px-4 py-2 rounded-full mt-0.5">
                          {etapa.ages}
                        </span>
                      </div>
                      <p className="text-gray-500 text-sm md:text-base leading-relaxed mb-5">{etapa.desc}</p>
                      <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Modalidades relacionadas</p>
                        <div className="flex flex-wrap gap-2">
                          {etapa.modalidades.map((m) => (
                            <span
                              key={m}
                              className="text-sm text-gray-600 bg-gray-50 border border-gray-200 px-4 py-1.5 rounded-full"
                            >
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>

          {/* Foto da seção */}
          {imagens?.formacaoInfantilFoto && (
            <div className="mt-12 rounded-2xl overflow-hidden aspect-[16/7] relative">
              <Image
                src={urlFor(imagens.formacaoInfantilFoto).width(1200).height(525).url()}
                alt="Formação Infantil — Sede do Movimento"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 80vw"
              />
            </div>
          )}

          {/* Bottom CTA */}
          <ScrollReveal>
            <div className="mt-16 rounded-2xl bg-gradient-dark text-white p-8 md:p-10 text-center">
              <p className="text-white/60 text-sm font-semibold uppercase tracking-widest mb-3">Próximo passo</p>
              <h3 className="font-extrabold text-white text-2xl md:text-3xl mb-3">Pronto para começar a jornada?</h3>
              <p className="text-white/65 mb-8 max-w-md mx-auto leading-relaxed text-sm">
                Veja as modalidades disponíveis, confira os horários e fale com a gente para encontrar a turma certa para o seu filho.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/ensino/modalidades"
                  className="inline-flex items-center justify-center gap-2 bg-white text-brand-purple-600 font-bold px-6 py-3 rounded-xl hover:bg-brand-light transition-colors text-sm"
                >
                  Ver modalidades <ArrowRight size={15} />
                </Link>
                <Link
                  href="/ensino/horarios"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/20 transition-colors text-sm"
                >
                  Ver horários
                </Link>
              </div>
            </div>
          </ScrollReveal>

        </div>
      </section>
    </>
  );
}
