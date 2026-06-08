import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Cron a cada 5 minutos — dispara WhatsApp para professor + secretaria
// quando chamada não foi lançada após o fim da aula.
//
// Tom: cuidado com o aluno e benefício do professor — sem linguagem de desconto.
//
// Sequência:
//   -5 min  → professor: lembrete gentil
//   0 min   → secretaria: alerta imediato / professor: importância da chamada + email de login
//   +2h     → professor: impacto no aluno + crescimento da turma
//   +1 dia  → professor: secretaria acompanhando, pede regularização
//   +2 dias → professor: pedido de contato com secretaria

// Número da secretaria (env var, pode ter vários separados por vírgula)
const CELULARES_SECRETARIA = (process.env.CELULAR_SECRETARIA ?? '').split(',').filter(Boolean)

const MSG_PROFESSOR: Record<string, (p: string, t: string, h: string, email?: string) => string> = {
  antes_5min: (p, t, h, email) =>
    `Olá ${p}! 📋\n\nSua aula de *${t}* (${h}) está quase no fim.\n\nLance a chamada logo que terminar — leva menos de 1 minuto e faz toda a diferença para os seus alunos! 🙌\n\nAcesse com: *${email ?? 'seu email cadastrado'}*\nsededomovimento.art/professor`,

  apos_0min: (p, t, h, email) =>
    `Olá ${p}! ⏰\n\nSua aula de *${t}* (${h}) acabou de terminar.\n\nPor favor lance a chamada agora. Isso é muito importante:\n\n• A família acompanha a presença do aluno em tempo real\n• Faltas sem registro prejudicam o histórico e o boletim do aluno\n• Sua turma engajada cresce — e isso é bom para você e para a Sede 💪\n\nAcesse com: *${email ?? 'seu email cadastrado'}*\nsededomovimento.art/professor`,

  apos_2h: (p, t, h, email) =>
    `${p}, a chamada de *${t}* (${h}) ainda não foi lançada. ⚠️\n\nSabemos que a rotina é corrida, mas registrar a presença dos alunos é fundamental:\n\n• Os responsáveis dependem disso para acompanhar os filhos\n• Faltas recorrentes são um sinal de que o aluno precisa de atenção\n• Quanto mais sua turma cresce e engaja, mais reconhecemos isso no seu valor de hora/aula 🌟\n\nAcesse com: *${email ?? 'seu email cadastrado'}*\nsededomovimento.art/professor`,

  apos_1dia: (p, t, h, email) =>
    `${p}, ainda precisamos da chamada de *${t}* (${h} de ontem). 🙏\n\nA secretaria está acompanhando e pode te ajudar se precisar de algo.\n\nAcesse com: *${email ?? 'seu email cadastrado'}*\nsededomovimento.art/professor`,

  apos_2dias: (p, t, h, email) =>
    `${p}, a chamada de *${t}* (${h}) está há 2 dias sem registro.\n\nPrecisamos resolver isso juntos — entre em contato com a secretaria para regularizar.\n\nAcesse com: *${email ?? 'seu email cadastrado'}*\nsededomovimento.art/professor`,
}

const MSG_SECRETARIA = (prof: string, turma: string, hora: string, data: string) =>
  `🔔 *Chamada em aberto*\n\nProfessor: *${prof}*\nTurma: *${turma}*\nHorário: ${hora} · ${data}\n\nA aula terminou e a chamada ainda não foi lançada. Cobre agora! 📞`

type Janela = { tipo: string; minutos: number; alertaSecretaria?: boolean }

const JANELAS: Janela[] = [
  { tipo: 'antes_5min', minutos: -5 },
  { tipo: 'apos_0min',  minutos: 0,    alertaSecretaria: true },
  { tipo: 'apos_2h',    minutos: 120 },
  { tipo: 'apos_1dia',  minutos: 1440 },
  { tipo: 'apos_2dias', minutos: 2880 },
]

