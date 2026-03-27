"use client";

import { useState } from "react";
import Link from "next/link";
import { Tv } from "lucide-react";
import PageHero from "@/components/sections/PageHero";
import PhotoGallery from "@/components/sections/PhotoGallery";
import SectionTitle from "@/components/ui/SectionTitle";
import Button from "@/components/ui/Button";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { galleryPhotos } from "@/lib/constants/mockData";
import { siteConfig } from "@/lib/constants/siteConfig";
import { cn } from "@/lib/utils/cn";

const breadcrumbs = [
  { label: "Início", href: "/" },
  { label: "Galerias", href: "/galerias" },
  { label: "Fotos" },
];

const filterTabs = ["Todos", "Espetáculos", "Bastidores", "Eventos", "Formatura"];

export default function FotosPage() {
  const [activeFilter, setActiveFilter] = useState("Todos");

  // For demo, all filters show the same galleryPhotos since we don't have categorized data
  const filteredPhotos = galleryPhotos;

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

          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2 mb-10 justify-center">
            {filterTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 border",
                  activeFilter === tab
                    ? "bg-brand-purple-600 text-white border-brand-purple-600 shadow-brand-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:border-brand-purple-600 hover:text-brand-purple-600"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Photo Gallery */}
          <ScrollReveal>
            <PhotoGallery photos={filteredPhotos} columns={4} />
          </ScrollReveal>
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
