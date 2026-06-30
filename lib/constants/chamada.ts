export const TOLERANCIA_PROFESSOR_MINUTOS = 10080 // 7 dias corridos após o fim da aula
// Após esse prazo, só admin/secretaria/coordenação pode ajustar a chamada.

// Prazo para o professor repor uma aula em que faltou (a partir da data da aula).
// Política mostrada ao professor = 30 dias. Mantém cron e UI em sincronia.
export const PRAZO_REPOSICAO_DIAS = 30
