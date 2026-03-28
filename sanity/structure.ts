import type { StructureResolver } from "sanity/structure";
import { CogIcon, ImagesIcon, PlayIcon, PresentationIcon, DocumentTextIcon, UsersIcon } from "@sanity/icons";

// ─── Custom Studio Sidebar ────────────────────────────────────────────────────
// Organizes documents into logical groups for non-technical editors.

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Sede do Movimento")
    .items([
      // ── Site Settings (singleton) ─────────────────────────────────────────
      S.listItem()
        .title("⚙️  Configurações do Site")
        .icon(CogIcon)
        .child(
          S.document()
            .schemaType("siteSettings")
            .documentId("siteSettings")
            .title("Configurações do Site")
        ),

      S.divider(),

      // ── Hero Slider ───────────────────────────────────────────────────────
      S.listItem()
        .title("🖼️  Slides do Banner")
        .icon(ImagesIcon)
        .child(S.documentTypeList("heroSlide").title("Slides do Banner Principal")),

      // ── Gallery ───────────────────────────────────────────────────────────
      S.listItem()
        .title("📷  Galerias de Fotos")
        .icon(ImagesIcon)
        .child(S.documentTypeList("galleryAlbum").title("Álbuns de Galeria")),

      // ── Videos ────────────────────────────────────────────────────────────
      S.listItem()
        .title("▶️  Vídeos")
        .icon(PlayIcon)
        .child(S.documentTypeList("videoEmbed").title("Vídeos do YouTube")),

      S.divider(),

      // ── Ensino ────────────────────────────────────────────────────────────
      S.listItem()
        .title("🎓  Turmas e Cursos")
        .icon(UsersIcon)
        .child(S.documentTypeList("turma").title("Turmas e Cursos")),

      // ── Professores ───────────────────────────────────────────────────────
      S.listItem()
        .title("👩‍🏫  Professores")
        .icon(UsersIcon)
        .child(S.documentTypeList("professor").title("Professores e Equipe")),

      // ── Espetáculos ───────────────────────────────────────────────────────
      S.listItem()
        .title("🎭  Espetáculos")
        .icon(PresentationIcon)
        .child(S.documentTypeList("espetaculo").title("Espetáculos")),

      S.divider(),

      // ── Blog ──────────────────────────────────────────────────────────────
      S.listItem()
        .title("✍️  Blog")
        .icon(DocumentTextIcon)
        .child(
          S.list()
            .title("Blog")
            .items([
              S.listItem()
                .title("Posts")
                .child(S.documentTypeList("post").title("Posts do Blog")),
              S.listItem()
                .title("Autores")
                .child(S.documentTypeList("author").title("Autores")),
            ])
        ),
    ]);
