import { defineField, defineType } from "sanity";
import { PlayIcon } from "@sanity/icons";

const CATEGORY_OPTIONS = [
  { title: "Espetáculos", value: "Espetáculos" },
  { title: "Bastidores", value: "Bastidores" },
  { title: "Aulas", value: "Aulas" },
  { title: "Institucional", value: "Institucional" },
  { title: "Eventos", value: "Eventos" },
];

export const videoEmbedType = defineType({
  name: "videoEmbed",
  title: "Vídeos",
  type: "document",
  icon: PlayIcon,
  fields: [
    // ── Identificação ─────────────────────────────────────────────────────────
    defineField({
      name: "title",
      title: "Título do vídeo",
      type: "string",
      description: "Nome do vídeo exibido no site. Ex: Arcanum 2025 – Apresentação completa",
      validation: (r) => r.required().error("O título do vídeo é obrigatório."),
    }),

    // ── URL do YouTube ────────────────────────────────────────────────────────
    defineField({
      name: "youtubeUrl",
      title: "URL do YouTube",
      type: "url",
      description:
        "Cole o link completo do vídeo no YouTube. Ex: https://youtube.com/watch?v=XXXXXXXXXXX — Funciona com links normais e links encurtados (youtu.be).",
      validation: (r) =>
        r
          .required()
          .error("Informe o link do YouTube.")
          .uri({ scheme: ["http", "https"] }),
    }),

    // ── Descrição ─────────────────────────────────────────────────────────────
    defineField({
      name: "description",
      title: "Descrição",
      type: "text",
      rows: 3,
      description: "Texto opcional exibido abaixo do vídeo ou em listagens.",
    }),

    // ── Thumbnail ─────────────────────────────────────────────────────────────
    defineField({
      name: "thumbnail",
      title: "Thumbnail personalizada (opcional)",
      type: "image",
      options: { hotspot: true },
      description:
        "Imagem de capa usada antes de carregar o vídeo. Se não informada, será usada a thumbnail padrão do YouTube. Tamanho ideal: 1280 × 720 px.",
    }),

    // ── Classificação ─────────────────────────────────────────────────────────
    defineField({
      name: "category",
      title: "Categoria",
      type: "string",
      options: { list: CATEGORY_OPTIONS, layout: "dropdown" },
      description: "Classifica o vídeo para facilitar a navegação.",
    }),

    // ── Exibição ──────────────────────────────────────────────────────────────
    defineField({
      name: "active",
      title: "Ativo no site",
      type: "boolean",
      description: "Desative para ocultar o vídeo sem excluí-lo.",
      initialValue: true,
    }),
    defineField({
      name: "featured",
      title: "Exibir em destaque",
      type: "boolean",
      description: "Ative para destacar este vídeo na seção principal de vídeos.",
      initialValue: false,
    }),
    defineField({
      name: "order",
      title: "Ordem de exibição",
      type: "number",
      description: "Menor número aparece primeiro. Ex: 1, 2, 3…",
    }),
  ],

  preview: {
    select: {
      title: "title",
      category: "category",
      media: "thumbnail",
    },
    prepare({ title, category, media }) {
      return {
        title,
        subtitle: category ?? "Sem categoria",
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
