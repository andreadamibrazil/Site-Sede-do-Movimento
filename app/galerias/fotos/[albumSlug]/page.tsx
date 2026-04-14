import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PageHero from "@/components/sections/PageHero";
import PhotoGallery from "@/components/sections/PhotoGallery";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { sanityFetch } from "@/sanity/lib/live";
import { galleryAlbumBySlugQuery } from "@/lib/sanity/queries";
import { urlFor } from "@/sanity/lib/image";
import type { SanityGalleryAlbum } from "@/lib/sanity/types";
import type { Photo } from "@/types";

interface PageProps {
  params: Promise<{ albumSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { albumSlug } = await params;
  const { data } = await sanityFetch({ query: galleryAlbumBySlugQuery, params: { slug: albumSlug } });
  const album = data as SanityGalleryAlbum | null;
  const title = album?.title ?? albumSlug;
  return {
    title,
    description: `Registros fotográficos do álbum "${title}" — Sede do Movimento, escola de artes cênicas no Rio de Janeiro.`,
    openGraph: {
      title,
      description: `Registros fotográficos do álbum "${title}" — Sede do Movimento, escola de artes cênicas no Rio de Janeiro.`,
    },
  };
}

export default async function AlbumPage({ params }: PageProps) {
  const { albumSlug } = await params;
  const { data } = await sanityFetch({ query: galleryAlbumBySlugQuery, params: { slug: albumSlug } });
  const album = data as SanityGalleryAlbum | null;

  const breadcrumbs = [
    { label: "Início", href: "/" },
    { label: "Galerias", href: "/galerias" },
    { label: "Fotos", href: "/galerias/fotos" },
    { label: album?.title ?? albumSlug },
  ];

  // 16:9 thumbnails in grid; lightbox shows full image via <img object-contain>
  const photos: Photo[] = (album?.photos ?? []).map((p) => ({
    src: urlFor(p.img).width(1200).height(675).fit("crop").crop("focalpoint").auto("format").url(),
    alt: p.alt ?? "",
    caption: p.caption,
  }));

  return (
    <>
      <PageHero
        title={album?.title ?? albumSlug}
        eyebrow="Galeria de Fotos"
        subtitle={album?.description ?? `Registros fotográficos do álbum "${album?.title ?? albumSlug}"`}
        breadcrumbs={breadcrumbs}
      />

      <section className="section-padding bg-white">
        <div className="container-main">
          <div className="mb-8">
            <Link
              href="/galerias/fotos"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-purple-600 transition-colors font-medium group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
              Voltar para Galeria de Fotos
            </Link>
          </div>

          <ScrollReveal>
            {photos.length > 0 ? (
              <PhotoGallery photos={photos} columns={3} />
            ) : (
              <div className="py-16 text-center text-gray-400">
                <p className="text-lg font-medium">Álbum sendo preparado.</p>
                <p className="text-sm mt-2">Em breve as fotos serão adicionadas aqui.</p>
              </div>
            )}
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
