import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/supabase/requireAdmin'
import { Suspense } from 'react'
import FinanceiroClient from './FinanceiroClient'

export const dynamic = 'force-dynamic'

export default async function FinanceiroPage({
  searchParams,
}: {
  searchParams: Promise<{ filtro?: string; busca?: string }>
}) {
  await requireAdmin()
  const { filtro = 'aberta,em_atraso', busca } = await searchParams
  const supabase = await createClient()

  const hoje = new Date()
  const mesAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-01`

  // Totais para os cards
  const [
    { data: totalAberto },
    { data: totalAtrasado },
    { data: recebidoMes },
  ] = await Promise.all([
    supabase.from('mensalidades').select('valor').in('status', ['aberta', 'em_atraso']),
    supabase.from('mensalidades').select('valor').eq('status', 'em_atraso'),
    supabase.from('mensalidades').select('valor_pago').eq('status', 'recebida').gte('pago_em', mesAtual),
  ])

  const somaAberto = (totalAberto ?? []).reduce((a, m) => a + Number(m.valor), 0)
  const somaAtrasado = (totalAtrasado ?? []).reduce((a, m) => a + Number(m.valor), 0)
  const somaRecebido = (recebidoMes ?? []).reduce((a, m) => a + Number(m.valor_pago ?? 0), 0)

  // Mensalidades filtradas
  const statusFiltro = filtro.split(',').filter(Boolean)

  const { count: totalCount } = await supabase
    .from('mensalidades')
    .select('id', { count: 'exact', head: true })
    .in('status', statusFiltro as any)

  const { data: mensalidades } = await supabase
    .from('mensalidades')
    .select(`
      id, competencia, valor, vencimento, status, valor_pago, pago_em,
      matriculas(
        aluno_id, plano,
        alunos(id, nome, celular, status_financeiro)
      )
    `)
    .in('status', statusFiltro as any)
    .order('vencimento', { ascending: true })
    .limit(100)

  const limiteAtingido = (totalCount ?? 0) > 100

  // Filtra por nome se busca
  const lista = (mensalidades ?? []).filter(m => {
    if (!busca) return true
    const nome = (m.matriculas as any)?.alunos?.nome ?? ''
    return nome.toLowerCase().includes(busca.toLowerCase())
  })

  // Agrupa por aluno
  const porAluno: Record<string, { aluno: any; mensalidades: any[] }> = {}
  for (const m of lista) {
    const aluno = (m.matriculas as any)?.alunos
    if (!aluno) continue
    if (!porAluno[aluno.id]) porAluno[aluno.id] = { aluno, mensalidades: [] }
    porAluno[aluno.id]!.mensalidades.push(m)
  }

  const grupos = Object.values(porAluno).sort((a, b) =>
    a.aluno.nome.localeCompare(b.aluno.nome)
  )

  return (
    <div className="p-5 max-w-5xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold text-gray-900">Financeiro</h1>
        <a href="/painel/cobranca-lote"
          className="text-sm font-medium text-indigo-600 border border-indigo-200 px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors">
          ⚡ Cobrança em lote
        </a>
        <a href="/painel/produtos"
          className="text-sm font-medium text-gray-500 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
          🏷️ Produtos
        </a>
      </div>

      {limiteAtingido && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 text-sm text-amber-700">
          Mostrando as primeiras 100 mensalidades de {totalCount} no filtro atual. Use a busca por nome para encontrar registros específicos.
        </div>
      )}

      {/* Cards de resumo */}
      <div className="grid grid-cols-3 gap-4">
        <Card label="A receber" valor={somaAberto} cor="blue" />
        <Card label="Em atraso" valor={somaAtrasado} cor="red" />
        <Card label="Recebido este mês" valor={somaRecebido} cor="green" />
      </div>

      <Suspense>
        <FinanceiroClient
          grupos={grupos}
          filtroAtual={filtro}
          buscaAtual={busca ?? ''}
        />
      </Suspense>
    </div>
  )
}

function Card({ label, valor, cor }: { label: string; valor: number; cor: 'blue' | 'red' | 'green' }) {
  const cores = {
    blue:  'bg-blue-50 text-blue-700',
    red:   'bg-red-50 text-red-700',
    green: 'bg-green-50 text-green-700',
  }
  return (
    <div className={`rounded-xl p-4 ${cores[cor]}`}>
      <p className="text-xs font-medium opacity-70">{label}</p>
      <p className="text-2xl font-bold mt-1">
        R$ {valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      </p>
    </div>
  )
}
