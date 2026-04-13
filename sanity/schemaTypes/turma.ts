import { defineField, defineType } from "sanity";
import { UsersIcon } from "@sanity/icons";

const MODALITY_OPTIONS = [
  { title: "Ballet", value: "Ballet" },
  { title: "Jazz", value: "Jazz" },
  { title: "Sapateado", value: "Sapateado" },
  { title: "Danças Urbanas", value: "Danças Urbanas" },
  { title: "Dança Contemporânea", value: "Dança Contemporânea" },
  { title: "Teatro", value: "Teatro" },
  { title: "Música/Canto", value: "Música/Canto" },
  { title: "Circo", value: "Circo" },
];

const AGE_GROUP_OPTIONS = [
  { title: "2 a 4 anos", value: "2 a 4 anos" },
  { title: "4 a 6 anos", value: "4 a 6 anos" },
  { title: "6 a 9 anos", value: "6 a 9 anos" },
  { title: "9 a 12 anos", value: "9 a 12 anos" },
  { title: "12 a 15 anos", value: "12 a 15 anos" },
  { title: "15 a 18 anos", value: "15 a 18 anos" },
  { title: "Adultos (18+)", value: "Adultos (18+)" },
  { title: "Todas as idades", value: "Todas as idades" },
];

const STATUS_OPTIONS = [
  { title: "✅ Com vagas", value: "open" },
  { title: "⚠️ Últimas vagas", value: "few" },
  { title: "🔴 Turma cheia", value: "full" },
  { title: "📴 Inativa", value: "inactive" },
];

const STATUS_LABELS: Record<string, string> = {
  open: "✅ Com vagas",
  few: "⚠️ Últimas vagas",
  full: "🔴 Turma cheia",
  inactive: "📴 Inativa",
};

export const turmaType = defineType({
  name: "turma",
  title: "Turmas e Cursos",
  type: "document",
  icon: UsersIcon,
  fields: [
    // ── Identificação ─────────────────────────────────────────────────────────
    defineField({
      name: "title",
      title: "Nome da turma",
      type: "string",
      description: "Nome que identifica a turma. Ex: Ballet Infantil – Nível 1, Jazz Teen…",
      validation: (r) => r.required().error("O nome da turma é obrigatório."),
    }),
    defineField({
      name: "teacher",
      title: "Professor(a) responsável",
      type: "string",
      description: "Nome completo do(a) professor(a) que ministra as aulas desta turma.",
    }),

    // ── Modalidade e faixa etária ─────────────────────────────────────────────
    defineField({
      name: "modality",
      title: "Modalidade",
      type: "string",
      options: { list: MODALITY_OPTIONS, layout: "dropdown" },
      description: "Arte ou disciplina ensinada nesta turma.",
    }),
    defineField({
      name: "ageGroup",
      title: "Faixa etária",
      type: "string",
      options: { list: AGE_GROUP_OPTIONS, layout: "dropdown" },
      description: "Idade recomendada para os alunos desta turma.",
    }),

    // ── Horário ───────────────────────────────────────────────────────────────
    defineField({
      name: "dayOfWeek",
      title: "Dia(s) da semana",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Segunda-feira", value: "Segunda" },
          { title: "Terça-feira", value: "Terça" },
          { title: "Quarta-feira", value: "Quarta" },
          { title: "Quinta-feira", value: "Quinta" },
          { title: "Sexta-feira", value: "Sexta" },
          { title: "Sábado", value: "Sábado" },
        ],
      },
      description: "Selecione todos os dias em que esta turma ocorre.",
    }),
    defineField({
      name: "schedule",
      title: "Horário (ex: 16h – 17h)",
      type: "string",
      description: "Apenas o horário de início e fim. Ex: 16h – 17h30",
    }),
    defineField({
      name: "duration",
      title: "Duração da aula",
      type: "string",
      description: "Tempo de duração de cada aula. Ex: 1h30, 45min",
    }),

    // ── Descrição e imagem ────────────────────────────────────────────────────
    defineField({
      name: "description",
      title: "Descrição",
      type: "text",
      rows: 4,
      description: "Descrição da turma exibida no site. Descreva o conteúdo, objetivos e diferenciais.",
    }),
    defineField({
      name: "image",
      title: "Foto da turma",
      type: "image",
      options: { hotspot: true },
      description: "Foto representativa da turma ou modalidade. Tamanho ideal: 800 × 600 px.",
    }),

    // ── Vagas ─────────────────────────────────────────────────────────────────
    defineField({
      name: "availableSpots",
      title: "Vagas disponíveis",
      type: "number",
      description: "Número atual de vagas abertas. Atualize conforme as matrículas acontecem.",
    }),
    defineField({
      name: "totalSpots",
      title: "Total de vagas",
      type: "number",
      description: "Capacidade máxima de alunos nesta turma.",
    }),

    // ── Status ────────────────────────────────────────────────────────────────
    defineField({
      name: "status",
      title: "Status da turma",
      type: "string",
      options: { list: STATUS_OPTIONS, layout: "radio" },
      initialValue: "open",
      description: "Situação atual da turma. Aparece como indicador visual no site.",
      validation: (r) => r.required().error("Informe o status da turma."),
    }),

    // ── Exibição ──────────────────────────────────────────────────────────────
    defineField({
      name: "featured",
      title: "Destacar na homepage",
      type: "boolean",
      description: "Ative para exibir esta turma na seção de destaque da página inicial.",
      initialValue: false,
    }),
    defineField({
      name: "active",
      title: "Ativa no site",
      type: "boolean",
      description: "Desative para ocultar temporariamente a turma sem excluí-la.",
      initialValue: true,
    }),
    defineField({
      name: "order",
      title: "Ordem de exibição",
      type: "number",
      description: "Menor número aparece primeiro na listagem. Ex: 1, 2, 3…",
    }),
  ],

  preview: {
    select: {
      title: "title",
      teacher: "teacher",
      status: "status",
      media: "image",
    },
    prepare({ title, teacher, status, media }) {
      const statusLabel = STATUS_LABELS[status as string] ?? "";
      return {
        title,
        subtitle: [teacher, statusLabel].filter(Boolean).join(" · "),
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
