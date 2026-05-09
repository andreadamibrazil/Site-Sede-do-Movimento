import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "../env";

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: process.env.NODE_ENV === "production",
  perspective: "published",
  stega: {
    // Ativo em dev e preview; desligado em produção (NODE_ENV é "production" em Vercel prod)
    enabled: process.env.NODE_ENV !== "production",
    studioUrl: "/studio",
  },
});
