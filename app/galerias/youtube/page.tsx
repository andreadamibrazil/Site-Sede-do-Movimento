import type { Metadata } from "next";
import { getPageMetadata } from "@/lib/utils/getPageMetadata";
import Link from "next/link";
import { Tv, Users, ExternalLink, Play } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("galerias-youtube", {
    title: "Canal YouTube",
    description: "Inscreva-se no canal YouTube da Sede do Movimento. Espetáculos completos, bastidores, aulas gratuitas de dança, teatro e música no Rio de Janeiro.",
  });
}
import PageHero from "@/components/sections/PageHero";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import Button from "@/components/ui/Button";
import SectionTitle from "@/components/ui/SectionTitle";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { siteConfig } from "@/lib/constants/siteConfig";

const breadcrumbs = [
  { label: "Início", href: "/" },
  { label: "Galerias", href: "/galerias" },
  { label: "YouTube" },
];

const playlists = [
  {
    title: "Espetáculos Completos",
    description: "Assista na íntegra aos espetáculos anuais da Sede do Movimento, do palco à tela.",
    videoCount: "5 vídeos",
  },
  {
    title: "Bastidores",
    description: "Veja o processo criativo por trás dos nossos espetáculos, ensaios e preparação.",
    videoCount: "8 vídeos",
  },
  {
    title: "Aulas Gratuitas",
    description: "Aulas introdutórias de dança, teatro e música disponíveis gratuitamente para todos.",
    videoCount: "12 vídeos",
  },
  {
    title: "Eventos Especiais",
    description: "Saraus, festivais, formações e encontros especiais registrados em vídeo.",
    videoCount: "6 vídeos",
  },
];

export default function YouTubePage() {
  return (
    <>
      <PageHero
        title="Canal YouTube"
        eyebrow="YouTube"
        subtitle="Conteúdo exclusivo, espetáculos e aulas no nosso canal"
        breadcrumbs={breadcrumbs}
      />

      {/* Main CTA card */}
      <section className="section-padding bg-white">
        <div className="container-main">
          <ScrollReveal>
            <div className="max-w-2xl mx-auto text-center bg-gray-50 rounded-3xl p-10 border border-gray-100 shadow-sm">
              {/* YouTube icon */}
              <div className="w-20 h-20 rounded-2xl bg-red-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-600/30">
                <Tv size={36} className="text-white" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
                Sede do Movimento
              </h2>

              {/* Subscriber count */}
              <div className="flex items-center justify-center gap-2 text-gray-500 text-sm mb-6">
                <Users size={15} />
                <span className="font-semibold text-gray-700">2.5k inscritos</span>
                <span>·</span>
                <span>Canal oficial</span>
              </div>

              <p className="text-gray-500 text-base leading-relaxed mb-8 max-w-md mx-auto">
                Espetáculos completos, aulas gratuitas, bastidores e muito mais. Inscreva-se para não perder nenhum conteúdo novo.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href={siteConfig.social.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="cta"
                    size="lg"
                    leftIcon={<Tv size={18} />}
                    rightIcon={<ExternalLink size={15} />}
                  >
                    Acessar Canal
                  </Button>
                </Link>
                <Link
                  href={siteConfig.social.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="ghost" size="lg">
                    Inscrever-se
                  </Button>
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Playlists grid */}
      <section className="section-padding bg-gray-50">
        <div className="container-main">
          <SectionTitle
            eyebrow="Playlists"
            title="Explore Nossas Playlists"
            subtitle="Conteúdo organizado para você encontrar exatamente o que procura"
            align="center"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {playlists.map((playlist, index) => (
              <ScrollReveal key={index} delay={index * 0.08}>
                <Link
                  href={siteConfig.social.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm card-hover"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-gray-900 overflow-hidden">
                    <PlaceholderImage
                      className="w-full h-full rounded-none border-none opacity-60"
                      label={playlist.title}
                    />
                    {/* Play overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 flex items-center justify-center group-hover:bg-red-600/80 transition-colors duration-300">
                        <Play size={16} className="text-white fill-white ml-0.5" />
                      </div>
                    </div>
                    {/* Video count badge */}
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-semibold px-2 py-0.5 rounded">
                      {playlist.videoCount}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 text-sm mb-1.5 group-hover:text-brand-purple-600 transition-colors leading-snug">
                      {playlist.title}
                    </h3>
                    <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">
                      {playlist.description}
                    </p>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
