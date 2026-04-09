import Link from "next/link";
import { Tv } from "lucide-react";
import PageHero from "@/components/sections/PageHero";
import SectionTitle from "@/components/ui/SectionTitle";
import Button from "@/components/ui/Button";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { siteConfig } from "@/lib/constants/siteConfig";
import { sanityFetch } from "@/sanity/lib/live";
import { allGalleryAlbumsQuery } from "@/lib/sanity/queries";
import type { SanityGalleryAlbum } from "@/lib/sanity/types";
import FotosPageClient from "./FotosPageClient";

const breadcrumbs = [
  { label: "Início", href: "/" },
  { label: "Galerias", href: "/galerias" },
  { label: "Fotos" },
];

export default async function FotosPage() {
  const { data } = await sanityFetch({ query: allGalleryAlbumsQuery });
  const albums = (data as SanityGalleryAlbum[]) ?? [];

  return (
    <>
      <PageHero
        title="Galeria de Fotos"
        eyebrow="Fotos"
        subtitle="Registros dos nossos espetáculos e momentos especiais"
        breadcrumbs={breadcrumbs}
      />

      <section className="section-padding bg-white">
        <div className="container-main">
          <FotosPageClient albums={albums} />
        </div>
      </section>

      {/* CTA — YouTube */}
      <section className="section-padding bg-gradient-dark">
        <div className="container-main">
          <ScrollReveal>
            <div className="flex flex-col items-center text-center gap-6 max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center">
                <Tv size={28} className="text-red-400" />
              </div>
              <SectionTitle
                eyebrow="YouTube"
                title="Quer ver mais?"
                subtitle="Acesse nosso canal no YouTube para vídeos completos dos espetáculos, bastidores e muito mais."
                dark
                align="center"
                animate={false}
                className="mb-0"
              />
              <Link href={siteConfig.social.youtube} target="_blank" rel="noopener noreferrer">
                <Button variant="cta" size="lg" leftIcon={<Tv size={18} />}>
                  Visitar Canal YouTube
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
