import { MetadataRoute } from "next";

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

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map(({ path, changeFrequency }) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency,
  }));
}
