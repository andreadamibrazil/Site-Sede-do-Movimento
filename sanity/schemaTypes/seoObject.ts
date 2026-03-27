import { defineField, defineType } from "sanity";
import { SearchIcon } from "@sanity/icons";

export const seoObjectType = defineType({
  name: "seoObject",
  title: "Configurações de SEO",
  type: "object",
  icon: SearchIcon,
  fields: [
    defineField({
      name: "metaTitle",
      title: "Título da página (SEO)",
      type: "string",
      description:
        "Substitui o título padrão nos resultados do Google. Deixe vazio para usar o título original da página. Ideal: até 60 caracteres.",
    }),
    defineField({
      name: "metaDescription",
      title: "Descrição da página (SEO)",
      type: "text",
      rows: 3,
      description:
        "Texto que aparece abaixo do título nos resultados do Google. Seja direto e atrativo. Máximo: 160 caracteres.",
      validation: (r) =>
        r.max(160).warning("A descrição deve ter no máximo 160 caracteres para aparecer completa no Google."),
    }),
    defineField({
      name: "ogImage",
      title: "Imagem para redes sociais (Open Graph)",
      type: "image",
      options: { hotspot: true },
      description:
        "Imagem exibida quando a página é compartilhada no WhatsApp, Facebook, Instagram etc. Tamanho ideal: 1200 × 630 px.",
    }),
    defineField({
      name: "keywords",
      title: "Palavras-chave",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      description:
        "Palavras que descrevem o conteúdo da página. Ex: dança, ballet, escola de artes. Adicione e pressione Enter.",
    }),
    defineField({
      name: "noIndex",
      title: "Ocultar do Google",
      type: "boolean",
      description:
        "Ative apenas se não quiser que esta página apareça nos resultados de busca. Na dúvida, deixe desativado.",
      initialValue: false,
    }),
    defineField({
      name: "canonicalUrl",
      title: "URL Canônica (avançado)",
      type: "url",
      description:
        "Informe apenas se esta página tiver conteúdo duplicado em outro endereço. Em geral, deixe em branco.",
    }),
  ],
  preview: {
    select: {
      title: "metaTitle",
      subtitle: "metaDescription",
    },
    prepare({ title, subtitle }) {
      return {
        title: title ?? "SEO sem título definido",
        subtitle: subtitle ?? "Sem descrição",
      };
    },
  },
});
