import { BlobServiceClient } from '@azure/storage-blob'

// Container único no Azure: "conversas"
// Estrutura interna: {instance}/{celular}.json
// Ex: sede-movimento/21982399484.json
// Histórico NUNCA é apagado — apenas acumulado
// ultima_analise_idx marca até onde o Gemini já analisou

const CONTAINER = 'conversas'

export interface BlobData {
  messages: any[]
  ultima_analise_idx: number
}

function getContainer() {
  const connStr = process.env.AZURE_STORAGE_CONNECTION_STRING
  if (!connStr) throw new Error('AZURE_STORAGE_CONNECTION_STRING não configurado')
  return BlobServiceClient.fromConnectionString(connStr).getContainerClient(CONTAINER)
}

async function streamToString(stream: NodeJS.ReadableStream): Promise<string> {
  const chunks: Buffer[] = []
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }
  return Buffer.concat(chunks).toString('utf-8')
}

function blobName(instance: string, celular: string): string {
  return `${instance}/${celular}.json`
}

async function readBlob(instance: string, celular: string): Promise<BlobData> {
  const container = getContainer()
  try {
    const blob = container.getBlockBlobClient(blobName(instance, celular))
    const download = await blob.download()
    const content = await streamToString(download.readableStreamBody!)
    return JSON.parse(content) as BlobData
  } catch {
    return { messages: [], ultima_analise_idx: 0 }
  }
}

async function writeBlob(instance: string, celular: string, data: BlobData): Promise<void> {
  const container = getContainer()
  const blob = container.getBlockBlobClient(blobName(instance, celular))
  await blob.uploadData(Buffer.from(JSON.stringify(data)), {
    blobHTTPHeaders: { blobContentType: 'application/json' },
  })
}

export async function appendMessage(
  instance: string,
  celular: string,
  message: Record<string, any>,
): Promise<string> {
  const data = await readBlob(instance, celular)

  if (!data.messages.find((m: any) => m.id === message.id)) {
    data.messages.push(message)
  }

  await writeBlob(instance, celular, data)
  return blobName(instance, celular)
}

export async function readBlobData(instance: string, celular: string): Promise<BlobData> {
  return readBlob(instance, celular)
}

export async function markAnalyzed(
  instance: string,
  celular: string,
  analyzedUpToIdx: number,
): Promise<void> {
  const data = await readBlob(instance, celular)
  data.ultima_analise_idx = analyzedUpToIdx
  await writeBlob(instance, celular, data)
}

// Merge em lote — lê o blob uma vez, adiciona todas as mensagens novas, grava uma vez
export async function mergeBlobMessages(
  instance: string,
  celular: string,
  messages: Record<string, unknown>[],
): Promise<{ added: number; total: number }> {
  const data = await readBlob(instance, celular)
  const existingIds = new Set(data.messages.map((m: any) => m.id).filter(Boolean))
  let added = 0
  for (const msg of messages) {
    if (!existingIds.has(msg.id)) {
      data.messages.push(msg)
      existingIds.add(msg.id)
      added++
    }
  }
  if (added > 0) {
    // Ordena por timestamp para manter histórico cronológico
    data.messages.sort((a: any, b: any) => (a.timestamp ?? 0) - (b.timestamp ?? 0))
    await writeBlob(instance, celular, data)
  }
  return { added, total: data.messages.length }
}
