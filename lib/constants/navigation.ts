import { NavItem } from "@/types";

export const navigationItems: NavItem[] = [
  {
    label: "A Escola",
    href: "/a-escola",
    children: [
      { label: "Por que existimos", href: "/a-escola/apresentacao" },
      { label: "Nossa história", href: "/a-escola/historia-e-estrutura" },
      { label: "Resultados", href: "/a-escola/resultados" },
      // { label: "Parcerias", href: "/a-escola/parcerias" }, // hidden temporariamente
      { label: "Espetáculos", href: "/a-escola/espetaculos" },
      { label: "Projeto Social", href: "/a-escola/projeto-social" },
      { label: "Vídeo Institucional", href: "/a-escola/video-institucional" },
      { label: "Equipe", href: "/ensino/equipe" },
    ],
  },
  {
    label: "Ensino",
    href: "/ensino",
    children: [
      { label: "Horários e Vagas", href: "/ensino/horarios" },
      { label: "Metodologia", href: "/ensino/metodologia" },
      { label: "Jornadas Artísticas", href: "/ensino/jornadas-artisticas" },
      { label: "Formação Infantil", href: "/ensino/formacao-infantil" },
      { label: "Eventos Extras", href: "/ensino/eventos-extras" },
    ],
  },
  {
    label: "Modalidades",
    href: "/ensino/modalidades",
  },
  {
    label: "Projetos",
    href: "/companhia-profissional",
    children: [
      { label: "A Companhia", href: "/companhia-profissional" },
      { label: "A Produtora", href: "/produtora" },
      { label: "Audiovisual", href: "/audiovisual" },
      { label: "O Ateliê", href: "/atelier" },
    ],
  },
  {
    label: "Galerias",
    href: "/galerias",
    children: [
      { label: "Fotos", href: "/galerias/fotos" },
      { label: "Vídeos", href: "/galerias/videos" },
      { label: "Canal YouTube", href: "/galerias/youtube" },
    ],
  },
  { label: "Blog", href: "/blog" },
  { label: "Contato", href: "/contato" },
];
