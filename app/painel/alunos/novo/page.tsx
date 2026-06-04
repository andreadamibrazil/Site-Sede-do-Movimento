import { createServiceClient } from '@/lib/supabase/server'
import NovoAlunoForm from './NovoAlunoForm'

export default async function NovoAlunoPage({
  searchParams,
}: {
  searchParams: Promise<{ resp_lead_id?: string }>
}) {
  const { resp_lead_id } = await searchParams

  let leadResp = null
  if (resp_lead_id) {
    const sb = createServiceClient()
    const { data } = await sb
      .from('leads')
      .select('id, nome, celular, email, como_conheceu')
      .eq('id', resp_lead_id)
      .single()
    leadResp = data
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <a href="/painel/alunos" className="text-xs text-gray-400 hover:text-gray-600">← Alunos</a>
        <h1 className="text-xl font-semibold text-gray-900 mt-1">Novo aluno</h1>
        {leadResp && (
          <div className="mt-2 text-xs text-purple-700 bg-purple-50 rounded-lg px-3 py-2 inline-flex items-center gap-1.5">
            <span>👨‍👧</span>
            <span><strong>{leadResp.nome}</strong> será o responsável desta matrícula</span>
          </div>
        )}
      </div>
      <NovoAlunoForm leadResponsavel={leadResp} />
    </div>
  )
}
