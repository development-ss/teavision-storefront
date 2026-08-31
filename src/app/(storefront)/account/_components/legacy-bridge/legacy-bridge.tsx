import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Section } from '@/components/ui/section'

type LegacyBridgeProps = {
  body: string
  heading: string
  primaryHref: string
}

const hostedSignInCopy =
  'Teavision now uses Shopify-hosted Customer Account sign-in.'

export function LegacyBridge({
  body,
  heading,
  primaryHref,
}: LegacyBridgeProps) {
  return (
    <Section.Root tone="surface" spacing="default">
      <Section.Container variant="compact">
        <Card
          padding="lg"
          radius="lg"
          tone="surface"
          className="mx-auto grid max-w-xl gap-6"
        >
          <div className="grid gap-3">
            <p className="type-mono-meta text-gold-deep">Customer account</p>
            <h1 className="type-heading-04 text-ink max-w-[20ch] text-balance">
              {heading}
            </h1>
            <div className="type-body text-ink-soft grid gap-3">
              <p>{hostedSignInCopy}</p>
              <p>{body}</p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              href={primaryHref}
              variant="brand"
              size="lg"
              prefetch={false}
            >
              Sign in with Shopify
            </Button>
            <Button href="/pages/contact" variant="secondary" size="lg">
              Contact support
            </Button>
          </div>
        </Card>
      </Section.Container>
    </Section.Root>
  )
}
