import { NavItem } from "@/types";

export const navigationItems: NavItem[] = [
  {
    label: "A Escola",
    href: "/a-escola",
    children: [
      { label: "Por que existimos", href: "/a-escola/apresentacao" },
      { label: "Nossa história", href: "/a-escola/historia-e-estrutura" },
      { label: "Resultados", href: "/a-escola/resultados" },
      { label: "Parcerias", href: "/a-escola/parcerias" },
      { label: "Espetáculos", href: "/a-escola/espetaculos" },
      { label: "Projeto Social", href: "/a-escola/projeto-social" },
    ],
  },
  {
    label: "Ensino",
    href: "/ensino",
    children: [
      { label: "Equipe", href: "/ensino/equipe" },
      { label: "Modalidades", href: "/ensino/modalidades" },
      { label: "Metodologia", href: "/ensino/metodologia" },
      { label: "Jornadas Artísticas", href: "/ensino/jornadas-artisticas" },
      { label: "Formação Infantil", href: "/ensino/formacao-infantil" },
      { label: "Horários", href: "/ensino/horarios" },
      { label: "Eventos Extras", href: "/ensino/eventos-extras" },
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
  { label: "A Companhia", href: "/companhia-profissional" },
  { label: "A Produtora", href: "/produtora" },
  { label: "Audiovisual", href: "/audiovisual" },
  { label: "O Ateliê", href: "/atelier" },
  { label: "Contato", href: "/contato" },
  { label: "Blog", href: "/blog" },
];
