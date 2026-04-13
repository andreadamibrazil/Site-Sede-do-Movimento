export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-03-24'

// Usa o valor da env var quando disponível; fallback para o valor do projeto
// evita que o build do Vercel quebre no estágio "Collecting page data"
// quando process.env ainda não está totalmente populado (ex: /_not-found)
export const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

export const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'jjdv6wy3'
