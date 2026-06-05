import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Cron a cada 5 minutos (vercel.json)
// Busca novos assinantes no BotConversa desde a última sync e insere no Supabase

const BOTCONVERSA_URL = 'https://backend.botconversa.com.br/api/v1'
const BOTCONVERSA_KEY = process.env.BOTCONVERSA_API_KEY ?? ''

function normalizarCelular(phone: string) {
  const n = phone.replace(/\D/g, '')
  if (n.startsWith('55') && n.length >= 12) return n.slice(2)
  return n
}

async function buscarAssinantes(page = 1): Promise<any[]> {
  const res = await fetch(`${BOTCONVERSA_URL}/subscriber/?page_size=100&page=${page}`, {
    headers: { 'API-KEY': BOTCONVERSA_KEY },
  })
  if (!res.ok) return []
  const data = await res.json()
  return data?.results ?? []
}

export async function GET(req: NextRequest) {
  // Vercel Cron autentica com CRON_SECRET no header Authorization
  const auth = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const sb = createServiceClient() as any

  // Busca timestamp da última sync (guardado em uma tabela simples de config)
  const { data: config } = await sb
    .from('sync_config')
    .select('value')
    .eq('chave', 'botconversa_last_sync')
    .maybeSingle()

  const ultimaSync = config?.value
    ? new Date(config.value)
    : new Date(Date.now() - 10 * 60 * 1000) // fallback: últimos 10 min

  let novos = 0
  let atualizados = 0
  let pagina = 1

  // Percorre páginas até não encontrar mais assinantes novos
  while (true) {
    const assinantes = await buscarAssinantes(pagina)
    if (!assinantes.length) break

    let encontrouAntigos = false

    for (const sub of assinantes) {
      const criadoEm = new Date(sub.created_at ?? sub.dataCriacao ?? 0)

      // Se já é mais antigo que a última sync, para
      if (criadoEm <= ultimaSync) {
        encontrouAntigos = true
        continue
      }

      const phone = sub.phone ?? sub.celular ?? ''
      if (!phone) continue
      const celular = normalizarCelular(phone)

      const nome = sub.full_name ?? sub.first_name ?? 'Sem nome'
      const variables: Record<string, string> = sub.variables ?? {}
      const tags: string[] = sub.tags ?? []

      const modalidade = variables['Modalidade'] || variables['modalidade'] || null
      const comoConheceu = variables['ComoConheceu'] || variables['como_conheceu'] || null
      const horario = variables['Horario'] || variables['horario'] || null
      const obs = Object.keys(variables).length > 0
        ? JSON.stringify({ botconversa: variables, tags })
        : null

      const { data: existente } = await sb
        .from('leads')
        .select('id')
        .eq('celular', celular)
        .maybeSingle()

      if (existente) {
        await sb.from('leads').update({
          nome: nome !== 'Sem nome' ? nome : undefined,
          modalidade_interesse: modalidade,
          como_conheceu: comoConheceu,
          horario_preferido: horario,
          observacoes: obs,
          updated_at: new Date().toISOString(),
        }).eq('id', existente.id)
        atualizados++
      } else {
        await sb.from('leads').insert({
          nome,
          celular,
          modalidade_interesse: modalidade,
          como_conheceu: comoConheceu,
          horario_preferido: horario,
          origem: 'botconversa',
          status: 'novo',
          observacoes: obs,
        })
        novos++
      }
    }

    // Se a última página só tinha assinantes antigos, para
    if (encontrouAntigos && assinantes.length < 100) break
    if (assinantes.length < 100) break
    pagina++
  }

  // Atualiza timestamp da sync
  await sb.from('sync_config').upsert(
    { chave: 'botconversa_last_sync', value: new Date().toISOString() },
    { onConflict: 'chave' }
  )

  return NextResponse.json({ ok: true, novos, atualizados, paginas: pagina })
}
