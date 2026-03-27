import { defineField, defineType } from "sanity";
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
