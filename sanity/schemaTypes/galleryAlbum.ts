import { defineArrayMember, defineField, defineType } from "sanity";
import { ImagesIcon } from "@sanity/icons";

const CATEGORY_OPTIONS = [
  { title: "Espetáculos", value: "Espetáculos" },
  { title: "Bastidores", value: "Bastidores" },
  { title: "Aulas", value: "Aulas" },
  { title: "Eventos", value: "Eventos" },
  { title: "Formatura", value: "Formatura" },
  { title: "Competições", value: "Competições" },
  { title: "Institucional", value: "Institucional" },
];

export const galleryAlbumType = defineType({
  name: "galleryAlbum",
  title: "Álbuns de Galeria",
  type: "document",
  icon: ImagesIcon,
  fields: [
    // ── Identificação ─────────────────────────────────────────────────────────
    defineField({
      name: "title",
      title: "Título do álbum",
      type: "string",
      description: "Nome do álbum exibido na galeria. Ex: Arcanum 2025 – Bastidores",
      validation: (r) => r.required().error("O título do álbum é obrigatório."),
    }),
    defineField({
      name: "slug",
      title: "Slug (URL do álbum)",
      type: "slug",
      options: { source: "title" },
      description: "Gerado automaticamente a partir do título. Clique em 'Gerar' para criar.",
      validation: (r) => r.required().error("O slug é obrigatório para criar a URL do álbum."),
    }),
    defineField({
      name: "description",
      title: "Descrição",
      type: "text",
      rows: 3,
      description: "Texto opcional que aparece acima das fotos do álbum.",
    }),

    // ── Capa ──────────────────────────────────────────────────────────────────
    defineField({
      name: "coverImage",
      title: "Foto de capa",
      type: "image",
      options: { hotspot: true },
      description: "Foto principal exibida na listagem de álbuns. Escolha uma imagem impactante.",
      validation: (r) => r.required().error("Adicione uma foto de capa para o álbum."),
    }),

    // ── Classificação ─────────────────────────────────────────────────────────
    defineField({
      name: "category",
      title: "Categoria",
      type: "string",
      options: { list: CATEGORY_OPTIONS, layout: "dropdown" },
      description: "Classifica o álbum para facilitar a navegação na galeria.",
    }),
    defineField({
      name: "year",
      title: "Ano",
      type: "number",
      description: "Ano em que as fotos foram tiradas. Ex: 2026",
    }),

    // ── Fotos ─────────────────────────────────────────────────────────────────
    defineField({
      name: "photos",
      title: "Fotos do álbum",
      type: "array",
      description:
        "Arraste várias fotos de uma vez para adicionar em lote. Clique em cada uma depois para preencher a descrição (SEO).",
      options: {
        layout: "grid",
        // @ts-expect-error — editModal é suportado no Sanity Studio v3
        editModal: "popover",
      },
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "image",
              title: "Imagem",
              type: "image",
              options: { hotspot: true },
              validation: (r) => r.required().error("Adicione a imagem."),
            }),
            defineField({
              name: "alt",
              title: "Descrição da foto (SEO)",
              type: "string",
              description:
                "Descreva o que aparece na foto. Ex: Alunos de ballet no palco durante o espetáculo Arcanum.",
              // Aviso em vez de erro — permite upload rápido em lote
              validation: (r) =>
                r.warning("Recomendado para SEO e acessibilidade. Preencha após o upload em lote."),
            }),
            defineField({
              name: "caption",
              title: "Legenda visível na galeria",
              type: "text",
              rows: 2,
              description: "Texto exibido abaixo da foto na galeria. Opcional.",
            }),
            defineField({
              name: "title",
              title: "Título da foto",
              type: "string",
              description: "Título interno para identificar a foto. Opcional.",
            }),
          ],
          preview: {
            select: {
              title: "alt",
              subtitle: "caption",
              media: "image",
            },
            prepare({ title, subtitle, media }) {
              return {
                title: title ?? "Sem descrição",
                subtitle,
                media,
              };
            },
          },
        }),
      ],
    }),

    // ── Exibição ──────────────────────────────────────────────────────────────
    defineField({
      name: "active",
      title: "Ativo no site",
      type: "boolean",
      description: "Desative para ocultar o álbum sem excluí-lo.",
      initialValue: true,
    }),
    defineField({
      name: "featured",
      title: "Exibir na homepage",
      type: "boolean",
      description: "Ative para exibir este álbum na seção de galeria da página inicial.",
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
      year: "year",
      media: "coverImage",
    },
    prepare({ title, category, year, media }) {
      const parts = [category, year ? String(year) : undefined].filter(Boolean);
      return {
        title,
        subtitle: parts.join(" · "),
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
