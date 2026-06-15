'use client'

import { useState, useEffect } from 'react'

export type Sexo = 'masculino' | 'feminino' | 'outro' | 'prefiro_nao_informar'

export type AlunoItem = {
  id: string
  nome: string
  sexo: Sexo
  isExperimental: boolean
}

export type ContatoLembrete = {
  key: string
  phone: string | null
  canContact: boolean
  alunos: AlunoItem[]
  responsavelNome?: string
}

export type AulaLembrete = {
  id: string
  turmaId: string
  turmaNome: string
  horaInicio: string
  horaFim: string
  contatos: ContatoLembrete[]
}

function artDe(sexo: Sexo): string {
  if (sexo === 'feminino') return 'da'
  if (sexo === 'masculino') return 'do'
  return 'de'
}

function artO(sexo: Sexo): string {
  if (sexo === 'feminino') return 'a'
  if (sexo === 'masculino') return 'o'
  return ''
}

function primeiroNome(nome: string): string {
  return nome.split(' ')[0]
}

function buildMessage(contato: ContatoLembrete, turmaNome: string, classStarted: boolean): string {
  const { alunos, responsavelNome } = contato

  if (!responsavelNome) {
    const nome = primeiroNome(alunos[0].nome)
    if (classStarted) {
      return `Oi ${nome}! A aula de ${turmaNome} acabou de começar... tá por onde? Dá tempo de chegar ainda! Passando pra saber se você já tá no caminho 😊`
    }
    return `Oi ${nome}! A aula de ${turmaNome} já vai começar 😊 Você está chegando?`
  }

  const resp = primeiroNome(responsavelNome)

  if (alunos.length === 1) {
    const a = alunos[0]
    const nome = primeiroNome(a.nome)
    if (classStarted) {
      return `Oi ${resp}! A aula de ${turmaNome} ${artDe(a.sexo)} ${nome} acabou de começar... tá por onde? Dá tempo de chegar ainda! 😊`
    }
    return `Oi ${resp}! A aula de ${turmaNome} ${artDe(a.sexo)} ${nome} já vai começar 😊 Vocês estão chegando?`
  }

  // Múltiplos filhos
  const nomes = alunos.map(a => {
    const art = artO(a.sexo)
    return art ? `${art} ${primeiroNome(a.nome)}` : primeiroNome(a.nome)
  })
  const lista = nomes.slice(0, -1).join(', ') + ' e ' + nomes[nomes.length - 1]
  const listaCap = lista.charAt(0).toUpperCase() + lista.slice(1)

  if (classStarted) {
    return `Oi ${resp}! A aula de ${turmaNome} acabou de começar... ${lista} já estão chegando? Dá tempo ainda! 😊`
  }
  return `Oi ${resp}! ${listaCap} têm aula de ${turmaNome} em breve! Vocês estão chegando? 😊`
}

type ModalProps = {
  aula: AulaLembrete
  contato: ContatoLembrete
  classStarted: boolean
  onClose: () => void
  onSent: (key: string, phone: string) => void
}

function LembreteModal({ aula, contato, classStarted, onClose, onSent }: ModalProps) {
  const [text, setText] = useState(() => buildMessage(contato, aula.turmaNome, classStarted))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSend() {
    if (!contato.phone) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/painel/lembrar-aula', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: contato.phone, message: text }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError((data as any).error ?? 'Erro ao enviar')
        return
      }
      onSent(contato.key, contato.phone)
      onClose()
    } catch {
      setError('Erro de rede')
    } finally {
      setLoading(false)
    }
  }

  const destinatario = contato.responsavelNome
    ? `${contato.responsavelNome} (responsável de ${contato.alunos.map(a => primeiroNome(a.nome)).join(' e ')})`
    : contato.alunos[0].nome

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-5 pt-5 pb-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Lembrete via WhatsApp</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
          </div>

          <p className="text-xs text-gray-500 mb-3">
            Para: <span className="font-medium text-gray-700">{destinatario}</span>
            {contato.phone && <span className="ml-1 text-gray-400">· {contato.phone}</span>}
          </p>

          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            rows={5}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
          />

          {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
        </div>

        <div className="px-5 pb-5 flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">
            Cancelar
          </button>
          <button
            onClick={handleSend}
            disabled={loading || !text.trim()}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors"
          >
            {loading ? 'Enviando...' : '📱 Enviar'}
          </button>
        </div>
      </div>
    </div>
  )
}

type Props = { aulas: AulaLembrete[] }

export default function AulasHoje({ aulas }: Props) {
  const [modal, setModal] = useState<{ aula: AulaLembrete; contato: ContatoLembrete } | null>(null)
  const [sent, setSent] = useState<Set<string>>(new Set())
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({})
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  function handleSent(key: string, phone: string) {
    setSent(prev => new Set([...prev, key]))
    setCooldowns(prev => ({ ...prev, [phone]: Date.now() + 3 * 60 * 1000 }))
  }

  function cooldownSecs(phone: string | null): number {
    if (!phone) return 0
    return Math.max(0, Math.ceil(((cooldowns[phone] ?? 0) - now) / 1000))
  }

  if (!aulas.length) return null

  return (
    <>
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          📣 Lembretes de aula
        </h2>
        <div className="space-y-3">
          {aulas.map(aula => {
            const todayStr = new Date().toISOString().slice(0, 10)
            const classStarted = Date.now() >= new Date(`${todayStr}T${aula.horaInicio}`).getTime()

            return (
              <div key={aula.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{aula.turmaNome}</p>
                    <p className="text-xs text-gray-500">
                      {aula.horaInicio.slice(0, 5)} – {aula.horaFim.slice(0, 5)}
                      {classStarted && (
                        <span className="ml-1.5 text-orange-500 font-medium">· em andamento</span>
                      )}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">{aula.contatos.length} contato(s)</span>
                </div>

                <div className="divide-y divide-gray-50">
                  {aula.contatos.map(contato => {
                    const isSent = sent.has(contato.key)
                    const secs = cooldownSecs(contato.phone)
                    const inCooldown = secs > 0

                    const label = contato.responsavelNome
                      ? `${contato.alunos.map(a => primeiroNome(a.nome)).join(' e ')} · ${primeiroNome(contato.responsavelNome)}`
                      : contato.alunos[0].nome

                    return (
                      <div key={contato.key} className="px-4 py-2.5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-sm text-gray-800 truncate">{label}</span>
                          {contato.alunos.some(a => a.isExperimental) && (
                            <span title="Experimental" className="text-xs shrink-0">🧪</span>
                          )}
                        </div>

                        <div className="shrink-0">
                          {isSent ? (
                            <span className="text-xs text-green-600 font-medium">✓ enviado</span>
                          ) : inCooldown ? (
                            <span className="text-xs text-gray-400 tabular-nums">
                              {Math.floor(secs / 60)}:{String(secs % 60).padStart(2, '0')}
                            </span>
                          ) : (
                            <button
                              disabled={!contato.canContact}
                              onClick={() => contato.canContact && setModal({ aula, contato })}
                              title={!contato.canContact ? 'Sem contato cadastrado' : undefined}
                              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                                contato.canContact
                                  ? 'bg-green-50 text-green-700 hover:bg-green-100'
                                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              }`}
                            >
                              📱 Lembrar
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {modal && (
        <LembreteModal
          aula={modal.aula}
          contato={modal.contato}
          classStarted={
            Date.now() >= new Date(`${new Date().toISOString().slice(0, 10)}T${modal.aula.horaInicio}`).getTime()
          }
          onClose={() => setModal(null)}
          onSent={handleSent}
        />
      )}
    </>
  )
}
