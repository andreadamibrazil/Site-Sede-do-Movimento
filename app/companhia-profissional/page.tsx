import { Metadata } from "next";
import { getPageMetadata } from "@/lib/utils/getPageMetadata";
import Link from "next/link";
import { ExternalLink, Theater, MapPin, GraduationCap, MessageCircle } from "lucide-react";
import PageHero from "@/components/sections/PageHero";
import SectionTitle from "@/components/ui/SectionTitle";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import ScrollReveal from "@/components/ui/ScrollReveal";
import Button from "@/components/ui/Button";
import { siteConfig } from "@/lib/constants/siteConfig";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("companhia-profissional", {
    title: "Companhia Profissional — Vivá Cia de Dança",
    description: "Vivá Cia de Dança: companhia profissional fundada por Carlos Fontinelle no Rio de Janeiro, com atuação em TV, comerciais e grandes produções nacionais.",
  });
}

const highlights = [
  {
    icon: Theater,
    title: "Espetáculos Autorais",
    description:
      "Produções originais que transitam entre a dança contemporânea, o teatro físico e as artes integradas, apresentadas nos principais palcos do Brasil.",
  },
  {
    icon: MapPin,
    title: "Residências Artísticas",
    description:
      "Processos criativos em residência com artistas e criadores convidados, gerando trocas e novas linguagens para a companhia e seus integrantes.",
  },
  {
    icon: GraduationCap,
    title: "Formação Continuada",
    description:
      "Os integrantes da Vivá participam de formações intensivas, workshops e intercâmbios que mantêm o alto nível técnico e artístico do grupo.",
  },
];

export default function CompanhiaProfissionalPage() {
  return (
    <>
      <PageHero
        eyebrow="Vivá Cia de Dança"
        title="Companhia Profissional"
        subtitle="A companhia profissional nascida da Sede do Movimento"
        breadcrumbs={[
          { label: "Início", href: "/" },
          { label: "Companhia Profissional" },
        ]}
      />

      {/* Main split section */}
      <section className="section-padding bg-white">
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <ScrollReveal>
              <p className="text-brand-purple-600 font-bold text-xs uppercase tracking-widest mb-3">
                Vivá Cia de Dança
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-6">
                Vivá Cia de Dança
              </h2>
              <div className="space-y-4 text-gray-500 leading-relaxed mb-8">
                <p>
                  A Vivá Cia de Dança é a companhia profissional fundada por Carlos Fontinelle,
                  nascida diretamente da trajetória artística da Sede do Movimento.
                </p>
                <p>
                  Formada por bailarinos e artistas cênicos de alto nível, a companhia realiza
                  espetáculos, residências artísticas e projetos culturais em todo o Brasil.
                </p>
                <p>
                  A Vivá representa o mais alto nível da produção artística da Sede, sendo o
                  destino natural dos alunos que escolhem a carreira profissional nas artes cênicas.
                </p>
              </div>
              <Link href={siteConfig.externalLinks.vivaCompanhia} target="_blank" rel="noopener noreferrer">
                <Button
                  variant="primary"
                  size="lg"
                  rightIcon={<ExternalLink size={16} />}
                >
                  Visitar site da Cia Vivá
                </Button>
              </Link>
            </ScrollReveal>

            <ScrollReveal delay={0.15}>
              <div className="aspect-[4/3] rounded-2xl overflow-hidden">
                <PlaceholderImage
                  className="w-full h-full rounded-none border-none"
                  label="Vivá Cia de Dança em cena"
                />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Highlights grid */}
      <section className="section-padding bg-gray-50">
        <div className="container-main">
          <SectionTitle
            eyebrow="Destaques"
            title="O que a Vivá faz"
            subtitle="Uma companhia que une técnica, criatividade e comprometimento com a arte contemporânea."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {highlights.map(({ icon: Icon, title, description }, i) => (
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

      {/* Bottom CTA */}
      <section className="section-padding bg-gradient-to-br from-brand-purple-700 via-brand-purple-600 to-brand-secondary">
        <div className="container-main text-center max-w-2xl mx-auto">
          <ScrollReveal>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-4">
              Quer fazer parte?
            </h2>
            <p className="text-white/70 text-lg leading-relaxed mb-8">
              Alunos da Sede com alto nível técnico têm acesso aos processos seletivos da
              companhia.
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
