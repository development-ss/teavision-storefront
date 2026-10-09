import type { Metadata } from 'next'
import { Caveat, Hanken_Grotesk, Space_Mono, Spectral } from 'next/font/google'

import { DEFAULT_OG_IMAGE } from '@/lib/seo/default-og-image'
import { withNoindexRobots } from '@/lib/seo/noindex'
import { SITE_URL } from '@/lib/seo/site-url'
import { cn } from '@/lib/utils'

import './globals.css'

const spectral = Spectral({
  weight: ['400', '500'],
  style: ['normal'],
  subsets: ['latin'],
  variable: '--font-spectral',
  display: 'optional',
})

const hankenGrotesk = Hanken_Grotesk({
  subsets: ['latin'],
  variable: '--font-hanken-grotesk',
  display: 'optional',
})

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono',
  // Critical above-the-fold chrome must not get permanently stuck on its
  // fallback when a cold font request misses the short `optional` window.
  // Preload it for first paint, then swap it in if delivery is delayed.
  display: 'swap',
  preload: true,
})

const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-caveat',
  display: 'optional',
  preload: false,
})

export const metadata: Metadata = withNoindexRobots({
  metadataBase: new URL(SITE_URL),
  title: {
    template: '%s | Teavision',
    default: "Teavision — Australia's #1 Tea Supplier",
  },
  description:
    'Bulk wholesale tea, herbs, and spices for cafes, restaurants, and retailers.',
  openGraph: {
    type: 'website',
    siteName: 'Teavision',
    locale: 'en_AU',
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
  },
  // Google Search Console ownership tokens carried over from the old Shopify
  // theme. They are public by design and must stay on every page.
  verification: {
    google: [
      'zuc6JgNhxfEuNOkQesHoVQ94s48QvRnQ6AQlv43E2Hw',
      'QT0PK9njH7ghSELI7aFl3uVvzdYA07K4wRHNtnUOSYo',
    ],
  },
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en-AU">
      <body
        className={cn(
          spectral.variable,
          hankenGrotesk.variable,
          spaceMono.variable,
          caveat.variable,
        )}
      >
        {children}
      </body>
    </html>
  )
}
