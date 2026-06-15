import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/health?secret=CRON_SECRET — verifica todos os sistemas integrados
// Retorna JSON com status de cada integração e salva resultado.

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || secret !== cronSecret) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const checks: Record<string, { ok: boolean; detail?: string; latencyMs?: number }> = {}
  const t0 = Date.now()

  // 1. Supabase — ping via query simples
  try {
    const sb = createServiceClient()
    const t = Date.now()
    const { data, error } = await sb.from('professores').select('id').limit(1)
    checks.supabase = {
      ok: !error,
      detail: error ? error.message : `${data?.length ?? 0} rows`,
      latencyMs: Date.now() - t,
    }
  } catch (e) {
    checks.supabase = { ok: false, detail: String(e) }
  }

  // 2. Supabase — colunas MEI e comprovante (migration aplicada?)
  try {
    const sb = createServiceClient()
    const { error: e1 } = await (sb as any).from('professores').select('mei').limit(1)
    const { error: e2 } = await (sb as any).from('folhas_pagamento').select('comprovante_url,drive_pdf_url').limit(1)
    checks.migration_mei_comprovante = {
      ok: !e1 && !e2,
      detail: e1 ? `professores.mei: ${e1.message}` : e2 ? `folhas_pagamento.comprovante_url: ${e2.message}` : 'OK',
    }
  } catch (e) {
    checks.migration_mei_comprovante = { ok: false, detail: String(e) }
  }

  // 3. DocuSeal — acessível?
  const docusealUrl = process.env.DOCUSEAL_URL
  if (docusealUrl) {
    try {
      const t = Date.now()
      const res = await fetch(`${docusealUrl}/api/templates?limit=1`, {
        headers: { 'X-Auth-Token': process.env.DOCUSEAL_API_KEY ?? '' },
        signal: AbortSignal.timeout(5000),
      })
      checks.docuseal = { ok: res.ok, detail: `HTTP ${res.status}`, latencyMs: Date.now() - t }
    } catch (e) {
      checks.docuseal = { ok: false, detail: String(e) }
    }
  } else {
    checks.docuseal = { ok: false, detail: 'DOCUSEAL_URL não configurado' }
  }

  // 4. Evolution API (WhatsApp)
  const evolutionUrl = process.env.EVOLUTION_API_URL
  if (evolutionUrl) {
    try {
      const t = Date.now()
      const res = await fetch(`${evolutionUrl}/instance/fetchInstances`, {
        headers: { 'apikey': process.env.EVOLUTION_API_KEY ?? '' },
        signal: AbortSignal.timeout(5000),
      })
      checks.evolution_whatsapp = { ok: res.ok, detail: `HTTP ${res.status}`, latencyMs: Date.now() - t }
    } catch (e) {
      checks.evolution_whatsapp = { ok: false, detail: String(e) }
    }
  } else {
    checks.evolution_whatsapp = { ok: false, detail: 'EVOLUTION_API_URL não configurado' }
  }

  // 5. Google Drive — token renovável?
  const googleClientId = process.env.GOOGLE_DRIVE_CLIENT_ID
  const googleRefresh = process.env.GOOGLE_DRIVE_REFRESH_TOKEN
  if (googleClientId && googleRefresh) {
    try {
      const t = Date.now()
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: googleClientId,
          client_secret: process.env.GOOGLE_DRIVE_CLIENT_SECRET ?? '',
          refresh_token: googleRefresh,
          grant_type: 'refresh_token',
        }),
        signal: AbortSignal.timeout(5000),
      })
      const tokenData = await tokenRes.json()
      checks.google_drive = {
        ok: !!tokenData.access_token,
        detail: tokenData.access_token ? 'token renovado OK' : (tokenData.error ?? 'sem access_token'),
        latencyMs: Date.now() - t,
      }
    } catch (e) {
      checks.google_drive = { ok: false, detail: String(e) }
    }
  } else {
    checks.google_drive = { ok: false, detail: 'GOOGLE_DRIVE_CLIENT_ID ou REFRESH_TOKEN não configurados' }
  }

  // 6. Resend (email)
  const resendKey = process.env.RESEND_API_KEY
  if (resendKey) {
    try {
      const t = Date.now()
      const res = await fetch('https://api.resend.com/domains', {
        headers: { Authorization: `Bearer ${resendKey}` },
        signal: AbortSignal.timeout(5000),
      })
      checks.resend_email = { ok: res.ok, detail: `HTTP ${res.status}`, latencyMs: Date.now() - t }
    } catch (e) {
      checks.resend_email = { ok: false, detail: String(e) }
    }
  } else {
    checks.resend_email = { ok: false, detail: 'RESEND_API_KEY não configurado' }
  }

  const allOk = Object.values(checks).every(c => c.ok)
  const totalMs = Date.now() - t0

  const result = {
    ok: allOk,
    timestamp: new Date().toISOString(),
    totalMs,
    checks,
  }

  return NextResponse.json(result, { status: allOk ? 200 : 207 })
}
