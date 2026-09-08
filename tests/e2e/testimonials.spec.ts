import { expect, test, type Locator } from '@playwright/test'

import { blockThirdPartyRequests } from '../mocks/third-party-network'

const path = '/pages/tea-bag-manufacturer'

async function animationState(track: Locator) {
  return track.evaluate(
    (element) => getComputedStyle(element).animationPlayState,
  )
}

test.beforeEach(async ({ page }) => {
  await blockThirdPartyRequests(page)
})

test('desktop testimonials move, pause on hover/focus, and retain the chosen pause state', async ({
  page,
}) => {
  await page.goto(path)
  const region = page.getByRole('region', {
    name: 'Customer testimonial excerpts',
  })
  const track = region.locator(':scope > div')
  const pause = page.getByRole('checkbox', {
    name: 'Pause or resume automatic scrolling',
  })
  await region.scrollIntoViewIfNeeded()
  await page.mouse.move(0, 0)

  await expect(track).toHaveCSS('animation-name', 'marquee')
  const initialTransform = await track.evaluate(
    (element) => getComputedStyle(element).transform,
  )
  await expect
    .poll(() =>
      track.evaluate((element) => getComputedStyle(element).transform),
    )
    .not.toBe(initialTransform)

  await region.hover()
  await expect.poll(() => animationState(track)).toBe('paused')
  await page.mouse.move(0, 0)
  await expect.poll(() => animationState(track)).toBe('running')

  await pause.focus()
  await expect.poll(() => animationState(track)).toBe('paused')
  await page.keyboard.press('Space')
  await expect(pause).toBeChecked()
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  await expect.poll(() => animationState(track)).toBe('paused')

  await pause.focus()
  await page.keyboard.press('Space')
  await expect(pause).not.toBeChecked()
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  await page.mouse.move(0, 0)
  await expect.poll(() => animationState(track)).toBe('running')
})

test('the loop joins without a gap and duplicate cards are excluded from accessibility', async ({
  page,
}) => {
  await page.goto(path)
  const region = page.getByRole('region', {
    name: 'Customer testimonial excerpts',
  })
  await region.scrollIntoViewIfNeeded()
  await expect(region.getByRole('listitem')).toHaveCount(4)
  await expect(region.locator('ul[inert][aria-hidden="true"]')).toHaveCount(1)

  const seam = await region.evaluate((element) => {
    const track = element.firstElementChild!
    const animation = track.getAnimations()[0]
    animation.pause()
    const lists = track.querySelectorAll('ul')
    const duration = Number(animation.effect!.getTiming().duration)
    animation.currentTime = duration - 1
    const before = lists[1].getBoundingClientRect().left
    animation.currentTime = duration
    const after = lists[0].getBoundingClientRect().left
    return {
      distance: Math.abs(before - after),
      widths: [...lists].map((list) => list.getBoundingClientRect().width),
    }
  })
  expect(seam.widths[0]).toBe(seam.widths[1])
  expect(seam.distance).toBeLessThan(1)
})

test('reduced motion displays every testimonial in a static grid', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(path)
  const region = page.getByRole('region', {
    name: 'Customer testimonial excerpts',
  })
  await expect(region.locator(':scope > div')).toHaveCSS(
    'animation-name',
    'none',
  )
  await expect(region.locator('ul[inert]')).toBeHidden()
  await expect(
    page.getByRole('checkbox', { name: 'Pause or resume automatic scrolling' }),
  ).toBeHidden()
  const list = region.getByRole('list', { name: 'Partner testimonials' })
  await expect(list).toHaveCSS('display', 'grid')
  for (const card of await list.getByRole('listitem').all()) await expect(card).toBeVisible()
  expect(await region.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true)
})

test('mobile cards use a readable grid without page overflow', async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  })
  const page = await context.newPage()
  await blockThirdPartyRequests(page)
  await page.goto(
    `http://127.0.0.1:${process.env.PLAYWRIGHT_PORT ?? '4173'}${path}`,
  )
  const region = page.getByRole('region', {
    name: 'Customer testimonial excerpts',
  })
  await region.scrollIntoViewIfNeeded()
  await expect(region.locator(':scope > div')).toHaveCSS(
    'animation-name',
    'none',
  )
  const list = region.getByRole('list', { name: 'Partner testimonials' })
  await expect(list).toHaveCSS('display', 'grid')
  await expect(region.locator('ul[inert]')).toBeHidden()
  for (const card of await list.getByRole('listitem').all()) {
    await expect(card).toBeVisible()
    const box = await card.boundingBox()
    expect(box?.x).toBeGreaterThanOrEqual(0)
    expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(390)
  }
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true)
  await context.close()
})

test('pause remains usable with JavaScript disabled', async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 1440, height: 900 },
  })
  const page = await context.newPage()
  await blockThirdPartyRequests(page)
  await page.goto(
    `http://127.0.0.1:${process.env.PLAYWRIGHT_PORT ?? '4173'}${path}`,
  )
  const section = page.getByRole('region', {
    name: 'Customer testimonials',
    exact: true,
  })
  const pause = section.getByRole('checkbox', {
    name: 'Pause or resume automatic scrolling',
  })
  await pause.focus()
  await page.keyboard.press('Space')
  await expect(pause).toBeChecked()
  await context.close()
})

test('the homepage integrates CMS testimonial cards', async ({ page }) => {
  await page.goto('/')
  const section = page.getByRole('region', {
    name: 'Customer testimonials',
    exact: true,
  })
  await expect(
    section.getByRole('list', { name: 'Partner testimonials' }),
  ).toBeAttached()
  await expect(section.locator('blockquote').first()).toBeVisible()
})
