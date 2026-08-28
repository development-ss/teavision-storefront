import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

import { CONSENT_STORAGE_KEY } from '../../src/lib/consent/storage'
import { blockThirdPartyRequests } from '../mocks/third-party-network'

type StoredConsent = {
  essential: boolean
  analytics: boolean
  marketing: boolean
  updatedAt: string | null
  version: number
}

test.beforeEach(async ({ page }) => {
  await blockThirdPartyRequests(page)
})

async function readStoredConsent(page: Page): Promise<StoredConsent | null> {
  return page.evaluate((key) => {
    const value = window.localStorage.getItem(key)

    return value ? (JSON.parse(value) as StoredConsent) : null
  }, CONSENT_STORAGE_KEY)
}

test('first visit shows the consent banner without stored preferences', async ({
  page,
}) => {
  await page.goto('/')

  await expect(
    page.getByRole('button', { name: 'Accept optional cookies' }),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Reject optional cookies' }),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Manage preferences' }),
  ).toBeVisible()
})

test('Reject optional cookies stores denied optional consent and hides the banner', async ({
  page,
}) => {
  await page.goto('/')
  await page
    .getByRole('button', { name: 'Reject optional cookies' })
    .click()

  await expect(
    page.getByRole('button', { name: 'Reject optional cookies' }),
  ).toHaveCount(0)
  await expect(readStoredConsent(page)).resolves.toMatchObject({
    essential: true,
    analytics: false,
    marketing: false,
    version: 1,
  })
})

test('Accept optional cookies stores granted optional consent and hides the banner', async ({
  page,
}) => {
  await page.goto('/')
  await page
    .getByRole('button', { name: 'Accept optional cookies' })
    .click()

  await expect(
    page.getByRole('button', { name: 'Accept optional cookies' }),
  ).toHaveCount(0)
  await expect(readStoredConsent(page)).resolves.toMatchObject({
    essential: true,
    analytics: true,
    marketing: true,
    version: 1,
  })
})

test('Manage preferences saves analytics independently from marketing', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Manage preferences' }).click()

  const dialog = page.getByRole('dialog', { name: 'Cookie preferences' })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByText('Optional cookies are off')).toBeVisible()

  await dialog.getByRole('checkbox', { name: /Analytics/ }).check()
  await expect(
    dialog.getByRole('checkbox', { name: /Marketing/ }),
  ).not.toBeChecked()
  await dialog
    .getByRole('button', { name: 'Save choices' })
    .click()

  await expect(dialog).toHaveCount(0)
  await expect(readStoredConsent(page)).resolves.toMatchObject({
    essential: true,
    analytics: true,
    marketing: false,
    version: 1,
  })
})

test('/pages/cookie-preferences shows controls after a previous choice', async ({
  page,
}) => {
  await page.goto('/')
  await page
    .getByRole('button', { name: 'Accept optional cookies' })
    .click()

  await page.goto('/pages/cookie-preferences')

  await expect(
    page.getByRole('heading', { name: 'Your cookie choices' }),
  ).toBeVisible()
  await expect(
    page.getByRole('checkbox', { name: /Essential/ }),
  ).toBeChecked()
  await expect(
    page.getByRole('checkbox', { name: /Analytics/ }),
  ).toBeChecked()
  await expect(
    page.getByRole('button', { name: 'Save choices' }),
  ).toBeVisible()
  await expect(page.getByText('Pending owner/legal review')).toHaveCount(0)
})
