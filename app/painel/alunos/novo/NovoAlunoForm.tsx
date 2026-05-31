'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const ORIGENS = [
  'Instagram', 'WhatsApp', 'Indicação de aluno', 'Indicação de familiar',
  'Google', 'Festival', 'Passa na frente', 'Outro',
]

type Etapa = 'dados' | 'responsavel' | 'saude'

export default function NovoAlunoForm() {
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
    tem_responsavel: false,
    nome: '', cpf: '', celular: '', email: '', parentesco: '',
    notificacao: 'notificacao_e_cobranca',
    nome2: '', cpf2: '', celular2: '', email2: '', parentesco2: '',
    tem_segundo: false,
    notificacao2: 'notificacao_e_cobranca',
  })

  const [saude, setSaude] = useState({ info_saude: '', observacoes: '' })

  function setD(campo: string, v: string) { setDados(f => ({ ...f, [campo]: v })) }
  function setR(campo: string, v: any) { setResponsavel(f => ({ ...f, [campo]: v })) }

  async function salvar() {
    if (!dados.nome.trim()) { setErro('Nome é obrigatório.'); return }
    setSalvando(true); setErro('')

    // Cria responsável principal se menor
    let resp1Id = null, resp2Id = null
    if (responsavel.tem_responsavel && responsavel.nome) {
      const r1 = await supabase.from('responsaveis').insert({
        nome: responsavel.nome,
        cpf: responsavel.cpf || null,
        celular: responsavel.celular || 'não informado',
        email: responsavel.email || null,
        parentesco: responsavel.parentesco || null,
        notificacao: responsavel.notificacao as any,
      }).select('id').single()
      if (r1.data) resp1Id = r1.data.id

      // Segundo responsável
      if (responsavel.tem_segundo && responsavel.nome2) {
        const r2 = await supabase.from('responsaveis').insert({
          nome: responsavel.nome2,
          cpf: responsavel.cpf2 || null,
          celular: responsavel.celular2 || 'não informado',
          email: responsavel.email2 || null,
          parentesco: responsavel.parentesco2 || null,
          notificacao: responsavel.notificacao2 as any,
        }).select('id').single()
        if (r2.data) resp2Id = r2.data.id
      }
    }

    // Cria aluno
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
            {dados.origem === 'Indicação de aluno' || dados.origem === 'Indicação de familiar' ? (
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Nome de quem indicou</label>
                <input value={dados.como_conheceu} onChange={e => setD('como_conheceu', e.target.value)}
                  placeholder="Nome do aluno ou familiar que indicou"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            ) : null}
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
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ['nome', 'Nome completo *', 'text', 'Nome do responsável'],
                    ['parentesco', 'Parentesco', 'text', 'mãe, pai, avó...'],
                    ['celular', 'Celular *', 'text', '(21) 99999-9999'],
                    ['email', 'Email', 'email', 'email@exemplo.com'],
                    ['cpf', 'CPF', 'text', '000.000.000-00'],
                  ].map(([campo, label, type, ph]) => (
                    <div key={campo as string} className={campo === 'nome' ? 'col-span-2' : ''}>
                      <label className="block text-xs font-medium text-gray-600 mb-1">{label as string}</label>
                      <input type={type as string} value={(responsavel as any)[campo as string]}
                        onChange={e => setR(campo as string, e.target.value)}
                        placeholder={ph as string}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
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
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        ['nome2', 'Nome completo', 'text', 'Nome'],
                        ['parentesco2', 'Parentesco', 'text', 'pai, avó...'],
                        ['celular2', 'Celular', 'text', '(21) 99999-9999'],
                        ['email2', 'Email', 'email', 'email@exemplo.com'],
                      ].map(([campo, label, type, ph]) => (
                        <div key={campo as string}>
                          <label className="block text-xs font-medium text-gray-600 mb-1">{label as string}</label>
                          <input type={type as string} value={(responsavel as any)[campo as string]}
                            onChange={e => setR(campo as string, e.target.value)}
                            placeholder={ph as string}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
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
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Saúde / acessibilidade
              </label>
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
              <p className="text-xs opacity-70 mt-0.5">Resp.: {responsavel.nome} ({responsavel.parentesco})</p>
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
