import { ContactForm } from '@/components/contact/contact-form'
import { Card } from '@/components/ui/card'
import { Eyebrow } from '@/components/ui/eyebrow'
import { submitContactFormAction } from '@/lib/contact/actions'

export function WholesaleInclusions() {
  return (
    <Card as="aside" className="p-5 sm:p-7">
      <ContactForm
        action={submitContactFormAction}
        eyebrow="Wholesale enquiry"
        title="Contact the wholesale team"
        description="Share your sourcing needs and monthly volume. The wholesale team will review your enquiry through the protected Teavision contact workflow."
        submitLabel="Send enquiry"
        pendingLabel="Sending enquiry..."
      />

      <div className="border-hairline mt-7 border-t pt-6">
        <Eyebrow tone="muted">Direct contact</Eyebrow>
        <dl className="mt-4 grid gap-4">
          <div>
            <dt className="type-mono-meta text-ink-faint">Phone</dt>
            <dd className="type-label text-ink mt-1">
              <a
                href="tel:1300729617"
                className="text-brand hover:text-brand-deep focus-visible:ring-ring rounded-sm hover:underline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                1300 729 617
              </a>
            </dd>
          </div>
          <div>
            <dt className="type-mono-meta text-ink-faint">Email</dt>
            <dd className="type-label text-ink mt-1">
              <a
                href="mailto:wholesale@teavision.com.au"
                className="text-brand hover:text-brand-deep focus-visible:ring-ring rounded-sm hover:underline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                wholesale@teavision.com.au
              </a>
            </dd>
          </div>
        </dl>
      </div>
    </Card>
  )
}
