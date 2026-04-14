import { Metadata } from "next";
import { getPageMetadata } from "@/lib/utils/getPageMetadata";
import Image from "next/image";
import PageHero from "@/components/sections/PageHero";
import ScrollReveal from "@/components/ui/ScrollReveal";
import Button from "@/components/ui/Button";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import { siteConfig } from "@/lib/constants/siteConfig";
import { ExternalLink } from "lucide-react";
import { sanityFetch } from "@/sanity/lib/live";
import { siteSettingsQuery } from "@/lib/sanity/queries";
import { urlFor } from "@/sanity/lib/image";
import type { SanitySiteSettings } from "@/lib/sanity/types";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("a-escola/projeto-social", {
    title: "Projeto Social — Sede de Aprender",
    description: "Sede de Aprender: bolsas em artes cênicas para pessoas em situação de vulnerabilidade no Rio Comprido. Arte como instrumento de transformação social e acesso à cultura.",
  });
}

export default async function ProjetoSocialPage() {
  const { data } = await sanityFetch({ query: siteSettingsQuery });
  const imagens = (data as SanitySiteSettings | null)?.imagens;

  return (
    <>
      <PageHero eyebrow="Projeto Social" title="Sede de Aprender" subtitle="Arte como ferramenta de transformação social e inclusão." breadcrumbs={[{ label: "A Escola", href: "/a-escola" }, { label: "Projeto Social" }]} />
      <section className="section-padding bg-white">
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
            <ScrollReveal>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Sede de Aprender</h2>
              <p className="text-gray-500 leading-relaxed mb-4">O Sede de Aprender é o projeto social da Sede do Movimento que amplia o acesso à formação artística para jovens em situação de vulnerabilidade, por meio de bolsas integrais e programas subsidiados. Mais do que ensinar, o projeto cria caminhos — onde a arte se torna ferramenta de desenvolvimento, pertencimento e transformação social.</p>
              <p className="text-gray-500 leading-relaxed mb-4">Partimos da convicção de que o acesso à arte é um direito. Cada criança e jovem deve ter a oportunidade de experimentar, criar e reconhecer seu próprio potencial, independentemente de sua realidade socioeconômica. Aqui, a formação artística se integra ao desenvolvimento humano, estimulando autonomia, pensamento crítico e novas perspectivas de futuro.</p>
              <p className="text-gray-500 leading-relaxed mb-8">O Sede de Aprender não forma apenas artistas — forma indivíduos conscientes, sensíveis e capazes de transformar o mundo ao seu redor.</p>
              <div className="flex flex-wrap gap-3">
                <a href={siteConfig.externalLinks.projetoSocial} target="_blank" rel="noopener noreferrer">
                  <Button variant="primary" size="lg" rightIcon={<ExternalLink size={16} />}>Acessar o projeto</Button>
                </a>
                <a href="/contato"><Button variant="ghost" size="lg">Como apoiar</Button></a>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <div className="aspect-[4/3] rounded-2xl overflow-hidden relative">
                {imagens?.projetoSocialFoto ? (
                  <Image
                    src={urlFor(imagens.projetoSocialFoto).width(800).height(600).url()}
                    alt="Sede de Aprender — Projeto Social"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                ) : (
                  <PlaceholderImage className="w-full h-full rounded-none border-none" label="Projeto Social" />
                )}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </>
  );
}
