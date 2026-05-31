'use client'

import { useState, useRef, useEffect } from 'react'

type Msg = { role: 'user' | 'assistant'; text: string }

const SUGESTOES = [
  'Quantos alunos ativos temos?',
  'Quais leads estão quentes esta semana?',
  'Quem está inadimplente?',
  'Quais chamadas estão pendentes?',
]

export default function AssistenteIA({ collapsed = false }: { collapsed?: boolean }) {
  const [aberto, setAberto] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs, loading])

  async function enviar(texto?: string) {
    const pergunta = (texto ?? input).trim()
    if (!pergunta || loading) return
    setInput('')
    setMsgs(m => [...m, { role: 'user', text: pergunta }])
    setLoading(true)
    try {
      const res = await fetch('/api/painel/assistente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pergunta }),
      })
      const data = await res.json()
      setMsgs(m => [...m, { role: 'assistant', text: data.resposta ?? data.error ?? 'Erro.' }])
    } catch {
      setMsgs(m => [...m, { role: 'assistant', text: 'Erro de conexão.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Botão na sidebar — renderizado inline no PainelSidebar via prop */}
      <button
        onClick={() => setAberto(true)}
        title="Assistente IA"
        className={`flex items-center gap-3 py-2 rounded-lg text-sm transition-colors text-violet-500 hover:bg-violet-50 hover:text-violet-700 w-full ${collapsed ? 'justify-center px-2' : 'px-3'}`}
      >
        <span className="shrink-0 text-base">🤖</span>
        {!collapsed && <span className="truncate">Assistente IA</span>}
      </button>

      {/* Painel lateral */}
      {aberto && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Overlay */}
          <div className="flex-1 bg-black/20" onClick={() => setAberto(false)} />

          {/* Chat */}
          <div className="w-full max-w-md bg-white shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <div>
                <p className="font-semibold text-gray-900">🤖 Assistente IA</p>
                <p className="text-xs text-gray-400">Gemini Flash 2.5 · free tier</p>
              </div>
              <button onClick={() => setAberto(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {msgs.length === 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-400 text-center">Pergunte sobre alunos, leads, turmas ou financeiro</p>
                  {SUGESTOES.map(s => (
                    <button
                      key={s}
                      onClick={() => enviar(s)}
                      className="w-full text-left text-xs bg-gray-50 hover:bg-violet-50 text-gray-600 hover:text-violet-700 px-3 py-2 rounded-lg border border-gray-200 hover:border-violet-200 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
              {msgs.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-violet-600 text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 px-3 py-2 rounded-xl text-sm text-gray-500 rounded-bl-sm">
                    <span className="animate-pulse">Consultando...</span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && enviar()}
                  placeholder="Pergunta sobre o sistema..."
                  className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  disabled={loading}
                />
                <button
                  onClick={() => enviar()}
                  disabled={loading || !input.trim()}
                  className="bg-violet-600 hover:bg-violet-700 text-white px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
                >
                  →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
