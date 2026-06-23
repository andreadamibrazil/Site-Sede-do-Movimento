import { createClient, createServiceClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import ChamadaClient from '@/app/painel/chamada/[aulaId]/ChamadaClient'

const TOLERANCIA_PROFESSOR_MINUTOS = 57600 // 40 dias — cobre qualquer aula do mês até o fechamento da folha (dia 6 do mês seguinte)

export default async function ProfessorChamadaPage({
  params,
}: {
  params: Promise<{ aulaId: string }>
}) {
  const { aulaId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/painel/login')

  const service = createServiceClient()

  // Verifica se é professor
  const { data: professor } = await service
    .from('professores')
    .select('id, nome')
    .eq('email', user.email ?? '')
    .eq('ativo', true)
    .maybeSingle()

  if (!professor) redirect('/painel/login')

  // Dados da aula — verifica se é do professor
  const { data: aula } = await service
    .from('aulas')
    .select('*, turmas(nome, professor_id, modalidades(nome)), professores(nome), salas(nome)')
    .eq('id', aulaId)
    .single()

  if (!aula) notFound()
  if ((aula as any).status === 'cancelada') redirect('/painel/professor')

  // Segurança: professor só acessa chamada das suas aulas
  // aulas.professor_id pode ser NULL (professor vem via turmas.professor_id)
  const professorDaTurma = (aula.turmas as any)?.professor_id === professor.id
  const professorDaAula = aula.professor_id === professor.id
  if (!professorDaTurma && !professorDaAula) {
    // Verificar co-regência
    const { data: coRegencia } = await (service as any)
      .from('turma_professores')
      .select('id')
      .eq('turma_id', aula.turma_id)
      .eq('professor_id', professor.id)
      .maybeSingle()
    if (!coRegencia) redirect('/painel/professor')
  }

  // Alunos da turma
  const { data: matriculaTurmas } = await service
    .from('matricula_turmas')
    .select('matriculas!inner(aluno_id, status, alunos(id, nome, nome_social, data_nascimento, status_pedagogico, status_financeiro))')
    .eq('turma_id', aula.turma_id)
    .is('data_saida', null)

  const alunos = matriculaTurmas
    ?.map((mt: any) => mt.matriculas?.alunos)
    .filter(Boolean)
    .filter((a: any) => a.status_pedagogico === 'ativo')
    .sort((a: any, b: any) => a.nome.localeCompare(b.nome)) ?? []

  // Presenças já registradas
  const { data: presencasExistentes } = await service
    .from('presencas')
    .select('aluno_id, status, observacao')
    .eq('aula_id', aulaId)

  const mapaPresencas = Object.fromEntries(
    (presencasExistentes ?? []).map(p => [p.aluno_id, p])
  )

  // Experimentais
  const { data: experimentaisData } = await (service as any)
    .from('experimentais')
    .select('id, status, leads(id, nome, celular, modalidade_interesse)')
    .eq('aula_id', aulaId)
    .neq('status', 'convertido')

  const experimentais = (experimentaisData ?? []).map((e: any) => ({
    id: e.id,
    status: e.status as string,
    lead: e.leads,
  }))

  const fimAula = new Date(`${aula.data}T${aula.hora_fim}:00-03:00`)
  const minutosDesdeOFim = (Date.now() - fimAula.getTime()) / 60000
  const dentroTolerancia = minutosDesdeOFim <= TOLERANCIA_PROFESSOR_MINUTOS

  return (
    <div className="min-h-screen bg-gray-50">
      <ChamadaClient
        aula={aula as any}
        alunos={alunos}
        presencasIniciais={mapaPresencas}
        aulaId={aulaId}
        experimentais={experimentais}
        perfilUsuario="professor"
        dentroTolerancia={dentroTolerancia}
        toleranciaMinutos={TOLERANCIA_PROFESSOR_MINUTOS}
      />
    </div>
  )
}
