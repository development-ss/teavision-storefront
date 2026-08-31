import { Eyebrow } from '@/components/ui/eyebrow'

import { CONTACT_METHODS, SUPPLY_NOTES } from '../_lib/page-data'
import { Icon } from './icons'

export function Sidebar() {
  return (
    <aside className="py-1 lg:sticky lg:top-8">
      <div>
        <Eyebrow tone="gold">Direct lines</Eyebrow>
        <h2 className="type-heading-02 text-paper mt-3">Reach the team</h2>
      </div>

      <dl className="divide-paper/20 mt-6 divide-y">
        {CONTACT_METHODS.map((method) => (
          <div key={method.label} className="flex gap-4 py-5 first:pt-0">
            <div className="bg-paper/10 text-paper mt-1 flex size-11 shrink-0 items-center justify-center rounded-full">
              <Icon name={method.icon} />
            </div>
            <div>
              <dt className="type-mono-meta text-paper/60">{method.label}</dt>
              <dd className="font-display text-paper mt-1 text-[1.15rem] leading-tight">
                <a
                  href={method.href}
                  className="hover:text-gold focus-visible:ring-gold focus-visible:ring-offset-brand-deep rounded-sm hover:underline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
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

      <div className="border-paper/20 mt-8 border-t pt-6">
        <p className="type-mono-meta text-paper/60">Useful for</p>
        <ul className="mt-4 space-y-3" role="list">
          {SUPPLY_NOTES.map((note) => (
            <li key={note} className="type-body-sm text-paper/80 flex gap-3">
              <span
                className="bg-gold mt-2 size-1.5 shrink-0 rounded-full"
                aria-hidden="true"
              />
              <span>{note}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
