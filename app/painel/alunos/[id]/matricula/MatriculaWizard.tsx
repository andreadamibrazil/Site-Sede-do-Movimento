'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const DIAS_LABEL: Record<string, string> = {
  segunda: 'Seg', terca: 'Ter', quarta: 'Qua',
  quinta: 'Qui', sexta: 'Sex', sabado: 'Sáb', domingo: 'Dom',
}

const PLANOS = [
  { id: 'mensal',     label: 'Mensal',     meses: 1,  descricao: 'Sem fidelidade' },
  { id: 'fidelidade', label: 'Fidelidade', meses: 12, descricao: '12 meses — contrato anual' },
]

const DESCONTOS = [
  { id: '',          label: 'Sem desconto' },
  { id: 'bairro',    label: 'Bairro (Rio Comprido)' },
  { id: 'familia',   label: 'Família (até 20%)' },
  { id: 'all_dance', label: 'All Dance (≥3 modalidades dança)' },
  { id: 'vip',       label: 'VIP (≥6 modalidades)' },
  { id: 'bolsa',     label: 'Bolsa artística' },
  { id: 'outro',     label: 'Outro' },
]

type Turma = {
  id: string
  nome: string
  preco_padrao: number
  capacidade: number
  vagas_restantes: number
  nivel: string | null
  faixa_etaria_min: number | null
  faixa_etaria_max: number | null
  modalidades: { id: string; nome: string } | null
  professores: { nome: string } | null
  salas: { nome: string } | null
  turma_horarios: { dia_semana: string; hora_inicio: string; hora_fim: string }[]
}

