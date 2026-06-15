// Rotação automática entre todas as chaves Gemini free tier
// AQ. keys → header x-goog-api-key | AIzaSy keys → ?key= param
// 429/401/403 → pula para a próxima chave

const GEMINI_MODEL = 'gemini-2.5-flash'

function getKeys(): string[] {
  return [
    process.env.GOOGLE_AI_KEY,
    process.env.GOOGLE_AI_KEY_2,
    process.env.GOOGLE_AI_KEY_3,
    process.env.GOOGLE_AI_KEY_4,
    process.env.GOOGLE_AI_KEY_5,
    process.env.GOOGLE_AI_KEY_6,
    process.env.GOOGLE_AI_KEY_7,
    process.env.GOOGLE_AI_KEY_8,
    process.env.GOOGLE_AI_KEY_9,
    process.env.GOOGLE_AI_KEY_10,
    // Aliases legados (cron scripts)
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_VIVA,
  ].filter(Boolean) as string[]
}

function makeRequest(url: string, apiKey: string, body: object): Promise<Response> {
  if (apiKey.startsWith('AQ.')) {
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify(body),
    })
  }
  return fetch(`${url}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
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
      const res = await makeRequest(url, keys[i], {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature, maxOutputTokens, thinkingConfig: { thinkingBudget: 0 } },
      })
      if (res.status === 429 || res.status === 401 || res.status === 403) {
        lastErr = `HTTP ${res.status} (key ${i + 1})`
        continue
      }
      if (!res.ok) { lastErr = `HTTP ${res.status}`; continue }
      const data = await res.json()
      // gemini-2.5-flash may return a thought part (thought:true) before the actual answer
      type Part = { thought?: boolean; text?: string }
      const parts: Part[] = data?.candidates?.[0]?.content?.parts ?? []
      const text: string = (parts.find(p => !p.thought)?.text ?? parts[0]?.text) ?? ''
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

/** Gemini Vision — analisa imagem ou PDF em base64 */
export async function callGeminiVision(
  fileBase64: string,
  mimeType: string,
  prompt: string,
  opts: { model?: string; maxOutputTokens?: number } = {}
): Promise<string> {
  const { model = GEMINI_MODEL, maxOutputTokens = 1024 } = opts
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`
  const keys = getKeys()
  if (!keys.length) throw new Error('Nenhuma chave Gemini configurada')

  const body = {
    contents: [{ parts: [{ inlineData: { mimeType, data: fileBase64 } }, { text: prompt }] }],
    generationConfig: { maxOutputTokens, temperature: 0.1, thinkingConfig: { thinkingBudget: 0 } },
  }

  let lastErr = ''
  for (let i = 0; i < keys.length; i++) {
    try {
      const res = await makeRequest(url, keys[i], body)
      if (res.status === 429 || res.status === 401 || res.status === 403) {
        lastErr = `HTTP ${res.status} (key ${i + 1})`
        continue
      }
      if (!res.ok) { lastErr = `HTTP ${res.status}`; continue }
      const data = await res.json()
      type Part = { thought?: boolean; text?: string }
      const parts: Part[] = data?.candidates?.[0]?.content?.parts ?? []
      const text: string = (parts.find(p => !p.thought)?.text ?? parts[0]?.text) ?? ''
      if (!text) { lastErr = 'resposta vazia'; continue }
      return text
    } catch (e: unknown) {
      lastErr = e instanceof Error ? e.message : String(e)
    }
  }
  throw new Error(`Gemini Vision indisponível após ${keys.length} chaves: ${lastErr}`)
}
