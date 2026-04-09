import type { Metadata } from "next";
import { getPageMetadata } from "@/lib/utils/getPageMetadata";
import Link from "next/link";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("home", {
    title: "Sede do Movimento — Arte, Movimento e Transformação",
    description: "Complexo cultural e escola de artes cênicas no Rio de Janeiro. Dança, teatro, música e formação artística completa.",
  });
}
import Image from "next/image";
import { ArrowRight, Star, Heart, Users, Quote } from "lucide-react";
import HeroSliderServer from "@/components/sections/HeroSliderServer";
import StatsSection from "@/components/sections/StatsSection";
import SectionTitle from "@/components/ui/SectionTitle";
import Button from "@/components/ui/Button";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import BlogPostCard from "@/components/sections/BlogPostCard";
import EspetaculoCard from "@/components/sections/EspetaculoCard";
import FAQSection from "@/components/sections/FAQSection";
import FAQSchema from "@/components/schema/FAQSchema";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { stats } from "@/lib/constants/mockData";
import { siteConfig } from "@/lib/constants/siteConfig";
import { sanityFetch } from "@/sanity/lib/live";
import { allPostsQuery, allEspetaculosQuery, siteSettingsQuery, featuredGalleryPhotosQuery } from "@/lib/sanity/queries";
import { urlFor } from "@/sanity/lib/image";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import type { SanityPost, SanityEspetaculo, SanitySiteSettings } from "@/lib/sanity/types";

const modalidades = [
  { icon: "💃", title: "Dança", description: "Ballet, Jazz, Contemporâneo, Sapateado, Danças Urbanas e mais. Formação técnica completa para todas as idades.", href: "/ensino/modalidades", color: "from-brand-purple-600 to-brand-secondary" },
  { icon: "🎭", title: "Teatro", description: "Presença cênica, interpretação, improvisação e criação autoral. Formação completa em artes dramáticas.", href: "/ensino/modalidades", color: "from-brand-pink-600 to-brand-pink" },
  { icon: "🎵", title: "Música", description: "Canto, musicalização e educação musical integrada à formação em artes cênicas.", href: "/ensino/modalidades", color: "from-brand-secondary to-brand-purple-400" },
];

const pilares = [
  { icon: Heart, label: "Saúde", description: "Bem-estar físico e emocional como base do crescimento artístico." },
  { icon: Users, label: "Família", description: "Comunidade acolhedora onde famílias fazem parte do processo." },
  { icon: Star, label: "Educação", description: "Formação pedagógica sólida, revisada e com propósito." },
];

const jornadas = [
  { name: "Jornada do Ballet", ages: "2 a 18+" },
  { name: "Jornada do Jazz", ages: "5 a 17+" },
  { name: "Jornada do Sapateado", ages: "5 a 18+" },
  { name: "Jornada das Danças Urbanas", ages: "5 a 18+" },
  { name: "Jornada da Dança Contemporânea", ages: "11 a 18+" },
  { name: "Jornada do Teatro", ages: "4 a 18+" },
  { name: "Jornada de Música – Canto", ages: "2 a 18+" },
];

const faqItems = [
  {
    question: "Quais modalidades de dança a Sede do Movimento oferece?",
    answer: "A Sede do Movimento oferece ballet, jazz, sapateado, dança contemporânea, danças urbanas (charme, street), teatro, canto, violão e teclado. Também há baby class para crianças a partir de 2 anos e preparação física para bailarinos.",
  },
  {
    question: "A Sede do Movimento tem aulas para crianças pequenas?",
    answer: "Sim. A escola oferece baby class e iniciação artística a partir dos 2 anos de idade, com metodologia própria adaptada para o desenvolvimento infantil. Há turmas para todas as faixas etárias, do infantil ao adulto.",
  },
  {
    question: "Onde fica a Sede do Movimento?",
    answer: "A Sede do Movimento fica na Av. Paulo de Frontin, 698, Rio Comprido, Rio de Janeiro — RJ. É um casarão histórico de 650m² com 3 andares, 6 salas com piso flutuante e estrutura completa para formação artística.",
  },
  {
    question: "Como funciona a matrícula na Sede do Movimento?",
    answer: "A matrícula pode ser feita pelo WhatsApp ou presencialmente na escola. As vagas são limitadas por turma. É possível agendar uma visita para conhecer o espaço e conversar sobre a jornada ideal para você ou seu filho.",
  },
  {
    question: "O que é a Prática de Montagem da Sede do Movimento?",
    answer: "A Prática de Montagem é um projeto aberto a qualquer pessoa — aluno ou não — que queira vivenciar a experiência de um grande espetáculo musical. Os participantes passam por todo o processo de montagem e sobem ao palco em teatros de grande porte no Rio de Janeiro.",
  },
  {
    question: "Qual é o diferencial da Sede do Movimento em relação a outras escolas de dança?",
    answer: "A Sede do Movimento é um complexo cultural completo fundado pelo coreógrafo Carlos Fontinelle — diretor de movimento da Copa do Mundo FIFA 2014 e fundador da Vivá Cia de Dança. Além do ensino técnico de alta qualidade, a escola possui companhia profissional própria, estúdio audiovisual, produtora e projeto social.",
  },
  {
    question: "A Sede do Movimento tem projeto social?",
    answer: "Sim. O projeto 'Sede de Aprender' oferece bolsas e acesso às artes para crianças e jovens em situação de vulnerabilidade social. O projeto visa democratizar o acesso à formação artística de qualidade.",
  },
];

