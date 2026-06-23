'use client'

import { useState, useRef } from 'react'

type Turma = {
  id: string
  nome: string
  whatsapp_group_id: string | null
  modalidades: { nome: string } | null
}

type Cliente = {
  id: string
  nome: string
  celular: string | null
  status_pedagogico: string
  responsavel_principal: { nome: string; celular: string } | null
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
  mensagem_override?: string
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

function parseTelefones(texto: string): string[] {
  return texto.split('\n').map(l => l.trim()).filter(l => l.replace(/\D/g, '').length >= 8)
}

export default function DisparosClient({ turmas, clientes }: { turmas: Turma[]; clientes: Cliente[] }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Mensagem
  const [mensagem, setMensagem] = useState('')
  const [variacoes, setVariacoes] = useState<string[]>([])
  const [variacaoAtiva, setVariacaoAtiva] = useState<number | null>(null)
  const [loadingIA, setLoadingIA] = useState<'melhorar' | 'variacoes' | null>(null)
  const [qtdVariacoes, setQtdVariacoes] = useState(3)

  // Destinatários
  const [aba, setAba] = useState<'numero' | 'grupos' | 'clientes'>('numero')
  const [numerosTexto, setNumerosTexto] = useState('')
  const [gruposSelecionados, setGruposSelecionados] = useState<Set<string>>(new Set())
  const [clientesSelecionados, setClientesSelecionados] = useState<Set<string>>(new Set())
  const [buscaCliente, setBuscaCliente] = useState('')
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
    let base: Omit<Destinatario, 'mensagem_override'>[] = []

    if (aba === 'numero') {
      base = parseTelefones(numerosTexto).map((num, i) => ({
        id: `avulso-${i}`,
        tipo: 'numero' as const,
        destino: num,
        label: num,
      }))
    } else if (aba === 'grupos') {
      base = turmas
        .filter(t => t.whatsapp_group_id && gruposSelecionados.has(t.id))
        .map(t => ({
          id: t.id,
          tipo: 'grupo' as const,
          destino: t.whatsapp_group_id!,
          label: t.nome,
          turma: t.nome,
          modalidade: t.modalidades?.nome ?? '',
        }))
    } else if (aba === 'clientes') {
      base = clientes
        .filter(c => clientesSelecionados.has(c.id))
        .map(c => {
          const tel = c.responsavel_principal?.celular ?? c.celular ?? ''
          return {
            id: c.id,
            tipo: 'aluno' as const,
            destino: tel,
            label: `${c.nome}${c.responsavel_principal?.nome ? ` (${c.responsavel_principal.nome})` : ''}`,
            nome_aluno: c.nome,
            nome_responsavel: c.responsavel_principal?.nome ?? '',
          }
        })
        .filter(d => d.destino)
    }

    // Rotação automática: mais de 1 variação → cada destinatário recebe uma variação diferente em ciclo
    if (variacoes.length > 1) {
      return base.map((d, i) => ({ ...d, mensagem_override: variacoes[i % variacoes.length] }))
    }
    return base as Destinatario[]
  }

  async function enviar() {
    const destinatarios = buildDestinatarios()
    if (!destinatarios.length) { setErro('Selecione ao menos um destinatário.'); return }
    if (!textoAtual.trim()) { setErro('Escreva uma mensagem.'); return }

    const rotando = variacoes.length > 1 && destinatarios.length > 1
    const confirmar = window.confirm(
      `Enviar para ${destinatarios.length} destinatário(s)` +
      (rotando ? ` com ${variacoes.length} variações rotacionadas` : '') +
      (delay > 0 ? ` e ${delay / 1000}s de intervalo` : '') +
      '?'
    )
    if (!confirmar) return

    setEnviando(true)
    setProgresso([])
    setErro('')

    try {
      const res = await fetch('/api/painel/disparos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'enviar', mensagem: textoAtual, destinatarios, delay_ms: delay }),
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

  const turmasComGrupo  = turmas.filter(t => t.whatsapp_group_id)
  const clientesComTel  = clientes.filter(c => c.responsavel_principal?.celular || c.celular)
  const clientesFiltrados = clientes.filter(c =>
    !buscaCliente ||
    c.nome.toLowerCase().includes(buscaCliente.toLowerCase()) ||
    (c.responsavel_principal?.nome ?? '').toLowerCase().includes(buscaCliente.toLowerCase())
  )
  const rotando = variacoes.length > 1 && destinatarios.length > 1

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

      <div>
        <h1 className="text-xl font-semibold text-gray-900">Disparos</h1>
        <p className="text-sm text-gray-500 mt-0.5">Crie mensagens com IA e envie para grupos, turmas ou contatos individuais.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── COLUNA ESQUERDA: MENSAGEM ── */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Mensagem</h2>

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

            <textarea
              ref={textareaRef}
              value={mensagem}
              onChange={e => { setMensagem(e.target.value); setVariacaoAtiva(null) }}
              placeholder={"Escreva ou cole sua mensagem aqui...\n\nUse os botões acima para inserir variáveis como {nome_responsavel}."}
              rows={8}
              className="w-full text-sm border border-gray-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono leading-relaxed"
            />

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

            {rotando && (
              <p className="text-xs text-violet-600 bg-violet-50 rounded-lg px-3 py-1.5">
                🔄 {variacoes.length} variações serão rotacionadas entre os {destinatarios.length} destinatários
              </p>
            )}
          </div>

          {variacoes.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Variações — clique para ver no preview
                {variacoes.length > 1 && <span className="ml-2 text-violet-500 font-normal normal-case">· rotação ativa ao enviar para múltiplos</span>}
              </h3>
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
              <p className="text-xs text-gray-400 mt-2">Variáveis substituídas por valores de exemplo.</p>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Destinatários</h2>

            {/* Abas */}
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              {([
                { id: 'numero',   label: '# Números' },
                { id: 'grupos',   label: `👥 Grupos (${turmasComGrupo.length})` },
                { id: 'clientes', label: `🎓 Clientes (${clientesComTel.length})` },
              ] as const).map(a => (
                <button
                  key={a.id}
                  onClick={() => setAba(a.id)}
                  className={`flex-1 text-xs py-1.5 px-1 rounded-md font-medium transition-colors ${
                    aba === a.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>

            {/* Números avulsos — múltiplos, um por linha */}
            {aba === 'numero' && (
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Um número por linha (com DDD)</label>
                <textarea
                  value={numerosTexto}
                  onChange={e => setNumerosTexto(e.target.value)}
                  placeholder={"21 9 8765-4321\n21 9 8123-0000\n21 9 9999-1234"}
                  rows={5}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
                {parseTelefones(numerosTexto).length > 0 && (
                  <p className="text-xs text-gray-400 mt-1">{parseTelefones(numerosTexto).length} número(s) detectado(s)</p>
                )}
              </div>
            )}

            {/* Grupos de turma */}
            {aba === 'grupos' && (
              <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
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
                  {gruposSelecionados.size > 0 && (
                    <span className="text-xs text-gray-500 ml-auto">{gruposSelecionados.size} selecionado(s)</span>
                  )}
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
                      <span className="text-xs text-gray-400 ml-auto shrink-0">{t.modalidades.nome}</span>
                    )}
                  </label>
                ))}
                {turmasComGrupo.length === 0 && (
                  <p className="text-sm text-gray-400 italic">Nenhum grupo vinculado.</p>
                )}
              </div>
            )}

            {/* Clientes individuais */}
            {aba === 'clientes' && (
              <div className="space-y-2">
                <input
                  type="search"
                  value={buscaCliente}
                  onChange={e => setBuscaCliente(e.target.value)}
                  placeholder="Buscar aluno ou responsável..."
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => setClientesSelecionados(new Set(clientesComTel.map(c => c.id)))}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Todos com tel.
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={() => setClientesSelecionados(new Set())}
                    className="text-xs text-gray-500 hover:underline"
                  >
                    Limpar
                  </button>
                  {clientesSelecionados.size > 0 && (
                    <span className="text-xs text-gray-500 ml-auto">{clientesSelecionados.size} selecionado(s)</span>
                  )}
                </div>
                <div className="space-y-0.5 max-h-56 overflow-y-auto pr-1">
                  {clientesFiltrados.map(c => {
                    const tel = c.responsavel_principal?.celular ?? c.celular
                    const semTel = !tel
                    return (
                      <label
                        key={c.id}
                        className={`flex items-center gap-2.5 py-1.5 px-2 rounded-lg cursor-pointer ${semTel ? 'opacity-40' : 'hover:bg-gray-50'}`}
                      >
                        <input
                          type="checkbox"
                          checked={clientesSelecionados.has(c.id)}
                          disabled={semTel}
                          onChange={e => {
                            if (semTel) return
                            const next = new Set(clientesSelecionados)
                            if (e.target.checked) next.add(c.id)
                            else next.delete(c.id)
                            setClientesSelecionados(next)
                          }}
                          className="rounded border-gray-300 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-gray-800 truncate">{c.nome}</p>
                          <p className="text-xs text-gray-400 truncate">
                            {c.responsavel_principal?.nome
                              ? `${c.responsavel_principal.nome} · ${tel ?? 'sem tel.'}`
                              : (tel ?? 'sem telefone')}
                          </p>
                        </div>
                      </label>
                    )
                  })}
                  {clientesFiltrados.length === 0 && (
                    <p className="text-sm text-gray-400 italic px-2">Nenhum resultado.</p>
                  )}
                </div>
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

            {/* Botão enviar */}
            <div className="pt-2 border-t border-gray-100">
              {erro && <p className="text-xs text-red-600 mb-2">{erro}</p>}

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
                <p className="text-xs text-gray-400 text-center mt-1.5 truncate">
                  {destinatarios.slice(0, 3).map(d => d.label).join(' · ')}
                  {destinatarios.length > 3 ? ` +${destinatarios.length - 3} mais` : ''}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
