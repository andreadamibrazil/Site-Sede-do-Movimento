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
    imageMobile,
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
    heroImage,
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
    seo { metaTitle, metaDescription, ogImage, keywords, noIndex, canonicalUrl },
    imagens {
      homeHistoria, homeMissao, homeMetodologia,
      carlosFontinelle,
      espacoFotos[] { image, alt },
      apresentacaoFotos[] { image, alt },
      parcerias[] { logo, nome, url },
      atelierFigurinosFoto,
      vivaCiaFoto,
      produtoraFoto,
      projetoSocialFoto,
      formacaoInfantilFoto,
      youtubeChannelCover
    }
  }
`;

// ─── Turmas ──────────────────────────────────────────────────────────────────

export const activeTurmasQuery = groq`
  *[_type == "turma" && active == true && status != "inactive"] | order(order asc) {
    _id, title, teacher, modality, ageGroup, dayOfWeek, schedule, duration,
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
    photos[] {
      "img": @,
      "alt": coalesce(alt, ""),
      "caption": caption
    }
  }
`;

export const featuredGalleryPhotosQuery = groq`
  *[_type == "galleryAlbum" && active == true && featured == true] | order(order asc)[0...3] {
    "photos": photos[0...8] {
      "img": @,
      "alt": coalesce(alt, "")
    }
  }
`;

// Fotos de qualquer álbum ativo (sem exigir featured == true)
// Usado na homepage e na prévia de /galerias
export const recentGalleryPhotosQuery = groq`
  *[_type == "galleryAlbum" && active == true] | order(order asc)[0...6] {
    "photos": photos[0...4] {
      "img": @,
      "alt": coalesce(alt, "")
    }
  }
`;

// ─── Vídeos ──────────────────────────────────────────────────────────────────

export const activeVideosQuery = groq`
  *[_type == "videoEmbed" && active == true] | order(order asc) {
    _id, title, youtubeUrl, description, thumbnail, category, featured
  }
`;

// ─── Professores ─────────────────────────────────────────────────────────────

export const allProfessorsQuery = groq`
  *[_type == "professor" && active == true] | order(order asc) {
    _id, name, role, photo, bio, specialties, isDirector, order
  }
`;

// ─── Modalidades (fotos gerenciadas diretamente no Studio) ───────────────────

export const modalidadeImagesQuery = groq`
  *[_type == "modalidadeFoto"] {
    "modality": modalidade,
    "image": coverImage,
    "alt": alt
  }
`;

// ─── Galeria por Seção ────────────────────────────────────────────────────────
// Uso: sanityFetch({ query: gallerySectionPhotosQuery, params: { section: "resultados" } })
// Seções disponíveis: "resultados" | "eventos-extras" | "projeto-social" | "formacao-infantil"

export const gallerySectionPhotosQuery = groq`
  *[_type == "galleryAlbum" && active == true && $section in sections] | order(order asc) {
    "photos": photos[] {
      "img": @,
      "alt": coalesce(alt, "")
    }
  }
`;

// ─── Vídeo Institucional ──────────────────────────────────────────────────────

export const videoInstitucionalQuery = groq`
  *[_type == "videoEmbed" && category == "Institucional" && active == true] | order(order asc)[0] {
    title,
    youtubeUrl,
    description
  }
`;

// ─── SEO por Página ───────────────────────────────────────────────────────────

export const pageSeoQuery = groq`
  *[_type == "pageSeo" && pageId == $pageId][0] {
    seo {
      metaTitle,
      metaDescription,
      ogImage,
      keywords,
      noIndex,
      canonicalUrl
    }
  }
`;
