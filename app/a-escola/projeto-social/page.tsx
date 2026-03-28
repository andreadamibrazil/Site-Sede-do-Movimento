import { Metadata } from "next";
import { getPageMetadata } from "@/lib/utils/getPageMetadata";
import PageHero from "@/components/sections/PageHero";
import ScrollReveal from "@/components/ui/ScrollReveal";
import Button from "@/components/ui/Button";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import { siteConfig } from "@/lib/constants/siteConfig";
import { ExternalLink } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("a-escola/projeto-social", {
    title: "Projeto Social — Sede de Aprender",
    description: "Projeto social da Sede do Movimento.",
  });
}

export default function ProjetoSocialPage() {
  return (
    <>
      <PageHero eyebrow="Projeto Social" title="Sede de Aprender" subtitle="Arte como ferramenta de transformação social e inclusão." breadcrumbs={[{ label: "A Escola", href: "/a-escola" }, { label: "Projeto Social" }]} />
      <section className="section-padding bg-white">
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
            <ScrollReveal>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-4">@Sede de Aprender</h2>
              <p className="text-gray-500 leading-relaxed mb-4">O projeto social Sede de Aprender é uma iniciativa da Sede do Movimento que leva formação artística gratuita ou subsidiada para jovens em situação de vulnerabilidade social.</p>
              <p className="text-gray-500 leading-relaxed mb-8">Acreditamos que toda criança tem o direito de acessar a arte, de se expressar e de descobrir seu potencial criativo, independentemente de sua condição socioeconômica.</p>
              <div className="flex flex-wrap gap-3">
                <a href={siteConfig.externalLinks.projetoSocial} target="_blank" rel="noopener noreferrer">
                  <Button variant="primary" size="lg" rightIcon={<ExternalLink size={16} />}>Acessar o projeto</Button>
                </a>
                <a href="/contato"><Button variant="ghost" size="lg">Como apoiar</Button></a>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <div className="aspect-[4/3] rounded-2xl overflow-hidden">
                <PlaceholderImage className="w-full h-full rounded-none border-none" label="Projeto Social" />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </>
  );
}
