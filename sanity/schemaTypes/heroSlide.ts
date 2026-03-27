import { defineField, defineType } from "sanity";
import { ImageIcon } from "@sanity/icons";

// ─── Page options (editors pick — no typing) ──────────────────────────────
const PAGE_OPTIONS = [
  { title: "Página Inicial", value: "/" },
  { title: "A Escola", value: "/a-escola" },
  { title: "Nossa Apresentação", value: "/a-escola/apresentacao" },
  { title: "Nossa História", value: "/a-escola/historia-e-estrutura" },
  { title: "Espetáculos", value: "/a-escola/espetaculos" },
  { title: "Projeto Social", value: "/a-escola/projeto-social" },
  { title: "Ensino", value: "/ensino" },
  { title: "Jornadas Artísticas", value: "/ensino/jornadas-artisticas" },
  { title: "Horários e Turmas", value: "/ensino/horarios" },
  { title: "Nossa Equipe", value: "/ensino/equipe" },
  { title: "Metodologia", value: "/ensino/metodologia" },
  { title: "Formação Infantil", value: "/ensino/formacao-infantil" },
  { title: "Galerias", value: "/galerias" },
  { title: "Companhia Profissional", value: "/companhia-profissional" },
  { title: "A Produtora", value: "/produtora" },
  { title: "Audiovisual", value: "/audiovisual" },
  { title: "O Ateliê", value: "/atelier" },
  { title: "Contato", value: "/contato" },
  { title: "Trabalhe Conosco", value: "/contato/trabalhe-conosco" },
  { title: "Blog", value: "/blog" },
];

// ─── Section (anchor) options ─────────────────────────────────────────────
const SECTION_OPTIONS = [
  { title: "Nossa História (seção inicial)", value: "#historia" },
  { title: "Números da escola", value: "#stats" },
  { title: "Por que existimos", value: "#missao" },
  { title: "Jornadas Artísticas", value: "#jornadas" },
  { title: "Galeria de Fotos", value: "#galeria" },
  { title: "Metodologia", value: "#metodologia" },
  { title: "Espetáculos", value: "#espetaculos" },
  { title: "Blog", value: "#blog" },
  { title: "Entre em Contato", value: "#contato" },
];

export const heroSlideType = defineType({
  name: "heroSlide",
  title: "Slides do Hero",
  type: "document",
  icon: ImageIcon,
  fields: [
    // ── Identificação interna ──────────────────────────────────────────────
    defineField({
      name: "title",
      title: "Título (interno — só aparece aqui no painel)",
      type: "string",
      description: "Ajuda a identificar o slide. Ex: Arcanum 2026, Matrículas Abertas...",
      validation: (r) => r.required(),
    }),

    // ── Imagem ────────────────────────────────────────────────────────────
    defineField({
      name: "image",
      title: "Imagem do Slide",
      type: "image",
      options: { hotspot: true },
      description: "Tamanho ideal: 1920 × 880 px. O texto pode vir embutido na própria imagem.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "alt",
      title: "Descrição da imagem (acessibilidade e SEO)",
      type: "string",
      description: "Descreva o que aparece na imagem. Ex: Alunos no espetáculo Arcanum 2026",
      validation: (r) => r.required(),
    }),

    // ── Link ──────────────────────────────────────────────────────────────
    defineField({
      name: "linkType",
      title: "Ao clicar no slide…",
      type: "string",
      options: {
        list: [
          { title: "🚫  Sem link — slide não é clicável", value: "none" },
          { title: "📄  Ir para uma página do site", value: "page" },
          { title: "🔖  Rolar até uma seção da página inicial", value: "section" },
          { title: "🌐  Abrir URL externa", value: "external" },
        ],
        layout: "radio",
      },
      initialValue: "none",
      validation: (r) => r.required(),
    }),

    defineField({
      name: "internalPage",
      title: "Qual página?",
      type: "string",
      options: { list: PAGE_OPTIONS, layout: "dropdown" },
      description: "Selecione a página de destino.",
      hidden: ({ document }) => document?.linkType !== "page",
      validation: (r) =>
        r.custom((val, ctx) => {
          if (ctx.document?.linkType === "page" && !val) return "Selecione uma página.";
          return true;
        }),
    }),

    defineField({
      name: "section",
      title: "Qual seção?",
      type: "string",
      options: { list: SECTION_OPTIONS, layout: "dropdown" },
      description: "O visitante será rolado até essa seção na página inicial.",
      hidden: ({ document }) => document?.linkType !== "section",
      validation: (r) =>
        r.custom((val, ctx) => {
          if (ctx.document?.linkType === "section" && !val) return "Selecione uma seção.";
          return true;
        }),
    }),

    defineField({
      name: "externalUrl",
      title: "URL externa",
      type: "url",
      description: "Ex: https://instagram.com/sededomovimento",
      hidden: ({ document }) => document?.linkType !== "external",
      validation: (r) =>
        r.custom((val, ctx) => {
          if (ctx.document?.linkType === "external" && !val) return "Informe a URL.";
          return true;
        }),
    }),

    // ── Exibição ──────────────────────────────────────────────────────────
    defineField({
      name: "order",
      title: "Ordem de exibição",
      type: "number",
      description: "Menor número aparece primeiro. Ex: 1, 2, 3…",
      initialValue: 1,
      validation: (r) => r.required().min(1),
    }),
    defineField({
      name: "active",
      title: "Ativo no site",
      type: "boolean",
      description: "Desative para ocultar temporariamente sem excluir o slide.",
      initialValue: true,
    }),
  ],

  preview: {
    select: {
      title: "title",
      linkType: "linkType",
      internalPage: "internalPage",
      section: "section",
      externalUrl: "externalUrl",
      active: "active",
      media: "image",
    },
    prepare({ title, linkType, internalPage, section, externalUrl, active, media }) {
      const linkLabels: Record<string, string> = {
        none: "Sem link",
        page: internalPage ?? "—",
        section: section ?? "—",
        external: externalUrl ?? "—",
      };
      const status = active ? "" : " 🔴 Inativo";
      return {
        title: `${title}${status}`,
        subtitle: linkLabels[linkType ?? "none"],
        media,
      };
    },
  },

  orderings: [
    {
      title: "Ordem de exibição",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
});
