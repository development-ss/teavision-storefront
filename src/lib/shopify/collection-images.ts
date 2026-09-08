import type { ShopifyImage } from './types'

export type HeroImage = ShopifyImage & {
  position?: 'left' | 'center' | 'right'
}

// Migration of audited legacy image assets, not collection layout overrides.
// Preserve each original hero scene; never substitute an unrelated featured photo.
// New collections should use custom.hero_image (a Storefront-readable file reference).
const LEGACY_IMAGES: Record<string, HeroImage> = {
  'wholesale_tea.png': {
    url: '/images/collections/wholesale-tea-hero-v2.webp',
    position: 'right',
    width: 1536,
    height: 1024,
    altText:
      'Teavision tea pouch with loose green tea, a stoneware teapot and wooden scoop',
  },
  'wholesale_spices_37111047-e440-43d3-891e-54fddc0f71f9.png': {
    url: '/images/collections/herbs-and-spices-hero-v2.webp',
    position: 'right',
    width: 1536,
    height: 1024,
    altText:
      'Teavision pouch surrounded by bowls of spices and herbs on burlap',
  },
  'australian_native_tea.png': {
    url: '/images/collections/australian-native-ingredients-hero-v2.webp',
    position: 'right',
    width: 1536,
    height: 1024,
    altText:
      'Bowls of dried native botanicals with foliage, pink blossoms and wooden scoops',
  },
  'wellness_tea_59455684-1285-4797-a05f-0b6bb3ae9ae8.png': {
    url: '/images/collections/wellness-functional-tea-hero.webp',
    position: 'right',
    width: 1536,
    height: 1024,
    altText:
      'Cream teapot and cup beside a bowl of herbal tea, chamomile and lavender',
  },
  'speciality_tea.png': {
    url: '/images/collections/speciality-tea-hero.webp',
    position: 'right',
    width: 1536,
    height: 1024,
    altText:
      'White porcelain gaiwan and cup beside a plate of silvery loose tea leaves',
  },
  'organic_tea_6d641d5d-32cf-4674-8426-4ac32368ad8c.png': {
    url: '/images/collections/certified-organic-tea-hero.webp',
    position: 'right',
    width: 1536,
    height: 1024,
    altText: 'Bowl of dried green tea on pale stone with fresh leafy branches',
  },
  'tea_masters.png': {
    url: '/images/collections/tea-masters-hero.webp',
    position: 'right',
    width: 1536,
    height: 1024,
    altText:
      'Black cast-iron teapot, Tea Masters Selection box and platter of loose teas',
  },
  'tea_banner_cafe.jpg': {
    url: 'https://cdn.shopify.com/s/files/1/0786/8339/files/tea_banner_cafe.jpg?v=1531044553',
    width: 1380,
    height: 410,
    altText: 'A glass of herbal tea and a pyramid tea bag',
  },
  'mushroom_banner.png': {
    url: 'https://cdn.shopify.com/s/files/1/0786/8339/files/mushroom_banner.png?v=1742794069',
    width: 2178,
    height: 859,
    altText: 'A selection of whole mushrooms',
  },
  'TeaVision-14_1.jpg': {
    url: 'https://cdn.shopify.com/s/files/1/0786/8339/files/TeaVision-14_1.jpg?v=1761279097',
    width: 2048,
    height: 1365,
    altText: 'Tea blending at the Teavision facility',
  },
  'green_tea_samples_e8a3b2c3-db06-44ad-b78c-574a187682cb_1024x1024.jpg': {
    url: 'https://cdn.shopify.com/s/files/1/0786/8339/files/green_tea_samples_e8a3b2c3-db06-44ad-b78c-574a187682cb_1024x1024.jpg?v=1649298549',
    width: 1024,
    height: 413,
    altText: 'Four tea samples with loose leaves and herbal ingredients',
  },
  'cardboard_cylinder_with_frank_logo2_large.jpg': {
    url: 'https://cdn.shopify.com/s/files/1/0786/8339/files/cardboard_cylinder_with_frank_logo2.jpg?v=1521361412',
    width: 736,
    height: 981,
    altText: 'Frank Black Noir tea in a cylindrical cardboard package',
  },
  'custom_blends_large.jpeg': {
    url: 'https://cdn.shopify.com/s/files/1/0786/8339/files/custom_blends.jpeg?v=1516623594',
    width: 1000,
    height: 562,
    altText:
      'Three colourful cups filled with dried fruit and botanical ingredients',
  },
  'Untitled_design_30_a73872af-f005-47f1-a47a-da89dc67edd4_480x480.png': {
    url: 'https://cdn.shopify.com/s/files/1/0786/8339/files/Untitled_design_30_a73872af-f005-47f1-a47a-da89dc67edd4.png?v=1635992296',
    width: 2000,
    height: 900,
    altText: 'Iced tea in glass jars with lemon slices and mint',
  },
}

export function getLegacyHeroImage(source: string): HeroImage | undefined {
  try {
    const url = new URL(source, 'https://www.teavision.com.au')
    if (!['cdn.shopify.com', 'www.teavision.com.au'].includes(url.hostname))
      return undefined
    const filename = url.pathname.split('/').at(-1) ?? ''
    return Object.hasOwn(LEGACY_IMAGES, filename)
      ? LEGACY_IMAGES[filename]
      : undefined
  } catch {
    return undefined
  }
}
