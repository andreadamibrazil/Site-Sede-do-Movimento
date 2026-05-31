import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import Link from 'next/link'
import GerarFolhaBtn from './GerarFolhaBtn'
import SeletorMes from './SeletorMes'

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  rascunho: { label: 'Rascunho',  className: 'bg-gray-100 text-gray-500' },
  enviado:  { label: 'Enviado',   className: 'bg-blue-100 text-blue-700' },
  assinado: { label: 'Assinado',  className: 'bg-green-100 text-green-700' },
  pago:     { label: 'Pago',      className: 'bg-emerald-100 text-emerald-700' },
}

export default async function FolhaPagamentoPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string }>
}) {
  // Só admin acessa
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/painel/login')

  const service = createServiceClient()
  const { data: perfil } = await service.from('perfis_usuario').select('perfil').eq('id', user.id).maybeSingle()
  if (perfil?.perfil !== 'admin') redirect('/painel')

  // Mês de referência (default: mês atual)
  const { mes } = await searchParams
  const agora = new Date()
  const mesAtual = mes ?? `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}`
  const [ano, mesNum] = mesAtual.split('-').map(Number)
  const inicioMes = `${ano}-${String(mesNum).padStart(2, '0')}-01`

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
    </div>
  )
}
