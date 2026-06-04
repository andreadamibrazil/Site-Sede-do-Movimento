import { createClient } from '@/lib/supabase/server'
import { Suspense } from 'react'
import FiltroLeads from './FiltroLeads'
import BuscaLead from './BuscaLead'
import BotaoExperimental from './BotaoExperimental'
import BotaoConverter from './BotaoConverter'
import BotaoNovoLead from './BotaoNovoLead'

function parseCRM(obs: string | null): { temperatura?: string; oportunidade?: string; resumo?: string } {
  if (!obs) return {}
  try {
    const j = JSON.parse(obs)
    return { temperatura: j.temperatura, oportunidade: j.oportunidade, resumo: j.resumo }
  } catch {
    return {}
  }
}

const TEMP_BADGE: Record<string, { label: string; className: string }> = {
  quente:     { label: '🔥 Quente',    className: 'bg-red-100 text-red-700' },
  morno:      { label: '☀️ Morno',     className: 'bg-orange-100 text-orange-700' },
  frio:       { label: '🧊 Frio',      className: 'bg-blue-100 text-blue-700' },
  convertido: { label: '✅ Convertido', className: 'bg-green-100 text-green-700' },
}

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  novo:                  { label: 'Novo',         className: 'bg-gray-100 text-gray-600' },
  em_contato:            { label: 'Em contato',   className: 'bg-blue-100 text-blue-700' },
  experimental_agendada: { label: 'Experimental', className: 'bg-purple-100 text-purple-700' },
  convertido:            { label: 'Convertido',   className: 'bg-green-100 text-green-700' },
  perdido:               { label: 'Perdido',      className: 'bg-gray-100 text-gray-400' },
}

const OPOR_LABEL: Record<string, string> = {
  reativar_ballet:     'Reativar ballet',
  aula_adulto_espera:  'Adulto (espera)',
  segundo_filho:       'Segundo filho',
  desconto_familia:    'Desconto família',
  reativar_modalidade: 'Reativar modalidade',
  primeira_matricula:  'Primeira matrícula',
  ex_aluno_retorno:    'Ex-aluno retorno',
}

