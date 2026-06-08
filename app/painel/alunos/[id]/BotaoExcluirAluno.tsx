'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { excluirAluno } from '../actions'

export default function BotaoExcluirAluno({ alunoId, alunoNome }: { alunoId: string; alunoNome: string }) {
  const [confirmando, setConfirmando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const router = useRouter()

  async function excluir() {
    setSalvando(true)
    try {
      await excluirAluno(alunoId)
      router.push('/painel/alunos')
    } catch (e) {
      alert('Erro ao excluir: ' + (e as Error).message)
      setSalvando(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setConfirmando(true)}
        className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
        title="Excluir aluno"
      >
        Excluir
      </button>

      {confirmando && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Excluir aluno?</h2>
              <p className="text-sm text-gray-500 mt-1">
                <strong>{alunoNome}</strong> será marcado como excluído e não vai aparecer nas listas e contagens.
                O histórico financeiro e de presença fica preservado.
              </p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs text-yellow-700">
              Isso não apaga dados do banco — só remove da lista ativa. Se precisar recuperar, fala com o suporte.
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmando(false)}
                className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2.5 rounded-xl hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={excluir}
                disabled={salvando}
                className="flex-1 bg-red-600 text-white text-sm font-medium py-2.5 rounded-xl hover:bg-red-700 disabled:opacity-40"
              >
                {salvando ? 'Excluindo...' : 'Sim, excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
