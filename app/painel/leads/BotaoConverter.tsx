'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function BotaoConverter({ leadId, leadNome }: { leadId: string; leadNome: string }) {
  const [modal, setModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function converterDireto() {
    // Lead É o aluno — adulto que se matriculou diretamente
    setLoading(true)
    const res = await fetch('/api/leads/converter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lead_id: leadId }),
    })
    const data = await res.json()
    if (data.aluno_id) {
      router.push(`/painel/alunos/${data.aluno_id}`)
    } else {
      alert(data.error ?? 'Erro ao converter')
      setLoading(false)
    }
  }

  function irParaNovoAluno() {
    // Lead é responsável — redireciona para novo aluno com lead pré-preenchido como responsável
    router.push(`/painel/alunos/novo?resp_lead_id=${leadId}`)
  }

  return (
    <>
      <button
        onClick={() => setModal(true)}
        className="text-xs text-emerald-600 hover:text-emerald-700 font-medium whitespace-nowrap"
        title="Converter em matrícula"
      >
        ✅ Matricular
      </button>

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Quem vai fazer aula?</h2>
              <p className="text-sm text-gray-500 mt-1">
                <strong>{leadNome}</strong> vai fazer aula ou é responsável por quem vai?
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => { setModal(false); converterDireto() }}
                disabled={loading}
                className="w-full text-left border border-gray-200 rounded-xl p-4 hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
              >
                <p className="text-sm font-semibold text-gray-900">🧑 Próprio aluno</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {leadNome} vai fazer aula — adulto que entrou em contato por conta própria
                </p>
              </button>

              <button
                onClick={() => { setModal(false); irParaNovoAluno() }}
                className="w-full text-left border border-gray-200 rounded-xl p-4 hover:bg-purple-50 hover:border-purple-300 transition-colors"
              >
                <p className="text-sm font-semibold text-gray-900">👨‍👧 Responsável</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {leadNome} é pai/mãe — cadastrar filho(a) como aluno e vincular {leadNome} como responsável
                </p>
              </button>
            </div>

            <button
              onClick={() => setModal(false)}
              className="w-full text-sm text-gray-400 hover:text-gray-600 py-1"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </>
  )
}
