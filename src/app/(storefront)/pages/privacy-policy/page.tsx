/* eslint-disable teavision/no-raw-section -- Native labelled sections group legal document content; Section.Root is reserved for layout bands. */

import type { Metadata } from 'next'

import { Card, Section } from '@/components/ui'
import { getLegalPolicy } from '@/lib/legal/policies'
import { withNoindexRobots } from '@/lib/seo/noindex'

const policy = getLegalPolicy('privacy-policy')
const LINK_CLASS_NAME =
  'text-brand hover:text-brand-deep focus-visible:ring-ring rounded underline underline-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'

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

export default function PrivacyPolicyPage() {
  return (
    <Section.Root tone="surface">
      <Section.Container>
        <div className="max-w-prose">
          <h1 id="privacy-policy-title" className="type-heading-02 text-ink">
            {policy.title}
          </h1>

          <Card
            as="article"
            aria-labelledby="privacy-policy-title"
            padding="lg"
            radius="md"
            className="border-hairline bg-card mt-8"
          >
            <section aria-labelledby="information-heading">
              <h2 id="information-heading" className="type-heading-05 text-ink">
                1. What We Do With Your Information
              </h2>
              <p className="type-body text-ink-soft mt-4">
                When you purchase something from our store, as part of the
                buying and selling process, we collect the personal information
                you provide, such as your name, address, and email address.
              </p>
              <p className="type-body text-ink-soft mt-4">
                When you browse our store, we also automatically receive your
                computer&apos;s Internet Protocol (IP) address. This provides us
                with information that helps us learn about your browser and
                operating system.
              </p>
              <p className="type-body text-ink-soft mt-4">
                With your permission, we may send you marketing emails about our
                store, new products, and other updates.
              </p>
            </section>

            <section aria-labelledby="consent-heading" className="mt-8">
              <h2 id="consent-heading" className="type-heading-05 text-ink">
                2. Consent
              </h2>
              <h3 className="type-label text-ink mt-5">
                How do we obtain your consent?
              </h3>
              <p className="type-body text-ink-soft mt-3">
                When you provide us with personal information to complete a
                transaction, verify your credit card, place an order, arrange
                delivery, or return a purchase, we imply that you consent to our
                collecting and using it for that specific purpose only.
              </p>
              <p className="type-body text-ink-soft mt-4">
                If we ask for your personal information for a secondary purpose,
                such as marketing, we will either ask you directly for your
                express consent or provide you with an opportunity to say no.
              </p>
              <h3 className="type-label text-ink mt-5">
                How can you withdraw your consent?
              </h3>
              <p className="type-body text-ink-soft mt-3">
                If you opt in and later change your mind, you may withdraw your
                consent for us to contact you, or for the continued collection,
                use, or disclosure of your information, at any time by
                contacting us at{' '}
                <a
                  href="mailto:info@teavision.com.au"
                  className={LINK_CLASS_NAME}
                >
                  info@teavision.com.au
                </a>
                .
              </p>
            </section>

            <section aria-labelledby="disclosure-heading" className="mt-8">
              <h2 id="disclosure-heading" className="type-heading-05 text-ink">
                3. Disclosure
              </h2>
              <p className="type-body text-ink-soft mt-4">
                We may disclose your personal information if we are required by
                law to do so or if you violate our Terms of Service.
              </p>
            </section>

            <section aria-labelledby="shopify-heading" className="mt-8">
              <h2 id="shopify-heading" className="type-heading-05 text-ink">
                4. Shopify
              </h2>
              <p className="type-body text-ink-soft mt-4">
                Our store is hosted on Shopify Inc. Shopify provides the online
                ecommerce platform that allows us to sell our products and
                services to you.
              </p>
              <p className="type-body text-ink-soft mt-4">
                Your data is stored through Shopify&apos;s data storage,
                databases, and general Shopify application. Shopify stores your
                data on a secure server behind a firewall.
              </p>
              <h3 className="type-label text-ink mt-5">Payment</h3>
              <p className="type-body text-ink-soft mt-3">
                If you choose a direct payment gateway to complete your
                purchase, Shopify stores your credit card data. It is encrypted
                through the Payment Card Industry Data Security Standard
                (PCI-DSS). Your purchase transaction data is stored only for as
                long as necessary to complete the purchase transaction. Once the
                transaction is complete, your purchase transaction information
                is deleted.
              </p>
              <p className="type-body text-ink-soft mt-4">
                All direct payment gateways adhere to the standards set by
                PCI-DSS and managed by the PCI Security Standards Council, a
                joint effort of brands including Visa, Mastercard, American
                Express, and Discover.
              </p>
              <p className="type-body text-ink-soft mt-4">
                PCI-DSS requirements help ensure the secure handling of credit
                card information by our store and its service providers.
              </p>
              <p className="type-body text-ink-soft mt-4">
                For more information, read Shopify&apos;s{' '}
                <a
                  href="https://www.shopify.com/legal/terms"
                  className={LINK_CLASS_NAME}
                >
                  Terms of Service
                </a>{' '}
                or{' '}
                <a
                  href="https://www.shopify.com/legal/privacy"
                  className={LINK_CLASS_NAME}
                >
                  Privacy Policy
                </a>
                .
              </p>
            </section>

            <section
              aria-labelledby="third-party-services-heading"
              className="mt-8"
            >
              <h2
                id="third-party-services-heading"
                className="type-heading-05 text-ink"
              >
                5. Third-Party Services
              </h2>
              <p className="type-body text-ink-soft mt-4">
                In general, the third-party providers we use will collect, use,
                and disclose your information only to the extent necessary to
                perform the services they provide to us.
              </p>
              <p className="type-body text-ink-soft mt-4">
                Certain third-party service providers, such as payment gateways
                and other payment transaction processors, have their own privacy
                policies regarding the information we are required to provide to
                them for your purchase-related transactions.
              </p>
              <p className="type-body text-ink-soft mt-4">
                We recommend reading these providers&apos; privacy policies so
                that you understand how they will handle your personal
                information.
              </p>
              <p className="type-body text-ink-soft mt-4">
                Certain providers may be located in, or have facilities in, a
                jurisdiction different from either you or us. If you proceed
                with a transaction involving a third-party service provider,
                your information may become subject to the laws of the
                jurisdictions in which that provider or its facilities are
                located.
              </p>
              <p className="type-body text-ink-soft mt-4">
                For example, if you are located in Canada and your transaction
                is processed by a payment gateway located in the United States,
                your personal information used to complete that transaction may
                be subject to disclosure under United States legislation,
                including the Patriot Act.
              </p>
              <p className="type-body text-ink-soft mt-4">
                Once you leave our store&apos;s website or are redirected to a
                third-party website or application, you are no longer governed
                by this Privacy Policy or our website&apos;s Terms of Service.
              </p>
              <h3 className="type-label text-ink mt-5">External links</h3>
              <p className="type-body text-ink-soft mt-3">
                Links on our store may direct you away from our site. We are not
                responsible for the privacy practices of other sites and
                encourage you to read their privacy statements.
              </p>
            </section>

            <section aria-labelledby="security-heading" className="mt-8">
              <h2 id="security-heading" className="type-heading-05 text-ink">
                6. Security
              </h2>
              <p className="type-body text-ink-soft mt-4">
                To protect your personal information, we take reasonable
                precautions and follow industry best practices to ensure that it
                is not inappropriately lost, misused, accessed, disclosed,
                altered, or destroyed.
              </p>
              <p className="type-body text-ink-soft mt-4">
                If you provide us with credit card information, it is encrypted
                using Secure Sockets Layer (SSL) technology and stored with
                AES-256 encryption. Although no method of transmission over the
                Internet or electronic storage is 100% secure, we follow all
                PCI-DSS requirements and implement additional generally accepted
                industry standards.
              </p>
            </section>

            <section aria-labelledby="cookies-heading" className="mt-8">
              <h2 id="cookies-heading" className="type-heading-05 text-ink">
                7. Cookies
              </h2>
              <p className="type-body text-ink-soft mt-4">
                The following cookies may be used by our store. They are listed
                here so that you can decide whether you want to opt out where
                applicable.
              </p>
              <dl className="mt-5 space-y-5">
                <div>
                  <dt className="type-label text-ink">_session_id</dt>
                  <dd className="type-body text-ink-soft mt-2">
                    A unique token used for the session. It allows Shopify to
                    store information about your session, including the referrer
                    and landing page.
                  </dd>
                </div>
                <div>
                  <dt className="type-label text-ink">_shopify_visit</dt>
                  <dd className="type-body text-ink-soft mt-2">
                    Holds no data and persists for 30 minutes from the last
                    visit. It is used by our website provider&apos;s internal
                    statistics tracker to record the number of visits.
                  </dd>
                </div>
                <div>
                  <dt className="type-label text-ink">_shopify_uniq</dt>
                  <dd className="type-body text-ink-soft mt-2">
                    Holds no data and expires at midnight, relative to the
                    visitor, on the following day. It counts the number of
                    visits to a store by a single customer.
                  </dd>
                </div>
                <div>
                  <dt className="type-label text-ink">cart</dt>
                  <dd className="type-body text-ink-soft mt-2">
                    A unique token that persists for two weeks and stores
                    information about the contents of your cart.
                  </dd>
                </div>
                <div>
                  <dt className="type-label text-ink">_secure_session_id</dt>
                  <dd className="type-body text-ink-soft mt-2">
                    A unique token used for the session.
                  </dd>
                </div>
                <div>
                  <dt className="type-label text-ink">storefront_digest</dt>
                  <dd className="type-body text-ink-soft mt-2">
                    A unique token stored indefinitely. If the store has a
                    password, it is used to determine whether the current
                    visitor has access.
                  </dd>
                </div>
              </dl>
            </section>

            <section aria-labelledby="age-heading" className="mt-8">
              <h2 id="age-heading" className="type-heading-05 text-ink">
                8. Age of Consent
              </h2>
              <p className="type-body text-ink-soft mt-4">
                By using this site, you represent that you are at least the age
                of majority in your state or province of residence, or that you
                are the age of majority in your state or province of residence
                and have given us your consent to allow any of your minor
                dependants to use this site.
              </p>
            </section>

            <section aria-labelledby="changes-heading" className="mt-8">
              <h2 id="changes-heading" className="type-heading-05 text-ink">
                9. Changes to This Privacy Policy
              </h2>
              <p className="type-body text-ink-soft mt-4">
                We reserve the right to modify this Privacy Policy at any time,
                so please review it frequently. Changes and clarifications take
                effect immediately when posted on the website.
              </p>
              <p className="type-body text-ink-soft mt-4">
                If we make material changes to this policy, we will notify you
                here that it has been updated so that you are aware of what
                information we collect, how we use it, and under what
                circumstances, if any, we use or disclose it.
              </p>
              <p className="type-body text-ink-soft mt-4">
                If our store is acquired by or merged with another company, your
                information may be transferred to the new owners so that we may
                continue to sell products to you.
              </p>
            </section>

            <section aria-labelledby="contact-heading" className="mt-8">
              <h2 id="contact-heading" className="type-heading-05 text-ink">
                Questions and Contact Information
              </h2>
              <p className="type-body text-ink-soft mt-4">
                To access, correct, amend, or delete personal information we
                hold about you, register a complaint, or request more
                information, contact our Privacy Compliance Officer at{' '}
                <a
                  href="mailto:info@teavision.com.au"
                  className={LINK_CLASS_NAME}
                >
                  info@teavision.com.au
                </a>{' '}
                or call{' '}
                <a href="tel:1300729617" className={LINK_CLASS_NAME}>
                  1300 729 617
                </a>
                .
              </p>
            </section>
          </Card>
        </div>
      </Section.Container>
    </Section.Root>
  )
}
