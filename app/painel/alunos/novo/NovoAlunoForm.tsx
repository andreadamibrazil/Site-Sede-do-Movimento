'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const ORIGENS = [
  'Instagram', 'WhatsApp', 'Indicação de aluno', 'Indicação de familiar',
  'Google', 'Festival', 'Passa na frente', 'Outro',
]

type Etapa = 'dados' | 'responsavel' | 'saude'
type RespEncontrado = { id: string; nome: string; celular: string } | null
type LeadResponsavel = { id: string; nome: string; celular: string; email: string | null; como_conheceu: string | null } | null

export default function NovoAlunoForm({ leadResponsavel }: { leadResponsavel?: LeadResponsavel }) {
  const supabase = createClient()
  const router = useRouter()

  const [etapa, setEtapa] = useState<Etapa>('dados')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  const [dados, setDados] = useState({
    nome: '', nome_social: '', sexo: '',
    data_nascimento: '', cpf: '', rg: '',
    celular: '', email: '',
    cep: '', endereco: '', bairro: '',
    origem: '', como_conheceu: '',
  })

  const [responsavel, setResponsavel] = useState({
    tem_responsavel: !!leadResponsavel,
    nome: leadResponsavel?.nome ?? '',
    cpf: '',
    celular: leadResponsavel?.celular ?? '',
    email: leadResponsavel?.email ?? '',
    parentesco: '',
    notificacao: 'notificacao_e_cobranca',
    nome2: '', cpf2: '', celular2: '', email2: '', parentesco2: '',
    tem_segundo: false,
    notificacao2: 'notificacao_e_cobranca',
  })
  // ID do lead para marcar como convertido após salvar
  const leadId = leadResponsavel?.id ?? null

  const [resp1Encontrado, setResp1Encontrado] = useState<RespEncontrado>(null)
  const [resp2Encontrado, setResp2Encontrado] = useState<RespEncontrado>(null)
  const [buscando1, setBuscando1] = useState(false)
  const [buscando2, setBuscando2] = useState(false)

  const [saude, setSaude] = useState({ info_saude: '', observacoes: '' })

  function setD(campo: string, v: string) { setDados(f => ({ ...f, [campo]: v })) }
  function setR(campo: string, v: any) { setResponsavel(f => ({ ...f, [campo]: v })) }

  async function buscarResponsavelPorCPF(cpf: string, num: 1 | 2) {
    const cpfLimpo = cpf.replace(/\D/g, '')
    if (cpfLimpo.length < 11) return
    if (num === 1) setBuscando1(true); else setBuscando2(true)

    const { data } = await supabase
      .from('responsaveis')
      .select('id, nome, celular')
      .eq('cpf', cpfLimpo)
      .maybeSingle()

    if (num === 1) {
      setBuscando1(false)
      if (data) {
        setResp1Encontrado(data)
        setR('nome', data.nome)
        setR('celular', data.celular ?? '')
      } else {
        setResp1Encontrado(null)
      }
    } else {
      setBuscando2(false)
      if (data) {
        setResp2Encontrado(data)
        setR('nome2', data.nome)
        setR('celular2', data.celular ?? '')
      } else {
        setResp2Encontrado(null)
      }
    }
  }

  async function obterOuCriarResponsavel(
    cpf: string, nome: string, celular: string, email: string,
    parentesco: string, notificacao: string, encontrado: RespEncontrado
  ): Promise<string | null> {
    if (!nome.trim()) return null

    // Reutiliza se já encontrou pelo CPF
    if (encontrado) return encontrado.id

    // Tenta buscar pelo CPF antes de criar (fallback)
    const cpfLimpo = cpf.replace(/\D/g, '')
    if (cpfLimpo.length === 11) {
      const { data: existente } = await supabase
        .from('responsaveis')
        .select('id')
        .eq('cpf', cpfLimpo)
        .maybeSingle()
      if (existente) return existente.id
    }

    // Cria novo
    const { data } = await supabase
      .from('responsaveis')
      .insert({
        nome: nome.trim(),
        cpf: cpfLimpo.length === 11 ? cpfLimpo : null,
        celular: celular || 'não informado',
        email: email || null,
        parentesco: parentesco || null,
        notificacao: notificacao as any,
      })
      .select('id')
      .single()

    return data?.id ?? null
  }

  async function salvar() {
    if (!dados.nome.trim()) { setErro('Nome é obrigatório.'); return }
    setSalvando(true); setErro('')

    let resp1Id = null, resp2Id = null

    if (responsavel.tem_responsavel && responsavel.nome) {
      resp1Id = await obterOuCriarResponsavel(
        responsavel.cpf, responsavel.nome, responsavel.celular,
        responsavel.email, responsavel.parentesco, responsavel.notificacao,
        resp1Encontrado
      )

      if (responsavel.tem_segundo && responsavel.nome2) {
        resp2Id = await obterOuCriarResponsavel(
          responsavel.cpf2, responsavel.nome2, responsavel.celular2,
          responsavel.email2, responsavel.parentesco2, responsavel.notificacao2,
          resp2Encontrado
        )
      }
    }

    const { data: aluno, error } = await supabase.from('alunos').insert({
      nome: dados.nome.trim(),
      nome_social: dados.nome_social || null,
      sexo: dados.sexo as any || null,
      data_nascimento: dados.data_nascimento || null,
      cpf: dados.cpf || null,
      rg: dados.rg || null,
      celular: dados.celular || null,
      email: dados.email || null,
      cep: dados.cep || null,
      endereco: dados.endereco || null,
      bairro: dados.bairro || null,
      origem: dados.origem || null,
      como_conheceu: dados.como_conheceu || null,
      info_saude: saude.info_saude || null,
      observacoes: saude.observacoes || null,
      responsavel_principal_id: resp1Id,
      responsavel_secundario_id: resp2Id,
      status_pedagogico: 'ativo',
      status_financeiro: 'em_dia',
    }).select('id').single()

    if (error) { setErro(error.message); setSalvando(false); return }

    // Marca lead como convertido se veio de um lead responsável
    if (leadId) {
      await supabase.from('leads').update({ status: 'convertido' }).eq('id', leadId)
    }

    router.push(`/painel/alunos/${aluno.id}`)
  }

  const ETAPAS: { id: Etapa; label: string }[] = [
    { id: 'dados', label: 'Dados' },
    { id: 'responsavel', label: 'Responsável' },
    { id: 'saude', label: 'Saúde e obs.' },
  ]

  return (
    <div className="space-y-5">
      {/* Stepper */}
      <div className="flex gap-1">
        {ETAPAS.map((e, i) => (
          <button key={e.id} onClick={() => setEtapa(e.id)}
            className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors ${
              etapa === e.id ? 'bg-indigo-600 text-white' :
              ETAPAS.findIndex(x => x.id === etapa) > i ? 'bg-green-100 text-green-700' :
              'bg-gray-100 text-gray-500'
            }`}>
            {ETAPAS.findIndex(x => x.id === etapa) > i ? '✓ ' : `${i+1}. `}{e.label}
          </button>
        ))}
      </div>

      {/* ── Etapa 1: Dados pessoais ── */}
      {etapa === 'dados' && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Nome completo *</label>
              <input value={dados.nome} onChange={e => setD('nome', e.target.value)}
                placeholder="Nome completo"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Como prefere ser chamado(a)</label>
              <input value={dados.nome_social} onChange={e => setD('nome_social', e.target.value)}
                placeholder="Apelido / nome social"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Sexo</label>
              <select value={dados.sexo} onChange={e => setD('sexo', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Selecionar</option>
                <option value="feminino">Feminino</option>
                <option value="masculino">Masculino</option>
                <option value="outro">Outro</option>
                <option value="prefiro_nao_informar">Prefiro não informar</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Data de nascimento</label>
              <input type="date" value={dados.data_nascimento} onChange={e => setD('data_nascimento', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">CPF</label>
              <input value={dados.cpf} onChange={e => setD('cpf', e.target.value)}
                placeholder="000.000.000-00"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Celular</label>
              <input value={dados.celular} onChange={e => setD('celular', e.target.value)}
                placeholder="(21) 99999-9999"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
              <input type="email" value={dados.email} onChange={e => setD('email', e.target.value)}
                placeholder="email@exemplo.com"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Bairro</label>
              <input value={dados.bairro} onChange={e => setD('bairro', e.target.value)}
                placeholder="Ex: Rio Comprido"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Como nos encontrou</label>
              <select value={dados.origem} onChange={e => setD('origem', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Selecionar</option>
                {ORIGENS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            {(dados.origem === 'Indicação de aluno' || dados.origem === 'Indicação de familiar') && (
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Nome de quem indicou</label>
                <input value={dados.como_conheceu} onChange={e => setD('como_conheceu', e.target.value)}
                  placeholder="Nome do aluno ou familiar que indicou"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <button onClick={() => setEtapa('responsavel')} disabled={!dados.nome}
              className="bg-indigo-600 text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-40 transition-colors">
              Próximo →
            </button>
          </div>
        </div>
      )}

      {/* ── Etapa 2: Responsável ── */}
      {etapa === 'responsavel' && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700">Responsável</h2>
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input type="checkbox" checked={responsavel.tem_responsavel}
                  onChange={e => setR('tem_responsavel', e.target.checked)} />
                É menor de idade / tem responsável
              </label>
            </div>

            {responsavel.tem_responsavel && (
              <div className="space-y-4">
                <p className="text-xs text-gray-400">Responsável principal</p>

                {/* CPF com busca automática */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">CPF do responsável</label>
                  <div className="flex gap-2">
                    <input
                      value={responsavel.cpf}
                      onChange={e => { setR('cpf', e.target.value); setResp1Encontrado(null) }}
                      onBlur={() => buscarResponsavelPorCPF(responsavel.cpf, 1)}
                      placeholder="000.000.000-00"
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => buscarResponsavelPorCPF(responsavel.cpf, 1)}
                      disabled={buscando1}
                      className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 disabled:opacity-40"
                    >
                      {buscando1 ? '...' : 'Buscar'}
                    </button>
                  </div>
                  {resp1Encontrado && (
                    <div className="mt-1.5 flex items-center gap-2 text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2">
                      <span>✓</span>
                      <span>Responsável encontrado: <strong>{resp1Encontrado.nome}</strong> — será reutilizado automaticamente</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    ['nome', 'Nome completo *', 'text', 'Nome do responsável'],
                    ['parentesco', 'Parentesco', 'text', 'mãe, pai, avó...'],
                    ['celular', 'Celular *', 'text', '(21) 99999-9999'],
                    ['email', 'Email', 'email', 'email@exemplo.com'],
                  ].map(([campo, label, type, ph]) => (
                    <div key={campo as string} className={campo === 'nome' ? 'col-span-2' : ''}>
                      <label className="block text-xs font-medium text-gray-600 mb-1">{label as string}</label>
                      <input
                        type={type as string}
                        value={(responsavel as any)[campo as string]}
                        onChange={e => setR(campo as string, e.target.value)}
                        placeholder={ph as string}
                        readOnly={!!resp1Encontrado && (campo === 'nome' || campo === 'celular')}
                        className={`w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          resp1Encontrado && (campo === 'nome' || campo === 'celular') ? 'bg-gray-50 text-gray-500' : ''
                        }`}
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Notificações</label>
                    <select value={responsavel.notificacao} onChange={e => setR('notificacao', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="notificacao_e_cobranca">Notificações e cobranças</option>
                      <option value="so_notificacao">Só notificações</option>
                      <option value="so_cobranca">Só cobranças</option>
                      <option value="nenhum">Nenhum</option>
                    </select>
                  </div>
                </div>

                {/* Segundo responsável */}
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer mt-2">
                  <input type="checkbox" checked={responsavel.tem_segundo}
                    onChange={e => setR('tem_segundo', e.target.checked)} />
                  Adicionar segundo responsável (pais separados, etc.)
                </label>

                {responsavel.tem_segundo && (
                  <div className="border-t border-gray-100 pt-4 space-y-3">
                    <p className="text-xs text-gray-400">Responsável secundário</p>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">CPF do 2º responsável</label>
                      <div className="flex gap-2">
                        <input
                          value={responsavel.cpf2}
                          onChange={e => { setR('cpf2', e.target.value); setResp2Encontrado(null) }}
                          onBlur={() => buscarResponsavelPorCPF(responsavel.cpf2, 2)}
                          placeholder="000.000.000-00"
                          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => buscarResponsavelPorCPF(responsavel.cpf2, 2)}
                          disabled={buscando2}
                          className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 disabled:opacity-40"
                        >
                          {buscando2 ? '...' : 'Buscar'}
                        </button>
                      </div>
                      {resp2Encontrado && (
                        <div className="mt-1.5 flex items-center gap-2 text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2">
                          <span>✓</span>
                          <span>Responsável encontrado: <strong>{resp2Encontrado.nome}</strong> — será reutilizado</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {[
                        ['nome2', 'Nome completo', 'text', 'Nome'],
                        ['parentesco2', 'Parentesco', 'text', 'pai, avó...'],
                        ['celular2', 'Celular', 'text', '(21) 99999-9999'],
                        ['email2', 'Email', 'email', 'email@exemplo.com'],
                      ].map(([campo, label, type, ph]) => (
                        <div key={campo as string}>
                          <label className="block text-xs font-medium text-gray-600 mb-1">{label as string}</label>
                          <input
                            type={type as string}
                            value={(responsavel as any)[campo as string]}
                            onChange={e => setR(campo as string, e.target.value)}
                            placeholder={ph as string}
                            readOnly={!!resp2Encontrado && (campo === 'nome2' || campo === 'celular2')}
                            className={`w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                              resp2Encontrado && (campo === 'nome2' || campo === 'celular2') ? 'bg-gray-50 text-gray-500' : ''
                            }`}
                          />
                        </div>
                      ))}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Notificações</label>
                        <select value={responsavel.notificacao2} onChange={e => setR('notificacao2', e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                          <option value="notificacao_e_cobranca">Notificações e cobranças</option>
                          <option value="so_notificacao">Só notificações</option>
                          <option value="so_cobranca">Só cobranças</option>
                          <option value="nenhum">Nenhum</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex justify-between">
            <button onClick={() => setEtapa('dados')} className="text-sm text-gray-500 px-4 py-2.5">← Voltar</button>
            <button onClick={() => setEtapa('saude')}
              className="bg-indigo-600 text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors">
              Próximo →
            </button>
          </div>
        </div>
      )}

      {/* ── Etapa 3: Saúde e observações ── */}
      {etapa === 'saude' && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-700">Saúde e informações adicionais</h2>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Saúde / acessibilidade</label>
              <textarea value={saude.info_saude}
                onChange={e => setSaude(f => ({ ...f, info_saude: e.target.value }))}
                rows={3} placeholder="Alergias, condições médicas, necessidades especiais, limitações físicas..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Observações internas</label>
              <textarea value={saude.observacoes}
                onChange={e => setSaude(f => ({ ...f, observacoes: e.target.value }))}
                rows={2} placeholder="Qualquer informação relevante para a secretaria..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
            </div>
          </div>

          {/* Resumo */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-sm text-indigo-800">
            <p className="font-medium mb-1">{dados.nome}</p>
            <p className="text-xs opacity-70">
              {dados.data_nascimento ? `Nasc. ${new Date(dados.data_nascimento + 'T12:00:00').toLocaleDateString('pt-BR')} · ` : ''}
              {dados.celular || 'sem celular'} · {dados.origem || 'origem não informada'}
            </p>
            {responsavel.tem_responsavel && responsavel.nome && (
              <p className="text-xs opacity-70 mt-0.5">
                Resp.: {responsavel.nome} ({responsavel.parentesco})
                {resp1Encontrado ? ' — já cadastrado ✓' : ' — será criado'}
              </p>
            )}
            {responsavel.tem_segundo && responsavel.nome2 && (
              <p className="text-xs opacity-70 mt-0.5">
                2º Resp.: {responsavel.nome2}
                {resp2Encontrado ? ' — já cadastrado ✓' : ' — será criado'}
              </p>
            )}
          </div>

          {erro && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{erro}</p>}

          <div className="flex justify-between">
            <button onClick={() => setEtapa('responsavel')} className="text-sm text-gray-500 px-4 py-2.5">← Voltar</button>
            <button onClick={salvar} disabled={salvando}
              className="bg-indigo-600 text-white text-sm font-medium px-8 py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              {salvando ? 'Salvando...' : 'Cadastrar aluno'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
