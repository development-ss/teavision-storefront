import { CANONICAL_BLOG_LISTING_PATH } from '@/lib/blog/paths'

export type MenuKey = 'shop' | 'services'
export type ShopKey = 'tea' | 'tea-bags' | 'herbs-spices' | 'superfood-powders'

export type NavLink = {
  href: string
  label: string
}

export type ServiceLink = NavLink & {
  imageSrc: string
  imageAlt: string
  imageLabel: string
}

export type ShopSection = {
  key: ShopKey
  name: string
  description?: string
  links: NavLink[]
  ctaHref: string
  asideDescription?: string
  imageAlt?: string
  imageSrc?: string
}

const SHOP_IMAGE_SRC = {
  tea: '/images/navigation/shop-tea-render.webp',
  'tea-bags': '/images/navigation/shop-tea-bags-render.webp',
  'herbs-spices': '/images/navigation/shop-herbs-spices-render.webp',
  'superfood-powders': '/images/navigation/shop-superfood-powders-render.webp',
} as const

export const SHOP_SECTIONS = [
  {
    key: 'tea',
    name: 'Tea',
    description:
      'Explore our collection of black tea, green tea, matcha, and specialty blends, available in both bulk and wholesale packs.',
    ctaHref: '/collections/wholesale-bulk-tea',
    imageAlt: 'Tea',
    imageSrc: SHOP_IMAGE_SRC.tea,
    asideDescription:
      'Explore bulk tea, cafe-ready formats, specialty blends, and wholesale support from an Australian owned team.',
    links: [
      {
        href: '/collections/tea-masters-selection-worlds-best-teas',
        label: 'Rare, Premium & Exclusive Teas',
      },
      {
        href: '/collections/australian-native-ingredients',
        label: 'Australian Native Tea',
      },
      { href: '/collections/black-tea', label: 'Black Tea' },
      { href: '/collections/green-tea', label: 'Green Tea' },
      { href: '/collections/chai', label: 'Herbal Tea' },
      { href: '/collections/chai', label: 'Chai' },
      {
        href: '/collections/wellness-functional-tea',
        label: 'Health and Wellness Blends',
      },
      { href: '/collections/speciality-tea', label: 'Specialty Tea' },
      { href: '/collections/matcha-tea', label: 'Matcha Tea' },
      { href: '/collections/white-tea', label: 'White Tea' },
      {
        href: '/collections/organic-tea',
        label: 'Certified Organic Tea Range',
      },
      { href: '/collections/cafe-range', label: 'Cafe Range' },
      { href: '/collections/bulk-tea-bags', label: 'Cafe Ready Tea Bags' },
      {
        href: '/collections/dessert-cocktail-inspired-blends',
        label: 'Cocktail Inspired Blends',
      },
      { href: '/pages/custom-tea-blends', label: 'Custom Tea Blends' },
    ],
  },
  {
    key: 'tea-bags',
    name: 'Tea Bags',
    description:
      'From bulk tea bags to individually wrapped wholesale tea bags, we supply solutions for cafes, restaurants, and retailers.',
    ctaHref: '/collections/bulk-tea-bags',
    imageAlt: 'Tea Bags',
    imageSrc: SHOP_IMAGE_SRC['tea-bags'],
    asideDescription:
      'Explore bulk and private-label tea bag options for cafes, hotels, restaurants, and retailers.',
    links: [
      { href: '/collections/bulk-tea-bags', label: 'Ready Made Tea Bag Packs' },
      {
        href: '/pages/tea-bag-manufacturer',
        label: 'Custom & Private Label Tea Bags',
      },
      {
        href: '/vendor/catalogues/tea-bag-catalogue.pdf',
        label: 'Download Tea Bag Catalogue',
      },
    ],
  },
  {
    key: 'herbs-spices',
    name: 'Herbs & Spices',
    description:
      'Source bulk herbs and spices Australia-wide with confidence. We partner with ethical farmers to deliver wholesale herbs, botanicals, and spices that meet the highest standards.',
    ctaHref: '/collections/herbs-and-spices',
    imageAlt: 'Herbs & Spices',
    imageSrc: SHOP_IMAGE_SRC['herbs-spices'],
    asideDescription:
      'Browse wholesale herbs and spices with practical support for quality, supply, and repeat ordering.',
    links: [
      { href: '/collections/herbs-and-spices', label: 'All Spices & Herbs' },
    ],
  },
  {
    key: 'superfood-powders',
    name: 'Superfood Powders',
    ctaHref: '/collections/superfood-extract-powders-proteins-supplements',
    imageAlt: 'Superfood Powders',
    imageSrc: SHOP_IMAGE_SRC['superfood-powders'],
    links: [
      {
        href: '/collections/superfood-extract-powders-proteins-supplements',
        label: 'All Products',
      },
    ],
  },
] satisfies ShopSection[]

