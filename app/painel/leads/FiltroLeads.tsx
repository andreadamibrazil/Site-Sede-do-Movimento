'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface Props {
  statusAtual: string
  temperaturaAtual: string
  modalidadeAtual: string
  qtdStatus: Record<string, number>
  qtdTemperatura: Record<string, number>
  modalidades: string[]
}

const STATUS_OPTS = [
  { value: 'todos', label: 'Todos' },
  { value: 'novo', label: 'Novo' },
  { value: 'em_contato', label: 'Em contato' },
  { value: 'experimental_agendada', label: 'Experimental' },
  { value: 'convertido', label: 'Convertido' },
  { value: 'perdido', label: 'Perdido' },
]

const TEMP_OPTS = [
  { value: 'todos', label: 'Todos', color: 'bg-gray-100 text-gray-600' },
  { value: 'quente', label: '🔥 Quente', color: 'bg-red-100 text-red-700' },
  { value: 'morno', label: '☀️ Morno', color: 'bg-orange-100 text-orange-700' },
  { value: 'frio', label: '🧊 Frio', color: 'bg-blue-100 text-blue-700' },
  { value: 'convertido', label: '✅ Convertido', color: 'bg-green-100 text-green-700' },
  { value: 'sem_analise', label: 'Sem análise', color: 'bg-gray-100 text-gray-400' },
]

export default function FiltroLeads({ statusAtual, temperaturaAtual, modalidadeAtual, qtdStatus, qtdTemperatura, modalidades }: Props) {
  const router = useRouter()
  const params = useSearchParams()

  function update(key: string, value: string) {
    const p = new URLSearchParams(params.toString())
    if (value === 'todos' || value === '') p.delete(key)
    else p.set(key, value)
    p.delete('pagina')
    router.push(`/painel/leads?${p.toString()}`)
  }

  return (
    <div className="space-y-3">
      {/* Temperatura */}
      <div className="flex flex-wrap gap-2">
        {TEMP_OPTS.map(opt => {
          const ativo = temperaturaAtual === opt.value || (opt.value === 'todos' && !temperaturaAtual)
          const qtd = opt.value === 'todos'
            ? Object.values(qtdTemperatura).reduce((a, b) => a + b, 0)
            : (qtdTemperatura[opt.value] ?? 0)
          return (
            <button
              key={opt.value}
              onClick={() => update('temperatura', opt.value)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                ativo
                  ? 'border-indigo-500 ring-1 ring-indigo-500 ' + opt.color
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              {opt.label}
              <span className="text-[10px] opacity-60">({qtd})</span>
            </button>
          )
        })}
      </div>

      {/* Status */}
      <div className="flex flex-wrap gap-2 items-center">
        <select
          value={statusAtual || 'todos'}
          onChange={e => update('status', e.target.value)}
          className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          {STATUS_OPTS.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label} {opt.value !== 'todos' && qtdStatus[opt.value] ? `(${qtdStatus[opt.value]})` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Modalidade como chips */}
      {modalidades.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => update('modalidade', '')}
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              !modalidadeAtual
                ? 'border-indigo-500 ring-1 ring-indigo-500 bg-gray-100 text-gray-600'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}
          >
            Todas
          </button>
          {modalidades.map(m => {
            const ativo = modalidadeAtual === m
            return (
              <button
                key={m}
                onClick={() => update('modalidade', ativo ? '' : m)}
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  ativo
                    ? 'border-indigo-500 ring-1 ring-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                {m}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
