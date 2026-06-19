'use client'

import { useState, useEffect, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'

type AlunoDisponivel = { matricula_id: string; aluno_id: string; nome: string }

export default function AdicionarAlunosModal({ turmaId }: { turmaId: string }) {
  const [aberto, setAberto] = useState(false)
  const [busca, setBusca] = useState('')
  const [alunos, setAlunos] = useState<AlunoDisponivel[]>([])
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set())
  const [carregando, setCarregando] = useState(false)
  const [isPending, startTransition] = useTransition()
  const adicionandoRef = useRef(false)
  const router = useRouter()

  useEffect(() => {
    if (!aberto) return
    setCarregando(true)
    fetch(`/api/turmas/${turmaId}/alunos`)
      .then(r => r.json())
      .then(data => setAlunos(Array.isArray(data) ? data : []))
      .finally(() => setCarregando(false))
  }, [aberto, turmaId])

  function fechar() {
    setAberto(false)
    setBusca('')
    setSelecionados(new Set())
  }

  function toggleAluno(matriculaId: string) {
    setSelecionados(prev => {
      const next = new Set(prev)
      next.has(matriculaId) ? next.delete(matriculaId) : next.add(matriculaId)
      return next
    })
  }

  function toggleTodos() {
    const filtrados = alunosFiltrados.map(a => a.matricula_id)
    const todosMarcados = filtrados.every(id => selecionados.has(id))
    setSelecionados(prev => {
      const next = new Set(prev)
      if (todosMarcados) filtrados.forEach(id => next.delete(id))
      else filtrados.forEach(id => next.add(id))
      return next
    })
  }

  async function adicionar() {
    if (selecionados.size === 0 || adicionandoRef.current) return
    adicionandoRef.current = true
    startTransition(async () => {
      const res = await fetch(`/api/turmas/${turmaId}/alunos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matriculaIds: [...selecionados] }),
      })
      if (res.ok) {
        adicionandoRef.current = false
        fechar()
        router.refresh()
      } else {
        const err = await res.json()
        adicionandoRef.current = false
        alert('Erro: ' + (err.error ?? 'desconhecido'))
      }
    })
  }

  const alunosFiltrados = busca.trim()
    ? alunos.filter(a => a.nome.toLowerCase().includes(busca.toLowerCase()))
    : alunos

  const todosFiltradosMarcados =
    alunosFiltrados.length > 0 && alunosFiltrados.every(a => selecionados.has(a.matricula_id))

  return (
    <>
      <button
        onClick={() => setAberto(true)}
        className="text-xs font-medium text-indigo-600 hover:text-indigo-700 border border-indigo-200 px-3 py-1 rounded-lg"
      >
        + Adicionar alunos
      </button>

      {aberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col max-h-[85vh]">

            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-800">Adicionar alunos à turma</h2>
              <button onClick={fechar} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
            </div>

            {/* Busca */}
            <div className="px-4 pt-3 pb-2">
              <input
                type="text"
                placeholder="Buscar por nome..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                autoFocus
              />
            </div>

            {/* Selecionar todos */}
            {alunosFiltrados.length > 1 && (
              <div className="px-4 pb-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-500 hover:text-gray-700">
                  <input
                    type="checkbox"
                    checked={todosFiltradosMarcados}
                    onChange={toggleTodos}
                    className="rounded text-indigo-600"
                  />
                  Selecionar todos ({alunosFiltrados.length})
                </label>
              </div>
            )}

            {/* Lista */}
            <div className="flex-1 overflow-y-auto px-2 py-1">
              {carregando ? (
                <p className="text-sm text-gray-400 text-center py-8">Carregando...</p>
              ) : alunosFiltrados.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">
                  {busca ? 'Nenhum aluno encontrado.' : 'Todos os alunos já estão nesta turma.'}
                </p>
              ) : (
                alunosFiltrados.map(a => (
                  <label
                    key={a.matricula_id}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selecionados.has(a.matricula_id)}
                      onChange={() => toggleAluno(a.matricula_id)}
                      className="rounded text-indigo-600"
                    />
                    <span className="text-sm text-gray-800">{a.nome}</span>
                  </label>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {selecionados.size > 0 ? `${selecionados.size} selecionado${selecionados.size > 1 ? 's' : ''}` : 'Nenhum selecionado'}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={fechar}
                  className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={adicionar}
                  disabled={selecionados.size === 0 || isPending}
                  className="text-xs font-medium bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isPending ? 'Adicionando...' : `Adicionar ${selecionados.size > 0 ? selecionados.size : ''}`}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  )
}
