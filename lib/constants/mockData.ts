import { TeamMember, BlogPost, Stat, TimelineEntry, Photo, Espetaculo } from "@/types";

export const teamMembers: TeamMember[] = [
  { id: "carlos", name: "Carlos Fontinelle", role: "Diretor Artístico", bio: "Diretor de movimento e coreógrafo com mais de 20 anos de carreira. Trabalhou na Copa do Mundo FIFA 2014 e em produções da TV Globo. Fundador da Cia Vivá e diretor do MoviRio Festival.", specialties: ["Direção Artística", "Coreografia", "Dança Contemporânea"] },
  { id: "alessandra", name: "Alessandra Felix", role: "Professora de Dança", bio: "Especialista em ballet clássico e dança contemporânea com formação superior em Dança.", specialties: ["Ballet Clássico", "Dança Contemporânea"] },
  { id: "maju", name: "Maju Atty", role: "Professora de Jazz", bio: "Bailarina e educadora com vasta experiência em jazz americano e danças urbanas.", specialties: ["Jazz", "Danças Urbanas"] },
  { id: "amanda", name: "Amanda Simas", role: "Professora de Teatro", bio: "Atriz e diretora teatral com formação em artes cênicas pela UNIRIO.", specialties: ["Teatro", "Interpretação", "Dramaturgia"] },
  { id: "marcele", name: "Marcele Braga", role: "Professora de Sapateado", bio: "Especialista em sapateado americano e tap dance com participação em espetáculos nacionais.", specialties: ["Sapateado", "Tap Dance"] },
  { id: "douglas", name: "Douglas Arruda", role: "Professor de Música", bio: "Músico e professor de canto com formação em educação musical.", specialties: ["Canto", "Musicalização", "Teoria Musical"] },
  { id: "luiza", name: "Luiza Iulianello", role: "Professora de Dança", bio: "Bailarina clássica e contemporânea com experiência em companhias profissionais.", specialties: ["Ballet", "Contemporâneo"] },
  { id: "luise", name: "Luise Batista", role: "Professora de Dança Infantil", bio: "Especialista em educação somática e formação artística infantil.", specialties: ["Dança Infantil", "Educação Somática"] },
  { id: "mika", name: "Mika D. Oliveira", role: "Professora de Dança Urbana", bio: "Especialista em danças urbanas, street dance e hip hop.", specialties: ["Hip Hop", "Street Dance", "Breaking"] },
  { id: "natali", name: "Natali", role: "Professora Assistente", bio: "Bailarina e educadora em formação, especialista em jazz e dança contemporânea.", specialties: ["Jazz", "Contemporâneo"] },
  { id: "morvan", name: "Morvan Teixeira", role: "Professor de Teatro", bio: "Ator e professor com experiência em teatro físico e palhaçaria.", specialties: ["Teatro Físico", "Palhaçaria", "Improvisação"] },
  { id: "heitor", name: "Heitor", role: "Professor de Música", bio: "Músico e professor especializado em musicalização e percussão.", specialties: ["Percussão", "Musicalização"] },
];

export const stats: Stat[] = [
  { value: "650", label: "metros² de espaço", suffix: "m²" },
  { value: "5", label: "anos de história", suffix: "+" },
  { value: "300", label: "alunos ativos", suffix: "+" },
  { value: "1°", label: "lugar em festivais", suffix: "" },
];

export const timelineEntries: TimelineEntry[] = [
  { year: "2021", title: "Inauguração da Sede", description: "Em abril de 2021, a Sede do Movimento abre suas portas no Rio Comprido, em um casarão de mais de 650m², iniciando sua missão de transformar vidas através das artes cênicas." },
  { year: "2022", title: "Espetáculo Auto Peças", description: "Primeiro grande espetáculo anual no Teatro Imperator, marcando a consolidação da escola como referência artística no Rio de Janeiro." },
  { year: "2023", title: "Making Off — Teatro Cesgranrio", description: "Com casa lotada no Teatro Cesgranrio, o espetáculo 'Making Off' consolida a trajetória dos alunos e a qualidade pedagógica da escola." },
  { year: "2024", title: "Tempo Vivo — Teatro Fashion Mall", description: "Grande espetáculo no teatro Fashion Mall, com apresentações para toda a família e reconhecimento da mídia." },
  { year: "2025", title: "Grupo de Competição: 1° em todos os festivais", description: "O grupo de competições conquista o 1° lugar em todos os festivais que participou, incluindo o Festival de Dança de Caxias — Melhor Grupo 2025." },
  { year: "2026", title: "Arcanum — Teatro João Caetano", description: "O grandioso espetáculo 'Arcanum — Os Segredos da Humanidade' estreia no histórico Teatro João Caetano, marcando um novo patamar na trajetória da escola." },
];

