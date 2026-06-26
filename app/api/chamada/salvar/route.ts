import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { TOLERANCIA_PROFESSOR_MINUTOS } from '@/lib/constants/chamada'

// POST /api/chamada/salvar
// Salva presenças via service client (bypassa RLS do browser)
// Funciona para admin, secretaria e professor
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'não autenticado' }, { status: 401 })

  const {
    aulaId, presencas, profFaltou, atestado, substituto, concluir,
    cpfSubstituto, celularSubstituto, motivoAusencia, termosAceitos, atestadoUrl,
  } = await req.json()
  if (!aulaId) return NextResponse.json({ error: 'aulaId obrigatório' }, { status: 400 })

  const sb = createServiceClient()

  // Verifica se o usuário tem acesso a esta aula
  const { data: aula } = await sb
    .from('aulas')
    .select('id, data, hora_fim, professor_id, turma_id, status, turmas(professor_id)')
    .eq('id', aulaId)
    .single()

  if (!aula) return NextResponse.json({ error: 'aula não encontrada' }, { status: 404 })
  if (aula.status === 'cancelada') return NextResponse.json({ error: 'chamada não permitida em aula cancelada' }, { status: 403 })

  // professor_id efetivo: aulas.professor_id ou turmas.professor_id (fluxo normal não preenche aulas.professor_id)
  const professorIdEfetivo = aula.professor_id ?? (aula.turmas as any)?.professor_id ?? null

  // Se for professor, verifica se é a aula dele
  const { data: perfil } = await sb
    .from('perfis_usuario')
    .select('perfil')
    .eq('id', user.id)
    .maybeSingle()

  const isAdmin = perfil?.perfil === 'admin' || perfil?.perfil === 'secretaria'

  if (!isAdmin) {
    // Verifica se é professor desta aula (checa aulas.professor_id e turmas.professor_id)
    const { data: prof } = await sb
      .from('professores')
      .select('id')
      .eq('email', user.email ?? '')
      .eq('ativo', true)
      .maybeSingle()

    let pertenceAoProfessor =
      prof && (aula.professor_id === prof.id || (aula.turmas as any)?.professor_id === prof.id)

    if (prof && !pertenceAoProfessor) {
      const { data: coProf } = await sb
        .from('turma_professores' as any)
        .select('professor_id')
        .eq('turma_id', aula.turma_id)
        .eq('professor_id', prof.id)
        .maybeSingle()
      pertenceAoProfessor = !!coProf
    }

    if (!pertenceAoProfessor) {
      return NextResponse.json({ error: 'sem permissão para esta aula' }, { status: 403 })
    }

    // Professor tem 7 dias após o fim da aula; admin não passa por esta verificação
    const fimAula = new Date(`${aula.data}T${aula.hora_fim ?? '23:59'}:00-03:00`)
    const minutosDesdeOFim = (Date.now() - fimAula.getTime()) / 60000
    if (minutosDesdeOFim > TOLERANCIA_PROFESSOR_MINUTOS) {
      return NextResponse.json({ error: 'prazo de 7 dias para editar esta chamada expirou — contate a secretaria' }, { status: 403 })
    }
  }

  // Salva presenças (inclui registrado_por para auditoria)
  // aula_id forçado server-side; aluno_id validado contra matriculados da turma
  if (presencas && presencas.length > 0) {
    const { data: matriculados } = await sb
      .from('matricula_turmas')
      .select('matriculas!inner(aluno_id)')
      .eq('turma_id', aula.turma_id)
      .is('data_saida', null)

    const idsValidos = new Set((matriculados ?? []).map((m: any) => m.matriculas?.aluno_id).filter(Boolean))
    const invalidos = presencas.filter((p: any) => !idsValidos.has(p.aluno_id))
    if (invalidos.length > 0) {
      return NextResponse.json({ error: 'aluno_id inválido para esta turma' }, { status: 400 })
    }

    const presencasComRegistro = presencas.map((p: any) => ({
      ...p,
      aula_id: aulaId,
      registrado_por: user.id,
    }))
    const { error } = await sb
      .from('presencas')
      .upsert(presencasComRegistro, { onConflict: 'aula_id,aluno_id' })
    if (error) {
      console.error('[chamada/salvar] presencas upsert:', error)
      return NextResponse.json({ error: 'Erro interno ao salvar chamada' }, { status: 500 })
    }
  }

  // Substituto (professor faltou)
  if (profFaltou && professorIdEfetivo) {
    const { error: substError } = await sb.from('substituicoes').upsert({
      aula_id: aulaId,
      professor_ausente_id: professorIdEfetivo,
      professor_substituto_id: null,
      tem_atestado: atestado ?? false,
      motivo: motivoAusencia || (substituto ? `Substituto: ${substituto}` : null),
      substituto_nome: substituto || null,
      substituto_cpf: cpfSubstituto || null,
      substituto_celular: celularSubstituto || null,
      termos_aceitos: termosAceitos ?? false,
      termos_aceitos_em: termosAceitos ? new Date().toISOString() : null,
      registrado_por: user.id,
      atestado_url: atestadoUrl || null,
    } as any, { onConflict: 'aula_id' })
    if (substError) {
      console.error('[chamada/salvar] substituicoes upsert:', substError)
      return NextResponse.json({ error: 'Erro interno ao registrar substituição' }, { status: 500 })
    }
  }

  // Conclui a aula se pedido
  if (concluir) {
    const { error: conclErr } = await sb
      .from('aulas')
      .update({ status: 'concluida', chamada_concluida_em: new Date().toISOString() })
      .eq('id', aulaId)
    if (conclErr) return NextResponse.json({ error: `Erro ao concluir: ${conclErr.message}` }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
