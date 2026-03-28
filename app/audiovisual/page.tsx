import { Metadata } from "next";
import { getPageMetadata } from "@/lib/utils/getPageMetadata";
import Link from "next/link";
import { ExternalLink, Video, Film, Share2 } from "lucide-react";
import PageHero from "@/components/sections/PageHero";
import SectionTitle from "@/components/ui/SectionTitle";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import ScrollReveal from "@/components/ui/ScrollReveal";
import Button from "@/components/ui/Button";
import { siteConfig } from "@/lib/constants/siteConfig";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("audiovisual", {
    title: "Audiovisual — Sede do Movimento",
    description: "O departamento audiovisual da Sede do Movimento registra e produz conteúdo cinematográfico das artes cênicas.",
  });
}

const services = [
  {
    icon: Video,
    title: "Captação de Espetáculos",
    description:
      "Registro profissional de espetáculos, shows e performances com múltiplas câmeras e iluminação especializada para preservar cada detalhe da produção.",
  },
  {
    icon: Film,
    title: "Edição e Pós-produção",
    description:
      "Tratamento de imagem, colorização, edição de áudio e finalização com qualidade cinematográfica para todos os formatos de exibição.",
  },
  {
    icon: Share2,
    title: "Conteúdo para Redes Sociais",
    description:
      "Criação de conteúdo audiovisual estratégico e vertical para Instagram, YouTube e demais plataformas, amplificando o alcance de artistas e companhias.",
  },
];

const portfolioItems = [
  { label: "Making off Arcanum" },
  { label: "Espetáculo Tempo Vivo" },
  { label: "Ensaio Ballet" },
  { label: "Evento Especial" },
];

export default function AudiovisualPage() {
  return (
    <>
      <PageHero
        eyebrow="Sede Audiovisual"
        title="Audiovisual"
        subtitle="Registro, produção e criação audiovisual das artes cênicas"
        breadcrumbs={[
          { label: "Início", href: "/" },
          { label: "Audiovisual" },
        ]}
      />

      {/* Full-width intro */}
      <section className="section-padding bg-white">
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: text */}
            <ScrollReveal>
              <p className="text-brand-purple-600 font-bold text-xs uppercase tracking-widest mb-3">
                Sede Audiovisual
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-6">
                Sede Audiovisual
              </h2>
              <div className="space-y-4 text-gray-500 leading-relaxed mb-8">
                <p>
                  O departamento audiovisual da Sede do Movimento é responsável pelo registro
                  histórico de toda a produção artística da escola — espetáculos, ensaios, eventos
                  e processos criativos.
                </p>
                <p>
                  Oferecemos também serviços de produção audiovisual para artistas, companhias e
                  empresas que buscam qualidade cinematográfica para registrar seus trabalhos.
                </p>
              </div>
              <Link href={siteConfig.externalLinks.audiovisual} target="_blank" rel="noopener noreferrer">
                <Button
                  variant="primary"
                  size="lg"
                  rightIcon={<ExternalLink size={16} />}
                >
                  Acessar plataforma
                </Button>
              </Link>
            </ScrollReveal>

            {/* Right: image */}
            <ScrollReveal delay={0.15}>
              <div className="aspect-[4/3] rounded-2xl overflow-hidden">
                <PlaceholderImage
                  className="w-full h-full rounded-none border-none"
                  label="Equipe audiovisual em ação"
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
            title="O que oferecemos"
            subtitle="Soluções audiovisuais completas para o universo das artes cênicas e do entretenimento."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {services.map(({ icon: Icon, title, description }, i) => (
              <ScrollReveal key={title} delay={i * 0.1}>
                <div className="card-hover bg-white border border-gray-100 rounded-2xl p-8 flex flex-col items-start h-full">
                  <div className="w-12 h-12 rounded-xl bg-brand-light flex items-center justify-center mb-5">
                    <Icon size={22} className="text-brand-purple-600" />
                  </div>
                  <h3 className="font-extrabold text-gray-900 text-lg mb-3">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio preview */}
      <section className="section-padding bg-white">
        <div className="container-main">
          <SectionTitle
            eyebrow="Nosso trabalho"
            title="Portfólio"
            subtitle="Uma seleção de registros audiovisuais produzidos pelo nosso departamento."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-12">
            {portfolioItems.map(({ label }, i) => (
              <ScrollReveal key={label} delay={i * 0.08}>
                <div className="aspect-video rounded-2xl overflow-hidden group relative">
                  <PlaceholderImage
                    className="w-full h-full rounded-none border-none"
                    label={label}
                  />
                </div>
              </ScrollReveal>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href={siteConfig.externalLinks.audiovisual} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="lg" rightIcon={<ExternalLink size={16} />}>
                Ver portfólio completo
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
