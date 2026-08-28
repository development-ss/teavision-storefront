import { Globe, Leaf, Package, Trophy } from 'lucide-react'

import type { StatBandItem } from '@/components/ui'

// Section 1 — Hero
export const HERO_IMAGE_SRC =
  '/images/tea-bag-manufacturer/tea-bag-manufacturer-hero.webp'

export const HERO_FEATURES = [
  'Custom Blends Available',
  'Global Shipping',
  'Private Label Packaging',
  'MOQ from 8,000 bags',
] as const

export type CertLogo = {
  src: string
  alt: string
}

export const HERO_CERT_LOGOS: CertLogo[] = [
  {
    src: '/icons/certifications/australian-certified-organic.svg',
    alt: 'Australian Certified Organic',
  },
  {
    src: '/icons/certifications/kosher-australia.svg',
    alt: 'Halal certified',
  },
  {
    src: '/icons/certifications/ok-kosher.svg',
    alt: 'OK Kosher certified',
  },
  {
    src: '/icons/certifications/usda-organic-seal.svg',
    alt: 'USDA Organic',
  },
  {
    src: '/icons/certifications/halal-certification.svg',
    alt: 'Made in Australia',
  },
  {
    src: '/icons/certifications/organic-certification.svg',
    alt: 'Organic certification',
  },
  {
    src: '/icons/certifications/haccp-australia.svg',
    alt: 'HACCP Australia',
  },
]

// Section 2 — Statistics band
export const STATS = [
  { icon: Package, value: '10M+', label: 'Tea bags sold annually' },
  { icon: Trophy, value: '#1', label: 'In Australia and New Zealand' },
  { icon: Globe, value: '50+', label: 'Countries served' },
  { icon: Leaf, value: '100+', label: 'Tea varieties' },
] satisfies readonly StatBandItem[]

// Section 3 — Manufacturing solutions
export type SolutionCard = {
  src: string
  alt: string
  title: string
  copy: string
  points: string[]
}

export const SOLUTION_CARDS: SolutionCard[] = [
  {
    src: '/images/tea-bag-manufacturer/tea-bag-feature-pyramid.webp',
    alt: 'Custom tea blends',
    title: 'Custom Tea Blends',
    copy: 'Create your unique tea blend or let us develop one for you. Over 100 tea varieties and flavors available.',
    points: [
      'Your own recipe or our expertise',
      'Organic and conventional options',
      'Natural flavoring available',
      'MOQ: 8,000 tea bags for custom blends',
    ],
  },
  {
    src: '/images/tea-bag-manufacturer/tea-bag-feature-packaging.webp',
    alt: 'Private label packaging',
    title: 'Private Label Packaging',
    copy: 'Complete packaging solutions including pouches, cylinders, tins, and individual sachets.',
    points: [
      'Custom artwork and branding',
      'Multiple packaging formats',
      'Premium finishing options',
      'Heat seal pouches and solo bags',
    ],
  },
  {
    src: '/images/tea-bag-manufacturer/tea-bag-feature-production.webp',
    alt: 'International shipping',
    title: 'International Shipping',
    copy: 'Reliable worldwide shipping from Australia to any country with full logistics support.',
    points: [
      'Ship to any country globally',
      'Competitive international rates',
      'Full tracking and insurance',
      'Export documentation handled',
    ],
  },
]

// Section 5 — Tea bag & packaging options
export const TEA_BAG_STYLES_IMAGE_SRC =
  '/images/tea-bag-manufacturer/tea-bag-styles.webp'

export type PackagingItem = {
  title: string
  description: string
}

export const TEA_BAG_STYLES: PackagingItem[] = [
  { title: 'Square Tea Bags', description: 'Standard tea bags' },
  { title: 'Pyramid Tea Bags', description: 'Premium pyramid style' },
  { title: 'Custom Tagged', description: 'Your artwork on tags' },
  { title: 'Individual Sachets', description: 'Premium sachets' },
]

export const PACKAGING_SOLUTIONS: PackagingItem[] = [
  {
    title: 'Pouches & Cylinders',
    description: 'Custom branded packaging options',
  },
  {
    title: 'Tins & Containers',
    description: 'Premium metal and plastic containers',
  },
  {
    title: 'Heat Seal Pouches',
    description: 'Professional retail-ready packaging',
  },
]

export type PackagingImage = {
  src: string
  alt: string
}

export const PACKAGING_IMAGES: PackagingImage[] = [
  {
    src: '/images/tea-bag-manufacturer/pyramid-tea-bag.webp',
    alt: 'Branded tea pouch packaging',
  },
  {
    src: '/images/tea-bag-manufacturer/single-pyramid-tea-bag.png',
    alt: 'Pyramid tea bag with blank tag',
  },
  {
    src: '/images/tea-bag-manufacturer/round-tea-bag.webp',
    alt: 'Custom tea tin packaging',
  },
  {
    src: '/images/tea-bag-manufacturer/flat-tea-bag.webp',
    alt: 'Retail-ready tea cartons',
  },
  {
    src: '/images/tea-bag-manufacturer/green-roots-sachet.webp',
    alt: 'Green Roots individual sachet',
  },
  {
    src: '/images/tea-bag-manufacturer/green-roots-tea-bags.webp',
    alt: 'Green Roots tea bags',
  },
  {
    src: '/images/tea-bag-manufacturer/pavillion-tea-bags.webp',
    alt: 'Pavilion branded tea packaging',
  },
  {
    src: '/images/tea-bag-manufacturer/sachet-tea-bag.webp',
    alt: 'Heat seal tea sachet',
  },
  {
    src: '/images/tea-bag-manufacturer/st-jennis-tea-bags.webp',
    alt: 'St Jennis branded tea packaging',
  },
]

// Section 6 — Simple 3-step process
export type ProcessStep = {
  number: number
  title: string
  description: string
}

export const PROCESS_STEPS: ProcessStep[] = [
  {
    number: 1,
    title: 'Choose Your Blend',
    description:
      "Select from our 100+ tea varieties or create a custom blend. We'll help you find the perfect taste profile.",
  },
  {
    number: 2,
    title: 'Design & Package',
    description:
      "Choose your tea bag style and packaging. We'll create custom artwork and branding for your products.",
  },
  {
    number: 3,
    title: 'Manufacture & Ship',
    description:
      'We manufacture your tea bags and ship them worldwide. Lead times average between 2-6 weeks.',
  },
]

// Section 8 — Ready-to-ship tea bags
export const READY_TO_SHIP_IMAGE_SRC =
  '/images/tea-bag-manufacturer/ready-to-ship-tea-varieties.webp'

export const READY_TO_SHIP_VARIETIES: PackagingItem[] = [
  { title: 'English Breakfast', description: 'Traditional morning blend' },
  { title: 'Green Tea', description: 'Premium Sencha variety' },
  { title: 'Earl Grey', description: 'Classic Bergamot blend' },
]

export const TEA_LIST_PDF_URL = '/vendor/catalogues/tea-bag-catalogue.pdf'
