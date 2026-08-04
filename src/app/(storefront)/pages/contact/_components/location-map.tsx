import { ADDRESS, MAP_DIRECTIONS_URL, MAP_EMBED_URL } from '../_lib/page-data'

export function LocationMap() {
  return (
    <div
      className="border-hairline-2 bg-card overflow-hidden rounded-lg border"
      aria-labelledby="contact-location-heading"
    >
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6">
        <div>
          <p className="type-eyebrow text-brand before:h-px before:w-5.5 before:bg-current before:opacity-60">
            Visit us
          </p>
          <h2
            id="contact-location-heading"
            className="type-heading-03 text-ink mt-3 scroll-mt-28"
          >
            Teavision in Clyde North
          </h2>
          <p className="type-body-sm text-ink-soft mt-2">{ADDRESS}</p>
        </div>
        <a
          href={MAP_DIRECTIONS_URL}
          className="type-mono-meta border-hairline bg-paper text-brand hover:border-brand hover:text-brand-deep focus-visible:ring-ring inline-flex min-h-11 items-center justify-center rounded-full border px-4 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          target="_blank"
          rel="noopener noreferrer"
        >
          Open in Google Maps
        </a>
      </div>
      <div className="border-hairline border-t">
        <iframe
          title="Google Map showing Teavision at 29 Palladium Circuit, Clyde North"
          src={MAP_EMBED_URL}
          className="h-88 w-full border-0 sm:h-112 lg:h-128"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
    </div>
  )
}
