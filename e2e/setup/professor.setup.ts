/**
 * Setup: abre o login do professor no browser e espera o usuário fazer login manualmente.
 * Salva a sessão em e2e/.auth/professor.json para reutilizar nos testes.
 *
 * Rodar uma vez: npx playwright test --project=setup-professor --headed
 */
import { test as setup, expect } from '@playwright/test'
import path from 'path'

const AUTH_FILE = path.join(__dirname, '../.auth/professor.json')

setup('autenticar professor', async ({ page }) => {
  await page.goto('/professor/login')
  await expect(page).toHaveTitle(/[Pp]rofessor|[Ll]ogin|[Ss]ede/)

  console.log('\n=== AÇÃO NECESSÁRIA ===')
  console.log('Faça login como professor no browser que abriu.')
  console.log('O teste continuará automaticamente quando o dashboard aparecer.\n')

  // Aguarda o dashboard do professor (timeout generoso para login manual)
  await page.waitForURL('**/professor', { timeout: 120000 })
  await expect(page.locator('h1')).toBeVisible()

  await page.context().storageState({ path: AUTH_FILE })
  console.log('✓ Sessão do professor salva.')
})
