/**
 * Ponto de entrada da integração Sanity para as páginas Next.js.
 *
 * Use assim nas páginas:
 *   import { sanityFetch, urlFor } from "@/lib/sanity"
 *   import { heroSlidesQuery } from "@/lib/sanity/queries"
 */

export { client } from "@/sanity/lib/client";
export { urlFor } from "@/sanity/lib/image";
export { sanityFetch, SanityLive } from "@/sanity/lib/live";
