'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type ComprovanteDados = {
  valor?: number | null
  data?: string | null
  tipo_pagamento?: string | null
  banco_origem?: string | null
  chave_pix?: string | null
  nome_destinatario?: string | null
}

export default function ComprovanteBtn({
  folhaId,
  comprovanteAtual,
  comprovanteDados,
  drivePdfUrl,
}: {
  folhaId: string
  comprovanteAtual?: string | null
  comprovanteDados?: ComprovanteDados | null
  drivePdfUrl?: string | null
}) {
  const [uploading, setUploading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [dados, setDados] = useState<ComprovanteDados | null>(comprovanteDados ?? null)
  const [urlAtual, setUrlAtual] = useState<string | null>(comprovanteAtual ?? null)
  const router = useRouter()

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setErro(null)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch(`/api/folha-pagamento/${folhaId}/comprovante`, {
        method: 'POST',
        body: form,
      })
      const json = await res.json()
      if (!res.ok) {
        setErro(json.error ?? 'Erro ao fazer upload')
        return
      }
      setUrlAtual(json.comprovante_url)
      if (json.comprovante_dados && typeof json.comprovante_dados === 'object') {
        setDados(json.comprovante_dados)
      }
      if (json.gemini_erro) {
        setErro(`Comprovante salvo, mas extração automática falhou: ${json.gemini_erro}`)
      }
      router.refresh()
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const temDados = dados && Object.values(dados).some(v => v != null)

  return (
    <div className="space-y-3">
      {drivePdfUrl && (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>📁 Folha PDF:</span>
          <a href={drivePdfUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline truncate max-w-xs">
            Ver no Drive →
          </a>
        </div>
      )}

      {/* Upload */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          {urlAtual ? 'Substituir comprovante' : 'Enviar comprovante de pagamento'}
        </label>
        <label className={`
          flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg border border-dashed
          text-sm cursor-pointer transition-colors
          ${uploading
            ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-wait'
            : 'bg-white hover:bg-indigo-50 text-indigo-600 border-indigo-300 hover:border-indigo-500'}
        `}>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFile}
            disabled={uploading}
            className="sr-only"
          />
          {uploading ? '⏳ Enviando e analisando...' : '📎 Selecionar arquivo (imagem ou PDF)'}
        </label>
        <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP, HEIC, PDF — Gemini extrai os dados automaticamente</p>
      </div>

      {erro && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          {erro}
        </p>
      )}

      {urlAtual && (
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span>✅ Comprovante:</span>
          <a href={urlAtual} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline truncate max-w-xs">
            Ver arquivo →
          </a>
        </div>
      )}

      {/* Dados extraídos pelo Gemini */}
      {temDados && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-xs space-y-1.5">
          <p className="font-medium text-gray-700 mb-2">Dados extraídos automaticamente</p>
          {dados!.valor != null && (
            <div className="flex gap-2">
              <span className="text-gray-500 w-32 shrink-0">Valor:</span>
              <span className="font-semibold text-gray-900">
                {Number(dados!.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
          )}
          {dados!.data && (
            <div className="flex gap-2">
              <span className="text-gray-500 w-32 shrink-0">Data:</span>
              <span className="text-gray-700">
                {new Date(dados!.data + 'T12:00:00').toLocaleDateString('pt-BR')}
              </span>
            </div>
          )}
          {dados!.tipo_pagamento && (
            <div className="flex gap-2">
              <span className="text-gray-500 w-32 shrink-0">Tipo:</span>
              <span className="text-gray-700">{dados!.tipo_pagamento}</span>
            </div>
          )}
          {dados!.banco_origem && (
            <div className="flex gap-2">
              <span className="text-gray-500 w-32 shrink-0">Banco origem:</span>
              <span className="text-gray-700">{dados!.banco_origem}</span>
            </div>
          )}
          {dados!.chave_pix && (
            <div className="flex gap-2">
              <span className="text-gray-500 w-32 shrink-0">Chave Pix:</span>
              <span className="text-gray-700 font-mono break-all">{dados!.chave_pix}</span>
            </div>
          )}
          {dados!.nome_destinatario && (
            <div className="flex gap-2">
              <span className="text-gray-500 w-32 shrink-0">Destinatário:</span>
              <span className="text-gray-700">{dados!.nome_destinatario}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
