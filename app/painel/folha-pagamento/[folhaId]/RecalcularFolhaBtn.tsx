'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RecalcularFolhaBtn({
  professorId,
  mesReferencia,
}: {
  professorId: string
  mesReferencia: string // "2026-05-01" → formata para "2026-05"
}) {
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const router = useRouter()

  const mes = mesReferencia.slice(0, 7) // "2026-05-01" → "2026-05"

  async function recalcular() {
    if (!confirm('Recalcular a folha com os dados atuais das turmas? Os itens avulsos adicionados manualmente serão perdidos.')) return
    setCarregando(true)
    setErro(null)
    try {
      const res = await fetch('/api/folha-pagamento/gerar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ professor_id: professorId, mes }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setErro(json.error ?? 'Erro ao recalcular folha')
        return
      }
      router.push(`/painel/folha-pagamento/${json.folha_id}`)
    } catch {
      setErro('Erro de conexão. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="space-y-1">
      <button
        onClick={recalcular}
        disabled={carregando}
        className="text-xs text-gray-500 hover:text-indigo-600 underline underline-offset-2 disabled:opacity-40"
      >
        {carregando ? 'Recalculando...' : '↺ Recalcular folha com dados atuais das turmas'}
      </button>
      {erro && <p className="text-xs text-red-500">{erro}</p>}
    </div>
  )
}
