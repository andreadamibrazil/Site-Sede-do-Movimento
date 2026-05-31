'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition, useState } from 'react'

export default function BuscaAluno() {
  const router = useRouter()
  const params = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [valor, setValor] = useState(params.get('busca') ?? '')

  function buscar(texto: string) {
    setValor(texto)
    const status = params.get('status') ?? 'ativo,trancado,inadimplente'
    const url = texto
      ? `/painel/alunos?status=${status}&busca=${encodeURIComponent(texto)}`
      : `/painel/alunos?status=${status}`
    startTransition(() => router.push(url))
  }

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
      <input
        value={valor}
        onChange={e => buscar(e.target.value)}
        placeholder="Buscar por nome..."
        className={`pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
          isPending ? 'opacity-60' : ''
        }`}
      />
      {valor && (
        <button
          onClick={() => buscar('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
        >×</button>
      )}
    </div>
  )
}
