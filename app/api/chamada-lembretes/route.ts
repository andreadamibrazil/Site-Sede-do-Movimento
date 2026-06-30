import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { PRAZO_REPOSICAO_DIAS } from '@/lib/constants/chamada'

// Cron a cada 5 minutos — dispara WhatsApp para professor quando chamada não foi lançada.
//
// Sequência (máx. 2 avisos por aula):
//   0 min  → professor: "sua aula acabou, lance a chamada"
//   +1 dia → professor: "o ponto é importante" → e AVISA A SECRETARIA p/ verificar manualmente.
//
// IMPORTANTE: o cron NUNCA marca o professor como ausente automaticamente.
// "Chamada não lançada" ≠ "professor faltou" — a falta é sempre uma decisão humana
// (secretaria/coordenação), feita no painel. Marcar falta automática gerava reposições
// e bloqueio de pagamento indevidos (incidente 25/06/2026).

// Número da secretaria (env var, pode ter vários separados por vírgula)
const CELULARES_SECRETARIA = (process.env.CELULAR_SECRETARIA ?? '').split(',').filter(Boolean)

const MSG_PROFESSOR: Record<string, (p: string, t: string, h: string, email?: string) => string> = {
  apos_0min: (p, t, h, email) =>
    `Olá ${p}! ⏰\n\nSua aula de *${t}* (${h}) acabou de terminar.\n\nPor favor lance a chamada agora — leva menos de 1 minuto! 🙌\n\nAcesse: sededomovimento.art/professor\nEmail: *${email ?? 'seu email cadastrado'}*`,

  apos_1dia: (p, t, h) =>
    `${p}, um ponto importante: a chamada de *${t}* (${h} de ontem) ainda não foi lançada.\n\nSe precisar de ajuda para acessar o sistema, fale com a secretaria. 🙏`,
}

type Janela = { tipo: string; minutos: number; avisarSecretariaApos?: boolean }

