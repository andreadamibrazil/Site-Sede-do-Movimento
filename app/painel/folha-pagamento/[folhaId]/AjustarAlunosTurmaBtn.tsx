'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AjustarAlunosTurmaBtn({
  folhaId,
  turmaId,
  numAlunos,
  folhaStatus,
}: {
  folhaId: string
  turmaId: string
  numAlunos: number
  folhaStatus: string
}) {
  const [editando, setEditando] = useState(false)
  const [valor, setValor] = useState(numAlunos)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const router = useRouter()

  if (folhaStatus !== 'rascunho') {
    return <span>{numAlunos} aluno{numAlunos !== 1 ? 's' : ''} no mês</span>
  }

  function abrir() {
    setValor(numAlunos)
    setErro(null)
    setEditando(true)
  }

  function cancelar() {
    setEditando(false)
    setErro(null)
  }

  async function salvar() {
    if (valor === numAlunos) { cancelar(); return }
    setSalvando(true)
    setErro(null)
    try {
      const res = await fetch(`/api/folha-pagamento/${folhaId}/turma-alunos`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ turma_id: turmaId, num_alunos: valor }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) { setErro(json.error ?? 'Erro ao salvar'); return }
      setEditando(false)
      router.refresh()
    } catch {
      setErro('Erro de conexão. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  if (!editando) {
    return (
      <button
        onClick={abrir}
        className="group text-left hover:text-indigo-600 transition-colors"
        title="Clique para ajustar o número de alunos nesta turma"
      >
        {numAlunos} aluno{numAlunos !== 1 ? 's' : ''} no mês
        <span className="ml-1 text-gray-300 group-hover:text-indigo-400 text-xs">✎</span>
      </button>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 flex-wrap">
      <button
        onClick={() => setValor(v => Math.max(0, v - 1))}
        disabled={salvando}
        className="w-5 h-5 rounded bg-gray-200 hover:bg-gray-300 text-sm font-bold leading-none disabled:opacity-40"
      >
        −
      </button>
      <input
        type="number"
        min={0}
        max={99}
        value={valor}
        onChange={e => setValor(Math.max(0, Math.min(99, Number(e.target.value))))}
        onKeyDown={e => { if (e.key === 'Enter') salvar(); if (e.key === 'Escape') cancelar() }}
        className="w-12 text-center border border-gray-300 rounded text-xs py-0.5 focus:outline-none focus:ring-1 focus:ring-indigo-400"
        autoFocus
      />
      <button
        onClick={() => setValor(v => Math.min(99, v + 1))}
        disabled={salvando}
        className="w-5 h-5 rounded bg-gray-200 hover:bg-gray-300 text-sm font-bold leading-none disabled:opacity-40"
      >
        +
      </button>
      <button
        onClick={salvar}
        disabled={salvando}
        className="text-xs px-2 py-0.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
      >
        {salvando ? '...' : '✓'}
      </button>
      <button
        onClick={cancelar}
        disabled={salvando}
        className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 disabled:opacity-50"
      >
        ✗
      </button>
      {erro && <span className="text-red-500 text-xs w-full">{erro}</span>}
    </span>
  )
}
