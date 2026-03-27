"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar, Clock, Mail } from "lucide-react";
import { SanityPost } from "@/lib/sanity/types";
import BlogPostCard from "@/components/sections/BlogPostCard";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import SectionTitle from "@/components/ui/SectionTitle";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { formatDate } from "@/lib/utils/formatDate";
import { urlFor } from "@/sanity/lib/image";
import { cn } from "@/lib/utils/cn";

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
  const [email, setEmail] = useState("");

  const featuredPost = posts[0] ?? null;
  const remainingPosts = posts.slice(1);

  const filteredPosts =
    activeCategory === "Todos"
      ? remainingPosts
      : remainingPosts.filter((p) => p.category === activeCategory);

  const featuredImageUrl = featuredPost?.coverImage
    ? urlFor(featuredPost.coverImage).width(900).height(600).url()
    : null;

  return (
    <>
      {/* Featured Post */}
      {featuredPost && (
        <section className="section-padding bg-white">
          <div className="container-main">
            <ScrollReveal>
              <Link
                href={`/blog/${featuredPost.slug}`}
                className="group grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="aspect-[4/3] lg:aspect-auto lg:min-h-[360px] bg-gray-100 overflow-hidden relative">
                  {featuredImageUrl ? (
                    <Image
                      src={featuredImageUrl}
                      alt={featuredPost.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      priority
                    />
                  ) : (
                    <PlaceholderImage
                      className="w-full h-full rounded-none border-none group-hover:scale-105 transition-transform duration-500"
                      label={featuredPost.title}
                    />
                  )}
                </div>
                <div className="flex flex-col justify-center p-8 lg:p-10 bg-white">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge color={categoryColor[featuredPost.category] ?? "primary"} variant="subtle" size="sm">
                      {featuredPost.category}
                    </Badge>
                    <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Destaque</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight mb-3 group-hover:text-brand-purple-600 transition-colors">
                    {featuredPost.title}
                  </h2>
                  <p className="text-gray-500 text-base leading-relaxed mb-6 line-clamp-3">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-400 mb-6">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} />
                      {formatDate(featuredPost.publishedAt)}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={13} />
                      {featuredPost.readingTime} min de leitura
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-brand-purple-600 font-semibold text-sm">
                    Ler artigo
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* Category filters + posts grid */}
      <section className="section-padding bg-gray-50">
        <div className="container-main">
          <SectionTitle
            eyebrow="Artigos"
            title="Mais Conteúdo"
            subtitle="Explore nossos artigos por categoria"
            align="center"
          />
          <div className="flex flex-wrap gap-2 mb-10 justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 border",
                  activeCategory === cat
                    ? "bg-brand-purple-600 text-white border-brand-purple-600 shadow-brand-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:border-brand-purple-600 hover:text-brand-purple-600"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post, index) => (
                <ScrollReveal key={post._id} delay={index * 0.07}>
                  <BlogPostCard post={post} variant="vertical" />
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400">
              <p className="text-base">Nenhum artigo encontrado nesta categoria.</p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="section-padding bg-brand-purple-950">
        <div className="container-main">
          <ScrollReveal>
            <div className="max-w-xl mx-auto text-center">
              <div className="w-12 h-12 rounded-xl bg-brand-pink/20 border border-brand-pink/30 flex items-center justify-center mx-auto mb-5">
                <Mail size={22} className="text-brand-pink" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
                Fique por dentro das novidades
              </h2>
              <p className="text-white/60 text-base mb-8 leading-relaxed">
                Receba artigos, notícias sobre espetáculos e conteúdo exclusivo diretamente no seu e-mail.
              </p>
              <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Seu melhor e-mail"
                  className="flex-1 h-12 px-4 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-transparent transition-all"
                />
                <Button variant="cta" size="md" type="submit">
                  Inscrever-se
                </Button>
              </form>
              <p className="text-white/35 text-xs mt-4">Sem spam. Cancele quando quiser.</p>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
