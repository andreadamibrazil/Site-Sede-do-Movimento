'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ── BotaoExcluirAluno ────────────────────────────────────────
export async function excluirAluno(alunoId: string) {
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('alunos')
    .update({ status_pedagogico: 'excluido' as any })
    .eq('id', alunoId)
  if (error) throw new Error(error.message)
  revalidatePath('/painel/alunos')
}

// ── AbaUniforme ──────────────────────────────────────────────
export async function inserirRetiradaUniforme(data: {
  aluno_id: string
  item: string
  tamanho: string
  quantidade: number
  valor: number | null
  observacao: string | null
  responsavel_nome: string | null
}) {
  const supabase = createServiceClient()
  const { data: retirada, error } = await supabase
    .from('uniforme_retiradas')
    .insert(data)
    .select()
    .single()
  if (error) throw new Error(error.message)
  revalidatePath(`/painel/alunos/${data.aluno_id}`)
  return retirada
}

// ── NovoAlunoForm ────────────────────────────────────────────
export async function obterOuCriarResponsavel(data: {
  cpf: string
  nome: string
  celular: string
  email: string | null
  parentesco: string | null
  notificacao: string
}): Promise<string> {
  const supabase = createServiceClient()
  const cpfLimpo = data.cpf.replace(/\D/g, '')

  if (cpfLimpo.length === 11) {
    const { data: existente } = await supabase
      .from('responsaveis')
      .select('id')
      .eq('cpf', cpfLimpo)
      .maybeSingle()
    if (existente) return existente.id as string
  }

  const { data: criado, error } = await supabase
    .from('responsaveis')
    .insert({
      nome: data.nome.trim(),
      cpf: cpfLimpo.length === 11 ? cpfLimpo : null,
      celular: data.celular || 'não informado',
      email: data.email || null,
      parentesco: data.parentesco || null,
      notificacao: data.notificacao as any,
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)
  return criado.id as string
}

export async function salvarAluno(data: {
  nome: string
  nome_social: string | null
  sexo: string | null
  data_nascimento: string | null
  cpf: string | null
  rg: string | null
  celular: string | null
  email: string | null
  cep: string | null
  endereco: string | null
  bairro: string | null
  origem: string | null
  como_conheceu: string | null
  info_saude: string | null
  observacoes: string | null
  responsavel_principal_id: string | null
  responsavel_secundario_id: string | null
  leadId?: string | null
}): Promise<string> {
  const supabase = createServiceClient()
  const { leadId, ...alunoData } = data

  const { data: aluno, error } = await supabase
    .from('alunos')
    .insert({ ...alunoData, status_pedagogico: 'ativo', status_financeiro: 'em_dia' })
    .select('id')
    .single()

  if (error) throw new Error(error.message)

  if (leadId) {
    await supabase.from('leads').update({ status: 'convertido' }).eq('id', leadId)
  }

  return aluno.id as string
}

// ── VincularFamilia ──────────────────────────────────────────
export async function criarFamilia(nome: string): Promise<string> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('familias')
    .insert({ nome })
    .select('id')
    .single()
  if (error) throw new Error(error.message)
  return data.id as string
}

export async function vincularAlunoFamilia(alunoId: string, familiaId: string) {
  const supabase = createServiceClient()
  await (supabase.from('alunos') as any).update({ familia_id: familiaId }).eq('id', alunoId)
  await supabase.from('familia_membros').insert({ familia_id: familiaId, aluno_id: alunoId, papeis: ['aluno'] })
  revalidatePath(`/painel/alunos/${alunoId}`)
}

// ── AbaMatriculas ────────────────────────────────────────────
export async function salvarAditivo(data: {
  matricula_id: string
  tipo: string
  motivo: string | null
  antes: Record<string, any>
  depois: Record<string, any>
}) {
  const supabase = createServiceClient()
  const { error } = await supabase.from('termos_aditivos').insert(data as any)
  if (error) throw new Error(error.message)
}

// ── AbaPresenca ──────────────────────────────────────────────
export async function justificarFalta(presencaId: string, obs: string) {
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('presencas')
    .update({ status: 'falta_justificada' as any, observacao: obs || 'Atestado entregue' })
    .eq('id', presencaId)
  if (error) throw new Error(error.message)
}

// ── AbaCobrancas ─────────────────────────────────────────────
export async function adicionarCobrancaAvulsa(data: {
  aluno_id: string
  categoria: string
  descricao: string
  valor: number
  vencimento: string | null
}) {
  const supabase = createServiceClient()
  const { data: nova, error } = await supabase
    .from('cobrancas_avulsas')
    .insert({ ...data, status: 'pendente' } as any)
    .select()
    .single()
  if (error) throw new Error(error.message)
  revalidatePath(`/painel/alunos/${data.aluno_id}`)
  return nova
}

export async function marcarCobrancaAvulsaPaga(id: string) {
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('cobrancas_avulsas')
    .update({ status: 'pago', pago_em: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

// ── AbaDocumentos ─────────────────────────────────────────────
export async function salvarDocumentoLink(data: {
  aluno_id: string
  tipo: string
  nome: string
  observacao: string | null
  drive_url: string
}) {
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('documentos_aluno')
    .insert({ ...data, storage_path: '' })
  if (error) throw new Error(error.message)
  revalidatePath(`/painel/alunos/${data.aluno_id}`)
}

export async function editarDocumento(id: string, data: { observacao: string | null; tipo: string }) {
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('documentos_aluno')
    .update(data)
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export async function excluirDocumentoDB(id: string) {
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('documentos_aluno')
    .delete()
    .eq('id', id)
  if (error) throw new Error(error.message)
}
