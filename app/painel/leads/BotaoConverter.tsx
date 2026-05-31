'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function BotaoConverter({ leadId, leadNome }: { leadId: string; leadNome: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function converter() {
    if (!confirm(`Converter "${leadNome}" em aluno?`)) return
    setLoading(true)
    try {
      const res = await fetch('/api/leads/converter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: leadId }),
      })
      const data = await res.json()
      if (data.aluno_id) {
        router.push(`/painel/alunos/${data.aluno_id}`)
      } else {
        alert(data.error ?? 'Erro ao converter')
        setLoading(false)
      }
    } catch {
      alert('Erro ao converter lead')
      setLoading(false)
    }
  }

  return (
    <button
      onClick={converter}
      disabled={loading}
      className="text-xs text-emerald-600 hover:text-emerald-700 font-medium whitespace-nowrap disabled:opacity-50"
      title="Converter em matrícula"
    >
      {loading ? '...' : '✅ Matricular'}
    </button>
  )
}
