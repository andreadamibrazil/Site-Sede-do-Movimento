'use client'

import { useState } from 'react'

// ─── Retenção ────────────────────────────────────────────────────────────────

type MesRetencao = {
  mes: string      // "Jan", "Fev" etc
  entradas: number
  saidas: number
}

export function RetencaoChart({ data }: { data: MesRetencao[] }) {
  const max = Math.max(...data.flatMap(d => [d.entradas, d.saidas]), 1)

  return (
    <div>
      <div className="flex items-center gap-4 mb-3">
        <span className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="w-3 h-3 rounded-sm bg-emerald-400 inline-block" /> Entradas
        </span>
        <span className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="w-3 h-3 rounded-sm bg-rose-400 inline-block" /> Saídas
        </span>
      </div>
      <div className="flex items-end gap-3 h-36">
        {data.map((d) => (
          <div key={d.mes} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex items-end gap-0.5 justify-center" style={{ height: 112 }}>
              <div
                title={`${d.entradas} entradas`}
                className="flex-1 bg-emerald-400 rounded-t transition-all"
                style={{ height: `${(d.entradas / max) * 100}%`, minHeight: d.entradas ? 4 : 0 }}
              />
              <div
                title={`${d.saidas} saídas`}
                className="flex-1 bg-rose-400 rounded-t transition-all"
                style={{ height: `${(d.saidas / max) * 100}%`, minHeight: d.saidas ? 4 : 0 }}
              />
            </div>
            <span className="text-[10px] text-gray-400">{d.mes}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Meta ────────────────────────────────────────────────────────────────────

export function MetaBar({ atual, meta }: { atual: number; meta: number }) {
  const pct = Math.min(Math.round((atual / meta) * 100), 100)
  const color = pct >= 90 ? 'bg-emerald-500' : pct >= 60 ? 'bg-blue-500' : 'bg-amber-500'

  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-1.5">
        <span>Meta de alunos 2026</span>
        <span className="font-medium text-gray-700">{atual} / {meta} ({pct}%)</span>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

// ─── Inadimplência ───────────────────────────────────────────────────────────

type Inadimplente = {
  id: string
  nome: string
  celular: string | null
  tentativas_contato: number
}

export function InadimplentesTable({ data }: { data: Inadimplente[] }) {
  const [rows, setRows] = useState(data)
  const [loading, setLoading] = useState<string | null>(null)

  async function incrementar(id: string) {
    setLoading(id)
    try {
      const res = await fetch('/api/painel/inadimplentes/contato', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (res.ok) {
        const { tentativas } = await res.json()
        setRows(r => r.map(row => row.id === id ? { ...row, tentativas_contato: tentativas } : row))
      }
    } finally {
      setLoading(null)
    }
  }

  if (!rows.length) {
    return <p className="text-sm text-gray-400">Nenhum inadimplente no momento. 🎉</p>
  }

  return (
    <div className="divide-y divide-gray-100">
      {rows.map(row => (
        <div key={row.id} className="flex items-center justify-between py-3">
          <div>
            <p className="text-sm font-medium text-gray-900">{row.nome}</p>
            {row.celular && (
              <a
                href={`https://wa.me/55${row.celular.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1 mt-0.5"
              >
                <span>📱</span> {row.celular}
              </a>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">
              {row.tentativas_contato === 0 ? 'Sem contato' : `${row.tentativas_contato}× contatado`}
            </span>
            <button
              onClick={() => incrementar(row.id)}
              disabled={loading === row.id}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded transition-colors disabled:opacity-50"
            >
              {loading === row.id ? '...' : '+1 contato'}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
