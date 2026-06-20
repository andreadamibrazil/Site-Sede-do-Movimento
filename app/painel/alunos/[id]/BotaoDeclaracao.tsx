'use client'

import { useState } from 'react'

export default function BotaoDeclaracao({ alunoId }: { alunoId: string }) {
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [erro, setErro] = useState('')
  const [aberto, setAberto] = useState(false)

  async function enviarEmail() {
    setEnviando(true)
    setErro('')
    const res = await fetch(`/api/alunos/${alunoId}/declaracao/enviar`, { method: 'POST' })
    const json = await res.json()
    setEnviando(false)
    if (res.ok) {
      setEnviado(true)
      setAberto(false)
      setTimeout(() => setEnviado(false), 4000)
    } else {
      setErro(json.error ?? 'Erro ao enviar')
    }
  }

  return (
    <>
      <button
        onClick={() => setAberto(true)}
        className={`text-xs font-medium border px-2.5 py-1.5 rounded-lg transition-colors ${
          enviado
            ? 'border-green-300 text-green-700 bg-green-50'
            : 'border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50'
        }`}
        title="Gerar declaração de matrícula (PDF ou e-mail)"
      >
        {enviado ? '✓ Declaração enviada' : '📄 Declaração'}
      </button>

      {aberto && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <h2 className="text-base font-semibold text-gray-900">Declaração de Matrícula</h2>
            {erro && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{erro}</p>}
            <div className="flex gap-2">
              <a
                href={`/api/alunos/${alunoId}/declaracao`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setAberto(false)}
                className="flex-1 border border-gray-200 text-gray-700 text-sm font-medium py-2.5 rounded-xl hover:bg-gray-50 text-center"
              >
                📄 Abrir PDF
              </a>
              <button onClick={enviarEmail} disabled={enviando} className="flex-1 bg-indigo-600 text-white text-sm font-medium py-2.5 rounded-xl hover:bg-indigo-700 disabled:opacity-40">
                {enviando ? 'Enviando...' : '✉ Enviar por e-mail'}
              </button>
            </div>
            <button onClick={() => { setAberto(false); setErro('') }} className="w-full text-xs text-gray-400 hover:text-gray-600">
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  )
}
