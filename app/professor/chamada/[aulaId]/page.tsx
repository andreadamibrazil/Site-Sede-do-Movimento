import { createClient, createServiceClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import ChamadaClient from '@/app/painel/chamada/[aulaId]/ChamadaClient'
import { TOLERANCIA_PROFESSOR_MINUTOS } from '@/lib/constants/chamada'

export default async function ProfessorChamadaPage({
  params,
}: {
  params: Promise<{ aulaId: string }>
}) {
  const { aulaId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/professor/login')

  const service = createServiceClient()

  // Verifica se é professor
  const { data: professor } = await service
    .from('professores')
    .select('id, nome')
    .eq('email', user.email ?? '')
    .eq('ativo', true)
    .maybeSingle()

  if (!professor) redirect('/professor/login')

  const { data: perfilRow } = await service
    .from('perfis_usuario')
    .select('perfil')
    .eq('id', user.id)
    .maybeSingle()

  const isAdmin = perfilRow?.perfil === 'admin' || perfilRow?.perfil === 'secretaria'

  // Dados da aula — verifica se é do professor
  const { data: aula } = await service
    .from('aulas')
    .select('*, turmas(nome, professor_id, modalidades(nome)), professores(nome), salas(nome)')
    .eq('id', aulaId)
    .single()

  if (!aula) notFound()

  // Admin vê qualquer aula; professor só acessa as suas.
  // Checa: aulas.professor_id, turmas.professor_id, ou turma_professores (co-regência)
  let pertenceAoProfessor =
    aula.professor_id === professor.id ||
    (aula.turmas as any)?.professor_id === professor.id

  if (!isAdmin && !pertenceAoProfessor) {
    const { data: coProf } = await service
      .from('turma_professores' as any)
      .select('professor_id')
      .eq('turma_id', aula.turma_id)
      .eq('professor_id', professor.id)
      .maybeSingle()
    pertenceAoProfessor = !!coProf
  }

  if (!isAdmin && !pertenceAoProfessor) {
    redirect('/professor')
  }

  // Carrega alunos, presenças e experimentais em paralelo
  const [{ data: matriculaTurmas }, { data: presencasExistentes }, { data: experimentaisData }] = await Promise.all([
    service.from('matricula_turmas')
      .select('matriculas!inner(aluno_id, status, alunos(id, nome, nome_social, data_nascimento, status_pedagogico, status_financeiro))')
      .eq('turma_id', aula.turma_id)
      .is('data_saida', null),
    service.from('presencas')
      .select('aluno_id, status, observacao')
      .eq('aula_id', aulaId),
    service.from('experimentais')
      .select('id, status, leads(id, nome, celular, modalidade_interesse)')
      .eq('aula_id', aulaId)
      .neq('status', 'convertido'),
  ])

  const alunos = matriculaTurmas
    ?.filter((mt: any) => mt.matriculas?.status === 'ativa')
    .map((mt: any) => mt.matriculas?.alunos)
    .filter(Boolean)
    .filter((a: any) => a.status_pedagogico === 'ativo')
    .sort((a: any, b: any) => a.nome.localeCompare(b.nome)) ?? []

  const mapaPresencas = Object.fromEntries(
    (presencasExistentes ?? []).map(p => [p.aluno_id, p])
  )

  const experimentais = (experimentaisData ?? []).map((e: any) => ({
    id: e.id,
    status: e.status as string,
    lead: e.leads,
  }))

  // Força fuso horário Brasília (-03:00) para evitar erro de ±3h em servidores UTC
  const fimAula = new Date(`${aula.data}T${aula.hora_fim}:00-03:00`)
  const agora = new Date()
  const minutosDesdeOFim = (agora.getTime() - fimAula.getTime()) / 60000
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
