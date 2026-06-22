// Rasteriza páginas de um PDF em PNG (base64), para alimentar a Vision API do
// Azure OpenAI — o gpt-4o-mini NÃO lê PDF, só imagem. Usa mupdf (WASM puro, sem
// dependência de binário de sistema → roda no Vercel serverless).
// Importado dinamicamente em lib/gemini.ts só quando chega um PDF.

const ESCALA = 2 // 2x = boa nitidez para OCR de documentos sem explodir o tamanho

export async function pdfParaImagensBase64(
  pdf: Uint8Array,
  maxPaginas = 5
): Promise<string[]> {
  const mupdf = await import('mupdf')
  const doc = mupdf.Document.openDocument(pdf, 'application/pdf')
  try {
    const total = Math.min(doc.countPages(), maxPaginas)
    const imagens: string[] = []
    for (let i = 0; i < total; i++) {
      const page = doc.loadPage(i)
      const pixmap = page.toPixmap(
        mupdf.Matrix.scale(ESCALA, ESCALA),
        mupdf.ColorSpace.DeviceRGB,
        false,
        true
      )
      imagens.push(Buffer.from(pixmap.asPNG()).toString('base64'))
    }
    return imagens
  } finally {
    // mupdf gerencia memória WASM manualmente
    ;(doc as { destroy?: () => void }).destroy?.()
  }
}
