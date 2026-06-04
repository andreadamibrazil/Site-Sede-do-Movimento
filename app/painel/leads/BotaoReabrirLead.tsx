'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function BotaoReabrirLead({ leadId }: { leadId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function reabrir() {
    setLoading(true)
    await fetch('/api/leads', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lead_id: leadId, status: 'novo' }),
    })
    setLoading(false)
    router.refresh()
  }

  return (
    <button
      onClick={reabrir}
      disabled={loading}
      className="text-xs text-gray-400 hover:text-indigo-600 font-medium whitespace-nowrap disabled:opacity-50"
      title="Reabrir lead"
    >
      {loading ? '...' : '↩ Reabrir'}
    </button>
  )
}
