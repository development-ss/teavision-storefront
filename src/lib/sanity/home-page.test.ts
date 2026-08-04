import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cacheLife, cacheTag } from 'next/cache'

import {
  getSanityImageUrl,
  sanityDraftFetch,
  sanityFetch,
} from '@/lib/sanity/client'
import {
  getSanityDraftReadToken,
  getSanityPreviewSecret,
} from '@/lib/sanity/env'
import { homePageQuery } from '@/lib/sanity/queries/home-page'
import type {
  SanityHomePageResult,
  SanityImageWithAlt,
} from '@/lib/sanity/types'

import { getDraftHomepage, getHomepage } from './home-page'

vi.mock('next/cache', () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}))

vi.mock('server-only', () => ({}))

vi.mock('@/lib/sanity/client', () => ({
  getSanityImageUrl: vi.fn(),
  sanityDraftFetch: vi.fn(),
  sanityFetch: vi.fn(),
}))

function makeImage(id: string): SanityImageWithAlt {
  return {
    alt: `${id} alt`,
    attribution: null,
    caption: null,
    image: {
      asset: {
        _id: `image-${id}`,
        url: `https://cdn.sanity.io/images/project/dataset/${id}.jpg`,
        metadata: {
          dimensions: {
            width: 1200,
            height: 800,
            aspectRatio: 1.5,
          },
          lqip: `data:image/jpeg;base64,${id}`,
        },
      },
    },
  }
}

function makeImageWithoutDimensions(): SanityImageWithAlt {
  return {
    ...makeImage('missing-dimensions'),
    image: {
      asset: {
        _id: 'image-missing-dimensions',
        url: 'https://cdn.sanity.io/images/project/dataset/missing.jpg',
        metadata: {
          dimensions: null,
          lqip: null,
        },
      },
    },
  }
}

function makeSection(title: string) {
  return {
    eyebrow: `${title} eyebrow`,
    title,
    copy: `${title} copy`,
  }
}

function makeLink(label: string, href = '/collections') {
  return { label, href }
}

function makeCard(index: number) {
  return {
    action: 'Shop Now',
    badge: index === 7 ? makeImage(`badge-${index}`) : null,
    body: `Card ${index} body`,
    href: `/collections/card-${index}`,
    image: makeImage(`card-${index}`),
    title: `Card ${index}`,
  }
}

function makeHomepage(): SanityHomePageResult {
  return {
    _id: 'homePage',
    title: 'Homepage',
    slug: '/',
    hero: {
      copy: 'Hero copy',
      cta: makeLink('Explore Our Teas'),
      eyebrow: 'Hero eyebrow',
      image: makeImage('hero'),
      proofPoints: Array.from({ length: 4 }, (_, index) => ({
        description: `Proof ${index} description`,
        iconKey: index === 0 ? null : 'Truck',
        image: index === 0 ? makeImage('australian-flag') : null,
        title: `Proof ${index}`,
      })),
      title: "Australia's #1 tea company",
      trustMarks: makeImage('trust-marks'),
    },
    productRange: {
      cards: Array.from({ length: 11 }, (_, index) => makeCard(index)),
      intro: makeSection('Product range'),
    },
    newsletter: {
      intro: makeSection('Newsletter'),
    },
    privateLabel: {
      cards: Array.from({ length: 3 }, (_, index) => ({
        ...makeCard(index),
        action: 'Explore',
        href: `/pages/service-${index}`,
      })),
      intro: makeSection('Private label'),
    },
    organicHerbs: {
      checklist: ['Freight insurance', 'Quality standards', 'Reliable supply'],
      cta: makeLink(
        'Explore Our Herbs & Spices',
        '/collections/herbs-and-spices',
      ),
      image: makeImage('organic-herbs'),
      intro: makeSection('Organic herbs'),
    },
    supplyChain: {
      cta: makeLink('Contact the team', '/pages/contact'),
      intro: makeSection('Supply chain'),
    },
    certificationCoverage: {
      items: Array.from({ length: 6 }, (_, index) => ({
        iconKey: 'Shield',
        label: `Certification ${index}`,
      })),
    },
    supplyChainProtection: {
      intro: makeSection('Supply chain protection'),
      marks: Array.from({ length: 7 }, (_, index) =>
        makeImage(`mark-${index}`),
      ),
    },
    testimonials: {
      intro: makeSection('Testimonials'),
      items: [
        {
          brand: 'MOOD Tea',
          logo: makeImage('mood-tea-logo'),
          name: 'Ashley McGrath',
          quote: 'A trusted partner.',
          role: 'GM Social Enterprise',
        },
      ],
    },
    teaJournal: {
      blogHandle: 'teavision-blogs',
      intro: makeSection('Tea Journal'),
      linkLabel: 'View all',
      maxPosts: 3,
    },
    contact: {
      intro: makeSection('Contact'),
      methods: [
        { href: 'tel:1300729617', label: 'Call us', value: '1300 729 617' },
        {
          href: 'mailto:info@teavision.com.au',
          label: 'Email',
          value: 'info@teavision.com.au',
        },
      ],
    },
    catalogueCta: {
      cta: makeLink('Download Catalogue', '/pages/download-catalogues'),
      intro: makeSection('Catalogue'),
      secondaryCta: makeLink('Browse online', '/collections'),
    },
    faq: {
      intro: makeSection('FAQ'),
      items: [{ answer: 'Answer', question: 'Question?' }],
    },
    seo: {
      canonicalPath: '/',
      metaDescription: 'Homepage description',
      metaTitle: 'Homepage title',
      noIndex: false,
      ogImage: makeImage('og'),
    },
  }
}

