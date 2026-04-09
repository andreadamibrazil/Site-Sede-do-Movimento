import { sanityFetch } from "@/sanity/lib/live";
import { urlFor } from "@/sanity/lib/image";
import { heroSlidesQuery } from "@/lib/sanity/queries";
import { type SanityHeroSlide } from "@/lib/sanity/types";
import { heroSlides, type HeroSlide } from "@/lib/constants/slides";
import HeroSlider from "./HeroSlider";

/** Resolve o link final a partir dos campos do Sanity */
function resolveLink(s: SanityHeroSlide): string | undefined {
  switch (s.linkType) {
    case "page":    return s.internalPage ?? undefined;
    case "section": return s.section ?? undefined;     // ex: "#espetaculos"
    case "external": return s.externalUrl ?? undefined;
    default:        return undefined;                  // "none" — não clicável
  }
}

export default async function HeroSliderServer() {
  const { data } = await sanityFetch({ query: heroSlidesQuery });
  const sanitySlides = data as SanityHeroSlide[] | null;

  let slides: HeroSlide[];

  if (sanitySlides && sanitySlides.length > 0) {
    // Slides do Sanity — fonte principal
    slides = sanitySlides.map((s) => ({
      id: s._id,
      image: urlFor(s.image).width(1920).height(880).fit("crop").auto("format").url(),
      link: resolveLink(s),
      alt: s.alt,
      order: s.order,
      enabled: s.active,
    }));
  } else {
    // Fallback: slides estáticos com imagem real em /public/images/slides/
    // Filtra apenas slides com imagem definida para não mostrar bolinhas vazias
    slides = heroSlides.filter((s) => s.enabled && s.image !== "").sort((a, b) => a.order - b.order);
  }

  return <HeroSlider slides={slides} />;
}
