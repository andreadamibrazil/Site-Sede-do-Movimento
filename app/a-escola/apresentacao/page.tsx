import Image from "next/image";
import { Metadata } from "next";
import { getPageMetadata } from "@/lib/utils/getPageMetadata";
import PageHero from "@/components/sections/PageHero";
import ScrollReveal from "@/components/ui/ScrollReveal";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import { sanityFetch } from "@/sanity/lib/live";
import { siteSettingsQuery } from "@/lib/sanity/queries";
import { urlFor } from "@/sanity/lib/image";
import type { SanitySiteSettings } from "@/lib/sanity/types";
import { Heart, Users, GraduationCap } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("a-escola/apresentacao", {
    title: "Por que existimos",
    description: "A missão, visão e valores da Sede do Movimento.",
  });
}

export default async function ApresentacaoPage() {
  const { data } = await sanityFetch({ query: siteSettingsQuery });
  const imagens = (data as SanitySiteSettings | null)?.imagens;

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
            <div className="mb-8">
              <h3 className="font-bold text-gray-900 text-xl mb-6">Nossos três pilares</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {[
                  { label: "Saúde", icon: Heart },
                  { label: "Família", icon: Users },
                  { label: "Educação", icon: GraduationCap },
                ].map(({ label, icon: Icon }) => (
                  <div
                    key={label}
                    className="relative bg-white rounded-2xl border border-gray-100 shadow-brand-md p-8 flex flex-col items-center text-center overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-brand rounded-t-2xl" />
                    <div className="w-20 h-20 rounded-2xl bg-brand-purple-600/10 flex items-center justify-center mb-5">
                      <Icon size={36} className="text-brand-purple-600" strokeWidth={1.5} />
                    </div>
                    <p className="font-extrabold text-gray-900 text-2xl">{label}</p>
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
            {imagens?.apresentacaoFotos && imagens.apresentacaoFotos.length > 0 ? (
              imagens.apresentacaoFotos.slice(0, 4).map((item, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden relative">
                  <Image
                    src={urlFor(item.image).width(400).height(400).url()}
                    alt={item.alt ?? `Foto ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                </div>
              ))
            ) : (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden">
                  <PlaceholderImage className="w-full h-full rounded-none border-none" label={`Foto ${i + 1}`} />
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </>
  );
}
