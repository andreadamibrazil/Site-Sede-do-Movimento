import { Metadata } from "next";
import { getPageMetadata } from "@/lib/utils/getPageMetadata";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PageHero from "@/components/sections/PageHero";
import SectionTitle from "@/components/ui/SectionTitle";
import TeamGrid from "@/components/sections/TeamGrid";
import ScrollReveal from "@/components/ui/ScrollReveal";
import Button from "@/components/ui/Button";
import { sanityFetch } from "@/sanity/lib/live";
import { allProfessorsQuery } from "@/lib/sanity/queries";
import type { SanityProfessor } from "@/lib/sanity/types";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("ensino", {
    title: "Ensino",
    description: "Conheça a metodologia, equipe e modalidades da Sede do Movimento.",
  });
}

const subLinks = [
  { href: "/ensino/equipe", label: "Equipe" },
  { href: "/ensino/modalidades", label: "Modalidades" },
  { href: "/ensino/metodologia", label: "Metodologia" },
  { href: "/ensino/jornadas-artisticas", label: "Jornadas" },
  { href: "/ensino/formacao-infantil", label: "Formação Infantil" },
  { href: "/ensino/horarios", label: "Horários" },
  { href: "/ensino/eventos-extras", label: "Eventos" },
];

export default async function EnsinoPage() {
  const { data } = await sanityFetch({ query: allProfessorsQuery });
  const professors = (data as SanityProfessor[]) ?? [];
  return (
    <>
      <PageHero eyebrow="Ensino" title="Formação artística completa" subtitle="Uma equipe de especialistas e uma metodologia única para formar artistas e pessoas completas." breadcrumbs={[{ label: "Ensino" }]} />

      {/* Sub-nav */}
      <section className="bg-white border-b border-gray-100 py-4">
        <div className="container-main">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {subLinks.map((l) => (
              <Link key={l.href} href={l.href} className="shrink-0 px-4 py-2 rounded-full text-sm font-medium border border-gray-200 text-gray-600 hover:border-brand-purple-600 hover:text-brand-purple-600 hover:bg-brand-light transition-all">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Metodologia preview */}
      <section className="section-padding bg-gradient-dark text-white">
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <ScrollReveal>
              <p className="text-brand-pink font-bold text-xs uppercase tracking-widest mb-3">Metodologia</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-6">Método Movimento Integrado</h2>
              <p className="text-white/65 leading-relaxed mb-8">Corpo • Emoção • Criação • Mundo. Um sistema formativo em artes cênicas que integra dança, teatro e música, aliado ao desenvolvimento da inteligência emocional, pensamento criativo e visão de futuro.</p>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {[
                  { num: "1", title: "Corpo", desc: "Técnica, consciência corporal, prevenção de lesões" },
                  { num: "2", title: "Expressão", desc: "Teatro, musicalidade, improvisação" },
                  { num: "3", title: "Consciência", desc: "Inteligência emocional, identidade artística" },
                  { num: "4", title: "Projeção", desc: "Economia criativa, autonomia profissional" },
                ].map((p) => (
                  <div key={p.num} className="bg-white/10 rounded-xl p-4 border border-white/10">
                    <div className="w-7 h-7 rounded-full bg-brand-pink/30 text-brand-pink font-bold text-sm flex items-center justify-center mb-2">{p.num}</div>
                    <p className="font-bold text-white text-sm">{p.title}</p>
                    <p className="text-white/55 text-xs mt-1">{p.desc}</p>
                  </div>
                ))}
              </div>
              <Link href="/ensino/metodologia"><Button variant="outline" size="lg" rightIcon={<ArrowRight size={16} />}>Ver metodologia completa</Button></Link>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div className="grid grid-cols-2 gap-3">
                {["Infantil (3-6)", "Iniciação (7-10)", "Desenvolvimento (11-14)", "Avançado (15+)"].map((nivel) => (
                  <div key={nivel} className="bg-white/10 rounded-xl p-5 border border-white/10 text-center">
                    <p className="font-bold text-white text-sm">{nivel}</p>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Equipe preview */}
      <section className="section-padding bg-white">
        <div className="container-main">
          <div className="flex items-end justify-between mb-10">
            <SectionTitle eyebrow="Nossa equipe" title="Especialistas que vivem o que ensinam" align="left" className="mb-0" />
            <Link href="/ensino/equipe" className="hidden md:flex items-center gap-1.5 text-brand-purple-600 font-semibold text-sm hover:gap-3 transition-all">Ver equipe completa <ArrowRight size={15} /></Link>
          </div>
          <TeamGrid members={professors.slice(0, 8)} />
        </div>
      </section>

      {/* Jornadas preview */}
      <section className="section-padding bg-gray-50">
        <div className="container-main">
          <SectionTitle eyebrow="Jornadas artísticas" title="7 caminhos de formação" subtitle="Cada aluno é acompanhado ao longo do seu processo artístico, recebendo orientação de acordo com seus interesses, talentos e objetivos." />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: "Ballet", ages: "2 a 18+", emoji: "🩰" },
              { name: "Jazz", ages: "5 a 17+", emoji: "🎷" },
              { name: "Sapateado", ages: "5 a 18+", emoji: "👞" },
              { name: "Danças Urbanas", ages: "5 a 18+", emoji: "🎤" },
              { name: "Contemporâneo", ages: "11 a 18+", emoji: "💫" },
              { name: "Teatro", ages: "4 a 18+", emoji: "🎭" },
              { name: "Canto", ages: "2 a 18+", emoji: "🎵" },
            ].map((j, i) => (
              <ScrollReveal key={j.name} delay={i * 0.06}>
                <Link href="/ensino/jornadas-artisticas" className="group block bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:border-brand-purple-200 hover:shadow-brand-sm transition-all hover:-translate-y-1">
                  <span className="text-3xl mb-3 block">{j.emoji}</span>
                  <p className="font-bold text-gray-900 text-sm">Jornada do {j.name}</p>
                  <p className="text-gray-400 text-xs mt-1">Idades: {j.ages}</p>
                </Link>
              </ScrollReveal>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/ensino/horarios"><Button variant="primary" size="lg" rightIcon={<ArrowRight size={16} />}>Ver horários e matrículas</Button></Link>
          </div>
        </div>
      </section>
    </>
  );
}
