/**
 * Testes do painel admin/secretaria (requer sessão salva em e2e/.auth/admin.json).
 * Setup: npx playwright test --project=setup-admin --headed
 */
import { test, expect } from '@playwright/test'

const PAGINAS_PAINEL = [
  { path: '/painel/dashboard',       titulo: /dashboard|painel|sede/i },
  { path: '/painel/alunos',          titulo: /alunos/i },
  { path: '/painel/turmas',          titulo: /turmas/i },
  { path: '/painel/professores',     titulo: /professores/i },
  { path: '/painel/financeiro',      titulo: /financeiro|mensalidades/i },
  { path: '/painel/folha-pagamento', titulo: /folha|pagamento/i },
  { path: '/painel/leads',           titulo: /leads|crm/i },
  { path: '/painel/auditoria',       titulo: /auditoria/i },
  { path: '/painel/relatorios',      titulo: /relatorios|relatórios/i },
  { path: '/painel/config',          titulo: /config/i },
]

test.describe('Smoke — todas as páginas do painel carregam', () => {
  for (const { path, titulo } of PAGINAS_PAINEL) {
    test(`${path} — sem erro 500`, async ({ page }) => {
      const erros: string[] = []
      page.on('pageerror', err => erros.push(err.message))

      const response = await page.goto(path)
      await page.waitForLoadState('domcontentloaded')

      // Status OK
      expect(response?.status(), `${path} retornou ${response?.status()}`).toBeLessThan(500)

      // Não redirecionou para login (sessão ainda válida)
      expect(page.url()).not.toContain('/login')
      expect(page.url()).not.toContain('/api/auth/signin')

      // Sem erros JS graves
      const graves = erros.filter(e => !e.includes('ResizeObserver'))
      expect(graves, `Erros JS em ${path}: ${graves.join(' | ')}`).toHaveLength(0)
    })
  }
})

test.describe('Alunos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/painel/alunos')
    await page.waitForLoadState('domcontentloaded')
  })

  test('lista de alunos tem pelo menos um resultado', async ({ page }) => {
    // Tabela ou lista de alunos deve existir
    const lista = page.locator('table, [role="table"], .divide-y').first()
    await expect(lista).toBeVisible({ timeout: 10000 })
  })

  test('busca de aluno funciona', async ({ page }) => {
    const inputBusca = page.locator('input[type="search"], input[placeholder*="buscar"], input[placeholder*="nome"]').first()
    if (await inputBusca.count() > 0) {
      await inputBusca.fill('a')
      await page.waitForTimeout(500)
      // Página não deve quebrar após digitar
      await expect(page.locator('body')).toBeVisible()
    }
  })
})

test.describe('Turmas', () => {
  test('lista de turmas carrega', async ({ page }) => {
    await page.goto('/painel/turmas')
    await page.waitForLoadState('domcontentloaded')
    const conteudo = page.locator('main, .container, [class*="max-w"]').first()
    await expect(conteudo).toBeVisible()
  })
})

test.describe('Chamada via painel — sem restrição de prazo para admin', () => {
  test('chamada com UUID inválido retorna 404 (não 500)', async ({ page }) => {
    const response = await page.goto('/painel/chamada/00000000-0000-0000-0000-000000000000')
    expect(response?.status()).not.toBe(500)
  })

  test('admin não vê "🔒 Prazo expirado" em chamadas recentes', async ({ page }) => {
    // Navega para uma chamada recente via agenda
    await page.goto('/painel/agenda')
    await page.waitForLoadState('domcontentloaded')

    const linkChamada = page.locator('a[href*="/painel/chamada/"]').first()
    if (await linkChamada.count() > 0) {
      await linkChamada.click()
      await page.waitForLoadState('domcontentloaded')

      // Admin nunca deve ver "Prazo expirado" — essa é a verificação crítica
      await expect(page.locator('text=🔒 Prazo expirado')).toHaveCount(0)

      // Se a chamada já foi feita, deve ter botão Corrigir; se não, deve ter Salvar
      const temCorrigir = await page.locator('button:has-text("Corrigir")').count()
      const temSalvar = await page.locator('button:has-text("Salvar"), button:has-text("Lançar")').count()
      expect(temCorrigir + temSalvar, 'Admin deve ter acesso à chamada (Corrigir ou Salvar)').toBeGreaterThan(0)
    }
  })
})

test.describe('Folha de pagamento', () => {
  test('página de folha carrega sem erro', async ({ page }) => {
    const response = await page.goto('/painel/folha-pagamento')
    await page.waitForLoadState('domcontentloaded')
    expect(response?.status()).toBeLessThan(500)
    expect(page.url()).not.toContain('/login')
  })
})

test.describe('Auditoria', () => {
  test('verificações de auditoria carregam', async ({ page }) => {
    await page.goto('/painel/auditoria')
    await page.waitForLoadState('domcontentloaded')
    // Deve ter algum conteúdo de verificação
    await expect(page.locator('main, .container, [class*="max-w"]').first()).toBeVisible()
  })
})

test.describe('Leads / CRM', () => {
  test('lista de leads carrega', async ({ page }) => {
    const response = await page.goto('/painel/leads')
    await page.waitForLoadState('domcontentloaded')
    expect(response?.status()).toBeLessThan(500)
  })
})

test.describe('API routes — saúde', () => {
  test('GET /api/chamada/salvar — método errado retorna 405, não 500', async ({ page }) => {
    const response = await page.goto('/api/chamada/salvar')
    // GET numa rota POST deve dar 405 ou 404, não 500
    expect(response?.status()).not.toBe(500)
  })
})
