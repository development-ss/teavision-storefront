import { MapPinned, ShieldCheck, Tag, type LucideIcon } from 'lucide-react'

// Page metadata — shared by page.tsx (Metadata) and json-ld.tsx (structured data)
export const PAGE_PATH = '/pages/bulk-wholesale-supply'
export const PAGE_TITLE = 'Bulk Wholesale Supply'
export const META_TITLE = 'Bulk Wholesale Tea Supply Australia | Teavision'
export const PAGE_DESCRIPTION =
  'Import premium teas, herbs and botanicals at scale with Teavision. Container freight to Melbourne, 1500+ ingredients direct from farms, ACO/HACCP certified supply chain.'

export const HERO_DESKTOP_IMAGE_SRC =
  '/images/bulk-wholesale-supply/bulk-wholesale-hero.avif'
export const HERO_MOBILE_VIDEO_SRC =
  'https://cdn.shopify.com/s/files/1/0786/8339/files/b76f0f3e99f443ecbd95ecfcb9b844d9.mp4'
export const HERO_MOBILE_POSTER_SRC =
  '/images/bulk-wholesale-supply/bulk-wholesale-hero.avif'

export const SHIP_IMAGE_SRC =
  '/images/bulk-wholesale-supply/bulk-wholesale-shipping.png'
export const SHIP_AVIF_SRC =
  '/images/bulk-wholesale-supply/bulk-wholesale-ship.avif'

// Section 3 — 3-column feature grid
export type FeatureCard3 = {
  icon: LucideIcon
  title: string
  description: string
}

export const FEATURE_CARDS_3: FeatureCard3[] = [
  {
    icon: ShieldCheck,
    title: 'ACO / HACCP Certified',
    description: 'Programs & documentation available on request.',
  },
  {
    icon: MapPinned,
    title: 'Container Imports',
    description: 'Reliable global lanes into Melbourne.',
  },
  {
    icon: Tag,
    title: 'Price Advantage',
    description: 'Bulk & contract pricing for 100kg+ orders.',
  },
]

// Section 4 — freight & logistics check items
export type LogisticsCheckItem = {
  bold: string
  rest: string
}

export const LOGISTICS_CHECK_ITEMS: LogisticsCheckItem[] = [
  {
    bold: 'Container & LCL Options',
    rest: 'to match your volumes',
  },
  {
    bold: 'Quality Control Checks',
    rest: 'on arrival in Melbourne',
  },
  {
    bold: 'Supplier Due-Diligence',
    rest: 'and document verification',
  },
  {
    bold: 'Consolidation Services',
    rest: 'of teas, herbs, spices & functional ingredients',
  },
]

// Section 5 — 2-column feature cards
export type FeatureCard2 = {
  title: string
  description: string
}

export const IMPORT_FEATURE_CARDS: FeatureCard2[] = [
  {
    title: 'Tea Varieties',
    description: 'Black, green, white, oolong, matcha & specialty teas',
  },
  {
    title: 'Botanicals & Herbs',
    description: 'Functional botanicals, herbs, spices & natural sweeteners',
  },
  {
    title: 'Organic Options',
    description: 'Organic options & documentation (ACO) available',
  },
  {
    title: 'Custom Solutions',
    description: 'Private-label packing & custom blends on request',
  },
]

// Section 6 — Why Choose Teavision accordion items
export type AccordionContent = {
  id: string
  title: string
  body: string
}

export const WHY_CHOOSE_ITEMS: AccordionContent[] = [
  {
    id: 'global-reach',
    title: 'Global Reach, Local Reliability',
    body: 'We manage end-to-end importing, handling everything from timely container shipments to customs inspections out of our Melbourne warehouse. You’ll enjoy smooth delivery and peace of mind at every step.',
  },
  {
    id: 'product-quality',
    title: 'Superior Product Quality',
    body: 'When products arrive, we conduct meticulous quality checks to ensure freshness, accuracy, and pristine packaging — so you only receive the very best.',
  },
  {
    id: 'wide-selection',
    title: 'Wide Selection, One Partner',
    body: 'Beyond tea, we import bulk herbs, spices, and natural sweeteners — providing a versatile product range under one trusted supplier.',
  },
  {
    id: 'cost-effective',
    title: 'Cost-Effective & Convenient',
    body: 'Working with us means cutting out unnecessary steps. Say goodbye to supply delays, unreliable packaging, or questionable documentation, and enjoy streamlined importing that saves time and resources.',
  },
  {
    id: 'expertise',
    title: 'Expertise You Can Count On',
    body: 'With deep experience in international sourcing and logistics, we speak the language of importers — so you don’t have to.',
  },
]

// Section 7 — Process steps
export type ProcessStep = {
  number: number
  title: string
  description: string
}

export const PROCESS_STEPS: ProcessStep[] = [
  {
    number: 1,
    title: 'Get in Touch',
    description: 'Contact our team for pricing and shipment options.',
  },
  {
    number: 2,
    title: 'Confirm Shipment Options',
    description:
      'We’ll recommend suitable container sizes and logistics based on your forecast.',
  },
  {
    number: 3,
    title: 'Approve Scheduling & Pricing',
    description:
      'Finalise delivery timelines and pricing structures tailored to your goals.',
  },
  {
    number: 4,
    title: 'Product Arrival & Inspection',
    description:
      'We receive your shipment in Melbourne, assess quality, and prepare for dispatch.',
  },
  {
    number: 5,
    title: 'Order Fulfillment',
    description:
      'Your imported products are now ready for sale, blending, or fulfillment.',
  },
]

// Section 8 — FAQ items
export type FaqItem = {
  id: string
  question: string
  answer: string
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'products-imported',
    question: 'What types of products do you import?',
    answer:
      'We import a broad range of items including teas, herbs, spices, and natural sweeteners, curated for Australian businesses.',
  },
  {
    id: 'direct-importer',
    question: 'Are you a direct importer?',
    answer:
      'Yes. We arrange international shipments directly to our Melbourne warehouse, ensuring control, speed, and transparency throughout the process.',
  },
  {
    id: 'product-quality',
    question: 'How do you ensure product quality?',
    answer:
      'Upon arrival, every shipment undergoes thorough inspection, covering freshness, packaging integrity, and adherence to order specifications.',
  },
  {
    id: 'container-sizes',
    question: 'Can you import in custom container sizes?',
    answer:
      'Absolutely. We coordinate full or partial container shipments to match your business volume and delivery preferences.',
  },
  {
    id: 'smaller-volumes',
    question: 'Do you support smaller-volume businesses?',
    answer:
      'Yes — we tailor our services to accommodate businesses of all sizes, from specialty retailers to large food producers.',
  },
  {
    id: 'begin-importing',
    question: 'How can I begin importing with you?',
    answer:
      'Just reach out to our team with your product interests. We’ll walk you through options, pricing, and timelines every step of the way.',
  },
]
