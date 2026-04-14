import { Metadata } from "next";
import { getPageMetadata } from "@/lib/utils/getPageMetadata";
import Image from "next/image";
import PageHero from "@/components/sections/PageHero";
import SectionTitle from "@/components/ui/SectionTitle";
import ScrollReveal from "@/components/ui/ScrollReveal";
import Badge from "@/components/ui/Badge";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import { sanityFetch } from "@/sanity/lib/live";
import { gallerySectionPhotosQuery } from "@/lib/sanity/queries";
import { urlFor } from "@/sanity/lib/image";
import type { SanityGalleryPhoto } from "@/lib/sanity/types";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("a-escola/resultados", {
    title: "Resultados",
    description: "Prêmios, conquistas e reconhecimentos da Sede do Movimento.",
  });
}

const premios = [
  { ano: "2025", titulo: "1° lugar — todos os festivais", desc: "O grupo de competições conquistou o primeiro lugar em todos os festivais que participou em 2025.", destaque: true },
  { ano: "2025", titulo: "Melhor Grupo — Festival de Dança de Caxias", desc: "Reconhecimento como o melhor grupo do festival com apresentação coreográfica de alto nível.", destaque: false },
  { ano: "2024", titulo: "Menção Honrosa — Niterói em Cena", desc: "Reconhecimento no Festival de Teatro Niterói em Cena pelo alto nível técnico e artístico.", destaque: false },
];

export default async function ResultadosPage() {
  const { data: galleryData } = await sanityFetch({
    query: gallerySectionPhotosQuery,
    params: { section: "resultados" },
  });
  const photos = ((galleryData as { photos: SanityGalleryPhoto[] }[] | null) ?? [])
    .flatMap((a) => a.photos ?? [])
    .slice(0, 8);

  return (
    <>
      <PageHero eyebrow="Resultados" title="Excelência artística reconhecida" subtitle="Nosso grupo de competições é um verdadeiro celeiro de talentos." breadcrumbs={[{ label: "A Escola", href: "/a-escola" }, { label: "Resultados" }]} />
      <section className="section-padding bg-white">
        <div className="container-main">
          <SectionTitle eyebrow="Prêmios e conquistas" title="Trajetória de destaque nacional" subtitle="Resultados construídos com dedicação, disciplina e sensibilidade artística." />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {premios.map((p, i) => (
              <ScrollReveal key={i} delay={i * 0.1} className="h-full flex flex-col">
                <div className={`rounded-xl p-6 border h-full flex flex-col ${p.destaque ? "bg-brand-purple-600 border-brand-purple-600 text-white" : "bg-white border-gray-100 shadow-sm"}`}>
                  <Badge color={p.destaque ? "accent" : "primary"} variant={p.destaque ? "solid" : "subtle"} size="sm" className="mb-3">{p.ano}</Badge>
                  <h3 className={`font-bold text-lg mb-2 ${p.destaque ? "text-white" : "text-gray-900"}`}>{p.titulo}</h3>
                  <p className={`text-sm leading-relaxed ${p.destaque ? "text-white/75" : "text-gray-500"}`}>{p.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
          {photos.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {photos.map((photo, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden relative">
                  <Image
                    src={urlFor(photo.img).width(400).height(400).url()}
                    alt={photo.alt ?? `Competição ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden">
                  <PlaceholderImage className="w-full h-full rounded-none border-none" label={`Competição ${i + 1}`} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
