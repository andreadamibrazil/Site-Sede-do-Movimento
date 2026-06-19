'use client'

import { useState } from 'react'
import { enviarContratoManual } from '../actions'

export default function BotaoEnviarContrato({
  alunoId,
  emailDestino,
  previewUrl,
}: {
  alunoId: string
  emailDestino: string
  previewUrl?: string
}) {
  const [estado, setEstado] = useState<'idle' | 'enviando' | 'ok' | 'erro'>('idle')
  const [erroMsg, setErroMsg] = useState<string | null>(null)

  async function handleClick() {
    if (!confirm(`Enviar contrato para ${emailDestino}?`)) return
    setEstado('enviando')
    setErroMsg(null)
    const res = await enviarContratoManual(alunoId)
    if ('error' in res) {
      setEstado('erro')
      setErroMsg(res.error)
    } else {
      setEstado('ok')
      setTimeout(() => setEstado('idle'), 4000)
    }
  }

  if (estado === 'ok') {
    return (
      <span className="text-xs text-green-600 font-medium px-3 py-1.5">
        ✓ Contrato enviado para {emailDestino}
      </span>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        {previewUrl && (
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            👁 Ver modelo
          </a>
        )}
        <button
          onClick={handleClick}
          disabled={estado === 'enviando'}
          title={`Enviar contrato para ${emailDestino}`}
          className="text-xs font-medium px-3 py-1.5 rounded-lg border border-amber-300 text-amber-700 hover:bg-amber-50 disabled:opacity-50 transition-colors"
        >
          {estado === 'enviando' ? 'Enviando...' : estado === 'erro' ? '↺ Tentar de novo' : '📄 Enviar contrato'}
        </button>
      </div>
      {estado === 'erro' && erroMsg && (
        <p className="text-xs text-red-600 px-1">✗ {erroMsg}</p>
      )}
    </div>
  )
}
