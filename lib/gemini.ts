// Azure OpenAI (créditos nonprofit) — substitui o Gemini pago.
// Mantém os nomes callGemini / callGeminiVision / generateWithFallback
// para que as rotas existentes não precisem mudar.
// Recurso: sede-openai (gpt-4o-mini). Env vars no Vercel:
//   AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_KEY, AZURE_OPENAI_DEPLOYMENT

const API_VERSION = '2024-10-21'

function getConfig() {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT
  const apiKey = process.env.AZURE_OPENAI_KEY
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT
  if (!endpoint || !apiKey || !deployment) {
    throw new Error('Azure OpenAI não configurado (AZURE_OPENAI_ENDPOINT/KEY/DEPLOYMENT)')
  }
  const base = endpoint.replace(/\/$/, '')
  const url = `${base}/openai/deployments/${deployment}/chat/completions?api-version=${API_VERSION}`
  return { url, apiKey }
}

type Message = { role: 'system' | 'user' | 'assistant'; content: unknown }

async function chamar(messages: Message[], maxTokens: number, temperature: number): Promise<string> {
  const { url, apiKey } = getConfig()
  let lastErr = ''
  // 1 tentativa + 2 retries para 429/5xx (rate limit ou indisponibilidade momentânea)
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
        body: JSON.stringify({ messages, max_tokens: maxTokens, temperature }),
      })
      if (res.status === 429 || res.status >= 500) {
        lastErr = `HTTP ${res.status}`
        continue
      }
      if (!res.ok) throw new Error(`Azure OpenAI HTTP ${res.status}: ${await res.text()}`)
      const data = await res.json()
      const text: string = data?.choices?.[0]?.message?.content ?? ''
      if (!text) { lastErr = 'resposta vazia'; continue }
      return text
    } catch (e: unknown) {
      lastErr = e instanceof Error ? e.message : String(e)
    }
  }
  throw new Error(`Azure OpenAI indisponível: ${lastErr}`)
}

export async function callGemini(
  prompt: string,
  opts: { model?: string; maxOutputTokens?: number; temperature?: number } = {}
): Promise<string> {
  const { maxOutputTokens = 1024, temperature = 0.2 } = opts
  return chamar([{ role: 'user', content: prompt }], maxOutputTokens, temperature)
}

// Mantém compatibilidade com rotas existentes (pauta/, etc.)
export async function generateWithFallback(prompt: string): Promise<string> {
  return callGemini(prompt)
}

/** Visão — analisa imagem em base64. gpt-4o-mini suporta apenas imagens (não PDF). */
export async function callGeminiVision(
  fileBase64: string,
  mimeType: string,
  prompt: string,
  opts: { model?: string; maxOutputTokens?: number } = {}
): Promise<string> {
  const { maxOutputTokens = 1024 } = opts
  if (!mimeType.startsWith('image/')) {
    throw new Error(`Azure OpenAI (gpt-4o-mini) só analisa imagens; tipo recebido: ${mimeType}`)
  }
  const messages: Message[] = [
    {
      role: 'user',
      content: [
        { type: 'text', text: prompt },
        { type: 'image_url', image_url: { url: `data:${mimeType};base64,${fileBase64}` } },
      ],
    },
  ]
  return chamar(messages, maxOutputTokens, 0.1)
}
