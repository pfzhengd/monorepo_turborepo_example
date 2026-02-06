import { defineConfig, devices } from '@playwright/test'

const TARGET = process.env.TARGET
if (!TARGET) {
  throw new Error('Please specify TARGET env: ui | player | features')
}

const configs = {
  player: {
    testDir: './packages/x9player/tests/e2e',
    htmlOutput: './packages/x9player/playwright-report',
    jsonOutput: './packages/x9player/test-results.json',
    webServerCommand: 'pnpm sbk:player',
    port: 6007,
  }
}[TARGET]

export default defineConfig({
  testDir: configs.testDir,

  reporter: [
    ['html', { outputFolder: configs.htmlOutput }],
    ['json', { outputFile: configs.jsonOutput }],
  ],

  webServer: {
    command: configs.webServerCommand,
    url: `http://localhost:${configs.port}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  use: {
    baseURL: `http://localhost:${configs.port}`,
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