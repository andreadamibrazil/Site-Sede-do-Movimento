import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Roda 1x por semana (seg 06:00) via cron Azure VM
// Chama: POST https://sededomovimento.art/api/cron/gerar-aulas
// Header: Authorization: Bearer {CRON_SECRET}
//
// Gera aulas para as próximas SEMANAS_ANTECEDENCIA semanas, para todas as
// turmas ativas com turma_horarios cadastrado. Usa ON CONFLICT DO NOTHING,
// então é idempotente — pode rodar mais de uma vez sem duplicar.

const SEMANAS_ANTECEDENCIA = 8

const DIA_SEMANA: Record<string, number> = {
  domingo: 0,
  segunda: 1,
  terca: 2,
  quarta: 3,
  quinta: 4,
  sexta: 5,
  sabado: 6,
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const sb = createServiceClient() as any

  const { data: turmas, error: errTurmas } = await sb
    .from('turmas')
    .select('id, nome, professor_id, sala_id, data_fim, turma_horarios(dia_semana, hora_inicio, hora_fim)')
    .eq('status', 'ativa')

  if (errTurmas) return NextResponse.json({ error: errTurmas.message }, { status: 500 })

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const fim = new Date(hoje)
  fim.setDate(fim.getDate() + SEMANAS_ANTECEDENCIA * 7)

  const rows: {
    turma_id: string
    professor_id: string | null
    sala_id: string | null
    data: string
    hora_inicio: string
    hora_fim: string
    status: string
  }[] = []

  for (const turma of turmas ?? []) {
    if (!turma.turma_horarios?.length) continue

    const dataFim = turma.data_fim ? new Date(turma.data_fim) : null

    for (const h of turma.turma_horarios) {
      const dow = DIA_SEMANA[h.dia_semana]
      if (dow === undefined) continue

      const cursor = new Date(hoje)
      // advance to first occurrence of this weekday >= hoje
      const diff = (dow - cursor.getDay() + 7) % 7
      cursor.setDate(cursor.getDate() + diff)

      while (cursor <= fim) {
        if (!dataFim || cursor <= dataFim) {
          rows.push({
            turma_id: turma.id,
            professor_id: turma.professor_id ?? null,
            sala_id: turma.sala_id ?? null,
            data: cursor.toISOString().slice(0, 10),
            hora_inicio: h.hora_inicio,
            hora_fim: h.hora_fim,
            status: 'agendada',
          })
        }
        cursor.setDate(cursor.getDate() + 7)
      }
    }
  }

  if (rows.length === 0) {
    return NextResponse.json({ ok: true, criadas: 0, mensagem: 'sem aulas a gerar' })
  }

  // Batch insert in chunks of 500 to stay within payload limits
  const CHUNK = 500
  let criadas = 0
  let erros = 0

  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK)
    const { error } = await sb
      .from('aulas')
      .upsert(chunk, { onConflict: 'turma_id,data,hora_inicio', ignoreDuplicates: true })

    if (error) {
      console.error('[gerar-aulas] upsert error:', error.message)
      erros += chunk.length
    } else {
      criadas += chunk.length
    }
  }

  return NextResponse.json({
    ok: true,
    turmas_ativas: turmas?.length ?? 0,
    candidatas: rows.length,
    criadas,
    erros,
  })
}
