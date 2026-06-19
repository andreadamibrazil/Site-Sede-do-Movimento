'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function registrarPagamento(data: {
  mensalidadeId: string
  valor: number
  forma: string
  comprovanteUrl?: string | null
}) {
  const supabase = createServiceClient()

  // Busca aluno_id para revalidar a ficha do aluno após o pagamento
  const { data: mensRef } = await supabase
    .from('mensalidades')
    .select('matriculas!inner(aluno_id)')
    .eq('id', data.mensalidadeId)
    .maybeSingle()
  const alunoId = (mensRef as any)?.matriculas?.aluno_id

  const { error: e1 } = await supabase
    .from('mensalidades')
    .update({
      status: 'recebida',
      valor_pago: data.valor,
      pago_em: new Date().toISOString(),
    })
    .eq('id', data.mensalidadeId)
  if (e1) throw new Error(e1.message)

  const { error: e2 } = await supabase.from('pagamentos').insert({
    mensalidade_id: data.mensalidadeId,
    valor: data.valor,
    forma: data.forma as any,
    data_pagamento: new Date().toISOString().split('T')[0],
    comprovante_url: data.comprovanteUrl ?? null,
  })
  if (e2) throw new Error(e2.message)

  revalidatePath('/painel/financeiro')
  if (alunoId) revalidatePath(`/painel/alunos/${alunoId}`)
}
