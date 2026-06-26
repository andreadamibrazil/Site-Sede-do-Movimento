import { createServiceClient } from '@/lib/supabase/server'
import { uploadUniversal } from '@/lib/upload-universal'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/admin/documentos/backfill
// Processa documentos_aluno com storage_path mas sem drive_url:
//   - baixa PDF do Supabase Storage
//   - sobe para o Drive
//   - extrai dados com Azure OpenAI
//   - atualiza drive_url + dados_extraidos
//
// Autenticação: Authorization: Bearer {CRON_SECRET}
// ?dry=true  → lista quais seriam processados, sem fazer nada
// ?limit=N   → máximo por execução (default 10, máx 30)

const MAX = 30
const BUCKET = process.env.DOCUMENTOS_BUCKET ?? 'documentos-alunos'

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const dry = req.nextUrl.searchParams.get('dry') === 'true'
  const limitParam = parseInt(req.nextUrl.searchParams.get('limit') ?? '10')
  const limit = Math.min(Math.max(1, limitParam), MAX)

  const sb = createServiceClient()

  // Docs com storage_path preenchido mas sem drive_url
  const { data: docs, error } = await sb
    .from('documentos_aluno')
    .select('id, nome, tipo, storage_path, alunos(nome)')
    .not('storage_path', 'is', null)
    .not('storage_path', 'eq', '')
    .is('drive_url', null)
    .limit(limit)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!docs?.length) return NextResponse.json({ ok: true, processados: 0, mensagem: 'nada a processar' })

  if (dry) {
    return NextResponse.json({
      ok: true,
      dry: true,
      total: docs.length,
      docs: docs.map(d => ({
        id: d.id,
        nome: d.nome,
        tipo: d.tipo,
        storage_path: d.storage_path,
        aluno: (d as any).alunos?.nome,
      })),
    })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

  let processados = 0
  let erros = 0
  const detalhes: string[] = []

  for (const doc of docs) {
    try {
      const storagePath = doc.storage_path as string
      // Supabase Storage: /storage/v1/object/authenticated/{bucket}/{path}
      const downloadUrl = `${supabaseUrl}/storage/v1/object/authenticated/${BUCKET}/${storagePath}`
      const res = await fetch(downloadUrl, {
        headers: { Authorization: `Bearer ${serviceKey}` },
      })
      if (!res.ok) {
        detalhes.push(`ERRO ${doc.id}: Storage ${res.status} para path=${storagePath}`)
        erros++
        continue
      }

      const buffer = await res.arrayBuffer()
      const alunoNome = (doc as any).alunos?.nome ?? 'Aluno'
      const nomeArquivo = doc.nome || `documento_${doc.id}.pdf`

      const result = await uploadUniversal(buffer, nomeArquivo, 'application/pdf', doc.tipo ?? 'outro', alunoNome)

      if (!result.ok) {
        detalhes.push(`ERRO ${doc.id}: Drive falhou — ${result.erro}`)
        erros++
        continue
      }

      await sb
        .from('documentos_aluno')
        .update({
          drive_url: result.driveUrl,
          dados_extraidos: (result.dadosExtraidos ?? null) as any,
        })
        .eq('id', doc.id)

      detalhes.push(`OK ${doc.id}: ${alunoNome} — ${result.driveUrl}`)
      processados++
    } catch (err) {
      detalhes.push(`ERRO ${doc.id}: ${err instanceof Error ? err.message : String(err)}`)
      erros++
    }
  }

  return NextResponse.json({ ok: true, processados, erros, detalhes })
}
