/* eslint-disable teavision/no-raw-section -- Native labelled sections group legal document content; Section.Root is reserved for layout bands. */

import type { Metadata } from 'next'

import { Card, Section } from '@/components/ui'
import { getLegalPolicy } from '@/lib/legal/policies'
import { withNoindexRobots } from '@/lib/seo/noindex'

const policy = getLegalPolicy('refund-policy')

export const metadata: Metadata = withNoindexRobots({
  title: policy.title,
  description: policy.description,
  alternates: { canonical: policy.href },
  openGraph: {
    title: policy.title,
    description: policy.description,
    url: policy.href,
    type: 'website',
  },
})

export default function RefundPolicyPage() {
  return (
    <Section.Root tone="surface">
      <Section.Container>
        <div className="max-w-prose">
          <h1 id="refund-policy-title" className="type-heading-02 text-ink">
            {policy.title}
          </h1>

          <Card
            as="article"
            aria-labelledby="refund-policy-title"
            padding="lg"
            radius="md"
            className="border-hairline bg-card mt-8"
          >
            <section aria-labelledby="returns-heading">
              <h2 id="returns-heading" className="type-heading-05 text-ink">
                Returns
              </h2>
              <p className="type-body text-ink-soft mt-4">
                Our policy lasts 14 days. If 14 days have passed since your
                purchase, unfortunately we cannot offer you a credit or
                exchange.
              </p>
              <p className="type-body text-ink-soft mt-4">
                To be eligible for a return, exchange, or credit, your item must
                be considered defective or damaged and must be reported within
                14 days of receiving your order.
              </p>
              <p className="type-body text-ink-soft mt-4">
                Teavision is a wholesaler and does not provide a warranty on a
                product if it has been repackaged, re-blended, or incorrectly
                stored. Please see our storage conditions below.
              </p>
            </section>

            <section
              aria-labelledby="quality-assurance-heading"
              className="mt-8"
            >
              <h2
                id="quality-assurance-heading"
                className="type-heading-05 text-ink"
              >
                Quality Assurance
              </h2>
              <p className="type-body text-ink-soft mt-2">
                Storage conditions, shelf life, defective products, and claims
              </p>
              <p className="type-body text-ink-soft mt-4">
                Teavision supplies agricultural products, many of which are
                organic. We have a tolerance level of 3% for agricultural
                foreign matter, such as stones, leaves, and bark. We do not
                consider this to be contamination unless it exceeds 3% and,
                accordingly, do not warrant minor foreign matter that is
                agricultural in nature.
              </p>
              <p className="type-body text-ink-soft mt-4">
                The shelf life provided by Teavision at the time of supply is
                subject to the purchaser or consumer meeting our recommended
                storage conditions. Products should be stored at ambient
                temperature in airtight packaging, away from direct sunlight and
                humidity. In warmer climates with high humidity, it is
                especially important to ensure appropriate storage to avoid
                insect contamination.
              </p>
              <p className="type-body text-ink-soft mt-4">
                Teavision can supply a certificate of analysis (CoA) upon
                request for any ingredient to show that the product and batch
                have been tested to meet Australian food health and safety
                standards. If you require further testing, such as testing for
                heavy metals or other substances, we recommend arranging this
                yourself through an Australian laboratory.
              </p>
            </section>

            <section aria-labelledby="claims-heading" className="mt-8">
              <h2 id="claims-heading" className="type-heading-05 text-ink">
                Defective Products and Claims
              </h2>
              <p className="type-body text-ink-soft mt-4">
                If you believe that your product is defective, contaminated, or
                otherwise unfit for consumption, please report it to our team at{' '}
                <a
                  href="mailto:info@teavision.com.au"
                  className="text-brand hover:text-brand-deep focus-visible:ring-ring rounded underline underline-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  info@teavision.com.au
                </a>{' '}
                and we will investigate it for you.
              </p>
              <p className="type-body text-ink-soft mt-4">
                If a product is proven to be defective after Teavision has
                conducted an investigation and a claim is made, Teavision will
                issue a credit for the agreed amount but will not offer a
                refund. Each case is unique and may be treated differently
                depending on the circumstances. The Teavision management team
                will assist with this process to find a fair and reasonable
                outcome for all parties.
              </p>
              <p className="type-body text-ink-soft mt-4">
                To complete your return, we require a receipt or proof of
                purchase.
              </p>
              <p className="type-body text-ink-soft mt-4">
                In certain situations, only a partial credit may be granted,
                including:
              </p>
              <ul className="type-body text-ink-soft mt-3 list-disc space-y-2 pl-6">
                <li>
                  An item that is not in its original condition, is damaged, or
                  has missing parts for reasons not due to our error.
                </li>
                <li>An item returned more than 14 days after delivery.</li>
              </ul>
            </section>

            <section aria-labelledby="credits-heading" className="mt-8">
              <h2 id="credits-heading" className="type-heading-05 text-ink">
                Credits
              </h2>
              <p className="type-body text-ink-soft mt-4">
                Once your return is received and inspected, we will email you to
                confirm that we have received the returned item. We will also
                notify you whether your credit has been approved or rejected.
              </p>
            </section>

            <section aria-labelledby="sale-items-heading" className="mt-8">
              <h2 id="sale-items-heading" className="type-heading-05 text-ink">
                Sale Items
              </h2>
              <p className="type-body text-ink-soft mt-4">
                Only regular-priced items may be refunded. Unfortunately, sale
                items cannot be refunded.
              </p>
            </section>

            <section aria-labelledby="exchanges-heading" className="mt-8">
              <h2 id="exchanges-heading" className="type-heading-05 text-ink">
                Exchanges
              </h2>
              <p className="type-body text-ink-soft mt-4">
                We only replace items if they are defective or damaged. If you
                need to exchange an item for the same item, email us at{' '}
                <a
                  href="mailto:info@teavision.com.au"
                  className="text-brand hover:text-brand-deep focus-visible:ring-ring rounded underline underline-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  info@teavision.com.au
                </a>{' '}
                and we will assist you with the next steps.
              </p>
            </section>

            <section aria-labelledby="gifts-heading" className="mt-8">
              <h2 id="gifts-heading" className="type-heading-05 text-ink">
                Gifts
              </h2>
              <p className="type-body text-ink-soft mt-4">
                If the item was marked as a gift when purchased and shipped
                directly to you, you will receive a gift credit for the value of
                your return. Once the returned item is received, a gift
                certificate will be mailed to you.
              </p>
              <p className="type-body text-ink-soft mt-4">
                If the item was not marked as a gift when purchased, or the gift
                giver had the order shipped to themselves to give to you later,
                we will send a refund to the gift giver and they will be
                notified of your return.
              </p>
            </section>

            <section aria-labelledby="shipping-heading" className="mt-8">
              <h2 id="shipping-heading" className="type-heading-05 text-ink">
                Shipping
              </h2>
              <p className="type-body text-ink-soft mt-4">
                To return your product, mail it to Teavision&apos;s listed
                business address.
              </p>
              <p className="type-body text-ink-soft mt-4">
                You are responsible for paying the shipping costs for returning
                your item. Shipping costs are non-refundable. If you receive a
                credit, the cost of return shipping may also be included in your
                credit.
              </p>
              <p className="type-body text-ink-soft mt-4">
                Depending on where you live, the time it takes for your
                exchanged product to reach you may vary.
              </p>
              <p className="type-body text-ink-soft mt-4">
                If you are shipping an item valued at more than $75, consider
                using a trackable shipping service or purchasing shipping
                insurance. We do not guarantee that we will receive your
                returned item.
              </p>
            </section>
          </Card>
        </div>
      </Section.Container>
    </Section.Root>
  )
}
