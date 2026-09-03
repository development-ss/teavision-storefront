import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { fireEvent, userEvent } from 'storybook/test'

import { MegaNav } from './desktop'
import { SHOP_SECTIONS, type ShopKey } from './data'
import { MobileMegaNav } from './mobile'
import { MobileServicesPanel } from './services/mobile-panel'
import { MobileShopPanel } from './shop/mobile-panel'
import { ServicesMegaPanel } from './services/panel'
import { ShopMegaPanel } from './shop/panel'

const activeShop = SHOP_SECTIONS[2] ?? SHOP_SECTIONS[0]!

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
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
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
  render: () => <MobileMegaNav open onClose={() => {}} />,
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

export const DesktopServicesOpen: Story = {
  render: () => (
    <StoryPanelFrame>
      <ServicesMegaPanel
        onClose={noop}
        open
        pathname="/pages/private-label-packing"
      />
    </StoryPanelFrame>
  ),
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
