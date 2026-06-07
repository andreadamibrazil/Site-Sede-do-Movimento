export default function InboxPage() {
  const chatwootUrl = `${process.env.NEXT_PUBLIC_CHATWOOT_URL ?? 'https://crm.sededomovimento.art'}/app/accounts/1/inbox/4`

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex items-center justify-between px-6 py-3 border-b bg-white">
        <h1 className="text-lg font-semibold text-gray-800">Atendimento WhatsApp</h1>
        <a
          href={chatwootUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          Abrir em nova aba ↗
        </a>
      </div>
      <iframe
        src={chatwootUrl}
        className="flex-1 w-full border-0"
        allow="microphone; camera"
        title="Atendimento Sede do Movimento"
      />
    </div>
  )
}
