import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PageHero from "@/components/sections/PageHero";
import PhotoGallery from "@/components/sections/PhotoGallery";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { galleryPhotos } from "@/lib/constants/mockData";

interface PageProps {
  params: Promise<{ albumSlug: string }>;
}

const knownAlbums: Record<string, string> = {
  "arcanum-2026": "Arcanum — Os Segredos da Humanidade",
  "por-onde-flor-2025": "Por Onde Flor",
  "tempo-vivo-2024": "Tempo Vivo",
  "making-off-2023": "Making Off",
  "auto-pecas-2022": "Auto Peças",
  "bastidores": "Bastidores",
  "eventos": "Eventos",
  "formatura": "Formatura",
};

function formatSlugTitle(slug: string): string {
  if (knownAlbums[slug]) return knownAlbums[slug];
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { albumSlug } = await params;
  const title = formatSlugTitle(albumSlug);
  return {
    title,
    description: `Registros fotográficos do álbum "${title}" — Sede do Movimento, escola de artes cênicas no Rio de Janeiro.`,
    openGraph: {
      title,
      description: `Registros fotográficos do álbum "${title}" — Sede do Movimento, escola de artes cênicas no Rio de Janeiro.`,
    },
  };
}

export async function generateStaticParams() {
  return [
    { albumSlug: "arcanum-2026" },
    { albumSlug: "por-onde-flor-2025" },
    { albumSlug: "tempo-vivo-2024" },
    { albumSlug: "making-off-2023" },
    { albumSlug: "auto-pecas-2022" },
    { albumSlug: "bastidores" },
    { albumSlug: "eventos" },
    { albumSlug: "formatura" },
  ];
}

export default async function AlbumPage({ params }: PageProps) {
  const { albumSlug } = await params;
  const albumTitle = formatSlugTitle(albumSlug);
  const albumPhotos = galleryPhotos.slice(0, 6);

  const breadcrumbs = [
    { label: "Início", href: "/" },
    { label: "Galerias", href: "/galerias" },
    { label: "Fotos", href: "/galerias/fotos" },
    { label: albumTitle },
  ];

  return (
    <>
      <PageHero
        title={albumTitle}
        eyebrow="Galeria de Fotos"
        subtitle={`Registros fotográficos do álbum "${albumTitle}"`}
        breadcrumbs={breadcrumbs}
      />

      <section className="section-padding bg-white">
        <div className="container-main">

          {/* Back link */}
          <div className="mb-8">
            <Link
              href="/galerias/fotos"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-purple-600 transition-colors font-medium group"
            >
              <ArrowLeft
                size={16}
                className="group-hover:-translate-x-0.5 transition-transform"
              />
              Voltar para Galeria de Fotos
            </Link>
          </div>

          <ScrollReveal>
            <PhotoGallery photos={albumPhotos} columns={3} />
          </ScrollReveal>

          {/* Empty state note */}
          <div className="mt-10 text-center text-gray-400 text-sm">
            <p>Este álbum está sendo atualizado. Em breve mais fotos serão adicionadas.</p>
          </div>
        </div>
      </section>
    </>
  );
}
