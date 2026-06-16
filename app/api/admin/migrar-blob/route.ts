import { createServiceClient } from '@/lib/supabase/server'
import { mergeBlobMessages } from '@/lib/azure-blob'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/admin/migrar-blob
// Migração única: copia todas as mensagens do Supabase (conversas.messages) → Azure Blob
// Necessário porque o webhook Evolution não gravava no Blob até 2026-06-16.
//
// Auth: Authorization: Bearer {CRON_SECRET}
// Params: ?limit=100 (default 100 conversas por rodada — rodar várias vezes se necessário)
// Params: ?offset=0  (paginar se houver muitas conversas)
//
// Resultado por conversa:
//   added   = mensagens novas gravadas no Blob
//   total   = total de mensagens no Blob após merge
//   skipped = 0 (já estavam no Blob)

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const limitParam = parseInt(req.nextUrl.searchParams.get('limit') ?? '100')
  const offsetParam = parseInt(req.nextUrl.searchParams.get('offset') ?? '0')
  const limit = Math.min(Math.max(1, limitParam), 200)
  const offset = Math.max(0, offsetParam)

  const sb = createServiceClient()

  // Busca conversas que têm mensagens salvas no Supabase
  const { data: conversas, error, count } = await sb
    .from('conversas')
    .select('id, celular, messages, variables', { count: 'exact' })
    .not('messages', 'is', null)
    .neq('messages', '[]')
    .order('created_at', { ascending: true })
    .range(offset, offset + limit - 1)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!conversas?.length) {
    return NextResponse.json({ ok: true, processadas: 0, mensagem: 'Nenhuma conversa encontrada nesta faixa' })
  }

  const inicio = Date.now()
  const resultados: Array<{ celular: string; added: number; total: number; erro?: string }> = []
  let totalAdded = 0

  for (const conversa of conversas) {
    const celular = conversa.celular as string
    const messages = (conversa.messages as Record<string, unknown>[]) ?? []
    const cvars = conversa.variables as Record<string, unknown> | null
    const instance = (cvars?.instance as string) ?? 'sede-movimento'

    if (!celular || !messages.length) continue

    try {
      const { added, total } = await mergeBlobMessages(instance, celular, messages)
      resultados.push({ celular, added, total })
      totalAdded += added
    } catch (e) {
      resultados.push({ celular, added: 0, total: 0, erro: String(e) })
    }
  }

  const totalConversas = count ?? 0
  const processadas = resultados.length
  const comErro = resultados.filter(r => r.erro).length
  const proxOffset = offset + limit

  return NextResponse.json({
    ok: true,
    processadas,
    total_conversas_no_banco: totalConversas,
    mensagens_gravadas_no_blob: totalAdded,
    com_erro: comErro,
    tempo_ms: Date.now() - inicio,
    // Indicações para continuar se houver mais
    pagina_atual: { offset, limit },
    proxima_pagina: proxOffset < totalConversas
      ? { url: `/api/admin/migrar-blob?limit=${limit}&offset=${proxOffset}`, offset: proxOffset }
      : null,
    detalhes: resultados,
  })
}
