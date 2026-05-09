"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar, Clock, Mail, BookOpen } from "lucide-react";
import NewsletterForm from "@/components/ui/NewsletterForm";
import { SanityPost } from "@/lib/sanity/types";
import BlogPostCard from "@/components/sections/BlogPostCard";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import Badge from "@/components/ui/Badge";
import SectionTitle from "@/components/ui/SectionTitle";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { formatDate } from "@/lib/utils/formatDate";
import { urlFor } from "@/sanity/lib/image";
import { cn } from "@/lib/utils/cn";
import { siteConfig } from "@/lib/constants/siteConfig";

const categories = ["Todos", "Escola", "Ensino", "Espetáculos", "Resultados", "Eventos"];

const categoryColor: Record<string, "primary" | "accent" | "secondary" | "success" | "warning"> = {
  Escola: "primary",
  Ensino: "secondary",
  Resultados: "success",
  Espetáculos: "accent",
  Eventos: "warning",
};

interface BlogGridProps {
  posts: SanityPost[];
}

export default function BlogGrid({ posts }: BlogGridProps) {
  const [activeCategory, setActiveCategory] = useState("Todos");

  const featuredPost = posts[0] ?? null;
  const secondaryPosts = posts.slice(1, 3);
  const remainingPosts = posts.slice(3);

  const filteredPosts =
    activeCategory === "Todos"
      ? remainingPosts
      : posts.filter((p) => p.category === activeCategory);

  const featuredImageUrl = featuredPost?.coverImage
    ? urlFor(featuredPost.coverImage).width(900).height(600).url()
    : null;

  return (
    <>
      {featuredPost && (
        <section className="section-padding bg-white">
          <div className="container-main">
            <ScrollReveal>
              <Link
                href={`/blog/${featuredPost.slug}`}
                className="group grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-0 rounded-3xl overflow-hidden shadow-brand-md hover:shadow-xl transition-all duration-500 border border-gray-100"
              >
                <div className="aspect-[4/3] lg:aspect-auto lg:min-h-[400px] bg-gray-100 overflow-hidden relative">
                  {featuredImageUrl ? (
                    <Image src={featuredImageUrl} alt={featuredPost.title} fill className="object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out" priority />
                  ) : (
                    <PlaceholderImage className="w-full h-full rounded-none border-none" label={featuredPost.title} />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                </div>
                <div className="flex flex-col justify-between p-8 lg:p-10 bg-white">
                  <div>
                    <div className="flex items-center gap-2 mb-5">
                      <Badge color={categoryColor[featuredPost.category] ?? "primary"} variant="subtle" size="sm">{featuredPost.category}</Badge>
                      <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Destaque</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight mb-4 group-hover:text-brand-purple-600 transition-colors duration-300">
                      {featuredPost.title}
                    </h2>
                    <p className="text-gray-500 text-base leading-relaxed line-clamp-4">{featuredPost.excerpt}</p>
                  </div>
                  <div className="mt-8">
                    <div className="flex items-center gap-4 text-xs text-gray-400 mb-5">
                      <div className="flex items-center gap-1.5"><Calendar size={13} />{formatDate(featuredPost.publishedAt)}</div>
                      <div className="flex items-center gap-1.5"><Clock size={13} />{featuredPost.readingTime} min de leitura</div>
                    </div>
                    <div className="flex items-center gap-2 text-brand-purple-600 font-bold text-sm">
                      <BookOpen size={16} />Ler artigo completo
                      <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform duration-300" />
                    </div>
                  </div>
                </div>
              </Link>
            </ScrollReveal>

            {secondaryPosts.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
                {secondaryPosts.map((post, i) => {
                  const imgUrl = post.coverImage ? urlFor(post.coverImage).width(600).height(340).url() : null;
                  return (
                    <ScrollReveal key={post._id} delay={i * 0.08}>
                      <Link href={`/blog/${post.slug}`} className="group flex gap-4 bg-gray-50 hover:bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-brand-purple-100 hover:shadow-md transition-all duration-300 p-4">
                        <div className="w-28 shrink-0 aspect-square rounded-xl overflow-hidden bg-gray-200 relative">
                          {imgUrl ? <Image src={imgUrl} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" /> : <PlaceholderImage className="w-full h-full rounded-none border-none" label={post.title} />}
                        </div>
                        <div className="flex flex-col justify-center min-w-0">
                          <Badge color={categoryColor[post.category] ?? "primary"} variant="subtle" size="xs" className="mb-2 w-fit">{post.category}</Badge>
                          <h3 className="font-extrabold text-gray-900 text-sm leading-snug mb-1.5 line-clamp-2 group-hover:text-brand-purple-600 transition-colors">{post.title}</h3>
                          <div className="flex items-center gap-2 text-xs text-gray-400"><Calendar size={11} />{formatDate(post.publishedAt)}</div>
                        </div>
                      </Link>
                    </ScrollReveal>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      <section className="section-padding bg-gray-50">
        <div className="container-main">
          <SectionTitle eyebrow="Conteúdo" title="Mais Artigos" subtitle="Explore por categoria" align="center" />
          <div className="flex flex-wrap gap-2 mb-10 justify-center">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setActiveCategory(cat)} className={cn("px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 border", activeCategory === cat ? "bg-brand-purple-600 text-white border-brand-purple-600 shadow-brand-sm" : "bg-white text-gray-600 border-gray-200 hover:border-brand-purple-400 hover:text-brand-purple-600")}>
                {cat}
              </button>
            ))}
          </div>
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post, index) => (
                <ScrollReveal key={post._id} delay={index * 0.06}>
                  <BlogPostCard post={post} variant="vertical" />
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-400">
              <BookOpen size={36} className="mx-auto mb-4 opacity-30" />
              <p className="text-base">Nenhum artigo encontrado nesta categoria.</p>
            </div>
          )}
        </div>
      </section>

      <section className="section-padding bg-brand-purple-950">
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <ScrollReveal>
              <div className="text-center lg:text-left">
                <div className="w-12 h-12 rounded-xl bg-brand-pink/20 border border-brand-pink/30 flex items-center justify-center mb-5 mx-auto lg:mx-0">
                  <Mail size={22} className="text-brand-pink" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">Fique por dentro das novidades</h2>
                <p className="text-white/60 text-base mb-8 leading-relaxed">Receba artigos, notícias sobre espetáculos e conteúdo exclusivo diretamente no seu e-mail.</p>
                <NewsletterForm theme="dark" className="max-w-sm mx-auto lg:mx-0" />
                <p className="text-white/35 text-xs mt-4">Sem spam. Cancele quando quiser.</p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <div className="text-center lg:text-left">
                <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-5">Acompanhe nas redes</p>
                <div className="space-y-4">
                  <a href={siteConfig.social.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-brand-pink/30 transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shrink-0"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white" aria-hidden="true"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg></div>
                    <div className="text-left"><p className="text-white font-bold text-sm">@sededomovimento</p><p className="text-white/50 text-xs">Fotos, vídeos e bastidores</p></div>
                    <ArrowRight size={16} className="text-white/30 ml-auto group-hover:text-white/60 group-hover:translate-x-1 transition-all" />
                  </a>
                  <a href={siteConfig.social.youtube} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-red-500/30 transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shrink-0"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-white" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></div>
                    <div className="text-left"><p className="text-white font-bold text-sm">@sededomovimento</p><p className="text-white/50 text-xs">Espetáculos, aulas e eventos</p></div>
                    <ArrowRight size={16} className="text-white/30 ml-auto group-hover:text-white/60 group-hover:translate-x-1 transition-all" />
                  </a>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </>
  );
}
