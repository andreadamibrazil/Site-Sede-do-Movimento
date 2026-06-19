import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Suspense } from 'react'
import FiltroStatus from './FiltroStatus'
import BuscaAluno from './BuscaAluno'

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  ativo:        { label: 'Ativo',        className: 'bg-green-100 text-green-700' },
  lead:         { label: 'Lead',         className: 'bg-blue-100 text-blue-700' },
  experimental: { label: 'Experimental', className: 'bg-purple-100 text-purple-700' },
  trancado:     { label: 'Trancado',     className: 'bg-yellow-100 text-yellow-700' },
  cancelado:    { label: 'Cancelado',    className: 'bg-gray-100 text-gray-500' },
  ex_aluno:     { label: 'Ex-aluno',     className: 'bg-gray-100 text-gray-400' },
}

const FIN_BADGE: Record<string, { label: string; className: string }> = {
  em_dia:       { label: 'Em dia',       className: 'bg-green-100 text-green-700' },
  em_atraso:    { label: 'Em atraso',    className: 'bg-orange-100 text-orange-700' },
  inadimplente: { label: 'Inadimplente', className: 'bg-red-100 text-red-700' },
  renegociando: { label: 'Renegociando', className: 'bg-blue-100 text-blue-700' },
  isento:       { label: 'Isento',       className: 'bg-gray-100 text-gray-500' },
}

export default async function AlunosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; busca?: string }>
}) {
  const { status = 'ativo,trancado,inadimplente', busca } = await searchParams
  const supabase = await createClient()

  const statusFiltro = status.split(',').filter(Boolean)

  const statusEnum = ['ativo','lead','experimental','trancado','cancelado','ex_aluno'] as const
  type StatusPed = typeof statusEnum[number]
  const statusValidos = statusFiltro.filter((s): s is StatusPed => statusEnum.includes(s as StatusPed))

  let query = supabase
    .from('alunos')
    .select(`
      id, nome, celular, status_pedagogico, status_financeiro,
      responsavel_principal:responsaveis!alunos_responsavel_principal_id_fkey(nome)
    `)
    .in('status_pedagogico', statusValidos)
    .order('nome')

  if (busca) query = query.ilike('nome', `%${busca}%`)

  const { data: alunos } = await query

  // Contagens por status para os badges do filtro (exclui soft-deleted)
  const { data: contagens } = await supabase
    .from('alunos')
    .select('status_pedagogico')
    .neq('status_pedagogico', 'excluido')

  const qtdPorStatus: Record<string, number> = {}
  contagens?.forEach(a => {
    qtdPorStatus[a.status_pedagogico] = (qtdPorStatus[a.status_pedagogico] ?? 0) + 1
  })

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Alunos</h1>
        <div className="flex items-center gap-3">
          <Suspense>
            <BuscaAluno />
          </Suspense>
          <Link
            href="/painel/alunos/novo"
            className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            + Novo aluno
          </Link>
        </div>
      </div>

      {/* Filtros */}
      <FiltroStatus statusAtual={status} qtd={qtdPorStatus} />

      {/* Lista */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nome</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Responsável</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Celular</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Financeiro</th>
              <th></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {alunos?.map((aluno) => {
              const ped = STATUS_BADGE[aluno.status_pedagogico] ?? { label: aluno.status_pedagogico, className: 'bg-gray-100 text-gray-500' }
              const fin = FIN_BADGE[aluno.status_financeiro] ?? { label: aluno.status_financeiro, className: 'bg-gray-100 text-gray-500' }
              return (
                <tr key={aluno.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{aluno.nome}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-gray-400">
                      {(aluno.responsavel_principal as any)?.nome ?? ''}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-sm">
                    {aluno.celular ? formatarCelular(aluno.celular) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${ped.className}`}>
                      {ped.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {aluno.status_financeiro !== 'em_dia' && (
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${fin.className}`}>
                        {fin.label}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <a href={`/painel/alunos/${aluno.id}`} className="text-indigo-600 hover:text-indigo-700 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Ver →
                    </a>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {!alunos?.length && (
          <p className="text-center text-gray-400 text-sm py-12">Nenhum aluno encontrado.</p>
        )}
      </div>

      {alunos?.length ? (
        <p className="text-xs text-gray-400 text-center">{alunos.length} aluno{alunos.length !== 1 ? 's' : ''}</p>
      ) : null}
    </div>
  )
}

function formatarCelular(cel: string) {
  const n = cel.replace(/\D/g, '')
  if (n.length === 11) return `(${n.slice(0,2)}) ${n.slice(2,7)}-${n.slice(7)}`
  if (n.length === 10) return `(${n.slice(0,2)}) ${n.slice(2,6)}-${n.slice(6)}`
  return cel
}
