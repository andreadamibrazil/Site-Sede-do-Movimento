import { Metadata } from "next";
import { getPageMetadata } from "@/lib/utils/getPageMetadata";
import PageHero from "@/components/sections/PageHero";
import SectionTitle from "@/components/ui/SectionTitle";
import EspetaculoCard from "@/components/sections/EspetaculoCard";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { espetaculos } from "@/lib/constants/mockData";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("a-escola/espetaculos", {
    title: "Espetáculos",
    description: "As produções anuais da Sede do Movimento nos grandes teatros do Rio de Janeiro.",
  });
}

export default function EspetaculosPage() {
  return (
    <>
      <PageHero eyebrow="Espetáculos" title="A arte que vai ao palco" subtitle="Produções anuais nos principais teatros do Rio de Janeiro, com alunos de todas as idades." breadcrumbs={[{ label: "A Escola", href: "/a-escola" }, { label: "Espetáculos" }]} />
      <section className="section-padding bg-white">
        <div className="container-main">
          <SectionTitle eyebrow="Nossas produções" title="Do estúdio ao grande palco" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {espetaculos.map((esp, i) => (
              <ScrollReveal key={esp.slug} delay={i * 0.07}>
                <EspetaculoCard espetaculo={esp} featured={i === 0} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
