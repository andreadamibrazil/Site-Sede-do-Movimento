import { type SchemaTypeDefinition } from "sanity";
import { heroSlideType } from "./heroSlide";
import { authorType } from "./author";
import { postType } from "./post";
import { espetaculoType } from "./espetaculo";
import { seoObjectType } from "./seoObject";
import { siteSettingsType } from "./siteSettings";
import { turmaType } from "./turma";
import { galleryAlbumType } from "./galleryAlbum";
import { videoEmbedType } from "./videoEmbed";
import { professorType } from "./professor";
import { pageSeoType } from "./pageSeo";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    // ── Objetos reutilizáveis (type: "object") ──────────────────────────────
    seoObjectType,

    // ── Documentos globais / singleton ──────────────────────────────────────
    siteSettingsType,
    pageSeoType,

    // ── Conteúdo editorial ──────────────────────────────────────────────────
    heroSlideType,
    espetaculoType,
    turmaType,
    galleryAlbumType,
    videoEmbedType,
    professorType,

    // ── Blog ────────────────────────────────────────────────────────────────
    authorType,
    postType,
  ],
};
