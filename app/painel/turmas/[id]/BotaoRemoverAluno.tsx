'use client'

import { useTransition } from 'react'
import { removerAlunoDaTurma } from '../actions'

export default function BotaoRemoverAluno({
  matriculaTurmaId,
  alunoNome,
  turmaId,
}: {
  matriculaTurmaId: string
  alunoNome: string
  turmaId: string
}) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (
      !confirm(
        `Remover "${alunoNome}" desta turma?\n\nIsso apenas remove o aluno da lista da turma. A matrícula continua ativa.`
      )
    )
      return
    startTransition(async () => {
      await removerAlunoDaTurma(matriculaTurmaId, turmaId)
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="text-xs text-red-400 hover:text-red-600 disabled:opacity-40 transition-colors"
      title="Remover da turma"
    >
      {isPending ? '...' : 'Remover'}
    </button>
  )
}
