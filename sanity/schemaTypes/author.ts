import { defineField, defineType } from "sanity";
import { UserIcon } from "@sanity/icons";

export const authorType = defineType({
  name: "author",
  title: "Autores",
  type: "document",
  icon: UserIcon,
  fields: [
    defineField({
      name: "name",
      title: "Nome",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "photo",
      title: "Foto",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "bio",
      title: "Bio",
      type: "text",
      rows: 3,
    }),
  ],
  preview: {
    select: { title: "name", media: "photo" },
  },
});
