import { defineField, defineType } from "sanity";
import { DocumentTextIcon } from "@sanity/icons";

export const postType = defineType({
  name: "post",
  title: "Blog Posts",
  type: "document",
  icon: DocumentTextIcon,
  groups: [
    { name: "content", title: "Conteúdo", default: true },
    { name: "seo", title: "SEO" },
    { name: "links", title: "Links e Citações" },
  ],
  fields: [
    // ─── Conteúdo ────────────────────────────────────────────────
    defineField({
      name: "title",
      title: "Título",
      type: "string",
      group: "content",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug (URL)",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      group: "content",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "category",
      title: "Categoria",
      type: "string",
      group: "content",
      options: {
        list: [
          { title: "Escola", value: "Escola" },
          { title: "Ensino", value: "Ensino" },
          { title: "Espetáculos", value: "Espetáculos" },
          { title: "Resultados", value: "Resultados" },
          { title: "Eventos", value: "Eventos" },
        ],
        layout: "radio",
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "publishedAt",
      title: "Data de publicação",
      type: "datetime",
      group: "content",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "author",
      title: "Autor",
      type: "reference",
      to: [{ type: "author" }],
      group: "content",
    }),
    defineField({
      name: "coverImage",
      title: "Imagem de capa (listagem e redes sociais)",
      type: "image",
      options: { hotspot: true },
      group: "content",
      description:
        "Exibida nos cards da listagem do blog e no compartilhamento em redes sociais. " +
        "Tamanho exato recomendado: 1200 × 630 px (proporção 1.91:1). " +
        "Resolução mínima: 800 px de largura. " +
        "Formato: JPG ou PNG. Peso máximo: 500 KB.",
      fields: [
        {
          name: "alt",
          type: "string",
          title: "Descrição da imagem (alt text SEO)",
          description: "Ex: Alunos da Sede do Movimento em aula de dança contemporânea, Rio de Janeiro.",
        },
        {
          name: "aiDescription",
          type: "text",
          title: "Descrição gerada por IA",
          description: "Gerada automaticamente com contexto da Sede do Movimento para SEO de imagem.",
          rows: 3,
        },
      ],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "heroImage",
      title: "Imagem de destaque (topo da postagem)",
      type: "image",
      options: { hotspot: true },
      group: "content",
      description:
        "Imagem exibida no topo da página da postagem, em largura total. " +
        "Tamanho exato recomendado: 1600 × 900 px (proporção 16:9).",
      fields: [
        {
          name: "alt",
          type: "string",
          title: "Descrição da imagem (acessibilidade e SEO)",
          description: "Ex: Espetáculo Arcanum 2025 da Sede do Movimento no Teatro João Caetano.",
        },
        {
          name: "aiDescription",
          type: "text",
          title: "Descrição gerada por IA",
          rows: 3,
        },
      ],
    }),
    defineField({
      name: "excerpt",
      title: "Resumo",
      type: "text",
      rows: 3,
      group: "content",
      description: "Aparece na listagem do blog e em redes sociais.",
      validation: (r) => r.required().max(200),
    }),
    defineField({
      name: "readingTime",
      title: "Tempo de leitura (minutos)",
      type: "number",
      group: "content",
      initialValue: 3,
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      group: "content",
    }),
    defineField({
      name: "body",
      title: "Conteúdo",
      type: "array",
      group: "content",
      of: [
        { type: "block" },
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            {
              name: "alt",
              type: "string",
              title: "Texto alternativo",
            },
            {
              name: "caption",
              type: "string",
              title: "Legenda",
            },
            {
              name: "aiDescription",
              type: "text",
              title: "Descrição IA",
              rows: 2,
            },
          ],
        },
      ],
    }),

    // ─── SEO ─────────────────────────────────────────────────────
    defineField({
      name: "seoTitle",
      title: "Título SEO",
      type: "string",
      group: "seo",
      description: "Se vazio, usa o título do post. Máx 60 caracteres. Ex: Espetáculo Arcanum 2025 | Sede do Movimento",
      validation: (r) => r.max(60),
    }),
    defineField({
      name: "seoDescription",
      title: "Meta description",
      type: "text",
      rows: 2,
      group: "seo",
      description: "Se vazia, usa o resumo. Entre 120–160 caracteres. Inclua 'Sede do Movimento' e localização.",
      validation: (r) => r.max(160),
    }),
    defineField({
      name: "ogImage",
      title: "Imagem OG (Open Graph)",
      type: "image",
      options: { hotspot: true },
      group: "seo",
      description: "Se vazia, usa a imagem de capa. 1200×630 px.",
    }),
    defineField({
      name: "noIndex",
      title: "Não indexar no Google",
      type: "boolean",
      group: "seo",
      initialValue: false,
      description: "Marque apenas para posts internos ou rascunhos temporários.",
    }),

    // ─── Links e Citações ─────────────────────────────────────────
    defineField({
      name: "instagramPost",
      title: "Link do post no Instagram",
      type: "url",
      group: "links",
      description: "Link direto para o post ou Reels relacionado no Instagram da Sede.",
    }),
    defineField({
      name: "youtubeVideo",
      title: "Link do vídeo no YouTube",
      type: "url",
      group: "links",
      description: "Link do vídeo relacionado no YouTube @sededomovimento.",
    }),
    defineField({
      name: "externalCitations",
      title: "Citações externas (onde fomos mencionados)",
      type: "array",
      group: "links",
      description: "Links de portais, jornais ou sites que citaram a Sede do Movimento neste contexto.",
      of: [
        {
          type: "object",
          fields: [
            { name: "label", type: "string", title: "Nome do veículo" },
            { name: "url", type: "url", title: "Link da matéria" },
          ],
          preview: {
            select: { title: "label", subtitle: "url" },
          },
        },
      ],
    }),
    defineField({
      name: "relatedInternalLinks",
      title: "Links internos relacionados",
      type: "array",
      group: "links",
      description: "Páginas do site relacionadas ao tema do post (turmas, espetáculos, galeria).",
      of: [
        {
          type: "object",
          fields: [
            { name: "label", type: "string", title: "Texto do link" },
            { name: "href", type: "string", title: "Caminho (ex: /ensino/modalidades)" },
          ],
          preview: {
            select: { title: "label", subtitle: "href" },
          },
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "category",
      media: "coverImage",
    },
  },
  orderings: [
    {
      title: "Data de publicação (mais recente)",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
});
