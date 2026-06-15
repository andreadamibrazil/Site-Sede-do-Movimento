'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ComprovanteBtn({
  folhaId,
  comprovanteAtual,
  drivePdfUrl,
}: {
  folhaId: string
  comprovanteAtual?: string | null
  drivePdfUrl?: string | null
}) {
  const [url, setUrl] = useState(comprovanteAtual ?? '')
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)
  const router = useRouter()

  async function salvar() {
    setSalvando(true)
    await fetch(`/api/folha-pagamento/${folhaId}/comprovante`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comprovante_url: url.trim() || null }),
    })
    setSalvando(false)
    setSalvo(true)
    setTimeout(() => setSalvo(false), 3000)
    router.refresh()
  }

  return (
    <div className="space-y-3">
      {drivePdfUrl && (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>📁 PDF no Drive:</span>
          <a href={drivePdfUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline truncate max-w-xs">
            Ver arquivo →
          </a>
        </div>
      )}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Comprovante de pagamento (link ou observação)</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="Link do comprovante ou número da transação Pix"
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            onClick={salvar}
            disabled={salvando}
            className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors whitespace-nowrap"
          >
            {salvando ? 'Salvando...' : salvo ? '✓ Salvo' : 'Salvar'}
          </button>
        </div>
      </div>
      {comprovanteAtual && (
        <p className="text-xs text-gray-500">
          Comprovante atual:{' '}
          {comprovanteAtual.startsWith('http') ? (
            <a href={comprovanteAtual} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">{comprovanteAtual}</a>
          ) : (
            <span className="font-mono">{comprovanteAtual}</span>
          )}
        </p>
      )}
    </div>
  )
}
