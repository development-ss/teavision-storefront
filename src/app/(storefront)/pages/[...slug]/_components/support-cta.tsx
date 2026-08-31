import { Button } from '@/components/ui/button'
import { Section } from '@/components/ui/section'

import type { PageProfile } from '../_lib/page-profile'

export function SupportCta({ profile }: { profile: PageProfile }) {
  return (
    <Section.Root tone="sunken" className="border-hairline border-t">
      <Section.Container className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-prose">
          <p className="type-eyebrow text-brand before:h-px before:w-5.5 before:bg-current before:opacity-60">
            Wholesale support
          </p>
          <h2 className="type-heading-03 text-ink mt-3">
            {profile.supportTitle}
          </h2>
          <p className="type-body-sm text-ink-soft mt-3">
            {profile.supportCopy}
          </p>
        </div>
        <Button href={profile.primaryAction.href} className="w-full sm:w-auto">
          {profile.primaryAction.label}
        </Button>
      </Section.Container>
    </Section.Root>
  )
}
