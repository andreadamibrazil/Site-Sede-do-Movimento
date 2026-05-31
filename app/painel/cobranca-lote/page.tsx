import { createClient, createServiceClient } from '@/lib/supabase/server'
import CobrancaLoteClient from './CobrancaLoteClient'

export const dynamic = 'force-dynamic'

export default async function CobrancaLotePage() {
  const supabase = await createClient()
  const service = createServiceClient()

  const [{ data: alunos }, { data: precos }] = await Promise.all([
    supabase
      .from('alunos')
      .select('id, nome, status_pedagogico')
      .eq('status_pedagogico', 'ativo')
      .order('nome'),
    service
      .from('precos_referencia')
      .select('*')
      .eq('ativo', true)
      .order('categoria'),
  ])

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <a href="/painel/financeiro" className="text-xs text-gray-400 hover:text-gray-600">← Financeiro</a>
        <h1 className="text-xl font-semibold text-gray-900 mt-1">Cobrança em lote</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Aplique a mesma cobrança para vários alunos de uma vez.
        </p>
      </div>
      <CobrancaLoteClient alunos={alunos ?? []} precos={precos ?? []} />
    </div>
  )
}
