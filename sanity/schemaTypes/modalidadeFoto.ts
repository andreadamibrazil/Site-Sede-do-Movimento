import { defineField, defineType } from "sanity";
import { ImageIcon } from "@sanity/icons";

const MODALIDADE_OPTIONS = [
  { title: "Ballet Clássico", value: "Ballet" },
  { title: "Jazz", value: "Jazz" },
  { title: "Sapateado", value: "Sapateado" },
  { title: "Danças Urbanas", value: "Danças Urbanas" },
  { title: "Contemporâneo", value: "Dança Contemporânea" },
  { title: "Teatro", value: "Teatro" },
  { title: "Canto", value: "Música/Canto" },
  { title: "Violão", value: "Violão" },
  { title: "Teclado", value: "Teclado" },
  { title: "Preparação para o Movimento", value: "Preparação" },
  { title: "Circo", value: "Circo" },
];

export const modalidadeFotoType = defineType({
  name: "modalidadeFoto",
  title: "Fotos de Modalidades",
  type: "document",
  icon: ImageIcon,
  fields: [
    defineField({
      name: "modalidade",
      title: "Modalidade",
      type: "string",
      options: { list: MODALIDADE_OPTIONS, layout: "dropdown" },
      description: "Escolha a modalidade à qual esta foto pertence.",
      validation: (r) => r.required().error("Selecione a modalidade."),
    }),
    defineField({
      name: "coverImage",
      title: "Foto da Modalidade",
      type: "image",
      options: { hotspot: true },
      description:
        "Foto exibida no card da modalidade. " +
        "Tamanho recomendado: 800 × 450 px (proporção 16:9). " +
        "Resolução mínima: 800 px de largura. " +
        "Formato: JPG ou PNG. " +
        "Use fotos com crianças em aula, movimento ou expressão artística.",
      validation: (r) => r.required().error("A foto é obrigatória."),
    }),
    defineField({
      name: "alt",
      title: "Descrição da imagem (acessibilidade)",
      type: "string",
      description:
        "Descreva brevemente o que aparece na foto. Ex: Alunos de ballet durante ensaio na Sede do Movimento.",
      validation: (r) => r.required().error("A descrição da imagem é obrigatória para acessibilidade."),
    }),
  ],

  preview: {
    select: {
      modalidade: "modalidade",
      media: "coverImage",
    },
    prepare({ modalidade, media }) {
      const label = MODALIDADE_OPTIONS.find((o) => o.value === modalidade)?.title ?? modalidade;
      return {
        title: label ?? "Modalidade não definida",
        subtitle: "Foto de modalidade",
        media,
      };
    },
  },

  orderings: [
    {
      title: "Modalidade (A–Z)",
      name: "modalidadeAsc",
      by: [{ field: "modalidade", direction: "asc" }],
    },
  ],
});
