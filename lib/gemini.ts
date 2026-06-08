// Rotação automática entre todas as chaves Gemini free tier — build 2026-06-08
// 429/401/403 → pula para a próxima chave

const GEMINI_MODEL = 'gemini-2.5-flash'

function getKeys(): string[] {
  return [
    // André Principal + Fallbacks
    process.env.GOOGLE_AI_KEY,
    process.env.GOOGLE_AI_KEY_2,
    process.env.GOOGLE_AI_KEY_3,
    // Contas extras: Sede SDM, adam_ai, MoviRio, MoviRio_art, Secretaria
    process.env.GOOGLE_AI_KEY_4,
    process.env.GOOGLE_AI_KEY_5,
    process.env.GOOGLE_AI_KEY_6,
    process.env.GOOGLE_AI_KEY_7,
    process.env.GOOGLE_AI_KEY_8,
    // Aliases usados em scripts e cron
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_VIVA,
  ].filter(Boolean) as string[]
}

export async function callGemini(
  prompt: string,
  opts: { model?: string; maxOutputTokens?: number; temperature?: number } = {}
): Promise<string> {
  const { model = GEMINI_MODEL, maxOutputTokens = 1024, temperature = 0.2 } = opts
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`
  const keys = getKeys()
  if (!keys.length) throw new Error('Nenhuma chave Gemini configurada')

  let lastErr = ''
  for (let i = 0; i < keys.length; i++) {
    try {
      const res = await fetch(`${url}?key=${keys[i]}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature, maxOutputTokens },
        }),
      })
      if (res.status === 429 || res.status === 401 || res.status === 403) {
        lastErr = `HTTP ${res.status} (key ${i + 1})`
        continue
      }
      if (!res.ok) { lastErr = `HTTP ${res.status}`; continue }
      const data = await res.json()
      const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
      if (!text) { lastErr = 'resposta vazia'; continue }
      return text
    } catch (e: unknown) {
      lastErr = e instanceof Error ? e.message : String(e)
    }
  }
  throw new Error(`Gemini indisponível após ${keys.length} chaves: ${lastErr}`)
}

// Mantém compatibilidade com rotas existentes (pauta/, etc.)
export async function generateWithFallback(prompt: string): Promise<string> {
  return callGemini(prompt)
}
