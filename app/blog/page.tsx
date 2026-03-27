import type { Metadata } from "next";
import PageHero from "@/components/sections/PageHero";
import BlogGrid from "@/components/sections/BlogGrid";
import { sanityFetch } from "@/sanity/lib/live";
import { allPostsQuery } from "@/lib/sanity/queries";
import type { SanityPost } from "@/lib/sanity/types";

export const metadata: Metadata = {
  title: "Blog",
  description: "Artigos, notícias e inspiração do universo das artes cênicas na Sede do Movimento.",
};

const breadcrumbs = [
  { label: "Início", href: "/" },
  { label: "Blog" },
];

export default async function BlogPage() {
  const { data } = await sanityFetch({ query: allPostsQuery });
  const posts = (data as SanityPost[]) ?? [];

  return (
    <>
      <PageHero
        title="Blog"
        eyebrow="Novidades"
        subtitle="Artigos, notícias e inspiração do universo das artes cênicas"
        breadcrumbs={breadcrumbs}
      />
      <BlogGrid posts={posts} />
    </>
  );
}
