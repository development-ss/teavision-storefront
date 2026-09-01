import { ContactForm } from '@/components/contact/contact-form'
import { Card } from '@/components/ui/card'
import { Section } from '@/components/ui/section'
import { submitContactFormAction } from '@/lib/contact/actions'

import { Hero } from './hero'
import { Sidebar } from './sidebar'

type PageContentProps = {
  initialMessage?: string
}

export function PageContent({ initialMessage }: PageContentProps) {
  return (
    <>
      <Hero />

      <Section.Root tone="brand" spacing="compact">
        <Section.Container>
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            <Sidebar />
            <Card className="p-5 sm:p-8" radius="lg">
              <ContactForm
                action={submitContactFormAction}
                initialMessage={initialMessage}
              />
            </Card>
          </div>
        </Section.Container>
      </Section.Root>
    </>
  )
}
