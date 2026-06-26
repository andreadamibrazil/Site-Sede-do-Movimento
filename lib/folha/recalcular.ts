// Helper compartilhado para recalcular os totais de uma folha de pagamento
// após qualquer alteração em itens_folha (edição, remoção, adição de avulso).
export async function recalcularFolha(sb: any, folhaId: string) {
  const { data: itens } = await sb
    .from('itens_folha')
    .select('tipo, valor, pago')
    .eq('folha_id', folhaId)

  let valorAulas = 0
  let valorFixo = 0
  let valorAvulso = 0

  for (const item of (itens ?? [])) {
    const v = item.pago ? (item.valor ?? 0) : 0
    if (item.tipo === 'aula') valorAulas += v
    else if (item.tipo === 'avulso') valorAvulso += v
    else valorFixo += v  // fixo, bonus, desconto
  }

  await sb.from('folhas_pagamento').update({
    valor_aulas:  Math.round(valorAulas  * 100) / 100,
    valor_fixo:   Math.round(valorFixo   * 100) / 100,
    valor_avulso: Math.round(valorAvulso * 100) / 100,
    valor_total:  Math.round((valorAulas + valorFixo + valorAvulso) * 100) / 100,
  }).eq('id', folhaId)
}
