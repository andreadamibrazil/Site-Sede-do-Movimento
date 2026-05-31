'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function GerarFolhaBtn({ professorId, mes }: { professorId: string; mes: string }) {
  const [gerando, setGerando] = useState(false)
  const router = useRouter()

  async function gerar() {
    setGerando(true)
    const res = await fetch('/api/folha-pagamento/gerar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ professor_id: professorId, mes }),
    })
    setGerando(false)
    if (res.ok) router.refresh()
  }

  return (
    <button
      onClick={gerar}
      disabled={gerando}
      className="text-xs text-indigo-600 hover:text-indigo-700 font-medium disabled:opacity-50"
    >
      {gerando ? 'Gerando...' : '⟳ Gerar'}
    </button>
  )
}
