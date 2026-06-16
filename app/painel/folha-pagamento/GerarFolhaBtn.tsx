'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function GerarFolhaBtn({ professorId, mes }: { professorId: string; mes: string }) {
  const [gerando, setGerando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const router = useRouter()

  async function gerar() {
    setGerando(true)
    setErro(null)
    const res = await fetch('/api/folha-pagamento/gerar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ professor_id: professorId, mes }),
    })
    setGerando(false)
    if (res.ok) {
      router.refresh()
    } else {
      const json = await res.json().catch(() => ({}))
      setErro(json.error ?? 'Erro ao gerar folha')
    }
  }

  return (
    <div className="inline-flex flex-col items-end gap-1">
      <button
        onClick={gerar}
        disabled={gerando}
        className="text-xs text-indigo-600 hover:text-indigo-700 font-medium disabled:opacity-50"
      >
        {gerando ? 'Gerando...' : '⟳ Gerar'}
      </button>
      {erro && (
        <p className="text-xs text-red-500 max-w-xs text-right">{erro}</p>
      )}
    </div>
  )
}
