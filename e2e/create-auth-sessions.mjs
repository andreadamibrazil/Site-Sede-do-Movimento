/**
 * Cria sessões Playwright para admin e professor sem interação humana.
 *
 * Estratégia:
 * 1. Gera magic link via Supabase Admin API
 * 2. Playwright navega para o magic link → Supabase valida → redireciona
 *    para a homepage com #access_token=... no hash
 * 3. Extrai os tokens do hash
 * 4. Usa @supabase/ssr para gerar os cookies exatos que o servidor espera
 * 5. Injeta os cookies no contexto Playwright e salva como storageState
 *
 * Rodar: node e2e/create-auth-sessions.mjs
 */
import { chromium } from '@playwright/test'
import { createServerClient } from '../node_modules/@supabase/ssr/dist/main/createServerClient.js'
import { mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const SUPABASE_URL = 'https://egrsoberwgimzqnxcxqk.supabase.co'
const ANON_KEY     = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVncnNvYmVyd2dpbXpxbnhjeHFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxNTQ1NzYsImV4cCI6MjA5NTczMDU3Nn0.g7YjJ76HdrGaHqmkf3q80k8a6odIZKN4sGjyAC9-_UU'
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVncnNvYmVyd2dpbXpxbnhjeHFrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDE1NDU3NiwiZXhwIjoyMDk1NzMwNTc2fQ.L80WHOjtFZHvpLzF7oV2kveC3xBc25yioQTZpAgFnM4'
const BASE_URL     = 'https://sededomovimento.art'
const ADMIN_EMAIL  = 'andreadami@sededomovimento.art'

const AUTH_DIR = join(__dirname, '.auth')

// ─── helpers ─────────────────────────────────────────────────────────────────

async function sbAdmin(path, opts = {}) {
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SERVICE_KEY}`,
      apikey: SERVICE_KEY,
      ...(opts.headers ?? {}),
    },
  })
  const text = await res.text()
  try { return JSON.parse(text) } catch { return text }
}

async function getMagicLink(email) {
  const data = await sbAdmin('/auth/v1/admin/generate_link', {
    method: 'POST',
    body: JSON.stringify({ type: 'magiclink', email }),
  })
  if (!data?.action_link) {
    throw new Error(`Não foi possível gerar magic link para ${email}: ${JSON.stringify(data)}`)
  }
  return data.action_link
}

/**
 * Usa @supabase/ssr com storage em memória para gerar os cookies no formato
 * exato que o createServerClient do Next.js espera ler.
 */
async function buildSupabaseCookies(accessToken, refreshToken) {
  const memStore = {}

  const supabase = createServerClient(SUPABASE_URL, ANON_KEY, {
    cookies: {
      getAll() {
        return Object.entries(memStore).map(([name, value]) => ({ name, value }))
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          if (value === '') delete memStore[name]
          else memStore[name] = value
        })
      },
    },
  })

  const { data, error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
  if (error) throw new Error(`setSession falhou: ${error.message}`)
  if (!data.session) throw new Error('setSession retornou sessão nula')

  console.log(`    Sessão válida para: ${data.session.user.email}`)
  return memStore  // { cookieName: cookieValue, ... }
}

/**
 * Navega para o magic link, extrai os tokens do hash e injeta cookies SSR.
 */
async function captureSession(label, magicLink, targetPath, outputPath) {
  console.log(`\n[${label}] Navegando para magic link...`)
  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext()
  const page = await ctx.newPage()

  try {
    // 1. Navega até o link de verificação → Supabase redireciona com hash
    await page.goto(magicLink, { waitUntil: 'domcontentloaded', timeout: 25000 })

    // 2. Aguarda chegar ao domínio da app (redireciona para sededomovimento.art#...)
    await page.waitForURL(
      url => url.hostname.includes('sededomovimento'),
      { timeout: 25000 }
    )

    const currentUrl = page.url()
    console.log(`[${label}]   Chegou em: ${currentUrl.substring(0, 70)}...`)

    // 3. Extrai tokens do hash da URL
    const hash = new URL(currentUrl).hash.slice(1)
    const params = new URLSearchParams(hash)
    const accessToken  = params.get('access_token')
    const refreshToken = params.get('refresh_token')

    if (!accessToken || !refreshToken) {
      throw new Error(`Tokens não encontrados no hash: ${currentUrl.substring(0, 200)}`)
    }

    // 4. Gera cookies exatos via @supabase/ssr em Node.js
    console.log(`[${label}]   Gerando cookies SSR...`)
    const cookieMap = await buildSupabaseCookies(accessToken, refreshToken)

    const playwrightCookies = Object.entries(cookieMap).map(([name, value]) => ({
      name,
      value,
      domain: 'sededomovimento.art',
      path: '/',
      secure: true,
      httpOnly: true,
      sameSite: 'Lax',
    }))

    // Também adiciona cookies para o domínio www (Supabase redireciona para www)
    const wwwCookies = playwrightCookies.map(c => ({ ...c, domain: 'www.sededomovimento.art' }))

    await ctx.addCookies([...playwrightCookies, ...wwwCookies])
    console.log(`[${label}]   ${playwrightCookies.length} cookie(s) injetados em ambos os domínios ✓`)

    // 5. Navega para a página alvo — agora com cookies corretos
    await page.goto(`${BASE_URL}${targetPath}`, { waitUntil: 'domcontentloaded', timeout: 20000 })
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {})

    const finalUrl = page.url()
    console.log(`[${label}]   URL final: ${finalUrl}`)

    if (finalUrl.includes('/login')) {
      await page.screenshot({ path: join(AUTH_DIR, `${label}-falhou.png`) })
      throw new Error(`Ainda redirecionou para login — cookies não foram aceitos`)
    }

    // 6. Salva o storage state
    await ctx.storageState({ path: outputPath })
    console.log(`[${label}] ✓ Sessão salva em ${outputPath}`)
  } catch (err) {
    console.error(`[${label}] ERRO: ${err.message}`)
    await page.screenshot({ path: join(AUTH_DIR, `${label}-erro.png`) }).catch(() => {})
    throw err
  } finally {
    await browser.close()
  }
}

// ─── main ────────────────────────────────────────────────────────────────────

async function main() {
  mkdirSync(AUTH_DIR, { recursive: true })

  // 1. Busca um professor ativo
  console.log('Buscando professor ativo no banco...')
  const professores = await sbAdmin(
    '/rest/v1/professores?select=email,nome&ativo=eq.true&order=nome&limit=10'
  )
  if (!Array.isArray(professores) || professores.length === 0) {
    throw new Error('Nenhum professor ativo encontrado')
  }
  const prof = professores.find(p => p.email?.includes('@')) ?? professores[0]
  console.log(`  → Professor: ${prof.nome} <${prof.email}>`)

  // 2. Gera magic links
  console.log('\nGerando magic links...')
  const adminMagicLink = await getMagicLink(ADMIN_EMAIL)
  const profMagicLink  = await getMagicLink(prof.email)
  console.log('  ✓ Links gerados')

  // 3. Captura sessões
  await captureSession('ADMIN',     adminMagicLink, '/painel/dashboard', join(AUTH_DIR, 'admin.json'))
  await captureSession('PROFESSOR', profMagicLink,  '/professor',        join(AUTH_DIR, 'professor.json'))

  console.log('\n✓ Todas as sessões criadas com sucesso!')
  console.log('  Rode: npx playwright test --project=professor')
  console.log('        npx playwright test --project=painel')
}

main().catch(err => {
  console.error('\nFALHOU:', err.message)
  process.exit(1)
})
