/**
 * Setup: abre o login do admin e espera login manual via Google OAuth.
 * Salva a sessão em e2e/.auth/admin.json.
 *
 * Rodar uma vez: npx playwright test --project=setup-admin --headed
 */
import { test as setup, expect } from '@playwright/test'
import path from 'path'

const AUTH_FILE = path.join(__dirname, '../.auth/admin.json')

setup('autenticar admin', async ({ page }) => {
  await page.goto('/painel')

  console.log('\n=== AÇÃO NECESSÁRIA ===')
  console.log('Faça login com Google como admin no browser que abriu.')
  console.log('O teste continuará automaticamente quando o painel aparecer.\n')

  await page.waitForURL('**/painel/dashboard', { timeout: 120000 })
  await expect(page.locator('h1, h2')).toBeVisible()

  await page.context().storageState({ path: AUTH_FILE })
  console.log('✓ Sessão do admin salva.')
})
