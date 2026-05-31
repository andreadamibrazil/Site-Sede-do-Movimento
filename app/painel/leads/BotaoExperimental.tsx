'use client'

import { useState } from 'react'
import AgendarExperimental from './AgendarExperimental'

export default function BotaoExperimental({ leadId, leadNome }: { leadId: string; leadNome: string }) {
  const [aberto, setAberto] = useState(false)
  return (
    <>
      <button
        onClick={() => setAberto(true)}
        className="text-xs text-indigo-600 hover:text-indigo-700 font-medium whitespace-nowrap"
        title="Agendar aula experimental"
      >
        🎭 Exp.
      </button>
      {aberto && <AgendarExperimental leadId={leadId} leadNome={leadNome} onClose={() => setAberto(false)} />}
    </>
  )
}
