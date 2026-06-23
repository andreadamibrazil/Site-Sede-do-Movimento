/**
 * Testes públicos — não precisam de auth.
 * Verifica: redirects de proteção, páginas de login, erros de JS, 404s.
 */
import { test, expect } from '@playwright/test'

const ROTAS_PROTEGIDAS_PROFESSOR = [
  '/professor',
  '/professor/chamada/00000000-0000-0000-0000-000000000000',
  '/professor/turmas/00000000-0000-0000-0000-000000000000',
  '/professor/plano/00000000-0000-0000-0000-000000000000',
]

const ROTAS_PROTEGIDAS_PAINEL = [
  '/painel',
  '/painel/dashboard',
  '/painel/alunos',
  '/painel/turmas',
  '/painel/professores',
  '/painel/financeiro',
  '/painel/folha-pagamento',
  '/painel/leads',
  '/painel/auditoria',
  '/painel/config',
  '/painel/relatorios',
]

test.describe('Redirects de proteção', () => {
  test('rotas do professor redirecionam para /professor/login', async ({ page }) => {
    for (const rota of ROTAS_PROTEGIDAS_PROFESSOR) {
      await page.goto(rota)
      await expect(page).toHaveURL(/\/professor\/login/, { timeout: 10000 })
    }
  })

  test('rotas do painel redirecionam para login', async ({ page }) => {
    for (const rota of ROTAS_PROTEGIDAS_PAINEL) {
      await page.goto(rota)
      // Pode ir para /painel/login ou /api/auth/signin (Google OAuth)
      await expect(page).toHaveURL(/\/(painel\/login|api\/auth\/signin)/, { timeout: 10000 })
    }
  })
})

test.describe('Páginas de login', () => {
  test('professor/login carrega com botão Google', async ({ page }) => {
    const erros: string[] = []
    page.on('pageerror', err => erros.push(err.message))

    await page.goto('/professor/login')
    // Aguarda o botão (pode estar em Suspense)
    await expect(page.locator('button:has-text("Google"), button:has-text("Entrar")')).toBeVisible({ timeout: 15000 })

    // Título correto
    await expect(page.locator('h1')).toContainText(/Professor/)

    // Sem erros graves de JS (ignora ruído de scripts de terceiros em headless)
    const graves = erros.filter(e =>
      !e.includes('ResizeObserver') &&
      !e.includes('appendChild') &&  // Clarity/GTM em headless
      !e.includes('clarity') &&
      !e.includes('gtm') &&
      !e.includes('analytics')
    )
    expect(graves, `Erros JS: ${graves.join('\n')}`).toHaveLength(0)
  })

  test('professor/login — botão Google está habilitado', async ({ page }) => {
    await page.goto('/professor/login')
    const botao = page.locator('button:has-text("Google"), button:has-text("Entrar")').first()
    await expect(botao).toBeVisible({ timeout: 15000 })
    await expect(botao).toBeEnabled()
  })

  test('professor/login — status HTTP 200', async ({ page }) => {
    const response = await page.goto('/professor/login')
    expect(response?.status()).toBe(200)
  })
})

test.describe('Página 404', () => {
  test('rota inexistente retorna 404 ou redireciona', async ({ page }) => {
    const response = await page.goto('/pagina-que-nao-existe-xyz-abc')
    // Deve ser 404 ou redirect para login (não 500)
    expect(response?.status()).not.toBe(500)
    expect(response?.status()).not.toBe(502)
    expect(response?.status()).not.toBe(503)
  })
})

test.describe('Site público (homepage)', () => {
  test('homepage carrega sem erro 500', async ({ page }) => {
    const response = await page.goto('/')
    expect(response?.status()).toBeLessThan(500)
  })
})
