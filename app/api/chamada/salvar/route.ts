import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

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

    // Verifica janela de 40 dias server-side (cobre aulas do mês até fechamento da folha no dia 6 do mês seguinte)
    const fimAula = new Date(`${aula.data}T${aula.hora_fim ?? '23:59'}:00-03:00`)
    const minutosDesdeOFim = (Date.now() - fimAula.getTime()) / 60000
    if (minutosDesdeOFim > 57600) {
      return NextResponse.json({ error: 'prazo para editar esta chamada expirou — contate a secretaria' }, { status: 403 })
    }
  }

  // Salva presenças (inclui registrado_por para auditoria)
  if (presencas && presencas.length > 0) {
    const presencasComRegistro = presencas.map((p: any) => ({ ...p, registrado_por: user.id }))
    const { error } = await sb
      .from('presencas')
      .upsert(presencasComRegistro, { onConflict: 'aula_id,aluno_id' })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
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
    if (substError) return NextResponse.json({ error: `Erro ao registrar substituição: ${substError.message}` }, { status: 500 })
  }

  // Conclui a aula se pedido
  if (concluir) {
    await sb
      .from('aulas')
      .update({ status: 'concluida', chamada_concluida_em: new Date().toISOString() })
      .eq('id', aulaId)
  }

  return NextResponse.json({ ok: true })
}
