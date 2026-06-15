'use client'

import { useTransition } from 'react'
import { atualizarStatusTurma } from '../actions'

export default function BotaoReativarTurma({ turmaId }: { turmaId: string }) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      await atualizarStatusTurma(turmaId, 'ativa')
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="text-xs font-medium text-green-600 hover:text-green-700 border border-green-200 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-lg disabled:opacity-40 transition-colors"
    >
      {isPending ? 'Reativando...' : 'Reativar turma'}
    </button>
  )
}