export default async function HomePage() {
  const [{ data: postsData }, { data: espetaculosData }, { data: settingsData }, { data: galleryData }] = await Promise.all([
    sanityFetch({ query: allPostsQuery }),
    sanityFetch({ query: allEspetaculosQuery }),
    sanityFetch({ query: siteSettingsQuery }),
    sanityFetch({ query: featuredGalleryPhotosQuery }),
  ]);
  const recentPosts = ((postsData as SanityPost[]) ?? []).slice(0, 3);
  const espetaculos = ((espetaculosData as SanityEspetaculo[]) ?? []).slice(0, 3);
  const imagens = (settingsData as SanitySiteSettings | null)?.imagens;
  const galleryAlbums = (galleryData as { photos: { image: SanityImageSource; alt: string; caption?: string }[] }[] | null) ?? [];
  return (
    <>
      <FAQSchema items={faqItems} />
      {/* ── 1. HERO SLIDER ─────────────────────────────────────────────────── */}
      <HeroSliderServer />

      {/* ── BREATH — transição suave do hero para o conteúdo ──────────────── */}
      <div className="h-0 bg-gradient-to-b from-gray-900/5 to-transparent" aria-hidden />

      {/* ── 2. SEÇÃO EMOCIONAL (NOVA) ──────────────────────────────────────── */}
      <section id="historia" className="py-14 md:py-28 bg-white">
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">

            {/* Foto */}
            <ScrollReveal>
              <div className="relative">
                <div className="rounded-2xl overflow-hidden aspect-[4/3] shadow-lg">
                  {imagens?.homeHistoria ? (
                    <Image src={urlFor(imagens.homeHistoria).width(800).height(600).url()} alt="Crianças em aula de dança" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
                  ) : (
                    <PlaceholderImage className="w-full h-full rounded-none border-none" label="Crianças em aula de dança" />
                  )}
                </div>
                {/* Floating badge */}
                <div className="absolute -bottom-4 right-3 sm:-bottom-5 sm:-right-5 bg-white rounded-xl px-4 py-3 sm:px-5 sm:py-4 shadow-brand-md border border-gray-100">
                  <p className="text-3xl font-extrabold text-gradient leading-none">2021</p>
                  <p className="text-xs text-gray-400 mt-1">Fundada no Rio de Janeiro</p>
                </div>
                {/* Decorative dot */}
                <div className="absolute -top-4 -left-4 w-24 h-24 rounded-full bg-brand-light opacity-60 -z-10" />
              </div>
            </ScrollReveal>

            {/* Texto emocional */}
            <ScrollReveal delay={0.15}>
              <p className="text-brand-purple-500 font-semibold text-[11px] uppercase tracking-[0.15em] mb-5">
                Nossa história
              </p>
              <h2 className="text-[2rem] sm:text-[2.4rem] font-bold text-gray-900 leading-[1.18] mb-6">
                Mais do que uma escola de artes.{" "}
                <span className="text-gradient">Um lar para quem precisa se expressar.</span>
              </h2>
              <p className="text-gray-500 text-[1.05rem] leading-[1.85] mb-5">
                A Sede do Movimento nasceu em abril de 2021, em um casarão de mais de 650m² no coração do Rio Comprido. Desde o primeiro dia, a missão foi clara: criar um espaço onde cada criança, jovem ou adulto pudesse encontrar sua voz através da arte.
              </p>
              <p className="text-gray-400 text-[1rem] leading-[1.85] mb-8">
                Hoje, mais de 300 alunos passam por nossas salas todos os dias — levando para casa muito mais do que passos de dança ou técnica cênica. Levam confiança, disciplina, pertencimento e uma versão mais inteira de si mesmos.
              </p>

              {/* Quote destaque */}
              <div className="border-l-[3px] border-brand-purple-200 pl-5 mb-8">
                <Quote size={18} className="text-brand-purple-300 mb-2" />
                <p className="text-gray-500 text-[0.95rem] leading-[1.75] italic">
                  &ldquo;No final, não é só sobre o que se aprende — é sobre quem você se torna.&rdquo;
                </p>
                <p className="text-brand-purple-500 text-xs font-semibold mt-2 tracking-wide">
                  — Carlos Fontinelle, Diretor Artístico
                </p>
              </div>

              <Link href="/a-escola/historia-e-estrutura">
                <Button variant="ghost" size="md" rightIcon={<ArrowRight size={15} />}>
                  Conheça nossa história
                </Button>
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── 3. STATS — com contexto emocional ─────────────────────────────── */}
      <div id="stats">
        {/* Headline acima dos números */}
        <div className="bg-white pt-4 pb-0">
          <div className="container-main text-center">
            <ScrollReveal>
              <p className="text-gray-400 text-sm tracking-wide">
                Famílias que confiam no nosso trabalho
              </p>
            </ScrollReveal>
          </div>
        </div>
        <StatsSection stats={stats} />
      </div>

      {/* ── 4. POR QUE EXISTIMOS ────────────────────────────────────────────── */}
      <section id="missao" className="py-14 md:py-28 bg-white">
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">

            {/* Texto */}
            <ScrollReveal>
              <p className="text-brand-purple-500 font-semibold text-[11px] uppercase tracking-[0.15em] mb-5">
                Por que existimos
              </p>
              <h2 className="text-[2rem] sm:text-[2.4rem] font-bold text-gray-900 leading-[1.18] mb-6">
                Quando uma criança entra no universo das artes, ela aprende{" "}
                <span className="text-gradient">muito mais</span> que técnica.
              </h2>
              <p className="text-gray-500 text-[1.05rem] leading-[1.85] mb-5">
                Somos um complexo cultural onde diferentes linguagens — dança, música, teatro e circo — se conectam para construir uma formação ampla, sensível e contemporânea. Aqui, o movimento vai além do corpo.
              </p>
              <p className="text-gray-400 text-[1rem] leading-[1.85] mb-10">
                Ele atravessa o pensamento, a criatividade e a forma de existir no mundo. E integramos a isso: desenvolvimento da inteligência emocional, autonomia, consciência social e introdução à economia criativa.
              </p>

              {/* Pilares */}
              <div className="grid grid-cols-3 gap-3 sm:gap-5 mb-10">
                {pilares.map(({ icon: Icon, label, description }) => (
                  <div key={label} className="text-center">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-brand-light flex items-center justify-center mx-auto mb-2 sm:mb-3">
                      <Icon size={16} className="text-brand-purple-600" />
                    </div>
                    <p className="font-semibold text-xs sm:text-sm text-gray-800">{label}</p>
                    <p className="text-[10px] sm:text-[11px] text-gray-400 mt-1 leading-snug">{description}</p>
                  </div>
                ))}
              </div>

              <Link href="/a-escola/apresentacao">
                <Button variant="primary" size="lg" rightIcon={<ArrowRight size={16} />}>
                  Conheça nossa missão
                </Button>
              </Link>
            </ScrollReveal>

            {/* Foto */}
            <ScrollReveal delay={0.2}>
              <div className="relative">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-brand-md">
                  {imagens?.homeMissao ? (
                    <Image src={urlFor(imagens.homeMissao).width(800).height(600).url()} alt="Alunos em espetáculo" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
                  ) : (
                    <PlaceholderImage className="w-full h-full rounded-none border-none" label="Alunos em espetáculo" />
                  )}
                </div>
                <div className="absolute -bottom-5 -left-5 w-28 h-28 rounded-full bg-brand-purple-50 -z-10" />
                <div className="absolute -top-5 -right-5 w-16 h-16 rounded-full bg-brand-pink/20 -z-10" />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── 5. MODALIDADES PREVIEW ──────────────────────────────────────────── */}
      <section id="jornadas" className="section-padding bg-[#F9F8FC]">
        <div className="container-main">
          <SectionTitle
            eyebrow="Nosso ensino"
            title="7 Jornadas Artísticas"
            subtitle="Uma formação completa em dança, teatro e música, para todas as idades e níveis."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
            {modalidades.map((mod) => (
              <Link key={mod.title} href={mod.href} className="group block">
                <div className="bg-white rounded-xl p-5 sm:p-7 md:p-8 shadow-sm hover:shadow-brand-sm border border-gray-100 transition-all duration-300 hover:-translate-y-1.5 text-center">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${mod.color} flex items-center justify-center text-2xl mx-auto mb-4 shadow-md`}>
                    {mod.icon}
                  </div>
                  <h3 className="font-bold text-gray-900 text-xl mb-3">{mod.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{mod.description}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {jornadas.map((j) => (
              <Link
                key={j.name}
                href="/ensino/jornadas-artisticas"
                className="bg-white border border-gray-200 rounded-full px-4 py-2 text-sm font-medium text-gray-700 hover:border-brand-purple-600 hover:text-brand-purple-600 hover:bg-brand-light transition-all"
              >
                {j.name}
                <span className="ml-2 text-xs text-gray-400">{j.ages}</span>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Link href="/ensino">
              <Button variant="primary" size="lg" rightIcon={<ArrowRight size={16} />}>
                Ver todos os cursos e horários
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 6. GALERIA PREVIEW ──────────────────────────────────────────────── */}
      <section id="galeria" className="section-padding bg-white overflow-hidden">
        <div className="container-main">
          <div className="flex items-end justify-between mb-5 md:mb-8">
            <SectionTitle
              eyebrow="Galeria"
              title="Momentos que ficam"
              subtitle="Registros de apresentações, bastidores e o dia a dia da Sede."
              align="left"
              className="mb-0"
            />
            <Link href="/galerias" className="hidden md:flex items-center gap-1.5 text-brand-purple-600 font-semibold text-sm hover:gap-3 transition-all">
              Ver galeria completa <ArrowRight size={15} />
            </Link>
          </div>

          {(() => {
            const galleryPhotos = galleryAlbums.flatMap((a) => a.photos ?? []).slice(0, 8);
            return galleryPhotos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5 sm:gap-2.5">
                {galleryPhotos.map((photo, i) => (
                  <ScrollReveal key={i} delay={i * 0.04}>
                    <Link href="/galerias/fotos" className={`group relative overflow-hidden rounded-lg block ${i === 0 ? "col-span-2 row-span-2 aspect-square" : "aspect-square"}`}>
                      <Image src={urlFor(photo.image).width(600).height(600).url()} alt={photo.alt} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 640px) 50vw, 25vw" />
                      <div className="absolute inset-0 bg-brand-purple-950/0 group-hover:bg-brand-purple-950/50 transition-all duration-300" />
                      {photo.caption && i === 0 && (
                        <div className="absolute bottom-3 left-3 right-3">
                          <p className="text-white text-xs font-medium bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-lg inline-block">{photo.caption}</p>
                        </div>
                      )}
                    </Link>
                  </ScrollReveal>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5 sm:gap-2.5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <ScrollReveal key={i} delay={i * 0.04}>
                    <div className={`group relative overflow-hidden rounded-lg cursor-pointer ${i === 0 ? "col-span-2 row-span-2 aspect-square" : "aspect-square"}`}>
                      <PlaceholderImage className="w-full h-full rounded-none border-none" label={`Foto ${i + 1}`} />
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            );
          })()}

          <div className="text-center mt-6 md:hidden">
            <Link href="/galerias">
              <Button variant="ghost" size="md" rightIcon={<ArrowRight size={16} />}>
                Ver galeria completa
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 7. METODOLOGIA PREVIEW ──────────────────────────────────────────── */}
      <section id="metodologia" className="section-padding bg-gradient-dark text-white overflow-hidden">
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <ScrollReveal>
              <p className="text-brand-pink font-semibold text-[11px] uppercase tracking-[0.15em] mb-4">
                Nossa metodologia
              </p>
              <h2 className="text-[2rem] sm:text-[2.4rem] font-bold text-white leading-[1.18] mb-6">
                Método Movimento Integrado
              </h2>
              <p className="text-white/65 text-[1.05rem] leading-[1.85] mb-8">
                Um sistema formativo único que integra dança, teatro e música, aliado ao desenvolvimento da inteligência emocional, pensamento criativo e visão de futuro.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {["Corpo", "Expressão", "Consciência", "Projeção"].map((pilar, i) => (
                  <div key={pilar} className="bg-white/8 rounded-xl p-4 border border-white/10">
                    <div className="w-8 h-8 rounded-full bg-brand-pink/20 flex items-center justify-center text-brand-pink font-bold text-sm mb-2">
                      {i + 1}
                    </div>
                    <p className="font-semibold text-white">{pilar}</p>
                  </div>
                ))}
              </div>
              <Link href="/ensino/metodologia">
                <Button variant="outline" size="lg" rightIcon={<ArrowRight size={16} />}>
                  Conheça a metodologia
                </Button>
              </Link>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className="aspect-[4/5] rounded-2xl overflow-hidden">
                {imagens?.homeMetodologia ? (
                  <Image src={urlFor(imagens.homeMetodologia).width(700).height(875).url()} alt="Aula de metodologia" fill className="object-cover opacity-70" sizes="(max-width: 1024px) 100vw, 50vw" />
                ) : (
                  <PlaceholderImage className="w-full h-full rounded-none border-none opacity-70" label="Aula de metodologia" />
                )}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── 8. ESPETÁCULOS PREVIEW ──────────────────────────────────────────── */}
      <section id="espetaculos" className="section-padding bg-white">
        <div className="container-main">
          <div className="flex items-end justify-between mb-7 md:mb-10">
            <SectionTitle
              eyebrow="Espetáculos"
              title="No palco e no mundo"
              subtitle="Apresentações de alto nível artístico em grandes teatros do Rio de Janeiro."
              align="left"
              className="mb-0"
            />
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

      {/* ── 9. CTA ──────────────────────────────────────────────────────────── */}
      <section id="contato" className="relative py-16 sm:py-24 bg-gradient-brand overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/10 blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-black/10 blur-[60px]" />
        </div>
        <div className="container-main relative z-10 text-center">
          <ScrollReveal>
            <p className="text-white/70 font-semibold text-[11px] uppercase tracking-[0.15em] mb-5">
              Próximos passos
            </p>
            <h2 className="text-[1.9rem] sm:text-5xl font-bold text-white mb-5 sm:mb-6 leading-[1.15]">
              Pronto para começar<br />sua jornada artística?
            </h2>
            <p className="text-white/75 text-base sm:text-lg leading-relaxed max-w-xl mx-auto mb-8 sm:mb-10">
              Vagas limitadas por turma. Venha conhecer a Sede do Movimento e descubra a jornada certa para você ou seu filho.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center">
              <Link href="/contato" className="w-full sm:w-auto">
                <Button variant="outline" size="xl" fullWidth rightIcon={<ArrowRight size={18} />}>
                  Agendar visita
                </Button>
              </Link>
              <a href={siteConfig.social.whatsapp} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                <Button size="xl" fullWidth className="bg-white text-brand-purple-700 hover:bg-white/90 shadow-lg font-bold">
                  💬 Falar pelo WhatsApp
                </Button>
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── 10. FAQ / GEO ────────────────────────────────────────────────────── */}
      <section id="faq" className="section-padding bg-white">
        <div className="container-main">
          <SectionTitle
            eyebrow="Perguntas frequentes"
            title="Tudo que você precisa saber"
            subtitle="Respostas rápidas sobre a escola, modalidades, matrículas e muito mais."
          />
          <ScrollReveal>
            <FAQSection items={faqItems} />
          </ScrollReveal>
        </div>
      </section>

      {/* ── 11. BLOG PREVIEW ─────────────────────────────────────────────────── */}
      <section id="blog" className="section-padding bg-gray-50">
        <div className="container-main">
          <div className="flex items-end justify-between mb-7 md:mb-10">
            <SectionTitle
              eyebrow="Blog"
              title="Novidades e conteúdo"
              subtitle="Artigos, notícias e histórias do universo da Sede do Movimento."
              align="left"
              className="mb-0"
            />
            <Link href="/blog" className="hidden md:flex items-center gap-1.5 text-brand-purple-600 font-semibold text-sm hover:gap-3 transition-all">
              Ver todos os posts <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentPosts.map((post, i) => (
              <ScrollReveal key={post._id} delay={i * 0.07}>
                <BlogPostCard post={post} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
