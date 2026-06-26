const BASE_URL = (process.env.DOCUSEAL_URL ?? '').trim()
const API_KEY  = (process.env.DOCUSEAL_API_KEY ?? '').trim()

// Mapa de templates — adicione uma linha para cada novo documento
export const DOCUSEAL_TEMPLATES = {
  contrato_matricula: Number(process.env.DOCUSEAL_TEMPLATE_CONTRATO ?? 0),
  // termo_aditivo:     Number(process.env.DOCUSEAL_TEMPLATE_TERMO_ADITIVO ?? 0),
  // declaracao_aluno:  Number(process.env.DOCUSEAL_TEMPLATE_DECLARACAO ?? 0),
}

export type DocuSealTemplate = keyof typeof DOCUSEAL_TEMPLATES

export interface SubmissionSubmitter {
  email: string
  role: string
  values?: Record<string, string>
  metadata?: Record<string, string>
}

export async function downloadContratoAssinado(submissionId: string | number): Promise<Buffer | null> {
  if (!BASE_URL || !API_KEY) return null
  const res = await fetch(`${BASE_URL}/api/submissions/${submissionId}`, {
    headers: { 'X-Auth-Token': API_KEY },
  })
  if (!res.ok) return null
  const sub = await res.json() as { documents?: Array<{ url: string }> }
  const docUrl = sub.documents?.[0]?.url
  if (!docUrl) return null
  const fileUrl = docUrl.startsWith('http') ? docUrl : `${BASE_URL}${docUrl}`
  const pdfRes = await fetch(fileUrl, { headers: { 'X-Auth-Token': API_KEY } })
  if (!pdfRes.ok) return null
  return Buffer.from(await pdfRes.arrayBuffer())
}

export async function criarSubmission(
  template: DocuSealTemplate,
  submitters: SubmissionSubmitter[],
  options: { sendEmail?: boolean } = {},
) {
  if (!BASE_URL || !API_KEY) throw new Error('DocuSeal não configurado (DOCUSEAL_URL / DOCUSEAL_API_KEY)')

  const templateId = DOCUSEAL_TEMPLATES[template]
  if (!templateId) throw new Error(`Template "${template}" não encontrado`)

  const res = await fetch(`${BASE_URL}/api/submissions`, {
    method: 'POST',
    headers: { 'X-Auth-Token': API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      template_id: templateId,
      send_email: options.sendEmail ?? true,
      submitters,
    }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`DocuSeal ${res.status}: ${body}`)
  }

  return res.json() as Promise<Array<{ id: number; slug: string; email: string; submission_id: number }>>
}
