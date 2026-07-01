import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getPageMetadata } from "@/lib/utils/getPageMetadata";
import BreadcrumbSchema from "@/components/schema/BreadcrumbSchema";
import PageHero from "@/components/sections/PageHero";
import ScrollReveal from "@/components/ui/ScrollReveal";
import SeletivaForm from "@/components/sections/SeletivaForm";
import { Drama, PersonStanding, Music, ShieldCheck, ClipboardList, Video, Clapperboard, Trophy, Calendar, MapPin, Clock } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("seletiva", {
    title: "Seletiva para longa-metragem",
    description:
      "Seletiva de elenco da Sede do Movimento para longa-metragem — candidatas de 11 a 14 anos. Faça a inscrição com o material de audição.",
  });
}

const pilares = [
  { label: "Teatro", icon: Drama, desc: "Presença, interpretação e verdade em cena — a base de todo ator." },
  { label: "Dança", icon: PersonStanding, desc: "Consciência corporal, expressão e desenvoltura diante das câmeras." },
  { label: "Música", icon: Music, desc: "Ritmo, escuta e sensibilidade que completam o artista." },
];

const comoFunciona = [
  "Você preenche a inscrição abaixo com os dados e o material de audição.",
  "Nossa equipe avalia o perfil e o material enviado.",
  "As candidatas selecionadas são convidadas para um encontro presencial.",
  "No encontro, o responsável legal precisa estar presente — nada é assinado sem ele.",
];

const jaFizemos = [
  { icon: Clapperboard, title: "Audiovisual", desc: "Produções e projetos em vídeo da casa.", href: "/audiovisual" },
  { icon: Video, title: "Espetáculos", desc: "Montagens no palco com nossos alunos.", href: "/a-escola/espetaculos" },
  { icon: Trophy, title: "Resultados", desc: "Trajetórias e conquistas de quem passou por aqui.", href: "/a-escola/resultados" },
];

