import { Mail, Phone } from 'lucide-react'

import { Eyebrow } from '@/components/ui/eyebrow'
import { Section } from '@/components/ui/section'
import type { ContactActionResult } from '@/lib/contact/types'
import type { HomepageContent } from '@/lib/sanity/home-page'

import { ContactSectionForm } from '../contact-section-form'

type ContactSectionProps = {
  action: (formData: FormData) => Promise<ContactActionResult>
  intro?: HomepageContent['contact']['intro']
  methods?: HomepageContent['contact']['methods']
}

function getContactMethodIcon(href: string) {
  return href.startsWith('tel:') ? Phone : Mail
}

const DEFAULT_CONTACT_INTRO = {
  eyebrow: 'Let the experts grow your business',
  title: 'Speak with our ingredients experts.',
  copy: 'Our tea masters, naturopaths and supply-chain specialists are on hand to source the right ingredients at the right price for your business.',
} satisfies HomepageContent['contact']['intro']

const DEFAULT_CONTACT_METHODS = [
  {
    label: 'Call us',
    value: '1300 729 617',
    href: 'tel:1300729617',
  },
  {
    label: 'Email',
    value: 'info@teavision.com.au',
    href: 'mailto:info@teavision.com.au',
  },
] satisfies HomepageContent['contact']['methods']

export function ContactSection({
  action,
  intro = DEFAULT_CONTACT_INTRO,
  methods = DEFAULT_CONTACT_METHODS,
}: ContactSectionProps) {
  return (
    <Section.Root id="need-help" tone="inverse">
      <Section.Container className="grid gap-10 lg:grid-cols-2 lg:items-start">
        <div>
          {intro.eyebrow && <Eyebrow tone="gold">{intro.eyebrow}</Eyebrow>}
          <h2 className="type-heading-01 text-paper mt-4">{intro.title}</h2>
          {intro.copy && (
            <p className="type-lede text-paper/80 mt-4 max-w-[42ch]">
              {intro.copy}
            </p>
          )}
          <div className="mt-9 flex flex-col gap-5">
            {methods.map((method) => {
              const Icon = getContactMethodIcon(method.href)

              return (
                <a
                  key={method.href}
                  href={method.href}
                  className="group focus-visible:ring-ring flex items-center gap-3.5 rounded-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  <span className="bg-brand-tint text-brand grid size-11 shrink-0 place-items-center rounded-full">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="type-mono-meta text-paper/60 block">
                      {method.label}
                    </span>
                    <span className="font-display text-paper group-hover:text-gold block text-[1.15rem] transition-colors">
                      {method.value}
                    </span>
                  </span>
                </a>
              )
            })}
          </div>
        </div>

        <div className="border-hairline-2 bg-card text-ink rounded-lg border p-7">
          <ContactSectionForm action={action} />
        </div>
      </Section.Container>
    </Section.Root>
  )
}
