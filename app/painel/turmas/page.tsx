import { createClient, createServiceClient } from '@/lib/supabase/server'
import Link from 'next/link'
import TurmasClient, { type TurmaComHorarios } from './TurmasClient'

export default async function TurmasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const service = createServiceClient()

  const [{ data: perfilData }, { data: turmas }, { data: matriculaTurmas }, { data: horarios }] = await Promise.all([
    user
      ? service.from('perfis_usuario').select('perfil').eq('id', user.id).maybeSingle()
      : Promise.resolve({ data: null }),
    service.from('turmas').select(`
      id, nome, capacidade, preco_padrao, status, nivel,
      modalidades(nome),
      professores(nome),
      salas(nome)
    `).order('nome'),
    service.from('matricula_turmas').select('turma_id').is('data_saida', null),
    service.from('turma_horarios').select('turma_id, dia_semana, hora_inicio, hora_fim'),
  ])

  const isAdmin = perfilData?.perfil === 'admin'

  const contagemPorTurma: Record<string, number> = {}
  matriculaTurmas?.forEach(({ turma_id }) => {
    contagemPorTurma[turma_id] = (contagemPorTurma[turma_id] ?? 0) + 1
  })

  const horariosPorTurma: Record<string, { dia_semana: string; hora_inicio: string; hora_fim: string }[]> = {}
  horarios?.forEach(h => {
    if (!horariosPorTurma[h.turma_id]) horariosPorTurma[h.turma_id] = []
    horariosPorTurma[h.turma_id].push({
      dia_semana: h.dia_semana,
      hora_inicio: h.hora_inicio,
      hora_fim: h.hora_fim,
    })
  })

  const turmasComHorarios: TurmaComHorarios[] = (turmas ?? []).map(t => ({
    ...t,
    modalidades: t.modalidades as { nome: string } | null,
    professores: t.professores as { nome: string } | null,
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
