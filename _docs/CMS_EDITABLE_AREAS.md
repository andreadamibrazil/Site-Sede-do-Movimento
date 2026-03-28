# CMS_EDITABLE_AREAS.md — Sede do Movimento

All content below is managed via Sanity CMS. **Do not hardcode any of it.**
Studio URL (dev): `http://localhost:3000/studio`
Studio URL (prod): `https://sededomovimento.com.br/studio`

---

## Content Types Overview

| Type | Sanity Name | Editor Manages | Query |
|---|---|---|---|
| Hero Slides | `heroSlide` | Homepage banner images | `heroSlidesQuery` |
| Blog Posts | `post` | News and articles | `allPostsQuery` |
| Blog Post (single) | `post` | Full article body | `postBySlugQuery` |
| Performances | `espetaculo` | Show history | `allEspetaculosQuery` |
| Classes | `turma` | Schedules and enrollment | `activeTurmasQuery` |
| Photo Albums | `galleryAlbum` | Photo galleries | `allGalleryAlbumsQuery` |
| Single Album | `galleryAlbum` | Photos inside album | `galleryAlbumBySlugQuery` |
| Videos | `videoEmbed` | YouTube embeds | `activeVideosQuery` |
| Site Settings | `siteSettings` | Footer, contacts, global SEO | `siteSettingsQuery` |

---

## 1. Hero Slides

**Schema:** `sanity/schemaTypes/heroSlide.ts`
**Used in:** `app/page.tsx` → `HeroSliderServer` → `HeroSlider`

Fields the editor controls:
- `image` — full-width image (ideal: 1920×880px)
- `alt` — required alt text (SEO)
- `linkType` — none / page / section / external
- `internalPage` — route path (e.g. `/ensino`)
- `externalUrl` — external link
- `order` — display order
- `active` — show/hide toggle

**AI rule:** Never replace the `HeroSliderServer` fetch with static images. The query filters `active == true` and orders by `order`.

---

## 2. Blog Posts

**Schema:** `sanity/schemaTypes/post.ts`
**Used in:** `app/blog/page.tsx`, `app/blog/[slug]/page.tsx`, `app/page.tsx` (preview)

Fields the editor controls:
- `title`, `slug` (auto-generated)
- `category` — Escola | Ensino | Espetáculos | Resultados | Eventos
- `publishedAt` — date/time
- `author` — reference to `author` type
- `coverImage` — required image (with alt)
- `excerpt` — max 200 chars
- `readingTime` — number (minutes)
- `tags` — string array
- `body` — rich text (blocks + inline images)

**Slug generation:** `app/blog/[slug]/page.tsx` uses `postSlugsQuery` for `generateStaticParams`.

**AI rule:** Never hardcode blog post content. The `/blog` page must derive all content from `allPostsQuery`.

---

## 3. Photo Galleries

**Schema:** `sanity/schemaTypes/galleryAlbum.ts`
**Used in:** `app/galerias/fotos/page.tsx`, `app/galerias/fotos/[albumSlug]/page.tsx`

Fields the editor controls:
- `title`, `slug`
- `description`
- `coverImage` — album thumbnail
- `category` — Espetáculos | Bastidores | Aulas | Eventos | Formatura | Competições | Institucional
- `year`
- `photos[]` — array of `{ image, alt, caption, title }`
- `active`, `featured`, `order`

**AI rule:** `photoCount` is projected in the query (not stored). Do not add a `photoCount` field to the schema.

---

## 4. Classes (Turmas)

**Schema:** `sanity/schemaTypes/turma.ts`
**Used in:** `app/ensino/horarios/page.tsx`, `app/ensino/modalidades/page.tsx`

