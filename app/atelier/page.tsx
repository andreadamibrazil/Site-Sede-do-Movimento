import { Metadata } from "next";
import { getPageMetadata } from "@/lib/utils/getPageMetadata";
import Link from "next/link";
import { ExternalLink, Scissors, Star, Palette, ShoppingBag, Mail } from "lucide-react";
import PageHero from "@/components/sections/PageHero";
import SectionTitle from "@/components/ui/SectionTitle";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import ScrollReveal from "@/components/ui/ScrollReveal";
import Button from "@/components/ui/Button";
import { siteConfig } from "@/lib/constants/siteConfig";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("atelier", {
    title: "Ateliê — Ateliê Fontinelle",
    description: "O Ateliê Fontinelle é o espaço de criação têxtil e figurinismo da Sede do Movimento, responsável pelos figurinos de todos os espetáculos.",
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
    icon: Star,
    title: "Fantasias e Adereços",
    description:
      "Criação de fantasias temáticas e adereços cênicos exclusivos para apresentações, eventos e produções especiais de qualquer porte.",
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

export default function AtelierPage() {
  return (
    <>
      <PageHero
        eyebrow="Ateliê Fontinelle"
        title="Ateliê"
        subtitle="Figurinos e criação têxtil para as artes cênicas"
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
                Ateliê Fontinelle
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-6">
                Ateliê Fontinelle
              </h2>
              <div className="space-y-4 text-gray-500 leading-relaxed mb-8">
                <p>
                  O Ateliê Fontinelle é o espaço de criação têxtil e figurinismo da Sede do
                  Movimento, responsável pela concepção e confecção dos figurinos de todos os
                  nossos espetáculos.
                </p>
                <p>
                  Com um olhar artístico apurado e técnica refinada, o ateliê transforma conceitos
                  cênicos em peças únicas que contribuem para a narrativa visual de cada produção.
                </p>
                <p>
                  Atendemos também artistas, companhias de dança e teatro que buscam figurinos
                  exclusivos para suas produções.
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
              <div className="aspect-[4/3] rounded-2xl overflow-hidden">
                <PlaceholderImage
                  className="w-full h-full rounded-none border-none"
                  label="Figurinos do Ateliê"
                />
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
