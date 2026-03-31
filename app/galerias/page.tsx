import type { Metadata } from "next";
import { getPageMetadata } from "@/lib/utils/getPageMetadata";
import Link from "next/link";
import { Camera, Video, Tv, ArrowRight } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("galerias", {
    title: "Galerias",
    description: "Fotos, vídeos e canal YouTube da Sede do Movimento. Registros de espetáculos, ensaios, eventos e bastidores da escola de artes cênicas no Rio de Janeiro.",
  });
}
import PageHero from "@/components/sections/PageHero";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import ScrollReveal from "@/components/ui/ScrollReveal";
import SectionTitle from "@/components/ui/SectionTitle";
import { galleryPhotos } from "@/lib/constants/mockData";

const galleryCards = [
  {
    href: "/galerias/fotos",
    title: "Galeria de Fotos",
    description: "Momentos capturados em espetáculos, ensaios e eventos",
    Icon: Camera,
    label: "Galeria de Fotos",
  },
  {
    href: "/galerias/videos",
    title: "Vídeos",
    description: "Trechos de espetáculos e vídeos institucionais",
    Icon: Video,
    label: "Vídeos",
  },
  {
    href: "/galerias/youtube",
    title: "Canal YouTube",
    description: "Assista ao canal completo da Sede do Movimento",
    Icon: Tv,
    label: "Canal YouTube",
  },
];

const breadcrumbs = [
  { label: "Início", href: "/" },
  { label: "Galerias" },
];

const previewPhotos = galleryPhotos.slice(0, 6);

export default function GaleriasPage() {
  return (
    <>
      <PageHero
        title="Galerias"
        eyebrow="Nosso Acervo Visual"
        subtitle="Fotos e vídeos dos nossos espetáculos, aulas e momentos especiais"
        breadcrumbs={breadcrumbs}
      />

      {/* Gallery hub cards */}
      <section className="section-padding bg-white">
        <div className="container-main">
          <SectionTitle
            eyebrow="Explorar"
            title="Navegue pelo Acervo"
            subtitle="Escolha como deseja explorar o nosso conteúdo visual"
            align="center"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            {galleryCards.map((card, index) => (
              <ScrollReveal key={card.href} delay={index * 0.1}>
                <Link
                  href={card.href}
                  className="group relative flex flex-col overflow-hidden rounded-2xl bg-gray-900 min-h-[340px] card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple-600 focus-visible:ring-offset-2"
                >
                  {/* Background image */}
                  <div className="absolute inset-0">
                    <PlaceholderImage
                      className="w-full h-full rounded-none border-none"
                      label={card.label}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10 group-hover:from-black/90 transition-all duration-300" />
                  </div>

                  {/* Content */}
                  <div className="relative z-10 flex flex-col justify-end h-full p-7">
                    <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mb-4 group-hover:bg-brand-purple-600/80 transition-colors duration-300">
                      <card.Icon size={22} className="text-white" />
                    </div>
                    <h3 className="text-xl font-extrabold text-white mb-2 leading-tight">
                      {card.title}
                    </h3>
                    <p className="text-white/70 text-sm leading-relaxed mb-4">
                      {card.description}
                    </p>
                    <div className="flex items-center gap-1.5 text-brand-pink text-sm font-semibold">
                      <span>Explorar</span>
                      <ArrowRight
                        size={16}
                        className="group-hover:translate-x-1 transition-transform duration-200"
                      />
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Photo preview strip */}
      <section className="section-padding bg-gray-50">
        <div className="container-main">
          <SectionTitle
            eyebrow="Prévia"
            title="Alguns Momentos Especiais"
            subtitle="Uma amostra do nosso acervo fotográfico"
            align="center"
          />

          <ScrollReveal>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {previewPhotos.map((photo, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-xl overflow-hidden bg-gray-100"
                >
                  <PlaceholderImage
                    className="w-full h-full rounded-none border-none"
                    label={photo.alt}
                  />
                </div>
              ))}
            </div>
          </ScrollReveal>

          <div className="flex justify-center mt-10">
            <Link
              href="/galerias/fotos"
              className="inline-flex items-center gap-2 text-brand-purple-600 font-semibold hover:text-brand-purple-700 transition-colors group"
            >
              Ver todas as fotos
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
