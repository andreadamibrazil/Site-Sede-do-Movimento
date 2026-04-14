import { defineArrayMember, defineField, defineType } from "sanity";
import { DocumentTextIcon } from "@sanity/icons";

export const siteSettingsType = defineType({
  name: "siteSettings",
  title: "Configurações do Site",
  type: "document",
  icon: DocumentTextIcon,
  // Singleton — apenas um documento deste tipo deve existir
  fields: [
    // ── Contato ───────────────────────────────────────────────────────────────
    defineField({
      name: "phone",
      title: "Telefone",
      type: "string",
      description: "Número de telefone exibido no site. Ex: (21) 9 9999-9999",
      placeholder: "(21) 9 9999-9999",
    }),
    defineField({
      name: "whatsapp",
      title: "Link do WhatsApp",
      type: "url",
      description:
        "Link completo para abrir conversa no WhatsApp. Ex: https://wa.me/5521999999999",
    }),
    defineField({
      name: "email",
      title: "E-mail de contato",
      type: "string",
      description: "Endereço de e-mail principal da escola. Ex: contato@sededomovimento.com.br",
    }),
    defineField({
      name: "address",
      title: "Endereço completo",
      type: "string",
      description:
        "Endereço físico da escola, exibido no rodapé e na página de contato. Ex: Rua das Flores, 100 – Botafogo, Rio de Janeiro – RJ",
    }),

    // ── Redes Sociais ─────────────────────────────────────────────────────────
    defineField({
      name: "instagram",
      title: "Instagram",
      type: "url",
      description: "Link completo do perfil. Ex: https://instagram.com/sededomovimento",
    }),
    defineField({
      name: "youtube",
      title: "YouTube",
      type: "url",
      description: "Link do canal no YouTube. Ex: https://youtube.com/@sededomovimento",
    }),
    defineField({
      name: "tiktok",
      title: "TikTok",
      type: "url",
      description: "Link do perfil no TikTok. Ex: https://tiktok.com/@sededomovimento",
    }),
    defineField({
      name: "facebook",
      title: "Facebook",
      type: "url",
      description: "Link da página no Facebook. Ex: https://facebook.com/sededomovimento",
    }),

    // ── Localização ───────────────────────────────────────────────────────────
    defineField({
      name: "googleMapsLink",
      title: "Link do Google Maps",
      type: "url",
      description:
        "Link para abrir a localização no Google Maps. Cole o link de compartilhamento do mapa.",
    }),

    // ── Rodapé ────────────────────────────────────────────────────────────────
    defineField({
      name: "footerTagline",
      title: "Frase do rodapé",
      type: "string",
      description:
        "Frase curta exibida no rodapé do site. Ex: Formando artistas e transformando vidas desde 2005.",
    }),

    // ── SEO Global ────────────────────────────────────────────────────────────
    defineField({
      name: "seo",
      title: "SEO do Site",
      type: "seoObject",
      description:
        "Configurações de SEO padrão para todo o site. Páginas individuais podem ter seu próprio SEO que sobrescreve estes valores.",
    }),

    // ── Imagens das Seções ────────────────────────────────────────────────────
    defineField({
      name: "imagens",
      title: "Imagens das Seções",
      type: "object",
      description:
        "Fotos usadas nas diversas seções do site. Substitua os placeholders cinzas aqui.",
      fields: [
        // Homepage
        defineField({
          name: "homeHistoria",
          title: "Homepage — Seção 'Nossa História'",
          type: "image",
          options: { hotspot: true },
          description: "Foto ao lado do texto 'Nossa história' na página inicial.",
        }),
        defineField({
          name: "homeMissao",
          title: "Homepage — Seção 'Por que existimos'",
          type: "image",
          options: { hotspot: true },
          description: "Foto ao lado do texto de missão na página inicial.",
        }),
        defineField({
          name: "homeMetodologia",
          title: "Homepage — Seção 'Metodologia'",
          type: "image",
          options: { hotspot: true },
          description: "Foto na seção Metodologia (fundo escuro).",
        }),
        // A Escola
        defineField({
          name: "carlosFontinelle",
          title: "Carlos Fontinelle — Foto Retrato",
          type: "image",
          options: { hotspot: true },
          description: "Foto usada na página 'Nossa História' ao lado da bio do Carlos.",
        }),
        defineField({
          name: "espacoFotos",
          title: "Fotos do Espaço (até 4)",
          type: "array",
          description:
            "Fotos das salas e instalações. Exibidas na seção 'Nossa Estrutura' (página Nossa História).",
          of: [
            defineArrayMember({
              type: "object",
              fields: [
                defineField({ name: "image", title: "Foto", type: "image", options: { hotspot: true } }),
                defineField({ name: "alt", title: "Descrição da foto (SEO)", type: "string" }),
              ],
              preview: { select: { title: "alt", media: "image" } },
            }),
          ],
        }),
        defineField({
          name: "apresentacaoFotos",
          title: "Fotos de Apresentação (até 4)",
          type: "array",
          description: "Grade de fotos no final da página 'Por que existimos'.",
          of: [
            defineArrayMember({
              type: "object",
              fields: [
                defineField({ name: "image", title: "Foto", type: "image", options: { hotspot: true } }),
                defineField({ name: "alt", title: "Descrição da foto (SEO)", type: "string" }),
              ],
              preview: { select: { title: "alt", media: "image" } },
            }),
          ],
        }),
        // Parcerias
        defineField({
          name: "parcerias",
          title: "Parceiros e Apoiadores",
          type: "array",
          description: "Logos dos parceiros. Exibidos na página 'Parcerias'.",
          of: [
            defineArrayMember({
              type: "object",
              fields: [
                defineField({ name: "logo", title: "Logo", type: "image", options: { hotspot: true } }),
                defineField({ name: "nome", title: "Nome do parceiro", type: "string" }),
                defineField({ name: "url", title: "Site (opcional)", type: "url" }),
              ],
              preview: {
                select: { title: "nome", media: "logo" },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                prepare({ title, media }: { title?: string; media?: any }) {
                  return { title: title ?? "Parceiro", media };
                },
              },
            }),
          ],
        }),
        // Atelier
        defineField({
          name: "atelierFigurinosFoto",
          title: "Ateliê Carlos Fontinelle — Foto Principal",
          type: "image",
          options: { hotspot: true },
          description: "Foto exibida na página do Ateliê de Moda Sustentável.",
        }),
        // Projetos e Parcerias
        defineField({
          name: "vivaCiaFoto",
          title: "Vivá Cia de Dança — Foto Principal",
          type: "image",
          options: { hotspot: true },
          description: "Foto exibida na página da Vivá Cia de Dança.",
        }),
        defineField({
          name: "produtoraFoto",
          title: "Fontinelle Criações — Foto Principal",
          type: "image",
          options: { hotspot: true },
          description: "Foto exibida na página da produtora Fontinelle Criações.",
        }),
        defineField({
          name: "projetoSocialFoto",
          title: "Sede de Aprender — Foto Principal",
          type: "image",
          options: { hotspot: true },
          description: "Foto exibida na página do Projeto Social.",
        }),
        defineField({
          name: "formacaoInfantilFoto",
          title: "Formação Infantil (Jornadas) — Foto Principal",
          type: "image",
          options: { hotspot: true },
          description: "Foto exibida na página de Jornadas Artísticas / Formação Infantil.",
        }),
        defineField({
          name: "youtubeChannelCover",
          title: "Canal YouTube — Capa / Logo",
          type: "image",
          options: { hotspot: true },
          description: "Imagem exibida no card do Canal YouTube na página de Galerias. Ideal: logo ou banner do canal (ex: 1280×720 px).",
        }),
      ],
    }),
  ],

  preview: {
    select: {
      title: "email",
      subtitle: "phone",
    },
    prepare({ title, subtitle }) {
      return {
        title: "Configurações do Site",
        subtitle: [subtitle, title].filter(Boolean).join(" · "),
      };
    },
  },
});
