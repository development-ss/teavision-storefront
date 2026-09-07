export type FaqEntry = {
  id: string
  question: string
  answer: string
}

export type FaqGroup = {
  id: string
  title: string
  items: readonly FaqEntry[]
}

export const FAQ_GROUPS = [
  {
    id: 'general',
    title: 'General Wholesale Tea Questions',
    items: [
      {
        id: 'leading-supplier',
        question:
          'What makes Teavision a leading wholesale tea supplier in Australia?',
        answer:
          'Teavision specialises in B2B wholesale supply of tea, herbs, spices and functional ingredients. We focus on sourcing high-quality products in bulk directly from farms, producers and trusted origin partners wherever possible, helping us create stronger value and pricing advantages for our customers. Our model is built for businesses that need dependable quality, commercial volumes, broad product choice and support as they grow.',
      },
      {
        id: 'supply-across-australia',
        question: 'Do you supply tea wholesale across Australia?',
        answer:
          'Yes. Teavision supplies wholesale tea and ingredients to businesses across Australia, including metropolitan and regional locations. Customers can order wholesale products online, while larger-volume and recurring buyers can work directly with our team on commercial pricing, bulk supply and account arrangements.',
      },
      {
        id: 'bulk-organic-tea',
        question: 'Can I order bulk organic tea from Teavision?',
        answer:
          'Yes. Teavision carries a large range of certified organic teas, herbs, spices and botanical ingredients. Organic availability and certification can vary by product and batch, so contact our team if you require a specific certification, origin or supporting document for your business.',
      },
      {
        id: 'get-started',
        question: 'How do I get started with a wholesale tea order?',
        answer:
          'You can browse our wholesale range and order directly through the Teavision website. If you need larger quantities, recurring supply, custom pricing, samples or help selecting a product, contact our wholesale team with the ingredient, approximate volume, delivery location and any certification or packing requirements.',
      },
    ],
  },
  {
    id: 'pricing-ordering',
    title: 'Wholesale Pricing & Ordering',
    items: [
      {
        id: 'wholesale-pricing',
        question: 'How does Teavision wholesale pricing work?',
        answer:
          'Wholesale customers can buy directly through our website for order volumes up to 40kg. For volumes above 40kg, we can create a commercial wholesale account and offer further volume-based discounts depending on the product, quantity and supply arrangement. For regular or larger purchases, speak with our team so we can quote the most suitable commercial price.',
      },
      {
        id: 'minimum-order-quantity',
        question: 'Is there a minimum order quantity for wholesale tea?',
        answer:
          'Minimum order quantities depend on the product and format. Many wholesale products can be purchased by the kilo directly through our website, while bulk supply, custom blends, tea bag manufacturing and private-label projects may have higher minimums. Contact us with your target product and volume and we will recommend the most practical option.',
      },
      {
        id: 'samples',
        question: 'Can I request samples before placing a larger order?',
        answer:
          'Yes. Samples are available for many products and are recommended when you are assessing flavour, appearance, grade or suitability for a new product. For larger commercial projects, our team can also help coordinate samples before you commit to a bulk order.',
      },
      {
        id: 'recurring-supply',
        question: 'Can Teavision support recurring or high-volume supply?',
        answer:
          'Yes. Teavision is built for B2B supply and can support recurring orders, larger commercial volumes and planned supply programs. For higher-volume requirements, our team can discuss pricing, lead times, stock planning, origin options and suitable pack formats.',
      },
    ],
  },
  {
    id: 'products',
    title: 'Popular Wholesale Products',
    items: [
      {
        id: 'matcha-wholesale',
        question: 'Do you supply matcha tea wholesale?',
        answer:
          'Yes. Teavision supplies matcha wholesale for cafes, retailers, beverage brands, wellness businesses and food manufacturers. Different grades and certified organic options may be available depending on the intended use, from foodservice and lattes through to premium retail and private-label products.',
      },
      {
        id: 'chamomile-wholesale',
        question: 'Can I buy chamomile tea wholesale?',
        answer:
          'Yes. Teavision supplies chamomile in wholesale and bulk formats for herbal tea, sleep and wellness blends, foodservice and retail products. Larger-volume supply and custom blending support are also available.',
      },
      {
        id: 'mushroom-powder',
        question: 'Do you supply bulk mushroom powder?',
        answer:
          'Yes. Teavision supplies selected mushroom and functional powders, subject to current range and availability. These ingredients are commonly used in wellness blends, powdered beverages and functional food products. Contact our team for current options, specifications, pack sizes and certification information.',
      },
      {
        id: 'wholesale-spices',
        question: 'Can I order wholesale spices along with tea?',
        answer:
          'Yes. Teavision supplies a broad range of bulk herbs and spices alongside tea, allowing businesses to consolidate more of their ingredient purchasing with one supplier. This can include culinary spices, botanicals, functional ingredients and ingredients used in chai, wellness blends and food manufacturing.',
      },
      {
        id: 'turmeric-powder',
        question: 'Do you stock turmeric powder wholesale?',
        answer:
          'Yes. Teavision supplies turmeric powder in wholesale and bulk formats, including certified organic options where available. It is commonly used in golden latte blends, chai, functional beverages, retail powders and food manufacturing.',
      },
      {
        id: 'custom-sourcing',
        question:
          'Can you source an ingredient that is not currently listed online?',
        answer:
          'In many cases, yes. Teavision works with farms, producers and ingredient partners across multiple countries and can review sourcing requests for products that are not part of the standard online range. Larger volumes and recurring demand generally provide the best opportunity for custom sourcing.',
      },
    ],
  },
  {
    id: 'private-label-manufacturing',
    title: 'Private Label, Rebranding & Manufacturing',
    items: [
      {
        id: 'relabel-teavision-products',
        question:
          'Can I re-label Teavision products and sell them under my own retail brand?',
        answer:
          'Yes. Customers may rebrand eligible Teavision products and sell them under their own retail label. This is a common pathway for retailers, tea brands, wellness businesses and hospitality groups that want to launch products without sourcing every ingredient themselves. Your finished retail label must comply with applicable food-labelling requirements, and any organic or certification claims must meet the relevant certification rules. If you want a more complete solution, Teavision also offers private-label packing and manufacturing services.',
      },
      {
        id: 'private-label-products',
        question: 'Do you offer private-label tea and ingredient products?',
        answer:
          'Yes. Teavision provides private-label solutions for businesses that want products packed and presented under their own brand. Depending on the project, we can assist with ingredient selection, blending, tea bag manufacture, filling, packing and retail-ready formats such as pouches, tins, jars, cartons and other packaging options.',
      },
      {
        id: 'custom-tea-blending',
        question: 'Do you offer custom tea blending?',
        answer:
          'Yes. We can develop custom tea and botanical blends around your flavour profile, functional concept, target price point or brand brief. Customers can also use an existing Teavision blend as a starting point. Custom projects can progress from samples and refinement through to larger-scale production and private-label packing.',
      },
      {
        id: 'tea-bag-manufacturing',
        question: 'Do you manufacture tea bags for other brands?',
        answer:
          'Yes. Teavision provides tea bag manufacturing for wholesale and private-label customers. Available formats can include pyramid, square or flat, round, string-and-tag and individually wrapped options depending on the project. We can manufacture using an existing Teavision tea, your own approved blend or a custom blend developed with our team. Minimum order quantities apply, so contact us for the best format and production option for your volume.',
      },
      {
        id: 'packaging-support',
        question:
          'Can Teavision help with packaging as well as the tea itself?',
        answer:
          'Yes. We can support businesses with bulk ingredients only or provide a more complete private-label pathway including blending, tea bagging, filling and retail-ready packaging. Packaging options vary by project and may include pouches, tins, jars, cartons and individually wrapped tea bag formats.',
      },
    ],
  },
  {
    id: 'quality-documentation',
    title: 'Certified Quality & Documentation',
    items: [
      {
        id: 'certified-organic',
        question: 'Is Teavision Certified Organic?',
        answer:
          'Yes. Teavision holds internationally recognised organic certifications including Australian Certified Organic (ACO), USDA NOP and EU Organic, with additional certification pathways across parts of our range. We maintain one of the broadest certified-organic ingredient selections in Australia and New Zealand, covering hundreds of eligible teas, herbs, spices and botanical ingredients. Certification is product-specific, so please confirm the required certification and documentation with our team before ordering.',
      },
      {
        id: 'haccp',
        question: 'Is Teavision HACCP certified?',
        answer:
          'Yes. Teavision operates a HACCP-certified food safety program designed to support consistent handling, quality and food safety across our operations. Commercial customers can contact our team if they require current certification or supporting quality documentation.',
      },
      {
        id: 'quality-documents',
        question:
          'Can you provide specifications, certificates and quality documents?',
        answer:
          'For many commercial ingredients, Teavision can provide supporting documentation such as product specifications, organic certificates and other available quality or compliance documents. Document availability varies by product and origin, so let us know what your quality or regulatory team requires when requesting a quote.',
      },
    ],
  },
  {
    id: 'business-support',
    title: 'Business & Support Questions',
    items: [
      {
        id: 'business-types',
        question: 'What types of businesses do you work with?',
        answer:
          'Teavision works primarily with B2B customers including cafes, restaurants, hotels, tea brands, health and wellness businesses, retailers, supermarkets, online stores, beverage companies and food manufacturers. We support both growing businesses and established commercial buyers requiring recurring supply, private label, product development or larger-volume ingredient purchasing.',
      },
      {
        id: 'b2b-specialisation',
        question: 'Why does Teavision specialise in B2B supply?',
        answer:
          'Our B2B model allows us to focus on commercial volumes, bulk purchasing and long-term sourcing relationships. By purchasing larger quantities directly from farms, producers and trusted origin partners, we aim to unlock stronger pricing and supply advantages that can be passed on to wholesale customers while maintaining a strong focus on product quality.',
      },
      {
        id: 'wholesale-support',
        question: 'What support can wholesale buyers expect?',
        answer:
          'Wholesale buyers can access product guidance, commercial pricing, samples, certification support, custom blending, private label, tea bag manufacturing, packaging and bulk sourcing assistance. For larger or recurring requirements, our team can also help plan volumes, pack sizes, lead times and supply arrangements.',
      },
      {
        id: 'launch-brand',
        question: 'Can Teavision help me launch a new tea or wellness brand?',
        answer:
          'Yes. Teavision can support businesses from initial ingredient selection and samples through to custom blending, tea bag manufacturing, private-label packing and commercial supply. This allows new and established brands to build a product range without having to manage every manufacturing and sourcing step independently.',
      },
    ],
  },
] as const satisfies readonly FaqGroup[]

type FaqId = (typeof FAQ_GROUPS)[number]['items'][number]['id']

const SERVICE_FAQ_IDS = {
  'tea-bag-manufacturer': [
    'tea-bag-manufacturing',
    'custom-tea-blending',
    'packaging-support',
    'minimum-order-quantity',
    'samples',
  ],
  'private-label-packing': [
    'relabel-teavision-products',
    'private-label-products',
    'packaging-support',
    'custom-tea-blending',
    'minimum-order-quantity',
    'launch-brand',
  ],
  'custom-tea-blends': [
    'custom-tea-blending',
    'samples',
    'minimum-order-quantity',
    'private-label-products',
    'packaging-support',
  ],
} as const satisfies Record<string, readonly FaqId[]>

export function getServiceFaqs(page: keyof typeof SERVICE_FAQ_IDS): FaqEntry[] {
  const items = FAQ_GROUPS.flatMap<FaqEntry>((group) => group.items)

  return SERVICE_FAQ_IDS[page].map((id) => {
    const item = items.find((entry) => entry.id === id)

    if (!item) {
      throw new Error(`Missing FAQ content for ${id}`)
    }

    return item
  })
}
