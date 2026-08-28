import { ContactForm } from '@/components/contact'
import { Card, Section } from '@/components/ui'
import { submitContactFormAction } from '@/lib/contact/actions'

import { Hero } from './hero'
import { Sidebar } from './sidebar'

export function PageContent() {
  return (
    <>
      <Hero />

      <Section.Root tone="sunken" spacing="compact">
        <Section.Container>
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            <Sidebar />
            <Card className="p-5 sm:p-8" radius="lg">
              <ContactForm action={submitContactFormAction} />
            </Card>
          </div>
        </Section.Container>
      </Section.Root>
    </>
  )
}
