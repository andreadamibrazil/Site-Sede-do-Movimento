import { defineField, defineType } from "sanity";
import { StarIcon } from "@sanity/icons";

export const espetaculoType = defineType({
  name: "espetaculo",
  title: "Espetáculos",
  type: "document",
  icon: StarIcon,
  fields: [
    defineField({
      name: "title",
      title: "Título do espetáculo",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug (URL)",
      type: "slug",
      options: { source: "title" },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "year",
      title: "Ano",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "venue",
      title: "Teatro / Local",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "description",
      title: "Descrição",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "coverImage",
      title: "Imagem de capa",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "featured",
      title: "Em cartaz / Destaque",
      type: "boolean",
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "year",
      media: "coverImage",
    },
    prepare({ title, subtitle, media }) {
      return { title, subtitle: `${subtitle}`, media };
    },
  },
  orderings: [
    {
      title: "Ano (mais recente)",
      name: "yearDesc",
      by: [{ field: "year", direction: "desc" }],
    },
  ],
});
