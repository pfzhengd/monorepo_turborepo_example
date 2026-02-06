import { test, expect } from '@playwright/test'

test('storybook loads NuiDemo story', async ({ page }) => {
  await page.goto('/?path=/story/components-nuidemo--basic')
  await expect(page.getByText('Hello NUI')).toBeVisible()
})