describe('getHomepage', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  beforeEach(() => {
    vi.mocked(cacheLife).mockReset()
    vi.mocked(cacheTag).mockReset()
    vi.mocked(sanityDraftFetch).mockReset()
    vi.mocked(sanityFetch).mockReset()
    vi.mocked(getSanityImageUrl).mockReset()
    vi.mocked(getSanityImageUrl).mockImplementation((_source, options = {}) => {
      const width = options.width ? `w=${options.width}` : null
      const quality = options.quality ? `q=${options.quality}` : null
      const fit = options.fit ? `fit=${options.fit}` : null

      return ['https://cdn.sanity.io/generated.jpg', width, quality, fit]
        .filter((part): part is string => Boolean(part))
        .join('?')
    })
  })

  it('rejects when the Sanity homePage singleton is missing', async () => {
    vi.mocked(sanityFetch).mockResolvedValue(null)

    await expect(getHomepage()).rejects.toThrow(/homePage/i)
  })

  it('rejects missing required SEO fields and non-root canonical paths', async () => {
    const missingTitle = makeHomepage()
    const missingTitleSeo = missingTitle.seo
    if (!missingTitleSeo) throw new Error('Fixture SEO is required')
    missingTitle.seo = {
      ...missingTitleSeo,
      metaTitle: null,
    }
    vi.mocked(sanityFetch).mockResolvedValueOnce(missingTitle)

    await expect(getHomepage()).rejects.toThrow(/seo\.metaTitle/i)

    const wrongCanonical = makeHomepage()
    const wrongCanonicalSeo = wrongCanonical.seo
    if (!wrongCanonicalSeo) throw new Error('Fixture SEO is required')
    wrongCanonical.seo = {
      ...wrongCanonicalSeo,
      canonicalPath: '/home',
    }
    vi.mocked(sanityFetch).mockResolvedValueOnce(wrongCanonical)

    await expect(getHomepage()).rejects.toThrow(/canonical/i)
  })

  it('rejects unsafe CMS-authored hrefs', async () => {
    const result = makeHomepage()
    const productRange = result.productRange
    const cards = productRange?.cards
    const firstCard = cards?.[0]
    if (!productRange || !cards || !firstCard) {
      throw new Error('Fixture product range card is required')
    }
    cards[0] = {
      ...firstCard,
      href: 'javascript:alert(1)',
    }
    vi.mocked(sanityFetch).mockResolvedValue(result)

    await expect(getHomepage()).rejects.toThrow(/href/i)
  })

  it('removes Shopify collection suffixes from collection card titles', async () => {
    const result = makeHomepage()
    const cards = result.productRange?.cards
    const firstCard = cards?.[0]
    if (!cards || !firstCard) {
      throw new Error('Fixture product range card is required')
    }
    cards[0] = {
      ...firstCard,
      title: 'Organic Tea Collection',
    }
    vi.mocked(sanityFetch).mockResolvedValue(result)

    const homepage = await getHomepage()

    expect(homepage.productRange.cards[0]?.title).toBe('Organic Tea')
  })

  it('rejects required authored images without dimensions', async () => {
    const result = makeHomepage()
    const hero = result.hero
    if (!hero) throw new Error('Fixture hero is required')
    result.hero = {
      ...hero,
      image: makeImageWithoutDimensions(),
    }
    vi.mocked(sanityFetch).mockResolvedValue(result)

    await expect(getHomepage()).rejects.toThrow(/dimensions/i)
  })

  it('normalizes seeded content shape and caches the homepage boundary', async () => {
    vi.mocked(sanityFetch).mockResolvedValue(makeHomepage())

    const homepage = await getHomepage()

    expect(cacheTag).toHaveBeenCalledWith('homePage', 'sanity-homepage')
    expect(cacheLife).toHaveBeenCalledWith('hours')
    expect(homepage.productRange.cards).toHaveLength(11)
    expect(homepage.privateLabel.cards).toHaveLength(3)
    expect(homepage.hero.proofPoints).toHaveLength(4)
    expect(homepage.certificationCoverage.items).toHaveLength(6)
    expect(homepage.supplyChainProtection.marks).toHaveLength(7)
    expect(homepage.teaJournal).toMatchObject({
      blogHandle: 'teavision-blogs',
      linkLabel: 'View all',
      maxPosts: 3,
    })
    expect(homepage.seo).toMatchObject({
      canonicalPath: '/',
      description: 'Homepage description',
      noIndex: false,
      title: 'Homepage title',
    })

    expect(homepage.hero.image.src).toBe(
      'https://cdn.sanity.io/images/project/dataset/hero.jpg',
    )
    expect(getSanityImageUrl).not.toHaveBeenCalledWith(
      expect.objectContaining({
        asset: expect.objectContaining({ _id: 'image-hero' }),
      }),
      expect.anything(),
    )
    expect(getSanityImageUrl).toHaveBeenCalledWith(
      expect.objectContaining({
        asset: expect.objectContaining({ _id: 'image-card-0' }),
      }),
      { fit: 'max', quality: 75, width: 900 },
    )
    expect(getSanityImageUrl).toHaveBeenCalledWith(
      expect.objectContaining({
        asset: expect.objectContaining({ _id: 'image-mark-0' }),
      }),
      { fit: 'max', quality: 75, width: 640 },
    )
  })

  it('requires dedicated draft preview environment values', () => {
    vi.stubEnv('SANITY_API_READ_TOKEN', '  draft-read-token  ')
    vi.stubEnv('SANITY_PREVIEW_SECRET', '  preview-secret  ')

    expect(getSanityDraftReadToken()).toBe('draft-read-token')
    expect(getSanityPreviewSecret()).toBe('preview-secret')

    vi.stubEnv('SANITY_API_READ_TOKEN', ' ')
    vi.stubEnv('SANITY_PREVIEW_SECRET', ' ')

    expect(() => getSanityDraftReadToken()).toThrow(/SANITY_API_READ_TOKEN/)
    expect(() => getSanityPreviewSecret()).toThrow(/SANITY_PREVIEW_SECRET/)
  })

  it('normalizes draft homepage content without using published cache tags', async () => {
    vi.mocked(sanityDraftFetch).mockResolvedValue(makeHomepage())

    const homepage = await getDraftHomepage()

    expect(sanityDraftFetch).toHaveBeenCalledWith(homePageQuery)
    expect(cacheTag).not.toHaveBeenCalled()
    expect(cacheLife).not.toHaveBeenCalled()
    expect(homepage.title).toBe('Homepage')
    expect(homepage.hero.title).toBe("Australia's #1 tea company")
    expect(homepage.seo.canonicalPath).toBe('/')
  })

  it('rejects missing draft homepage content without falling back to published content', async () => {
    vi.mocked(sanityDraftFetch).mockResolvedValue(null)

    await expect(getDraftHomepage()).rejects.toThrow(/homePage/i)

    expect(sanityFetch).not.toHaveBeenCalled()
    expect(cacheTag).not.toHaveBeenCalled()
    expect(cacheLife).not.toHaveBeenCalled()
  })
})
