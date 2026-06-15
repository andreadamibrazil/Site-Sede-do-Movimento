import { createClient, createServiceClient } from '@/lib/supabase/server'
import Link from 'next/link'
import TurmasClient, { type TurmaComHorarios } from './TurmasClient'

export default async function TurmasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const service = createServiceClient() as any

  const [{ data: perfilData }, { data: turmasRaw }, { data: matriculaTurmas }, { data: horarios }] = await Promise.all([
    user
      ? service.from('perfis_usuario').select('perfil').eq('id', user.id).maybeSingle()
      : Promise.resolve({ data: null }),
    // Sem professores(nome) aqui — turma_professores cria ambiguidade de FK no PostgREST
    service.from('turmas').select(`
      id, nome, capacidade, preco_padrao, status, nivel, professor_id,
      modalidades(nome),
      salas(nome)
    `).order('nome'),
    service.from('matricula_turmas').select('turma_id').is('data_saida', null),
    service.from('turma_horarios').select('turma_id, dia_semana, hora_inicio, hora_fim'),
  ])

  const isAdmin = perfilData?.perfil === 'admin'

  // Busca professores separadamente para evitar ambiguidade de FK (turma_professores)
  const professorIds = [...new Set(((turmasRaw ?? []) as any[]).map((t: any) => t.professor_id).filter(Boolean))]
  const { data: professoresData } = professorIds.length > 0
    ? await service.from('professores').select('id, nome').in('id', professorIds)
    : { data: [] as any[] }
  const profMap: Record<string, string> = {}
  for (const p of (professoresData ?? [])) profMap[p.id] = p.nome

  const contagemPorTurma: Record<string, number> = {}
  matriculaTurmas?.forEach(({ turma_id }: any) => {
    contagemPorTurma[turma_id] = (contagemPorTurma[turma_id] ?? 0) + 1
  })

  const horariosPorTurma: Record<string, { dia_semana: string; hora_inicio: string; hora_fim: string }[]> = {}
  horarios?.forEach((h: any) => {
    if (!horariosPorTurma[h.turma_id]) horariosPorTurma[h.turma_id] = []
    horariosPorTurma[h.turma_id].push({
      dia_semana: h.dia_semana,
      hora_inicio: h.hora_inicio,
      hora_fim: h.hora_fim,
    })
  })

  const turmasComHorarios: TurmaComHorarios[] = ((turmasRaw ?? []) as any[]).map((t: any) => ({
    ...t,
    modalidades: t.modalidades as { nome: string } | null,
    professores: t.professor_id && profMap[t.professor_id] ? { nome: profMap[t.professor_id] } : null,
    salas: t.salas as { nome: string } | null,
    horarios: horariosPorTurma[t.id] ?? [],
  }))

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Turmas</h1>
        <Link
          href="/painel/turmas/nova"
          className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + Nova turma
        </Link>
      </div>

      <TurmasClient
        turmas={turmasComHorarios}
        isAdmin={isAdmin}
        contagemPorTurma={contagemPorTurma}
      />
    </div>
  )
}
