import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test'

import { MegaNav } from './desktop'
import { SERVICES_LINKS, SHOP_SECTIONS, type ShopKey } from './data'
import { MobileMegaNav } from './mobile'
import { MobileServicesPanel } from './services/mobile-panel'
import { MobileShopPanel } from './shop/mobile-panel'
import { ServicesMegaPanel } from './services/panel'
import { ShopMegaPanel } from './shop/panel'

// Representative server props; production names and handles come from Shopify.
const shopSections = SHOP_SECTIONS.map((section) => ({
  ...section,
  links: section.productCollectionHandle
    ? Array.from({ length: 14 }, (_, index) => ({
        href:
          index === 0
            ? '/products/example-' + section.key
            : `/products/example-${section.key}-${index}`,
        label:
          index === 0
            ? 'Example ' + section.name
            : `Premium Certified Organic Ingredient ${index} (Wholesale Powder 15kg)`,
      }))
    : section.links,
}))
const activeShop = shopSections[2] ?? shopSections[0]!

function ignoreShopKey(key: ShopKey) {
  void key
}

function noop() {}

function StoryPanelFrame({ children }: { children: ReactNode }) {
  return <div className="bg-paper relative min-h-80">{children}</div>
}

const meta: Meta<typeof MegaNav> = {
  title: 'Layout/Header/Mega Nav',
  component: MegaNav,
  args: { shopSections },
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true },
  },
  decorators: [
    (Story) => (
      <div className="bg-paper p-8">
        <div className="max-w-wide mx-auto">
          <Story />
        </div>
      </div>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof MegaNav>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const shopButton = canvasElement.querySelector<HTMLButtonElement>(
      'button[aria-controls="shop-mega"]',
    )
    if (!shopButton) throw new Error('Shop disclosure button not found')

    await userEvent.click(shopButton)
    await new Promise((resolve) => window.requestAnimationFrame(resolve))

    const shopPanel = document.querySelector<HTMLElement>('#shop-mega')
    if (!shopPanel || shopPanel.hidden) {
      throw new Error('Shop mega panel did not open')
    }

    await userEvent.click(shopButton)
    await new Promise((resolve) => window.requestAnimationFrame(resolve))

    if (
      !shopPanel.hidden ||
      shopButton.getAttribute('aria-expanded') !== 'false'
    ) {
      throw new Error('Shop mega panel did not close on second click')
    }

    await userEvent.click(shopButton)
    await new Promise((resolve) => window.requestAnimationFrame(resolve))

    const servicesButton = canvasElement.querySelector<HTMLButtonElement>(
      'button[aria-controls="services-menu"]',
    )
    if (!servicesButton) throw new Error('Services disclosure button not found')

    await userEvent.click(servicesButton)
    await new Promise((resolve) => window.requestAnimationFrame(resolve))

    const servicesPanel = document.querySelector<HTMLElement>('#services-menu')
    if (!servicesPanel || servicesPanel.hidden) {
      throw new Error('Services mega panel did not open')
    }

    if (!shopPanel.hidden) {
      throw new Error('Opening services did not close the shop mega panel')
    }

    document.dispatchEvent(
      new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }),
    )
    await new Promise((resolve) => window.requestAnimationFrame(resolve))

    if (!servicesPanel.hidden) {
      throw new Error('Services mega panel did not close on Escape')
    }

    const shopItem = shopButton.closest('li')
    const servicesItem = servicesButton.closest('li')
    const shopLabel = shopButton.querySelector('span')
    const servicesLabel = servicesButton.querySelector('span')
    const servicesArrow = servicesButton.querySelector('svg')
    if (
      !shopItem ||
      !servicesItem ||
      !shopLabel ||
      !servicesLabel ||
      !servicesArrow
    ) {
      throw new Error('Desktop mega menu hover targets not found')
    }

    fireEvent.mouseOver(shopLabel)
    await new Promise((resolve) => window.requestAnimationFrame(resolve))

    if (shopPanel.hidden) {
      throw new Error('Shop mega panel did not open from its label')
    }

    fireEvent.mouseOut(shopItem, { relatedTarget: servicesItem })
    fireEvent.mouseOver(servicesItem, { relatedTarget: shopItem })
    await new Promise((resolve) => window.setTimeout(resolve, 250))

    if (shopPanel.hidden || !servicesPanel.hidden) {
      throw new Error('Services padding changed the open menu')
    }

    fireEvent.mouseOver(servicesArrow)
    await new Promise((resolve) => window.requestAnimationFrame(resolve))

    if (!shopPanel.hidden || servicesPanel.hidden) {
      throw new Error('Services arrow did not switch menus')
    }

    await userEvent.click(servicesButton)
    await new Promise((resolve) => window.requestAnimationFrame(resolve))

    if (
      servicesPanel.hidden ||
      servicesButton.getAttribute('aria-expanded') !== 'true'
    ) {
      throw new Error('First click did not confirm the hover-opened menu')
    }

    await userEvent.click(servicesButton)
    await new Promise((resolve) => window.requestAnimationFrame(resolve))

    if (!servicesPanel.hidden) {
      throw new Error('Second click did not close the confirmed menu')
    }
  },
}

