// ─────────────────────────────────────────────────────────────────────────────
//  HERO SLIDES — Configuração dos slides do banner principal
//
//  Como editar:
//  • Adicione um novo objeto { } no array heroSlides
//  • Coloque a imagem em: public/images/slides/nome-do-arquivo.jpg
//  • Defina o link para onde o slide deve levar
//  • Use enabled: false para ocultar um slide sem apagar
//  • Use order para controlar a ordem de exibição
//
//  No futuro, esses dados virão diretamente do Sanity CMS.
// ─────────────────────────────────────────────────────────────────────────────

export interface HeroSlide {
  id: string;
  /** Caminho da imagem em /public — ex: "/images/slides/slide-1.jpg"
   *  Deixe "" para exibir o placeholder cinza enquanto a foto não está pronta. */
  image: string;
  /** Onde o slide leva ao ser clicado.
   *  String vazia ou undefined = slide não é clicável. */
  link?: string;
  /** Texto alternativo para acessibilidade e SEO */
  alt: string;
  /** Número de ordem (menor = aparece primeiro) */
  order: number;
  /** true = visível, false = oculto */
  enabled: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
//  EDITE AQUI — adicione, remova ou reordene os slides
// ─────────────────────────────────────────────────────────────────────────────
export const heroSlides: HeroSlide[] = [
  {
    id: "arcanum-2026",
    image: "/images/slides/arcanum-2026.jpg",
    link: "/a-escola/espetaculos",
    alt: "Arcanum — Os Segredos da Humanidade · Teatro João Caetano 2026",
    order: 1,
    enabled: true,
  },
  {
    id: "matriculas-abertas",
    image: "/images/slides/matriculas-2026.jpg",
    link: "/ensino/jornadas-artisticas",
    alt: "Matrículas Abertas — Jornadas Artísticas 2026 · Dança, Teatro e Música",
    order: 2,
    enabled: true,
  },
  {
    id: "grupo-competicao",
    image: "/images/slides/grupo-competicao.jpg",
    link: "/a-escola/resultados",
    alt: "Grupo de Competição Campeão 2025 — 1° lugar em todos os festivais",
    order: 3,
    enabled: true,
  },
  {
    id: "institucional",
    image: "/images/slides/institucional.jpg",
    link: "/a-escola/apresentacao",
    alt: "Sede do Movimento — Arte, Movimento e Transformação desde 2021",
    order: 4,
    enabled: true,
  },
];
