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
    // Testes públicos (sem auth)
    {
      name: 'publico',
      testMatch: /public\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },

    // Testes professor — sessão criada por e2e/create-auth-sessions.mjs
    {
      name: 'professor',
      testMatch: /professor\.spec\.ts/,
      use: {
        ...devices['Pixel 7'],  // mobile-first
        storageState: 'e2e/.auth/professor.json',
      },
    },

    // Testes admin/painel — sessão criada por e2e/create-auth-sessions.mjs
    {
      name: 'painel',
      testMatch: /painel\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/admin.json',
      },
    },
  ],
})