Fields the editor controls:
- `title`, `teacher`
- `modality` — Ballet | Jazz | Sapateado | Danças Urbanas | Teatro | Música | Circo | Capoeira | Outros
- `ageGroup` — 2-4 | 4-6 | 6-9 | 9-12 | 12-15 | 15-18 | 18+ | all
- `schedule` — free text (e.g. "Terças e Quintas, 17h–18h30")
- `duration` — free text (e.g. "1h30")
- `description`
- `image`
- `availableSpots`, `totalSpots`
- `status` — **open** | **few** | **full** | **inactive**
- `featured`, `active`, `order`

**AI rule:** Status badge colors must follow the `TurmaStatus` enum in `lib/sanity/types.ts`. Do not add new statuses without updating both the schema and the type.

---

## 5. Videos

**Schema:** `sanity/schemaTypes/videoEmbed.ts`
**Used in:** `app/galerias/videos/page.tsx`, `app/galerias/youtube/page.tsx`

Fields the editor controls:
- `title`
- `youtubeUrl` — full YouTube URL
- `description`
- `thumbnail` — optional custom thumbnail (ideal: 1280×720px)
- `category` — Espetáculos | Bastidores | Aulas | Institucional | Eventos
- `active`, `featured`, `order`

**AI rule:** `YouTubeEmbed.tsx` extracts the video ID from the URL. Do not change the URL format assumption.

---

## 6. Performances (Espetáculos)

**Schema:** `sanity/schemaTypes/espetaculo.ts`
**Used in:** `app/a-escola/espetaculos/page.tsx`, `app/page.tsx` (preview)

Fields the editor controls:
- `title`, `slug`
- `year` — required
- `venue` — theater/location name
- `description`
- `coverImage`
- `featured` — appears on homepage preview

---

## 7. Site Settings (Footer, Contact, Global SEO)

**Schema:** `sanity/schemaTypes/siteSettings.ts`
**Type:** Singleton — only one document, no slug
**Used in:** `SiteFooter`, `app/layout.tsx` (SEO), all contact sections

Fields the editor controls:
- `phone`, `whatsapp`, `email`, `address`
- `instagram`, `youtube`, `tiktok`, `facebook`
- `googleMapsLink`
- `footerTagline`
- `seo` — nested `seoObject` (metaTitle, metaDescription, ogImage, keywords)

**AI rule:** Footer social links and contact info come from this singleton. `siteConfig.ts` in `lib/constants/` is a **fallback only** for when Sanity is unreachable — do not treat it as the primary source.

---

## 8. SEO Object (Reusable)

**Schema:** `sanity/schemaTypes/seoObject.ts`
**Used in:** `siteSettings` (embedded)

Fields:
- `metaTitle` — max 60 chars
- `metaDescription` — max 160 chars
- `ogImage` — 1200×630px
- `keywords` — tag array
- `noIndex` — boolean
- `canonicalUrl` — URL override

**AI rule:** Every page exports a `metadata` object. For pages with Sanity SEO data, merge the Sanity fields into Next.js metadata. Never remove the `export const metadata` or `export async function generateMetadata` from page files.

---

## Analytics — Do Not Touch

`lib/analytics.ts` exposes:
```typescript
trackEvent(options)          // base tracker
trackWhatsAppClick(source, page)
trackHeroClick(slideAlt)
trackGalleryOpen(imageName)
trackCTAClick(label, source, page)
```

- These functions call `window.gtag` (GA4) and `window.dataLayer.push` (GTM)
- GTM is injected by `components/analytics/GoogleTagManager.tsx`
- Both must remain in `app/layout.tsx`
- Do not rename or remove these functions — they may be referenced in GTM triggers

---

## Adding New CMS Content Type — Checklist

1. Create schema file in `sanity/schemaTypes/new-type.ts`
2. Register it in `sanity/schemaTypes/index.ts`
3. Add GROQ query in `lib/sanity/queries.ts`
4. Add TypeScript interface in `lib/sanity/types.ts`
5. Create page/component that fetches with `sanityFetch`
6. Add route to `app/sitemap.ts` if publicly indexed
