'use client'

const TEMP_ICON: Record<string, string> = { quente: '🔥', morno: '☀️', frio: '🧊' }
const TEMP_CLASS: Record<string, string> = {
  quente: 'bg-red-50 border-red-200 text-red-700',
  morno:  'bg-orange-50 border-orange-200 text-orange-700',
  frio:   'bg-blue-50 border-blue-200 text-blue-500',
}

export default function AbaInteligencia({
  analiseCron,
  historicoAnalises,
}: {
  analiseCron: Record<string, unknown> | null
  historicoAnalises: unknown[]
}) {
  if (!analiseCron && historicoAnalises.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-10 text-center space-y-2">
        <p className="text-gray-400 text-sm">Nenhuma análise disponível para este contato.</p>
        <p className="text-gray-300 text-xs">
          A análise ocorre automaticamente quando há histórico de conversa no WhatsApp.
        </p>
      </div>
    )
  }

  const temp = analiseCron?.temperatura as string

  return (
    <div className="space-y-5">
      {analiseCron && (
        <div className={`border rounded-xl p-5 space-y-3 ${TEMP_CLASS[temp] ?? 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">
              {TEMP_ICON[temp] ?? ''} {temp ? temp.charAt(0).toUpperCase() + temp.slice(1) : 'Sem dados'}
            </span>
            {!!analiseCron.ultima_analise && (
              <span className="text-xs opacity-60">
                Atualizado em {new Date(analiseCron.ultima_analise as string).toLocaleString('pt-BR')}
              </span>
            )}
          </div>
          {!!analiseCron.resumo && (
            <p className="text-sm leading-relaxed">{analiseCron.resumo as string}</p>
          )}
          {!!analiseCron.acao_sugerida && (
            <p className="text-xs font-medium opacity-80">
              Próxima ação: {analiseCron.acao_sugerida as string}
            </p>
          )}
          {Array.isArray(analiseCron.objecoes) && (analiseCron.objecoes as string[]).length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {(analiseCron.objecoes as string[]).map((o: string) => (
                <span key={o} className="text-xs px-2 py-0.5 bg-white/60 rounded-full border border-current/20">
                  {o}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {historicoAnalises.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Histórico de análises ({historicoAnalises.length})
          </h3>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200" />
            <div className="space-y-3">
              {([...historicoAnalises].reverse() as Array<Record<string, unknown>>).map((entrada, i) => {
                const t = entrada.temperatura as string
                return (
                  <div key={i} className="flex gap-4 pl-2">
                    <div className={`relative z-10 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs
                      ${t === 'quente' ? 'bg-red-100 border-red-300' :
                        t === 'morno'  ? 'bg-orange-100 border-orange-300' :
                                        'bg-blue-50 border-blue-200'}`}>
                      {TEMP_ICON[t] ?? '·'}
                    </div>
                    <div className="flex-1 bg-white border border-gray-200 rounded-xl p-4 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-xs font-semibold ${
                          t === 'quente' ? 'text-red-600' :
                          t === 'morno'  ? 'text-orange-600' : 'text-blue-500'
                        }`}>
                          {t ? t.charAt(0).toUpperCase() + t.slice(1) : '—'}
                        </span>
                        <span className="text-xs text-gray-400 shrink-0">
                          {entrada.data
                            ? new Date(entrada.data as string).toLocaleDateString('pt-BR', {
                                day: '2-digit', month: 'short', year: 'numeric',
                              })
                            : '—'}
                        </span>
                      </div>
                      {!!entrada.resumo && (
                        <p className="text-sm text-gray-700 leading-snug">{entrada.resumo as string}</p>
                      )}
                      {!!entrada.mudanca && (
                        <p className="text-xs text-indigo-500 italic">{entrada.mudanca as string}</p>
                      )}
                      <p className="text-xs text-gray-400">
                        {(entrada.mensagens_analisadas as number) ?? 0} mensagens analisadas
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
