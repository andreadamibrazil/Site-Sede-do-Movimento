import type { Metadata } from "next";
import { getPageMetadata } from "@/lib/utils/getPageMetadata";
import Link from "next/link";
import { Tv, ExternalLink } from "lucide-react";
import PageHero from "@/components/sections/PageHero";
import SectionTitle from "@/components/ui/SectionTitle";
import ScrollReveal from "@/components/ui/ScrollReveal";
import Button from "@/components/ui/Button";
import { siteConfig } from "@/lib/constants/siteConfig";
import { sanityFetch } from "@/sanity/lib/live";
import { activeVideosQuery } from "@/lib/sanity/queries";
import type { SanityVideoEmbed } from "@/lib/sanity/types";
import VideosClient from "./VideosClient";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("galerias-videos", {
    title: "Vídeos",
    description: "Assista a trechos de espetáculos, making offs e vídeos institucionais da Sede do Movimento — escola de artes cênicas no Rio Comprido, Rio de Janeiro.",
  });
}

const breadcrumbs = [
  { label: "Início", href: "/" },
  { label: "Galerias", href: "/galerias" },
  { label: "Vídeos" },
];

export default async function VideosPage() {
  const { data } = await sanityFetch({ query: activeVideosQuery });
  const videos = (data as SanityVideoEmbed[] | null) ?? [];

  return (
    <>
      <PageHero
        title="Vídeos"
        eyebrow="Acervo de Vídeos"
        subtitle="Assista aos melhores momentos dos nossos espetáculos"
        breadcrumbs={breadcrumbs}
      />

      <section className="section-padding bg-white">
        <div className="container-main">
          <SectionTitle
            eyebrow="Acervo"
            title="Nossos Vídeos"
            subtitle="Espetáculos, bastidores, aulas e muito mais"
            align="center"
          />

          {videos.length > 0 ? (
            <VideosClient videos={videos} />
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-4xl mb-4">🎬</p>
              <h3 className="font-bold text-gray-900 text-xl mb-2">Em breve</h3>
              <p className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed">
                Os vídeos estão sendo organizados. Adicione conteúdo pelo Sanity Studio.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA — YouTube */}
      <section className="section-padding bg-gradient-dark">
        <div className="container-main">
          <ScrollReveal>
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8 max-w-4xl mx-auto">
              <div className="text-center lg:text-left">
                <div className="flex items-center gap-2 justify-center lg:justify-start mb-3">
                  <Tv size={24} className="text-red-400" />
                  <span className="text-red-400 font-bold text-sm uppercase tracking-widest">YouTube</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
                  Quer assistir mais conteúdo?
                </h2>
                <p className="text-white/65 text-base leading-relaxed max-w-lg">
                  Acesse nosso canal no YouTube para vídeos completos dos espetáculos, aulas gratuitas e bastidores exclusivos.
                </p>
              </div>
              <div className="shrink-0">
                <Link href={siteConfig.social.youtube} target="_blank" rel="noopener noreferrer">
                  <Button variant="cta" size="lg" rightIcon={<ExternalLink size={16} />}>
                    Acessar Canal
                  </Button>
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
