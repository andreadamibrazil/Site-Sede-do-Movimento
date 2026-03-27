import { defineField, defineType } from "sanity";
import { DocumentTextIcon } from "@sanity/icons";

export const postType = defineType({
  name: "post",
  title: "Blog Posts",
  type: "document",
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: "title",
      title: "Título",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug (URL)",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "category",
      title: "Categoria",
      type: "string",
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
      validation: (r) => r.required(),
    }),
    defineField({
      name: "author",
      title: "Autor",
      type: "reference",
      to: [{ type: "author" }],
    }),
    defineField({
      name: "coverImage",
      title: "Imagem de capa",
      type: "image",
      options: { hotspot: true },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Resumo",
      type: "text",
      rows: 3,
      description: "Aparece na listagem do blog e em redes sociais.",
      validation: (r) => r.required().max(200),
    }),
    defineField({
      name: "readingTime",
      title: "Tempo de leitura (minutos)",
      type: "number",
      initialValue: 3,
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "body",
      title: "Conteúdo",
      type: "array",
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
          ],
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
