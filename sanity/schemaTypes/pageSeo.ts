import { defineField, defineType } from "sanity";
import { SearchIcon } from "@sanity/icons";

// All routable static pages on the site (excludes dynamic routes like /blog/[slug])
const PAGE_OPTIONS = [
  { title: "Página Inicial (/)", value: "home" },
  { title: "A Escola (/a-escola)", value: "a-escola" },
  { title: "A Escola › Apresentação", value: "a-escola/apresentacao" },
  { title: "A Escola › História e Estrutura", value: "a-escola/historia-e-estrutura" },
  { title: "A Escola › Resultados", value: "a-escola/resultados" },
  { title: "A Escola › Espetáculos", value: "a-escola/espetaculos" },
  { title: "A Escola › Parcerias", value: "a-escola/parcerias" },
  { title: "A Escola › Projeto Social", value: "a-escola/projeto-social" },
  { title: "Ensino (/ensino)", value: "ensino" },
  { title: "Ensino › Equipe", value: "ensino/equipe" },
  { title: "Ensino › Modalidades", value: "ensino/modalidades" },
  { title: "Ensino › Metodologia", value: "ensino/metodologia" },
  { title: "Ensino › Jornadas Artísticas", value: "ensino/jornadas-artisticas" },
  { title: "Ensino › Formação Infantil", value: "ensino/formacao-infantil" },
  { title: "Ensino › Horários", value: "ensino/horarios" },
  { title: "Ensino › Eventos Extras", value: "ensino/eventos-extras" },
  { title: "Ensino › Estrutura Pedagógica", value: "ensino/estrutura-pedagogica" },
  { title: "Galerias (/galerias)", value: "galerias" },
  { title: "Galerias › Fotos", value: "galerias/fotos" },
  { title: "Galerias › Vídeos (YouTube)", value: "galerias/youtube" },
  { title: "Blog (/blog)", value: "blog" },
  { title: "Companhia Profissional", value: "companhia-profissional" },
  { title: "Ateliê (/atelier)", value: "atelier" },
  { title: "Audiovisual (/audiovisual)", value: "audiovisual" },
  { title: "Produtora (/produtora)", value: "produtora" },
  { title: "Contato (/contato)", value: "contato" },
  { title: "Contato › Trabalhe Conosco", value: "contato/trabalhe-conosco" },
  { title: "Contato › Ouvidoria", value: "contato/ouvidoria" },
];

export const pageSeoType = defineType({
  name: "pageSeo",
  title: "SEO por Página",
  type: "document",
  icon: SearchIcon,
  fields: [
    defineField({
      name: "pageId",
      title: "Página",
      type: "string",
      options: {
        list: PAGE_OPTIONS,
        layout: "dropdown",
      },
      validation: (r) => r.required(),
      description: "Selecione qual página estas configurações de SEO se aplicam.",
    }),
    defineField({
      name: "seo",
      title: "Configurações de SEO",
      type: "seoObject",
    }),
  ],
  preview: {
    select: {
      pageId: "pageId",
      title: "seo.metaTitle",
      subtitle: "seo.metaDescription",
    },
    prepare({ pageId, title, subtitle }) {
      const page = PAGE_OPTIONS.find((p) => p.value === pageId);
      return {
        title: page?.title ?? pageId ?? "Sem página selecionada",
        subtitle: title ? `"${title}"` : subtitle ?? "SEO não configurado",
      };
    },
  },
  orderings: [
    {
      title: "Página (A-Z)",
      name: "pageAsc",
      by: [{ field: "pageId", direction: "asc" }],
    },
  ],
});
