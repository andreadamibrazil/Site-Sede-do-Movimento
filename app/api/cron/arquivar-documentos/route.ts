import { createServiceClient } from '@/lib/supabase/server'
import { uploadParaDrive, DRIVE_FOLDERS } from '@/lib/google-drive'
import { NextRequest, NextResponse } from 'next/server'

// Roda 1x por mês (dia 1, 03:00) via cron Azure VM
// Chama: GET https://sededomovimento.art/api/cron/arquivar-documentos
// Header: Authorization: Bearer {CRON_SECRET}
//
// Fluxo:
//   1. Busca documentos_aluno com dados_extraidos preenchido + criado há > 90 dias
//   2. Converte JSON para arquivo e envia para Google Drive (Documentos Alunos/)
//   3. Salva drive URL em dados_extraidos_drive_url
//   4. Limpa dados_extraidos do Supabase (libera espaço)

const MAX_POR_EXECUCAO = 50

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const sb = createServiceClient()
  const agora = new Date().toISOString()

  // Documentos com dados_extraidos ainda no Supabase + criados há > 90 dias
  const { data: documentos, error } = await sb
    .from('documentos_aluno')
    .select('id, nome, tipo, dados_extraidos, created_at')
    .not('dados_extraidos', 'is', null)
    .is('dados_extraidos_drive_url', null)
    .lt('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
    .limit(MAX_POR_EXECUCAO)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!documentos || documentos.length === 0) {
    return NextResponse.json({ ok: true, arquivados: 0, mensagem: 'nada a arquivar' })
  }

  let arquivados = 0
  let erros = 0

  for (const doc of documentos) {
    try {
      const jsonString = JSON.stringify(doc.dados_extraidos, null, 2)
      const nodeBuffer = Buffer.from(jsonString, 'utf-8')
      const arrayBuffer = nodeBuffer.buffer.slice(
        nodeBuffer.byteOffset,
        nodeBuffer.byteOffset + nodeBuffer.byteLength,
      ) as ArrayBuffer
      const fileName = `${doc.id}-dados-extraidos.json`

      const result = await uploadParaDrive(
        arrayBuffer,
        fileName,
        'application/json',
        DRIVE_FOLDERS.sedeDocumentos,
        'dados-extraidos',
      )

      await sb.from('documentos_aluno')
        .update({
          dados_extraidos_drive_url: result.viewUrl,
          dados_extraidos: null,
        })
        .eq('id', doc.id)

      arquivados++
    } catch (e: any) {
      console.error(`[arquivar-documentos] Erro no doc ${doc.id}:`, e?.message)
      erros++
    }
  }

  return NextResponse.json({ ok: true, arquivados, erros, total: documentos.length, executado_em: agora })
}
