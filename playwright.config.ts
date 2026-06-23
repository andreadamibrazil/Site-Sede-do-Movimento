import { defineConfig, devices } from '@playwright/test'

const BASE_URL = 'https://sededomovimento.art'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: 1,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'e2e/report' }]],
  timeout: 20000,

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    ignoreHTTPSErrors: false,
  },

  projects: [
    // Setup: salva sessões autenticadas (roda primeiro)
    {
      name: 'setup-professor',
      testMatch: /professor\.setup\.ts/,
    },
    {
      name: 'setup-admin',
      testMatch: /admin\.setup\.ts/,
    },

    // Testes públicos (sem auth)
    {
      name: 'publico',
      testMatch: /public\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },

    // Testes professor (usa sessão salva)
    {
      name: 'professor',
      testMatch: /professor\.spec\.ts/,
      dependencies: ['setup-professor'],
      use: {
        ...devices['Pixel 7'],  // mobile-first
        storageState: 'e2e/.auth/professor.json',
      },
    },

    // Testes admin/painel
    {
      name: 'painel',
      testMatch: /painel\.spec\.ts/,
      dependencies: ['setup-admin'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/admin.json',
      },
    },
  ],
})
