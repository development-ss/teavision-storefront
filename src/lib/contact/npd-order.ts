export type NpdProductType = {
  value: string
  label: string
  note?: string
}

export const NPD_ORDER_PAGE_PATH = '/pages/new-product-development-order-form'
export const NPD_ORDER_PAGE_TITLE = 'New Product Development — Order Details'
export const NPD_ORDER_META_TITLE = 'New Product Development Order Form'
export const NPD_ORDER_DESCRIPTION =
  'Tell us about your blend idea and packaging preferences. Submit your NPD order details and the Teavision team will confirm details and next steps.'

export const NPD_ORDER_LIMITS = {
  field: 100,
  email: 254,
  phone: 20,
  text: 1200,
  maxBlends: 10,
  maxFlavoursPerBlend: 3,
} as const

export const NPD_BLEND_DEVELOPMENT_COST = '$450+GST'
export const NPD_NATUROPATH_COST = '$250 per SKU/blend'

export const NPD_PRODUCT_TYPES = [
  {
    value: 'Tea Bags and Loose Leaf',
    label: 'Tea Bags & Loose Leaf',
  },
  {
    value: 'Tea Bags Blank White Tags 6,000 per SKU MOQ',
    label: 'Tea Bags Blank White Tags',
    note: '6,000 per SKU MOQ',
  },
  {
    value: 'Tea Bags Custom Printed Tag Logo 24,000 Per SKU MOQ',
    label: 'Tea Bags Custom Printed Tag Logo',
    note: '24,000 per SKU MOQ',
  },
  {
    value: 'Powder Blend (superfood, extracts etc)',
    label: 'Powder Blend (superfood, extracts etc)',
  },
  {
    value: 'Loose Leaf Tea',
    label: 'Loose Leaf Tea',
  },
] satisfies NpdProductType[]

export const NPD_TIMEFRAMES = [
  'ASAP (priority)',
  '2–4 weeks',
  '4–8 weeks',
  'Flexible / No deadline',
  'Other',
]

export const NPD_FLAVOURS = [
  'ACEROLA',
  'ALMOND',
  'AMARETTO',
  'ANISEED',
  'ANISEED OIL (SWEET)',
  'APPLE',
  'APPLE & BLUEBERRY',
  'APPLE & CINNAMON',
  'APPLE FLAVOUR',
  'APRICOT',
  'BANANA',
  'BANANA - GREEN',
  'BERRY COMBO',
  'BITTER GRAPEFRUIT',
  'BLACKBERRY',
  'BLACKCURRANT',
  'BLUEBERRY',
  'BOURBON',
  'BOYSENBERRY',
  'BRANDY',
  'BUBBLEGUM',
  'BUNSPICE C',
  'BUTTERSCOTCH',
  'CAMPARI',
  'CAPPUCINO FLAVOUR',
  'CARAMEL',
  'CHERRY',
  'CHERRY RYPE',
  'CHILLI FLAVOUR OIL',
  'CHOCOLATE',
  'CHOCOLATE MALT',
  'CINNAMON',
  'CITRUS BOOSTER',
  'COCONUT',
  'COCONUT MILK',
  'COFFEE',
  'COFFEE FLAVOUR',
  'COLA',
  'CORIANDER',
  'CRANBERRY',
  'CREAM',
  'CREAMING SODA',
  'CREAMY CARAMEL FLAVOUR',
  'CUSTARD',
  'DARK CHOCOLATE',
  'DURIAN FLAVOUR',
  'FORESTBERRY',
  'FRUIT PUNCH FLAVOUR',
  'FRUITS OF THE FOREST',
  'GARDEN MINT',
  'GIN',
  'GINGER',
  'GRAPE',
  'GREEN APPLE',
  'GREEN PEPPER',
  'GUAVA',
  'HAZELNUT',
  'HONEY',
  'HONEYCOMB',
  'ICE MINT FLAVOUR',
  'IRISH CREAM',
  'JASMIN',
  'KAHLUA',
  'KIWIFRUIT',
  'LEMON',
  'LEMON, LIME & ORANGE',
  'LEMONADE',
  'LIME',
  'LYCHEE',
  'MANDARIN',
  'MANGO',
  'MANGO,BANANA,RASPBERRY',
  'MAPLE',
  'MELON',
  'MILK',
  'MIXED BERRY',
  'MOCCACINO',
  'MUSK',
  'ORANGE',
  'ORANGE BANANA APRICOT',
  'ORANGE CARROT',
  'OUZO FLAVOUR',
  'PASSION PARADISE FLAVOUR',
  'PASSIONFRUIT',
  'PEACH',
  'PEACH & MELON',
  'PEPPERMINT',
  'PINE LIME FLAVOUR',
  'PINEAPPLE',
  'PINK GRAPEFRUIT',
  'PISTACHIO',
  'PLUM',
  'RASPBERRY',
  'RED WINE',
  'RICH CHOCOLATE',
  'ROCKMELON',
  'ROSE',
  'RUM',
  'SAMBUCCA',
  'SARSAPARILLA FLAVOUR',
  'STRAWBERRY',
  'SWEET LEMON',
  'TANGERINE FLAVOUR',
  'TROPICAL',
  'VANILLA',
  'WALNUT',
  'WATERMELON',
  'WHISKEY',
  'WHITE PEACH',
  'WHITE RUM',
  'WHITE WINE',
  'WILDBERRY',
]

const NPD_PRODUCT_TYPE_SET = new Set(
  NPD_PRODUCT_TYPES.map((productType) => productType.value),
)
const NPD_TIMEFRAME_SET = new Set(NPD_TIMEFRAMES)
const NPD_FLAVOUR_SET = new Set(NPD_FLAVOURS)

export function isNpdProductType(value: string): boolean {
  return NPD_PRODUCT_TYPE_SET.has(value)
}

export function isNpdTimeframe(value: string): boolean {
  return NPD_TIMEFRAME_SET.has(value)
}

export function isNpdFlavour(value: string): boolean {
  return NPD_FLAVOUR_SET.has(value)
}

export type NpdBlendField =
  | 'name'
  | 'profile'
  | 'organic'
  | 'flavouring'
  | 'flavours'
  | 'ingredients'
  | 'aroma'
  | 'flavourSuggestion'
  | 'notes'

export function npdBlendFieldName(index: number, field: NpdBlendField): string {
  return `blend-${index}-${field}`
}
