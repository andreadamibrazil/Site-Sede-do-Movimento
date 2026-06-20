import { createClient } from '@/lib/supabase/server'
import { Suspense } from 'react'
import FiltroTabela from './FiltroTabela'
import type { Database } from '@/lib/supabase/types'

type AuditLog = Database['public']['Tables']['audit_log']['Row']

const TABELA_LABEL: Record<string, string> = {
  turmas: 'Turma', alunos: 'Aluno', matriculas: 'Matrícula',
  matricula_turmas: 'Matrícula → Turma', mensalidades: 'Mensalidade',
  pagamentos: 'Pagamento', renegociacoes: 'Renegociação',
  perfis_usuario: 'Usuário', professores: 'Professor', presencas: 'Presença',
}

const OP_BADGE: Record<string, string> = {
  INSERT: 'bg-green-100 text-green-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-red-100 text-red-700',
}

const OP_LABEL: Record<string, string> = {
  INSERT: 'Criou', UPDATE: 'Editou', DELETE: 'Removeu',
}

export default async function HistoricoPage({
  searchParams,
}: {
  searchParams: Promise<{ tabela?: string; pagina?: string; usuario?: string }>
}) {
  const { tabela, pagina, usuario } = await searchParams
  const supabase = await createClient()

  // Só admin acessa
  const { data: { user } } = await supabase.auth.getUser()
  const { data: perfil } = await supabase
    .from('perfis_usuario').select('perfil').eq('id', user!.id).single()
  if (perfil?.perfil !== 'admin') {
    return (
      <div className="p-6 max-w-xl mx-auto mt-20 text-center">
        <p className="text-gray-500 text-sm">Acesso restrito a administradores.</p>
      </div>
    )
  }

  const por_pagina = 50
  const offset = (Number(pagina ?? 1) - 1) * por_pagina

  let query = supabase
    .from('audit_log')
    .select('*', { count: 'exact' })
    .order('criado_em', { ascending: false })
    .range(offset, offset + por_pagina - 1)

  if (tabela) query = query.eq('tabela', tabela)
  if (usuario) query = query.ilike('usuario_email', `%${usuario}%`)

  const { data: logs, count } = await query

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Histórico de alterações</h1>
          <p className="text-sm text-gray-400 mt-0.5">Toda modificação no sistema fica registrada aqui. Só admins visualizam.</p>
        </div>
        <Suspense>
          <FiltroTabela />
        </Suspense>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Quando</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Quem</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ação</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">O que mudou</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(logs as AuditLog[] | null)?.map((log) => {
              const dadosDepois = log.dados_depois as Record<string, any> | null
              const dadosAntes = log.dados_antes as Record<string, any> | null
              const campos = log.campos_alterados as string[] | null
              const nome = dadosDepois?.nome ?? dadosAntes?.nome ?? '—'
              return (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                    {new Date(log.criado_em).toLocaleString('pt-BR', {
                      day: '2-digit', month: '2-digit', year: '2-digit',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-gray-600 truncate max-w-[180px]">
                      {log.usuario_email ?? 'Sistema'}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${OP_BADGE[log.operacao ?? ''] ?? ''}`}>
                        {OP_LABEL[log.operacao ?? ''] ?? log.operacao}
                      </span>
                      <span className="text-xs text-gray-500">
                        {TABELA_LABEL[log.tabela ?? ''] ?? log.tabela}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-gray-700 font-medium">{nome}</p>
                    {campos?.length ? (
                      <p className="text-xs text-gray-400 mt-0.5">Campos: {campos.join(', ')}</p>
                    ) : null}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {!logs?.length && (
          <p className="text-center text-gray-400 text-sm py-12">Nenhum registro ainda.</p>
        )}
      </div>

      {count && count > por_pagina && (
        <p className="text-xs text-gray-400 text-center">
          {count} registros no total · página {pagina ?? 1}
        </p>
      )}
    </div>
  )
}
