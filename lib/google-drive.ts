/**
 * Upload de arquivos para o Google Drive usando OAuth2 (refresh token).
 * Credenciais ficam em variáveis de ambiente — nunca no código.
 *
 * Estrutura de pastas:
 *   Sites/
 *   ├── Sede do Movimento/
 *   │   ├── Contratos/
 *   │   ├── Termos Aditivos/
 *   │   ├── Atestados/
 *   │   ├── Planos de Aula/{turma}/
 *   │   ├── Documentos Alunos/
 *   │   ├── Folhas de Pagamento/
 *   │   └── Outros/
 *   ├── MoviRio/
 *   ├── Vivá/
 *   └── SPDRJ/
 */

const TOKEN_URI = process.env.GOOGLE_DRIVE_TOKEN_URI ?? 'https://oauth2.googleapis.com/token'
const CLIENT_ID = process.env.GOOGLE_DRIVE_CLIENT_ID ?? ''
const CLIENT_SECRET = process.env.GOOGLE_DRIVE_CLIENT_SECRET ?? ''
const REFRESH_TOKEN = process.env.GOOGLE_DRIVE_REFRESH_TOKEN ?? ''

// IDs das pastas no Drive (pasta raiz: Sites/)
export const DRIVE_FOLDERS = {
  sites:              '1-5M7QsDErf5nso6-RIIVVAMzIIVvU_Gu',
  sede:               '12sO7KSwLwslvz9fCHRoUiNY8cE-RiT-O',
  sedeContratos:      '1qRX3yVhzkCY4tZUB_pHygo9ENm6UrD3d',
  sedeTermosAditivos: '1F6fgqLqtAG7kF1DnWvFK-NNxV8Pewz4U',
  sedeAtestados:      '1xAlrXromsA-Db4TgJM30XaRf1sH-Yb9d',
  sedePlanos:         '1OaRG3Y1fY1OhxJlOTmGqIjOilHxgg0jJ',
  sedeDocumentos:     '1ZbyCo0AiWU4JnE0BL7pNpszexZET7Jhh',
  sedeFolhas:         '1X80AuqquHqMuvpOI4uck92jjWiQQwUJm',
  sedeOutros:         '1wlO2D70B1ML-Die-mKdK2gkX3AWAaVLm',
  movirio:            '1JO7KCDfpaSyQaDlovZFzneio1y7xus-u',
  viva:               '1Gi6cSB6lMwBs84NE4BEEQEjvwmUxf_E5',
  spdrj:              '1a3kZV-0P20CbisxC85u4QaGnoE2pkiiI',
}

async function getAccessToken(): Promise<string> {
  const res = await fetch(TOKEN_URI, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  })
  if (!res.ok) throw new Error(`Drive auth falhou: ${res.status}`)
  const data = await res.json()
  return data.access_token
}

/** Cria subpasta dentro de uma pasta pai (se já existir, retorna o ID existente) */
async function criarOuBuscarPasta(nome: string, parentId: string, token: string): Promise<string> {
  // Busca se já existe
  const query = encodeURIComponent(
    `name='${nome}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`
  )
  const search = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const found = await search.json()
  if (found.files?.length > 0) return found.files[0].id

  // Cria
  const create = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: nome, mimeType: 'application/vnd.google-apps.folder', parents: [parentId] }),
  })
  const pasta = await create.json()
  return pasta.id
}

export interface DriveUploadResult {
  fileId: string
  viewUrl: string
  downloadUrl: string
}

/**
 * Faz upload de um arquivo para o Drive.
 * @param buffer - conteúdo do arquivo
 * @param fileName - nome do arquivo (ex: "Plano Ballet Avançado.pdf")
 * @param mimeType - tipo MIME (ex: "application/pdf")
 * @param parentFolderId - ID da pasta destino (use DRIVE_FOLDERS)
 * @param subfolderName - subpasta opcional dentro da pasta pai (ex: nome da turma)
 */
export async function uploadParaDrive(
  buffer: ArrayBuffer,
  fileName: string,
  mimeType: string,
  parentFolderId: string,
  subfolderName?: string
): Promise<DriveUploadResult> {
  const token = await getAccessToken()

  // Criar subpasta se necessário
  let targetFolderId = parentFolderId
  if (subfolderName) {
    targetFolderId = await criarOuBuscarPasta(subfolderName, parentFolderId, token)
  }

  // Upload multipart
  const metadata = { name: fileName, parents: [targetFolderId] }
  const form = new FormData()
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
  form.append('file', new Blob([buffer], { type: mimeType }))

  const upload = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    }
  )

  if (!upload.ok) {
    const err = await upload.text()
    throw new Error(`Drive upload falhou: ${upload.status} — ${err}`)
  }

  const file = await upload.json()
  return {
    fileId: file.id,
    viewUrl: file.webViewLink ?? `https://drive.google.com/file/d/${file.id}/view`,
    downloadUrl: `https://drive.google.com/uc?id=${file.id}`,
  }
}
