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
      <div className="flex items-center gap-1">
        <a
          href={`/api/alunos/${alunoId}/declaracao`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-gray-500 hover:text-gray-700 border border-gray-200 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
          title="Abrir declaração para imprimir/salvar como PDF"
        >
          📄 PDF
        </a>
        <button
          onClick={() => setAberto(true)}
          className={`text-xs font-medium border px-2.5 py-1.5 rounded-lg transition-colors ${
            enviado
              ? 'border-green-300 text-green-700 bg-green-50'
              : 'border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
          title="Enviar declaração por e-mail"
        >
          {enviado ? '✓ Enviado' : '✉ Declaração'}
        </button>
      </div>

      {aberto && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <h2 className="text-base font-semibold text-gray-900">Enviar Declaração de Matrícula</h2>
            <p className="text-sm text-gray-500">
              A declaração será enviada para o e-mail do responsável cadastrado e ficará registrado no log do sistema.
            </p>
            {erro && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{erro}</p>}
            <div className="flex gap-2">
              <button onClick={() => { setAberto(false); setErro('') }} className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2.5 rounded-xl hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={enviarEmail} disabled={enviando} className="flex-1 bg-indigo-600 text-white text-sm font-medium py-2.5 rounded-xl hover:bg-indigo-700 disabled:opacity-40">
                {enviando ? 'Enviando...' : 'Enviar por e-mail'}
              </button>
            </div>
            <p className="text-xs text-gray-400 text-center">
              Ou <a href={`/api/alunos/${alunoId}/declaracao`} target="_blank" className="text-indigo-500 hover:underline">abrir para imprimir / salvar como PDF</a>
            </p>
          </div>
        </div>
      )}
    </>
  )
}
