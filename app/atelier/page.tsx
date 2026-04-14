import { Metadata } from "next";
import { getPageMetadata } from "@/lib/utils/getPageMetadata";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Scissors, Palette, ShoppingBag, Mail } from "lucide-react";
import PageHero from "@/components/sections/PageHero";
import SectionTitle from "@/components/ui/SectionTitle";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import ScrollReveal from "@/components/ui/ScrollReveal";
import Button from "@/components/ui/Button";
import { siteConfig } from "@/lib/constants/siteConfig";
import { sanityFetch } from "@/sanity/lib/live";
import { siteSettingsQuery } from "@/lib/sanity/queries";
import { urlFor } from "@/sanity/lib/image";
import type { SanitySiteSettings } from "@/lib/sanity/types";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("atelier", {
    title: "Ateliê de Moda Sustentável — Carlos Fontinelle",
    description: "O Ateliê Carlos Fontinelle nasce da interseção entre corpo, arte e consciência ambiental, propondo uma moda que ultrapassa tendências para afirmar identidade, liberdade e responsabilidade.",
  });
}

const services = [
  {
    icon: Scissors,
    title: "Figurinos para Espetáculos",
    description:
      "Concepção e confecção de figurinos completos para espetáculos de dança, teatro e ópera, com atenção aos detalhes técnicos e à estética cênica.",
  },
  {
    icon: Palette,
    title: "Customização",
    description:
      "Transformamos peças existentes com intervenções artísticas, bordados, pinturas e aplicações que criam identidade visual única para cada produção.",
  },
  {
    icon: ShoppingBag,
    title: "Encomendas Especiais",
    description:
      "Atendemos encomendas personalizadas para artistas, fotografias artísticas, sessões de moda e projetos criativos que exijam peças únicas.",
  },
];

export default async function AtelierPage() {
  const { data } = await sanityFetch({ query: siteSettingsQuery });
  const imagens = (data as SanitySiteSettings | null)?.imagens;

  return (
    <>
      <PageHero
        eyebrow="Ateliê Carlos Fontinelle"
        title="Ateliê de Moda Sustentável"
        subtitle="Moda que ultrapassa tendências para afirmar identidade, liberdade e responsabilidade."
        breadcrumbs={[
          { label: "Início", href: "/" },
          { label: "Ateliê" },
        ]}
      />

      {/* Split section: left text, right image */}
      <section className="section-padding bg-white">
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: text */}
            <ScrollReveal>
              <p className="text-brand-purple-600 font-bold text-xs uppercase tracking-widest mb-3">
                Ateliê Carlos Fontinelle
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-6">
                Ateliê de Moda Sustentável
              </h2>
              <div className="space-y-4 text-gray-500 leading-relaxed mb-8">
                <p>
                  O Ateliê Carlos Fontinelle nasce da interseção entre corpo, arte e consciência
                  ambiental, propondo uma moda que ultrapassa tendências para afirmar identidade,
                  liberdade e responsabilidade. Com uma trajetória construída a partir da dança e
                  das artes cênicas, o ateliê desenvolve criações que entendem o vestir como
                  extensão do movimento e da expressão individual.
                </p>
                <p>
                  Com foco em práticas sustentáveis, seus projetos priorizam processos de criação
                  que reduzem ou eliminam a geração de resíduos, explorando reaproveitamento de
                  materiais, versatilidade das peças e soluções inteligentes de design. Muitas das
                  criações são pensadas para assumir múltiplas formas e usos, ampliando seu ciclo
                  de vida e estimulando uma relação mais consciente com o consumo.
                </p>
                <p>
                  A estética do ateliê valoriza a diversidade e a singularidade, com propostas
                  muitas vezes sem gênero, que rompem padrões e abrem espaço para novas narrativas
                  visuais. Figurinos para teatro, carnaval, audiovisual e coleções autorais
                  convivem com uma linguagem contemporânea que conecta arte, sociedade e cotidiano.
                </p>
                <p>
                  Mais do que moda, o Ateliê Carlos Fontinelle propõe uma experiência: vestir-se
                  como ato de criação, consciência e pertencimento — onde cada peça carrega não
                  apenas forma, mas significado.
                </p>
              </div>
              <Link href={siteConfig.externalLinks.atelier} target="_blank" rel="noopener noreferrer">
                <Button
                  variant="primary"
                  size="lg"
                  rightIcon={<ExternalLink size={16} />}
                >
                  Visitar o Ateliê
                </Button>
              </Link>
            </ScrollReveal>

            {/* Right: image */}
            <ScrollReveal delay={0.15}>
              <div className="aspect-[4/3] rounded-2xl overflow-hidden relative">
                {imagens?.atelierFigurinosFoto ? (
                  <Image
                    src={urlFor(imagens.atelierFigurinosFoto).width(800).height(600).url()}
                    alt="Ateliê Carlos Fontinelle"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                ) : (
                  <PlaceholderImage className="w-full h-full rounded-none border-none" label="Ateliê Carlos Fontinelle" />
                )}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Services grid */}
      <section className="section-padding bg-gray-50">
        <div className="container-main">
          <SectionTitle
            eyebrow="Serviços"
            title="O que criamos"
            subtitle="Arte têxtil a serviço da expressão cênica — cada peça conta uma história."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {services.map(({ icon: Icon, title, description }, i) => (
              <ScrollReveal key={title} delay={i * 0.08}>
                <div className="card-hover bg-white border border-gray-100 rounded-2xl p-6 flex flex-col items-start h-full">
                  <div className="w-11 h-11 rounded-xl bg-brand-light flex items-center justify-center mb-4">
                    <Icon size={20} className="text-brand-purple-600" />
                  </div>
                  <h3 className="font-extrabold text-gray-900 text-base mb-2">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="section-padding bg-gradient-to-br from-brand-purple-700 via-brand-purple-600 to-brand-secondary">
        <div className="container-main text-center max-w-2xl mx-auto">
          <ScrollReveal>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-4">
              Precisa de figurinos?
            </h2>
            <p className="text-white/70 text-lg leading-relaxed mb-8">
              Entre em contato com o nosso ateliê e descubra como podemos dar vida à sua visão
              artística com peças exclusivas e de alto padrão.
            </p>
            <a href={`mailto:${siteConfig.email}`}>
              <Button variant="outline" size="lg" leftIcon={<Mail size={18} />}>
                Enviar e-mail para o Ateliê
              </Button>
            </a>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
