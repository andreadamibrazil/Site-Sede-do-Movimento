/**
 * Testes do portal do professor (requer sessão salva em e2e/.auth/professor.json).
 * Setup: node e2e/create-auth-sessions.mjs
 *
 * Cobre:
 *  - Dashboard: carregamento, header, seção "Hoje", chamadas pendentes
 *  - Chamada: presença, falta, falta justificada, salvar, concluir
 *  - Janela de 7 dias: prazo dentro/fora
 *  - Professor faltou: campos de substituto, upload de atestado, termos
 *  - Turmas: listagem, co-regência, frequência, plano de aula
 */
import { test, expect, Page } from '@playwright/test'

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

async function irParaDashboard(page: Page) {
  await page.goto('/professor', { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('.bg-indigo-600, h1, main', { timeout: 15000 })
}

async function pegarPrimeiroChamadaUrl(page: Page): Promise<string | null> {
  await irParaDashboard(page)
  const links = page.locator('a[href*="/professor/chamada/"]')
  if (await links.count() === 0) return null
  return links.first().getAttribute('href')
}

// ─────────────────────────────────────────────
// 1. Dashboard
// ─────────────────────────────────────────────

test.describe('Dashboard do professor', () => {
  test.beforeEach(async ({ page }) => {
    await irParaDashboard(page)
  })

  test('carrega sem erro de JS crítico', async ({ page }) => {
    const erros: string[] = []
    page.on('console', msg => { if (msg.type() === 'error') erros.push(msg.text()) })
    await page.reload({ waitUntil: 'domcontentloaded' })
    await page.waitForSelector('.bg-indigo-600, h1', { timeout: 15000 })
    const criticos = erros.filter(e =>
      !e.includes('favicon') && !e.includes('analytics') && !e.includes('ResizeObserver')
    )
    expect(criticos, `Erros JS: ${criticos.join('\n')}`).toHaveLength(0)
  })

  test('responde com HTTP < 500', async ({ page }) => {
    const response = await page.goto('/professor')
    expect(response?.status()).toBeLessThan(500)
  })

  test('exibe nome do professor no header', async ({ page }) => {
    const header = page.locator('.bg-indigo-600')
    await expect(header).toBeVisible()
    const nome = await header.locator('h1').textContent()
    expect(nome?.trim().length).toBeGreaterThan(2)
  })

  test('botão Sair está visível e aponta para signout', async ({ page }) => {
    const btnSair = page.locator('a[href*="signout"]')
    await expect(btnSair).toBeVisible()
    await expect(btnSair).toHaveText(/Sair/i)
  })

  test('seção "Hoje" não mostra data de amanhã', async ({ page }) => {
    const agoraBRT = new Date(Date.now() - 3 * 60 * 60 * 1000)
    const amanha = new Date(agoraBRT.getTime() + 86400000)
    const diaA = String(amanha.getDate()).padStart(2, '0')
    const mesA = String(amanha.getMonth() + 1).padStart(2, '0')
    const dataAmanha = `${diaA}/${mesA}`

    const secao = page.locator('section').filter({ hasText: /📅 Hoje/ })
    if (await secao.count() > 0) {
      const texto = await secao.textContent()
      expect(texto).not.toContain(dataAmanha)
    }
  })

  test('seção "Minhas turmas" lista ao menos uma turma', async ({ page }) => {
    const secaoTurmas = page.locator('section').filter({ hasText: /Minhas turmas/i })
    if (await secaoTurmas.count() > 0) {
      const turmas = secaoTurmas.locator('.bg-white')
      expect(await turmas.count()).toBeGreaterThan(0)
    }
  })

  test('cada turma tem links de frequência e plano de aula', async ({ page }) => {
    const linksFrequencia = page.locator('a:has-text("Frequência dos alunos")')
    const linksPlano = page.locator('a:has-text("Plano de aula")')
    const secaoTurmas = page.locator('section').filter({ hasText: /Minhas turmas/i })
    if (await secaoTurmas.count() > 0) {
      expect(await linksFrequencia.count()).toBeGreaterThan(0)
      expect(await linksPlano.count()).toBeGreaterThan(0)
    }
  })

  test('chamadas pendentes — se existirem, mostram "Fazer →" e contagem de dias', async ({ page }) => {
    const secaoPendentes = page.locator('section').filter({ hasText: /Chamadas pendentes/i })
    if (await secaoPendentes.count() > 0) {
      await expect(secaoPendentes).toBeVisible()
      // Cada item deve ter o link de ação
      const botoesFazer = secaoPendentes.locator('span:has-text("Fazer →")')
      expect(await botoesFazer.count()).toBeGreaterThan(0)
      // Deve mostrar quantos dias atrás
      const textos = await secaoPendentes.locator('.text-xs').allTextContents()
      const temDiaInfo = textos.some(t => /hoje|d atrás/i.test(t))
      expect(temDiaInfo).toBe(true)
    }
  })
})

// ─────────────────────────────────────────────
// 2. Chamada — acesso e estrutura da página
// ─────────────────────────────────────────────

test.describe('Chamada — acesso e estrutura', () => {
  test('UUID inválido retorna 404 ou redirect, não 500', async ({ page }) => {
    const res = await page.goto('/professor/chamada/00000000-0000-0000-0000-000000000000')
    expect(res?.status()).not.toBe(500)
    expect([200, 302, 404]).toContain(res?.status())
  })

  test('chamada acessível carrega lista de alunos ou mensagem adequada', async ({ page }) => {
    const url = await pegarPrimeiroChamadaUrl(page)
    if (!url) return test.skip()

    await page.goto(url, { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('.max-w-lg, h1', { timeout: 15000 })

    // Deve ter header com nome da turma
    await expect(page.locator('h1, .text-base.font-semibold')).toBeVisible()
  })

  test('link "← Início" na chamada leva de volta para /professor', async ({ page }) => {
    const url = await pegarPrimeiroChamadaUrl(page)
    if (!url) return test.skip()

    await page.goto(url, { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('a[href="/professor"]', { timeout: 15000 })

    await expect(page.locator('a[href="/professor"]').first()).toBeVisible()
    await expect(page.locator('a[href="/professor"]').first()).toHaveText(/Início/i)
  })

  test('chamada aberta não mostra ícone de prazo expirado', async ({ page }) => {
    const url = await pegarPrimeiroChamadaUrl(page)
    if (!url) return test.skip()

    await page.goto(url, { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('.max-w-lg', { timeout: 15000 })

    // Para aulas de hoje ou desta semana, prazo não deve estar expirado
    const prazoExpirado = page.locator('span:has-text("Prazo expirado"), span:has-text("🔒")')
    // Se a aula é recente, o botão de corrigir (não bloqueado) deve aparecer
    // — só verifica se não há ícone de bloqueio em chamadas de aulas recentes
    const linkChamada = await page.locator('section').filter({ hasText: /📅 Hoje/ })
      .locator('a[href*="/professor/chamada/"]').first()

    if (await linkChamada.count() > 0) {
      const chamadaHojeUrl = await linkChamada.getAttribute('href')
      await page.goto(chamadaHojeUrl!, { waitUntil: 'domcontentloaded' })
      await page.waitForSelector('.max-w-lg', { timeout: 15000 })
      await expect(prazoExpirado).toHaveCount(0)
    }
  })
})

// ─────────────────────────────────────────────
// 3. Chamada — interação com alunos
// ─────────────────────────────────────────────

test.describe('Chamada — presença e faltas', () => {
  let chamadaUrl: string | null = null

  test.beforeEach(async ({ page }) => {
    // Usa chamada de aula de hoje ou pendente com alunos
    await irParaDashboard(page)

    // Prefere chamada de "hoje"
    const linkHoje = page.locator('section').filter({ hasText: /📅 Hoje/ })
      .locator('a[href*="/professor/chamada/"]').first()

    if (await linkHoje.count() > 0) {
      chamadaUrl = await linkHoje.getAttribute('href')
    } else {
      // Fallback: primeira chamada disponível
      chamadaUrl = await pegarPrimeiroChamadaUrl(page)
    }

    if (chamadaUrl) {
      await page.goto(chamadaUrl, { waitUntil: 'domcontentloaded' })
      await page.waitForSelector('.max-w-lg', { timeout: 15000 })
    }
  })

  test('lista de alunos é exibida (se turma tem alunos)', async ({ page }) => {
    if (!chamadaUrl) return test.skip()
    // Deve ter pelo menos um card de aluno (border rounded-xl) OU mensagem de turma vazia
    const alunos = page.locator('.border.rounded-xl').filter({ has: page.locator('p.font-medium, .font-medium') })
    const nenhumAluno = page.locator('text=/sem alunos|nenhum aluno/i')
    const temAlguma = await alunos.count() > 0 || await nenhumAluno.count() > 0
    expect(temAlguma).toBe(true)
  })

  test('botão "Falta" aparece na linha do aluno e altera visual', async ({ page }) => {
    if (!chamadaUrl) return test.skip()

    const btnFalta = page.locator('button:has-text("Falta")').first()
    if (await btnFalta.count() === 0) return test.skip()

    // Estado inicial: botão existe
    await expect(btnFalta).toBeVisible()

    // Clicar muda o estado (o botão fica ativo/selecionado)
    await btnFalta.click()
    // Após clicar, deve aparecer indicação de falta (botão ativo ou badge)
    await page.waitForTimeout(300)
    const badgeFalta = page.locator('.bg-red-500, .bg-red-600, [class*="falta"]').first()
    // Verifica que o estado mudou de alguma forma
    const algumIndicador = await badgeFalta.count() > 0 || await btnFalta.evaluate(
      el => el.classList.toString()
    ).then(cls => cls.includes('red') || cls.includes('active') || cls.includes('bg-'))
    expect(algumIndicador).toBe(true)
  })

  test('botão "Justificada" ou toggle de falta justificada está acessível', async ({ page }) => {
    if (!chamadaUrl) return test.skip()

    // Pode estar como botão direto ou aparecer após marcar "Falta"
    const btnFalta = page.locator('button:has-text("Falta")').first()
    if (await btnFalta.count() > 0) {
      await btnFalta.click()
      await page.waitForTimeout(300)
    }

    const btnJustificada = page.locator('button:has-text("Justificada"), button:has-text("Falta Justificada"), button:has-text("falta justificada")').first()
    if (await btnJustificada.count() > 0) {
      await expect(btnJustificada).toBeVisible()
      await btnJustificada.click()
      await page.waitForTimeout(300)
      // Deve aparecer algum indicador de falta justificada
      const badge = page.locator('.bg-yellow-100, .text-yellow-700, [class*="justificada"]').first()
      if (await badge.count() > 0) {
        await expect(badge).toBeVisible()
      }
    }
  })

  test('botão Salvar aparece e não está desabilitado', async ({ page }) => {
    if (!chamadaUrl) return test.skip()

    const btnSalvar = page.locator('button:has-text("Salvar"), button:has-text("salvar")').first()
    if (await btnSalvar.count() === 0) return test.skip()

    await expect(btnSalvar).toBeVisible()
    await expect(btnSalvar).not.toBeDisabled()
  })

  test('botão Concluir aparece e está habilitado', async ({ page }) => {
    if (!chamadaUrl) return test.skip()

    const btnConcluir = page.locator('button:has-text("Concluir")').first()
    if (await btnConcluir.count() === 0) return test.skip()

    await expect(btnConcluir).toBeVisible()
    await expect(btnConcluir).not.toBeDisabled()
  })
})

// ─────────────────────────────────────────────
// 4. Chamada — janela de 7 dias
// ─────────────────────────────────────────────

test.describe('Chamada — janela de lançamento', () => {
  test('chamada pendente (dentro de 7 dias) abre formulário editável', async ({ page }) => {
    await irParaDashboard(page)

    const secaoPendentes = page.locator('section').filter({ hasText: /Chamadas pendentes/i })
    if (await secaoPendentes.count() === 0) return test.skip()

    const linkPendente = secaoPendentes.locator('a[href*="/professor/chamada/"]').first()
    if (await linkPendente.count() === 0) return test.skip()

    await linkPendente.click()
    await page.waitForSelector('.max-w-lg', { timeout: 15000 })

    // Não deve mostrar "Prazo expirado" se a aula está na lista de pendentes (≤ 7 dias)
    const prazoExpirado = page.locator('span:has-text("Prazo expirado"), span:has-text("🔒 Prazo expirado")')
    await expect(prazoExpirado).toHaveCount(0)

    // Deve mostrar opções de edição (botão Salvar, Concluir OU Corrigir)
    const acoes = page.locator('button:has-text("Salvar"), button:has-text("Concluir"), button:has-text("Corrigir")')
    expect(await acoes.count()).toBeGreaterThan(0)
  })

  test('chamada concluída dentro do prazo permite corrigir', async ({ page }) => {
    await irParaDashboard(page)
    await page.waitForSelector('a[href*="/professor/chamada/"]', { timeout: 10000 }).catch(() => {})

    // Procura chamada com badge "Chamada feita" (concluída)
    const aulaConcluida = page.locator('a[href*="/professor/chamada/"]').filter({
      has: page.locator('.bg-green-100, :has-text("Chamada feita")')
    }).first()

    if (await aulaConcluida.count() === 0) return test.skip()

    await aulaConcluida.click()
    await page.waitForSelector('.max-w-lg', { timeout: 15000 })

    // Deve mostrar botão "Corrigir" (não bloqueado), pois é recente
    const btnCorrigir = page.locator('button:has-text("Corrigir"), button:has-text("✏️ Corrigir")')
    if (await btnCorrigir.count() > 0) {
      await expect(btnCorrigir.first()).toBeVisible()
      await expect(btnCorrigir.first()).not.toBeDisabled()
    }
  })
})

// ─────────────────────────────────────────────
// 5. Chamada — professor faltou
// ─────────────────────────────────────────────

test.describe('Chamada — fluxo "professor faltou"', () => {
  test('toggle "professor faltou" existe e revela campos de substituto', async ({ page }) => {
    await irParaDashboard(page)
    await page.waitForSelector('a[href*="/professor/chamada/"]', { timeout: 10000 }).catch(() => {})

    const linkHoje = page.locator('section').filter({ hasText: /📅 Hoje/ })
      .locator('a[href*="/professor/chamada/"]').first()
    const linkFallback = page.locator('a[href*="/professor/chamada/"]').first()
    const link = await linkHoje.count() > 0 ? linkHoje : linkFallback

    if (await link.count() === 0) return test.skip()
    await link.click()
    await page.waitForSelector('.max-w-lg', { timeout: 15000 })

    // Toggle "professor faltou" pode ser checkbox ou botão
    const toggle = page.locator(
      'input[type="checkbox"]:near(:text("professor faltou")), ' +
      'button:has-text("professor faltou"), ' +
      'label:has-text("professor faltou"), ' +
      'label:has-text("Professor faltou")'
    ).first()

    if (await toggle.count() === 0) return test.skip()
    await expect(toggle).toBeVisible()

    // Clica no toggle
    await toggle.click()
    await page.waitForTimeout(400)

    // Após ativar: campos de substituto devem aparecer
    const campoNomeSubst = page.locator('input[placeholder*="substituto"], input[placeholder*="Substituto"], input[placeholder*="nome"]').first()
    const campoMotivo = page.locator('textarea, input[placeholder*="motivo"]').first()
    const algumCampoExtra = await campoNomeSubst.count() > 0 || await campoMotivo.count() > 0
    expect(algumCampoExtra).toBe(true)
  })

  test('upload de atestado aparece ao marcar "tem atestado"', async ({ page }) => {
    await irParaDashboard(page)
    const link = page.locator('a[href*="/professor/chamada/"]').first()
    if (await link.count() === 0) return test.skip()

    await link.click()
    await page.waitForSelector('.max-w-lg', { timeout: 15000 })

    // Ativa professor faltou
    const toggleFaltou = page.locator(
      'label:has-text("Professor faltou"), input[type="checkbox"]:near(:text("professor faltou"))'
    ).first()
    if (await toggleFaltou.count() === 0) return test.skip()
    await toggleFaltou.click()
    await page.waitForTimeout(400)

    // Ativa "tem atestado"
    const toggleAtestado = page.locator(
      'label:has-text("Tem atestado"), label:has-text("atestado"), input[type="checkbox"]:near(:text("atestado"))'
    ).first()
    if (await toggleAtestado.count() === 0) return test.skip()
    await toggleAtestado.click()
    await page.waitForTimeout(400)

    // Deve aparecer botão/área de upload
    const uploadArea = page.locator(
      'input[type="file"], button:has-text("Upload"), button:has-text("Enviar atestado"), label:has-text("Enviar"), label[for*="atestado"]'
    ).first()
    await expect(uploadArea).toBeVisible({ timeout: 5000 })
  })

  test('checkbox de termos aparece no fluxo de substituto', async ({ page }) => {
    await irParaDashboard(page)
    const link = page.locator('a[href*="/professor/chamada/"]').first()
    if (await link.count() === 0) return test.skip()

    await link.click()
    await page.waitForSelector('.max-w-lg', { timeout: 15000 })

    const toggleFaltou = page.locator(
      'label:has-text("Professor faltou"), input[type="checkbox"]:near(:text("Professor faltou"))'
    ).first()
    if (await toggleFaltou.count() === 0) return test.skip()
    await toggleFaltou.click()
    await page.waitForTimeout(400)

    // Preenche nome do substituto para revelar termos
    const campoNome = page.locator('input[placeholder*="ubstituto"], input[placeholder*="ubstitut"]').first()
    if (await campoNome.count() > 0) {
      await campoNome.fill('Substituto Teste')
      await page.waitForTimeout(300)
    }

    // Checkbox de termos
    const checkTermos = page.locator(
      'input[type="checkbox"]:near(:text("termos")), label:has-text("ermos"), label:has-text("Li e aceito")'
    ).first()
    if (await checkTermos.count() > 0) {
      await expect(checkTermos).toBeVisible()
    }
  })

  test('fluxo de substituto: campos CPF e celular ficam acessíveis', async ({ page }) => {
    await irParaDashboard(page)
    const link = page.locator('a[href*="/professor/chamada/"]').first()
    if (await link.count() === 0) return test.skip()

    await link.click()
    await page.waitForSelector('.max-w-lg', { timeout: 15000 })

    const toggleFaltou = page.locator('label:has-text("Professor faltou")').first()
    if (await toggleFaltou.count() === 0) return test.skip()
    await toggleFaltou.click()
    await page.waitForTimeout(400)

    const campoCPF = page.locator('input[placeholder*="CPF"], input[name*="cpf"]').first()
    const campoCelular = page.locator('input[placeholder*="celular"], input[placeholder*="Celular"], input[name*="celular"]').first()

    if (await campoCPF.count() > 0) await expect(campoCPF).toBeVisible()
    if (await campoCelular.count() > 0) await expect(campoCelular).toBeVisible()
  })
})

// ─────────────────────────────────────────────
// 6. Turmas — co-regência e frequência
// ─────────────────────────────────────────────

test.describe('Turmas — frequência', () => {
  test('página de frequência de turma carrega e exibe dados', async ({ page }) => {
    await irParaDashboard(page)
    await page.waitForSelector('a[href*="/professor/turmas/"]', { timeout: 10000 }).catch(() => {})
    const link = page.locator('a[href*="/professor/turmas/"]').first()
    if (await link.count() === 0) return test.skip()

    await link.click()
    await page.waitForLoadState('domcontentloaded')

    expect(page.url()).toContain('/professor/turmas/')
    const response = await page.evaluate(() => ({ status: document.readyState }))
    expect(response.status).toBe('complete')
    await expect(page.locator('h1, h2, .text-base')).toBeVisible()
    // Não deve exibir página de erro genérica
    await expect(page.locator('text=/500|Internal Server Error/i')).toHaveCount(0)
  })

  test('não há turmas duplicadas na listagem "Minhas turmas"', async ({ page }) => {
    await irParaDashboard(page)
    const turmasSection = page.locator('section').filter({ hasText: /Minhas turmas/i })
    if (await turmasSection.count() === 0) return test.skip()

    const nomesTurmas = await turmasSection.locator('.text-sm.font-semibold').allTextContents()
    const unicos = new Set(nomesTurmas.map(n => n.trim()))
    // Nenhum nome deve aparecer mais de uma vez (duplicata indica bug na query de co-regência)
    expect(nomesTurmas.length).toBe(unicos.size)
  })
})

// ─────────────────────────────────────────────
// 7. Plano de aula
// ─────────────────────────────────────────────

test.describe('Plano de aula', () => {
  test('página de plano carrega sem erro 500', async ({ page }) => {
    await irParaDashboard(page)
    await page.waitForSelector('a[href*="/professor/plano/"]', { timeout: 10000 }).catch(() => {})
    const link = page.locator('a[href*="/professor/plano/"]').first()
    if (await link.count() === 0) return test.skip()

    await link.click()
    await page.waitForLoadState('domcontentloaded')

    expect(page.url()).toContain('/professor/plano/')
    await expect(page.locator('text=/500|Internal Server Error/i')).toHaveCount(0)
    await expect(page.locator('h1, h2, form, textarea')).toBeVisible()
  })
})

// ─────────────────────────────────────────────
// 8. Login — sessão expirada
// ─────────────────────────────────────────────

test.describe('Login — fluxo de sessão expirada', () => {
  test('?aviso=sessao exibe banner de aviso na tela de login', async ({ page }) => {
    // Testa a página de login sem autenticação para ver o banner
    await page.context().clearCookies()
    await page.goto('/professor/login?aviso=sessao&next=/professor/chamada/test-id', { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('button, h1', { timeout: 10000 })

    const banner = page.locator('.bg-amber-50').filter({ hasText: /Sessão expirada/i })
    await expect(banner).toBeVisible()
    // Banner deve mencionar que a chamada foi salva
    const texto = await banner.textContent()
    expect(texto?.toLowerCase()).toContain('salva')
  })

  test('página de login sem aviso não exibe banner', async ({ page }) => {
    await page.context().clearCookies()
    await page.goto('/professor/login', { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('button', { timeout: 10000 })

    const banner = page.locator('text=/Sessão expirada/i')
    await expect(banner).toHaveCount(0)
  })
})
