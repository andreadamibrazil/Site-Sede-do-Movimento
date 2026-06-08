import { NextRequest, NextResponse } from 'next/server'

// DESABILITADO — sistema migrado para Chatwoot
// Leads agora entram via webhook do Chatwoot (/api/leads/webhook)
// ou são cadastrados manualmente em /painel/leads

export async function GET(_req: NextRequest) {
  return NextResponse.json(
    { ok: false, msg: 'Cron BotConversa desabilitado — sistema migrado para Chatwoot' },
    { status: 410 }
  )
}
