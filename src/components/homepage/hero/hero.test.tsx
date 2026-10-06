import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { HOMEPAGE_HERO_FIXTURE } from '../content'
import { HomepageHero } from './hero'

function getHeroImageTag(html: string): string {
  const tag = html
    .match(/<img[^>]*>/g)
    ?.find((candidate) => candidate.includes(HOMEPAGE_HERO_FIXTURE.image.alt))

  if (!tag) throw new Error('Hero image was not rendered')
  return tag
}

describe('HomepageHero', () => {
  it('loads the LCP hero image eagerly with high priority', () => {
    const heroImage = getHeroImageTag(
      renderToStaticMarkup(<HomepageHero hero={HOMEPAGE_HERO_FIXTURE} />),
    )

    expect(heroImage).toContain('loading="eager"')
    expect(heroImage).toMatch(/fetchPriority="high"|fetchpriority="high"/)
    expect(heroImage).not.toContain('loading="lazy"')
  })
})
