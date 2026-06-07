'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Horario = { dia_semana: string; hora_inicio: string; hora_fim: string }

export type TurmaComHorarios = {
  id: string
  nome: string
  capacidade: number
  preco_padrao: number
  status: string
  nivel: string | null
  modalidades: { nome: string } | null
  professores: { nome: string } | null
  salas: { nome: string } | null
  horarios: Horario[]
}

const DIAS: Record<string, string> = {
  segunda: 'Seg', terca: 'Ter', quarta: 'Qua', quinta: 'Qui',
  sexta: 'Sex', sabado: 'Sáb', domingo: 'Dom',
}
const DIA_ORDER: Record<string, number> = {
  segunda: 0, terca: 1, quarta: 2, quinta: 3, sexta: 4, sabado: 5, domingo: 6,
}

function formatHorarios(horarios: Horario[]): string {
  if (!horarios.length) return ''
  const groups: Record<string, string[]> = {}
  horarios.forEach(h => {
    const key = `${h.hora_inicio.slice(0, 5)}–${h.hora_fim.slice(0, 5)}`
    if (!groups[key]) groups[key] = []
    groups[key].push(h.dia_semana)
  })
  return Object.entries(groups).map(([time, dias]) => {
    const sorted = dias.sort((a, b) => DIA_ORDER[a] - DIA_ORDER[b])
    return `${sorted.map(d => DIAS[d]).join(', ')} · ${time}`
  }).join(' | ')
}

export default function TurmasClient({
  turmas: inicial,
  isAdmin,
  contagemPorTurma,
}: {
  turmas: TurmaComHorarios[]
  isAdmin: boolean
  contagemPorTurma: Record<string, number>
}) {
  const supabase = createClient()
  const router = useRouter()
  const [editando, setEditando] = useState<string | null>(null)
  const [precoTemp, setPrecoTemp] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [turmas, setTurmas] = useState(inicial)

  async function salvarPreco(id: string) {
    const valor = parseFloat(precoTemp.replace(',', '.'))
    if (isNaN(valor) || valor <= 0) return
    setSalvando(true)
    await supabase.from('turmas').update({ preco_padrao: valor }).eq('id', id)
    setTurmas(ts => ts.map(t => t.id === id ? { ...t, preco_padrao: valor } : t))
    setSalvando(false)
    setEditando(null)
  }

  return (
    <div className="grid gap-3">
      {turmas.map((turma) => {
        const alunos = contagemPorTurma[turma.id] ?? 0
        const ocupacao = turma.capacidade > 0 ? Math.round((alunos / turma.capacidade) * 100) : 0
        const barColor = ocupacao >= 90 ? 'bg-red-400' : ocupacao >= 70 ? 'bg-orange-400' : 'bg-green-400'
        const horarioStr = formatHorarios(turma.horarios)
        const isEditandoPreco = editando === turma.id

        return (
          <div
            key={turma.id}
            className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center gap-5 hover:border-indigo-300 transition-colors"
          >
            <a href={`/painel/turmas/${turma.id}`} className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-900">{turma.nome}</p>
                {turma.status !== 'ativa' && (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                    {turma.status}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {turma.modalidades?.nome}
                {turma.professores?.nome ? ` · ${turma.professores.nome}` : ''}
                {turma.salas?.nome ? ` · Sala ${turma.salas.nome}` : ''}
              </p>
              {horarioStr && (
                <p className="text-xs text-indigo-500 mt-0.5 font-medium">{horarioStr}</p>
              )}
            </a>

            <div className="w-32 shrink-0">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{alunos}/{turma.capacidade}</span>
                <span>{ocupacao}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${barColor}`} style={{ width: `${Math.min(ocupacao, 100)}%` }} />
              </div>
            </div>

            <div className="text-right shrink-0 min-w-[90px]">
              {isEditandoPreco ? (
                <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                  <span className="text-xs text-gray-400">R$</span>
                  <input
                    type="number"
                    value={precoTemp}
                    onChange={e => setPrecoTemp(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') salvarPreco(turma.id)
                      if (e.key === 'Escape') setEditando(null)
                    }}
                    autoFocus
                    className="w-20 text-sm font-semibold border border-indigo-300 rounded px-1 py-0.5 text-right focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    onClick={() => salvarPreco(turma.id)}
                    disabled={salvando}
                    className="text-xs text-white bg-indigo-600 px-1.5 py-0.5 rounded hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {salvando ? '…' : '✓'}
                  </button>
                  <button onClick={() => setEditando(null)} className="text-xs text-gray-400 hover:text-gray-600">✕</button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 justify-end">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      R$ {turma.preco_padrao?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-gray-400">/mês</p>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={e => {
                        e.preventDefault()
                        setPrecoTemp(String(turma.preco_padrao))
                        setEditando(turma.id)
                      }}
                      className="text-gray-300 hover:text-indigo-500 transition-colors p-0.5"
                      title="Editar preço"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      })}
      {!turmas.length && (
        <p className="text-center text-gray-400 text-sm py-12">Nenhuma turma cadastrada ainda.</p>
      )}
    </div>
  )
}
