'use client'

import { useEffect } from 'react'

export default function InboxPage() {
  const chatwootUrl = process.env.NEXT_PUBLIC_CHATWOOT_URL ?? 'https://crm.sededomovimento.art'

  useEffect(() => {
    // Auto-redireciona para o Chatwoot via SSO em nova aba
  }, [])

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] gap-6 bg-gray-50">
      <div className="text-center">
        <div className="text-4xl mb-4">💬</div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">Atendimento WhatsApp</h1>
        <p className="text-gray-500 text-sm mb-6">
          Abra o Chatwoot para ver e responder as conversas da Sede do Movimento.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/api/painel/chatwoot-sso"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Abrir Atendimento
            <span className="text-xs opacity-75">↗</span>
          </a>
          <a
            href={`${chatwootUrl}/app/accounts/1/conversations`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Abrir direto
          </a>
        </div>
      </div>
    </div>
  )
}
