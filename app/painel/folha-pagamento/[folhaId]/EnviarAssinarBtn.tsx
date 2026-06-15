'use client'

import { useState } from 'react'

export default function EnviarAssinarBtn({
  folhaId,
  emailProfessor,
}: {
  folhaId: string
  emailProfessor?: string | null
}) {
  const [enviando, setEnviando] = useState(false)
  const [emailInput, setEmailInput] = useState(emailProfessor ?? '')
  const [resultado, setResultado] = useState<{ link?: string; erro?: string } | null>(null)

  async function enviar() {
    if (!emailInput) return
    setEnviando(true)
    const res = await fetch('/api/folha-pagamento/enviar-assinar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folha_id: folhaId, professor_email: emailInput }),
    })
    const json = await res.json()
    setEnviando(false)
    if (json.ok) {
      setResultado({ link: json.link_professor })
    } else {
      setResultado({ erro: json.error })
    }
  }

  if (resultado?.link) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
        <p className="text-sm font-medium text-green-800">✅ Enviado para assinatura!</p>
        <p className="text-xs text-green-600">O professor receberá o email com o link para assinar.</p>
        <a
          href={resultado.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-xs text-indigo-600 underline"
        >
          Ver link direto →
        </a>
      </div>
    )
  }

  if (resultado?.erro) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <p className="text-sm text-red-700">Erro: {resultado.erro}</p>
        <button onClick={() => setResultado(null)} className="text-xs text-red-500 mt-1">Tentar novamente</button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-medium text-gray-700 block mb-1">Email do professor</label>
        <input
          type="email"
          value={emailInput}
          onChange={e => setEmailInput(e.target.value)}
          placeholder="professor@email.com"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>
      <button
        onClick={enviar}
        disabled={enviando}
        className="w-full bg-indigo-600 text-white text-sm font-medium py-2.5 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {enviando ? 'Gerando PDF e enviando...' : '✍️ Enviar para professor assinar'}
      </button>
    </div>
  )
}
