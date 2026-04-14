import type { Metadata } from "next";
import { getPageMetadata } from "@/lib/utils/getPageMetadata";
import Link from "next/link";
import Image from "next/image";
import { Camera, Video, Tv, ArrowRight } from "lucide-react";
import PageHero from "@/components/sections/PageHero";
import ScrollReveal from "@/components/ui/ScrollReveal";
import SectionTitle from "@/components/ui/SectionTitle";
import { sanityFetch } from "@/sanity/lib/live";
import { allGalleryAlbumsQuery, recentGalleryPhotosQuery, siteSettingsQuery, activeVideosQuery } from "@/lib/sanity/queries";
import { urlFor } from "@/sanity/lib/image";
import type { SanityGalleryAlbum, SanitySiteSettings } from "@/lib/sanity/types";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtube\.com\/embed\/([^?]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/shorts\/([^?]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("galerias", {
    title: "Galerias",
    description: "Fotos, vídeos e canal YouTube da Sede do Movimento. Registros de espetáculos, ensaios, eventos e bastidores da escola de artes cênicas no Rio de Janeiro.",
  });
}

const breadcrumbs = [
  { label: "Início", href: "/" },
  { label: "Galerias" },
];

export default async function GaleriasPage() {
  const [{ data: albumsData }, { data: photosData }, { data: settingsData }, { data: videosData }] = await Promise.all([
    sanityFetch({ query: allGalleryAlbumsQuery }),
    sanityFetch({ query: recentGalleryPhotosQuery }),
    sanityFetch({ query: siteSettingsQuery }),
    sanityFetch({ query: activeVideosQuery }),
  ]);

  const albums = (albumsData as SanityGalleryAlbum[] | null) ?? [];
  const galleryAlbums = (photosData as { photos: { img: SanityImageSource; alt?: string }[] }[] | null) ?? [];
  const previewPhotos = galleryAlbums.flatMap((a) => a.photos ?? []).slice(0, 6);
  const settings = settingsData as SanitySiteSettings | null;
  const videos = (videosData as { youtubeUrl: string }[] | null) ?? [];

  // Hub card backgrounds — Fotos uses first album cover, Vídeos uses YT thumbnail, YouTube uses uploaded cover
  const fotosBg = albums[0]?.coverImage;
  const ytChannelCover = settings?.imagens?.youtubeChannelCover;
  const firstVideoId = videos[0]?.youtubeUrl ? extractYouTubeVideoId(videos[0].youtubeUrl) : null;
  const videosThumbnailUrl = firstVideoId
    ? `https://img.youtube.com/vi/${firstVideoId}/maxresdefault.jpg`
    : null;

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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
            {/* ── Galeria de Fotos ─── */}
            <ScrollReveal delay={0}>
              <Link
                href="/galerias/fotos"
                className="group relative flex flex-col overflow-hidden rounded-2xl bg-gray-900 h-[380px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple-600 focus-visible:ring-offset-2"
              >
                <div className="absolute inset-0">
                  {fotosBg ? (
                    <Image
                      src={urlFor(fotosBg).width(600).height(760).fit("crop").crop("focalpoint").auto("format").url()}
                      alt="Galeria de Fotos"
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-brand" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10 group-hover:from-black/90 transition-all duration-300" />
                </div>
                <div className="relative z-10 flex flex-col justify-between h-full p-6">
                  <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover:bg-brand-purple-600 transition-colors duration-300">
                    <Camera size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">Acervo</p>
                    <h3 className="text-2xl font-extrabold text-white mb-2 leading-tight">Galeria de Fotos</h3>
                    <p className="text-white/65 text-sm leading-relaxed mb-4">
                      {albums.length > 0
                        ? `${albums.length} álbum${albums.length !== 1 ? "s" : ""} — espetáculos, bastidores e eventos`
                        : "Momentos capturados em espetáculos, ensaios e eventos"}
                    </p>
                    <div className="flex items-center gap-1.5 text-brand-pink-500 text-sm font-semibold">
                      <span>Ver fotos</span>
                      <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                  </div>
                </div>
              </Link>
            </ScrollReveal>

            {/* ── Vídeos ─── */}
            <ScrollReveal delay={0.08}>
              <Link
                href="/galerias/videos"
                className="group relative flex flex-col overflow-hidden rounded-2xl bg-gray-900 h-[380px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple-600 focus-visible:ring-offset-2"
              >
                <div className="absolute inset-0">
                  {videosThumbnailUrl ? (
                    <Image
                      src={videosThumbnailUrl}
                      alt="Vídeos"
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-dark" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20 group-hover:from-black/95 transition-all duration-300" />
                </div>
                <div className="relative z-10 flex flex-col justify-between h-full p-6">
                  <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover:bg-brand-purple-600 transition-colors duration-300">
                    <Video size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">Acervo</p>
                    <h3 className="text-2xl font-extrabold text-white mb-2 leading-tight">Vídeos</h3>
                    <p className="text-white/65 text-sm leading-relaxed mb-4">
                      Trechos de espetáculos, aulas e vídeos institucionais da Sede
                    </p>
                    <div className="flex items-center gap-1.5 text-brand-pink-500 text-sm font-semibold">
                      <span>Ver vídeos</span>
                      <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                  </div>
                </div>
              </Link>
            </ScrollReveal>

            {/* ── Canal YouTube ─── */}
            <ScrollReveal delay={0.16}>
              <Link
                href="/galerias/youtube"
                className="group relative flex flex-col overflow-hidden rounded-2xl bg-gray-900 h-[380px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple-600 focus-visible:ring-offset-2"
              >
                <div className="absolute inset-0">
                  {ytChannelCover ? (
                    <Image
                      src={urlFor(ytChannelCover).width(600).height(760).fit("crop").crop("focalpoint").auto("format").url()}
                      alt="Canal YouTube"
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-dark" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-red-950/90 via-black/50 to-black/20 group-hover:from-red-950/95 transition-all duration-300" />
                </div>
                <div className="relative z-10 flex flex-col justify-between h-full p-6">
                  <div className="w-11 h-11 rounded-xl bg-red-600/40 backdrop-blur-sm border border-red-500/30 flex items-center justify-center group-hover:bg-red-600 transition-colors duration-300">
                    <Tv size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-red-400 text-xs font-semibold uppercase tracking-widest mb-1">YouTube</p>
                    <h3 className="text-2xl font-extrabold text-white mb-2 leading-tight">Canal YouTube</h3>
                    <p className="text-white/65 text-sm leading-relaxed mb-4">
                      Vídeos completos dos espetáculos, aulas gratuitas e bastidores exclusivos
                    </p>
                    <div className="flex items-center gap-1.5 text-red-400 text-sm font-semibold">
                      <span>Acessar canal</span>
                      <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                  </div>
                </div>
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Photo preview strip — only rendered when there are Sanity photos */}
      {previewPhotos.length > 0 && (
        <section className="section-padding bg-gray-50">
          <div className="container-main">
            <div className="flex items-end justify-between mb-6 md:mb-8">
              <SectionTitle
                eyebrow="Prévia"
                title="Alguns Momentos Especiais"
                subtitle="Uma amostra do nosso acervo fotográfico"
                align="left"
                className="mb-0"
              />
              <Link
                href="/galerias/fotos"
                className="hidden md:flex items-center gap-1.5 text-brand-purple-600 font-semibold text-sm hover:gap-3 transition-all shrink-0"
              >
                Ver todos os álbuns <ArrowRight size={15} />
              </Link>
            </div>

            <ScrollReveal>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                {previewPhotos.map((photo, i) => (
                  <Link
                    key={i}
                    href="/galerias/fotos"
                    className={`group relative overflow-hidden rounded-xl block bg-gray-200 aspect-square ${
                      i === 0 ? "col-span-2 row-span-2" : ""
                    }`}
                  >
                    <Image
                      src={urlFor(photo.img).width(i === 0 ? 800 : 400).height(i === 0 ? 800 : 400).fit("crop").auto("format").url()}
                      alt={photo.alt ?? `Foto ${i + 1}`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes={i === 0 ? "(max-width: 640px) 100vw, 50vw" : "(max-width: 640px) 50vw, 25vw"}
                    />
                    <div className="absolute inset-0 bg-brand-purple-950/0 group-hover:bg-brand-purple-950/40 transition-all duration-300" />
                  </Link>
                ))}
              </div>
            </ScrollReveal>

            <div className="flex justify-center mt-8 md:hidden">
              <Link
                href="/galerias/fotos"
                className="inline-flex items-center gap-2 text-brand-purple-600 font-semibold hover:text-brand-purple-700 transition-colors group"
              >
                Ver todos os álbuns
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
