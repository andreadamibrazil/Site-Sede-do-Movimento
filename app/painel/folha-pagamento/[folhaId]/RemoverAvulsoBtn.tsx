'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RemoverAvulsoBtn({
  itemId,
  folhaStatus,
}: {
  itemId: string
  folhaStatus: string
}) {
  const [removendo, setRemovendo] = useState(false)
  const router = useRouter()

  if (folhaStatus === 'assinado' || folhaStatus === 'pago') return null

  async function remover() {
    setRemovendo(true)
    try {
      await fetch(`/api/folha-pagamento/itens/${itemId}`, { method: 'DELETE' })
      router.refresh()
    } finally {
      setRemovendo(false)
    }
  }

  return (
    <button
      onClick={remover}
      disabled={removendo}
      title="Remover item avulso"
      className="text-red-400 hover:text-red-600 transition-colors disabled:opacity-30 text-xs px-1"
    >
      {removendo ? '...' : '✕'}
    </button>
  )
}
