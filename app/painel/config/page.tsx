import { createServiceClient } from '@/lib/supabase/server'
import ConfigClient from './ConfigClient'

export default async function ConfigPage() {
  const sb = createServiceClient() as any

  const [{ data: itens }, { data: contexto }] = await Promise.all([
    sb.from('config_itens').select('*').eq('ativo', true).order('categoria').order('label'),
    sb.from('config_auditoria').select('*').order('secao'),
  ])

  const naoVerificados = (itens ?? []).filter((i: any) => !i.verificado).length

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Configurações do Sistema</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gerencie itens personalizados e o contexto da IA de auditoria</p>
        </div>
        {naoVerificados > 0 && (
          <span className="text-xs bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full font-medium">
            {naoVerificados} item(s) não verificado(s)
          </span>
        )}
      </div>
      <ConfigClient itens={itens ?? []} contexto={contexto ?? []} />
    </div>
  )
}
