import { defineLive } from "next-sanity/live";
import { client } from "./client";

export const { sanityFetch, SanityLive } = defineLive({
  client: client.withConfig({
    // Token de leitura obrigatório para live updates funcionar
    // Gere em: sanity.io/manage → seu projeto → API → Tokens → Add API token (Viewer)
    // Depois adicione ao .env.local: SANITY_API_READ_TOKEN="seu-token-aqui"
    token: process.env.SANITY_API_READ_TOKEN,
  }),
});
