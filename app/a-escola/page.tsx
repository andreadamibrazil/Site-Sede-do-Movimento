import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Award, Users, Building, Heart } from "lucide-react";
import PageHero from "@/components/sections/PageHero";
import SectionTitle from "@/components/ui/SectionTitle";
import StatsSection from "@/components/sections/StatsSection";
import TimelineSection from "@/components/sections/TimelineSection";
import EspetaculoCard from "@/components/sections/EspetaculoCard";
import ScrollReveal from "@/components/ui/ScrollReveal";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { stats, timelineEntries, espetaculos } from "@/lib/constants/mockData";

export const metadata: Metadata = {
  title: "A Escola",
  description: "Conheça a Sede do Movimento — por que existimos, nossa história, estrutura e resultados.",
};

const subPages = [
  { href: "/a-escola/apresentacao", icon: Heart, label: "Por que existimos", desc: "Nossa missão, visão e valores" },
  { href: "/a-escola/historia-e-estrutura", icon: Building, label: "História e Estrutura", desc: "De onde viemos e onde estamos" },
  { href: "/a-escola/resultados", icon: Award, label: "Resultados", desc: "Conquistas e premiações" },
  { href: "/a-escola/parcerias", icon: Users, label: "Parcerias", desc: "Quem acredita em nós" },
  { href: "/a-escola/espetaculos", icon: ArrowRight, label: "Espetáculos", desc: "Produções anuais nos grandes palcos" },
  { href: "/a-escola/projeto-social", icon: Heart, label: "Projeto Social", desc: "Sede de Aprender" },
];

