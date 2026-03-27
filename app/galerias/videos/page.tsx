import Link from "next/link";
import { Play, Tv, ExternalLink } from "lucide-react";
import PageHero from "@/components/sections/PageHero";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import SectionTitle from "@/components/ui/SectionTitle";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { siteConfig } from "@/lib/constants/siteConfig";

const breadcrumbs = [
  { label: "Início", href: "/" },
  { label: "Galerias", href: "/galerias" },
  { label: "Vídeos" },
];

const videos = [
  {
    title: "Arcanum — Trailer Oficial",
    category: "Espetáculos",
    duration: "3:42",
    badgeColor: "accent" as const,
  },
  {
    title: "Making Off — Espetáculo 2023",
    category: "Bastidores",
    duration: "8:15",
    badgeColor: "secondary" as const,
  },
  {
    title: "Tempo Vivo — Highlights",
    category: "Espetáculos",
    duration: "5:27",
    badgeColor: "accent" as const,
  },
  {
    title: "Grupo de Competição 2025",
    category: "Resultados",
    duration: "6:03",
    badgeColor: "success" as const,
  },
  {
    title: "Aula Aberta Ballet",
    category: "Aulas",
    duration: "12:50",
    badgeColor: "primary" as const,
  },
  {
    title: "Institucional Sede do Movimento",
    category: "Institucional",
    duration: "4:18",
    badgeColor: "neutral" as const,
  },
];

export default function VideosPage() {
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video, index) => (
              <ScrollReveal key={index} delay={index * 0.07}>
                <div className="group rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                  {/* Thumbnail — 16:9 ratio */}
                  <div className="relative aspect-video bg-gray-900 overflow-hidden">
                    <PlaceholderImage
                      className="w-full h-full rounded-none border-none opacity-70"
                      label={video.title}
                    />
                    {/* Play button overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 flex items-center justify-center group-hover:bg-brand-purple-600/80 group-hover:scale-110 group-hover:border-brand-purple-400 transition-all duration-300">
                        <Play
                          size={22}
                          className="text-white fill-white ml-1"
                        />
                      </div>
                    </div>
                    {/* Duration badge */}
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-semibold px-2 py-0.5 rounded">
                      {video.duration}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <Badge
                      color={video.badgeColor}
                      variant="subtle"
                      size="xs"
                      className="mb-2"
                    >
                      {video.category}
                    </Badge>
                    <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-brand-purple-600 transition-colors">
                      {video.title}
                    </h3>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
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
                  <span className="text-red-400 font-bold text-sm uppercase tracking-widest">
                    YouTube
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
                  Quer assistir mais conteúdo?
                </h2>
                <p className="text-white/65 text-base leading-relaxed max-w-lg">
                  Acesse nosso canal no YouTube para vídeos completos dos espetáculos, aulas gratuitas e bastidores exclusivos.
                </p>
              </div>
              <div className="shrink-0">
                <Link
                  href={siteConfig.social.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="cta"
                    size="lg"
                    rightIcon={<ExternalLink size={16} />}
                  >
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
