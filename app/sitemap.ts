import { MetadataRoute } from "next";
import { sanityFetch } from "@/sanity/lib/live";
import { postSlugsQuery, allGalleryAlbumsQuery } from "@/lib/sanity/queries";
import type { SanityGalleryAlbum } from "@/lib/sanity/types";

const BASE_URL = "https://sededomovimento.com.br";

type ChangeFrequency = "daily" | "weekly" | "monthly";

interface RouteEntry {
  path: string;
  changeFrequency: ChangeFrequency;
}

const routes: RouteEntry[] = [
  { path: "/", changeFrequency: "daily" },
  { path: "/a-escola", changeFrequency: "weekly" },
  { path: "/a-escola/apresentacao", changeFrequency: "monthly" },
  { path: "/a-escola/historia-e-estrutura", changeFrequency: "monthly" },
  { path: "/a-escola/resultados", changeFrequency: "monthly" },
  { path: "/a-escola/parcerias", changeFrequency: "monthly" },
  { path: "/a-escola/espetaculos", changeFrequency: "weekly" },
  { path: "/a-escola/projeto-social", changeFrequency: "monthly" },
  { path: "/ensino", changeFrequency: "weekly" },
  { path: "/ensino/equipe", changeFrequency: "monthly" },
  { path: "/ensino/modalidades", changeFrequency: "monthly" },
  { path: "/ensino/metodologia", changeFrequency: "monthly" },
  { path: "/ensino/jornadas-artisticas", changeFrequency: "weekly" },
  { path: "/ensino/formacao-infantil", changeFrequency: "monthly" },
  { path: "/ensino/horarios", changeFrequency: "weekly" },
  { path: "/ensino/eventos-extras", changeFrequency: "weekly" },
  { path: "/ensino/estrutura-pedagogica", changeFrequency: "monthly" },
  { path: "/galerias", changeFrequency: "weekly" },
  { path: "/galerias/fotos", changeFrequency: "weekly" },
  { path: "/galerias/videos", changeFrequency: "weekly" },
  { path: "/galerias/youtube", changeFrequency: "weekly" },
  { path: "/companhia-profissional", changeFrequency: "monthly" },
  { path: "/produtora", changeFrequency: "monthly" },
  { path: "/audiovisual", changeFrequency: "monthly" },
  { path: "/atelier", changeFrequency: "monthly" },
  { path: "/contato", changeFrequency: "monthly" },
  { path: "/contato/trabalhe-conosco", changeFrequency: "monthly" },
  { path: "/contato/ouvidoria", changeFrequency: "monthly" },
  { path: "/blog", changeFrequency: "daily" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch dynamic slugs from Sanity in parallel.
  // postSlugsQuery and allGalleryAlbumsQuery do not project _updatedAt,
  // so lastModified uses new Date() (current build time) for dynamic routes.
  // sanityFetch from defineLive does not accept result-type generics — cast after.
  const [{ data: rawPostSlugs }, { data: rawAlbums }] = await Promise.all([
    sanityFetch({ query: postSlugsQuery }),
    sanityFetch({ query: allGalleryAlbumsQuery }),
  ]);

  const postSlugs = rawPostSlugs as { slug: string }[];
  const albums = rawAlbums as SanityGalleryAlbum[];

  const staticRoutes: MetadataRoute.Sitemap = routes.map(({ path, changeFrequency }) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency,
  }));

  const blogRoutes: MetadataRoute.Sitemap = postSlugs
    .filter((p) => !!p.slug)
    .map(({ slug }) => ({
      url: `${BASE_URL}/blog/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

  const albumRoutes: MetadataRoute.Sitemap = albums
    .filter((a) => !!a.slug)
    .map(({ slug }) => ({
      url: `${BASE_URL}/galerias/fotos/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

  return [...staticRoutes, ...blogRoutes, ...albumRoutes];
}