export default function SeletivaPage() {
  return (
    <>
      <BreadcrumbSchema items={[{ label: "Seletiva" }]} />
      <PageHero
        eyebrow="Seletiva de Elenco"
        title={"Seletiva para longa‑metragem"}
        subtitle="Estamos avaliando candidatas de 11 a 14 anos para um longa-metragem. Inscreva-se com o material de audição."
        breadcrumbs={[{ label: "Seletiva" }]}
      />

      {/* Data e local da seletiva presencial */}
      <section className="bg-brand-purple-600 text-white">
        <div className="container-main py-4 flex flex-col sm:flex-row items-center justify-center gap-x-10 gap-y-2 text-center">
          <span className="flex items-center gap-2 font-semibold">
            <Clock size={18} className="shrink-0" /> Inscrições até 06/07
          </span>
          <span className="flex items-center gap-2 font-semibold">
            <Calendar size={18} className="shrink-0" /> Seletiva presencial: 07/07
          </span>
          <span className="flex items-center gap-2">
            <MapPin size={18} className="shrink-0" /> Sede do Movimento — Av. Paulo de Frontin, 698, Rio Comprido – RJ
          </span>
        </div>
      </section>

      {/* Manifesto — artistas completos */}
      <section className="section-padding bg-white">
        <div className="container-main max-w-container-sm">
          <ScrollReveal>
            <p className="text-xl text-gray-500 leading-relaxed mb-8">
              Preparar alguém para a TV, o cinema e os palcos é formar um <strong>artista completo</strong>. Por isso,
              aqui na Sede do Movimento incentivamos que cada aluno vivencie todas as linguagens — porque é a soma delas
              que constrói presença, verdade e repertório.
            </p>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-5">As três linguagens que formam um ator</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              {pilares.map(({ label, icon: Icon, desc }) => (
                <div
                  key={label}
                  className="relative bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col items-center text-center overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-brand rounded-t-xl" />
                  <div className="w-11 h-11 rounded-xl bg-brand-purple-50 flex items-center justify-center mb-3">
                    <Icon size={20} className="text-brand-purple-600" strokeWidth={1.5} />
                  </div>
                  <p className="font-bold text-gray-900 text-base mb-1">{label}</p>
                  <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
            <p className="text-gray-600 leading-relaxed">
              Não passou nesta seletiva? Isso não é o fim do caminho — é o começo. Nossas turmas de teatro, dança e
              música existem justamente para preparar quem sonha em viver da arte.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Como funciona + aviso do responsável */}
      <section className="section-padding bg-gray-50">
        <div className="container-main max-w-container-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <ScrollReveal>
              <div className="flex items-center gap-2 mb-5">
                <ClipboardList size={20} className="text-brand-purple-600" />
                <h2 className="text-2xl font-extrabold text-gray-900">Como funciona</h2>
              </div>
              <ol className="space-y-4">
                {comoFunciona.map((passo, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-7 h-7 shrink-0 rounded-full bg-brand-purple-600 text-white text-sm font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <p className="text-gray-600 leading-relaxed">{passo}</p>
                  </li>
                ))}
              </ol>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div className="bg-white rounded-2xl border border-brand-purple-100 shadow-sm p-7 h-full">
                <div className="w-12 h-12 rounded-xl bg-brand-light flex items-center justify-center mb-4">
                  <ShieldCheck size={24} className="text-brand-purple-600" />
                </div>
                <h3 className="text-xl font-extrabold text-gray-900 mb-3">Candidata menor de idade</h3>
                <p className="text-gray-600 leading-relaxed mb-3">
                  Toda a seletiva acontece com a segurança da criança em primeiro lugar. Um{" "}
                  <strong>responsável maior de idade com vínculo familiar precisa estar presente</strong> no dia do
                  encontro presencial.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  <strong>Nenhum documento é assinado</strong> sem a presença desse responsável. Dados sensíveis
                  (como documentos) só são coletados pessoalmente, nunca por este formulário.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Formulário */}
      <section className="section-padding bg-white">
        <div className="container-main max-w-container-sm">
          <ScrollReveal>
            <div className="text-center mb-10">
              <p className="text-brand-purple-600 font-bold text-xs uppercase tracking-widest mb-3">Inscrição</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Faça a inscrição</h2>
              <p className="text-gray-500 mt-3">
                Preencha os dados da candidata e do responsável e envie o material.{" "}
                <strong className="text-gray-700">As inscrições vão até 06/07</strong> — a seletiva presencial é no dia 07/07.
              </p>
            </div>
            <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 sm:p-8">
              <SeletivaForm />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* O que já fizemos */}
      <section className="section-padding bg-gray-50">
        <div className="container-main">
          <p className="text-brand-purple-600 font-bold text-xs uppercase tracking-widest mb-4 text-center">
            Nossa trajetória
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 text-center mb-3">O que já fizemos</h2>
          <p className="text-gray-500 text-center max-w-xl mx-auto mb-10">
            Esta não é a nossa primeira seletiva. Conheça um pouco do que já produzimos e das trajetórias que começaram
            aqui.
          </p>

          {/* Corpus Christi 2026 — Auto da Paixão de Cristo */}
          <ScrollReveal>
            <div className="max-w-4xl mx-auto mb-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative aspect-[3/2] rounded-2xl overflow-hidden">
                  <Image
                    src="/images/seletiva/corpus-christi-2026-palco.jpg"
                    alt="Alunos da Sede do Movimento cantando e atuando no palco do Auto da Paixão de Cristo 2026"
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                </div>
                <div className="relative aspect-[3/2] rounded-2xl overflow-hidden">
                  <Image
                    src="/images/seletiva/corpus-christi-2026-tv.jpg"
                    alt="Aluno da Sede do Movimento sendo entrevistado pela TV no Auto da Paixão de Cristo 2026"
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                </div>
              </div>
              <p className="text-gray-500 text-sm text-center mt-4">
                No <strong className="text-gray-700">Auto da Paixão de Cristo 2026</strong>, alunos, professores e o
                diretor da Sede foram parte importante da apresentação — com ensaios aqui na escola.{" "}
                <a
                  href="https://www.instagram.com/sededomovimento/reel/DJCbcE5uug0/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-purple-600 font-semibold hover:underline"
                >
                  Ver no Instagram
                </a>
              </p>
            </div>
          </ScrollReveal>

          {/* Reel do Auto da Paixão de Cristo */}
          <ScrollReveal>
            <div className="max-w-md mx-auto mb-12">
              <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-white">
                <iframe
                  src="https://www.instagram.com/reel/DJCbcE5uug0/embed/"
                  className="w-full"
                  style={{ minHeight: 560, border: "none" }}
                  scrolling="no"
                  title="Reel do Auto da Paixão de Cristo — Sede do Movimento"
                />
              </div>
              <p className="text-gray-500 text-sm text-center mt-3">
                Alunos, professores e o diretor da Sede na apresentação do Auto da Paixão de Cristo.
              </p>
            </div>
          </ScrollReveal>

          {/* Zion — artista completo (musical 2025) */}
          <ScrollReveal>
            <div className="max-w-sm mx-auto mb-12">
              <Image
                src="/images/seletiva/zion-artista-completo.jpg"
                alt="Zion, aluno da Sede do Movimento, fantasiado de príncipe no musical de 2025 — acredite, ensaie e seja o príncipe, o bailarino, o músico e o artista."
                width={1080}
                height={1080}
                className="rounded-2xl shadow-brand-md w-full h-auto"
              />
              <p className="text-gray-500 text-sm text-center mt-4">
                Zion, aos 7 anos, cantou, dançou e interpretou no nosso musical de 2025 — porque aqui a gente forma
                artistas completos.
              </p>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {jaFizemos.map(({ icon: Icon, title, desc, href }, i) => (
              <ScrollReveal key={href} delay={i * 0.1}>
                <Link
                  href={href}
                  className="card-hover flex flex-col items-start gap-4 bg-white border border-gray-100 rounded-2xl p-8 group h-full"
                >
                  <div className="w-12 h-12 rounded-xl bg-brand-light group-hover:bg-brand-purple-600 flex items-center justify-center transition-colors">
                    <Icon size={22} className="text-brand-purple-600 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-lg mb-1">{title}</h3>
                    <p className="text-gray-500 text-sm">{desc}</p>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
