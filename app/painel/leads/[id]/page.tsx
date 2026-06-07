import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import LeadTabs from './LeadTabs'

export default async function LeadPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ aba?: string }>
}) {
  const { id } = await params
  const { aba = 'analise' } = await searchParams
  const supabase = await createClient()

  const { data: lead } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .single()

  if (!lead) notFound()

  const { data: conversa } = await supabase
    .from('conversas')
    .select('variables, analisado_em, celular, source')
    .eq('celular', lead.celular ?? '')
    .not('analisado_em', 'is', null)
    .order('analisado_em', { ascending: false })
    .limit(1)
    .maybeSingle()

  const analise = (conversa?.variables as any)?.analise ?? null

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <Link href="/painel/leads" className="text-xs text-gray-400 hover:text-gray-600">
            ← Leads
          </Link>
          <h1 className="text-xl font-semibold text-gray-900 mt-1">{lead.nome}</h1>
          {lead.celular && (
            <p className="text-sm text-gray-400 mt-0.5">{fmtCelular(lead.celular)}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={lead.status} />
          {analise?.interesse?.nivel && (
            <NivelBadge nivel={analise.interesse.nivel} score={analise.interesse.score ?? 0} />
          )}
          {lead.celular && (
            <a
              href={`https://wa.me/55${lead.celular.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-emerald-600 border border-emerald-200 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              📱 WhatsApp
            </a>
          )}
        </div>
      </div>

      <LeadTabs
        abaAtiva={aba}
        lead={lead as any}
        analise={analise}
        analisadoEm={conversa?.analisado_em ?? null}
      />
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    novo: 'bg-gray-100 text-gray-600',
    em_contato: 'bg-blue-100 text-blue-700',
    experimental_agendada: 'bg-purple-100 text-purple-700',
    convertido: 'bg-green-100 text-green-700',
    perdido: 'bg-gray-100 text-gray-400',
  }
  const label: Record<string, string> = {
    novo: 'Novo', em_contato: 'Em contato',
    experimental_agendada: 'Experimental', convertido: 'Convertido', perdido: 'Perdido',
  }
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${map[status] ?? 'bg-gray-100 text-gray-500'}`}>
      {label[status] ?? status}
    </span>
  )
}

function NivelBadge({ nivel, score }: { nivel: string; score: number }) {
  const map: Record<string, string> = {
    alto: 'bg-green-100 text-green-700',
    medio: 'bg-yellow-100 text-yellow-700',
    baixo: 'bg-gray-100 text-gray-500',
  }
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${map[nivel] ?? 'bg-gray-100 text-gray-500'}`}>
      {score}/100
    </span>
  )
}

function fmtCelular(cel: string) {
  const n = cel.replace(/\D/g, '')
  if (n.length === 11) return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`
  if (n.length === 10) return `(${n.slice(0, 2)}) ${n.slice(2, 6)}-${n.slice(6)}`
  return cel
}
