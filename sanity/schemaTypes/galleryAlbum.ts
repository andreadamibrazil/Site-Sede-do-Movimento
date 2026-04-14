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
    // Fluxo recomendado: faça upload em batch pela Media Library (menu lateral),
    // depois volte aqui e selecione múltiplas fotos de uma vez.
    // Alt e legenda ficam disponíveis clicando em cada foto individualmente.
    defineField({
      name: "photos",
      title: "Fotos do álbum",
      type: "array",
      description:
        "Use a Media Library (menu lateral) para subir fotos em lote. Depois clique em '+ Adicionar item' e selecione várias de uma vez. Clique em cada foto para adicionar alt text e legenda.",
      options: { layout: "grid" },
      of: [
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Descrição da foto (SEO / acessibilidade)",
              type: "string",
              description: "Ex: Alunos de ballet no palco durante o espetáculo Arcanum 2025.",
              validation: (r) => r.warning("Recomendado para SEO e acessibilidade."),
            }),
            defineField({
              name: "caption",
              title: "Legenda",
              type: "string",
              description: "Texto opcional exibido sobre a foto na galeria.",
            }),
          ],
        }),
      ],
    }),

    // ── Seções do site ────────────────────────────────────────────────────────
    defineField({
      name: "sections",
      title: "Usar fotos deste álbum nas seções",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Resultados / Conquistas", value: "resultados" },
          { title: "Eventos Extras", value: "eventos-extras" },
          { title: "Projeto Social", value: "projeto-social" },
          { title: "Formação Infantil / Jornadas", value: "formacao-infantil" },
        ],
        layout: "grid",
      },
      description:
        "As fotos deste álbum aparecerão automaticamente nas seções marcadas. Você pode marcar um mesmo álbum para várias seções.",
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
