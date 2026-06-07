import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const chatwootUrl = process.env.CHATWOOT_URL ?? 'https://crm.sededomovimento.art'
  const adminToken = process.env.CHATWOOT_ADMIN_TOKEN

  if (!adminToken) {
    return NextResponse.json({ error: 'CHATWOOT_ADMIN_TOKEN not set' }, { status: 500 })
  }

  // Pega o email do usuário logado no painel
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()

  if (!user?.email) {
    return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_SITE_URL ?? ''))
  }

  // Busca o agente Chatwoot pelo email
  const agentsRes = await fetch(`${chatwootUrl}/api/v1/accounts/1/agents`, {
    headers: { api_access_token: adminToken },
  })

  if (!agentsRes.ok) {
    return NextResponse.json({ error: 'failed to fetch agents' }, { status: 500 })
  }

  const agents: any[] = await agentsRes.json()
  const agent = agents.find((a) => a.email === user.email)

  if (!agent?.access_token) {
    // Usuário não é agente no Chatwoot — redireciona para o CRM normalmente
    return NextResponse.redirect(`${chatwootUrl}/app/accounts/1/conversations`)
  }

  // Redireciona para Chatwoot com o token do agente na URL
  // O Chatwoot aceita user_access_token como query param para login automático
  const target = `${chatwootUrl}/app/login?user_access_token=${agent.access_token}`
  return NextResponse.redirect(target)
}
