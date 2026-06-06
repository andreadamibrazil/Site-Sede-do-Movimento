export const ADMIN_EMAILS: string[] = (
  process.env.ADMIN_PROFESSOR_EMAILS ?? 'andreadami@sededomovimento.art,carlosfontinelle@sededomovimento.art'
)
  .split(',')
  .map(e => e.trim())
  .filter(Boolean)
