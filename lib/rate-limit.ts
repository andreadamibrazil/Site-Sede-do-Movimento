// Rate limiting simples em memória — suficiente para uso interno de escola
// Para produção com alta escala, usar Upstash Redis

const hits = new Map<string, { count: number; reset: number }>()

export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = hits.get(key)

  if (!entry || now > entry.reset) {
    hits.set(key, { count: 1, reset: now + windowMs })
    return true // permitido
  }

  if (entry.count >= max) return false // bloqueado

  entry.count++
  return true // permitido
}

export function rateLimitResponse() {
  return new Response(JSON.stringify({ error: 'Muitas requisições. Tente novamente em alguns minutos.' }), {
    status: 429,
    headers: { 'Content-Type': 'application/json', 'Retry-After': '60' },
  })
}