async function whatsapp(celular: string, mensagem: string) {
  const num = celular.replace(/\D/g, '')
  const numero = num.startsWith('55') ? num : `55${num}`
  try {
    const res = await fetch(
      `${process.env.EVOLUTION_API_URL}/message/sendText/${process.env.EVOLUTION_INSTANCE ?? 'sede-movimento'}`,
      {
        method: 'POST',
        headers: {
          'apikey': process.env.EVOLUTION_API_KEY ?? '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ number: numero, text: mensagem }),
      }
    )
    return res.ok
  } catch { return false }
}

// GET = chamado pelo cron Azure VM / POST = chamado manualmente
export async function GET(req: NextRequest) { return handler(req) }
export async function POST(req: NextRequest) { return handler(req) }

async function handler(req: NextRequest) {
  const auth = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const sb = createServiceClient() as any
  const agora = new Date()
  const tresDiasAtras = new Date(agora)
  tresDiasAtras.setDate(tresDiasAtras.getDate() - 3)

  // Professor vem via turmas.professor_id — aulas.professor_id não é preenchido no fluxo normal
  const { data: aulas } = await sb
    .from('aulas')
    .select('id, data, hora_inicio, hora_fim, status, turma_id, turmas!inner(nome, professor_id, professores(nome, celular, email))')
    .neq('status', 'cancelada')
    .neq('status', 'concluida')
    .gte('data', tresDiasAtras.toISOString().slice(0, 10))
    .lte('data', agora.toISOString().slice(0, 10))

  let enviados = 0
  const log: string[] = []

  for (const aula of (aulas ?? [])) {
    const turma = (aula as any).turmas
    const prof = turma?.professores
    if (!prof?.celular) continue

    const fimAula = new Date(`${aula.data}T${aula.hora_fim}`)
    const diffMin = (agora.getTime() - fimAula.getTime()) / 60000
    const horaFormatada = aula.hora_inicio?.slice(0, 5) + '–' + aula.hora_fim?.slice(0, 5)
    const dataFormatada = new Date(aula.data + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })

    const { data: jaSent } = await sb
      .from('lembretes_chamada')
      .select('tipo')
      .eq('aula_id', aula.id)

    const enviados_tipos = new Set(((jaSent ?? []) as any[]).map(l => l.tipo))

    for (const janela of JANELAS) {
      if (enviados_tipos.has(janela.tipo)) continue
      if (diffMin < janela.minutos - 3 || diffMin > janela.minutos + 8) continue

      const msgProf = MSG_PROFESSOR[janela.tipo]?.(prof.nome, turma?.nome ?? 'sua turma', horaFormatada, prof.email)
      if (!msgProf) continue

      const ok = await whatsapp(prof.celular, msgProf)
      if (!ok) continue

      await sb.from('lembretes_chamada').insert({ aula_id: aula.id, tipo: janela.tipo })
      enviados++
      log.push(`✓ prof [${janela.tipo}] → ${prof.nome} (${turma?.nome})`)

      if (janela.alertaSecretaria && CELULARES_SECRETARIA.length > 0) {
        const msgSec = MSG_SECRETARIA(prof.nome, turma?.nome ?? '?', horaFormatada, dataFormatada)
        for (const cel of CELULARES_SECRETARIA) {
          await whatsapp(cel, msgSec)
        }
        log.push(`  → secretaria alertada`)
      }
    }
  }

  // ── Detecção e acompanhamento de reposições ─────────────────
  const { data: subsSemSubstituto } = await sb
    .from('substituicoes')
    .select('id, professor_ausente_id, aula_id, tem_atestado, professores!professor_ausente_id(nome, celular), aulas(data, hora_inicio, hora_fim, turma_id, turmas(nome))')
    .is('professor_substituto_id', null)
    .eq('tem_atestado', false)

  for (const sub of (subsSemSubstituto ?? [])) {
    const prof = (sub as any).professores
    const aula = (sub as any).aulas
    const turma = aula?.turmas
    if (!prof || !aula) continue

    const { data: repExist } = await sb
      .from('reposicoes')
      .select('id, status, prazo, notificou_secretaria')
      .eq('substituicao_id', sub.id)
      .maybeSingle()

    const dataAula = new Date(aula.data + 'T12:00:00')
    const prazo = new Date(dataAula)
    prazo.setDate(prazo.getDate() + 4)
    const hojeStr = agora.toISOString().slice(0, 10)
    const prazoStr = prazo.toISOString().slice(0, 10)
    const horaFormatada = aula.hora_inicio?.slice(0, 5) + '–' + aula.hora_fim?.slice(0, 5)
    const dataFormatada = dataAula.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })

    if (!repExist) {
      await sb.from('reposicoes').insert({
        substituicao_id: sub.id,
        turma_id: aula.turma_id,
        professor_id: sub.professor_ausente_id,
        prazo: prazoStr,
        status: 'pendente',
        notificou_secretaria: false,
      })

      if (CELULARES_SECRETARIA.length > 0) {
        const msgSec = `⚠️ *Reposição pendente*\n\nProfessor *${prof.nome}* faltou sem substituto na aula de *${turma?.nome ?? '?'}* (${horaFormatada} · ${dataFormatada}).\n\nEle tem até *${prazo.toLocaleDateString('pt-BR')}* para agendar a reposição.\n\nCobre ele agora! 📞`
        for (const cel of CELULARES_SECRETARIA) await whatsapp(cel, msgSec)
        await sb.from('reposicoes').update({ notificou_secretaria: true }).eq('substituicao_id', sub.id)
      }

      if (prof.celular) {
        const msgProf = `Olá ${prof.nome}! 🙏\n\nSabemos que imprevistos acontecem. Como você não pôde estar na aula de *${turma?.nome ?? '?'}* (${horaFormatada} · ${dataFormatada}), precisamos garantir que os alunos não fiquem sem a aula deles.\n\nVocê tem até *${prazo.toLocaleDateString('pt-BR')}* para combinar uma *aula de reposição* com seus alunos — um horário que funcione para a maioria.\n\nQuando definir, avise a secretaria para registrar. Obrigada! 💙\nsededomovimento.art/professor`
        await whatsapp(prof.celular, msgProf)
      }
      log.push(`⚠ Reposição criada: ${prof.nome} → ${turma?.nome} (prazo: ${prazoStr})`)

    } else if (repExist.status === 'pendente') {
      const diasRestantes = Math.ceil((prazo.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24))
      const tipoLembrete = `reposicao_d${diasRestantes}`

      const { data: lembJaSent } = await sb
        .from('lembretes_chamada')
        .select('tipo').eq('aula_id', sub.aula_id).eq('tipo', tipoLembrete).maybeSingle()

      if (!lembJaSent && diasRestantes >= 0 && diasRestantes <= 3 && prof.celular) {
        const urgencia = diasRestantes === 0 ? '🚨 HOJE é o prazo!' : `Faltam *${diasRestantes} dia(s)*`
        const msgProf = `${prof.nome}, lembrete de reposição! ⏰\n\nAula de *${turma?.nome ?? '?'}* (${dataFormatada}) ainda sem reposição agendada.\n\n${urgencia}\n\nCombine com os alunos e avise a secretaria.`
        await whatsapp(prof.celular, msgProf)
        await sb.from('lembretes_chamada').insert({ aula_id: sub.aula_id, tipo: tipoLembrete })
        log.push(`↩ Lembrete reposição D${diasRestantes}: ${prof.nome}`)
      }

      if (hojeStr > prazoStr) {
        await sb.from('reposicoes').update({ status: 'expirada' }).eq('substituicao_id', sub.id)
        if (CELULARES_SECRETARIA.length > 0) {
          const msgSec = `🔴 *Reposição expirada*\n\n*${prof.nome}* não agendou a reposição de *${turma?.nome ?? '?'}* (${dataFormatada}) no prazo.\n\nTomar providências.`
          for (const cel of CELULARES_SECRETARIA) await whatsapp(cel, msgSec)
        }
        log.push(`✗ Reposição expirada: ${prof.nome} → ${turma?.nome}`)
      }
    }
  }

  return NextResponse.json({ ok: true, enviados, log })
}
