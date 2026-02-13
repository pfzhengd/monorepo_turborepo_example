import { defineConfig, devices } from '@playwright/test'

const TARGET = process.env.TARGET || 'ui'

const configs = {
  ui: {
    testDir: './packages/ui/tests/e2e',
    htmlOutput: './packages/ui/playwright-report',
    jsonOutput: './packages/ui/test-results.json',
    webServerCommand: 'pnpm sbk:ui',
    port: 6006,
  }
}

const config = configs[TARGET]
if (!config) {
  throw new Error(`Unknown TARGET: ${TARGET}. Available: ${Object.keys(configs).join(', ')}`)
}

export default defineConfig({
  testDir: config.testDir,

  reporter: [
    ['html', { outputFolder: config.htmlOutput }],
    ['json', { outputFile: config.jsonOutput }],
  ],

  webServer: {
    command: config.webServerCommand,
    url: `http://localhost:${config.port}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  use: {
    baseURL: `http://localhost:${config.port}`,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})