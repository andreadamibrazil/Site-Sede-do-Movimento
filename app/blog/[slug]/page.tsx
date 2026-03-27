import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Tag, Share2 } from "lucide-react";
import PageHero from "@/components/sections/PageHero";
import BlogPostCard from "@/components/sections/BlogPostCard";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { blogPosts } from "@/lib/constants/mockData";
import { siteConfig } from "@/lib/constants/siteConfig";
import { formatDate } from "@/lib/utils/formatDate";
import { cn } from "@/lib/utils/cn";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const categoryColor: Record<string, "primary" | "accent" | "secondary" | "success" | "warning"> = {
  Escola: "primary",
  Ensino: "secondary",
  Resultados: "success",
  Espetáculos: "accent",
  Eventos: "warning",
};

const articleContent = `
As artes cênicas sempre foram um espaço privilegiado de transformação humana. Na Sede do Movimento, acreditamos que a dança, o teatro e a música são ferramentas poderosas para o desenvolvimento integral do ser humano — corpo, mente e emoção. Desde a nossa fundação, em 2021, no coração do Rio Comprido, temos buscado criar um ambiente onde cada aluno possa descobrir e expandir seu potencial criativo.

O processo pedagógico que desenvolvemos aqui não se limita à técnica. Claro que a técnica importa — ela é o vocabulário que permite ao artista se expressar com liberdade e precisão. Mas a técnica é apenas o ponto de partida. O que realmente nos move é a formação de artistas completos, capazes de criar, interpretar, questionar e se emocionar. Artistas que levam para a vida o que aprenderam no palco: presença, escuta, colaboração e coragem.

Cada espetáculo que montamos é o resultado de meses de trabalho coletivo, de erros, revisões, descobertas e conquistas. Quando o pano sobe e as luzes acendem, o que o público vê não é só uma apresentação — é uma jornada inteira de crescimento, visível em cada gesto, em cada olhar, em cada passo. É por isso que nossa comunidade cresce e se fortalece a cada ano: porque o que fazemos aqui tem sentido real para quem vive, e não apenas assiste.

Convidamos você a fazer parte dessa história. Seja como aluno, familiar, parceiro ou espectador, há sempre um lugar para quem quer se aproximar da arte e das pessoas que a fazem acontecer. A Sede do Movimento é, acima de tudo, um espaço de encontros — entre corpos, entre ideias, entre histórias diferentes que se reconhecem e se completam no palco da vida.
`.trim();

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug) ?? blogPosts[0];

  const relatedPosts = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 2);

  const breadcrumbs = [
    { label: "Início", href: "/" },
    { label: "Blog", href: "/blog" },
    { label: post.title },
  ];

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${post.title} — ${siteConfig.url}/blog/${post.slug}`)}`;

  return (
    <>
      <PageHero
        title={post.title}
        eyebrow={post.category}
        subtitle={`Publicado em ${formatDate(post.publishedAt)}`}
        breadcrumbs={breadcrumbs}
      />

      <section className="section-padding bg-white">
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12 xl:gap-16">

            {/* Main article */}
            <div>
              {/* Back link */}
              <div className="mb-8">
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-purple-600 transition-colors font-medium group"
                >
                  <ArrowLeft
                    size={16}
                    className="group-hover:-translate-x-0.5 transition-transform"
                  />
                  Voltar para o Blog
                </Link>
              </div>

              {/* Cover image */}
              <div className="aspect-[16/7] rounded-2xl overflow-hidden mb-8 bg-gray-100">
                <PlaceholderImage
                  className="w-full h-full rounded-none border-none"
                  label={post.title}
                />
              </div>

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-8 pb-6 border-b border-gray-100">
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  {formatDate(post.publishedAt)}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={14} />
                  {post.readingTime} min de leitura
                </div>
                <Badge
                  color={categoryColor[post.category] ?? "primary"}
                  variant="subtle"
                  size="xs"
                >
                  {post.category}
                </Badge>
              </div>

              {/* Article body — prose typography */}
              <div
                className={cn(
                  "prose prose-lg prose-gray max-w-none",
                  "prose-headings:font-extrabold prose-headings:text-gray-900",
                  "prose-p:text-gray-600 prose-p:leading-relaxed",
                  "prose-a:text-brand-purple-600 prose-a:no-underline hover:prose-a:underline",
                  "prose-strong:text-gray-900"
                )}
              >
                {articleContent.split("\n\n").map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="mt-10 pt-6 border-t border-gray-100">
                  <div className="flex items-center flex-wrap gap-2">
                    <Tag size={14} className="text-gray-400" />
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold hover:bg-brand-light hover:text-brand-purple-600 transition-colors cursor-pointer"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Share buttons */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <p className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-1.5">
                  <Share2 size={14} />
                  Compartilhar
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={siteConfig.social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-sm font-semibold text-gray-600 hover:border-pink-400 hover:text-pink-600 hover:bg-pink-50 transition-all"
                  >
                    {/* Instagram icon (inline SVG — not in this lucide version) */}
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                    Compartilhar no Instagram
                  </Link>
                  <Link
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-sm font-semibold text-gray-600 hover:border-green-400 hover:text-green-600 hover:bg-green-50 transition-all"
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Compartilhar no WhatsApp
                  </Link>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="space-y-8">

              {/* Author card */}
              <ScrollReveal>
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
                    Autor
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-brand-light flex items-center justify-center shrink-0">
                      <span className="text-brand-purple-600 font-bold text-lg">
                        {post.author.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{post.author.name}</p>
                      <p className="text-gray-400 text-xs">Equipe Sede do Movimento</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* Related posts */}
              <ScrollReveal delay={0.1}>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
                    Artigos Relacionados
                  </h3>
                  <div className="space-y-3">
                    {relatedPosts.map((related) => (
                      <BlogPostCard key={related.slug} post={related} variant="horizontal" />
                    ))}
                  </div>
                </div>
              </ScrollReveal>

              {/* CTA box */}
              <ScrollReveal delay={0.15}>
                <div className="bg-gradient-dark rounded-2xl p-6 text-center">
                  <p className="text-brand-pink font-bold text-xs uppercase tracking-widest mb-2">
                    Faça Parte
                  </p>
                  <p className="text-white font-extrabold text-base mb-3 leading-snug">
                    Conheça nossas turmas e modalidades
                  </p>
                  <Link href="/ensino">
                    <Button variant="cta" size="sm" fullWidth>
                      Ver Modalidades
                    </Button>
                  </Link>
                </div>
              </ScrollReveal>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
