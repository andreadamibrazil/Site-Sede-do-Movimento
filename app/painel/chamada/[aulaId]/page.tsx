import { createClient, createServiceClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import ChamadaClient from './ChamadaClient'

// Minutos após o fim da aula que o professor ainda pode editar (7 dias); admin não tem restrição
const TOLERANCIA_PROFESSOR_MINUTOS = 10080

export default async function ChamadaPage({
  params,
}: {
  params: Promise<{ aulaId: string }>
}) {
  const { aulaId } = await params
  const supabase = await createClient()

  // Perfil do usuário logado
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/painel/login')

  const service = createServiceClient()
  let perfilUsuario: 'admin' | 'secretaria' | 'professor' = 'professor'
  const { data: perfil } = await service
    .from('perfis_usuario')
    .select('perfil')
    .eq('id', user.id)
    .maybeSingle()
  if (perfil?.perfil === 'admin' || perfil?.perfil === 'secretaria') {
    perfilUsuario = perfil.perfil
  } else {
    // Não é admin/secretaria — verifica se é professor da turma desta aula
    const { data: aulaCheck } = await service
      .from('aulas')
      .select('turmas!inner(professor_id)')
      .eq('id', aulaId)
      .maybeSingle()
    const { data: prof } = await service
      .from('professores')
      .select('id')
      .eq('email', user.email ?? '')
      .eq('ativo', true)
      .maybeSingle()
    if (!prof || (aulaCheck as any)?.turmas?.professor_id !== prof.id) {
      redirect('/painel')
    }
  }

  // Dados da aula
  const { data: aula } = await supabase
    .from('aulas')
    .select(`*, turmas(nome, modalidades(nome)), professores(nome), salas(nome)`)
    .eq('id', aulaId)
    .single()

  if (!aula) notFound()
  if (aula.status === 'cancelada') redirect('/painel/agenda')

  // Alunos matriculados na turma (ativos)
  const { data: matriculaTurmas } = await supabase
    .from('matricula_turmas')
    .select(`matriculas!inner(aluno_id, status, alunos(id, nome, nome_social, data_nascimento, status_pedagogico, status_financeiro))`)
    .eq('turma_id', aula.turma_id)
    .is('data_saida', null)

  const alunos = matriculaTurmas
    ?.map((mt: any) => mt.matriculas?.alunos)
    .filter(Boolean)
    .filter((a: any) => a.status_pedagogico === 'ativo')
    .sort((a: any, b: any) => a.nome.localeCompare(b.nome)) ?? []

  // Presenças já registradas
  const { data: presencasExistentes } = await supabase
    .from('presencas')
    .select('aluno_id, status, observacao')
    .eq('aula_id', aulaId)

  const mapaPresencas = Object.fromEntries(
    (presencasExistentes ?? []).map(p => [p.aluno_id, p])
  )

  // Experimentais agendados para esta aula
  const { data: experimentaisData } = await (supabase as any)
    .from('experimentais')
    .select('id, status, leads(id, nome, celular, modalidade_interesse)')
    .eq('aula_id', aulaId)
    .neq('status', 'convertido')

  const experimentais = (experimentaisData ?? []).map((e: any) => ({
    id: e.id,
    status: e.status as string,
    lead: e.leads,
  }))

  // Calcula se professor ainda está dentro da janela de tolerância
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
        perfilUsuario={perfilUsuario}
        dentroTolerancia={dentroTolerancia}
        toleranciaMinutos={TOLERANCIA_PROFESSOR_MINUTOS}
      />
    </div>
  )
}
