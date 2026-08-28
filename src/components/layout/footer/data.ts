import { CANONICAL_BLOG_LISTING_PATH } from '@/lib/blog/paths'

import type {
  FooterColumn,
  FooterContactLink,
  FooterImage,
  FooterLink,
  PaymentMethod,
} from './types'

export const MAIN_MENU_LINKS = [
  { href: '/collections/wholesale-bulk-tea', label: 'Tea' },
  { href: '/collections/bulk-tea-bags', label: 'Tea Bags' },
  { href: '/collections/herbs-and-spices', label: 'Herbs & Spices' },
  { href: '/pages/services', label: 'Services' },
  { href: CANONICAL_BLOG_LISTING_PATH, label: 'Tea Journal' },
  { href: '/pages/our-story', label: 'Our Story' },
] satisfies FooterLink[]

const LEGAL_POLICY_LINKS = [
  { href: '/pages/privacy-policy', label: 'Privacy Policy' },
  { href: '/pages/shipping-policy', label: 'Shipping Policy' },
  { href: '/pages/refund-policy', label: 'Refund Policy' },
  { href: '/pages/terms-of-service', label: 'Terms of Service' },
  { href: '/pages/cookie-preferences', label: 'Cookie Preferences' },
] satisfies FooterLink[]

export const FOOTER_LINKS = [
  { href: '/search', label: 'Search' },
  { href: '/account', label: 'Login' },
  { href: '/pages/contact', label: 'Contact us' },
  ...LEGAL_POLICY_LINKS,
] satisfies FooterLink[]

export const FOOTER_COLUMNS = [
  { title: 'Shop Ingredients', links: MAIN_MENU_LINKS },
  { title: 'Help & Policies', links: FOOTER_LINKS },
] satisfies FooterColumn[]

export const CONTACT_LINKS = [
  {
    kind: 'phone',
    href: 'tel:1300729617',
    label: '1300 729 617',
  },
  {
    kind: 'email',
    href: 'mailto:info@teavision.com.au',
    label: 'info@teavision.com.au',
  },
] satisfies FooterContactLink[]

export const PAYMENT_METHODS = [
  {
    label: 'American Express',
  },
  {
    label: 'Apple Pay',
  },
  {
    label: 'Google Pay',
  },
  {
    label: 'Mastercard',
  },
  {
    label: 'PayPal',
  },
  {
    label: 'Shop Pay',
  },
  {
    label: 'Union Pay',
  },
  {
    label: 'Visa',
  },
] satisfies PaymentMethod[]

export const QUALITY_IMAGE = {
  alt: '',
  src: '/images/navigation/teavision-catalogues.png',
  width: 600,
  height: 232,
} satisfies FooterImage