export const Mobile: StoryObj<typeof MobileMegaNav> = {
  render: () => (
    <MobileMegaNav shopSections={shopSections} open onClose={() => {}} />
  ),
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  play: async ({ canvasElement }) => {
    const shopButton = canvasElement.querySelector<HTMLButtonElement>(
      'button[aria-controls="mobile-shop-mega"]',
    )
    if (!shopButton) throw new Error('Mobile shop disclosure button not found')

    shopButton.click()
    await new Promise((resolve) => window.requestAnimationFrame(resolve))

    const shopPanel =
      canvasElement.querySelector<HTMLElement>('#mobile-shop-mega')
    if (!shopPanel || shopPanel.hidden) {
      throw new Error('Mobile shop panel did not open')
    }

    const shopCategoryButtons = shopPanel.querySelectorAll('button')
    shopCategoryButtons[2]?.click()
    await new Promise((resolve) => window.requestAnimationFrame(resolve))

    const herbsPanel = canvasElement.querySelector<HTMLElement>(
      '#mobile-shop-panel-herbs-spices',
    )
    if (!herbsPanel) {
      throw new Error('Mobile shop category change did not update the panel')
    }
    await expect(
      within(herbsPanel).getByRole('link', { name: 'Example Herbs & Spices' }),
    ).toHaveAttribute('href', '/products/example-herbs-spices')
    await userEvent.click(
      within(shopPanel).getByRole('button', { name: 'Superfood Powders' }),
    )
    await expect(
      within(shopPanel).getByRole('link', {
        name: 'Example Superfood Powders',
      }),
    ).toHaveAttribute('href', '/products/example-superfood-powders')

    const servicesButton = canvasElement.querySelector<HTMLButtonElement>(
      'button[aria-controls="mobile-services-mega"]',
    )
    if (!servicesButton) {
      throw new Error('Mobile services disclosure button not found')
    }

    servicesButton.click()
    await new Promise((resolve) => window.requestAnimationFrame(resolve))

    const servicesPanel = canvasElement.querySelector<HTMLElement>(
      '#mobile-services-mega',
    )
    if (!servicesPanel || servicesPanel.hidden) {
      throw new Error('Mobile services panel did not open')
    }

    if (!shopPanel.hidden) {
      throw new Error('Opening mobile services did not close shop panel')
    }
  },
}

export const DesktopShopOpen: Story = {
  render: () => (
    <StoryPanelFrame>
      <ShopMegaPanel
        activeShop={activeShop}
        onActiveShopChange={ignoreShopKey}
        onClose={noop}
        open
        pathname="/collections/herbs-and-spices"
      />
    </StoryPanelFrame>
  ),
}

export const CollectionProductLinks: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Shop' }))
    for (const section of shopSections.filter(
      (item) => item.productCollectionHandle,
    )) {
      await userEvent.click(canvas.getByRole('button', { name: section.name }))
      for (const link of section.links) {
        await expect(
          canvas.getByRole('link', { name: link.label }),
        ).toHaveAttribute('href', link.href)
      }
      await expect(
        canvas.getByRole('link', { name: 'View all ' + section.name }),
      ).toHaveAttribute('href', section.ctaHref)
    }
  },
}

export const DesktopServicesOpen: Story = {
  render: () => (
    <StoryPanelFrame>
      <ServicesMegaPanel
        activeService={SERVICES_LINKS[1]!}
        onActiveServiceChange={noop}
        onClose={noop}
        open
        pathname="/pages/private-label-packing"
      />
    </StoryPanelFrame>
  ),
}

export const ServiceImagePreviews: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    for (const service of SERVICES_LINKS) {
      const preload = document.head.querySelector(
        `link[rel="preload"][as="image"][href="${service.imageSrc}"]`,
      )
      await expect(preload).toBeNull()
    }
    await userEvent.click(canvas.getByRole('button', { name: 'Services' }))

    const panelElement =
      canvasElement.querySelector<HTMLElement>('#services-menu')
    if (!panelElement) throw new Error('Services mega panel not found')
    const panel = within(panelElement)

    for (const service of SERVICES_LINKS) {
      const link = panel.getByText(service.label, { selector: 'a' })
      await userEvent.hover(link)
      await expect(
        panel.getByRole('img', { name: service.imageAlt }),
      ).toHaveAttribute('src', service.imageSrc)
      const image = panel.getByRole<HTMLImageElement>('img', {
        name: service.imageAlt,
      })
      await image.decode()
      await expect(image.naturalWidth).toBe(1024)
      await expect(image.naturalHeight).toBe(1024)
      await expect(image.getBoundingClientRect().width).toBeCloseTo(
        image.getBoundingClientRect().height,
        0,
      )
      await expect(
        image.parentElement?.getBoundingClientRect().height,
      ).toBeCloseTo(image.getBoundingClientRect().height, 0)
      await expect(
        panel.getByText(service.imageLabel, { selector: 'p' }),
      ).toBeVisible()
    }

    for (const service of [...SERVICES_LINKS].reverse()) {
      const link = panel.getByText(service.label, { selector: 'a' })
      link.focus()
      await waitFor(() => {
        expect(
          panel.getByRole('img', { name: service.imageAlt }),
        ).toHaveAttribute('src', service.imageSrc)
      })
      await expect(link).toHaveAttribute('href', service.href)
    }
  },
}

export const MobileShopOpen: Story = {
  render: () => (
    <MobileShopPanel
      activeShop={activeShop}
      onActiveShopChange={ignoreShopKey}
      onClose={noop}
      open
      pathname="/collections/herbs-and-spices"
    />
  ),
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
}

export const MobileServicesOpen: Story = {
  render: () => (
    <MobileServicesPanel
      onClose={noop}
      open
      pathname="/pages/private-label-packing"
    />
  ),
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
}
