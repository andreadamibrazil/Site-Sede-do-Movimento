import { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Mic2, Building2, Music, MessageCircle } from "lucide-react";
import { Theater } from "lucide-react";
import PageHero from "@/components/sections/PageHero";
import SectionTitle from "@/components/ui/SectionTitle";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import ScrollReveal from "@/components/ui/ScrollReveal";
import Button from "@/components/ui/Button";
import { siteConfig } from "@/lib/constants/siteConfig";

export const metadata: Metadata = {
  title: "Produtora — Fontinelle Criações",
  description:
    "A Fontinelle Criações é a produtora cultural responsável pela concepção e realização dos grandes espetáculos da Sede do Movimento.",
};

const services = [
  {
    icon: Theater,
    title: "Produção de Espetáculos",
    description:
      "Da concepção à estreia: gerenciamos todo o processo produtivo de espetáculos teatrais e de dança, garantindo excelência em cada etapa.",
  },
  {
    icon: Mic2,
    title: "Direção Artística",
    description:
      "Orientação e supervisão criativa para que cada produção tenha identidade visual, narrativa e artística coesa e impactante.",
  },
  {
    icon: Building2,
    title: "Eventos Corporativos",
    description:
      "Criação e execução de performances e experiências artísticas customizadas para o ambiente corporativo, com alto padrão de produção.",
  },
  {
    icon: Music,
    title: "Festivais",
    description:
      "Organização e curadoria de festivais culturais que reúnem artistas, companhias e público em torno da arte e do movimento.",
  },
];

export default function ProdutoraPage() {
  return (
    <>
      <PageHero
        eyebrow="Fontinelle Criações"
        title="Produtora"
        subtitle="Produção cultural e criativa para eventos e espetáculos"
        breadcrumbs={[
          { label: "Início", href: "/" },
          { label: "Produtora" },
        ]}
      />

      {/* Split section: image left, text right */}
      <section className="section-padding bg-white">
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <ScrollReveal>
              <div className="aspect-[4/3] rounded-2xl overflow-hidden">
                <PlaceholderImage
                  className="w-full h-full rounded-none border-none"
                  label="Fontinelle Criações em produção"
                />
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.15}>
              <p className="text-brand-purple-600 font-bold text-xs uppercase tracking-widest mb-3">
                Fontinelle Criações
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-6">
                Fontinelle Criações
              </h2>
              <div className="space-y-4 text-gray-500 leading-relaxed mb-8">
                <p>
                  A Fontinelle Criações é a produtora cultural responsável pela concepção e
                  realização dos grandes espetáculos da Sede do Movimento.
                </p>
                <p>
                  Com experiência em produções de grande porte — incluindo eventos corporativos,
                  espetáculos teatrais e festivais — a produtora oferece serviços completos de
                  produção artística.
                </p>
                <p>
                  Do conceito à execução, cuidamos de cada detalhe para que cada produção seja
                  uma experiência memorável.
                </p>
              </div>
              <Link href={siteConfig.externalLinks.produtora} target="_blank" rel="noopener noreferrer">
                <Button
                  variant="primary"
                  size="lg"
                  rightIcon={<ExternalLink size={16} />}
                >
                  Visitar site da Produtora
                </Button>
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Services grid */}
      <section className="section-padding bg-gray-50">
        <div className="container-main">
          <SectionTitle
            eyebrow="Serviços"
            title="O que produzimos"
            subtitle="Soluções criativas completas para quem acredita no poder transformador da arte."
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
              Tem um projeto em mente?
            </h2>
            <p className="text-white/70 text-lg leading-relaxed mb-8">
              Entre em contato com a nossa equipe e descubra como podemos transformar sua ideia
              em uma produção inesquecível.
            </p>
            <Link href={siteConfig.social.whatsapp} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="lg" leftIcon={<MessageCircle size={18} />}>
                Falar pelo WhatsApp
              </Button>
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
