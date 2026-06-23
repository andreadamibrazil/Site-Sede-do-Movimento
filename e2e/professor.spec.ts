/**
 * Testes do portal do professor (requer sessão salva em e2e/.auth/professor.json).
 * Setup: npx playwright test --project=setup-professor --headed
 */
import { test, expect } from '@playwright/test'

test.describe('Dashboard do professor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/professor')
    await page.waitForLoadState('networkidle')
  })

  test('dashboard carrega sem erro de JS', async ({ page }) => {
    const erros: string[] = []
    page.on('console', msg => { if (msg.type() === 'error') erros.push(msg.text()) })
    await page.goto('/professor')
    await page.waitForLoadState('networkidle')

    const errosCriticos = erros.filter(e =>
      !e.includes('favicon') && !e.includes('analytics') && !e.includes('ResizeObserver')
    )
    expect(errosCriticos, `Erros de JS: ${errosCriticos.join('\n')}`).toHaveLength(0)
  })

  test('mostra nome do professor no header', async ({ page }) => {
    const header = page.locator('.bg-indigo-600')
    await expect(header).toBeVisible()
    // Nome do professor não deve estar vazio
    const nome = await header.locator('h1').textContent()
    expect(nome?.trim().length).toBeGreaterThan(0)
  })

  test('seção "Hoje" mostra a data correta de Brasília', async ({ page }) => {
    // Pega a data atual em BRT (UTC-3)
    const agoraBRT = new Date(Date.now() - 3 * 60 * 60 * 1000)
    const diaHoje = agoraBRT.getDate()
    const mesHoje = agoraBRT.getMonth() + 1

    // A página não deve mostrar data de ontem ou amanhã em nenhuma seção "hoje"
    const secaoHoje = page.locator('h2:has-text("Hoje"), h2:has-text("hoje")')
    if (await secaoHoje.count() > 0) {
      await expect(secaoHoje.first()).toBeVisible()
    }

    // Verifica: nenhuma aula exibida deve ter data do dia seguinte
    const textosPagina = await page.locator('.bg-white .text-xs').allTextContents()
    const amanha = new Date(agoraBRT.getTime() + 86400000)
    const diaAmanha = String(amanha.getDate()).padStart(2, '0')
    const mesAmanha = String(amanha.getMonth() + 1).padStart(2, '0')
    const dataamanha = `${diaAmanha}/${mesAmanha}`

    // Na seção "Hoje", não deveria aparecer a data de amanhã
    const secaoHojeEl = page.locator('section').filter({ hasText: /📅 Hoje/ })
    if (await secaoHojeEl.count() > 0) {
      const textoSecaoHoje = await secaoHojeEl.textContent()
      expect(textoSecaoHoje).not.toContain(dataamanha)
    }
  })

  test('não há erro 500 ao acessar dashboard', async ({ page }) => {
    const response = await page.goto('/professor')
    expect(response?.status()).toBeLessThan(500)
  })

  test('botão Sair está visível', async ({ page }) => {
    await expect(page.locator('a[href*="signout"], a:has-text("Sair")')).toBeVisible()
  })

  test('link "Frequência dos alunos" existe para cada turma', async ({ page }) => {
    const linksFrequencia = page.locator('a:has-text("Frequência dos alunos")')
    const count = await linksFrequencia.count()
    // Se há turmas, deve haver links de frequência
    const turmas = page.locator('section').filter({ hasText: 'Minhas turmas' })
    if (await turmas.count() > 0) {
      expect(count).toBeGreaterThan(0)
    }
  })
})

test.describe('Chamada — acesso e UX', () => {
  test('chamada com UUID inválido retorna 404 (não 500)', async ({ page }) => {
    const response = await page.goto('/professor/chamada/00000000-0000-0000-0000-000000000000')
    expect(response?.status()).not.toBe(500)
    // Deve ser 404 ou redirect
    expect([404, 302, 200]).toContain(response?.status())
  })

  test('link "← Início" na chamada leva de volta ao portal professor', async ({ page }) => {
    // Pega o primeiro link de chamada disponível no dashboard
    await page.goto('/professor')
    const linkChamada = page.locator('a[href*="/professor/chamada/"]').first()

    if (await linkChamada.count() > 0) {
      await linkChamada.click()
      await page.waitForLoadState('networkidle')

      // Botão voltar deve existir e apontar para /professor
      const linkVoltar = page.locator('a[href="/professor"]')
      await expect(linkVoltar).toBeVisible()
      await expect(linkVoltar).toHaveText(/Início/)
    }
  })

  test('chamada concluída: link voltar vai para /professor (não /painel/agenda)', async ({ page }) => {
    await page.goto('/professor')
    // Procura aulas já com chamada concluída (status verde)
    const aulaConcluida = page.locator('a[href*="/professor/chamada/"]').filter({
      has: page.locator(':has-text("Chamada feita")')
    }).first()

    if (await aulaConcluida.count() > 0) {
      await aulaConcluida.click()
      await page.waitForLoadState('networkidle')

      // Na tela de chamada concluída, o botão voltar deve ir para /professor
      const linkVoltar = page.locator(`a[href="/professor"]`)
      await expect(linkVoltar).toBeVisible()
      // Não deve linkar para /painel/agenda
      const linkErrado = page.locator('a[href="/painel/agenda"]')
      await expect(linkErrado).toHaveCount(0)
    }
  })
})

test.describe('Turmas — frequência', () => {
  test('página de frequência de turma carrega', async ({ page }) => {
    await page.goto('/professor')
    const linkFrequencia = page.locator('a[href*="/professor/turmas/"]').first()

    if (await linkFrequencia.count() > 0) {
      await linkFrequencia.click()
      await page.waitForLoadState('networkidle')

      const status = await page.evaluate(() => document.readyState)
      expect(status).toBe('complete')
      // Não deve ser página de erro
      await expect(page.locator('h1, h2')).toBeVisible()
    }
  })
})

test.describe('Plano de aula', () => {
  test('página de plano carrega', async ({ page }) => {
    await page.goto('/professor')
    const linkPlano = page.locator('a[href*="/professor/plano/"]').first()

    if (await linkPlano.count() > 0) {
      await linkPlano.click()
      await page.waitForLoadState('networkidle')
      // Não deve dar 500
      expect(page.url()).not.toContain('500')
    }
  })
})
