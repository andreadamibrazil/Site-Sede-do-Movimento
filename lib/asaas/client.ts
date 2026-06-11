const BASE = 'https://api.asaas.com/v3'

function h() {
  return {
    'access_token': process.env.ASAAS_API_KEY!,
    'Content-Type': 'application/json',
  }
}

export type PessoaAsaas = {
  id: string
  nome: string
  cpf?: string | null
  email?: string | null
  celular?: string | null
}

// Aceita aluno_id ou responsavel_id como externalReference — UUIDs nunca colidem
export async function buscarOuCriarCliente(pessoa: PessoaAsaas): Promise<string> {
  const r1 = await fetch(`${BASE}/customers?externalReference=${pessoa.id}`, { headers: h() })
  const d1 = await r1.json()
  if (d1.data?.length > 0) return d1.data[0].id

  if (pessoa.cpf) {
    const cpf = pessoa.cpf.replace(/\D/g, '')
    const r2 = await fetch(`${BASE}/customers?cpfCnpj=${cpf}`, { headers: h() })
    const d2 = await r2.json()
    if (d2.data?.length > 0) return d2.data[0].id
  }

  const body: Record<string, string> = {
    name: pessoa.nome,
    externalReference: pessoa.id,
  }
  if (pessoa.cpf) body.cpfCnpj = pessoa.cpf.replace(/\D/g, '')
  if (pessoa.email) body.email = pessoa.email
  if (pessoa.celular) body.mobilePhone = pessoa.celular.replace(/\D/g, '')

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

// ── Resolve quem paga uma matrícula ────────────────────────────
// Prioridade:
//   1. responsavel_financeiro explícito na matrícula
//   2. responsavel_principal com permissão de cobrança
//   3. o próprio aluno (adulto sem responsável)
export function resolverPagador(
  aluno: PessoaAsaas & { asaas_customer_id?: string | null },
  responsavelPrincipal?: (PessoaAsaas & { notificacao?: string | null; asaas_customer_id?: string | null }) | null,
  responsavelFinanceiro?: (PessoaAsaas & { asaas_customer_id?: string | null }) | null,
): { pagador: PessoaAsaas; tabela: 'responsaveis' | 'alunos'; asaas_customer_id: string | null } {
  if (responsavelFinanceiro?.id) {
    return { pagador: responsavelFinanceiro, tabela: 'responsaveis', asaas_customer_id: responsavelFinanceiro.asaas_customer_id ?? null }
  }
  if (
    responsavelPrincipal?.id &&
    ['notificacao_e_cobranca', 'so_cobranca'].includes(responsavelPrincipal.notificacao ?? '')
  ) {
    return { pagador: responsavelPrincipal, tabela: 'responsaveis', asaas_customer_id: responsavelPrincipal.asaas_customer_id ?? null }
  }
  return { pagador: aluno, tabela: 'alunos', asaas_customer_id: aluno.asaas_customer_id ?? null }
}
