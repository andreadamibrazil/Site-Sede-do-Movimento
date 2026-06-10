'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { buscarOuCriarCliente, criarCobranca } from '@/lib/asaas/client'

function vencimentoPadrao() {
  const d = new Date()
  d.setDate(d.getDate() + 7)
  return d.toISOString().split('T')[0]
}

export async function lancarCobrancasLote(items: {
  aluno_id: string
  categoria: string
  categoria_custom: string | null
  descricao: string
  descricao_detalhada: string | null
  valor: number
  preco_unitario: number
  quantidade: number
  vencimento: string | null
}[]) {
  const supabase = createServiceClient()

  // Busca dados dos alunos selecionados de uma vez
  const ids = [...new Set(items.map(i => i.aluno_id))]
  const { data: alunos } = await supabase
    .from('alunos')
    .select('id, nome, cpf, email, celular, asaas_customer_id')
    .in('id', ids)

  const alunoMap = Object.fromEntries((alunos ?? []).map(a => [a.id, a]))

  const inserts = await Promise.all(items.map(async item => {
    const base = { ...item, status: 'pendente' }
    const aluno = alunoMap[item.aluno_id]
    if (!aluno || !process.env.ASAAS_API_KEY) return base

    try {
      // Busca ou cria customer no Asaas
      let customerId = aluno.asaas_customer_id
      if (!customerId) {
        customerId = await buscarOuCriarCliente(aluno)
        await supabase.from('alunos').update({ asaas_customer_id: customerId }).eq('id', aluno.id)
      }

      // Cria cobrança — ID gerado antes do insert para usar como externalReference
      const tempId = crypto.randomUUID()
      const { id, invoiceUrl } = await criarCobranca({
        customerId,
        valor: item.valor,
        vencimento: item.vencimento ?? vencimentoPadrao(),
        descricao: item.descricao,
        externalReference: `cobranca:${tempId}`,
      })

      return { ...base, id: tempId, codigo_asaas: id, link_pagamento: invoiceUrl }
    } catch (e) {
      console.error('Asaas error para aluno', item.aluno_id, e)
      return base
    }
  }))

  const { error } = await supabase.from('cobrancas_avulsas').insert(inserts as any)
  if (error) throw new Error(error.message)
  revalidatePath('/painel/cobranca-lote')
}
