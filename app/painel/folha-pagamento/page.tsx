import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import Link from 'next/link'
import GerarFolhaBtn from './GerarFolhaBtn'
import SeletorMes from './SeletorMes'
import FaixasTurmasTab from './FaixasTurmasTab'
import type { TurmaFaixaDado } from './FaixasTurmasTab'

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  rascunho: { label: 'Rascunho',  className: 'bg-gray-100 text-gray-500' },
  enviado:  { label: 'Enviado',   className: 'bg-blue-100 text-blue-700' },
  assinado: { label: 'Assinado',  className: 'bg-green-100 text-green-700' },
  pago:     { label: 'Pago',      className: 'bg-emerald-100 text-emerald-700' },
}

export default async function FolhaPagamentoPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string; tab?: string }>
}) {
  // Só admin acessa
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/painel/login')

  const service = createServiceClient()
  const { data: perfil } = await service.from('perfis_usuario').select('perfil').eq('id', user.id).maybeSingle()
  if (perfil?.perfil !== 'admin') redirect('/painel')

  // Parâmetros da URL
  const { mes, tab } = await searchParams
  const abaAtual = tab ?? 'folhas'
  const agora = new Date()
  const mesAtual = mes ?? `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}`
  const [ano, mesNum] = mesAtual.split('-').map(Number)
  const inicioMes = `${ano}-${String(mesNum).padStart(2, '0')}-01`
  const fimMes = new Date(ano, mesNum, 0).toISOString().slice(0, 10)

  // Professores ativos
  const { data: professores } = await service
    .from('professores')
    .select('id, nome, celular, valor_base, forma_pagamento')
    .eq('ativo', true)
    .order('nome')

  // Folhas geradas para este mês
  const { data: folhas } = await (service as any)
    .from('folhas_pagamento')
    .select('professor_id, status, valor_total, valor_aulas, valor_fixo, id')
    .eq('mes_referencia', inicioMes)

  const folhaPorProf: Record<string, any> = {}
  ;(folhas ?? []).forEach((f: any) => { folhaPorProf[f.professor_id] = f })

  const totalMes = Object.values(folhaPorProf).reduce((s: number, f: any) => s + (f.valor_total ?? 0), 0)

  // Meses disponíveis para navegação
  const meses = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(agora.getFullYear(), agora.getMonth() - i, 1)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })

  const nomeMes = new Date(ano, mesNum - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  // Dados da aba Faixas — só busca quando necessário
  let faixasDados: TurmaFaixaDado[] = []
  if (abaAtual === 'faixas') {
    const [{ data: turmas }, { data: profsList }, { data: faixas }, { data: matriculas }] = await Promise.all([
      service
        .from('turmas')
        .select('id, nome, status, professor_id')
        .in('status', ['ativa', 'suspensa'])
        .order('nome'),
      service
        .from('professores')
        .select('id, nome, forma_pagamento')
        .eq('ativo', true),
      service
        .from('faixas_hora_aula')
        .select('*')
        .eq('ativo', true),
      service
        .from('matricula_turmas')
        .select('turma_id')
        .lte('data_entrada', inicioMes)
        .or(`data_saida.is.null,data_saida.gte.${fimMes}`),
    ])

    const profMap: Record<string, any> = {}
    for (const p of (profsList ?? []) as any[]) profMap[p.id] = p

    // Conta alunos por turma em JS (uma só query em vez de N)
    const contagemPorTurma: Record<string, number> = {}
    for (const m of (matriculas ?? []) as any[]) {
      contagemPorTurma[m.turma_id] = (contagemPorTurma[m.turma_id] ?? 0) + 1
    }

    const faixasGlobais = ((faixas ?? []) as any[])
      .filter(f => !f.turma_id)
      .sort((a, b) => a.min_alunos - b.min_alunos)

    function calcFaixa(numAlunos: number, turmaId: string): { valor: number; label: string; personalizado: boolean; override: number | null } {
      const faixasTurma = ((faixas ?? []) as any[]).filter(f => f.turma_id === turmaId)
      if (faixasTurma.length > 0) {
        const f = faixasTurma.find((f: any) =>
          numAlunos >= f.min_alunos && (f.max_alunos === null || numAlunos <= f.max_alunos)
        ) ?? faixasTurma[0]
        return { valor: f.valor_hora, label: 'Personalizado', personalizado: true, override: f.valor_hora }
      }
      const f = faixasGlobais.find((f: any) =>
        numAlunos >= f.min_alunos && (f.max_alunos === null || numAlunos <= f.max_alunos)
      ) ?? faixasGlobais[0]
      const label = f
        ? `${f.min_alunos}${f.max_alunos != null ? `–${f.max_alunos}` : '+'} alunos`
        : 'padrão'
      return { valor: f?.valor_hora ?? 31.50, label, personalizado: false, override: null }
    }

    faixasDados = ((turmas ?? []) as any[]).map(t => {
      const prof = profMap[t.professor_id] ?? null
      const numAlunos = contagemPorTurma[t.id] ?? 0
      const { valor, label, personalizado, override } = calcFaixa(numAlunos, t.id)
      return {
        turma_id: t.id,
        turma_nome: t.nome,
        professor_nome: prof?.nome ?? '—',
        forma_pagamento: prof?.forma_pagamento ?? null,
        num_alunos: numAlunos,
        valor_hora_efetivo: valor,
        faixa_label: label,
        personalizado,
        override_valor: override,
      }
    })
  }

  const tabBase = `/painel/folha-pagamento?mes=${mesAtual}`

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Folha de Pagamento</h1>
          <p className="text-sm text-gray-500 mt-0.5 capitalize">{nomeMes}</p>
        </div>
        <SeletorMes meses={meses} mesAtual={mesAtual} />
      </div>

      {/* Totais do mês */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500">Total do mês</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {totalMes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500">Folhas geradas</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{Object.keys(folhaPorProf).length} / {professores?.length ?? 0}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500">Assinadas / Pagas</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {Object.values(folhaPorProf).filter((f: any) => f.status === 'assinado' || f.status === 'pago').length}
          </p>
        </div>
      </div>

      {/* Abas */}
      <div className="flex gap-1 border-b border-gray-200">
        <Link
          href={`${tabBase}&tab=folhas`}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            abaAtual === 'folhas'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Folhas
        </Link>
        <Link
          href={`${tabBase}&tab=faixas`}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            abaAtual === 'faixas'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Faixas por turma
        </Link>
      </div>

      {/* Conteúdo da aba */}
      {abaAtual === 'faixas' ? (
        <FaixasTurmasTab dados={faixasDados} />
      ) : (
        <>
          {/* Lista de professores */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Professor</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aulas</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fixo</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {professores?.map(prof => {
                  const folha = folhaPorProf[prof.id]
                  const badge = folha ? (STATUS_BADGE[folha.status] ?? STATUS_BADGE.rascunho) : null
                  return (
                    <tr key={prof.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{prof.nome}</p>
                        {prof.celular && <p className="text-xs text-gray-400">{prof.celular}</p>}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">
                        {folha ? (folha.valor_aulas ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">
                        {folha && (folha.valor_fixo ?? 0) > 0
                          ? (folha.valor_fixo).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">
                        {folha ? (folha.valor_total ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {badge ? (
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${badge.className}`}>
                            {badge.label}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-300">Não gerada</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right space-x-3">
                        {folha && (
                          <Link href={`/painel/folha-pagamento/${folha.id}`} className="text-xs text-gray-500 hover:text-gray-700 font-medium">
                            Ver →
                          </Link>
                        )}
                        <GerarFolhaBtn professorId={prof.id} mes={mesAtual} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {!professores?.length && (
              <p className="text-center text-gray-400 text-sm py-12">Nenhum professor ativo.</p>
            )}
          </div>

          <p className="text-xs text-gray-400 text-center">
            Fechamento dia 5 · Pagamento dia 15 · Faixas: até 5 alunos R$31,50/h · 6–10 alunos R$42/h · 11+ alunos R$52,50/h
          </p>
        </>
      )}
    </div>
  )
}
