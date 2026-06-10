const BASE = 'https://api.asaas.com/v3'

function h() {
  return {
    'access_token': process.env.ASAAS_API_KEY!,
    'Content-Type': 'application/json',
  }
}

export async function buscarOuCriarCliente(aluno: {
  id: string
  nome: string
  cpf?: string | null
  email?: string | null
  celular?: string | null
}): Promise<string> {
  // Busca pelo externalReference (nosso aluno_id)
  const r1 = await fetch(`${BASE}/customers?externalReference=${aluno.id}`, { headers: h() })
  const d1 = await r1.json()
  if (d1.data?.length > 0) return d1.data[0].id

  // Busca pelo CPF se disponível
  if (aluno.cpf) {
    const cpf = aluno.cpf.replace(/\D/g, '')
    const r2 = await fetch(`${BASE}/customers?cpfCnpj=${cpf}`, { headers: h() })
    const d2 = await r2.json()
    if (d2.data?.length > 0) return d2.data[0].id
  }

  // Cria cliente
  const body: Record<string, string> = {
    name: aluno.nome,
    externalReference: aluno.id,
  }
  if (aluno.cpf) body.cpfCnpj = aluno.cpf.replace(/\D/g, '')
  if (aluno.email) body.email = aluno.email
  if (aluno.celular) body.mobilePhone = aluno.celular.replace(/\D/g, '')

  const r3 = await fetch(`${BASE}/customers`, {
    method: 'POST',
    headers: h(),
    body: JSON.stringify(body),
  })
  const d3 = await r3.json()
  if (!d3.id) throw new Error(`Asaas customer: ${JSON.stringify(d3)}`)
  return d3.id
}

export async function criarCobranca(params: {
  customerId: string
  valor: number
  vencimento: string        // YYYY-MM-DD
  descricao: string
  externalReference: string // "cobranca:{id}" ou "mensalidade:{id}"
  billingType?: 'PIX' | 'BOLETO' | 'CREDIT_CARD' | 'UNDEFINED'
}): Promise<{ id: string; invoiceUrl: string }> {
  const res = await fetch(`${BASE}/payments`, {
    method: 'POST',
    headers: h(),
    body: JSON.stringify({
      customer: params.customerId,
      billingType: params.billingType ?? 'UNDEFINED',
      value: params.valor,
      dueDate: params.vencimento,
      description: params.descricao,
      externalReference: params.externalReference,
    }),
  })
  const data = await res.json()
  if (!data.id) throw new Error(`Asaas payment: ${JSON.stringify(data)}`)
  return { id: data.id, invoiceUrl: data.invoiceUrl ?? '' }
}

export async function cancelarCobranca(codigoAsaas: string): Promise<void> {
  await fetch(`${BASE}/payments/${codigoAsaas}/cancel`, {
    method: 'POST',
    headers: h(),
  })
}
