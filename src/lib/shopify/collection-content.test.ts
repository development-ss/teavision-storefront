import { describe, expect, it } from 'vitest'

import type { Collection } from './types'
import {
  getCollectionHero,
  getHeroImage,
  normalizeHtml,
  parseCollectionRichHero,
  isPublicCollection,
} from './collection-content'
import { getLegacyHeroImage } from './collection-images'

const image = {
  url: '/tea.webp',
  width: null,
  height: null,
  altText: 'Tea leaves',
}
const collection: Collection = {
  id: 'tea',
  handle: 'tea',
  title: 'Tea',
  description: '',
  descriptionHtml: '',
  featuredImage: image,
  seo: { title: null, description: null },
  updatedAt: '2026-09-08',
}

describe('collection content migration', () => {
  it.each(['metafield', 'rich hero', 'paragraph', 'description'])(
    'retains the complete introduction from %s without adding ellipses',
    (source) => {
      const intro =
        'Carefully selected teas for cafes, retailers and tea lovers. '
          .repeat(8)
          .trim()
      const hero = getCollectionHero({
        ...collection,
        hero:
          source === 'metafield'
            ? { intro, heading: null, image: null }
            : undefined,
        description: source === 'description' ? intro : '',
        descriptionHtml:
          source === 'rich hero'
            ? `<section class="bulk-header"><p>${intro}</p></section>`
            : source === 'paragraph'
              ? `<p>${intro}</p>`
              : '',
      })
      expect(hero.intro).toBe(intro)
    },
  )
  it.each([
    ['tea_masters.png', '/images/collections/tea-masters-hero.webp'],
    [
      'wellness_tea_59455684-1285-4797-a05f-0b6bb3ae9ae8.png',
      '/images/collections/wellness-functional-tea-hero.webp',
    ],
    ['speciality_tea.png', '/images/collections/speciality-tea-hero.webp'],
    [
      'organic_tea_6d641d5d-32cf-4674-8426-4ac32368ad8c.png',
      '/images/collections/certified-organic-tea-hero.webp',
    ],
    [
      'cardboard_cylinder_with_frank_logo2_large.jpg',
      '/cardboard_cylinder_with_frank_logo2.jpg',
    ],
    ['custom_blends_large.jpeg', '/custom_blends.jpeg'],
    [
      'Untitled_design_30_a73872af-f005-47f1-a47a-da89dc67edd4_480x480.png',
      '/Untitled_design_30_a73872af-f005-47f1-a47a-da89dc67edd4.png',
    ],
  ])(
    'preserves the original %s scene instead of substituting the featured photo',
    (filename, expected) => {
      const html = `<img src="https://cdn.shopify.com/s/files/1/0786/8339/files/${filename}">`
      expect(getHeroImage(image, html)?.url).toContain(expected)
      expect(getHeroImage(image, html)?.url).not.toBe(image.url)
    },
  )
  it('retains linked story paragraphs without promoting them into hero actions', () => {
    const html =
      '<section class="bulk-header"><h1>Tea bags</h1><p>Intro.</p><a href="/catalogue">Catalogue</a><h3>Our process</h3><p>See our <a href="/pages/blending">blending service</a>.</p><h4>Packaging</h4></section>'
    expect(parseCollectionRichHero(html)?.actions).toEqual([
      { href: '/catalogue', label: 'Catalogue' },
    ])
    expect(normalizeHtml(html)).toContain(
      '<h2>Our process</h2><p>See our <a href="/pages/blending">blending service</a>.</p><h3>Packaging</h3>',
    )
  })
  it.each([0, 1, 2, 3])(
    'keeps a partial rich hero with %i actions',
    (count) => {
      const html = `<section class="bulk-header"><p>Our tea bags.</p>${Array.from({ length: count }, (_, i) => `<a href="/catalogue-${i}">Catalogue ${i}</a>`).join('')}</section>`
      const hero = getCollectionHero({ ...collection, descriptionHtml: html })
      expect(hero.title).toBe('Tea')
      expect(hero.intro).toBe('Our tea bags.')
      expect(hero.actions).toHaveLength(count)
      expect(hero.image).toEqual(image)
    },
  )
  it('uses explicit fields ahead of legacy content and images', () => {
    const explicitImage = { ...image, url: '/custom.webp' }
    expect(
      getCollectionHero({
        ...collection,
        hero: {
          heading: ' Custom tea ',
          intro: 'Our short intro.',
          image: explicitImage,
        },
        descriptionHtml:
          '<section class="bulk-header"><h1>Old title</h1><p>Old intro</p></section>',
      }),
    ).toMatchObject({
      title: 'Custom tea',
      intro: 'Our short intro.',
      image: explicitImage,
    })
  })
  it('does not turn an arbitrary story image into a hero', () => {
    expect(
      getHeroImage(image, '<p>Our story</p><img src="/process.webp">'),
    ).toEqual(image)
    expect(
      normalizeHtml('<h1>Story</h1><img src="/process.webp"><h3>Detail</h3>'),
    ).toBe('<h2>Story</h2><img src="/process.webp"><h3>Detail</h3>')
  })
  it('replaces the audited poster and removes it from the story', () => {
    const html =
      '<img src="https://cdn.shopify.com/s/files/1/0786/8339/files/wholesale_tea.png"><h2>Our range</h2>'
    expect(getHeroImage(image, html)?.url).toBe(
      '/images/collections/wholesale-tea-hero-v2.webp',
    )
    expect(normalizeHtml(html)).toBe('<h2>Our range</h2>')
    expect(
      getLegacyHeroImage('https://example.com/wholesale_tea.png'),
    ).toBeUndefined()
    expect(getLegacyHeroImage('/toString')).toBeUndefined()
  })
  it('retains additional rich hero story content and outside content', () => {
    const body = normalizeHtml(
      '<section class="bulk-header"><h1>Tea</h1><p>Intro</p><img src="/hero.webp"><a href="/catalogue">Catalogue</a><p>Minimum order quantity: 6000</p><h2>Manufacturing</h2><p>Our process.</p><img src="/process.webp"></section><h2>Ordering</h2><ul><li>Contact us</li></ul>',
    )
    expect(body).toContain(
      '<h2>Manufacturing</h2><p>Our process.</p><img src="/process.webp">',
    )
    expect(body).toContain('<h2>Ordering</h2>')
    expect(body).not.toContain('Intro')
    expect(body).not.toContain('Catalogue')
    expect(body).not.toContain('<h1')
  })
  it('deduplicates actions and excludes unsafe links', () => {
    const hero = parseCollectionRichHero(
      '<section class="bulk-header"><a href="javascript:alert(1)">Bad</a><a href="/catalogue">Catalogue</a><a href="/catalogue">Duplicate</a></section>',
    )
    expect(hero?.actions).toEqual([{ href: '/catalogue', label: 'Catalogue' }])
  })
  it('omits UI-only intro copy and tolerates absent images', () => {
    expect(
      getCollectionHero({
        ...collection,
        description: 'Read More About Tea',
        featuredImage: null,
      }),
    ).toMatchObject({ title: 'Tea', intro: '', image: null })
  })
  it.each(['test-green-tea', 'test', 'frontpage'])(
    'hides %s from discovery',
    (handle) => expect(isPublicCollection(handle)).toBe(false),
  )
  it('keeps ordinary collections public', () =>
    expect(isPublicCollection('tea-masters')).toBe(true))
})
