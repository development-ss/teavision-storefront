import { MAP_EMBED_URL } from '../_lib/page-data'

export function LocationMap() {
  return (
    <div className="border-hairline-2 bg-card min-h-88 overflow-hidden rounded-lg border sm:min-h-112 lg:min-h-0">
      <iframe
        title="Google Map showing Teavision at 29 Palladium Circuit, Clyde North"
        src={MAP_EMBED_URL}
        className="h-88 w-full border-0 sm:h-112 lg:h-full lg:min-h-112"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </div>
  )
}
