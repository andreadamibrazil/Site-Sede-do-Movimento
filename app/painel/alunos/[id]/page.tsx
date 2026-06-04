import { createClient, createServiceClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import AlunoTabs from './AlunoTabs'
import BotaoExcluirAluno from './BotaoExcluirAluno'
import BotaoDeclaracao from './BotaoDeclaracao'

export default async function AlunoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ aba?: string }>
}) {
  const { id } = await params
  const { aba = 'dados' } = await searchParams
  const supabase = await createClient()

  const { data: aluno } = await supabase
    .from('alunos')
    .select(`
      *,
      responsavel_principal:responsaveis!alunos_responsavel_principal_id_fkey(*),
      responsavel_secundario:responsaveis!alunos_responsavel_secundario_id_fkey(*),
      familias(id, nome)
    `)
    .eq('id', id)
    .single()

  if (!aluno) notFound()

  const { data: matriculas } = await supabase
    .from('matriculas')
    .select(`
      *,
      matricula_turmas(
        turma_id, data_entrada, data_saida,
        turmas(nome, modalidades(nome), professores(nome))
      )
    `)
    .eq('aluno_id', id)
    .order('created_at', { ascending: false })

  const { data: mensalidades } = await supabase
    .from('mensalidades')
    .select('*')
    .in('matricula_id', (matriculas ?? []).map(m => m.id))
    .order('vencimento', { ascending: false })
    .limit(24)

  const [presencasRes, documentosRes] = await Promise.all([
    supabase
      .from('presencas')
      .select('*, aulas(data, hora_inicio, turmas(nome))')
      .eq('aluno_id', id)
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('documentos_aluno')
      .select('*')
      .eq('aluno_id', id)
      .order('created_at', { ascending: false }),
  ])

  const presencas = presencasRes.data
  const documentos = documentosRes.data

  const service = createServiceClient()
  const { data: uniforme } = await service
    .from('uniforme_retiradas')
    .select('*')
    .eq('aluno_id', id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      {/* Header do aluno */}
      <div className="flex items-start justify-between">
        <div>
          <a href="/painel/alunos" className="text-xs text-gray-400 hover:text-gray-600">← Alunos</a>
          <h1 className="text-xl font-semibold text-gray-900 mt-1">{aluno.nome}</h1>
          {aluno.nome_social && (
            <p className="text-sm text-gray-400">Chamado(a) de {aluno.nome_social}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={aluno.status_pedagogico} />
          <StatusFinBadge status={aluno.status_financeiro} />
          <ContratoBadge status={(aluno as any).contrato_status ?? 'sem_contrato'} />
          <BotaoDeclaracao alunoId={id} />
          <BotaoExcluirAluno alunoId={id} alunoNome={aluno.nome} />
          <a
            href={`/painel/alunos/${id}/matricula`}
            className="bg-indigo-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            + Matrícula
          </a>
        </div>
      </div>

      <AlunoTabs
        abaAtiva={aba}
        alunoId={id}
        aluno={aluno as any}
        matriculas={matriculas as any ?? []}
        mensalidades={mensalidades as any ?? []}
        presencas={presencas as any ?? []}
        documentos={documentos as any ?? []}
        uniforme={uniforme as any ?? []}
      />
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    ativo: 'bg-green-100 text-green-700',
    lead: 'bg-blue-100 text-blue-700',
    experimental: 'bg-purple-100 text-purple-700',
    trancado: 'bg-yellow-100 text-yellow-700',
    cancelado: 'bg-gray-100 text-gray-500',
    ex_aluno: 'bg-gray-100 text-gray-400',
  }
  const label: Record<string, string> = {
    ativo: 'Ativo', lead: 'Lead', experimental: 'Experimental',
    trancado: 'Trancado', cancelado: 'Cancelado', ex_aluno: 'Ex-aluno',
  }
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${map[status] ?? 'bg-gray-100 text-gray-500'}`}>
      {label[status] ?? status}
    </span>
  )
}

function StatusFinBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    em_dia: 'bg-green-50 text-green-600 border border-green-200',
    em_atraso: 'bg-orange-50 text-orange-600 border border-orange-200',
    inadimplente: 'bg-red-50 text-red-600 border border-red-200',
    renegociando: 'bg-blue-50 text-blue-600 border border-blue-200',
    isento: 'bg-gray-50 text-gray-500 border border-gray-200',
  }
  const label: Record<string, string> = {
    em_dia: 'Em dia', em_atraso: 'Em atraso',
    inadimplente: 'Inadimplente', renegociando: 'Renegociando', isento: 'Isento',
  }
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${map[status] ?? ''}`}>
      {label[status] ?? status}
    </span>
  )
}

function ContratoBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    sem_contrato:           'bg-red-50 text-red-600 border border-red-200',
    aguardando_assinatura:  'bg-yellow-50 text-yellow-700 border border-yellow-200',
    assinado:               'bg-green-50 text-green-600 border border-green-200',
  }
  const label: Record<string, string> = {
    sem_contrato:           '⚠ Sem contrato',
    aguardando_assinatura:  '✉ Aguardando assinatura',
    assinado:               '✓ Contrato assinado',
  }
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${map[status] ?? 'bg-gray-100 text-gray-500'}`}>
      {label[status] ?? status}
    </span>
  )
}
