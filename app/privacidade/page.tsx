export const metadata = {
  title: 'Política de Privacidade — Sede do Movimento',
}

export default function PrivacidadePage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 text-gray-800">
      <h1 className="text-3xl font-bold mb-8">Política de Privacidade</h1>

      <p className="text-sm text-gray-500 mb-8">Última atualização: junho de 2026</p>

      <section className="space-y-6 text-base leading-relaxed">
        <p>
          A Sede do Movimento respeita a sua privacidade. Esta política descreve como coletamos,
          usamos e protegemos as informações fornecidas ao nos contatar via WhatsApp ou outros canais.
        </p>

        <h2 className="text-xl font-semibold mt-8">Dados coletados</h2>
        <p>
          Podemos coletar nome, número de telefone e conteúdo das mensagens enviadas para fins de
          atendimento e comunicação sobre nossas atividades artísticas e educacionais.
        </p>

        <h2 className="text-xl font-semibold mt-8">Uso das informações</h2>
        <p>
          As informações são usadas exclusivamente para responder dúvidas, realizar matrículas e
          enviar comunicados relacionados à Sede do Movimento. Não compartilhamos dados com terceiros.
        </p>

        <h2 className="text-xl font-semibold mt-8">Armazenamento</h2>
        <p>
          Os dados são armazenados de forma segura e mantidos apenas pelo tempo necessário para
          a prestação do serviço.
        </p>

        <h2 className="text-xl font-semibold mt-8">Contato</h2>
        <p>
          Em caso de dúvidas sobre esta política, entre em contato pelo e-mail{' '}
          <a href="mailto:contato@sededomovimento.art" className="text-indigo-600 underline">
            contato@sededomovimento.art
          </a>.
        </p>
      </section>
    </main>
  )
}
