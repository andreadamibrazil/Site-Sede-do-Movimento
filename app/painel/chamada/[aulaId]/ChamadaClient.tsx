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
  const [professorFaltou, setProfessorFaltou] = useState(false)
  const [temAtestado, setTemAtestado] = useState(false)
  const [nomeSubstituto, setNomeSubstituto] = useState('')
  const [cpfSubstituto, setCpfSubstituto] = useState('')
  const [celularSubstituto, setCelularSubstituto] = useState('')
  const [motivoAusencia, setMotivoAusencia] = useState('')
  const [termosAceitos, setTermosAceitos] = useState(false)
  const [atestadoFile, setAtestadoFile] = useState<File | null>(null)
  const [atestadoUrl, setAtestadoUrl] = useState<string | null>(null)
  const [atestadoDados, setAtestadoDados] = useState<Record<string, string | null> | null>(null)
  const [atestadoErro, setAtestadoErro] = useState<string | null>(null)
  const [uploadandoAtestado, setUploadandoAtestado] = useState(false)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY(aulaId), JSON.stringify({ registros, professorFaltou, temAtestado, nomeSubstituto, cpfSubstituto, celularSubstituto, motivoAusencia, termosAceitos }))
  }, [registros, professorFaltou, temAtestado, nomeSubstituto, cpfSubstituto, celularSubstituto, motivoAusencia, termosAceitos, aulaId])

  useEffect(() => {
    const salvo = localStorage.getItem(STORAGE_KEY(aulaId))
    if (salvo) {
      try {
        const dados = JSON.parse(salvo)
        if (dados.registros && Object.keys(presencasIniciais).length === 0) setRegistros(dados.registros)
        if (dados.professorFaltou) setProfessorFaltou(dados.professorFaltou)
        if (dados.temAtestado) setTemAtestado(dados.temAtestado)
        if (dados.nomeSubstituto) setNomeSubstituto(dados.nomeSubstituto)
        if (dados.cpfSubstituto) setCpfSubstituto(dados.cpfSubstituto)
        if (dados.celularSubstituto) setCelularSubstituto(dados.celularSubstituto)
        if (dados.motivoAusencia) setMotivoAusencia(dados.motivoAusencia)
        if (dados.termosAceitos) setTermosAceitos(dados.termosAceitos)
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function sincronizarPendentes() {
    const pendente = localStorage.getItem(`pendente_${aulaId}`)
    if (!pendente) return
    const dados = JSON.parse(pendente)
    await salvarNoBanco(dados.registros, dados.professorFaltou, dados.temAtestado, dados.nomeSubstituto, true)
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
    const statusAnterior = experimentais.find(e => e.id === expId)?.status
    setExperimentais(prev => prev.map(e => e.id === expId ? { ...e, status: novoStatus } : e))
    try {
      const res = await fetch('/api/experimentais', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: expId, status: novoStatus }),
      })
      if (!res.ok && statusAnterior) {
        setExperimentais(prev => prev.map(e => e.id === expId ? { ...e, status: statusAnterior as StatusExperimental } : e))
      }
    } catch {
      if (statusAnterior) setExperimentais(prev => prev.map(e => e.id === expId ? { ...e, status: statusAnterior as StatusExperimental } : e))
    }
  }

  async function uploadAtestado(file: File): Promise<string | null> {
    setUploadandoAtestado(true)
    setAtestadoErro(null)
    const form = new FormData()
    form.append('file', file)
    form.append('aulaId', aulaId)
    const res = await fetch('/api/chamada/upload-atestado', { method: 'POST', body: form })
    setUploadandoAtestado(false)
    const data = await res.json()
    if (!res.ok) {
      setAtestadoErro(data.error ?? 'Erro ao enviar atestado')
      return null
    }
    if (data.dados) setAtestadoDados(data.dados)
    return data.url as string
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
    urlAtestado = atestadoUrl,
  ) {
    if (!silencioso) setSalvando(true)

    // Faz upload do atestado se houver arquivo novo ainda não enviado
    let urlFinal = urlAtestado
    if (atestado && atestadoFile && !urlFinal) {
      urlFinal = await uploadAtestado(atestadoFile)
      if (urlFinal) setAtestadoUrl(urlFinal)
    }

    const presencas = profFaltou
      ? alunos.map(a => ({ aula_id: aulaId, aluno_id: a.id, status: 'presente' as const }))
      : alunos.map(a => ({
          aula_id: aulaId,
          aluno_id: a.id,
          status: (regs[a.id]?.status ?? 'presente') as any,
          observacao: regs[a.id]?.observacao || null,
        }))

    let sucesso = false
    try {
      const res = await fetch('/api/chamada/salvar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aulaId, presencas, profFaltou, atestado, substituto,
          cpfSubstituto: cpfSub, celularSubstituto: celularSub,
          motivoAusencia: motivo, termosAceitos: termos, atestadoUrl: urlFinal,
        }),
      })
      if (res.ok) {
        sucesso = true
      } else if (!silencioso) {
        const err = await res.json().catch(() => ({}))
        alert(err.error ?? 'Erro ao salvar chamada. Tente novamente.')
      }
    } catch {
      if (!silencioso) alert('Sem conexão ao salvar. Os dados foram preservados localmente.')
    }

    if (!silencioso) setSalvando(false)
    if (sucesso) {
      setSalvoLocalmente(true)
      setTimeout(() => setSalvoLocalmente(false), 2000)
    }
    return sucesso
  }

  async function salvar(): Promise<boolean> {
    if (!online) {
      localStorage.setItem(`pendente_${aulaId}`, JSON.stringify({ registros, professorFaltou, temAtestado, nomeSubstituto, cpfSubstituto, celularSubstituto, motivoAusencia, termosAceitos }))
      setSalvoLocalmente(true)
      setTimeout(() => setSalvoLocalmente(false), 2000)
      return false
    }
    return await salvarNoBanco(registros, professorFaltou, temAtestado, nomeSubstituto) ?? false
  }

  async function concluir() {
    const salvou = await salvar()
    if (!salvou) {
      alert('Não foi possível salvar as presenças. Corrija e tente concluir novamente.')
      return
    }
    try {
      const res = await fetch('/api/chamada/salvar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aulaId, presencas: [], profFaltou: false, concluir: true }),
      })
      if (!res.ok) {
        alert('Erro ao concluir chamada. Tente novamente.')
        return
      }
    } catch {
      alert('Sem conexão. Tente concluir novamente quando online.')
      return
    }
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
                  {perfilUsuario !== 'professor' && aluno.status_financeiro === 'inadimplente' && (
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
          <a href={perfilUsuario === 'professor' ? '/professor' : '/painel'} className="text-gray-400 text-sm">← {perfilUsuario === 'professor' ? 'Início' : 'Painel'}</a>
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
      <div className="mx-4 mt-4 pb-36">
        <button
          onClick={() => setProfessorFaltou(!professorFaltou)}
          className={`w-full py-3 rounded-xl text-sm font-medium border-2 transition-colors ${
            professorFaltou
              ? 'border-red-400 bg-red-50 text-red-700'
              : 'border-gray-200 bg-white text-gray-500'
          }`}
        >
          {professorFaltou ? '⚠️ Professor faltou (marcado)' : 'Professor faltou?'}
        </button>

        {professorFaltou && (
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
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-red-700">
                  <input type="checkbox" checked={temAtestado} onChange={e => { setTemAtestado(e.target.checked); if (!e.target.checked) { setAtestadoFile(null); setAtestadoUrl(null) } }} className="rounded" />
                  Possui atestado médico
                </label>
                {temAtestado && (
                  <div className="space-y-2">
                    <label className="block">
                      <span className="text-xs text-red-600 font-medium">Anexar atestado (foto ou PDF)</span>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        capture="environment"
                        onChange={e => {
                          const f = e.target.files?.[0] ?? null
                          setAtestadoFile(f)
                          setAtestadoUrl(null)
                          setAtestadoDados(null)
                          setAtestadoErro(null)
                        }}
                        className="mt-1 block w-full text-xs text-gray-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-red-100 file:text-red-700 hover:file:bg-red-200 cursor-pointer"
                      />
                    </label>

                    {uploadandoAtestado && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                        <p className="text-xs text-blue-600">🔍 Verificando legibilidade com IA...</p>
                      </div>
                    )}

                    {atestadoErro && (
                      <div className="bg-red-50 border border-red-300 rounded-lg px-3 py-2 space-y-1">
                        <p className="text-xs text-red-700 font-medium">⚠ {atestadoErro}</p>
                        <p className="text-xs text-red-500">Tire uma nova foto com boa iluminação e foco.</p>
                      </div>
                    )}

                    {atestadoUrl && atestadoDados && (
                      <div className="bg-green-50 border border-green-300 rounded-lg px-3 py-2 space-y-1">
                        <p className="text-xs text-green-700 font-medium">✓ Atestado verificado pela IA</p>
                        {atestadoDados.nome_paciente && <p className="text-xs text-gray-600">Paciente: {atestadoDados.nome_paciente}</p>}
                        {atestadoDados.data_atestado && <p className="text-xs text-gray-600">Data: {atestadoDados.data_atestado}</p>}
                        {atestadoDados.dias_afastamento && <p className="text-xs text-gray-600">Afastamento: {atestadoDados.dias_afastamento}</p>}
                        {atestadoDados.nome_medico && <p className="text-xs text-gray-600">Médico: {atestadoDados.nome_medico}{atestadoDados.crm ? ` · ${atestadoDados.crm}` : ''}</p>}
                      </div>
                    )}

                    {atestadoFile && !atestadoUrl && !uploadandoAtestado && !atestadoErro && (
                      <p className="text-xs text-gray-500">📎 {atestadoFile.name} — será verificado ao salvar</p>
                    )}
                  </div>
                )}
              </div>
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

            <div className="bg-white border border-red-300 rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-gray-700">📋 Política de ausência e substituição</p>
              <div className="text-xs text-gray-600 leading-relaxed space-y-2">
                <p><strong>1. Falta sem atestado:</strong> A Sede do Movimento <strong>não remunerará</strong> aulas não ministradas sem apresentação de atestado médico válido, correspondente ao período da falta.</p>
                <p><strong>2. Falta com atestado médico válido:</strong> A Sede do Movimento <strong>remunerará o professor cadastrado</strong> nesta turma normalmente. Caso haja substituto, o <strong>repasse ao substituto é de responsabilidade exclusiva do professor cadastrado</strong> — a escola não realiza pagamento direto ao substituto nem se envolve neste acerto financeiro.</p>
                <p><strong>3. Reposição obrigatória:</strong> O professor ausente <strong>tem até 30 dias</strong> a partir desta falta para repor a aula perdida, dentro do mês em que a ausência ocorreu. A data de reposição deverá ser acordada com a secretaria.</p>
                {nomeSubstituto.trim() && (
                  <p><strong>4. Substituto:</strong> Ao informar <strong>{nomeSubstituto}</strong> como substituto(a), você declara ciência de que o acerto financeiro com o(a) substituto(a) é de sua exclusiva responsabilidade. A escola se exime de qualquer obrigação decorrente deste acordo particular.</p>
                )}
              </div>
              <label className="flex items-start gap-2 text-xs text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termosAceitos}
                  onChange={e => setTermosAceitos(e.target.checked)}
                  className="rounded mt-0.5 flex-shrink-0"
                />
                <span className="font-medium">Li, compreendi e concordo com a política acima. Confirmo os dados informados.</span>
              </label>
            </div>
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
      {!professorFaltou && (
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
                    {perfilUsuario !== 'professor' && aluno.status_financeiro === 'inadimplente' && (
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
            disabled={salvando || uploadandoAtestado || (professorFaltou && !termosAceitos) || (temAtestado && !!atestadoErro)}
            title={
              professorFaltou && !termosAceitos ? 'Aceite os termos de ausência antes de concluir' :
              temAtestado && atestadoErro ? 'Corrija o atestado antes de concluir' : undefined
            }
            className="flex-1 bg-indigo-600 text-white text-sm font-medium py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploadandoAtestado ? 'Verificando atestado...' :
             professorFaltou && !termosAceitos ? '⚠ Aceite os termos' :
             temAtestado && atestadoErro ? '⚠ Atestado inválido' :
             'Concluir chamada ✓'}
          </button>
        </div>
        <p className="text-center text-xs text-gray-400 mt-2">
          {online ? '🟢 Online' : '🔴 Offline — dados salvos localmente'}
        </p>
      </div>
    </div>
  )
}
