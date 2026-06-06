import { createServiceClient } from '@/lib/supabase/server'
import { requireStaff } from '@/lib/api-auth'
import { uploadUniversal } from '@/lib/upload-universal'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const guard = await requireStaff()
  if (!guard.ok) return guard.response

  const form = await req.formData()
  const file = form.get('file') as File | null
  const alunoId = form.get('aluno_id') as string | null
  const tipo = (form.get('tipo') as string | null) ?? 'outro'
  const observacao = (form.get('observacao') as string | null) ?? null

  if (!file || !alunoId) {
    return NextResponse.json({ error: 'file e aluno_id são obrigatórios' }, { status: 400 })
  }

  const buffer = await file.arrayBuffer()

  // Upload para Drive + extração Gemini
  const result = await uploadUniversal(buffer, file.name, file.type, tipo)

  if (!result.ok) {
    // Drive falhou — retorna erro + flag para o cliente mostrar alerta
    return NextResponse.json({
      ok: false,
      erro: result.erro,
      alertaEnviado: result.alertaEnviado,
    }, { status: 500 })
  }

  // Monta observação automática a partir dos dados extraídos
  let obsAutomatica = observacao
  if (result.dadosExtraidos && tipo === 'atestado') {
    const d = result.dadosExtraidos
    const partes: string[] = []
    if (d.nome_medico) partes.push(`Médico: ${d.nome_medico}`)
    if (d.crm) partes.push(`CRM: ${d.crm}`)
    if (d.data_consulta) partes.push(`Consulta: ${new Date(d.data_consulta as string).toLocaleDateString('pt-BR')}`)
    if (d.hora_consulta) partes.push(`às ${d.hora_consulta}`)
    if (d.data_inicio_afastamento && d.data_fim_afastamento) {
      partes.push(
        `Afastamento: ${new Date(d.data_inicio_afastamento as string).toLocaleDateString('pt-BR')}` +
        ` a ${new Date(d.data_fim_afastamento as string).toLocaleDateString('pt-BR')}`
      )
    }
    if (d.diagnostico) partes.push(`| ${d.diagnostico}`)
    if (partes.length) obsAutomatica = (observacao ? observacao + ' — ' : '') + partes.join(' · ')
  }

  const sb = createServiceClient()
  const { data, error } = await sb
    .from('documentos_aluno')
    .insert({
      aluno_id: alunoId,
      tipo: tipo as any,
      nome: file.name,
      drive_url: result.driveUrl,
      storage_path: '',
      observacao: obsAutomatica,
      dados_extraidos: (result.dadosExtraidos ?? null) as any,
      criado_por: guard.userId,
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    ok: true,
    id: data.id,
    driveUrl: result.driveUrl,
    dadosExtraidos: result.dadosExtraidos,
  })
}
