'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const CAMPOS_EDITAVEIS_ALUNO = [
  'nome', 'nome_social', 'sexo', 'data_nascimento', 'cpf', 'rg',
  'celular', 'email', 'cep', 'endereco', 'bairro',
  'origem', 'como_conheceu', 'info_saude', 'observacoes',
]

const CAMPOS_EDITAVEIS_RESPONSAVEL = [
  'nome', 'cpf', 'celular', 'email', 'parentesco', 'notificacao',
  'cep', 'endereco', 'bairro', 'profissao', 'observacoes',
]

async function requireAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autorizado')
  return user
}

export async function atualizarAluno(
  id: string,
  dados: Record<string, string | null>
) {
  await requireAuth()
  const dadosFiltrados = Object.fromEntries(
    Object.entries(dados).filter(([k]) => CAMPOS_EDITAVEIS_ALUNO.includes(k))
  )
  const supabase = createServiceClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await supabase.from('alunos').update(dadosFiltrados as any).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(`/painel/alunos/${id}`)
}

export async function atualizarResponsavel(
  responsavelId: string,
  alunoId: string,
  dados: Record<string, string | null>
) {
  await requireAuth()
  const dadosFiltrados = Object.fromEntries(
    Object.entries(dados).filter(([k]) => CAMPOS_EDITAVEIS_RESPONSAVEL.includes(k))
  )
  const supabase = createServiceClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await supabase.from('responsaveis').update(dadosFiltrados as any).eq('id', responsavelId)
  if (error) throw new Error(error.message)
  revalidatePath(`/painel/alunos/${alunoId}`)
}
