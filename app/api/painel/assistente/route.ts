import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Fallback entre as 3 chaves Gemini — evita erro de quota
const GEMINI_KEYS = [
  process.env.GOOGLE_AI_KEY,
  process.env.GOOGLE_AI_KEY_2,
  process.env.GOOGLE_AI_KEY_3,
].filter(Boolean) as string[]

async function chamarGemini(prompt: string): Promise<string> {
  let ultimoErro = ''
  for (const key of GEMINI_KEYS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.2, maxOutputTokens: 1024 },
          }),
        }
      )
      if (res.status === 429 || res.status === 403) { ultimoErro = `quota key${GEMINI_KEYS.indexOf(key) + 1}`; continue }
      if (!res.ok) { ultimoErro = `erro ${res.status}`; continue }
      const data = await res.json()
      return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Sem resposta.'
    } catch (e) { ultimoErro = String(e) }
  }
  throw new Error(`Gemini indisponível: ${ultimoErro}`)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function buscarContexto(sb: any, pergunta: string, isAdmin: boolean) {
  const p = pergunta.toLowerCase()
  const dados: Record<string, unknown> = {}

  // Resumo básico — sempre disponível
  const [{ count: ativos }, { count: inadimplentes }] = await Promise.all([
    sb.from('alunos').select('*', { count: 'exact', head: true }).eq('status_pedagogico', 'ativo'),
    sb.from('alunos').select('*', { count: 'exact', head: true }).eq('status_financeiro', 'inadimplente'),
  ])
  dados.resumo = { total_alunos_ativos: ativos, total_inadimplentes: inadimplentes }

  // Turmas e horários — disponível para todos
  if (p.includes('turma') || p.includes('aula') || p.includes('horário') || p.includes('horario') || p.includes('professor') || p.includes('modalidade')) {
    const { data } = await sb.from('turmas')
      .select('nome, modalidade_id, dia_semana, hora_inicio, hora_fim, professores(nome)')
      .not('status', 'eq', 'encerrada').limit(30)
    dados.turmas = data
  }

  // Chamadas pendentes — todos
  if (p.includes('chamada') || p.includes('presença') || p.includes('presenca') || p.includes('falta')) {
    const { data } = await sb.from('aulas')
      .select('data, status, chamada_concluida_em, turmas(nome)')
      .is('chamada_concluida_em', null)
      .gte('data', new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10))
      .limit(20)
    dados.chamadas_pendentes = data
  }

  // Alunos — todos
  if (p.includes('alun') || p.includes('matrícula') || p.includes('matricula')) {
    const { data } = await sb.from('alunos')
      .select('nome, status_pedagogico, status_financeiro, created_at')
      .order('created_at', { ascending: false }).limit(20)
    dados.alunos_recentes = data
  }

  // Preços e tabela — todos (secretaria precisa para orçamentos)
  if (p.includes('preço') || p.includes('preco') || p.includes('mensalidade') || p.includes('valor') || p.includes('plano') || p.includes('quanto')) {
    dados.tabela_precos = TABELA_PRECOS
  }

  // ── Financeiro — só admin ──
  if (!isAdmin) return dados

  if (p.includes('lead') || p.includes('captaç') || p.includes('prospect') || p.includes('quente') || p.includes('experimental')) {
    const { data } = await sb.from('leads')
      .select('nome, status, observacoes, created_at')
      .order('created_at', { ascending: false }).limit(30)
    dados.leads = data
  }

  if (p.includes('folha') || p.includes('salário') || p.includes('salario') || p.includes('pagamento')) {
    const { data } = await sb.from('folhas_pagamento')
      .select('mes_referencia, status, valor_total, professores(nome)')
      .order('mes_referencia', { ascending: false }).limit(20)
    dados.folhas_pagamento = data
  }

  if (p.includes('inadimp') || p.includes('devendo') || p.includes('atrasad')) {
    const { data } = await sb.from('alunos')
      .select('nome, celular, tentativas_contato')
      .eq('status_financeiro', 'inadimplente')
    dados.inadimplentes_detalhe = data
  }

  return dados
}

// Tabela de preços 2026 — Mensalidade e Plano Fidelidade (anual, pago em 12x)
// Aprovada em reunião 2026-05-31. Trimestral e Semestral eliminados.
const TABELA_PRECOS = [
  { combinacao: '1x/semana · 1h00',           mensalidade: 166.00, plano_fidelidade_12x: 135.00 },
  { combinacao: '1x/semana · 1h30',           mensalidade: 190.00, plano_fidelidade_12x: 153.50 },
  { combinacao: '2x/semana · 1h00',           mensalidade: 290.00, plano_fidelidade_12x: 230.00 },
  { combinacao: '1x/semana · 2h00',           mensalidade: 290.00, plano_fidelidade_12x: 230.00 },
  { combinacao: '2x/semana · 1h30',           mensalidade: 330.00, plano_fidelidade_12x: 266.50 },
  { combinacao: '3x/semana · 1h00',           mensalidade: 330.00, plano_fidelidade_12x: 266.50 },
  { combinacao: '3x/semana · 1h30',           mensalidade: 390.00, plano_fidelidade_12x: 314.50 },
  { combinacao: '4x/semana · 1h00',           mensalidade: 395.00, plano_fidelidade_12x: 318.50 },
  { combinacao: '4x/semana · 1h30',           mensalidade: 425.00, plano_fidelidade_12x: 342.50 },
  { combinacao: '5x/semana · 1h00',           mensalidade: 456.00, plano_fidelidade_12x: 366.00 },
  { combinacao: '5x/semana · 1h30',           mensalidade: 485.00, plano_fidelidade_12x: 391.00 },
]

export async function POST(req: NextRequest) {
  // Verificar autenticação e perfil
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'não autenticado' }, { status: 401 })

  const service = createServiceClient()
  const { data: perfil } = await service.from('perfis_usuario').select('perfil').eq('id', user.id).maybeSingle()
  const isAdmin = perfil?.perfil === 'admin'

  const { pergunta } = await req.json()
  if (!pergunta?.trim()) return NextResponse.json({ error: 'pergunta vazia' }, { status: 400 })

  const contexto = await buscarContexto(service, pergunta, isAdmin)

  const hoje = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const prompt = `Você é o assistente interno da Sede do Movimento, escola de artes cênicas no Rio de Janeiro.
Hoje é ${hoje}.
Perfil do usuário: ${isAdmin ? 'Administrador (acesso completo)' : 'Secretaria (sem acesso financeiro)'}

DADOS DO SISTEMA:
${JSON.stringify(contexto, null, 2)}

PERGUNTA:
${pergunta}

Responda em português, de forma direta e objetiva. Use números concretos. Se não houver dados suficientes, diga o que falta.`

  try {
    const resposta = await chamarGemini(prompt)
    return NextResponse.json({ resposta })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 503 })
  }
}
