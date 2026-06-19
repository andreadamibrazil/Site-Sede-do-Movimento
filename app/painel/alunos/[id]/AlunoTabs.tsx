'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import imageCompression from 'browser-image-compression'
import { PDFDocument } from 'pdf-lib'
import AbaUniforme from './AbaUniforme'
import AbaInteligencia from './AbaInteligencia'
import { atualizarAluno, atualizarResponsavel } from './actions'
import { lancarMensalidadesAsaas, darBaixaMensalidade, renegociarMensalidade, editarMatricula, cancelarMatricula, justificarFalta as justificarFaltaAction } from '../actions'

const ABAS = [
  { id: 'dados',         label: 'Dados pessoais' },
  { id: 'matriculas',    label: 'Matrículas e turmas' },
  { id: 'financeiro',    label: 'Financeiro' },
  { id: 'cobrancas',     label: 'Cobranças avulsas' },
  { id: 'presenca',      label: 'Presença' },
  { id: 'documentos',    label: 'Documentos' },
  { id: 'uniforme',      label: 'Uniforme' },
  { id: 'inteligencia',  label: 'Análise IA' },
]

export default function AlunoTabs({ abaAtiva, alunoId, aluno, matriculas, mensalidades, presencas, documentos, uniforme, analiseCron, historicoAnalises }: any) {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-5">
        {ABAS.map(aba => (
          <button
            key={aba.id}
            onClick={() => router.push(`${pathname}?aba=${aba.id}`)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              abaAtiva === aba.id
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {aba.label}
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      {abaAtiva === 'dados'       && <AbaDados aluno={aluno} />}
      {abaAtiva === 'matriculas'  && <AbaMatriculas matriculas={matriculas} alunoId={alunoId} />}
      {abaAtiva === 'financeiro'  && <AbaFinanceiro mensalidades={mensalidades} alunoId={alunoId} />}
      {abaAtiva === 'cobrancas'   && <AbaCobrancas alunoId={aluno.id} />}
      {abaAtiva === 'presenca'    && <AbaPresenca presencas={presencas} alunoId={alunoId} />}
      {abaAtiva === 'documentos'  && <AbaDocumentos documentos={documentos} alunoId={aluno.id} />}
      {abaAtiva === 'uniforme'     && <AbaUniforme alunoId={aluno.id} retiradas={uniforme ?? []} />}
      {abaAtiva === 'inteligencia' && <AbaInteligencia analiseCron={analiseCron ?? null} historicoAnalises={historicoAnalises ?? []} />}
    </div>
  )
}

// ── Aba: Dados pessoais ──────────────────────────────────────

const INP = 'w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-300'

function AbaDados({ aluno }: { aluno: any }) {
  // ── Edição do aluno ──
  const [editando, setEditando] = useState(false)
  const [form, setForm] = useState({
    nome:             aluno.nome             ?? '',
    nome_social:      aluno.nome_social      ?? '',
    data_nascimento:  aluno.data_nascimento  ?? '',
    sexo:             aluno.sexo             ?? '',
    cpf:              aluno.cpf              ?? '',
    rg:               aluno.rg              ?? '',
    celular:          aluno.celular          ?? '',
    email:            aluno.email            ?? '',
    endereco:         aluno.endereco         ?? '',
    bairro:           aluno.bairro           ?? '',
    cep:              aluno.cep              ?? '',
    origem:           aluno.origem           ?? '',
    info_saude:       aluno.info_saude       ?? '',
  })
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  async function handleSalvarAluno() {
    setSalvando(true); setErro('')
    try {
      await atualizarAluno(aluno.id, form)
      setEditando(false)
    } catch (e) { setErro(String(e)) }
    finally { setSalvando(false) }
  }

  // ── Edição do responsável principal ──
  const [editR1, setEditR1] = useState(false)
  const [formR1, setFormR1] = useState({
    nome:         aluno.responsavel_principal?.nome     ?? '',
    celular:      aluno.responsavel_principal?.celular  ?? '',
    email:        aluno.responsavel_principal?.email    ?? '',
    notificacao:  aluno.responsavel_principal?.notificacao ?? 'notificacao_e_cobranca',
  })
  const [salvandoR1, setSalvandoR1] = useState(false)

  async function handleSalvarR1() {
    setSalvandoR1(true)
    try {
      await atualizarResponsavel(aluno.responsavel_principal.id, aluno.id, formR1)
      setEditR1(false)
    } catch (e) { alert(String(e)) }
    finally { setSalvandoR1(false) }
  }

  // ── Edição do responsável secundário ──
  const [editR2, setEditR2] = useState(false)
  const [formR2, setFormR2] = useState({
    nome:         aluno.responsavel_secundario?.nome     ?? '',
    celular:      aluno.responsavel_secundario?.celular  ?? '',
    email:        aluno.responsavel_secundario?.email    ?? '',
    notificacao:  aluno.responsavel_secundario?.notificacao ?? 'notificacao_e_cobranca',
  })
  const [salvandoR2, setSalvandoR2] = useState(false)

  async function handleSalvarR2() {
    setSalvandoR2(true)
    try {
      await atualizarResponsavel(aluno.responsavel_secundario.id, aluno.id, formR2)
      setEditR2(false)
    } catch (e) { alert(String(e)) }
    finally { setSalvandoR2(false) }
  }

  function idade(nasc: string | null) {
    if (!nasc) return null
    const anos = Math.floor((Date.now() - new Date(nasc).getTime()) / (365.25 * 24 * 3600 * 1000))
    return `${anos} anos`
  }
  function fmtData(iso: string | null) {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('pt-BR')
  }

  const CAMPOS_ALUNO: { label: string; key: keyof typeof form; tipo?: string }[] = [
    { label: 'Nome completo',  key: 'nome' },
    { label: 'Nome social',    key: 'nome_social' },
    { label: 'Nascimento',     key: 'data_nascimento', tipo: 'date' },
    { label: 'CPF',            key: 'cpf' },
    { label: 'RG',             key: 'rg' },
    { label: 'Celular',        key: 'celular' },
    { label: 'Email',          key: 'email', tipo: 'email' },
    { label: 'Endereço',       key: 'endereco' },
    { label: 'Bairro',         key: 'bairro' },
    { label: 'CEP',            key: 'cep' },
    { label: 'Origem',         key: 'origem' },
    { label: 'Saúde / acessib.', key: 'info_saude' },
  ]

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* ── Dados do aluno ── */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Dados do aluno</h2>
          {!editando
            ? <button onClick={() => setEditando(true)} className="text-xs text-indigo-600 hover:underline">Editar</button>
            : <div className="flex gap-2">
                <button onClick={() => setEditando(false)} className="text-xs text-gray-400 hover:underline">Cancelar</button>
                <button onClick={handleSalvarAluno} disabled={salvando}
                  className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                  {salvando ? 'Salvando…' : 'Salvar'}
                </button>
              </div>
          }
        </div>
        {erro && <p className="text-xs text-red-500">{erro}</p>}

        {!editando ? (
          <>
            <Row label="Nome completo"      value={aluno.nome} />
            {aluno.nome_social && <Row label="Nome social" value={aluno.nome_social} />}
            <Row label="Nascimento"         value={aluno.data_nascimento ? `${fmtData(aluno.data_nascimento)} (${idade(aluno.data_nascimento)})` : '—'} />
            <Row label="Sexo"               value={aluno.sexo ?? '—'} />
            <Row label="CPF"                value={aluno.cpf ?? '—'} />
            <Row label="RG"                 value={aluno.rg ?? '—'} />
            <Row label="Celular"            value={aluno.celular ? formatarCelular(aluno.celular) : '—'} />
            <Row label="Email"              value={aluno.email ?? '—'} />
            <Row label="Endereço"           value={[aluno.endereco, aluno.bairro].filter(Boolean).join(' — ') || '—'} />
            <Row label="CEP"                value={aluno.cep ?? '—'} />
            <Row label="Origem"             value={aluno.origem ?? '—'} />
            {aluno.info_saude && <Row label="Saúde / acessibilidade" value={aluno.info_saude} />}
            {aluno.observacoes && <Row label="Observações" value={aluno.observacoes} />}
          </>
        ) : (
          <div className="space-y-3">
            {CAMPOS_ALUNO.map(({ label, key, tipo }) => (
              <div key={key} className="space-y-1">
                <label className="text-xs text-gray-400">{label}</label>
                <input
                  type={tipo ?? 'text'}
                  className={INP}
                  value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                />
              </div>
            ))}
            <div className="space-y-1">
              <label className="text-xs text-gray-400">Sexo</label>
              <select className={INP} value={form.sexo} onChange={e => setForm(f => ({ ...f, sexo: e.target.value }))}>
                <option value="">—</option>
                <option value="feminino">Feminino</option>
                <option value="masculino">Masculino</option>
                <option value="outro">Outro</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* ── Responsáveis ── */}
      <div className="space-y-4">
        {aluno.responsavel_principal && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Responsável principal · {aluno.responsavel_principal.parentesco ?? ''}
              </h2>
              {!editR1
                ? <button onClick={() => setEditR1(true)} className="text-xs text-indigo-600 hover:underline">Editar</button>
                : <div className="flex gap-2">
                    <button onClick={() => setEditR1(false)} className="text-xs text-gray-400 hover:underline">Cancelar</button>
                    <button onClick={handleSalvarR1} disabled={salvandoR1}
                      className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                      {salvandoR1 ? 'Salvando…' : 'Salvar'}
                    </button>
                  </div>
              }
            </div>
            {!editR1 ? (
              <>
                <Row label="Nome"    value={aluno.responsavel_principal.nome} />
                <Row label="Celular" value={aluno.responsavel_principal.celular ? formatarCelular(aluno.responsavel_principal.celular) : '—'} />
                <Row label="Email"   value={aluno.responsavel_principal.email ?? '—'} />
                <Row label="Notificações" value={NOTIF_LABEL[aluno.responsavel_principal.notificacao] ?? '—'} />
              </>
            ) : (
              <div className="space-y-3">
                {(['nome', 'celular', 'email'] as const).map(key => (
                  <div key={key} className="space-y-1">
                    <label className="text-xs text-gray-400">{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                    <input className={INP} value={formR1[key]}
                      onChange={e => setFormR1(f => ({ ...f, [key]: e.target.value }))} />
                  </div>
                ))}
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Notificações</label>
                  <select className={INP} value={formR1.notificacao}
                    onChange={e => setFormR1(f => ({ ...f, notificacao: e.target.value }))}>
                    <option value="notificacao_e_cobranca">Notificações e cobranças</option>
                    <option value="so_notificacao">Só notificações</option>
                    <option value="so_cobranca">Só cobranças</option>
                    <option value="nenhum">Nenhum</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {aluno.responsavel_secundario && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Responsável secundário · {aluno.responsavel_secundario.parentesco ?? ''}
              </h2>
              {!editR2
                ? <button onClick={() => setEditR2(true)} className="text-xs text-indigo-600 hover:underline">Editar</button>
                : <div className="flex gap-2">
                    <button onClick={() => setEditR2(false)} className="text-xs text-gray-400 hover:underline">Cancelar</button>
                    <button onClick={handleSalvarR2} disabled={salvandoR2}
                      className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                      {salvandoR2 ? 'Salvando…' : 'Salvar'}
                    </button>
                  </div>
              }
            </div>
            {!editR2 ? (
              <>
                <Row label="Nome"    value={aluno.responsavel_secundario.nome} />
                <Row label="Celular" value={aluno.responsavel_secundario.celular ? formatarCelular(aluno.responsavel_secundario.celular) : '—'} />
                <Row label="Email"   value={aluno.responsavel_secundario.email ?? '—'} />
                <Row label="Notificações" value={NOTIF_LABEL[aluno.responsavel_secundario.notificacao] ?? '—'} />
              </>
            ) : (
              <div className="space-y-3">
                {(['nome', 'celular', 'email'] as const).map(key => (
                  <div key={key} className="space-y-1">
                    <label className="text-xs text-gray-400">{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                    <input className={INP} value={formR2[key]}
                      onChange={e => setFormR2(f => ({ ...f, [key]: e.target.value }))} />
                  </div>
                ))}
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Notificações</label>
                  <select className={INP} value={formR2.notificacao}
                    onChange={e => setFormR2(f => ({ ...f, notificacao: e.target.value }))}>
                    <option value="notificacao_e_cobranca">Notificações e cobranças</option>
                    <option value="so_notificacao">Só notificações</option>
                    <option value="so_cobranca">Só cobranças</option>
                    <option value="nenhum">Nenhum</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {!aluno.responsavel_principal && !aluno.responsavel_secundario && (
          <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-5 text-center text-sm text-gray-400">
            Sem responsável cadastrado
          </div>
        )}
      </div>

      {/* Família */}
      <VincularFamilia alunoId={aluno.id} familiaId={aluno.familia_id ?? null} familiaNome={aluno.familias?.nome ?? null} />
    </div>
  )
}

function VincularFamilia({ alunoId, familiaId, familiaNome }: { alunoId: string; familiaId: string | null; familiaNome: string | null }) {
  const [modal, setModal] = useState(false)
  const [busca, setBusca] = useState('')
  const [sugestoes, setSugestoes] = useState<{ id: string; nome: string }[]>([])
  const [selecionada, setSelecionada] = useState<{ id: string; nome: string } | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [vinculado, setVinculado] = useState(!!familiaId)
  const [nomeAtual, setNomeAtual] = useState(familiaNome)
  const [familiaIdAtual, setFamiliaIdAtual] = useState(familiaId)
  const supabase = createClient()

  async function pesquisar(termo: string) {
    setBusca(termo)
    setSelecionada(null)
    if (termo.length < 2) { setSugestoes([]); return }
    const { data } = await supabase
      .from('familias' as any)
      .select('id, nome')
      .ilike('nome', `%${termo}%`)
      .limit(5)
    setSugestoes((data as any[]) ?? [])
  }

  async function vincular(familiaAlvo: { id: string; nome: string } | null, nomeNovo?: string) {
    setSalvando(true)
    let fId: string
    let fNome: string

    if (familiaAlvo) {
      // Usa família existente
      fId = familiaAlvo.id
      fNome = familiaAlvo.nome
    } else {
      // Cria nova família
      const nome = (nomeNovo ?? busca).trim()
      if (!nome) { setSalvando(false); return }
      const { data: raw, error: errCria } = await supabase.from('familias' as any).insert({ nome }).select('id').single()
      const criada = raw as { id: string } | null
      if (errCria || !criada) { alert('Erro ao criar família: ' + errCria?.message); setSalvando(false); return }
      fId = criada.id
      fNome = nome
    }

    const { error: errAluno } = await (supabase.from('alunos') as any).update({ familia_id: fId }).eq('id', alunoId)
    if (errAluno) { alert('Erro ao vincular aluno: ' + errAluno.message); setSalvando(false); return }
    const { error: errMembro } = await supabase.from('familia_membros' as any).insert({ familia_id: fId, aluno_id: alunoId, papeis: ['aluno'] })
    if (errMembro && errMembro.code !== '23505') { alert('Erro ao registrar membro: ' + errMembro.message); setSalvando(false); return }

    setSalvando(false)
    setVinculado(true)
    setNomeAtual(fNome)
    setFamiliaIdAtual(fId)
    setModal(false)
    setBusca('')
    setSugestoes([])
    setSelecionada(null)
  }

  if (vinculado) {
    return (
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-purple-700 uppercase tracking-wider">Família</p>
          <p className="text-sm font-medium text-gray-900 mt-0.5">👨‍👧 {nomeAtual}</p>
        </div>
        <a href={`/painel/alunos?familia=${familiaIdAtual}`} className="text-xs text-purple-600 hover:text-purple-700">Ver membros →</a>
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setModal(true)}
        className="w-full border border-dashed border-purple-300 rounded-xl p-4 text-sm text-purple-600 hover:bg-purple-50 transition-colors text-center"
      >
        + Vincular a uma família
      </button>

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <h2 className="text-base font-semibold text-gray-900">Vincular família</h2>
            <p className="text-xs text-gray-500">Digite o nome para buscar uma família existente ou criar uma nova.</p>
            <div className="relative">
              <label className="block text-xs font-medium text-gray-600 mb-1">Nome da família</label>
              <input
                value={busca}
                onChange={e => pesquisar(e.target.value)}
                placeholder="Ex: Família Silva"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                autoFocus
              />
              {sugestoes.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                  {sugestoes.map(f => (
                    <button
                      key={f.id}
                      onClick={() => { setSelecionada(f); setBusca(f.nome); setSugestoes([]) }}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-purple-50 flex items-center gap-2"
                    >
                      <span className="text-purple-500">👨‍👧</span>
                      <span>{f.nome}</span>
                      <span className="ml-auto text-xs text-purple-400">usar esta</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selecionada && (
              <div className="text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2">
                ✓ Família encontrada: <strong>{selecionada.nome}</strong> — será vinculada a este aluno
              </div>
            )}
            {busca.length >= 2 && !selecionada && sugestoes.length === 0 && (
              <div className="text-xs text-indigo-700 bg-indigo-50 rounded-lg px-3 py-2">
                Nova família &ldquo;<strong>{busca}</strong>&rdquo; será criada
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => { setModal(false); setBusca(''); setSugestoes([]); setSelecionada(null) }}
                className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2.5 rounded-xl hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => vincular(selecionada)}
                disabled={salvando || busca.length < 2}
                className="flex-1 bg-indigo-600 text-white text-sm font-medium py-2.5 rounded-xl hover:bg-indigo-700 disabled:opacity-40"
              >
                {salvando ? 'Salvando...' : selecionada ? 'Vincular' : 'Criar e vincular'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ── Aba: Matrículas e turmas ─────────────────────────────────

function AbaMatriculas({ matriculas, alunoId }: { matriculas: any[], alunoId: string }) {
  const router = useRouter()
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [editValor, setEditValor] = useState('')
  const [editTipoDesconto, setEditTipoDesconto] = useState('')
  const [editPercDesconto, setEditPercDesconto] = useState('')
  const [editObsDesconto, setEditObsDesconto] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [cancelando, setCancelando] = useState<string | null>(null)
  const [editErro, setEditErro] = useState('')

  function iniciarEdicao(m: any) {
    setEditandoId(m.id)
    setEditValor(String(m.valor_final))
    setEditTipoDesconto(m.tipo_desconto ?? '')
    setEditPercDesconto(m.percentual_desconto ? String(m.percentual_desconto) : '')
    setEditObsDesconto(m.observacao_desconto ?? '')
    setEditErro('')
  }

  async function salvarEdicao(matriculaId: string) {
    const valorNum = Number(String(editValor).replace(',', '.'))
    if (!editValor || isNaN(valorNum) || valorNum <= 0) {
      setEditErro('Valor inválido — informe um número maior que zero.')
      return
    }
    const percNum = editPercDesconto !== '' ? Number(editPercDesconto) : undefined
    setSalvando(true)
    setEditErro('')
    const res = await editarMatricula(matriculaId, {
      valorFinal: valorNum,
      tipoDesconto: editTipoDesconto || null,
      percentualDesconto: percNum !== undefined && !isNaN(percNum) ? percNum : undefined,
      observacaoDesconto: editObsDesconto || null,
    })
    setSalvando(false)
    if ('error' in res) { setEditErro(res.error); return }
    setEditandoId(null)
    router.refresh()
  }

  async function handleCancelarMatricula(matriculaId: string) {
    if (!confirm('Cancelar esta matrícula? Ela ficará com status "cancelada" mas não será apagada.')) return
    setCancelando(matriculaId)
    const res = await cancelarMatricula(matriculaId)
    setCancelando(null)
    if ('error' in res) { alert('Erro: ' + res.error); return }
    router.refresh()
  }

  if (!matriculas.length) return (
    <div className="text-center py-12 space-y-3">
      <p className="text-sm text-gray-400">Nenhuma matrícula ainda.</p>
      <a href={`/painel/alunos/${alunoId}/matricula`}
        className="inline-block text-xs font-medium px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
        + Nova matrícula
      </a>
    </div>
  )

  return (
    <div className="space-y-4">
      {matriculas.map((m: any) => {
        const turmasAtivas = m.matricula_turmas?.filter((mt: any) => !mt.data_saida) ?? []
        const turmaIds = turmasAtivas.map((mt: any) => mt.turma_id).join(',')
        const isEditando = editandoId === m.id
        return (
          <div key={m.id} className={`bg-white border rounded-xl p-5 space-y-3 ${m.status === 'cancelada' ? 'border-gray-100 opacity-60' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  m.status === 'ativa'     ? 'bg-green-100 text-green-700' :
                  m.status === 'trancada'  ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-500'
                }`}>{m.status}</span>
                <span className="ml-2 text-xs text-gray-400">{PLANO_LABEL[m.plano] ?? m.plano}</span>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-gray-900">
                  R$ {Number(m.valor_final).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês
                </p>
                {m.status !== 'cancelada' && (
                  <>
                    <button
                      onClick={() => isEditando ? setEditandoId(null) : iniciarEdicao(m)}
                      className="text-xs font-medium px-2.5 py-1 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                      title="Editar valor e desconto"
                    >
                      {isEditando ? '✕' : '✎ Editar'}
                    </button>
                    <a
                      href={`/painel/alunos/${alunoId}/matricula?plano=${m.plano}&dia=${m.dia_vencimento}&turmas=${turmaIds}`}
                      className="text-xs font-medium px-2.5 py-1 rounded-lg border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-colors"
                      title="Criar nova matrícula com as mesmas turmas e plano"
                    >
                      ↺ Renovar
                    </a>
                    <button
                      onClick={() => handleCancelarMatricula(m.id)}
                      disabled={cancelando === m.id}
                      className="text-xs font-medium px-2.5 py-1 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-50 transition-colors"
                      title="Cancelar esta matrícula"
                    >
                      {cancelando === m.id ? '...' : '🗑'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Form de edição inline */}
            {isEditando && (
              <div className="border border-indigo-100 bg-indigo-50/40 rounded-xl p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Valor mensal (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editValor}
                      onChange={e => setEditValor(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">% desconto</label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      value={editPercDesconto}
                      onChange={e => setEditPercDesconto(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Tipo de desconto</label>
                  <select
                    value={editTipoDesconto}
                    onChange={e => setEditTipoDesconto(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Sem desconto</option>
                    <option value="bairro">Bairro (Rio Comprido)</option>
                    <option value="familia">Família</option>
                    <option value="all_dance">All Dance</option>
                    <option value="vip">VIP</option>
                    <option value="bolsa">Bolsa artística</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Observação</label>
                  <input
                    type="text"
                    value={editObsDesconto}
                    onChange={e => setEditObsDesconto(e.target.value)}
                    placeholder="Ex: aprovado por Carlos em 18/06"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                {editErro && <p className="text-xs text-red-600">✗ {editErro}</p>}
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setEditandoId(null)}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => salvarEdicao(m.id)}
                    disabled={salvando}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    {salvando ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </div>
            )}

            {m.tipo_desconto && !isEditando && (
              <p className="text-xs text-gray-500">
                Desconto: {DESCONTO_LABEL[m.tipo_desconto] ?? m.tipo_desconto}
                {m.percentual_desconto ? ` (${m.percentual_desconto}%)` : ''}
              </p>
            )}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Turmas:</p>
              {turmasAtivas.length ? turmasAtivas.map((mt: any) => (
                <div key={mt.turma_id} className="text-sm text-gray-700">
                  • {mt.turmas?.nome ?? '—'}
                  <span className="text-xs text-gray-400 ml-1">
                    ({mt.turmas?.modalidades?.nome}) · {mt.turmas?.professores?.nome ?? 'sem professor'}
                  </span>
                </div>
              )) : <p className="text-xs text-gray-400">Sem turmas vinculadas</p>}
            </div>
            <p className="text-xs text-gray-400">
              Vence dia {m.dia_vencimento} · desde {new Date(m.data_inicio).toLocaleDateString('pt-BR')}
            </p>
          </div>
        )
      })}
    </div>
  )
}

// ── Aba: Financeiro ──────────────────────────────────────────

function AbaFinanceiro({ mensalidades, alunoId }: { mensalidades: any[]; alunoId: string }) {
  const router = useRouter()
  const [lancando, setLancando] = useState(false)
  const [lancadoMsg, setLancadoMsg] = useState<string | null>(null)
  const [baixando, setBaixando] = useState<string | null>(null)
  const [forma, setForma] = useState('pix')
  const [salvandoBaixa, setSalvandoBaixa] = useState(false)
  const [renegociando, setRenegociando] = useState<string | null>(null)
  const [valorReneg, setValorReneg] = useState('')
  const [motivoReneg, setMotivoReneg] = useState('')
  const [salvandoReneg, setSalvandoReneg] = useState(false)

  const semAsaas = mensalidades.filter(
    m => !m.codigo_asaas && ['aberta', 'em_atraso'].includes(m.status),
  )

  async function handleLancar() {
    setLancando(true)
    setLancadoMsg(null)
    const res = await lancarMensalidadesAsaas(alunoId)
    if (res.lancadas > 0) {
      setLancadoMsg(`${res.lancadas} cobrança${res.lancadas > 1 ? 's' : ''} lançada${res.lancadas > 1 ? 's' : ''} no Asaas`)
    } else if (res.erros.length > 0) {
      setLancadoMsg(`Erro: ${res.erros[0]}`)
    } else {
      setLancadoMsg('Nenhuma mensalidade pendente')
    }
    setLancando(false)
    router.refresh()
  }

  async function handleBaixa(mensalidadeId: string) {
    setSalvandoBaixa(true)
    await darBaixaMensalidade(mensalidadeId, forma, alunoId)
    setSalvandoBaixa(false)
    setBaixando(null)
    router.refresh()
  }

  async function handleReneg(mensalidadeId: string) {
    const v = parseFloat(valorReneg.replace(',', '.'))
    if (!v || v <= 0) return
    setSalvandoReneg(true)
    await renegociarMensalidade(mensalidadeId, v, motivoReneg, alunoId)
    setSalvandoReneg(false)
    setRenegociando(null)
    setValorReneg('')
    setMotivoReneg('')
    router.refresh()
  }

  function abrirReneg(id: string, valorAtual: number) {
    setBaixando(null)
    setValorReneg(String(valorAtual))
    setMotivoReneg('')
    setRenegociando(renegociando === id ? null : id)
  }

  if (!mensalidades.length) return (
    <p className="text-sm text-gray-400 text-center py-12">Nenhuma mensalidade gerada ainda.</p>
  )

  return (
    <div className="space-y-3">
      {semAsaas.length > 0 && (
        <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <p className="text-sm text-amber-700">
            {semAsaas.length} mensalidade{semAsaas.length > 1 ? 's' : ''} não lançada{semAsaas.length > 1 ? 's' : ''} no Asaas
          </p>
          <button onClick={handleLancar} disabled={lancando}
            className="bg-amber-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-amber-600 disabled:opacity-50">
            {lancando ? 'Lançando...' : 'Lançar no Asaas'}
          </button>
        </div>
      )}
      {lancadoMsg && (
        <p className="text-xs text-center bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-2">
          {lancadoMsg}
        </p>
      )}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Competência</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Vencimento</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Valor</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {mensalidades.flatMap((m: any) => {
              const rows = [
                <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-700">
                    {new Date(m.competencia + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(m.vencimento + 'T12:00:00').toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    R$ {Number(m.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${MENS_BADGE[m.status] ?? ''}`}>
                      {MENS_LABEL[m.status] ?? m.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {m.link_pagamento && (
                        <a href={m.link_pagamento} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-indigo-500 hover:text-indigo-700">
                          Link Asaas
                        </a>
                      )}
                      {['aberta', 'em_atraso'].includes(m.status) && (
                        <>
                          <button onClick={() => { setRenegociando(null); setBaixando(baixando === m.id ? null : m.id) }}
                            className="text-xs text-green-600 hover:text-green-700 font-medium">
                            Dar baixa
                          </button>
                          <button onClick={() => abrirReneg(m.id, m.valor)}
                            className="text-xs text-blue-500 hover:text-blue-700 font-medium">
                            Renegociar
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>,
              ]
              if (baixando === m.id) {
                rows.push(
                  <tr key={`${m.id}-baixa`}>
                    <td colSpan={5} className="px-4 py-3 bg-green-50 border-t border-green-100">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-green-700">Forma de pagamento:</span>
                        <select value={forma} onChange={e => setForma(e.target.value)}
                          className="border border-green-200 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none">
                          <option value="pix">PIX</option>
                          <option value="dinheiro">Dinheiro</option>
                          <option value="cartao">Cartão</option>
                          <option value="boleto">Boleto</option>
                          <option value="transferencia">Transferência</option>
                        </select>
                        <button onClick={() => handleBaixa(m.id)} disabled={salvandoBaixa}
                          className="bg-green-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-green-600 disabled:opacity-50">
                          {salvandoBaixa ? '...' : 'Confirmar baixa'}
                        </button>
                        <button onClick={() => setBaixando(null)} className="text-gray-400 text-xs">Cancelar</button>
                      </div>
                    </td>
                  </tr>,
                )
              }
              if (renegociando === m.id) {
                rows.push(
                  <tr key={`${m.id}-reneg`}>
                    <td colSpan={5} className="px-4 py-3 bg-blue-50 border-t border-blue-100">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-xs font-medium text-blue-700">Novo valor:</span>
                        <input
                          type="number"
                          value={valorReneg}
                          onChange={e => setValorReneg(e.target.value)}
                          placeholder="0,00"
                          className="border border-blue-200 rounded-lg px-2 py-1.5 text-xs bg-white w-24 focus:outline-none"
                        />
                        <span className="text-xs font-medium text-blue-700">Motivo:</span>
                        <input
                          type="text"
                          value={motivoReneg}
                          onChange={e => setMotivoReneg(e.target.value)}
                          placeholder="ex: desconto familiar"
                          className="border border-blue-200 rounded-lg px-2 py-1.5 text-xs bg-white flex-1 min-w-[140px] focus:outline-none"
                        />
                        <button onClick={() => handleReneg(m.id)} disabled={salvandoReneg || !valorReneg}
                          className="bg-blue-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-blue-600 disabled:opacity-50">
                          {salvandoReneg ? '...' : 'Confirmar'}
                        </button>
                        <button onClick={() => setRenegociando(null)} className="text-gray-400 text-xs">Cancelar</button>
                      </div>
                    </td>
                  </tr>,
                )
              }
              return rows
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Aba: Presença ────────────────────────────────────────────

function AbaPresenca({ presencas, alunoId }: { presencas: any[]; alunoId: string }) {
  const router = useRouter()
  const [justificando, setJustificando] = useState<string | null>(null)
  const [obs, setObs] = useState('')
  const [salvando, setSalvando] = useState(false)

  if (!presencas.length) return (
    <p className="text-sm text-gray-400 text-center py-12">Nenhuma chamada registrada ainda.</p>
  )
  const total = presencas.length
  const presentes = presencas.filter(p => p.status === 'presente').length
  const faltas = presencas.filter(p => p.status === 'falta').length
  const pct = Math.round((presentes / total) * 100)

  async function handleJustificarFalta(presencaId: string) {
    setSalvando(true)
    await justificarFaltaAction(presencaId, obs, alunoId)
    setJustificando(null)
    setObs('')
    setSalvando(false)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-6">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{pct}%</p>
          <p className="text-xs text-gray-400">frequência</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">{presentes}</p>
          <p className="text-xs text-gray-400">presenças</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-red-500">{faltas}</p>
          <p className="text-xs text-gray-400">faltas</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-yellow-500">
            {presencas.filter(p => p.status === 'falta_justificada').length}
          </p>
          <p className="text-xs text-gray-400">justificadas</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Data</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Turma</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {presencas.map((p: any) => (
              <>
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {p.aulas?.data ? new Date(p.aulas.data).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' }) : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{p.aulas?.turmas?.nome ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PRES_BADGE[p.status] ?? 'bg-gray-100 text-gray-500'}`}>
                      {PRES_LABEL[p.status] ?? p.status}
                    </span>
                    {p.observacao && (
                      <span className="ml-2 text-xs text-gray-400">{p.observacao}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {p.status === 'falta' && (
                      <button
                        onClick={() => setJustificando(justificando === p.id ? null : p.id)}
                        className="text-xs text-yellow-600 hover:text-yellow-700 font-medium"
                      >
                        Justificar
                      </button>
                    )}
                  </td>
                </tr>
                {justificando === p.id && (
                  <tr key={`${p.id}-just`}>
                    <td colSpan={4} className="px-4 py-3 bg-yellow-50 border-t border-yellow-100">
                      <div className="flex items-center gap-3">
                        <input
                          value={obs}
                          onChange={e => setObs(e.target.value)}
                          placeholder="Motivo (ex: atestado médico entregue em 30/05)"
                          className="flex-1 border border-yellow-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                        <button
                          onClick={() => handleJustificarFalta(p.id)}
                          disabled={salvando}
                          className="bg-yellow-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-yellow-600 disabled:opacity-50"
                        >
                          {salvando ? '...' : 'Confirmar justificativa'}
                        </button>
                        <button onClick={() => setJustificando(null)} className="text-gray-400 text-xs">Cancelar</button>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Aba: Documentos ──────────────────────────────────────────

const TIPO_LABEL: Record<string, string> = {
  atestado: 'Atestado médico',
  autorizacao: 'Autorização',
  autorizacao_evento: 'Autorização para Evento',
  contrato: 'Contrato',
  uniforme: 'Retirada de Uniforme',
  rg: 'RG',
  cpf: 'CPF',
  certidao: 'Certidão de Nascimento',
  foto: 'Foto 3x4',
  declaracao_matricula: 'Declaração de Matrícula',
  outro: 'Outro',
}

function AbaDocumentos({ documentos, alunoId }: { documentos: any[]; alunoId: string }) {
  const supabase = createClient()
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [tipo, setTipo] = useState('atestado')
  const [obs, setObs] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setEnviando(true)
    setErro('')

    // Comprime antes de enviar
    let fileParaEnviar: File = file
    const ehImagem = file.type.startsWith('image/')
    const ehPDF = file.type === 'application/pdf'

    if (ehImagem && file.size > 1024 * 1024) {
      fileParaEnviar = await imageCompression(file, {
        maxSizeMB: 0.8,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      })
    } else if (ehPDF && file.size > 512 * 1024) {
      try {
        const bytes = await file.arrayBuffer()
        const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true })
        const compressed = await pdfDoc.save({ useObjectStreams: true, addDefaultPage: false })
        if (compressed.byteLength < file.size) {
          fileParaEnviar = new File([compressed.buffer as ArrayBuffer], file.name, { type: 'application/pdf' })
        }
      } catch {
        // Se falhar compressão, usa o original
      }
    }

    const ext = file.name.split('.').pop()
    const path = `${alunoId}/${Date.now()}.${ext}`

    const { error: upErr } = await supabase.storage
      .from('documentos-alunos')
      .upload(path, fileParaEnviar)

    if (upErr) { setErro(upErr.message); setEnviando(false); return }

    // Extrai dados automaticamente via Gemini (atestados e documentos com imagem)
    let dadosExtraidos = null
    let obsAutomatica = obs || null
    const ehDocumentoAnalisavel = ['atestado', 'outro', 'autorizacao'].includes(tipo)
    const ehArquivoLegivel = file.type.startsWith('image/') || file.type === 'application/pdf'

    if (ehDocumentoAnalisavel && ehArquivoLegivel) {
      try {
        const form = new FormData()
        form.append('file', fileParaEnviar, file.name)
        const res = await fetch('/api/painel/analisar-documento', { method: 'POST', body: form })
        const json = await res.json()
        if (json.dados) {
          dadosExtraidos = json.dados
          // Monta descrição automática a partir dos dados extraídos
          const d = json.dados
          const partes = []
          if (d.nome_medico) partes.push(`Médico: ${d.nome_medico}`)
          if (d.crm) partes.push(`CRM: ${d.crm}`)
          if (d.data_consulta) partes.push(`Consulta: ${new Date(d.data_consulta).toLocaleDateString('pt-BR')}`)
          if (d.hora_consulta) partes.push(`às ${d.hora_consulta}`)
          if (d.data_inicio_afastamento && d.data_fim_afastamento) {
            partes.push(`Afastamento: ${new Date(d.data_inicio_afastamento).toLocaleDateString('pt-BR')} a ${new Date(d.data_fim_afastamento).toLocaleDateString('pt-BR')}`)
          }
          if (d.dias_afastamento) partes.push(`(${d.dias_afastamento} dias)`)
          if (d.diagnostico) partes.push(`| ${d.diagnostico}`)
          if (partes.length) obsAutomatica = (obs ? obs + ' — ' : '') + partes.join(' · ')
        }
      } catch {
        // Falha no Gemini não impede o upload
      }
    }

    await supabase.from('documentos_aluno').insert({
      aluno_id: alunoId,
      tipo: tipo as any,
      nome: file.name,
      storage_path: path,
      observacao: obsAutomatica,
      dados_extraidos: dadosExtraidos as any,
    })

    setObs('')
    setEnviando(false)
    if (inputRef.current) inputRef.current.value = ''
    router.refresh()
  }

  async function baixar(path: string, nome: string) {
    const { data } = await supabase.storage.from('documentos-alunos').createSignedUrl(path, 60)
    if (data?.signedUrl) {
      const a = document.createElement('a')
      a.href = data.signedUrl
      a.download = nome
      a.click()
    }
  }

  async function excluir(id: string, path: string) {
    if (!confirm('Excluir este documento?')) return
    await supabase.storage.from('documentos-alunos').remove([path])
    await supabase.from('documentos_aluno').delete().eq('id', id)
    router.refresh()
  }

  return (
    <div className="space-y-5">
      {/* Upload */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">Adicionar documento</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tipo</label>
            <select
              value={tipo}
              onChange={e => setTipo(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {Object.entries(TIPO_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Observação</label>
            <input
              value={obs}
              onChange={e => setObs(e.target.value)}
              placeholder="Ex: Atestado referente à falta de 28/05"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div>
          <input ref={inputRef} type="file" onChange={upload} disabled={enviando} className="hidden" id="doc-upload" />
          <label
            htmlFor="doc-upload"
            className={`flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl p-6 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50 transition-colors ${enviando ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <span className="text-2xl">📎</span>
            <span className="text-sm text-gray-500">{enviando ? 'Enviando...' : 'Clique para selecionar o arquivo'}</span>
          </label>
        </div>
        {erro && <p className="text-xs text-red-500">{erro}</p>}
      </div>

      {/* Lista de documentos */}
      {documentos.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">Nenhum documento ainda.</p>
      ) : (
        <div className="space-y-2">
          {documentos.map((doc: any) => (
            <div key={doc.id} className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {TIPO_LABEL[doc.tipo] ?? doc.tipo}
                  </span>
                  {doc.docuseal_status && (
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      doc.docuseal_status === 'assinado'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {doc.docuseal_status === 'assinado' ? 'Assinado' : 'Aguardando assinatura'}
                    </span>
                  )}
                  <p className="text-sm font-medium text-gray-900">{doc.nome}</p>
                </div>
                {doc.observacao && <p className="text-xs text-gray-400 mt-0.5">{doc.observacao}</p>}
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {doc.docuseal_url ? (
                  <a
                    href={doc.docuseal_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Abrir
                  </a>
                ) : (
                  <button
                    onClick={() => baixar(doc.storage_path, doc.nome)}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Baixar
                  </button>
                )}
                <button
                  onClick={() => excluir(doc.id, doc.storage_path)}
                  className="text-xs text-red-400 hover:text-red-600"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Aba: Cobranças Avulsas ───────────────────────────────────

const CAT_LABEL: Record<string, string> = {
  taxa_matricula: 'Taxa de matrícula',
  espetaculo_participacao: 'Espetáculo — participação',
  espetaculo_figurino: 'Espetáculo — figurino',
  espetaculo_foto: 'Espetáculo — foto',
  espetaculo_programa: 'Espetáculo — programa',
  pratica_montagem: 'Prática de Montagem',
  workshop: 'Workshop',
  aula_particular: 'Aula particular',
  uniforme: 'Uniforme',
  aluguel_sala: 'Aluguel de sala',
  ensaio_extra: 'Ensaio extra',
  outro: 'Outro',
}

const STATUS_COB: Record<string, { label: string; className: string }> = {
  pendente:  { label: 'Pendente',  className: 'bg-gray-100 text-gray-600' },
  pago:      { label: 'Pago',      className: 'bg-green-100 text-green-700' },
  cancelado: { label: 'Cancelado', className: 'bg-red-100 text-red-500' },
}

function AbaCobrancas({ alunoId }: { alunoId: string }) {
  const supabase = createClient()
  const [cobrancas, setCobrancas] = useState<any[]>([])
  const [carregado, setCarregado] = useState(false)
  const [adicionando, setAdicionando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [form, setForm] = useState({
    categoria: 'espetaculo_participacao',
    descricao: '',
    valor: '',
    vencimento: '',
  })

  // Carrega ao montar
  useEffect(() => {
    supabase.from('cobrancas_avulsas')
      .select('*')
      .eq('aluno_id', alunoId)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setCobrancas(data ?? []); setCarregado(true) })
  }, [alunoId])

  async function adicionar() {
    if (!form.descricao || !form.valor) return
    setSalvando(true)
    await supabase.from('cobrancas_avulsas').insert({
      aluno_id: alunoId,
      categoria: form.categoria as any,
      descricao: form.descricao,
      valor: Number(form.valor.replace(',', '.')),
      vencimento: form.vencimento || null,
      status: 'pendente',
    })
    setSalvando(false)
    setAdicionando(false)
    setForm({ categoria: 'espetaculo_participacao', descricao: '', valor: '', vencimento: '' })
    // Recarrega
    const { data } = await supabase.from('cobrancas_avulsas').select('*').eq('aluno_id', alunoId).order('created_at', { ascending: false })
    setCobrancas(data ?? [])
  }

  async function marcarPago(id: string) {
    await supabase.from('cobrancas_avulsas').update({ status: 'pago', pago_em: new Date().toISOString() }).eq('id', id)
    setCobrancas(c => c.map(x => x.id === id ? { ...x, status: 'pago' } : x))
  }

  const total = cobrancas.filter(c => c.status === 'pendente').reduce((a, c) => a + Number(c.valor), 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          {total > 0 && <p className="text-sm font-semibold text-orange-600">R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} pendente</p>}
        </div>
        <button onClick={() => setAdicionando(!adicionando)}
          className="bg-indigo-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors">
          + Nova cobrança
        </button>
      </div>

      {adicionando && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-indigo-700">Nova cobrança avulsa</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Categoria</label>
              <select value={form.categoria} onChange={e => setForm(f => ({...f, categoria: e.target.value}))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {Object.entries(CAT_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Valor (R$)</label>
              <input value={form.valor} onChange={e => setForm(f => ({...f, valor: e.target.value}))}
                placeholder="Ex: 700,00"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Descrição</label>
              <input value={form.descricao} onChange={e => setForm(f => ({...f, descricao: e.target.value}))}
                placeholder="Ex: Taxa de participação Espetáculo 2026 — 1º lote"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Vencimento</label>
              <input type="date" value={form.vencimento} onChange={e => setForm(f => ({...f, vencimento: e.target.value}))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setAdicionando(false)} className="text-xs text-gray-500 px-3 py-1.5">Cancelar</button>
            <button onClick={adicionar} disabled={salvando || !form.descricao || !form.valor}
              className="bg-indigo-600 text-white text-xs font-medium px-4 py-1.5 rounded-lg disabled:opacity-50">
              {salvando ? 'Salvando...' : 'Adicionar'}
            </button>
          </div>
        </div>
      )}

      {!carregado ? (
        <p className="text-sm text-gray-400 text-center py-6">Carregando...</p>
      ) : cobrancas.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">Nenhuma cobrança avulsa.</p>
      ) : (
        <div className="space-y-2">
          {cobrancas.map((c: any) => {
            const badge = STATUS_COB[c.status] ?? { label: c.status, className: 'bg-gray-100 text-gray-500' }
            return (
              <div key={c.id} className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full shrink-0">
                      {CAT_LABEL[c.categoria] ?? c.categoria}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge.className}`}>
                      {badge.label}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 mt-1">{c.descricao}</p>
                  {c.vencimento && (
                    <p className="text-xs text-gray-400">Vence {new Date(c.vencimento + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-gray-900">
                    R$ {Number(c.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  {c.status === 'pendente' && (
                    <button onClick={() => marcarPago(c.id)}
                      className="text-xs text-green-600 hover:text-green-700 font-medium mt-0.5">
                      Marcar pago
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Helpers ──────────────────────────────────────────────────

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-gray-400 shrink-0">{label}</span>
      <span className="font-medium text-gray-900 text-right">{value}</span>
    </div>
  )
}

function formatarCelular(cel: string) {
  const n = cel.replace(/\D/g, '')
  if (n.length === 11) return `(${n.slice(0,2)}) ${n.slice(2,7)}-${n.slice(7)}`
  if (n.length === 10) return `(${n.slice(0,2)}) ${n.slice(2,6)}-${n.slice(6)}`
  return cel
}

const NOTIF_LABEL: Record<string, string> = {
  notificacao_e_cobranca: 'Notificações e cobranças',
  so_notificacao: 'Só notificações',
  so_cobranca: 'Só cobranças',
  nenhum: 'Nenhum',
}

const PLANO_LABEL: Record<string, string> = {
  mensal: 'Mensal', trimestral: 'Trimestral',
  semestral: 'Semestral', anual: 'Anual',
  fidelidade: 'Fidelidade (anual)', personalizado: 'Personalizado (migração)',
}

const DESCONTO_LABEL: Record<string, string> = {
  bairro: 'Bairro (Rio Comprido)', familia: 'Família',
  all_dance: 'All Dance', vip: 'VIP', bolsa: 'Bolsa artística', outro: 'Outro',
}

const MENS_BADGE: Record<string, string> = {
  aberta: 'bg-gray-100 text-gray-600',
  recebida: 'bg-green-100 text-green-700',
  em_atraso: 'bg-orange-100 text-orange-700',
  renegociada: 'bg-blue-100 text-blue-700',
  cancelada: 'bg-gray-100 text-gray-400',
}

const MENS_LABEL: Record<string, string> = {
  aberta: 'Em aberto', recebida: 'Paga',
  em_atraso: 'Em atraso', renegociada: 'Renegociada', cancelada: 'Cancelada',
}

const PRES_BADGE: Record<string, string> = {
  presente: 'bg-green-100 text-green-700',
  falta: 'bg-red-100 text-red-700',
  falta_justificada: 'bg-yellow-100 text-yellow-700',
  reposicao: 'bg-blue-100 text-blue-700',
  experimental: 'bg-purple-100 text-purple-700',
  professor_faltou: 'bg-gray-100 text-gray-500',
}

const PRES_LABEL: Record<string, string> = {
  presente: 'Presente', falta: 'Falta',
  falta_justificada: 'Justificada', reposicao: 'Reposição',
  experimental: 'Experimental', professor_faltou: 'Prof. faltou',
}
