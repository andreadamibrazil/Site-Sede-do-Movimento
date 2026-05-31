'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const FILTROS = [
  { id: 'ativo,trancado,inadimplente', label: 'Ativos' },
  { id: 'ativo',                       label: 'Regulares' },
  { id: 'inadimplente',                label: 'Inadimplentes' },
  { id: 'lead,experimental',           label: 'Leads' },
  { id: 'ex_aluno,cancelado',          label: 'Inativos' },
  { id: 'ativo,trancado,inadimplente,lead,experimental,ex_aluno,cancelado', label: 'Todos' },
]

export default function FiltroStatus({
  statusAtual,
  qtd,
}: {
  statusAtual: string
  qtd: Record<string, number>
}) {
  const router = useRouter()

  const totalAtivos = (qtd['ativo'] ?? 0) + (qtd['trancado'] ?? 0) + (qtd['inadimplente'] ?? 0)
  const totalInativos = (qtd['ex_aluno'] ?? 0) + (qtd['cancelado'] ?? 0)
  const totalLeads = (qtd['lead'] ?? 0) + (qtd['experimental'] ?? 0)

  const contagemPorFiltro: Record<string, number> = {
    'ativo,trancado,inadimplente':      totalAtivos,
    'ativo':                            qtd['ativo'] ?? 0,
    'inadimplente':                     qtd['inadimplente'] ?? 0,
    'lead,experimental':                totalLeads,
    'ex_aluno,cancelado':               totalInativos,
    'ativo,trancado,inadimplente,lead,experimental,ex_aluno,cancelado': Object.values(qtd).reduce((a, b) => a + b, 0),
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {FILTROS.map(f => (
        <button
          key={f.id}
          onClick={() => router.push(`/painel/alunos?status=${f.id}`)}
          className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
            statusAtual === f.id
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
          }`}
        >
          {f.label}
          {contagemPorFiltro[f.id] !== undefined && (
            <span className={`ml-1.5 ${statusAtual === f.id ? 'opacity-80' : 'text-gray-400'}`}>
              {contagemPorFiltro[f.id]}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
