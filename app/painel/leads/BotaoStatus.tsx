'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const STATUS_OPTS = [
  { value: 'novo',                  label: 'Novo',         className: 'bg-gray-100 text-gray-600' },
  { value: 'em_contato',            label: 'Em contato',   className: 'bg-blue-100 text-blue-700' },
  { value: 'experimental_agendada', label: 'Experimental', className: 'bg-purple-100 text-purple-700' },
  { value: 'convertido',            label: 'Convertido',   className: 'bg-green-100 text-green-700' },
  { value: 'perdido',               label: 'Perdido',      className: 'bg-gray-100 text-gray-400' },
]

export default function BotaoStatus({ leadId, status: statusInicial }: { leadId: string; status: string }) {
  const router = useRouter()
  const [status, setStatus] = useState(statusInicial)
  const [aberto, setAberto] = useState(false)
  const [salvando, setSalvando] = useState(false)

  const atual = STATUS_OPTS.find(o => o.value === status) ?? STATUS_OPTS[0]

  async function mudar(novoStatus: string) {
    if (novoStatus === status) { setAberto(false); return }
    setSalvando(true)
    setAberto(false)
    try {
      await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: leadId, status: novoStatus }),
      })
      setStatus(novoStatus)
      router.refresh()
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setAberto(v => !v)}
        disabled={salvando}
        title="Clique para mudar status"
        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium hover:opacity-80 transition-opacity cursor-pointer ${atual.className}`}
      >
        {salvando ? '…' : atual.label}
      </button>
      {aberto && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setAberto(false)} />
          <div className="absolute z-20 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[150px]">
            {STATUS_OPTS.map(opt => (
              <button
                key={opt.value}
                onClick={() => mudar(opt.value)}
                className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 transition-colors ${opt.value === status ? 'bg-gray-50' : ''}`}
              >
                <span className={`inline-flex px-2 py-0.5 rounded-full font-medium ${opt.className}`}>{opt.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
