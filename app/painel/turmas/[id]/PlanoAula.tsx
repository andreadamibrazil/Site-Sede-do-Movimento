'use client'

import { useState, useEffect } from 'react'

export default function PlanoAula({ turmaId, dataInicio, dataFim }: {
  turmaId: string
  dataInicio?: string | null
  dataFim?: string | null
}) {
  const [texto, setTexto] = useState('')
  const [plano, setPlano] = useState<any>(null)
  const [processando, setProcessando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [modoEdicao, setModoEdicao] = useState(false)

  useEffect(() => {
    fetch(`/api/turmas/${turmaId}/plano-aula`)
      .then(r => r.json())
      .then(d => {
        if (d.plano) {
          setPlano(d.plano)
          setTexto(d.plano.texto_original ?? '')
        }
      })
  }, [turmaId])

  async function processar() {
    if (!texto.trim()) return
    setProcessando(true)
    setErro('')
    try {
      const res = await fetch(`/api/turmas/${turmaId}/plano-aula`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto, data_inicio: dataInicio, data_fim: dataFim }),
      })
      const json = await res.json()
      if (!res.ok) { setErro(json.error ?? 'Erro ao processar'); return }
      setPlano({ ...plano, gemini_resumo: json.resumo, gemini_conteudo: json.conteudo, texto_original: texto })
      setModoEdicao(false)
    } catch { setErro('Erro de conexão') }
    finally { setProcessando(false) }
  }

  const conteudo = plano?.gemini_conteudo

  if (!plano && !modoEdicao) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-8 text-center space-y-3">
        <p className="text-sm text-gray-500">Nenhum plano de aula cadastrado para este ciclo.</p>
        <button
          onClick={() => setModoEdicao(true)}
          className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          + Adicionar plano de aula
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Editor */}
      {modoEdicao && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">Texto do plano de aula</h3>
          <p className="text-xs text-gray-400">Cole o plano enviado pelo professor. Pode ser formato livre.</p>
          <textarea
            value={texto}
            onChange={e => setTexto(e.target.value)}
            rows={10}
            placeholder="Ex: Março — Técnica básica de ballet: posições dos pés (1ª, 2ª, 3ª), pliés e relevés. Abril — Introdução ao barre work..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono"
          />
          {erro && <p className="text-xs text-red-600 bg-red-50 rounded px-3 py-2">{erro}</p>}
          <div className="flex gap-2">
            <button
              onClick={processar}
              disabled={processando || !texto.trim()}
              className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-40"
            >
              {processando ? '✨ Processando com IA...' : '✨ Processar com Gemini'}
            </button>
            <button
              onClick={() => { setModoEdicao(false); setTexto(plano?.texto_original ?? '') }}
              className="text-sm text-gray-500 px-4 py-2 hover:text-gray-700"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Resultado estruturado */}
      {plano && !modoEdicao && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">Plano de aula</h3>
            <button onClick={() => setModoEdicao(true)} className="text-xs text-indigo-600 hover:text-indigo-700">
              Editar
            </button>
          </div>

          {/* Resumo */}
          {plano.gemini_resumo && (
            <div className="bg-indigo-50 rounded-xl px-4 py-3 text-sm text-indigo-800">
              {plano.gemini_resumo}
            </div>
          )}

          {conteudo && (
            <div className="grid grid-cols-1 gap-4">
              {/* Objetivos */}
              {conteudo.objetivos?.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Objetivos</h4>
                  <ul className="space-y-1">
                    {conteudo.objetivos.map((o: string, i: number) => (
                      <li key={i} className="text-sm text-gray-700 flex gap-2">
                        <span className="text-indigo-400 mt-0.5">•</span>{o}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Conteúdo por mês */}
              {conteudo.conteudo_por_mes?.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Cronograma</h4>
                  <div className="space-y-3">
                    {conteudo.conteudo_por_mes.map((m: any, i: number) => (
                      <div key={i}>
                        <p className="text-xs font-semibold text-gray-600 mb-1">{m.mes}</p>
                        <ul className="space-y-0.5 pl-3">
                          {m.conteudo?.map((c: string, j: number) => (
                            <li key={j} className="text-sm text-gray-600">— {c}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Metodologia */}
              {conteudo.metodologia && (
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Metodologia</h4>
                  <p className="text-sm text-gray-700">{conteudo.metodologia}</p>
                </div>
              )}

              {/* Avaliação */}
              {conteudo.avaliacao && (
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Avaliação</h4>
                  <p className="text-sm text-gray-700">{conteudo.avaliacao}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
