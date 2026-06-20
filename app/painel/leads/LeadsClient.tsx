'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

interface LeadCRM {
  temperatura?: string
  oportunidade?: string
  resumo?: string
}

interface Lead {
  id: string
  nome: string
  celular?: string | null
  email?: string | null
  modalidade_interesse?: string | null
  como_conheceu?: string | null
  status: string
  observacoes?: string | null
  created_at?: string | null
  updated_at?: string | null
  crm: LeadCRM
  lead_notas?: { count: number }[]
}

interface Props {
  leads: Lead[]
  totalLeads?: number
}

const STATUS_FUNIL = [
  { value: 'novo',                  label: 'Novo',         color: 'bg-gray-400',   text: 'text-gray-700' },
  { value: 'em_contato',            label: 'Em contato',   color: 'bg-blue-500',   text: 'text-blue-700' },
  { value: 'experimental_agendada', label: 'Experimental', color: 'bg-yellow-400', text: 'text-yellow-700' },
  { value: 'convertido',            label: 'Convertido',   color: 'bg-green-500',  text: 'text-green-700' },
  { value: 'perdido',               label: 'Perdido',      color: 'bg-red-400',    text: 'text-red-700' },
]

export default function LeadsClient({ leads, totalLeads }: Props) {
  const router = useRouter()
  const params = useSearchParams()
  const [mostrarOrigem, setMostrarOrigem] = useState(false)

  const isPaginado = totalLeads !== undefined && totalLeads > leads.length

  // --- Contagem por status ---
  const countPorStatus: Record<string, number> = {}
  for (const lead of leads) {
    countPorStatus[lead.status] = (countPorStatus[lead.status] ?? 0) + 1
  }
  const totalLeadsPagina = leads.length
  const totalFunil = STATUS_FUNIL.reduce((acc, s) => acc + (countPorStatus[s.value] ?? 0), 0)

  // --- Análise por origem ---
  const origemMap: Record<string, { total: number; convertidos: number }> = {}
  for (const lead of leads) {
    const origem = lead.como_conheceu?.trim() || 'Não informado'
    if (!origemMap[origem]) origemMap[origem] = { total: 0, convertidos: 0 }
    origemMap[origem].total += 1
    if (lead.status === 'convertido') origemMap[origem].convertidos += 1
  }

  const tabelaOrigem = Object.entries(origemMap)
    .map(([origem, data]) => ({
      origem,
      total: data.total,
      convertidos: data.convertidos,
      taxa: data.total > 0 ? (data.convertidos / data.total) * 100 : 0,
    }))
    .sort((a, b) => b.taxa - a.taxa || b.total - a.total)

  function filtrarStatus(value: string) {
    const p = new URLSearchParams(params.toString())
    const atual = p.get('status')
    if (atual === value) {
      p.delete('status')
    } else {
      p.set('status', value)
    }
    p.delete('pagina')
    router.push(`/painel/leads?${p.toString()}`)
  }

  const statusAtual = params.get('status') ?? ''

  if (totalLeadsPagina === 0) return null

  return (
    <div className="space-y-4">
      {/* Funil visual */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Funil de leads</h2>
          {isPaginado && (
            <span className="text-[10px] text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
              baseado nos {totalLeadsPagina} leads carregados
            </span>
          )}
        </div>

        {/* Barra segmentada */}
        <div className="flex h-6 rounded-lg overflow-hidden w-full gap-px">
          {STATUS_FUNIL.map(s => {
            const count = countPorStatus[s.value] ?? 0
            const pct = totalFunil > 0 ? (count / totalFunil) * 100 : 0
            if (pct === 0) return null
            return (
              <button
                key={s.value}
                onClick={() => filtrarStatus(s.value)}
                title={`${s.label}: ${count}`}
                style={{ width: `${pct}%` }}
                className={`${s.color} transition-opacity ${statusAtual === s.value ? 'opacity-100 ring-2 ring-offset-1 ring-gray-400' : 'opacity-80 hover:opacity-100'} min-w-[4px]`}
              />
            )
          })}
        </div>

        {/* Legenda clicável */}
        <div className="flex flex-wrap gap-3">
          {STATUS_FUNIL.map(s => {
            const count = countPorStatus[s.value] ?? 0
            if (count === 0) return null
            const pct = totalFunil > 0 ? ((count / totalFunil) * 100).toFixed(0) : '0'
            const ativo = statusAtual === s.value
            return (
              <button
                key={s.value}
                onClick={() => filtrarStatus(s.value)}
                className={`flex items-center gap-1.5 text-xs transition-all rounded-lg px-2 py-1 ${
                  ativo
                    ? 'bg-gray-100 ring-1 ring-gray-300 font-semibold'
                    : 'hover:bg-gray-50'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-sm flex-shrink-0 ${s.color}`} />
                <span className="text-gray-700">{s.label}</span>
                <span className="font-bold text-gray-900">{count}</span>
                <span className="text-gray-400">({pct}%)</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Painel de conversão por origem */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <button
          onClick={() => setMostrarOrigem(v => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
        >
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Conversao por origem
          </span>
          <span className="text-gray-400 text-xs">{mostrarOrigem ? '▲ ocultar' : '▼ ver'}</span>
        </button>

        {mostrarOrigem && (
          <div className="border-t border-gray-100 overflow-x-auto">
            {isPaginado && (
              <p className="text-[10px] text-amber-600 bg-amber-50 px-4 py-2 border-b border-amber-100">
                Dados baseados nos {totalLeadsPagina} leads carregados — pode nao refletir o total.
              </p>
            )}
            <table className="w-full text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-2 text-gray-500 font-semibold uppercase tracking-wider">Origem</th>
                  <th className="text-right px-4 py-2 text-gray-500 font-semibold uppercase tracking-wider">Total</th>
                  <th className="text-right px-4 py-2 text-gray-500 font-semibold uppercase tracking-wider">Convertidos</th>
                  <th className="text-right px-4 py-2 text-gray-500 font-semibold uppercase tracking-wider w-28">Taxa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tabelaOrigem.map(row => (
                  <tr key={row.origem} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-700 max-w-[200px] truncate" title={row.origem}>
                      {row.origem}
                    </td>
                    <td className="px-4 py-2 text-right text-gray-600 tabular-nums">{row.total}</td>
                    <td className="px-4 py-2 text-right tabular-nums">
                      {row.convertidos > 0 ? (
                        <span className="text-green-700 font-medium">{row.convertidos}</span>
                      ) : (
                        <span className="text-gray-300">0</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-full bg-green-400 rounded-full"
                            style={{ width: `${Math.min(row.taxa, 100)}%` }}
                          />
                        </div>
                        <span className={`tabular-nums font-medium w-8 text-right ${row.taxa >= 50 ? 'text-green-700' : row.taxa >= 20 ? 'text-orange-600' : 'text-gray-500'}`}>
                          {row.taxa.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
