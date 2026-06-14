'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

export type TurmaFaixaDado = {
  turma_id: string
  turma_nome: string
  professor_nome: string
  forma_pagamento: string | null
  num_alunos: number
  valor_hora_efetivo: number
  faixa_label: string
  personalizado: boolean
  override_valor: number | null
}

export default function FaixasTurmasTab({ dados }: { dados: TurmaFaixaDado[] }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [editando, setEditando] = useState<string | null>(null)
  const [novoValor, setNovoValor] = useState('')
  const [salvando, setSalvando] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  async function salvarOverride(turmaId: string) {
    const v = parseFloat(novoValor.replace(',', '.'))
    if (isNaN(v) || v <= 0) { setErro('Valor inválido'); return }
    setSalvando(turmaId)
    setErro(null)
    const res = await fetch('/api/folha-pagamento/faixas-turmas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ turma_id: turmaId, valor_hora: v }),
    })
    setSalvando(null)
    if (!res.ok) { setErro('Erro ao salvar'); return }
    setEditando(null)
    startTransition(() => router.refresh())
  }

  async function removerOverride(turmaId: string) {
    setSalvando(turmaId)
    setErro(null)
    await fetch('/api/folha-pagamento/faixas-turmas', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ turma_id: turmaId }),
    })
    setSalvando(null)
    startTransition(() => router.refresh())
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {erro && (
        <div className="px-4 py-2 bg-red-50 border-b border-red-100 text-sm text-red-600">{erro}</div>
      )}
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Turma</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Professor</th>
            <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Alunos</th>
            <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Faixa</th>
            <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">R$/h</th>
            <th className="px-4 py-3 w-48"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {dados.map(d => (
            <tr key={d.turma_id} className={`hover:bg-gray-50 transition-colors ${salvando === d.turma_id ? 'opacity-50' : ''}`}>
              <td className="px-4 py-3 font-medium text-gray-900">{d.turma_nome}</td>
              <td className="px-4 py-3 text-gray-600">{d.professor_nome}</td>
              <td className="px-4 py-3 text-center">
                <span className="font-mono text-gray-800 font-semibold">{d.num_alunos}</span>
              </td>
              <td className="px-4 py-3 text-center">
                {d.personalizado ? (
                  <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">Personalizado</span>
                ) : (
                  <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">{d.faixa_label}</span>
                )}
              </td>
              <td className="px-4 py-3 text-right font-mono font-semibold text-gray-900">
                {`R$${d.valor_hora_efetivo.toFixed(2).replace('.', ',')}`}
              </td>
              <td className="px-4 py-3 text-right">
                {(
                  editando === d.turma_id ? (
                    <div className="flex items-center gap-1 justify-end">
                      <span className="text-xs text-gray-400">R$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={novoValor}
                        onChange={e => setNovoValor(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') salvarOverride(d.turma_id); if (e.key === 'Escape') setEditando(null) }}
                        className="w-20 border border-indigo-300 rounded px-2 py-0.5 text-sm text-right focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="42,00"
                        autoFocus
                      />
                      <button
                        onClick={() => salvarOverride(d.turma_id)}
                        disabled={salvando === d.turma_id}
                        className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded hover:bg-indigo-700 disabled:opacity-50"
                      >
                        Salvar
                      </button>
                      <button
                        onClick={() => setEditando(null)}
                        className="text-xs text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 justify-end">
                      {d.personalizado && (
                        <button
                          onClick={() => removerOverride(d.turma_id)}
                          disabled={salvando === d.turma_id}
                          className="text-xs text-red-400 hover:text-red-600 disabled:opacity-50"
                        >
                          Remover
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setEditando(d.turma_id)
                          setNovoValor(d.override_valor != null ? String(d.override_valor) : '')
                        }}
                        className="text-xs text-gray-400 hover:text-gray-700 hover:underline"
                      >
                        {d.personalizado ? '✏ Editar' : 'Personalizar'}
                      </button>
                    </div>
                  )
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!dados.length && (
        <p className="text-center text-gray-400 text-sm py-12">Nenhuma turma ativa.</p>
      )}
      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-400">
        Faixas globais: até 5 alunos R$31,50/h · 6–10 alunos R$42,00/h · 11+ alunos R$52,50/h
        {' '}· Personalizado sobrepõe as faixas globais para essa turma.
      </div>
    </div>
  )
}
