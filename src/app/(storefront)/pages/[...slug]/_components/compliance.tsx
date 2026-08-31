import { Mail } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Section } from '@/components/ui/section'
import { cn } from '@/lib/utils'

import {
  buildRequestHref,
  COMPLIANCE_PRIVACY_EMAIL,
  COMPLIANCE_PRIVACY_LINK_HREF,
  COMPLIANCE_PRIVACY_LINK_LABEL,
  type CompliancePage,
} from '../_lib/compliance'

const LINK_CLASS_NAME =
  'text-brand hover:text-brand-deep underline underline-offset-2'

export function Compliance({ page }: { page: CompliancePage }) {
  return (
    <Section.Root tone="surface">
      <Section.Container>
        <div className="grid gap-x-12 gap-y-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Eyebrow>Your data rights</Eyebrow>
            <h2 className="type-heading-03 text-ink mt-4 text-balance">
              How to make a request
            </h2>
            <p className="type-body text-ink-soft mt-4">
              We confirm every request by email to protect your data. Use a
              button from the address on your account, and we will verify it
              before we act.
            </p>
            <p className="type-body-sm text-ink-soft mt-4">
              Questions first? Email{' '}
              <Link
                href={`mailto:${COMPLIANCE_PRIVACY_EMAIL}`}
                className={LINK_CLASS_NAME}
              >
                {COMPLIANCE_PRIVACY_EMAIL}
              </Link>
              , or read our{' '}
              <Link
                href={COMPLIANCE_PRIVACY_LINK_HREF}
                className={LINK_CLASS_NAME}
              >
                {COMPLIANCE_PRIVACY_LINK_LABEL}
              </Link>
              .
            </p>
          </div>

          <div className="lg:col-span-8 lg:col-start-5">
            <ul className="border-hairline border-t">
              {page.rights.map((right) => (
                <li
                  key={right.subject}
                  className="border-hairline flex flex-col gap-4 border-b py-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8"
                >
                  <div className="min-w-0">
                    <h3
                      className={cn(
                        'type-heading-04',
                        right.tone === 'danger' ? 'text-danger' : 'text-ink',
                      )}
                    >
                      {right.title}
                    </h3>
                    <p className="type-body-sm text-ink-soft mt-1.5 max-w-[52ch]">
                      {right.description}
                    </p>
                  </div>
                  <Button
                    href={buildRequestHref(page.requestPrefix, right.subject)}
                    variant="secondary"
                    size="sm"
                    className="w-full shrink-0 sm:w-auto"
                  >
                    <Mail aria-hidden className="size-4" />
                    Request by email
                  </Button>
                </li>
              ))}
            </ul>

            {page.jurisdiction ? (
              <p className="type-body-sm text-ink-faint mt-6">
                {page.jurisdiction}
              </p>
            ) : null}
          </div>
        </div>
      </Section.Container>
    </Section.Root>
  )
}
