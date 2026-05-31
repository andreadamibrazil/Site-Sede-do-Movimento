import { createServiceClient } from '@/lib/supabase/server'
import ProdutosClient from './ProdutosClient'

export const dynamic = 'force-dynamic'

export default async function ProdutosPage() {
  const sb = createServiceClient()
  const { data: produtos } = await sb
    .from('precos_referencia')
    .select('*')
    .order('categoria')
    .order('descricao')

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      <div>
        <a href="/painel/financeiro" className="text-xs text-gray-400 hover:text-gray-600">← Financeiro</a>
        <h1 className="text-xl font-semibold text-gray-900 mt-1">Produtos e preços</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Catálogo de cobranças avulsas. Preços por lote, promoções e novos produtos — edite aqui sem mexer no código.
        </p>
      </div>
      <ProdutosClient produtos={produtos ?? []} />
    </div>
  )
}
