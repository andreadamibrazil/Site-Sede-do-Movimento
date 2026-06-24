import { createClient, createServiceClient } from '@/lib/supabase/server'
import { callGemini } from '@/lib/gemini'
import { NextRequest, NextResponse } from 'next/server'

async function checkAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const service = createServiceClient()
  const { data: perfil } = await service
    .from('perfis_usuario')
    .select('perfil')
    .eq('id', user.id)
    .maybeSingle()
  if (!['admin', 'secretaria'].includes(perfil?.perfil ?? '')) return null
  return user
}

async function sendWA(numero: string, mensagem: string): Promise<boolean> {
  const num = numero.replace(/\D/g, '')
  const dest = numero.includes('@g.us') ? numero : (num.startsWith('55') ? num : `55${num}`)
  const evoUrl = (process.env.EVOLUTION_API_URL ?? '').trim()
  const evoKey = (process.env.EVOLUTION_API_KEY ?? '').trim()
  const evoInst = (process.env.EVOLUTION_INSTANCE ?? 'sede-movimento').trim()
  try {
    const res = await fetch(
      `${evoUrl}/message/sendText/${evoInst}`,
      {
        method: 'POST',
        headers: { apikey: evoKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: dest, text: mensagem }),
        signal: AbortSignal.timeout(10000),
      }
    )
    return res.ok
  } catch {
    return false
  }
}

function interpolar(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`)
}

export async function POST(req: NextRequest) {
  const user = await checkAuth()
  if (!user) return NextResponse.json({ error: 'acesso negado' }, { status: 403 })

  const body = await req.json()
  const { action } = body

  // ── MELHORAR MENSAGEM ─────────────────────────────────────────────
  if (action === 'melhorar') {
    const { mensagem } = body as { mensagem: string }
    const prompt = `Você é um assistente de comunicação da Sede do Movimento, uma escola de artes cênicas no Rio de Janeiro (dança, teatro e música).

Melhore esta mensagem de WhatsApp seguindo as regras abaixo:

FORMATAÇÃO (obrigatório):
- Use quebras de linha para separar saudação, corpo e encerramento — sem blocos de texto corrido
- Use *negrito* (asteriscos) para destacar informações importantes: data, local, nome do evento
- Emojis no início de linhas importantes para guiar o olhar
- Máximo 4-5 linhas de texto no total — mensagem curta e escaneável

CONTEÚDO:
- Linguagem calorosa, acolhedora e profissional
- Corrija erros gramaticais e ortográficos
- Mantenha EXATAMENTE as variáveis entre chaves {assim} sem alterá-las
- Não invente informações que não estão no original

Exemplo de formato ideal:
Olá, {nome}! 👋

🎉 *Sarau Copa na Roça* — não perca!
📅 *05/07*, às 16h
📍 Clube do Servidor Municipal

[corpo curto com 1-2 frases]

Até lá! 🌟

Mensagem original:
${mensagem}

Responda APENAS com a mensagem melhorada, sem explicações.`

    try {
      const resultado = await callGemini(prompt, { temperature: 0.4, maxOutputTokens: 800 })
      return NextResponse.json({ mensagem: resultado.trim() })
    } catch (e) {
      return NextResponse.json({ error: String(e) }, { status: 502 })
    }
  }

  // ── GERAR VARIAÇÕES ───────────────────────────────────────────────
  if (action === 'variacoes') {
    const { mensagem, quantidade = 3 } = body as { mensagem: string; quantidade?: number }
    const n = Math.min(Math.max(quantidade, 2), 5)

    const prompt = `Você é um assistente de comunicação da Sede do Movimento, uma escola de artes cênicas no Rio de Janeiro (dança, teatro e música).

Gere EXATAMENTE ${n} variações diferentes desta mensagem de WhatsApp.

FORMATAÇÃO obrigatória em TODAS as variações:
- Quebras de linha entre saudação, corpo e encerramento (sem parágrafos colados)
- *negrito* (asteriscos) em datas, nomes de eventos e informações-chave
- Emojis no início de linhas de destaque
- Texto curto e escaneável — máximo 5-6 linhas

CONTEÚDO: cada variação com tom ligeiramente diferente, mas todas devem:
- Ser calorosas, acolhedoras e profissionais
- Manter EXATAMENTE as variáveis {assim} sem alterá-las
- Preservar todas as informações do original (datas, links, locais)

Mensagem base:
${mensagem}

Responda APENAS com um array JSON onde cada elemento é uma string com \\n para quebras de linha: ["variação 1", "variação 2", ...]`

    try {
      const raw = await callGemini(prompt, { temperature: 0.8, maxOutputTokens: 2000 })
      const match = raw.match(/\[[\s\S]*\]/)
      if (!match) throw new Error('resposta fora do formato esperado')
      const variacoes: string[] = JSON.parse(match[0])
      return NextResponse.json({ variacoes: variacoes.slice(0, n) })
    } catch (e) {
      return NextResponse.json({ error: String(e) }, { status: 502 })
    }
  }

  // ── ENVIAR ────────────────────────────────────────────────────────
  if (action === 'enviar') {
    type Destinatario = {
      id: string
      tipo: 'numero' | 'grupo' | 'aluno'
      destino: string           // telefone ou groupId (@g.us)
      nome_aluno?: string
      nome_responsavel?: string
      turma?: string
      modalidade?: string
      mensagem_override?: string // variação específica para este destinatário (rotação)
    }

    const { mensagem, destinatarios, delay_ms = 0 } = body as {
      mensagem: string
      destinatarios: Destinatario[]
      delay_ms?: number
    }

    const results: Array<{ id: string; ok: boolean }> = []

    for (let i = 0; i < destinatarios.length; i++) {
      const d = destinatarios[i]
      const vars: Record<string, string> = {
        nome_aluno:       d.nome_aluno ?? '',
        nome_responsavel: d.nome_responsavel ?? '',
        turma:            d.turma ?? '',
        modalidade:       d.modalidade ?? '',
        nome:             d.nome_responsavel ?? d.nome_aluno ?? '',
      }
      const texto = interpolar(d.mensagem_override ?? mensagem, vars)
      const ok = await sendWA(d.destino, texto)
      results.push({ id: d.id, ok })

      if (i < destinatarios.length - 1 && delay_ms > 0) {
        await new Promise(r => setTimeout(r, delay_ms))
      }
    }

    return NextResponse.json({ results })
  }

  return NextResponse.json({ error: 'ação inválida' }, { status: 400 })
}
