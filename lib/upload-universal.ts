/**
 * Upload universal de arquivos — TODOS os arquivos vão para o Google Drive.
 * Gemini extrai dados estruturados (best-effort).
 * Se o Drive falhar: email para André + retorna erro para o cliente mostrar alerta.
 */

import { uploadParaDrive, DRIVE_FOLDERS, DriveUploadResult } from '@/lib/google-drive'
import { callGeminiVision } from '@/lib/gemini'

const ALERT_EMAIL = 'andreadami@sededomovimento.art'

// Pasta Drive por tipo de documento
const PASTA_POR_TIPO: Record<string, keyof typeof DRIVE_FOLDERS> = {
  atestado:            'sedeAtestados',
  contrato:            'sedeContratos',
  rg:                  'sedeDocumentos',
  cpf:                 'sedeDocumentos',
  autorizacao:         'sedeDocumentos',
  declaracao_matricula:'sedeDocumentos',
  outro:               'sedeOutros',
  // termos aditivos
  termo_aditivo:       'sedeTermosAditivos',
  // folhas de pagamento
  folha_pagamento:     'sedeFolhas',
}

// MIME types que o Gemini processa nativamente
const GEMINI_SUPORTADOS = new Set([
  'application/pdf',
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
  'text/plain',
  'audio/mpeg', 'audio/mp3', 'audio/ogg', 'audio/wav', 'audio/webm',
  'video/mp4', 'video/webm',
])

export interface UploadResult {
  ok: boolean
  driveId?: string
  driveUrl?: string
  dadosExtraidos?: Record<string, unknown>
  alertaEnviado?: boolean
  erro?: string
}

async function enviarAlertaEmail(fileName: string, tipo: string, motivo: string) {
  const key = process.env.RESEND_API_KEY
  if (!key) return
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'sistema@sededomovimento.art',
        to: ALERT_EMAIL,
        subject: `⚠️ Arquivo NÃO salvo no Drive: ${fileName}`,
        html: `
          <p><strong>Arquivo:</strong> ${fileName}</p>
          <p><strong>Tipo:</strong> ${tipo}</p>
          <p><strong>Erro:</strong> ${motivo}</p>
          <p>O arquivo <strong>não foi salvo no Google Drive</strong> e pode se perder. Verifique a integração.</p>
          <hr/>
          <p><small>Sistema Sede do Movimento</small></p>
        `,
      }),
    })
  } catch {
    // silencia — não deve bloquear o fluxo
  }
}

async function extrairComGemini(
  buffer: ArrayBuffer,
  mimeType: string,
  tipo: string
): Promise<Record<string, unknown> | null> {
  if (!GEMINI_SUPORTADOS.has(mimeType)) return null

  const base64 = Buffer.from(buffer).toString('base64')

  const promptPorTipo: Record<string, string> = {
    atestado: '{ "tipo_documento":"atestado", "nome_paciente":"...", "crm":"...", "data_consulta":"YYYY-MM-DD", "hora_consulta":"HH:MM", "data_inicio_afastamento":"YYYY-MM-DD", "data_fim_afastamento":"YYYY-MM-DD", "diagnostico":"...", "nome_medico":"..." }',
    contrato:  '{ "tipo_documento":"contrato", "partes":["..."], "data_assinatura":"YYYY-MM-DD", "valor":0, "duracao_meses":0 }',
    rg:        '{ "tipo_documento":"rg", "nome":"...", "rg":"...", "data_emissao":"YYYY-MM-DD", "orgao_emissor":"..." }',
    cpf:       '{ "tipo_documento":"cpf", "nome":"...", "cpf":"..." }',
  }
  const schema = promptPorTipo[tipo] ?? '{ "tipo_documento":"...", "resumo":"...", "dados_relevantes":{} }'

  const prompt = `Analise este documento e extraia dados estruturados.
Retorne SOMENTE JSON válido neste formato: ${schema}
Omita campos que não conseguir extrair. Sem markdown, sem texto extra.`

  try {
    const raw = await callGeminiVision(base64, mimeType, prompt)
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    return JSON.parse(cleaned) as Record<string, unknown>
  } catch {
    return null
  }
}

export async function uploadUniversal(
  buffer: ArrayBuffer,
  fileName: string,
  mimeType: string,
  tipo: string,
  subpasta?: string
): Promise<UploadResult> {
  const chavePasta = PASTA_POR_TIPO[tipo] ?? 'sedeOutros'
  const folderId = DRIVE_FOLDERS[chavePasta]

  // 1. Upload para o Drive
  let driveResult: DriveUploadResult
  try {
    driveResult = await uploadParaDrive(buffer, fileName, mimeType, folderId, subpasta)
  } catch (err) {
    const motivo = err instanceof Error ? err.message : String(err)
    await enviarAlertaEmail(fileName, tipo, motivo)
    return { ok: false, erro: motivo, alertaEnviado: true }
  }

  // 2. Extração Gemini (best-effort — arquivo já está seguro no Drive)
  let dadosExtraidos: Record<string, unknown> | undefined
  try {
    const extraido = await extrairComGemini(buffer, mimeType, tipo)
    if (extraido) dadosExtraidos = extraido
  } catch {
    // falha silenciosa
  }

  return {
    ok: true,
    driveId: driveResult.fileId,
    driveUrl: driveResult.viewUrl,
    dadosExtraidos,
  }
}
