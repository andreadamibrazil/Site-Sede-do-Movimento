'use client'

import { useState } from 'react'

type Experimental = {
  id: string
  status: string
  leads: { nome: string } | null
  aulas: { data: string; hora_inicio: string; turmas: { nome: string } | null } | null
}

const DIAS = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']

export default function PainelExperimentais({ experimentais }: { experimentais: Experimental[] }) {
  const [aberto, setAberto] = useState(true)

  const futuras = experimentais.filter(e => e.aulas?.data && e.aulas.data >= new Date().toISOString().split('T')[0])
  const passadas = experimentais.filter(e => e.aulas?.data && e.aulas.data < new Date().toISOString().split('T')[0])

  function formatData(iso: string) {
    const d = new Date(iso + 'T12:00:00')
    return `${DIAS[d.getDay()]} ${d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`
  }

  const statusBadge: Record<string, string> = {
    agendado: 'bg-yellow-100 text-yellow-700',
    presente: 'bg-green-100 text-green-700',
    nao_compareceu: 'bg-red-100 text-red-700',
    cancelado: 'bg-gray-100 text-gray-500',
  }
  const statusLabel: Record<string, string> = {
    agendado: 'Agendado',
    presente: 'Compareceu',
    nao_compareceu: 'Faltou',
    cancelado: 'Cancelado',
  }

  return (
    <div className="w-72 shrink-0">
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden sticky top-6">
        <button
          onClick={() => setAberto(!aberto)}
          className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-100 hover:bg-gray-50"
        >
          <div className="flex items-center gap-2">
            <span className="text-base">🎭</span>
            <span className="text-sm font-semibold text-gray-700">Experimentais do mês</span>
            {futuras.length > 0 && (
              <span className="bg-purple-100 text-purple-700 text-xs font-bold px-1.5 py-0.5 rounded-full">
                {futuras.length}
              </span>
            )}
          </div>
          <span className="text-gray-400 text-xs">{aberto ? '▲' : '▼'}</span>
        </button>

        {aberto && (
          <div className="divide-y divide-gray-100 max-h-[70vh] overflow-y-auto">
            {experimentais.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">Nenhum experimental este mês.</p>
            ) : (
              <>
                {futuras.length > 0 && (
                  <>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-2 bg-gray-50">Próximos</p>
                    {futuras.map(e => (
                      <div key={e.id} className="px-4 py-3 bg-yellow-50/50">
                        <p className="text-sm font-medium text-gray-900">{e.leads?.nome ?? '—'}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{e.aulas?.turmas?.nome ?? '—'}</p>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-xs text-purple-700 font-medium">
                            {e.aulas?.data ? formatData(e.aulas.data) : '—'} · {e.aulas?.hora_inicio?.slice(0,5)}
                          </span>
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${statusBadge[e.status] ?? ''}`}>
                            {statusLabel[e.status] ?? e.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </>
                )}
                {passadas.length > 0 && (
                  <>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-2 bg-gray-50">Realizados</p>
                    {passadas.map(e => (
                      <div key={e.id} className="px-4 py-3 opacity-60">
                        <p className="text-sm font-medium text-gray-700">{e.leads?.nome ?? '—'}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-500">
                            {e.aulas?.data ? formatData(e.aulas.data) : '—'}
                          </span>
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${statusBadge[e.status] ?? ''}`}>
                            {statusLabel[e.status] ?? e.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
