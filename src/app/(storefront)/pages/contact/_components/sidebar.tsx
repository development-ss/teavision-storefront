import { Eyebrow } from '@/components/ui'

import { CONTACT_METHODS, SOCIAL_LINKS, SUPPLY_NOTES } from '../_lib/page-data'
import { Icon } from './icons'

export function Sidebar() {
  return (
    <aside className="py-1 lg:sticky lg:top-8">
      <div>
        <Eyebrow>Direct lines</Eyebrow>
        <h2 className="type-heading-02 text-ink mt-3">Reach the team</h2>
      </div>

      <dl className="divide-hairline mt-6 divide-y">
        {CONTACT_METHODS.map((method) => (
          <div key={method.label} className="flex gap-4 py-5 first:pt-0">
            <div className="bg-brand-tint text-brand mt-1 flex size-11 shrink-0 items-center justify-center rounded-full">
              <Icon name={method.icon} />
            </div>
            <div>
              <dt className="type-mono-meta text-ink-faint">{method.label}</dt>
              <dd className="font-display text-ink mt-1 text-[1.15rem] leading-tight">
                <a
                  href={method.href}
                  className="hover:text-brand focus-visible:ring-ring rounded-sm hover:underline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                  target={method.external ? '_blank' : undefined}
                  rel={method.external ? 'noopener noreferrer' : undefined}
                >
                  {method.value}
                </a>
              </dd>
            </div>
          </div>
        ))}
      </dl>

      <div className="border-hairline mt-8 border-t pt-6">
        <p className="type-mono-meta text-ink-faint">Useful for</p>
        <ul className="mt-4 space-y-3" role="list">
          {SUPPLY_NOTES.map((note) => (
            <li key={note} className="type-body-sm text-ink-soft flex gap-3">
              <span
                className="bg-brand mt-2 size-1.5 shrink-0 rounded-full"
                aria-hidden="true"
              />
              <span>{note}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-hairline mt-8 border-t pt-6">
        <p className="type-mono-meta text-ink-faint">Follow us</p>
        <div className="mt-4 flex flex-wrap gap-3">
          {SOCIAL_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              aria-label={link.label}
              target="_blank"
              rel="noopener noreferrer"
              className="border-hairline bg-card text-brand hover:border-brand hover:text-brand-deep focus-visible:ring-ring flex size-11 items-center justify-center rounded-full border transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <Icon name={link.icon} />
            </a>
          ))}
        </div>
      </div>
    </aside>
  )
}
