'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function GerarTodosBtn({
  professorIds,
  mes,
  semFolha,
}: {
  professorIds: string[]
  mes: string
  semFolha: number
}) {
  const [rodando, setRodando] = useState(false)
  const [progresso, setProgresso] = useState(0)
  const [erros, setErros] = useState<string[]>([])
  const router = useRouter()

  async function gerarTodos() {
    if (!professorIds.length) return
    setRodando(true)
    setProgresso(0)
    setErros([])
    const novosErros: string[] = []

    for (let i = 0; i < professorIds.length; i++) {
      const res = await fetch('/api/folha-pagamento/gerar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ professor_id: professorIds[i], mes }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        novosErros.push(j.error ?? `Erro professor ${i + 1}`)
      }
      setProgresso(i + 1)
    }

    setRodando(false)
    setErros(novosErros)
    router.refresh()
  }

  if (semFolha === 0) return null

  return (
    <div className="flex items-center gap-3">
      {erros.length > 0 && (
        <span className="text-xs text-red-500">{erros.length} erro(s)</span>
      )}
      <button
        onClick={gerarTodos}
        disabled={rodando}
        className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {rodando
          ? `Gerando ${progresso}/${professorIds.length}...`
          : `⟳ Gerar todos (${semFolha})`}
      </button>
    </div>
  )
}
