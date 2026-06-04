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
    cpfSubstituto, celularSubstituto, motivoAusencia, termosAceitos,
  } = await req.json()
  if (!aulaId) return NextResponse.json({ error: 'aulaId obrigatório' }, { status: 400 })

  const sb = createServiceClient()

  // Verifica se o usuário tem acesso a esta aula
  const { data: aula } = await sb
    .from('aulas')
    .select('id, professor_id, turma_id, status')
    .eq('id', aulaId)
    .single()

  if (!aula) return NextResponse.json({ error: 'aula não encontrada' }, { status: 404 })

  // Se for professor, verifica se é a aula dele
  const { data: perfil } = await sb
    .from('perfis_usuario')
    .select('perfil')
    .eq('id', user.id)
    .maybeSingle()

  const isAdmin = perfil?.perfil === 'admin' || perfil?.perfil === 'secretaria'

  if (!isAdmin) {
    // Verifica se é professor desta aula
    const { data: prof } = await sb
      .from('professores')
      .select('id')
      .eq('email', user.email ?? '')
      .eq('ativo', true)
      .maybeSingle()

    if (!prof || aula.professor_id !== prof.id) {
      return NextResponse.json({ error: 'sem permissão para esta aula' }, { status: 403 })
    }
  }

  // Salva presenças
  if (presencas && presencas.length > 0) {
    const { error } = await sb
      .from('presencas')
      .upsert(presencas, { onConflict: 'aula_id,aluno_id' })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Substituto (professor faltou)
  if (profFaltou && aula.professor_id) {
    await sb.from('substituicoes').upsert({
      aula_id: aulaId,
      professor_ausente_id: aula.professor_id,
      professor_substituto_id: null,
      tem_atestado: atestado ?? false,
      motivo: motivoAusencia || (substituto ? `Substituto: ${substituto}` : null),
      substituto_nome: substituto || null,
      substituto_cpf: cpfSubstituto || null,
      substituto_celular: celularSubstituto || null,
      termos_aceitos: termosAceitos ?? false,
      termos_aceitos_em: termosAceitos ? new Date().toISOString() : null,
      registrado_por: user.id,
    } as any, { onConflict: 'aula_id' })
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
