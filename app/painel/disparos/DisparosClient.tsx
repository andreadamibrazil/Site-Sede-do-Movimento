'use client'

import { useState, useRef } from 'react'

type Turma = {
  id: string
  nome: string
  whatsapp_group_id: string | null
  modalidades: { nome: string } | null
}

type Destinatario = {
  id: string
  tipo: 'numero' | 'grupo' | 'aluno'
  destino: string
  label: string
  nome_aluno?: string
  nome_responsavel?: string
  turma?: string
  modalidade?: string
}

type ResultadoEnvio = { id: string; ok: boolean }

const VARIAVEIS = [
  { chave: 'nome_responsavel', label: 'Responsável' },
  { chave: 'nome_aluno',       label: 'Aluno(a)' },
  { chave: 'turma',            label: 'Turma' },
  { chave: 'modalidade',       label: 'Modalidade' },
  { chave: 'nome',             label: 'Nome' },
]

const DELAYS = [
  { label: 'Sem delay (teste)', ms: 0 },
  { label: '30 segundos',       ms: 30_000 },
  { label: '1 minuto',          ms: 60_000 },
  { label: '2 minutos',         ms: 120_000 },
  { label: '3 minutos',         ms: 180_000 },
  { label: '4 minutos',         ms: 240_000 },
]

function interpolarPreview(texto: string): string {
  return texto
    .replace(/\{nome_responsavel\}/g, 'Maria Silva')
    .replace(/\{nome_aluno\}/g, 'Ana')
    .replace(/\{turma\}/g, 'Ballet Básico I')
    .replace(/\{modalidade\}/g, 'Ballet')
    .replace(/\{nome\}/g, 'Maria')
}

