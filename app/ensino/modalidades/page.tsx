import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Phone } from "lucide-react";
import { getPageMetadata } from "@/lib/utils/getPageMetadata";
import { sanityFetch } from "@/sanity/lib/live";
import { modalidadeImagesQuery } from "@/lib/sanity/queries";
import { urlFor } from "@/sanity/lib/image";
import { siteConfig } from "@/lib/constants/siteConfig";
import { cn } from "@/lib/utils/cn";
import ScrollReveal from "@/components/ui/ScrollReveal";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("ensino/modalidades", {
    title: "Modalidades",
    description:
      "Ballet, jazz, sapateado, dança contemporânea, teatro, canto e mais. Conheça as modalidades da Sede do Movimento e escolha a melhor aula para o seu filho.",
  });
}

// Static gradient fallbacks for cards without Sanity images.
// Full class strings are required for Tailwind's content scanner.
const AREA_CARD_BG: Record<string, string> = {
  "Dança":     "bg-gradient-to-br from-violet-100 to-purple-200",
  "Teatro":    "bg-gradient-to-br from-red-100 to-rose-200",
  "Música":    "bg-gradient-to-br from-indigo-100 to-blue-200",
  "Iniciação": "bg-gradient-to-br from-emerald-100 to-teal-200",
};

const AREA_BADGE: Record<string, string> = {
  "Dança":     "bg-violet-100 text-violet-700",
  "Teatro":    "bg-red-100 text-red-700",
  "Música":    "bg-indigo-100 text-indigo-700",
  "Iniciação": "bg-emerald-100 text-emerald-700",
};

const modalidades = [
  {
    id: "ballet",
    name: "Ballet Clássico",
    area: "Dança",
    tagline: "Técnica, postura e sensibilidade desde os primeiros passos.",
    description:
      "Uma experiência que fortalece disciplina, consciência corporal e expressão artística com cuidado em cada fase.",
    ages: "2 a 18+",
    sanityKey: "Ballet",
  },
  {
    id: "jazz",
    name: "Jazz",
    area: "Dança",
    tagline: "Ritmo, energia e presença para crescer com confiança.",
    description:
      "Uma aula viva e expressiva que estimula musicalidade, coordenação e segurança para se comunicar com o corpo.",
    ages: "5 a 17+",
    sanityKey: "Jazz",
  },
  {
    id: "sapateado",
    name: "Sapateado",
    area: "Dança",
    tagline: "Música no corpo, precisão e personalidade em cena.",
    description:
      "A modalidade desenvolve escuta, ritmo e presença cênica de forma divertida e desafiadora.",
    ages: "5 a 18+",
    sanityKey: "Sapateado",
  },
  {
    id: "dancas-urbanas",
    name: "Danças Urbanas",
    area: "Dança",
    tagline: "Expressão, identidade e cultura urbana.",
    description:
      "Um espaço para desenvolver criatividade, ritmo e autoconfiança através da cultura do movimento urbano.",
    ages: "5 a 18+",
    sanityKey: "Danças Urbanas",
  },
  {
    id: "contemporaneo",
    name: "Dança Contemporânea",
    area: "Dança",
    tagline: "Movimento, pesquisa e expressão sem fronteiras.",
    description:
      "Dança que investiga o corpo, cria linguagem própria e estimula a autoria artística.",
    ages: "11 a 18+",
    sanityKey: "Dança Contemporânea",
  },
  {
    id: "teatro",
    name: "Teatro",
    area: "Teatro",
    tagline: "Imaginação, voz e presença para criar e se expressar.",
    description:
      "Um espaço para desenvolver interpretação, criatividade, comunicação e trabalho em grupo.",
    ages: "4 a 18+",
    sanityKey: "Teatro",
  },
  {
    id: "canto",
    name: "Canto",
    area: "Música",
    tagline: "Técnica vocal e expressão para cantar com mais confiança.",
    description:
      "Aulas que estimulam musicalidade, percepção e presença artística de forma sensível e progressiva.",
    ages: "2 a 18+",
    sanityKey: "Música/Canto",
  },
  {
    id: "violao",
    name: "Violão",
    area: "Música",
    tagline: "Musicalidade, escuta e autonomia através da prática instrumental.",
    description:
      "Uma iniciação acolhedora e consistente para quem quer desenvolver técnica e repertório.",
    ages: "A confirmar",
    sanityKey: "Violão",
  },
  {
    id: "teclado",
    name: "Teclado",
    area: "Música",
    tagline: "Coordenação bimanual, harmonia e leitura musical com o instrumento em mãos.",
    description:
      "Aulas que desenvolvem técnica, percepção melódica e a autonomia de criar e interpretar música ao teclado.",
    ages: "A confirmar",
    sanityKey: "Teclado",
  },
  {
    id: "preparacao",
    name: "Preparação para o Movimento",
    area: "Iniciação",
    tagline: "Um começo sensível e completo para os pequenos — de forma lúdica.",
    description:
      "Ideal para crianças em fase de descoberta, o desenvolvimento se dá de forma lúdica, com estímulos que integram movimento, musicalidade, expressão e desenvolvimento motor.",
    ages: "A confirmar",
    sanityKey: "Preparação",
  },
];

type TurmaImage = { modality: string; image: Record<string, unknown> };

