'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Motivo = 'atestado' | 'falta_justificada' | 'engano' | 'dispensa'

const MOTIVOS: { value: Motivo; label: string }[] = [
  { value: 'atestado',         label: 'Atestado médico (pago)' },
  { value: 'falta_justificada', label: 'Falta justificada (pago)' },
  { value: 'engano',           label: 'Lançado por engano (remover)' },
  { value: 'dispensa',         label: 'Dispensado neste dia (não pago)' },
]

export default function EditarItemFolha({
  itemId,
  pago,
  folhaStatus,
}: {
  itemId: string
  pago: boolean
  folhaStatus: string
}) {
  const [aberto, setAberto] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const router = useRouter()

  const bloqueado = folhaStatus === 'assinado' || folhaStatus === 'pago'

  async function aplicar(motivo: Motivo) {
    if (bloqueado) return
    setCarregando(true)

    if (motivo === 'engano') {
      await fetch(`/api/folha-pagamento/itens/${itemId}`, { method: 'DELETE' })
    } else {
      const devePagar = motivo === 'atestado' || motivo === 'falta_justificada'
      await fetch(`/api/folha-pagamento/itens/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pago: devePagar, descricao_motivo: motivo }),
      })
    }

    setCarregando(false)
    setAberto(false)
    router.refresh()
  }

  if (bloqueado) return null

  return (
    <div className="relative">
      <button
        onClick={() => setAberto(v => !v)}
        disabled={carregando}
        title="Editar este item"
        className="text-gray-300 hover:text-gray-500 transition-colors disabled:opacity-30 text-xs px-1"
      >
        ···
      </button>

      {aberto && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setAberto(false)} />
          <div className="absolute right-0 top-6 z-20 bg-white border border-gray-200 rounded-xl shadow-lg py-1 w-52 text-xs">
            {MOTIVOS.map(m => (
              <button
                key={m.value}
                onClick={() => aplicar(m.value)}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors text-gray-700"
              >
                {m.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