export default function DisparosClient({ turmas }: { turmas: Turma[] }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Mensagem
  const [mensagem, setMensagem] = useState('')
  const [variacoes, setVariacoes] = useState<string[]>([])
  const [variacaoAtiva, setVariacaoAtiva] = useState<number | null>(null)
  const [loadingIA, setLoadingIA] = useState<'melhorar' | 'variacoes' | null>(null)
  const [qtdVariacoes, setQtdVariacoes] = useState(3)

  // Destinatários
  const [aba, setAba] = useState<'numero' | 'grupos' | 'turma'>('numero')
  const [numeroAvulso, setNumeroAvulso] = useState('')
  const [gruposSelecionados, setGruposSelecionados] = useState<Set<string>>(new Set())
  const [delay, setDelay] = useState(0)

  // Envio
  const [enviando, setEnviando] = useState(false)
  const [progresso, setProgresso] = useState<ResultadoEnvio[]>([])
  const [erro, setErro] = useState('')

  const textoAtual = variacaoAtiva !== null ? (variacoes[variacaoAtiva] ?? mensagem) : mensagem

  function inserirVariavel(chave: string) {
    const el = textareaRef.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const novo = mensagem.slice(0, start) + `{${chave}}` + mensagem.slice(end)
    setMensagem(novo)
    setVariacaoAtiva(null)
    setTimeout(() => {
      el.focus()
      el.setSelectionRange(start + chave.length + 2, start + chave.length + 2)
    }, 0)
  }

  async function melhorar() {
    if (!mensagem.trim()) return
    setLoadingIA('melhorar')
    setErro('')
    try {
      const res = await fetch('/api/painel/disparos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'melhorar', mensagem }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMensagem(data.mensagem)
      setVariacoes([])
      setVariacaoAtiva(null)
    } catch (e) {
      setErro(String(e))
    } finally {
      setLoadingIA(null)
    }
  }

  async function gerarVariacoes() {
    if (!mensagem.trim()) return
    setLoadingIA('variacoes')
    setErro('')
    try {
      const res = await fetch('/api/painel/disparos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'variacoes', mensagem, quantidade: qtdVariacoes }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setVariacoes(data.variacoes)
      setVariacaoAtiva(0)
    } catch (e) {
      setErro(String(e))
    } finally {
      setLoadingIA(null)
    }
  }

  function buildDestinatarios(): Destinatario[] {
    if (aba === 'numero') {
      if (!numeroAvulso.trim()) return []
      return [{
        id: 'avulso',
        tipo: 'numero',
        destino: numeroAvulso.trim(),
        label: numeroAvulso.trim(),
      }]
    }
    if (aba === 'grupos') {
      return turmas
        .filter(t => t.whatsapp_group_id && gruposSelecionados.has(t.id))
        .map(t => ({
          id: t.id,
          tipo: 'grupo' as const,
          destino: t.whatsapp_group_id!,
          label: t.nome,
          turma: t.nome,
          modalidade: t.modalidades?.nome ?? '',
        }))
    }
    return []
  }

  async function enviar() {
    const destinatarios = buildDestinatarios()
    if (!destinatarios.length) { setErro('Selecione ao menos um destinatário.'); return }
    if (!textoAtual.trim()) { setErro('Escreva uma mensagem.'); return }

    const confirmar = window.confirm(
      `Enviar mensagem para ${destinatarios.length} destinatário(s)${delay > 0 ? ` com ${delay / 1000}s de intervalo` : ''}?`
    )
    if (!confirmar) return

    setEnviando(true)
    setProgresso([])
    setErro('')

    try {
      const res = await fetch('/api/painel/disparos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'enviar',
          mensagem: textoAtual,
          destinatarios,
          delay_ms: delay,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setProgresso(data.results ?? [])
    } catch (e) {
      setErro(String(e))
    } finally {
      setEnviando(false)
    }
  }

  const destinatarios = buildDestinatarios()
  const enviados = progresso.filter(r => r.ok).length
  const falhos   = progresso.filter(r => !r.ok).length

  const turmasComGrupo = turmas.filter(t => t.whatsapp_group_id)

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Disparos</h1>
        <p className="text-sm text-gray-500 mt-0.5">Crie mensagens com IA e envie para grupos, turmas ou contatos individuais.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── COLUNA ESQUERDA: MENSAGEM ── */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Mensagem</h2>

            {/* Variáveis */}
            <div>
              <p className="text-xs text-gray-400 mb-1.5">Inserir variável:</p>
              <div className="flex flex-wrap gap-1.5">
                {VARIAVEIS.map(v => (
                  <button
                    key={v.chave}
                    onClick={() => inserirVariavel(v.chave)}
                    className="text-xs px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md transition-colors font-mono"
                  >
                    {'{' + v.chave + '}'}
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={mensagem}
              onChange={e => { setMensagem(e.target.value); setVariacaoAtiva(null) }}
              placeholder="Escreva ou cole sua mensagem aqui...&#10;&#10;Use os botões acima para inserir variáveis como {nome_responsavel}."
              rows={8}
              className="w-full text-sm border border-gray-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono leading-relaxed"
            />

            {/* Botões IA */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={melhorar}
                disabled={!mensagem.trim() || loadingIA !== null}
                className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white rounded-lg transition-colors"
              >
                {loadingIA === 'melhorar' ? '⏳' : '✨'} Melhorar com IA
              </button>

              <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={gerarVariacoes}
                  disabled={!mensagem.trim() || loadingIA !== null}
                  className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-gray-50 hover:bg-gray-100 disabled:opacity-40 text-gray-700 transition-colors"
                >
                  {loadingIA === 'variacoes' ? '⏳' : '🎲'} Gerar variações
                </button>
                <select
                  value={qtdVariacoes}
                  onChange={e => setQtdVariacoes(Number(e.target.value))}
                  className="text-sm pr-2 py-1.5 bg-gray-50 border-l border-gray-200 text-gray-600 focus:outline-none"
                >
                  {[2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Variações geradas */}
          {variacoes.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Variações — clique para selecionar</h3>
              {variacoes.map((v, i) => (
                <button
                  key={i}
                  onClick={() => setVariacaoAtiva(i)}
                  className={`w-full text-left text-xs p-3 rounded-lg border transition-colors whitespace-pre-wrap leading-relaxed ${
                    variacaoAtiva === i
                      ? 'border-violet-400 bg-violet-50 text-gray-800'
                      : 'border-gray-100 bg-gray-50 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <span className="font-semibold text-gray-400 mr-2">#{i + 1}</span>
                  {v.slice(0, 120)}{v.length > 120 ? '…' : ''}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── COLUNA DIREITA: PREVIEW + DESTINATÁRIOS ── */}
        <div className="space-y-4">

          {/* Preview */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Preview</h2>
            {textoAtual ? (
              <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
                {interpolarPreview(textoAtual)}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">O preview aparece aqui conforme você escreve.</p>
            )}
            {textoAtual && (
              <p className="text-xs text-gray-400 mt-2">
                Variáveis substituídas por valores de exemplo para visualização.
              </p>
            )}
          </div>

          {/* Destinatários */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Destinatários</h2>

            {/* Abas */}
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              {([
                { id: 'numero', label: '# Número' },
                { id: 'grupos', label: `👥 Grupos (${turmasComGrupo.length})` },
              ] as const).map(a => (
                <button
                  key={a.id}
                  onClick={() => setAba(a.id)}
                  className={`flex-1 text-xs py-1.5 px-2 rounded-md font-medium transition-colors ${
                    aba === a.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>

            {/* Número avulso */}
            {aba === 'numero' && (
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Telefone (com DDD)</label>
                <input
                  type="tel"
                  value={numeroAvulso}
                  onChange={e => setNumeroAvulso(e.target.value)}
                  placeholder="21 9 8765-4321"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Grupos de turma */}
            {aba === 'grupos' && (
              <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() => setGruposSelecionados(new Set(turmasComGrupo.map(t => t.id)))}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Selecionar todos
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={() => setGruposSelecionados(new Set())}
                    className="text-xs text-gray-500 hover:underline"
                  >
                    Limpar
                  </button>
                </div>
                {turmasComGrupo.map(t => (
                  <label key={t.id} className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={gruposSelecionados.has(t.id)}
                      onChange={e => {
                        const next = new Set(gruposSelecionados)
                        if (e.target.checked) next.add(t.id)
                        else next.delete(t.id)
                        setGruposSelecionados(next)
                      }}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">{t.nome}</span>
                    {t.modalidades?.nome && (
                      <span className="text-xs text-gray-400 ml-auto">{t.modalidades.nome}</span>
                    )}
                  </label>
                ))}
                {turmasComGrupo.length === 0 && (
                  <p className="text-sm text-gray-400 italic">Nenhum grupo vinculado.</p>
                )}
              </div>
            )}

            {/* Delay */}
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Intervalo entre envios</label>
              <select
                value={delay}
                onChange={e => setDelay(Number(e.target.value))}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {DELAYS.map(d => <option key={d.ms} value={d.ms}>{d.label}</option>)}
              </select>
            </div>

            {/* Resumo + botão enviar */}
            <div className="pt-2 border-t border-gray-100">
              {erro && (
                <p className="text-xs text-red-600 mb-2">{erro}</p>
              )}

              {progresso.length > 0 && (
                <div className="text-xs mb-2 flex gap-3">
                  <span className="text-green-600">✅ {enviados} enviado{enviados !== 1 ? 's' : ''}</span>
                  {falhos > 0 && <span className="text-red-500">❌ {falhos} falha{falhos !== 1 ? 's' : ''}</span>}
                </div>
              )}

              <button
                onClick={enviar}
                disabled={enviando || !textoAtual.trim() || destinatarios.length === 0}
                className="w-full py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-40 bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
              >
                {enviando
                  ? <><span className="animate-spin">⏳</span> Enviando...</>
                  : <>📤 Enviar{destinatarios.length > 0 ? ` para ${destinatarios.length}` : ''}</>
                }
              </button>

              {destinatarios.length > 0 && !enviando && (
                <p className="text-xs text-gray-400 text-center mt-1.5">
                  {destinatarios.map(d => d.label).join(' · ')}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
