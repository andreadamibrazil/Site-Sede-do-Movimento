import { createServiceClient } from '@/lib/supabase/server'
import ProfessoresClient from './ProfessoresClient'

export const dynamic = 'force-dynamic'

export default async function ProfessoresPage() {
  const sb = createServiceClient()
  const { data: professores } = await sb
    .from('professores')
    .select('*')
    .order('nome')

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Professores</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Desative quem não está mais na Sede — não aparecerá no modal da agenda.
          </p>
        </div>
      </div>
      <ProfessoresClient professores={professores ?? []} />
    </div>
  )
}
