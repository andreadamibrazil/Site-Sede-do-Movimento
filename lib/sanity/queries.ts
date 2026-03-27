// ─── DIVERGÊNCIAS CONHECIDAS ──────────────────────────────────────────────────
// postSlugsQuery: definida abaixo e documentada em CMS_EDITABLE_AREAS.md como
// sendo usada em app/blog/[slug]/page.tsx para generateStaticParams.
// Na prática, app/blog/[slug]/page.tsx usa mockData.blogPosts (dados estáticos)
// em vez de sanityFetch + postSlugsQuery. A integração com Sanity ainda não foi
// feita nessa página. Quando for implementada, importar postSlugsQuery aqui e
// substituir o generateStaticParams atual.
// ─────────────────────────────────────────────────────────────────────────────

import { groq } from "next-sanity";

// ─── Hero Slides ────────────────────────────────────────────────────────────

export const heroSlidesQuery = groq`
  *[_type == "heroSlide" && active == true] | order(order asc) {
    _id,
    title,
    image,
    alt,
    linkType,
    internalPage,
    section,
    externalUrl,
    order,
    active
  }
`;

// ─── Blog Posts ──────────────────────────────────────────────────────────────

export const allPostsQuery = groq`
  *[_type == "post"] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    coverImage,
    "author": author->{ name, photo },
    publishedAt,
    category,
    tags,
    readingTime
  }
`;

export const postBySlugQuery = groq`
  *[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    coverImage,
    "author": author->{ name, photo },
    publishedAt,
    category,
    tags,
    readingTime,
    body
  }
`;

export const postSlugsQuery = groq`
  *[_type == "post" && defined(slug.current)] { "slug": slug.current }
`;

// ─── Espetáculos ─────────────────────────────────────────────────────────────

export const allEspetaculosQuery = groq`
  *[_type == "espetaculo"] | order(year desc) {
    _id,
    title,
    "slug": slug.current,
    year,
    venue,
    description,
    coverImage,
    featured
  }
`;

// ─── Site Settings ───────────────────────────────────────────────────────────

export const siteSettingsQuery = groq`
  *[_type == "siteSettings"][0] {
    phone, whatsapp, email, address,
    instagram, youtube, tiktok, facebook,
    googleMapsLink, footerTagline,
    seo { metaTitle, metaDescription, ogImage, keywords, noIndex, canonicalUrl }
  }
`;

// ─── Turmas ──────────────────────────────────────────────────────────────────

export const activeTurmasQuery = groq`
  *[_type == "turma" && active == true && status != "inactive"] | order(order asc) {
    _id, title, teacher, modality, ageGroup, schedule, duration,
    description, image, availableSpots, totalSpots, status, featured, order
  }
`;

export const featuredTurmasQuery = groq`
  *[_type == "turma" && active == true && featured == true && status != "inactive"] | order(order asc)[0...6] {
    _id, title, teacher, modality, ageGroup, schedule,
    image, availableSpots, totalSpots, status
  }
`;

// ─── Galeria ─────────────────────────────────────────────────────────────────

export const allGalleryAlbumsQuery = groq`
  *[_type == "galleryAlbum" && active == true] | order(order asc) {
    _id, title, "slug": slug.current, description,
    coverImage, category, year, featured, order,
    "photoCount": count(photos)
  }
`;

export const galleryAlbumBySlugQuery = groq`
  *[_type == "galleryAlbum" && slug.current == $slug && active == true][0] {
    _id, title, "slug": slug.current, description, category, year,
    photos[] { image, alt, caption, title }
  }
`;

export const featuredGalleryPhotosQuery = groq`
  *[_type == "galleryAlbum" && active == true && featured == true] | order(order asc)[0...3] {
    "photos": photos[0...8] { image, alt, caption }
  }
`;

// ─── Vídeos ──────────────────────────────────────────────────────────────────

export const activeVideosQuery = groq`
  *[_type == "videoEmbed" && active == true] | order(order asc) {
    _id, title, youtubeUrl, description, thumbnail, category, featured
  }
`;
