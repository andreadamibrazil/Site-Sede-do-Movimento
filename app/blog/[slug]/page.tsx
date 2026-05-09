import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock, Tag, Share2, ExternalLink, LinkIcon } from "lucide-react";
import { PortableText } from "@portabletext/react";
import PageHero from "@/components/sections/PageHero";
import BlogPostCard from "@/components/sections/BlogPostCard";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { sanityFetch } from "@/sanity/lib/live";
import { client } from "@/sanity/lib/client";
import { postBySlugQuery, postSlugsQuery, allPostsQuery } from "@/lib/sanity/queries";
import type { SanityPost } from "@/lib/sanity/types";
import { urlFor } from "@/sanity/lib/image";
import { formatDate } from "@/lib/utils/formatDate";
import { siteConfig } from "@/lib/constants/siteConfig";
import { cn } from "@/lib/utils/cn";
import BlogPostSchema from "@/components/schema/BlogPostSchema";
import BreadcrumbSchema from "@/components/schema/BreadcrumbSchema";

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

export async function generateStaticParams() {
  try {
    const slugs = await client.fetch<{ slug: string }[]>(postSlugsQuery);
    return slugs.map((s) => ({ slug: s.slug }));
  } catch (error) {
    console.warn("[blog/generateStaticParams] Failed to fetch slugs", error);
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await sanityFetch({ query: postBySlugQuery, params: { slug }, stega: false });
  const post = data as SanityPost | null;
  if (!post) return { title: "Post não encontrado" };

  const title = post.seoTitle ?? post.title;
  const description = post.seoDescription ?? post.excerpt;
  const ogImageSource = post.ogImage ?? post.coverImage;
  const ogImageUrl = ogImageSource
    ? urlFor(ogImageSource).width(1200).height(630).url()
    : undefined;

  return {
    title,
    description,
    robots: post.noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: post.publishedAt,
      ...(ogImageUrl && { images: [{ url: ogImageUrl, width: 1200, height: 630 }] }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(ogImageUrl && { images: [ogImageUrl] }),
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;

  const [{ data: postData }, { data: allData }] = await Promise.all([
    sanityFetch({ query: postBySlugQuery, params: { slug } }),
    sanityFetch({ query: allPostsQuery }),
  ]);

  const post = postData as SanityPost | null;
  if (!post) notFound();

  const allPosts = (allData as SanityPost[]) ?? [];
  const relatedPosts = allPosts
    .filter((p) => p.slug !== post.slug && p.category === post.category)
    .slice(0, 2);
  const fallbackPosts = allPosts.filter((p) => p.slug !== post.slug).slice(0, 2);
  const sidebarPosts = relatedPosts.length > 0 ? relatedPosts : fallbackPosts;

  const coverImageUrl = post.coverImage
    ? urlFor(post.coverImage).width(1200).height(525).url()
    : null;

  const breadcrumbs = [
    { label: "Início", href: "/" },
    { label: "Blog", href: "/blog" },
    { label: post.title },
  ];

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${post.title} — ${siteConfig.url}/blog/${post.slug}`)}`;
  const hasCircularLinks = post.instagramPost || post.youtubeVideo || (post.externalCitations?.length ?? 0) > 0;

  return (
    <>
      <BlogPostSchema
        title={post.seoTitle ?? post.title}
        excerpt={post.seoDescription ?? post.excerpt}
        publishedAt={post.publishedAt}
        authorName={post.author?.name ?? "Redação Sede"}
        slug={post.slug}
        coverImageUrl={coverImageUrl ?? undefined}
      />
      <BreadcrumbSchema items={[{ label: "Blog", href: "/blog" }, { label: post.title }]} />

      {/* Structured Data — links circulares para SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.seoTitle ?? post.title,
            description: post.seoDescription ?? post.excerpt,
            author: {
              "@type": "Person",
              name: post.author?.name ?? "Redação Sede",
            },
            publisher: {
              "@type": "Organization",
              name: "Sede do Movimento",
              url: siteConfig.url,
              sameAs: [
                siteConfig.social.instagram,
                siteConfig.social.youtube,
                siteConfig.social.facebook,
              ],
            },
            datePublished: post.publishedAt,
            url: `${siteConfig.url}/blog/${post.slug}`,
            ...(coverImageUrl && { image: coverImageUrl }),
          }),
        }}
      />

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
              <div className="mb-8">
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-purple-600 transition-colors font-medium group"
                >
                  <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                  Voltar para o Blog
                </Link>
              </div>

              {/* Cover image */}
              <div className="aspect-[16/7] rounded-2xl overflow-hidden mb-8 bg-gray-100 relative">
                {coverImageUrl ? (
                  <Image src={coverImageUrl} alt={post.title} fill className="object-cover" priority />
                ) : (
                  <div className="w-full h-full bg-gradient-tint flex items-center justify-center">
                    <span className="text-brand-purple-600/40 text-lg font-bold">{post.title}</span>
                  </div>
                )}
              </div>

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-6 pb-6 border-b border-gray-100">
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  {formatDate(post.publishedAt)}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={14} />
                  {post.readingTime} min de leitura
                </div>
                <Badge color={categoryColor[post.category] ?? "primary"} variant="subtle" size="xs">
                  {post.category}
                </Badge>
              </div>

              {/* Post title */}
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 leading-snug">
                {post.title}
              </h1>

              {/* Article body */}
              <div
                className={cn(
                  "prose prose-lg prose-gray max-w-none",
                  "prose-headings:font-extrabold prose-headings:text-gray-900",
                  "prose-p:text-gray-600 prose-p:leading-relaxed",
                  "prose-a:text-brand-purple-600 prose-a:no-underline hover:prose-a:underline",
                  "prose-strong:text-gray-900",
                  "prose-img:rounded-xl"
                )}
              >
                {post.body && post.body.length > 0 ? (
                  <PortableText
                    value={post.body as Parameters<typeof PortableText>[0]["value"]}
                    components={{
                      types: {
                        image: ({ value }) => {
                          const imgUrl = value?.asset
                            ? urlFor(value).width(900).url()
                            : null;
                          if (!imgUrl) return null;
                          return (
                            <figure className="my-8">
                              <div className="relative aspect-video rounded-xl overflow-hidden">
                                <Image src={imgUrl} alt={value.alt ?? ""} fill className="object-cover" />
                              </div>
                              {value.caption && (
                                <figcaption className="text-center text-sm text-gray-400 mt-2">
                                  {value.caption}
                                </figcaption>
                              )}
                            </figure>
                          );
                        },
                      },
                    }}
                  />
                ) : (
                  <p className="text-gray-400 italic">Conteúdo em breve.</p>
                )}
              </div>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
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

              {/* ── Links circulares SEO ─────────────────────────── */}
              {hasCircularLinks && (
                <div className="mt-10 pt-6 border-t border-gray-100 space-y-6">
                  {/* Instagram + YouTube */}
                  {(post.instagramPost || post.youtubeVideo) && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                        Ver também
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {post.instagramPost && (
                          <a
                            href={post.instagramPost}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-sm font-semibold text-gray-600 hover:border-pink-400 hover:text-pink-600 hover:bg-pink-50 transition-all"
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                            Ver no Instagram
                          </a>
                        )}
                        {post.youtubeVideo && (
                          <a
                            href={post.youtubeVideo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-sm font-semibold text-gray-600 hover:border-red-400 hover:text-red-600 hover:bg-red-50 transition-all"
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                            Assistir no YouTube
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Citações externas */}
                  {post.externalCitations && post.externalCitations.length > 0 && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                        Na imprensa
                      </p>
                      <div className="flex flex-col gap-2">
                        {post.externalCitations.map((c) => (
                          <a
                            key={c.url}
                            href={c.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-brand-purple-600 font-semibold hover:underline"
                          >
                            <ExternalLink size={13} />
                            {c.label}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Links internos relacionados */}
                  {post.relatedInternalLinks && post.relatedInternalLinks.length > 0 && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                        Explore na Sede
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {post.relatedInternalLinks.map((l) => (
                          <Link
                            key={l.href}
                            href={l.href}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-light text-brand-purple-600 text-sm font-semibold hover:bg-brand-purple-600 hover:text-white transition-all"
                          >
                            <LinkIcon size={12} />
                            {l.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Share */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <p className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-1.5">
                  <Share2 size={14} />
                  Compartilhar
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href={siteConfig.social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-sm font-semibold text-gray-600 hover:border-pink-400 hover:text-pink-600 hover:bg-pink-50 transition-all"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                    Instagram
                  </a>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-sm font-semibold text-gray-600 hover:border-green-400 hover:text-green-600 hover:bg-green-50 transition-all"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="space-y-8">

              {/* Author card */}
              <ScrollReveal>
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Autor</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-brand-light flex items-center justify-center shrink-0">
                      {post.author?.photo ? (
                        <Image
                          src={urlFor(post.author.photo).width(48).height(48).url()}
                          alt={post.author.name}
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-brand-purple-600 font-bold text-lg">
                          {post.author?.name?.charAt(0) ?? "A"}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{post.author?.name ?? "Redação Sede"}</p>
                      <p className="text-gray-400 text-xs">Equipe Sede do Movimento</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* Siga nas redes */}
              <ScrollReveal delay={0.05}>
                <div className="bg-gradient-tint rounded-2xl p-6 border border-brand-purple-100">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-brand-purple-400 mb-3">
                    Siga a Sede
                  </h3>
                  <div className="space-y-2">
                    <a
                      href={siteConfig.social.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 text-sm font-semibold text-brand-purple-700 hover:text-brand-purple-900 transition-colors"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-pink" aria-hidden="true"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                      @sededomovimento
                    </a>
                    <a
                      href={siteConfig.social.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 text-sm font-semibold text-brand-purple-700 hover:text-brand-purple-900 transition-colors"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-red-500" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                      @sededomovimento
                    </a>
                  </div>
                </div>
              </ScrollReveal>

              {/* Related posts */}
              {sidebarPosts.length > 0 && (
                <ScrollReveal delay={0.1}>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
                      {relatedPosts.length > 0 ? "Da mesma categoria" : "Artigos Relacionados"}
                    </h3>
                    <div className="space-y-3">
                      {sidebarPosts.map((related) => (
                        <BlogPostCard key={related._id} post={related} variant="horizontal" />
                      ))}
                    </div>
                  </div>
                </ScrollReveal>
              )}

              {/* CTA box */}
              <ScrollReveal delay={0.15}>
                <div className="bg-gradient-dark rounded-2xl p-6 text-center">
                  <p className="text-brand-pink font-bold text-xs uppercase tracking-widest mb-2">Faça Parte</p>
                  <p className="text-white font-extrabold text-base mb-3 leading-snug">
                    Conheça nossas turmas e modalidades
                  </p>
                  <Link href="/ensino">
                    <Button variant="cta" size="sm" fullWidth>Ver Modalidades</Button>
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
