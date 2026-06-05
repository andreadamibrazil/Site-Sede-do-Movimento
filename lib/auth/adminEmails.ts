// Emails com acesso admin no portal do professor.
// Configurável via env var ADMIN_PROFESSOR_EMAILS (separados por vírgula).
// Padrão: André e Carlos caso a env var não esteja definida.
export const ADMIN_EMAILS: string[] = (
  process.env.ADMIN_PROFESSOR_EMAILS
    ?? 'andreadami@sededomovimento.art,carlosfontinelle@sededomovimento.art'
).split(',').map(e => e.trim()).filter(Boolean)
