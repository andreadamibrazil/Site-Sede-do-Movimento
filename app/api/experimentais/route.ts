import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

async function checkAuth(req: NextRequest): Promise<NextResponse | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'não autenticado' }, { status: 401 })
  return null
}

// POST /api/experimentais — agenda experimental + notifica professor via WhatsApp
export async function POST(req: NextRequest) {
  const authErr = await checkAuth(req)
  if (authErr) return authErr
  const { lead_id, aula_id } = await req.json()
  if (!lead_id || !aula_id) return NextResponse.json({ error: 'lead_id e aula_id obrigatórios' }, { status: 400 })

  const supabase = await createClient()

  // Busca lead
  const { data: lead } = await supabase
    .from('leads')
    .select('nome, celular, modalidade_interesse')
    .eq('id', lead_id)
    .single()

  // Busca aula com professor e turma
  const { data: aula } = await supabase
    .from('aulas')
    .select('data, hora_inicio, hora_fim, turmas(nome), professores(nome, celular)')
    .eq('id', aula_id)
    .single()

  if (!lead || !aula) return NextResponse.json({ error: 'Lead ou aula não encontrado' }, { status: 404 })

  // Cria agendamento
  const { data: experimental, error } = await supabase
    .from('experimentais')
    .upsert({ lead_id, aula_id, status: 'agendado' }, { onConflict: 'lead_id,aula_id' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Atualiza status do lead
  await supabase.from('leads').update({ status: 'experimental_agendada' }).eq('id', lead_id)

  // Notifica professor via WhatsApp (BotConversa)
  const professor = aula.professores as any
  const turma = aula.turmas as any
  let notificou = false

  if (professor?.celular && process.env.BOTCONVERSA_API_KEY) {
    const celular = professor.celular.replace(/\D/g, '')
    const dataFormatada = new Date(aula.data + 'T12:00:00').toLocaleDateString('pt-BR', {
      weekday: 'long', day: '2-digit', month: 'long'
    })
    const mensagem = `Olá ${professor.nome}! 🎭\n\nVocê terá um *aluno experimental* na sua aula:\n\n👤 *${lead.nome}*\n📚 ${turma?.nome ?? 'Turma'}\n📅 ${dataFormatada}\n⏰ ${aula.hora_inicio?.slice(0,5)} – ${aula.hora_fim?.slice(0,5)}\n\nQualquer dúvida, fala com a secretaria. Obrigada! 🙏`

    try {
      const res = await fetch(`https://backend.botconversa.com.br/api/v1/subscriber/${celular}/send-message/`, {
        method: 'POST',
        headers: { 'API-KEY': process.env.BOTCONVERSA_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'text', message: mensagem }),
      })
      notificou = res.ok
    } catch (_) {}

    if (notificou) {
      await supabase.from('experimentais').update({ notificou_professor: true }).eq('id', experimental.id)
    }
  }

  return NextResponse.json({ ok: true, experimental, notificou_professor: notificou })
}

// PATCH /api/experimentais — atualiza status (presente/nao_compareceu)
// Se nao_compareceu → WhatsApp para o lead perguntando como foi
export async function PATCH(req: NextRequest) {
  const authErr = await checkAuth(req)
  if (authErr) return authErr
  const { id, status } = await req.json()
  if (!id || !status) return NextResponse.json({ error: 'id e status obrigatórios' }, { status: 400 })
  const STATUS_VALIDOS = ['agendado', 'presente', 'nao_compareceu', 'cancelado']
  if (!STATUS_VALIDOS.includes(status)) {
    return NextResponse.json({ error: `status inválido. Valores aceitos: ${STATUS_VALIDOS.join(', ')}` }, { status: 400 })
  }

  const supabase = await createClient()

  const { data: exp } = await supabase
    .from('experimentais')
    .update({ status })
    .eq('id', id)
    .select('lead_id, aula_id, leads(nome, celular), aulas(data, turmas(nome))')
    .single()

  // Se faltou → WhatsApp para o lead
  if (status === 'nao_compareceu' && process.env.BOTCONVERSA_API_KEY) {
    const lead = (exp as any)?.leads
    const aula = (exp as any)?.aulas
    const turma = aula?.turmas

    if (lead?.celular) {
      const celular = lead.celular.replace(/\D/g, '')
      const mensagem = `Olá ${lead.nome}! 💙\n\nNotamos que você não pôde comparecer à sua aula experimental de *${turma?.nome ?? 'dança'}* hoje.\n\nTudo bem? Ficamos à disposição para remarcar quando quiser! 😊\n\n— Sede do Movimento`

      try {
        await fetch(`https://backend.botconversa.com.br/api/v1/subscriber/${celular}/send-message/`, {
          method: 'POST',
          headers: { 'API-KEY': process.env.BOTCONVERSA_API_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'text', message: mensagem }),
        })
      } catch (_) {}
    }
  }

  return NextResponse.json({ ok: true })
}
