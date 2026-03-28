import { defineField, defineType } from "sanity";
import { UsersIcon } from "@sanity/icons";

export const professorType = defineType({
  name: "professor",
  title: "Professores",
  type: "document",
  icon: UsersIcon,
  fields: [
    defineField({
      name: "name",
      title: "Nome completo",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "role",
      title: "Cargo / Função",
      type: "string",
      description: "Ex: Professora de Ballet, Diretor Artístico, Professor de Teatro",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "photo",
      title: "Foto",
      type: "image",
      options: { hotspot: true },
      description: "Foto do professor. Proporção quadrada recomendada.",
    }),
    defineField({
      name: "bio",
      title: "Bio",
      type: "text",
      rows: 4,
      description: "Breve descrição sobre formação e experiência. Aparece ao passar o mouse no site.",
    }),
    defineField({
      name: "specialties",
      title: "Especialidades",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      description: "Ex: Ballet Clássico, Jazz, Teatro. Adicione e pressione Enter.",
    }),
    defineField({
      name: "isDirector",
      title: "É direção artística?",
      type: "boolean",
      description: "Ative para destacar este membro como parte da direção artística.",
      initialValue: false,
    }),
    defineField({
      name: "active",
      title: "Ativo no site",
      type: "boolean",
      description: "Desative para ocultar sem precisar excluir.",
      initialValue: true,
    }),
    defineField({
      name: "order",
      title: "Ordem de exibição",
      type: "number",
      description: "Número menor aparece primeiro. Ex: 1 para o primeiro da lista.",
      initialValue: 99,
    }),
  ],
  orderings: [
    {
      title: "Ordem de exibição",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "role",
      media: "photo",
    },
  },
});
