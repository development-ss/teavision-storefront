export type ImageAsset = {
  src: string
  alt: string
  width: number
  height: number
}

export type CapabilityCard = {
  title: string
  description: string
  image: ImageAsset
}

export type TextCard = {
  title: string
  description: string
}

export type QualityCardIcon = 'naturopath' | 'certification' | 'commercial'

export type QualityCard = TextCard & {
  icon: QualityCardIcon
}

export const HERO_IMAGE = {
  src: '/images/custom-tea-blends/rose-green-tea-blend.png',
  alt: 'Green tea blended with rose petals',
  width: 1400,
  height: 900,
} satisfies ImageAsset

export const THUMBNAILS = [
  {
    src: '/images/custom-tea-blends/lemongrass-ginger-blend.png',
    alt: 'Lemongrass, ginger, and turmeric blend',
    width: 640,
    height: 640,
  },
  {
    src: '/images/custom-tea-blends/earl-grey-tea-blend.png',
    alt: 'French Earl Grey tea blend',
    width: 640,
    height: 640,
  },
  {
    src: '/images/custom-tea-blends/custom-blending-lab.jpg',
    alt: 'Teavision product development workspace',
    width: 900,
    height: 600,
  },
  {
    src: '/images/custom-tea-blends/custom-tea-bags.jpg',
    alt: 'Teavision tea blending workspace',
    width: 900,
    height: 600,
  },
  {
    src: '/images/custom-tea-blends/blue-spirulina-powder.png',
    alt: 'Blue spirulina powder',
    width: 900,
    height: 900,
  },
] satisfies ImageAsset[]

export const HERO_PROOF_POINTS = [
  'Low MOQ pathways',
  '100+ flavour directions',
  'Organic, Kosher, and Halal options',
]

export const VALUE_POINTS = [
  'R&D samples in 1-3 weeks',
  'Retail and foodservice formats',
  'Export documentation support',
]

export const CAPABILITY_CARDS = [
  {
    title: 'Loose-leaf teas',
    description: 'Sencha, breakfast tea, Earl Grey, oolongs, and hero blends.',
    image: {
      src: '/images/custom-tea-blends/tea-in-jars.webp',
      alt: 'Loose-leaf tea in jars',
      width: 900,
      height: 900,
    },
  },
  {
    title: 'Herbal and botanicals',
    description: 'Calm, sleep, digest, detox, and functional herbal blends.',
    image: {
      src: '/images/custom-tea-blends/calm-tea-passionflower.png',
      alt: 'Herbal tea blend with passionflower',
      width: 900,
      height: 900,
    },
  },
  {
    title: 'Boxes and sachets',
    description: 'Retail cartons, display formats, and single-serve packs.',
    image: {
      src: '/images/custom-tea-blends/tea-cartons-boxes.png',
      alt: 'Tea cartons and retail boxes',
      width: 900,
      height: 900,
    },
  },
  {
    title: 'Powders and instant',
    description: 'Matcha, iced tea powders, chai latte, and superfood blends.',
    image: {
      src: '/images/custom-tea-blends/matcha-powder.png',
      alt: 'Matcha powder',
      width: 900,
      height: 900,
    },
  },
  {
    title: 'Iced and cold-brew',
    description: 'Hibiscus, peach, lemon, berry, and summer-ready profiles.',
    image: {
      src: '/images/custom-tea-blends/hibiscus-iced-tea.png',
      alt: 'Iced hibiscus tea',
      width: 900,
      height: 900,
    },
  },
  {
    title: 'Wellness specials',
    description: 'Sleep, immunity, de-stress, slim, and mood-led blends.',
    image: {
      src: '/images/custom-tea-blends/sleep-tea.png',
      alt: 'Sleep tea blend',
      width: 900,
      height: 900,
    },
  },
  {
    title: 'Chai and spice',
    description: 'Sticky chai, turmeric, masala, and warming spice blends.',
    image: {
      src: '/images/custom-tea-blends/chai-spice-tin.png',
      alt: 'Chai spice tea tin',
      width: 900,
      height: 900,
    },
  },
  {
    title: 'Loose leaf jars',
    description: 'Retail-ready glass jars and display formats.',
    image: {
      src: '/images/custom-tea-blends/tea-in-jars.webp',
      alt: 'Loose-leaf tea in retail jars',
      width: 900,
      height: 900,
    },
  },
  {
    title: 'Pyramid tea bags',
    description: 'Compostable pyramid bags with tag and string options.',
    image: {
      src: `/images/tea-bag-manufacturer/single-pyramid-tea-bag.png`,
      alt: 'Pyramid tea bag with a blank tag',
      width: 600,
      height: 600,
    },
  },
] satisfies CapabilityCard[]

export const QUALITY_CARDS = [
  {
    icon: 'naturopath',
    title: 'Naturopath input',
    description:
      'Option to have blends reviewed for intended use and ingredient direction.',
  },
  {
    icon: 'certification',
    title: 'Certification pathways',
    description:
      'Organic, Kosher, Halal, and HACCP conversations with full traceability.',
  },
  {
    icon: 'commercial',
    title: 'Commercial fit',
    description:
      'Product development grounded in target margins, format, and launch stage.',
  },
] satisfies QualityCard[]

export const PROCESS_STEPS = [
  {
    title: 'Discovery',
    description: 'Goals, claims, flavours, price points, and target markets.',
  },
  {
    title: 'R&D samples',
    description: 'Two to three options developed for tasting and iteration.',
  },
  {
    title: 'Packaging',
    description: 'Pouches, tins, jars, sachets, cartons, or foodservice packs.',
  },
  {
    title: 'Compliance',
    description: 'Ingredient statements, label checks, barcodes, and claims.',
  },
  {
    title: 'Production',
    description: 'Blending, tea-bagging, filling, and quality checks.',
  },
  {
    title: 'Dispatch',
    description: 'National delivery, export preparation, and 3PL support.',
  },
] satisfies TextCard[]
