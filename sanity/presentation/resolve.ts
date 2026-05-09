import {
  defineDocuments,
  defineLocations,
  type PresentationPluginOptions,
} from "sanity/presentation";

export const resolve: PresentationPluginOptions["resolve"] = {
  locations: {
    post: defineLocations({
      select: { title: "title", slug: "slug.current" },
      resolve: (doc) => ({
        locations: [
          { title: doc?.title ?? "Post", href: `/blog/${doc?.slug}` },
          { title: "Blog", href: "/blog" },
        ],
      }),
    }),
    turma: defineLocations({
      select: { title: "name", slug: "slug.current" },
      resolve: (doc) => ({
        locations: [
          { title: doc?.title ?? "Turma", href: "/ensino" },
          { title: "Ensino", href: "/ensino" },
        ],
      }),
    }),
    espetaculo: defineLocations({
      select: { title: "title", slug: "slug.current" },
      resolve: (doc) => ({
        locations: [
          { title: doc?.title ?? "Espetáculo", href: "/a-escola/espetaculos" },
        ],
      }),
    }),
    professor: defineLocations({
      select: { title: "name" },
      resolve: () => ({
        locations: [{ title: "Equipe", href: "/ensino/equipe" }],
      }),
    }),
    galleryAlbum: defineLocations({
      select: { title: "title", slug: "slug.current" },
      resolve: (doc) => ({
        locations: [
          { title: doc?.title ?? "Álbum", href: `/galerias/fotos/${doc?.slug}` },
          { title: "Galerias", href: "/galerias/fotos" },
        ],
      }),
    }),
    siteSettings: defineLocations({
      select: { title: "title" },
      resolve: () => ({
        locations: [{ title: "Início", href: "/" }],
      }),
    }),
  },
  mainDocuments: defineDocuments([
    { route: "/", filter: `_type == "siteSettings"` },
    { route: "/blog", filter: `_type == "post"` },
    { route: "/blog/:slug", filter: `_type == "post" && slug.current == $slug` },
    { route: "/ensino", filter: `_type == "turma"` },
    { route: "/a-escola/espetaculos", filter: `_type == "espetaculo"` },
    { route: "/ensino/equipe", filter: `_type == "professor"` },
    { route: "/galerias/fotos", filter: `_type == "galleryAlbum"` },
    {
      route: "/galerias/fotos/:albumSlug",
      filter: `_type == "galleryAlbum" && slug.current == $albumSlug`,
    },
  ]),
};
