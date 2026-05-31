import { createClient, createServiceClient } from '@/lib/supabase/server'
import AgendaGrid from './AgendaGrid'

export const dynamic = 'force-dynamic'

function getInicioSemana(hoje: Date) {
  const d = new Date(hoje)
  const dia = d.getDay()
  const diff = dia === 0 ? -6 : 1 - dia
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export default async function AgendaPage() {
  const supabase = await createClient()
  const service = createServiceClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: perfil } = await service
    .from('perfis_usuario')
    .select('perfil, professor_id')
    .eq('id', user!.id)
    .maybeSingle()

  const isAdmin = perfil?.perfil === 'admin' || perfil?.perfil === 'secretaria'

  const hoje = new Date()
  const inicioSemana = getInicioSemana(hoje)
  const fimSemana = new Date(inicioSemana)
  fimSemana.setDate(fimSemana.getDate() + 4) // seg-sex apenas

  const inicioStr = inicioSemana.toISOString().split('T')[0]
  const fimStr = fimSemana.toISOString().split('T')[0]
  const hojeStr = hoje.toISOString().split('T')[0]

  let query = supabase
    .from('aulas')
    .select(`
      id, data, hora_inicio, hora_fim, status, chamada_concluida_em,
      turmas(id, nome, preco_padrao, modalidades(nome), professores(id, nome), salas(id, nome)),
      presencas(id)
    `)
    .gte('data', inicioStr)
    .lte('data', fimStr)
    .order('hora_inicio')

  if (!isAdmin && perfil?.professor_id) {
    query = query.eq('professor_id', perfil.professor_id)
  }

  const { data: aulas } = await query

  // Chamadas pendentes (3 dias)
  const tresAtras = new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0]
  const { data: pendentes } = await supabase
    .from('aulas')
    .select('id, data, hora_inicio, turmas(nome)')
    .is('chamada_concluida_em', null)
    .gte('data', tresAtras)
    .lt('data', hojeStr)
    .in('status', ['aberta','agendada','concluida'])

  // Salas disponíveis para o quick-edit
  const { data: salas } = await service.from('salas').select('id, nome').order('nome')
  // Professores disponíveis
  const { data: professores } = await service.from('professores').select('id, nome').eq('ativo', true).order('nome')

  // Datas da semana (seg-sex)
  const datas = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(inicioSemana)
    d.setDate(d.getDate() + i)
    return d.toISOString().split('T')[0]
  })

  return (
    <AgendaGrid
      aulas={aulas as any ?? []}
      pendentes={pendentes as any ?? []}
      datas={datas}
      hojeStr={hojeStr}
      isAdmin={isAdmin}
      salas={salas ?? []}
      professores={professores ?? []}
    />
  )
}
