'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { CheckResult } from '@/app/api/auditoria/route'

const NIVEL_CONFIG = {
  critico: { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700', dot: 'bg-red-500', label: 'Crítico' },
  atencao: { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-400', label: 'Atenção' },
  ok: { bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-100 text-green-700', dot: 'bg-green-500', label: 'OK' },
}

export default function AuditoriaPage() {
  const [rodando, setRodando] = useState(false)
  const [resultado, setResultado] = useState<{
    resultados: CheckResult[]
    criticos: number
    atencoes: number
    rodadoEm: string
  } | null>(null)
  const [erro, setErro] = useState('')

  async function rodarAuditoria() {
    setRodando(true)
    setErro('')
    try {
      const res = await fetch('/api/auditoria')
      const json = await res.json()
      if (!res.ok) { setErro(json.error ?? 'Erro ao rodar auditoria'); return }
      setResultado(json)
    } catch {
      setErro('Erro de conexão')
    } finally {
      setRodando(false)
    }
  }

  const problemas = resultado?.resultados.filter(r => r.nivel !== 'ok') ?? []
  const oks = resultado?.resultados.filter(r => r.nivel === 'ok') ?? []

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Auditoria do sistema</h1>
          <p className="text-sm text-gray-500 mt-1">
            Verifica inconsistências no banco de dados: turmas, matrículas, chamadas e pagamentos.
          </p>
        </div>
        <button
          onClick={rodarAuditoria}
          disabled={rodando}
          className="flex items-center gap-2 bg-indigo-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
        >
          {rodando ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Verificando...
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {resultado ? 'Rodar novamente' : 'Rodar auditoria'}
            </>
          )}
        </button>
      </div>

      {erro && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{erro}</div>
      )}

      {/* Resumo */}
      {resultado && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-red-600">{resultado.criticos}</p>
            <p className="text-xs text-red-600 font-medium mt-1">Críticos</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-amber-600">{resultado.atencoes}</p>
            <p className="text-xs text-amber-600 font-medium mt-1">Atenção</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{oks.length}</p>
            <p className="text-xs text-green-600 font-medium mt-1">OK</p>
          </div>
        </div>
      )}

      {resultado && (
        <>
          <p className="text-xs text-gray-400">
            Auditoria rodada em {new Date(resultado.rodadoEm).toLocaleString('pt-BR')}
          </p>

          {/* Problemas */}
          {problemas.length > 0 && (
            <div className="space-y-3">
              {problemas.map(check => {
                const cfg = NIVEL_CONFIG[check.nivel]
                return (
                  <div key={check.id} className={`border rounded-xl overflow-hidden ${cfg.border}`}>
                    <div className={`flex items-center justify-between px-4 py-3 ${cfg.bg}`}>
                      <div className="flex items-center gap-2.5">
                        <span className={`w-2 h-2 rounded-full ${cfg.dot} flex-shrink-0`} />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{check.nome}</p>
                          <p className="text-xs text-gray-500">{check.descricao}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cfg.badge} flex-shrink-0 ml-3`}>
                        {check.count}
                      </span>
                    </div>
                    {check.itens.length > 0 && (
                      <div className="bg-white divide-y divide-gray-100">
                        {check.itens.slice(0, 10).map((item, i) => (
                          <div key={i} className="px-4 py-2 flex items-center justify-between">
                            <p className="text-sm text-gray-700">{item.label}</p>
                            {item.href && (
                              <Link href={item.href} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium ml-4 flex-shrink-0">
                                Ver →
                              </Link>
                            )}
                          </div>
                        ))}
                        {check.itens.length > 10 && (
                          <div className="px-4 py-2">
                            <p className="text-xs text-gray-400">+ {check.itens.length - 10} itens adicionais</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* OKs colapsados */}
          {oks.length > 0 && (
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-gray-50 px-4 py-2.5 flex items-center gap-2">
                <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-sm font-medium text-gray-700">{oks.length} verificações sem problemas</p>
              </div>
              <div className="divide-y divide-gray-100">
                {oks.map(check => (
                  <div key={check.id} className="px-4 py-2.5 flex items-center justify-between">
                    <p className="text-sm text-gray-600">{check.nome}</p>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">OK</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {problemas.length === 0 && oks.length > 0 && (
            <div className="text-center py-6">
              <p className="text-2xl mb-2">✅</p>
              <p className="text-sm font-medium text-gray-700">Sistema sem inconsistências</p>
              <p className="text-xs text-gray-400">Todas as verificações passaram.</p>
            </div>
          )}
        </>
      )}

      {!resultado && !rodando && (
        <div className="text-center py-16 text-gray-400">
          <svg className="h-12 w-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <p className="text-sm">Clique em &quot;Rodar auditoria&quot; para verificar o sistema</p>
        </div>
      )}
    </div>
  )
}
