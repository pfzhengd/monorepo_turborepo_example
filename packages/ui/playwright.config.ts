import { defineConfig, devices } from '@playwright/test'
import path from 'path'

const packageRoot = path.resolve(__dirname)

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: './test-results',
  reporter: [
    ['html', { outputFolder: './playwright-report' }],
    ['json', { outputFile: './test-results.json' }],
  ],
  webServer: {
    command: 'pnpm storybook',
    url: 'http://127.0.0.1:6006',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    cwd: packageRoot,
  },
  use: {
    baseURL: 'http://127.0.0.1:6006',
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
