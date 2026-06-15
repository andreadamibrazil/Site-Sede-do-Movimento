'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdicionarAvulsoBtn({
  folhaId,
  folhaStatus,
}: {
  folhaId: string
  folhaStatus: string
}) {
  const [aberto, setAberto] = useState(false)
  const [descricao, setDescricao] = useState('')
  const [valor, setValor] = useState('')
  const [salvando, setSalvando] = useState(false)
  const router = useRouter()

  if (folhaStatus === 'assinado' || folhaStatus === 'pago') return null

  async function salvar() {
    if (!descricao.trim() || !valor) return
    setSalvando(true)
    try {
      await fetch(`/api/folha-pagamento/${folhaId}/avulso`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descricao, valor: Number(valor.replace(',', '.')) }),
      })
      setDescricao('')
      setValor('')
      setAberto(false)
      router.refresh()
    } finally {
      setSalvando(false)
    }
  }

  function fechar() {
    setAberto(false)
    setDescricao('')
    setValor('')
  }

  if (!aberto) {
    return (
      <button
        onClick={() => setAberto(true)}
        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
      >
        + Adicionar item
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <input
        autoFocus
        value={descricao}
        onChange={e => setDescricao(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && salvar()}
        placeholder="Descrição (ex: Passagem, Workshop)"
        className="flex-1 min-w-0 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
      <input
        value={valor}
        onChange={e => setValor(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && salvar()}
        placeholder="R$ valor"
        type="text"
        inputMode="decimal"
        className="w-28 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
      <button
        onClick={salvar}
        disabled={salvando || !descricao.trim() || !valor}
        className="bg-indigo-600 text-white text-sm px-3 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-40"
      >
        {salvando ? '...' : 'Adicionar'}
      </button>
      <button
        onClick={fechar}
        className="text-gray-400 hover:text-gray-600 text-sm px-2 py-2"
      >
        ✕
      </button>
    </div>
  )
}