export const SERVICES_LINKS = [
  {
    href: '/pages/custom-tea-blends',
    label: 'Custom Tea Blending',
    imageSrc: '/images/navigation/service-custom-blending-render.webp',
    imageAlt: 'Tea blender mixing loose tea among bowls of botanicals',
    imageLabel: 'Custom Tea Blending',
  },
  {
    href: '/pages/private-label-packing',
    label: 'Private Label Solutions',
    imageSrc: '/images/navigation/service-private-label-render.webp',
    imageAlt: 'Loose tea being packed into an unbranded pouch on a scale',
    imageLabel: 'Expert Packing & Private Label',
  },
  {
    href: '/pages/tea-bag-manufacturer',
    label: 'Tea Bag Manufacture',
    imageSrc: '/images/navigation/service-tea-bag-manufacture-render.webp',
    imageAlt: 'Pyramid tea bags on a stainless-steel manufacturing line',
    imageLabel: 'Tea Bag Manufacturing',
  },
  {
    href: '/pages/new-product-development-order-form',
    label: 'New Product Development Request',
    imageSrc: '/images/navigation/service-product-development-render.webp',
    imageAlt: 'Botanical samples and glassware on a tea development workbench',
    imageLabel: 'New Product Development',
  },
  {
    href: '/pages/bulk-wholesale-supply',
    label: 'Bulk Wholesale Supply',
    imageSrc: '/images/navigation/service-bulk-wholesale-render.webp',
    imageAlt: 'Pallets of bulk ingredient sacks and cartons in a warehouse',
    imageLabel: 'Bulk Wholesale Supply',
  },
  {
    href: '/pages/faq',
    label: 'FAQ',
    imageSrc: '/images/navigation/service-faq-render.webp',
    imageAlt: 'Golden tea in a ceramic cup and saucer on a sunlit stone table',
    imageLabel: 'FAQ',
  },
] satisfies ServiceLink[]

export const CATALOGUE_LINKS = [
  {
    href: '/vendor/catalogues/tea-cafe-catalogue.pdf',
    label: 'Tea Catalogue',
  },
  {
    href: '/vendor/catalogues/tea-bag-catalogue.pdf',
    label: 'Tea Bag Catalogue',
  },
  {
    href: '/vendor/catalogues/beverage-rtd-catalogue.pdf',
    label: 'Beverage, Natural Sweeteners, Juices',
  },
  {
    href: '/vendor/catalogues/herbs-spices-catalogue.pdf',
    label: 'Herbs & Spices Catalogue',
  },
  {
    href: '/vendor/catalogues/tea-blends-catalogue.pdf',
    label: 'Tea Blends Catalogue',
  },
  {
    href: '/vendor/catalogues/aco-organic-certificate.pdf',
    label: 'ACO Organic Certificate - Full Organic Range',
  },
] satisfies NavLink[]

export const DIRECT_LINKS = [
  { href: CANONICAL_BLOG_LISTING_PATH, label: 'Tea Journal' },
  { href: '/pages/our-story', label: 'Our Story' },
  { href: '/pages/contact', label: 'Contact' },
] satisfies NavLink[]

export function isNavLinkActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function isShopPath(pathname: string): boolean {
  return (
    isNavLinkActive(pathname, '/collections') ||
    isNavLinkActive(pathname, '/products')
  )
}

export function getShopKeyForPath(pathname: string): ShopKey | undefined {
  return SHOP_SECTIONS.find(
    (section) =>
      isNavLinkActive(pathname, section.ctaHref) ||
      section.links.some((link) => isNavLinkActive(pathname, link.href)),
  )?.key
}

export function isServicesPath(pathname: string): boolean {
  return (
    isNavLinkActive(pathname, '/pages/wholesale') ||
    SERVICES_LINKS.some((link) => isNavLinkActive(pathname, link.href))
  )
}