const JANELAS: Janela[] = [
  { tipo: 'apos_0min', minutos: 0 },
  { tipo: 'apos_1dia', minutos: 1440, avisarSecretariaApos: true },
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
        body: JSON.stringify({
          number: numero,
          text: mensagem,
          options: {
            delay: Math.min(Math.max(mensagem.length * 20, 1500), 5000),
            presence: 'composing',
          },
        }),
        signal: AbortSignal.timeout(8000),
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

  const dryRun = req.nextUrl.searchParams.get('dry_run') === 'true'
  const skipWindow = req.nextUrl.searchParams.get('skip_window') === 'true'

  const sb = createServiceClient()
  const agora = new Date()
  // Janela de varredura: aulas dos últimos 2 dias (cobre apos_0min e apos_1dia).
  const janelaInicio = new Date(agora)
  janelaInicio.setDate(janelaInicio.getDate() - 2)

  // Fonte de verdade única: chamada feita = chamada_concluida_em preenchido.
  // (status segue o ciclo da aula; não decide se a chamada foi lançada.)
  // Professor vem via turmas.professor_id — aulas.professor_id não é preenchido no fluxo normal
  const { data: aulas } = await sb
    .from('aulas')
    .select('id, data, hora_inicio, hora_fim, status, turma_id, turmas!inner(nome, professor_id, professores!professor_id(nome, celular, email, ativo))')
    .neq('status', 'cancelada')
    .is('chamada_concluida_em', null)
    .gte('data', janelaInicio.toISOString().slice(0, 10))
    .lte('data', agora.toISOString().slice(0, 10))

  // Calendário: dias confirmados sem aula (feriado/recesso) — não cobrar chamada nesses dias.
  const { data: bloqueios } = await sb
    .from('calendario_bloqueios')
    .select('data')
    .eq('status', 'confirmado')
    .eq('tem_aula', false)
    .gte('data', janelaInicio.toISOString().slice(0, 10))
    .lte('data', agora.toISOString().slice(0, 10))
  const datasBloqueadas = new Set((bloqueios ?? []).map((b: { data: string }) => b.data))

  let enviados = 0
  const log: string[] = []

  for (const aula of (aulas ?? [])) {
    if (datasBloqueadas.has(aula.data)) continue // feriado/recesso — não cobra chamada
    const turma = (aula as any).turmas
    const prof = turma?.professores
    const horaFormatada = aula.hora_inicio?.slice(0, 5) + '–' + aula.hora_fim?.slice(0, 5)

    // Responsáveis pela aula: professor titular + co-regentes (turma_professores).
    // Todos recebem o lembrete; nenhum é marcado ausente automaticamente.
    const { data: coRegs } = await sb
      .from('turma_professores' as any)
      .select('professores!professor_id(nome, celular, email, ativo)')
      .eq('turma_id', aula.turma_id)
    const vistos = new Set<string>()
    const recipientes = [prof, ...(((coRegs ?? []) as any[]).map(c => c.professores))]
      .filter((p: any) => {
        if (!p?.celular || p.ativo === false) return false
        if (vistos.has(p.celular)) return false
        vistos.add(p.celular)
        return true
      })
    if (recipientes.length === 0) continue

    const fimAula = new Date(`${aula.data}T${aula.hora_fim}-03:00`)
    const diffMin = (agora.getTime() - fimAula.getTime()) / 60000

    const { data: jaSent } = await sb
      .from('lembretes_chamada')
      .select('tipo')
      .eq('aula_id', aula.id)

    const enviados_tipos = new Set(((jaSent ?? []) as any[]).map(l => l.tipo))

    for (const janela of JANELAS) {
      if (enviados_tipos.has(janela.tipo)) continue
      if (!skipWindow && (diffMin < janela.minutos - 3 || diffMin > janela.minutos + 8)) continue

      let enviouAlgum = false
      for (const p of recipientes) {
        const msgProf = MSG_PROFESSOR[janela.tipo]?.(p.nome, turma?.nome ?? 'sua turma', horaFormatada, p.email)
        if (!msgProf) continue
        if (!dryRun) {
          const ok = await whatsapp(p.celular, msgProf)
          if (!ok) continue
        }
        enviouAlgum = true
        enviados++
        log.push(`${dryRun ? '○ [DRY]' : '✓'} prof [${janela.tipo}] → ${p.nome} (${turma?.nome}) · ***${p.celular?.slice(-4)}`)
      }
      if (enviouAlgum && !dryRun) {
        await sb.from('lembretes_chamada').insert({ aula_id: aula.id, tipo: janela.tipo })
      }

      // Após apos_1dia: AVISA A SECRETARIA para verificar manualmente — NUNCA marca falta.
      // A falta é decisão humana (painel). Auto-marcar gerava reposições/bloqueio de pagamento indevidos.
      if (janela.avisarSecretariaApos && !enviados_tipos.has('sec_sem_chamada_24h')) {
        const [, mes, dia] = String(aula.data).split('-')
        const nomesProfs = recipientes.map((p: any) => p.nome).join(', ')
        const msgSec = `⚠️ *Chamada pendente há 24h*\n\n${nomesProfs} ainda não lançou a chamada de *${turma?.nome ?? '?'}* (${horaFormatada} · ${dia}/${mes}).\n\nVerifiquem se a aula aconteceu. Se o professor faltou de verdade, registrem a falta no painel — o sistema não marca falta sozinho.`
        if (!dryRun) {
          for (const cel of CELULARES_SECRETARIA) await whatsapp(cel, msgSec)
          await sb.from('lembretes_chamada').insert({ aula_id: aula.id, tipo: 'sec_sem_chamada_24h' })
        }
        log.push(`  → ${dryRun ? '[DRY] ' : ''}secretaria avisada (chamada pendente 24h, SEM marcar falta)`)
      }
    }
  }

  // ── Detecção e acompanhamento de reposições ─────────────────
  const seisAtras = new Date(agora)
  seisAtras.setDate(seisAtras.getDate() - 180)

  const { data: subsSemSubstituto } = await sb
    .from('substituicoes')
    .select('id, professor_ausente_id, aula_id, tem_atestado, motivo, professores!professor_ausente_id(nome, celular), aulas!inner(data, hora_inicio, hora_fim, turma_id, turmas(nome))')
    .is('professor_substituto_id', null)
    .eq('tem_atestado', false)
    // Defensivo: nunca gerar reposição a partir de "chamada não lançada" (falta operacional, não real)
    .or('motivo.is.null,motivo.neq.chamada_nao_lancada')
    .gte('aulas.data', seisAtras.toISOString().slice(0, 10))
    .limit(500)

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

    const dataAula = new Date(aula.data + 'T12:00:00-03:00')
    const prazo = new Date(dataAula)
    prazo.setDate(prazo.getDate() + PRAZO_REPOSICAO_DIAS)
    const hojeStr = agora.toISOString().slice(0, 10)
    const prazoStr = prazo.toISOString().slice(0, 10)
    const horaFormatada = aula.hora_inicio?.slice(0, 5) + '–' + aula.hora_fim?.slice(0, 5)
    const dataFormatada = dataAula.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })

    if (!repExist) {
      if (!dryRun) {
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
      }
      log.push(`${dryRun ? '○ [DRY] ' : '⚠ '}Reposição criada: ${prof.nome} → ${turma?.nome} (prazo: ${prazoStr})`)

    } else if (repExist.status === 'pendente') {
      const diasRestantes = Math.ceil((prazo.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24))
      const tipoLembrete = `reposicao_d${diasRestantes}`

      const { data: lembJaSent } = await sb
        .from('lembretes_chamada')
        .select('tipo').eq('aula_id', sub.aula_id).eq('tipo', tipoLembrete).maybeSingle()

      if (!lembJaSent && diasRestantes >= 0 && diasRestantes <= 3 && prof.celular) {
        const urgencia = diasRestantes === 0 ? '🚨 HOJE é o prazo!' : `Faltam *${diasRestantes} dia(s)*`
        const msgProf = `${prof.nome}, lembrete de reposição! ⏰\n\nAula de *${turma?.nome ?? '?'}* (${dataFormatada}) ainda sem reposição agendada.\n\n${urgencia}\n\nCombine com os alunos e avise a secretaria.`
        if (!dryRun) {
          await whatsapp(prof.celular, msgProf)
          await sb.from('lembretes_chamada').insert({ aula_id: sub.aula_id, tipo: tipoLembrete })
        }
        log.push(`${dryRun ? '○ [DRY] ' : '↩ '}Lembrete reposição D${diasRestantes}: ${prof.nome}`)
      }

      if (hojeStr > prazoStr) {
        if (!dryRun) {
          await sb.from('reposicoes').update({ status: 'expirada' }).eq('substituicao_id', sub.id)
          if (CELULARES_SECRETARIA.length > 0) {
            const msgSec = `🔴 *Reposição expirada*\n\n*${prof.nome}* não agendou a reposição de *${turma?.nome ?? '?'}* (${dataFormatada}) no prazo.\n\nTomar providências.`
            for (const cel of CELULARES_SECRETARIA) await whatsapp(cel, msgSec)
          }
        }
        log.push(`${dryRun ? '○ [DRY] ' : '✗ '}Reposição expirada: ${prof.nome} → ${turma?.nome}`)
      }
    }
  }

  return NextResponse.json({ ok: true, dry_run: dryRun, skip_window: skipWindow, enviados, log })
}