export default function MatriculaWizard({
  aluno,
  turmas,
}: {
  aluno: { id: string; nome: string; data_nascimento: string | null }
  turmas: Turma[]
}) {
  const router = useRouter()
  const supabase = createClient()

  const [etapa, setEtapa] = useState<1 | 2 | 3>(1)
  const [turmasSelecionadas, setTurmasSelecionadas] = useState<string[]>([])
  const [plano, setPlano] = useState('mensal')
  const [tipoDesconto, setTipoDesconto] = useState('')
  const [percentualDesconto, setPercentualDesconto] = useState('')
  const [diaVencimento, setDiaVencimento] = useState('10')
  const [dataInicio, setDataInicio] = useState(() => new Date().toISOString().split('T')[0])
  const [observacaoDesconto, setObservacaoDesconto] = useState('')
  const [valorOverride, setValorOverride] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  // Turmas selecionadas com dados
  const turmasSel = turmas.filter(t => turmasSelecionadas.includes(t.id))

  // Cálculo automático de valor
  const valorCalculado = useMemo(() => {
    const base = turmasSel.reduce((acc, t) => acc + Number(t.preco_padrao), 0)
    const pct = percentualDesconto ? Number(percentualDesconto) : 0
    return base * (1 - pct / 100)
  }, [turmasSel, percentualDesconto])

  const valorFinal = valorOverride
    ? Number(valorOverride.replace(',', '.'))
    : valorCalculado

  function toggleTurma(id: string) {
    setTurmasSelecionadas(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  // Gera datas de vencimento das mensalidades
  function gerarMensalidades(matriculaId: string, inicio: string, meses: number, valor: number, vencimento: number) {
    const mensalidades = []
    const dataBase = new Date(inicio)
    for (let i = 0; i < meses; i++) {
      const competencia = new Date(dataBase)
      competencia.setMonth(competencia.getMonth() + i)
      const venc = new Date(competencia.getFullYear(), competencia.getMonth(), vencimento)
      mensalidades.push({
        matricula_id: matriculaId,
        competencia: `${competencia.getFullYear()}-${String(competencia.getMonth() + 1).padStart(2, '0')}-01`,
        valor,
        vencimento: venc.toISOString().split('T')[0],
        status: 'aberta' as const,
      })
    }
    return mensalidades
  }

  async function confirmar() {
    setErro('')
    if (!turmasSelecionadas.length) { setErro('Selecione ao menos uma turma.'); return }
    setSalvando(true)

    const meses = PLANOS.find(p => p.id === plano)?.meses ?? 1

    // 1. Cria matrícula
    const { data: matricula, error: errMat } = await supabase
      .from('matriculas')
      .insert({
        aluno_id: aluno.id,
        plano: plano as any,
        data_inicio: dataInicio,
        dia_vencimento: Number(diaVencimento),
        valor_final: valorFinal,
        tipo_desconto: tipoDesconto as any || null,
        percentual_desconto: percentualDesconto ? Number(percentualDesconto) : 0,
        observacao_desconto: observacaoDesconto || null,
        status: 'ativa' as const,
      })
      .select('id')
      .single()

    if (errMat) { setErro(errMat.message); setSalvando(false); return }

    // 2. Vincula turmas
    await supabase.from('matricula_turmas').insert(
      turmasSelecionadas.map(turmaId => ({
        matricula_id: matricula.id,
        turma_id: turmaId,
        data_entrada: dataInicio,
      }))
    )

    // 3. Gera mensalidades
    const mensalidades = gerarMensalidades(matricula.id, dataInicio, meses, valorFinal, Number(diaVencimento))
    await supabase.from('mensalidades').insert(mensalidades)

    router.push(`/painel/alunos/${aluno.id}?aba=matriculas`)
  }

  return (
    <div className="space-y-6">
      {/* Indicador de etapas */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map(n => (
          <div key={n} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
              etapa === n ? 'bg-indigo-600 text-white' :
              etapa > n ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'
            }`}>{etapa > n ? '✓' : n}</div>
            {n < 3 && <div className={`w-12 h-px ${etapa > n ? 'bg-green-400' : 'bg-gray-200'}`} />}
          </div>
        ))}
        <span className="text-sm text-gray-500 ml-2">
          {etapa === 1 ? 'Escolher turmas' : etapa === 2 ? 'Plano e desconto' : 'Confirmar'}
        </span>
      </div>

      {/* ── Etapa 1: Turmas ── */}
      {etapa === 1 && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Selecione as turmas</h2>

          {/* Agrupa por modalidade */}
          {Object.entries(
            turmas.reduce((acc, t) => {
              const mod = t.modalidades?.nome ?? 'Outros'
              if (!acc[mod]) acc[mod] = []
              acc[mod].push(t)
              return acc
            }, {} as Record<string, Turma[]>)
          ).map(([modalidade, lista]) => (
            <div key={modalidade}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{modalidade}</p>
              <div className="space-y-2">
                {lista.map(t => {
                  const sel = turmasSelecionadas.includes(t.id)
                  const lotada = t.vagas_restantes <= 0
                  return (
                    <button
                      key={t.id}
                      disabled={lotada}
                      onClick={() => toggleTurma(t.id)}
                      className={`w-full text-left border rounded-xl px-4 py-3 transition-colors ${
                        sel ? 'border-indigo-500 bg-indigo-50' :
                        lotada ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed' :
                        'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{t.nome}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {t.professores?.nome ?? '—'} · {t.salas?.nome ?? '—'}
                            {t.turma_horarios?.length ? ` · ${t.turma_horarios.map(h => `${DIAS_LABEL[h.dia_semana]} ${h.hora_inicio.slice(0,5)}`).join(', ')}` : ''}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">
                            R$ {Number(t.preco_padrao).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                          <p className={`text-xs ${t.vagas_restantes <= 2 ? 'text-orange-500' : 'text-gray-400'}`}>
                            {lotada ? 'Lotada' : `${t.vagas_restantes} vaga${t.vagas_restantes !== 1 ? 's' : ''}`}
                          </p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          {turmasSelecionadas.length > 0 && (
            <div className="bg-indigo-50 rounded-xl px-4 py-3 flex items-center justify-between">
              <p className="text-sm text-indigo-700 font-medium">
                {turmasSelecionadas.length} turma{turmasSelecionadas.length > 1 ? 's' : ''} selecionada{turmasSelecionadas.length > 1 ? 's' : ''}
              </p>
              <p className="text-sm font-bold text-indigo-700">
                R$ {turmasSel.reduce((a, t) => a + Number(t.preco_padrao), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês
              </p>
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={() => setEtapa(2)}
              disabled={!turmasSelecionadas.length}
              className="bg-indigo-600 text-white font-medium text-sm px-6 py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-40 transition-colors"
            >
              Próximo →
            </button>
          </div>
        </div>
      )}

      {/* ── Etapa 2: Plano e desconto ── */}
      {etapa === 2 && (
        <div className="space-y-5">
          <h2 className="text-sm font-semibold text-gray-700">Plano e desconto</h2>

          {/* Plano */}
          <div className="grid grid-cols-2 gap-3">
            {PLANOS.map(p => (
              <button
                key={p.id}
                onClick={() => setPlano(p.id)}
                className={`border rounded-xl px-4 py-4 text-left transition-colors ${
                  plano === p.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <p className={`text-sm font-semibold ${plano === p.id ? 'text-indigo-700' : 'text-gray-900'}`}>{p.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{p.descricao}</p>
                <p className="text-xs font-medium text-gray-500 mt-1">{p.meses} mensalidade{p.meses > 1 ? 's' : ''}</p>
              </button>
            ))}
          </div>

          {/* Desconto */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tipo de desconto</label>
              <select
                value={tipoDesconto}
                onChange={e => { setTipoDesconto(e.target.value); setPercentualDesconto('') }}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {DESCONTOS.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">% de desconto</label>
              <input
                value={percentualDesconto}
                onChange={e => setPercentualDesconto(e.target.value)}
                placeholder="Ex: 20"
                disabled={!tipoDesconto}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
              />
            </div>
          </div>

          {tipoDesconto && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Observação sobre o desconto</label>
              <input
                value={observacaoDesconto}
                onChange={e => setObservacaoDesconto(e.target.value)}
                placeholder="Ex: Desconto aprovado por Carlos em 30/05/2026"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          {/* Calculadora */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Calculadora</p>
            {turmasSel.map(t => (
              <div key={t.id} className="flex justify-between text-sm">
                <span className="text-gray-600">{t.nome}</span>
                <span className="text-gray-900">R$ {Number(t.preco_padrao).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            ))}
            {percentualDesconto && Number(percentualDesconto) > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Desconto ({percentualDesconto}%)</span>
                <span>− R$ {(turmasSel.reduce((a, t) => a + Number(t.preco_padrao), 0) * Number(percentualDesconto) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="border-t border-gray-100 pt-2 flex justify-between font-semibold">
              <span className="text-gray-900">Total mensal</span>
              <span className="text-indigo-700 text-base">R$ {valorCalculado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Override de valor (admin) */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Valor personalizado <span className="text-gray-400">(deixe em branco para usar o calculado)</span>
            </label>
            <input
              value={valorOverride}
              onChange={e => setValorOverride(e.target.value)}
              placeholder={`R$ ${valorCalculado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Início da matrícula</label>
              <input
                type="date"
                value={dataInicio}
                onChange={e => setDataInicio(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Dia de vencimento</label>
              <input
                type="number"
                value={diaVencimento}
                onChange={e => setDiaVencimento(e.target.value)}
                min={1} max={28}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-between">
            <button onClick={() => setEtapa(1)} className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2.5">← Voltar</button>
            <button
              onClick={() => setEtapa(3)}
              className="bg-indigo-600 text-white font-medium text-sm px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Revisar →
            </button>
          </div>
        </div>
      )}

      {/* ── Etapa 3: Confirmação ── */}
      {etapa === 3 && (
        <div className="space-y-5">
          <h2 className="text-sm font-semibold text-gray-700">Confirmar matrícula</h2>

          <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
            <div className="px-5 py-4">
              <p className="text-xs text-gray-400 mb-1">Aluno</p>
              <p className="font-medium text-gray-900">{aluno.nome}</p>
            </div>
            <div className="px-5 py-4">
              <p className="text-xs text-gray-400 mb-2">Turmas</p>
              {turmasSel.map(t => (
                <p key={t.id} className="text-sm text-gray-700">• {t.nome} <span className="text-gray-400">({t.modalidades?.nome})</span></p>
              ))}
            </div>
            <div className="px-5 py-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Plano</p>
                <p className="text-sm font-medium text-gray-900">{PLANOS.find(p => p.id === plano)?.label}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Vencimento</p>
                <p className="text-sm font-medium text-gray-900">Todo dia {diaVencimento}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Início</p>
                <p className="text-sm font-medium text-gray-900">{new Date(dataInicio).toLocaleDateString('pt-BR')}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Valor mensal</p>
                <p className="text-lg font-bold text-indigo-700">R$ {valorFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
            {tipoDesconto && (
              <div className="px-5 py-3 bg-green-50">
                <p className="text-xs text-green-700">
                  Desconto: {DESCONTOS.find(d => d.id === tipoDesconto)?.label}
                  {percentualDesconto ? ` (${percentualDesconto}%)` : ''}
                  {observacaoDesconto ? ` — ${observacaoDesconto}` : ''}
                </p>
              </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
            <p className="text-xs text-blue-700 font-medium">
              Ao confirmar serão geradas {PLANOS.find(p => p.id === plano)?.meses} mensalidade{(PLANOS.find(p => p.id === plano)?.meses ?? 1) > 1 ? 's' : ''} de R$ {valorFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} cada.
            </p>
          </div>

          {erro && <p className="text-sm text-red-500">{erro}</p>}

          <div className="flex justify-between">
            <button onClick={() => setEtapa(2)} className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2.5">← Voltar</button>
            <button
              onClick={confirmar}
              disabled={salvando}
              className="bg-indigo-600 text-white font-medium text-sm px-8 py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {salvando ? 'Salvando...' : 'Confirmar matrícula'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
