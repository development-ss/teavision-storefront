import { CONTACT_LINKS } from '../data'
import { MailIcon } from '../icons'
import { PhoneIcon } from '../icons'
import { FooterNewsletterForm } from '../newsletter-form'
import type { FooterNewsletterAction } from '../newsletter-form'

export function NewsletterColumn({
  action,
}: {
  action: FooterNewsletterAction
}) {
  const phoneLink = CONTACT_LINKS.find((link) => link.kind === 'phone')
  const emailLink = CONTACT_LINKS.find((link) => link.kind === 'email')

  return (
    <div>
      <h3 className="text-gold mb-4.5 font-mono text-[10.5px] tracking-[0.16em] uppercase">
        Keep in Touch
      </h3>
      {/* Original site newsletter blurb (restored from production footer) */}
      <p className="text-paper/75 text-[0.95rem] leading-normal">
        Sign up for exclusive offers, market trends and new product alerts.
      </p>
      <FooterNewsletterForm action={action} />
      {/* Contact links: mono 12px, compact rows, gap 8px per design */}
      <div className="mt-5 flex flex-col gap-2 font-mono text-[12px]">
        {phoneLink ? (
          <p className="flex items-center gap-2">
            <PhoneIcon />
            <a
              href={phoneLink.href}
              className="text-paper/75 hover:text-paper focus-visible:ring-ring focus-visible:ring-offset-ink underline-offset-2 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              {phoneLink.label}
            </a>
          </p>
        ) : null}
        {emailLink ? (
          <p className="flex items-center gap-2">
            <MailIcon />
            <a
              href={emailLink.href}
              className="text-paper/75 hover:text-paper focus-visible:ring-ring focus-visible:ring-offset-ink underline-offset-2 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              {emailLink.label}
            </a>
          </p>
        ) : null}
      </div>
    </div>
  )
}
