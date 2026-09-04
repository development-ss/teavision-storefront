import { Suspense } from 'react'

import { AnalyticsDestinationLoader } from '@/components/analytics/destination-loader'
import { ConsentBanner } from '@/components/consent/banner'
import { Footer } from '@/components/layout/footer'
import { Header } from '@/components/layout/header'
import { NewsletterPopup } from '@/components/layout/newsletter-popup'
import { sendNewsletterSignupFormAction } from '@/lib/contact/actions'

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main-content"
        className="type-label border-hairline bg-paper text-ink focus-visible:ring-ring sr-only z-60 rounded-sm border px-4 py-3 focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        Skip to main content
      </a>
      <Header />
      <main id="main-content" tabIndex={-1} className="flex-1">
        {children}
      </main>
      <Footer />
      <ConsentBanner />
      <AnalyticsDestinationLoader />
      <Suspense fallback={null}>
        <NewsletterPopup action={sendNewsletterSignupFormAction} />
      </Suspense>
    </div>
  )
}