export default function AEscolaPage() {
  return (
    <>
      <PageHero
        eyebrow="A Escola"
        title="Mais que uma escola de artes"
        subtitle="Um complexo cultural que forma artistas completos e cidadãos conscientes."
        breadcrumbs={[{ label: "A Escola" }]}
      />

      {/* Sub-navigation */}
      <section className="bg-white border-b border-gray-100 py-8">
        <div className="container-main">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {subPages.map(({ href, icon: Icon, label, desc }) => (
              <Link key={href} href={href} className="group flex flex-col items-center text-center p-4 rounded-xl hover:bg-brand-light transition-colors border border-gray-100 hover:border-brand-purple-200">
                <div className="w-10 h-10 rounded-full bg-brand-light group-hover:bg-brand-purple-600 flex items-center justify-center mb-2 transition-colors">
                  <Icon size={18} className="text-brand-purple-600 group-hover:text-white transition-colors" />
                </div>
                <p className="font-semibold text-gray-900 text-xs leading-tight">{label}</p>
                <p className="text-gray-400 text-[10px] mt-0.5 hidden sm:block leading-snug">{desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Por que existimos */}
      <section className="section-padding bg-white" id="apresentacao">
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <ScrollReveal>
              <p className="text-brand-purple-600 font-bold text-xs uppercase tracking-widest mb-3">Por que existimos</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-6">
                Quando uma criança entra no universo das artes, ela aprende a{" "}
                <span className="text-gradient">se expressar, se reconhecer</span> e a ocupar o mundo com mais coragem.
              </h2>
              <p className="text-gray-500 leading-relaxed mb-4">
                A Sede do Movimento nasce desse encontro: entre corpo, emoção e identidade. Um espaço que forma além da técnica, onde diferentes linguagens — dança, música, teatro e circo — se conectam para construir uma formação ampla, sensível e contemporânea.
              </p>
              <p className="text-gray-500 leading-relaxed mb-6">
                Acreditamos que a arte não é apenas expressão — é também caminho e responsabilidade com o mundo que habitamos. Por isso, integramos os princípios dos Objetivos de Desenvolvimento Sustentável (ODS) em nossas práticas cotidianas.
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                {["Autoconfiança", "Criatividade", "Trabalho coletivo", "Cooperação", "Liberdade de expressão"].map((item) => (
                  <Badge key={item} color="primary" variant="subtle" size="sm">{item}</Badge>
                ))}
              </div>
              <Link href="/a-escola/apresentacao">
                <Button variant="primary" size="lg" rightIcon={<ArrowRight size={16} />}>
                  Ler mais sobre nossa missão
                </Button>
              </Link>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <div className="aspect-[4/5] rounded-2xl overflow-hidden">
                <PlaceholderImage className="w-full h-full rounded-none border-none" label="Foto escola" />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Stats */}
      <StatsSection stats={stats} />

      {/* História e Estrutura */}
      <section className="section-padding bg-gray-50" id="historia">
        <div className="container-main">
          <SectionTitle eyebrow="Nossa trajetória" title="Uma história construída com arte" subtitle="De um casarão no Rio Comprido a um dos principais complexos culturais do Rio de Janeiro." />
          <TimelineSection entries={timelineEntries} />
          <div className="text-center mt-12">
            <Link href="/a-escola/historia-e-estrutura">
              <Button variant="ghost" size="lg" rightIcon={<ArrowRight size={16} />}>
                Ver história completa
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Estrutura física */}
      <section className="section-padding bg-white" id="estrutura">
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <ScrollReveal>
              <p className="text-brand-purple-600 font-bold text-xs uppercase tracking-widest mb-3">Estrutura</p>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-6">650m² dedicados à arte</h2>
              <p className="text-gray-500 leading-relaxed mb-6">
                Instalada em um casarão histórico no Rio Comprido, a Sede do Movimento oferece uma estrutura completa e profissional para o desenvolvimento artístico.
              </p>
              <ul className="space-y-3">
                {[
                  "4 salas de dança com piso flutuante profissional",
                  "1 sala de música com tratamento acústico",
                  "4 banheiros",
                  "Ateliê de figurinos e cenotécnica",
                  "Lounge, recepção e loja",
                  "Salas de produção cultural e coordenação",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-gray-700 text-sm">
                    <div className="w-5 h-5 rounded-full bg-brand-light flex items-center justify-center shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-brand-purple-600" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden">
                    <PlaceholderImage className="w-full h-full rounded-none border-none" label={`Sala ${i + 1}`} />
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Resultados snippet */}
      <section className="section-padding bg-gradient-dark text-white" id="resultados">
        <div className="container-main">
          <SectionTitle eyebrow="Resultados" title="Prêmios e conquistas" subtitle="Nosso grupo de competições é um verdadeiro celeiro de talentos, conquistando prêmios em festivais nacionais." dark />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {[
              { badge: "2025", title: "1° lugar em todos os festivais", desc: "O grupo de competições conquistou o primeiro lugar em todos os festivais que participou em 2025." },
              { badge: "2025", title: "Melhor Grupo — Festival de Caxias", desc: "Reconhecimento como Melhor Grupo no Festival de Dança de Caxias 2025." },
              { badge: "2024", title: "Menção Honrosa — Niterói em Cena", desc: "Reconhecimento no Festival de Teatro Niterói em Cena pelo alto nível artístico." },
            ].map((item, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="bg-white/10 border border-white/15 rounded-xl p-6">
                  <Badge color="accent" variant="subtle" size="sm" className="mb-3">{item.badge}</Badge>
                  <h3 className="font-bold text-white text-lg mb-2">{item.title}</h3>
                  <p className="text-white/65 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Espetáculos */}
      <section className="section-padding bg-white" id="espetaculos">
        <div className="container-main">
          <div className="flex items-end justify-between mb-10">
            <SectionTitle eyebrow="Espetáculos" title="No palco dos grandes teatros" align="left" className="mb-0" />
            <Link href="/a-escola/espetaculos" className="hidden md:flex items-center gap-1.5 text-brand-purple-600 font-semibold text-sm hover:gap-3 transition-all">
              Ver todos <ArrowRight size={15} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {espetaculos.slice(0, 3).map((esp, i) => (
              <ScrollReveal key={esp.slug} delay={i * 0.08}>
                <EspetaculoCard espetaculo={esp} featured={i === 0} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Projeto Social */}
      <section className="section-padding bg-brand-light" id="projeto-social">
        <div className="container-main text-center max-w-3xl mx-auto">
          <ScrollReveal>
            <div className="w-16 h-16 rounded-full bg-brand-purple-600 flex items-center justify-center mx-auto mb-6">
              <Heart size={28} className="text-white" />
            </div>
            <p className="text-brand-purple-600 font-bold text-xs uppercase tracking-widest mb-3">Projeto Social</p>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Sede de Aprender</h2>
            <p className="text-gray-500 leading-relaxed mb-8">
              O projeto social da Sede do Movimento leva formação artística gratuita ou subsidiada para jovens em situação de vulnerabilidade social. Arte como ferramenta de transformação e inclusão.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/a-escola/projeto-social">
                <Button variant="primary" size="lg">Como participar</Button>
              </Link>
              <Link href="/a-escola/projeto-social#apoiar">
                <Button variant="ghost" size="lg">Como apoiar</Button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