const PAGE_SIZE = 50

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; temperatura?: string; modalidade?: string; busca?: string; pagina?: string }>
}) {
  const { status, temperatura, modalidade, busca, pagina = '1' } = await searchParams
  const supabase = await createClient()
  const offset = (parseInt(pagina) - 1) * PAGE_SIZE

  let query = supabase
    .from('leads')
    .select('id, nome, celular, email, modalidade_interesse, como_conheceu, status, observacoes, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)

  if (status && status !== 'todos') query = query.eq('status', status as 'novo' | 'em_contato' | 'experimental_agendada' | 'convertido' | 'perdido')
  if (modalidade) query = query.ilike('modalidade_interesse', `%${modalidade}%`)
  if (busca) query = query.or(`nome.ilike.%${busca}%,celular.ilike.%${busca}%`)

  const { data: leadsRaw, count } = await query

  const leads = (leadsRaw ?? []).map(l => ({ ...l, crm: parseCRM(l.observacoes) }))

  const leadsFiltrados = temperatura && temperatura !== 'todos'
    ? temperatura === 'sem_analise'
      ? leads.filter(l => !l.crm.temperatura)
      : leads.filter(l => l.crm.temperatura === temperatura)
    : leads

  const { data: todosLeads } = await supabase
    .from('leads')
    .select('status, observacoes')

  const qtdStatus: Record<string, number> = {}
  const qtdTemperatura: Record<string, number> = {}

  ;(todosLeads ?? []).forEach(l => {
    qtdStatus[l.status] = (qtdStatus[l.status] ?? 0) + 1
    const crm = parseCRM(l.observacoes)
    const t = crm.temperatura ?? 'sem_analise'
    qtdTemperatura[t] = (qtdTemperatura[t] ?? 0) + 1
  })

  // Modalidades da tabela oficial (não dos leads — dados sujos)
  const { data: modalidadesData } = await supabase
    .from('modalidades')
    .select('nome')
    .eq('ativo', true)
    .order('nome')

  const modalidades = (modalidadesData ?? []).map(m => m.nome)

  const totalPaginas = Math.ceil((count ?? 0) / PAGE_SIZE)

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Leads</h1>
          <p className="text-sm text-gray-500 mt-0.5">Pipeline de captação — do primeiro contato à matrícula</p>
        </div>
        <div className="flex items-center gap-2">
          <Suspense>
            <BuscaLead />
          </Suspense>
          <BotaoNovoLead />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: Object.values(qtdStatus).reduce((a,b)=>a+b,0), color: 'text-gray-900' },
          { label: '🔥 Quentes', value: qtdTemperatura['quente'] ?? 0, color: 'text-red-600' },
          { label: '☀️ Mornos', value: qtdTemperatura['morno'] ?? 0, color: 'text-orange-600' },
          { label: 'Experimentais', value: qtdStatus['experimental_agendada'] ?? 0, color: 'text-purple-600' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value.toLocaleString('pt-BR')}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <Suspense>
        <FiltroLeads
          statusAtual={status ?? 'todos'}
          temperaturaAtual={temperatura ?? 'todos'}
          modalidadeAtual={modalidade ?? ''}
          qtdStatus={qtdStatus}
          qtdTemperatura={qtdTemperatura}
          modalidades={modalidades}
        />
      </Suspense>

      {/* Tabela */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nome</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Celular</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Modalidade</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Origem</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Temperatura</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Oportunidade</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Entrada</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {leadsFiltrados.map(lead => {
              const temp = lead.crm.temperatura ? TEMP_BADGE[lead.crm.temperatura] : null
              const stat = STATUS_BADGE[lead.status] ?? { label: lead.status, className: 'bg-gray-100 text-gray-500' }
              const opor = lead.crm.oportunidade ? (OPOR_LABEL[lead.crm.oportunidade] ?? lead.crm.oportunidade) : null
              const data = lead.created_at
                ? new Date(lead.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
                : '—'
              return (
                <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{lead.nome}</p>
                      {lead.status !== 'convertido' && (
                        <>
                          <BotaoExperimental leadId={lead.id} leadNome={lead.nome} />
                          <BotaoConverter leadId={lead.id} leadNome={lead.nome} />
                        </>
                      )}
                    </div>
                    {lead.email && <p className="text-xs text-gray-400 truncate max-w-[200px]">{lead.email}</p>}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {lead.celular ? (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">{formatarCelular(lead.celular)}</span>
                        <a
                          href={`https://wa.me/55${lead.celular.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Abrir no WhatsApp"
                          className="text-emerald-500 hover:text-emerald-600 text-base leading-none"
                        >
                          📱
                        </a>
                      </div>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {lead.modalidade_interesse ?? <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {lead.como_conheceu ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    {temp ? (
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${temp.className}`}>
                        {temp.label}
                      </span>
                    ) : <span className="text-gray-300 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {opor ? (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                        {opor}
                      </span>
                    ) : <span className="text-gray-300 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${stat.className}`}>
                      {stat.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs tabular-nums">{data}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {!leadsFiltrados.length && (
          <p className="text-center text-gray-400 text-sm py-12">Nenhum lead encontrado.</p>
        )}
      </div>

      {/* Rodapé */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <p>{(count ?? 0).toLocaleString('pt-BR')} leads totais</p>
        {totalPaginas > 1 && (
          <div className="flex gap-2">
            {parseInt(pagina) > 1 && (
              <a href={`/painel/leads?pagina=${parseInt(pagina)-1}`} className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50">
                ← Anterior
              </a>
            )}
            <span className="px-3 py-1">Página {pagina} de {totalPaginas}</span>
            {parseInt(pagina) < totalPaginas && (
              <a href={`/painel/leads?pagina=${parseInt(pagina)+1}`} className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50">
                Próxima →
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function formatarCelular(cel: string) {
  const n = cel.replace(/\D/g, '')
  if (n.length === 11) return `(${n.slice(0,2)}) ${n.slice(2,7)}-${n.slice(7)}`
  if (n.length === 10) return `(${n.slice(0,2)}) ${n.slice(2,6)}-${n.slice(6)}`
  return cel
}
