import type { ReactNode } from 'react'

import { Section } from '@/components/ui'

type AccountLayoutProps = {
  children: ReactNode
}

export default function AccountLayout({ children }: AccountLayoutProps) {
  return (
    <Section.Root
      tone="surface"
      spacing="compact"
      className="min-h-136 md:min-h-128"
    >
      <Section.Container>{children}</Section.Container>
    </Section.Root>
  )
}