export const blogPosts: BlogPost[] = [
  { slug: "bem-vindo-sede-do-movimento", title: "Bem-vindo à Sede do Movimento", excerpt: "Conheça nossa história, nossa missão e por que a arte é o caminho mais poderoso para o desenvolvimento humano.", coverImage: "/images/placeholder-blog-1.jpg", author: { name: "Carlos Fontinelle" }, publishedAt: "2026-01-15", tags: ["história", "missão", "arte"], category: "Escola", readingTime: 5 },
  { slug: "metodo-movimento-integrado", title: "O Método Movimento Integrado", excerpt: "Entenda como nossa metodologia única conecta corpo, emoção, criação e mundo para formar artistas completos.", coverImage: "/images/placeholder-blog-2.jpg", author: { name: "Carlos Fontinelle" }, publishedAt: "2026-02-10", tags: ["metodologia", "ensino", "pedagogia"], category: "Ensino", readingTime: 7 },
  { slug: "grupo-competicao-campeao-2025", title: "Grupo de Competição: Campeões 2025", excerpt: "Nosso grupo de competições conquistou o 1° lugar em todos os festivais que participou em 2025. Saiba como foi essa jornada.", coverImage: "/images/placeholder-blog-3.jpg", author: { name: "Redação Sede" }, publishedAt: "2025-12-20", tags: ["competição", "prêmios", "festival"], category: "Resultados", readingTime: 4 },
  { slug: "arcanum-estreia-teatro-joao-caetano", title: "Arcanum: estreia no Teatro João Caetano", excerpt: "O grandioso espetáculo que une dança, teatro e música em uma experiência inesquecível chega ao palco do histórico Teatro João Caetano.", coverImage: "/images/placeholder-blog-4.jpg", author: { name: "Redação Sede" }, publishedAt: "2026-03-01", tags: ["espetáculo", "teatro", "arcanum"], category: "Espetáculos", readingTime: 3 },
  { slug: "jornadas-artisticas-novas-turmas", title: "Novas turmas para as Jornadas Artísticas", excerpt: "Abrimos vagas para as 7 Jornadas Artísticas. Encontre a sua e comece sua formação em dança, teatro ou música.", coverImage: "/images/placeholder-blog-5.jpg", author: { name: "Redação Sede" }, publishedAt: "2026-02-28", tags: ["matrículas", "turmas", "jornadas"], category: "Ensino", readingTime: 3 },
  { slug: "sarau-musica-teatro-2025", title: "Sarau de Música e Teatro 2025", excerpt: "Um encontro emocionante que reuniu talentos de todas as turmas em apresentações de música e teatro. Veja os melhores momentos.", coverImage: "/images/placeholder-blog-6.jpg", author: { name: "Redação Sede" }, publishedAt: "2025-11-15", tags: ["sarau", "evento", "música", "teatro"], category: "Eventos", readingTime: 3 },
];

export const galleryPhotos: Photo[] = Array.from({ length: 12 }, (_, i) => ({
  src: `/images/placeholder-gallery-${(i % 4) + 1}.jpg`,
  alt: `Foto da galeria ${i + 1}`,
  caption: `Momento especial na Sede do Movimento`,
}));

export const espetaculos: Espetaculo[] = [
  { year: "2026", title: "Arcanum — Os Segredos da Humanidade", venue: "Teatro João Caetano", description: "Uma jornada épica pelos segredos da humanidade, unindo dança, teatro e música em uma experiência multissensorial única.", slug: "arcanum-2026" },
  { year: "2025", title: "Por Onde Flor", venue: "Teatro Cesgranrio", description: "Uma poética exploração sobre beleza, natureza e o florescimento humano.", slug: "por-onde-flor-2025" },
  { year: "2024", title: "Tempo Vivo", venue: "Teatro Fashion Mall", description: "Uma reflexão sobre tempo, memória e a efemeridade da vida através da dança.", slug: "tempo-vivo-2024" },
  { year: "2023", title: "Making Off", venue: "Teatro Cesgranrio", description: "Nos bastidores da criação artística, um espetáculo sobre processo, falha e transformação.", slug: "making-off-2023" },
  { year: "2022", title: "Auto Peças", venue: "Teatro Imperator", description: "Um mergulho na identidade urbana carioca, suas peças, contradições e potências.", slug: "auto-pecas-2022" },
];
