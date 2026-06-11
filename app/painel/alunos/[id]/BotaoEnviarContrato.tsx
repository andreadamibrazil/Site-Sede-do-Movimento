'use client'

import { useState } from 'react'
import { enviarContratoManual } from '../actions'

export default function BotaoEnviarContrato({
  alunoId,
  emailDestino,
}: {
  alunoId: string
  emailDestino: string
}) {
  const [estado, setEstado] = useState<'idle' | 'enviando' | 'ok' | 'erro'>('idle')

  async function handleClick() {
    if (!confirm(`Enviar contrato para ${emailDestino}?`)) return
    setEstado('enviando')
    const res = await enviarContratoManual(alunoId)
    setEstado(res.error ? 'erro' : 'ok')
    if (!res.error) setTimeout(() => setEstado('idle'), 3000)
  }

  if (estado === 'ok') {
    return (
      <span className="text-xs text-green-600 font-medium px-3 py-1.5">
        ✓ Contrato enviado
      </span>
    )
  }

  return (
    <button
      onClick={handleClick}
      disabled={estado === 'enviando'}
      title={`Enviar contrato para ${emailDestino}`}
      className="text-xs font-medium px-3 py-1.5 rounded-lg border border-amber-300 text-amber-700 hover:bg-amber-50 disabled:opacity-50 transition-colors"
    >
      {estado === 'enviando' ? 'Enviando...' : estado === 'erro' ? '✗ Erro — tentar de novo' : '📄 Enviar contrato'}
    </button>
  )
}
