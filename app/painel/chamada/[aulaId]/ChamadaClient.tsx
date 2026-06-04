'use client'

import { useState, useEffect } from 'react'

type StatusPresenca = 'presente' | 'falta' | 'falta_justificada' | 'reposicao' | 'experimental' | 'professor_faltou'
type StatusExperimental = 'agendado' | 'presente' | 'nao_compareceu'

type Aluno = {
  id: string
  nome: string
  nome_social: string | null
  status_financeiro: string
}

type Experimental = {
  id: string
  status: string
  lead: { id: string; nome: string; celular: string | null; modalidade_interesse: string | null }
}

type RegistroLocal = {
  status: StatusPresenca
  observacao?: string
}

const STORAGE_KEY = (aulaId: string) => `chamada_${aulaId}`
const DIAS = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado']

export default function ChamadaClient({
  aula,
  alunos,
  presencasIniciais,
  aulaId,
  experimentais: experimentaisIniciais = [],
  perfilUsuario = 'professor',
  dentroTolerancia = true,
  toleranciaMinutos = 120,
}: {
  aula: any
  alunos: Aluno[]
  presencasIniciais: Record<string, { status: string; observacao: string | null }>
  aulaId: string
  experimentais?: Experimental[]
  perfilUsuario?: 'admin' | 'secretaria' | 'professor'
  dentroTolerancia?: boolean
  toleranciaMinutos?: number
}) {
  const [registros, setRegistros] = useState<Record<string, RegistroLocal>>(() => {
    const inicial: Record<string, RegistroLocal> = {}
    for (const [id, p] of Object.entries(presencasIniciais)) {
      inicial[id] = { status: p.status as StatusPresenca, observacao: p.observacao ?? '' }
    }
    return inicial
  })

  const [experimentais, setExperimentais] = useState<Experimental[]>(experimentaisIniciais)
  const [professsorFaltou, setProfessorFaltou] = useState(false)
  const [temAtestado, setTemAtestado] = useState(false)
  const [nomeSubstituto, setNomeSubstituto] = useState('')
  const [cpfSubstituto, setCpfSubstituto] = useState('')
  const [celularSubstituto, setCelularSubstituto] = useState('')
  const [motivoAusencia, setMotivoAusencia] = useState('')
  const [termosAceitos, setTermosAceitos] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [salvoLocalmente, setSalvoLocalmente] = useState(false)
  const [online, setOnline] = useState(true)
  const [concluida, setConcluida] = useState(aula.status === 'concluida')

  useEffect(() => {
    setOnline(navigator.onLine)
    const on = () => { setOnline(true); sincronizarPendentes() }
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY(aulaId), JSON.stringify({ registros, professsorFaltou, temAtestado, nomeSubstituto }))
  }, [registros, professsorFaltou, temAtestado, nomeSubstituto, aulaId])

  useEffect(() => {
    const salvo = localStorage.getItem(STORAGE_KEY(aulaId))
    if (salvo) {
      try {
        const dados = JSON.parse(salvo)
        if (dados.registros && Object.keys(presencasIniciais).length === 0) setRegistros(dados.registros)
        if (dados.professsorFaltou) setProfessorFaltou(dados.professsorFaltou)
        if (dados.temAtestado) setTemAtestado(dados.temAtestado)
        if (dados.nomeSubstituto) setNomeSubstituto(dados.nomeSubstituto)
      } catch (_) {}
    }
  }, [])

  async function sincronizarPendentes() {
    const pendente = localStorage.getItem(`pendente_${aulaId}`)
    if (!pendente) return
    const dados = JSON.parse(pendente)
    await salvarNoBanco(dados.registros, dados.professsorFaltou, dados.temAtestado, dados.nomeSubstituto, true)
    localStorage.removeItem(`pendente_${aulaId}`)
  }

  function setStatus(alunoId: string, status: StatusPresenca) {
    setRegistros(prev => ({ ...prev, [alunoId]: { ...prev[alunoId], status } }))
  }

  function toggleEspecial(alunoId: string, tipo: StatusPresenca) {
    const atual = registros[alunoId]?.status
    setStatus(alunoId, atual === tipo ? 'falta' : tipo)
  }

  function statusAtual(alunoId: string): StatusPresenca {
    return registros[alunoId]?.status ?? 'presente'
  }

  async function marcarExperimental(expId: string, novoStatus: StatusExperimental) {
    setExperimentais(prev => prev.map(e => e.id === expId ? { ...e, status: novoStatus } : e))
    await fetch('/api/experimentais', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: expId, status: novoStatus }),
    })
  }

  async function salvarNoBanco(
    regs: Record<string, RegistroLocal>,
    profFaltou: boolean,
    atestado: boolean,
    substituto: string,
    silencioso = false,
    cpfSub = cpfSubstituto,
    celularSub = celularSubstituto,
    motivo = motivoAusencia,
    termos = termosAceitos,
  ) {
    if (!silencioso) setSalvando(true)

    const presencas = profFaltou
      ? alunos.map(a => ({ aula_id: aulaId, aluno_id: a.id, status: 'presente' as const }))
      : alunos.map(a => ({
          aula_id: aulaId,
          aluno_id: a.id,
          status: (regs[a.id]?.status ?? 'presente') as any,
          observacao: regs[a.id]?.observacao || null,
        }))

    // Usa API route server-side para garantir funcionamento para admin, secretaria e professor
    await fetch('/api/chamada/salvar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        aulaId, presencas, profFaltou, atestado, substituto,
        cpfSubstituto: cpfSub, celularSubstituto: celularSub,
        motivoAusencia: motivo, termosAceitos: termos,
      }),
    })

    if (!silencioso) setSalvando(false)
    setSalvoLocalmente(true)
    setTimeout(() => setSalvoLocalmente(false), 2000)
  }

  async function salvar() {
    if (!online) {
      localStorage.setItem(`pendente_${aulaId}`, JSON.stringify({ registros, professsorFaltou, temAtestado, nomeSubstituto }))
      setSalvoLocalmente(true)
      setTimeout(() => setSalvoLocalmente(false), 2000)
      return
    }
    await salvarNoBanco(registros, professsorFaltou, temAtestado, nomeSubstituto)
  }

  async function concluir() {
    await salvar()
    await fetch('/api/chamada/salvar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aulaId, presencas: [], profFaltou: false, concluir: true }),
    })
    localStorage.removeItem(STORAGE_KEY(aulaId))
    localStorage.removeItem(`pendente_${aulaId}`)
    setConcluida(true)
  }

  const dataAula = new Date(aula.data + 'T12:00:00')
  const diaSemana = DIAS[dataAula.getDay()]
  const dataFormatada = dataAula.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })
  const totalPresentes = alunos.filter(a => statusAtual(a.id) === 'presente').length

  if (concluida) {
    return (
      <div className="max-w-lg mx-auto pb-10">
        {/* Header concluída */}
        <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between mb-1">
            <a href="/painel/agenda" className="text-gray-400 text-sm">← Agenda</a>
            {(perfilUsuario === 'admin' || perfilUsuario === 'secretaria') ? (
              <button
                onClick={() => setConcluida(false)}
                className="text-xs text-orange-600 border border-orange-200 px-2 py-0.5 rounded-full hover:bg-orange-50"
              >
                ✏️ Corrigir
              </button>
            ) : dentroTolerancia ? (
              <button
                onClick={() => setConcluida(false)}
                className="text-xs text-orange-600 border border-orange-200 px-2 py-0.5 rounded-full hover:bg-orange-50"
              >
                ✏️ Corrigir
              </button>
            ) : (
              <span className="text-xs text-gray-400 border border-gray-200 px-2 py-0.5 rounded-full" title={`Prazo de ${toleranciaMinutos}min expirado — contate a secretaria`}>
                🔒 Prazo expirado
              </span>
            )}
          </div>
          <h1 className="text-base font-semibold text-gray-900">{(aula.turmas as any)?.nome}</h1>
          <p className="text-xs text-gray-500">
            {diaSemana}, {dataFormatada} · {aula.hora_inicio?.slice(0,5)} – {aula.hora_fim?.slice(0,5)}
          </p>
          <p className="text-xs font-medium text-green-600 mt-1">
            {totalPresentes} de {alunos.length} presentes
            {experimentais.filter(e => e.status === 'presente').length > 0 && (
              <span className="text-violet-500 ml-2">· {experimentais.filter(e => e.status === 'presente').length} exp.</span>
            )}
          </p>
        </div>

        {/* Lista read-only */}
        <div className="px-4 mt-4 space-y-2">
          {experimentais.filter(e => e.status === 'presente').length > 0 && (
            <>
              <p className="text-xs font-semibold text-violet-500 uppercase tracking-wider mb-1">🎭 Experimentais</p>
              {experimentais.filter(e => e.status === 'presente').map(exp => (
                <div key={exp.id} className="bg-white border border-violet-200 rounded-xl px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{exp.lead.nome}</p>
                    {exp.lead.modalidade_interesse && <p className="text-xs text-gray-400">{exp.lead.modalidade_interesse}</p>}
                  </div>
                  <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">Presente</span>
                </div>
              ))}
              <div className="pt-1" />
            </>
          )}

          {alunos.map(aluno => {
            const reg = registros[aluno.id]
            const status = reg?.status ?? 'presente'
            const badge: Record<string, { label: string; className: string }> = {
              presente:         { label: 'Presente',    className: 'bg-green-100 text-green-700' },
              falta:            { label: 'Falta',       className: 'bg-red-100 text-red-600' },
              falta_justificada:{ label: 'Justificada', className: 'bg-yellow-100 text-yellow-700' },
              reposicao:        { label: 'Reposição',   className: 'bg-blue-100 text-blue-700' },
              experimental:     { label: 'Experimental',className: 'bg-violet-100 text-violet-700' },
            }
            const b = badge[status] ?? badge.presente
            return (
              <div key={aluno.id} className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{aluno.nome_social ?? aluno.nome}</p>
                  {aluno.nome_social && <p className="text-xs text-gray-400">{aluno.nome}</p>}
                  {aluno.status_financeiro === 'inadimplente' && (
                    <span className="text-xs text-red-500">⚠ Inadimplente</span>
                  )}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${b.className}`}>{b.label}</span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-1">
          <a href="/painel" className="text-gray-400 text-sm">← Painel</a>
          <div className="flex items-center gap-2">
            {!online && (
              <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                Offline — salvo localmente
              </span>
            )}
            {salvoLocalmente && (
              <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                ✓ Salvo
              </span>
            )}
          </div>
        </div>
        <h1 className="text-base font-semibold text-gray-900">{(aula.turmas as any)?.nome}</h1>
        <p className="text-xs text-gray-500">
          {diaSemana}, {dataFormatada} · {aula.hora_inicio?.slice(0,5)} – {aula.hora_fim?.slice(0,5)}
          {(aula.salas as any)?.nome ? ` · Sala ${(aula.salas as any).nome}` : ''}
        </p>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-400">
            {alunos.length} alunos
            {experimentais.length > 0 && (
              <span className="ml-2 text-violet-500">· {experimentais.length} 🎭 exp.</span>
            )}
          </p>
          <p className="text-xs font-medium text-green-600">{totalPresentes} presentes</p>
        </div>
      </div>

      {/* Professor faltou */}
      <div className="mx-4 mt-4">
        <button
          onClick={() => setProfessorFaltou(!professsorFaltou)}
          className={`w-full py-3 rounded-xl text-sm font-medium border-2 transition-colors ${
            professsorFaltou
              ? 'border-red-400 bg-red-50 text-red-700'
              : 'border-gray-200 bg-white text-gray-500'
          }`}
        >
          {professsorFaltou ? '⚠️ Professor faltou (marcado)' : 'Professor faltou?'}
        </button>

        {professsorFaltou && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-2 space-y-4">
            <p className="text-xs text-red-600 font-medium">
              Todos os alunos serão marcados como presentes. O professor cadastrado nesta turma será remunerado normalmente pela escola.
            </p>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-red-700 uppercase tracking-wider">Motivo da ausência</p>
              <textarea
                value={motivoAusencia}
                onChange={e => setMotivoAusencia(e.target.value)}
                placeholder="Descreva o motivo (ex: problema de saúde, emergência familiar...)"
                rows={2}
                className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm focus:outline-none resize-none"
              />
              <label className="flex items-center gap-2 text-sm text-red-700">
                <input type="checkbox" checked={temAtestado} onChange={e => setTemAtestado(e.target.checked)} className="rounded" />
                Possui atestado médico
              </label>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-red-700 uppercase tracking-wider">Professor substituto (se houver)</p>
              <input
                value={nomeSubstituto}
                onChange={e => setNomeSubstituto(e.target.value)}
                placeholder="Nome completo do substituto"
                className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={cpfSubstituto}
                  onChange={e => setCpfSubstituto(e.target.value)}
                  placeholder="CPF"
                  className="border border-red-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                />
                <input
                  value={celularSubstituto}
                  onChange={e => setCelularSubstituto(e.target.value)}
                  placeholder="Celular"
                  className="border border-red-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                />
              </div>
            </div>

            {nomeSubstituto.trim() && (
              <div className="bg-white border border-red-300 rounded-xl p-3 space-y-2">
                <p className="text-xs font-semibold text-gray-700">📋 Termos de substituição</p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Ao confirmar, declaro que: <strong>{nomeSubstituto}</strong> ministrará esta aula como substituto(a).
                  A Sede do Movimento se compromete a remunerar o professor <strong>cadastrado</strong> desta turma por esta aula.
                  Qualquer negociação de repasse entre professores é de responsabilidade exclusiva das partes envolvidas,
                  sendo a escola eximida de qualquer responsabilidade por acordos financeiros entre professores.
                </p>
                <label className="flex items-start gap-2 text-xs text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={termosAceitos}
                    onChange={e => setTermosAceitos(e.target.checked)}
                    className="rounded mt-0.5 flex-shrink-0"
                  />
                  <span>Li e concordo com os termos acima. Confirmo os dados do substituto.</span>
                </label>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Experimentais da aula */}
      {experimentais.length > 0 && (
        <div className="px-4 mt-5">
          <p className="text-xs font-semibold text-violet-500 uppercase tracking-wider mb-2">
            🎭 Experimentais hoje
          </p>
          <div className="space-y-2">
            {experimentais.map(exp => {
              const presente = exp.status === 'presente'
              const faltou = exp.status === 'nao_compareceu'
              return (
                <div
                  key={exp.id}
                  className={`bg-white border rounded-xl overflow-hidden transition-colors ${
                    presente ? 'border-violet-200 bg-violet-50/30' :
                    faltou ? 'border-red-200' :
                    'border-dashed border-violet-200'
                  }`}
                >
                  <div className="flex items-center">
                    <div className="flex-1 px-4 py-3 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-violet-400">🎭</span>
                        <p className="font-medium text-gray-900 truncate">{exp.lead.nome}</p>
                      </div>
                      {exp.lead.modalidade_interesse && (
                        <p className="text-xs text-gray-400">{exp.lead.modalidade_interesse}</p>
                      )}
                    </div>
                    <div className="flex border-l border-gray-100">
                      <button
                        onClick={() => marcarExperimental(exp.id, 'presente')}
                        className={`w-16 h-16 flex items-center justify-center text-lg transition-colors ${
                          presente ? 'bg-violet-500 text-white' : 'bg-white text-gray-300 hover:bg-violet-50'
                        }`}
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => marcarExperimental(exp.id, 'nao_compareceu')}
                        className={`w-16 h-16 flex items-center justify-center text-lg transition-colors border-l border-gray-100 ${
                          faltou ? 'bg-red-500 text-white' : 'bg-white text-gray-300 hover:bg-red-50'
                        }`}
                        title="Faltou — WhatsApp automático para o lead"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  {faltou && (
                    <div className="border-t border-red-100 px-4 py-1.5 bg-red-50">
                      <p className="text-xs text-red-500">💬 WhatsApp enviado ao lead perguntando como foi</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Lista de alunos regulares */}
      {!professsorFaltou && (
        <div className="px-4 mt-4 pb-32 space-y-2">
          {experimentais.length > 0 && alunos.length > 0 && (
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Turma</p>
          )}
          {alunos.map((aluno) => {
            const status = statusAtual(aluno.id)
            const ehPresente = status === 'presente'
            const ehFalta = status === 'falta'

            return (
              <div
                key={aluno.id}
                className={`bg-white border rounded-xl overflow-hidden transition-colors ${
                  ehPresente ? 'border-green-200' :
                  ehFalta ? 'border-red-200' :
                  'border-yellow-200'
                }`}
              >
                <div className="flex items-center">
                  <div className="flex-1 px-4 py-3 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {aluno.nome_social ?? aluno.nome}
                    </p>
                    {aluno.nome_social && (
                      <p className="text-xs text-gray-400 truncate">{aluno.nome}</p>
                    )}
                    {aluno.status_financeiro === 'inadimplente' && (
                      <span className="text-xs text-red-500">⚠ Inadimplente</span>
                    )}
                  </div>
                  <div className="flex border-l border-gray-100">
                    <button
                      onClick={() => setStatus(aluno.id, 'presente')}
                      className={`w-16 h-16 flex items-center justify-center text-lg transition-colors ${
                        ehPresente ? 'bg-green-500 text-white' : 'bg-white text-gray-300 hover:bg-green-50'
                      }`}
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => setStatus(aluno.id, 'falta')}
                      className={`w-16 h-16 flex items-center justify-center text-lg transition-colors border-l border-gray-100 ${
                        ehFalta ? 'bg-red-500 text-white' : 'bg-white text-gray-300 hover:bg-red-50'
                      }`}
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <div className="border-t border-gray-100 px-4 py-2 flex gap-4">
                  {[
                    { id: 'reposicao',         label: 'Reposição' },
                    { id: 'experimental',      label: 'Experimental' },
                    { id: 'falta_justificada', label: 'Justificada' },
                  ].map(({ id, label }) => (
                    <label key={id} className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={status === id}
                        onChange={() => toggleEspecial(aluno.id, id as StatusPresenca)}
                        className="rounded"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Rodapé fixo */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4 max-w-lg mx-auto">
        <div className="flex gap-3">
          <button
            onClick={salvar}
            disabled={salvando}
            className="flex-1 border border-gray-200 text-gray-700 text-sm font-medium py-3 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            {salvando ? 'Salvando...' : 'Salvar rascunho'}
          </button>
          <button
            onClick={concluir}
            disabled={salvando}
            className="flex-1 bg-indigo-600 text-white text-sm font-medium py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            Concluir chamada ✓
          </button>
        </div>
        <p className="text-center text-xs text-gray-400 mt-2">
          {online ? '🟢 Online' : '🔴 Offline — dados salvos localmente'}
        </p>
      </div>
    </div>
  )
}
