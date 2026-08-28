import Image from 'next/image'

import { QUALITY_IMAGE } from '../data'

// Quality pills are a design/mockup styling element kept per owner decision
const QUALITY_PILLS = [
  'HACCP Certified',
  'ACO Organic',
  'USDA Organic',
  'Ethically Sourced',
]

export function QualityColumn() {
  return (
    <div>
      <h3 className="text-gold mb-4.5 font-mono text-[10.5px] tracking-[0.16em] uppercase">
        Certified Quality
      </h3>
      {/* Original site HACCP copy (restored from settings_data.json footer text block) */}
      <p className="text-paper/75 max-w-[30ch] text-[0.95rem] leading-normal">
        Teavision runs a HACCP Certified food &amp; safety program to provide
        consistent quality throughout its products.
      </p>
      {/* margin-top: 22px, gap: 10px per design .ft__quality */}
      <div className="mt-5.5 flex flex-wrap gap-2.5">
        {QUALITY_PILLS.map((pill) => (
          <span
            key={pill}
            className="border-paper/16 bg-paper/5 text-paper/80 rounded-full border px-3 py-1.5 font-mono text-[9.5px] tracking-widest uppercase"
          >
            {pill}
          </span>
        ))}
      </div>
      <Image
        src={QUALITY_IMAGE.src}
        sizes="181px"
        width={QUALITY_IMAGE.width}
        height={QUALITY_IMAGE.height}
        alt={QUALITY_IMAGE.alt}
        className="mt-5 h-17.5 w-45.25 max-w-full object-contain opacity-80"
      />
    </div>
  )
}
