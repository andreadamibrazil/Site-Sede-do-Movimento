import { defineType, defineField } from "sanity";

export const legalPageType = defineType({
  name: "legalPage",
  title: "Páginas Legais",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Título",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug (URL)",
      type: "slug",
      options: { source: "title" },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "effectiveDate",
      title: "Data de vigência",
      type: "string",
      description: 'Ex: "16 de abril de 2026"',
    }),
    defineField({
      name: "content",
      title: "Conteúdo",
      type: "text",
      rows: 40,
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "effectiveDate" },
  },
});