export default async function ModalidadesPage() {
  const { data: turmaImages } = await sanityFetch({ query: modalidadeImagesQuery });

  // Build map: sanityKey → first available image
  const imageByModality = new Map<string, Record<string, unknown>>();
  (turmaImages as TurmaImage[] | null)?.forEach((t) => {
    if (t.modality && t.image && !imageByModality.has(t.modality)) {
      imageByModality.set(t.modality, t.image);
    }
  });

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-dark text-white pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(106,0,255,0.18)_0%,transparent_60%)] pointer-events-none"
        />
        <div className="container-main relative z-10">
          <div className="max-w-2xl">
            <p className="text-brand-pink-500 font-semibold text-sm uppercase tracking-[0.1em] mb-4">
              Nossas modalidades
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-[54px] font-bold leading-[1.1] text-white mb-6">
              Escolha a melhor aula{" "}
              <span className="text-brand-pink-500">para o seu filho</span>
            </h1>
            <p className="text-white/70 text-lg leading-relaxed mb-10 max-w-xl">
              Conheça experiências artísticas pensadas para diferentes idades,
              fases e interesses. Da descoberta do movimento ao aprofundamento
              técnico, cada aula contribui para o desenvolvimento criativo,
              corporal e humano.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href={siteConfig.social.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-7 py-[14px] bg-brand-purple-600 hover:bg-brand-purple-700 text-white font-bold text-base rounded-2xl transition-all duration-200 shadow-[0_2px_12px_rgba(106,0,255,0.35)] hover:shadow-[0_6px_20px_rgba(106,0,255,0.45)] hover:scale-[1.02] hover:-translate-y-px"
              >
                <Phone size={18} aria-hidden="true" />
                Fale com a gente
              </a>
              <a
                href={siteConfig.social.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-7 py-[14px] border-2 border-white/40 hover:border-white/70 text-white font-bold text-base rounded-2xl transition-all duration-200 hover:bg-white/10 hover:scale-[1.02]"
              >
                Agendar aula experimental
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── MODALIDADES GRID ─────────────────────────────────────────── */}
      <section className="section-padding bg-gray-50">
        <div className="container-main">
          <div className="text-center mb-12 md:mb-16">
            <p className="text-brand-purple-600 font-semibold text-sm uppercase tracking-[0.1em] mb-3">
              Para todas as idades e níveis
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Nossas experiências artísticas
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {modalidades.map((mod, i) => {
              const sanityImage = imageByModality.get(mod.sanityKey);
              const imgSrc = sanityImage
                ? urlFor(sanityImage).width(800).height(600).url()
                : null;

              return (
                <ScrollReveal key={mod.id} delay={i * 0.04}>
                  <article className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-brand-md transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
                    {/* Image / Gradient fallback */}
                    <div className="relative aspect-[16/9] overflow-hidden shrink-0">
                      {imgSrc ? (
                        <Image
                          src={imgSrc}
                          alt={`Aula de ${mod.name} na Sede do Movimento`}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div
                          className={cn(
                            "w-full h-full flex items-center justify-center",
                            AREA_CARD_BG[mod.area] ?? "bg-gradient-to-br from-gray-100 to-gray-200"
                          )}
                        >
                          <span
                            aria-hidden="true"
                            className="text-6xl font-black text-white/25 select-none"
                          >
                            {mod.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      {/* Area badge */}
                      <div className="absolute top-4 left-4">
                        <span
                          className={cn(
                            "px-3 py-1 text-xs font-bold uppercase tracking-wide rounded-full",
                            imgSrc
                              ? "bg-white/90 backdrop-blur-sm text-gray-800"
                              : (AREA_BADGE[mod.area] ?? "bg-white/90 text-gray-800")
                          )}
                        >
                          {mod.area}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 md:p-7 flex flex-col flex-1">
                      <h3 className="font-bold text-xl text-gray-900 mb-2">
                        {mod.name}
                      </h3>
                      <p className="text-brand-purple-600 font-semibold text-sm leading-snug mb-3">
                        {mod.tagline}
                      </p>
                      <p className="text-gray-500 text-sm leading-relaxed flex-1 mb-6">
                        {mod.description}
                      </p>

                      {/* Footer: age range + CTAs */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-4 border-t border-gray-100">
                        <div className="sm:flex-1">
                          <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-0.5">
                            Faixa etária
                          </p>
                          <p className="text-sm font-semibold text-gray-800">
                            {mod.ages}
                          </p>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <Link
                            href="/ensino/horarios"
                            className="inline-flex items-center justify-center px-4 py-2 border border-brand-purple-600 text-brand-purple-600 hover:bg-brand-light text-xs font-semibold rounded-xl transition-colors"
                          >
                            Ver horários
                          </Link>
                          <a
                            href={siteConfig.social.whatsapp}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center px-4 py-2 bg-brand-purple-600 hover:bg-brand-purple-700 text-white text-xs font-semibold rounded-xl transition-colors"
                          >
                            Agendar aula
                          </a>
                        </div>
                      </div>
                    </div>
                  </article>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── DECISION SUPPORT ─────────────────────────────────────────── */}
      <section className="section-padding bg-white">
        <div className="container-main">
          <div className="max-w-2xl mx-auto text-center bg-brand-light rounded-3xl px-8 py-14 md:px-14">
            <p className="text-brand-purple-600 font-semibold text-sm uppercase tracking-[0.1em] mb-3">
              Precisa de ajuda?
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Ainda não sabe qual modalidade escolher?
            </h2>
            <p className="text-gray-600 leading-relaxed mb-8 max-w-lg mx-auto">
              Nossa equipe pode te ajudar a encontrar a turma e a experiência
              mais adequada para a idade, o momento e os interesses do aluno.
            </p>
            <a
              href={siteConfig.social.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-8 py-[15px] bg-brand-purple-600 hover:bg-brand-purple-700 text-white font-bold text-base rounded-2xl transition-all duration-200 shadow-[0_2px_12px_rgba(106,0,255,0.3)] hover:shadow-[0_6px_20px_rgba(106,0,255,0.4)] hover:scale-[1.02] hover:-translate-y-px"
            >
              <Phone size={18} aria-hidden="true" />
              Falar no WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
