import Image from 'next/image'
import {
  Award,
  CheckCircle,
  FlaskConical,
  Globe,
  Medal,
  Truck,
  Users,
  type LucideIcon,
} from 'lucide-react'

import { Section } from '@/components/ui/section'
import type { HomepageProofPoint } from '@/lib/sanity/home-page'
import { cn } from '@/lib/utils'

import { PROOF_POINTS } from '../content'

const ICON_MAP: Record<string, LucideIcon> = {
  Award,
  CheckCircle,
  FlaskConical,
  Globe,
  Medal,
  Truck,
  Users,
}

export type ProofPointsProps = {
  points?: HomepageProofPoint[]
}

export function ProofPoints({ points = PROOF_POINTS }: ProofPointsProps) {
  return (
    <Section.Root tone="brand" spacing="none">
      <Section.Container>
        {/* 2-col mobile, 4-col desktop — matches design statband */}
        <ul className="grid grid-cols-2 gap-0 lg:grid-cols-4">
          {points.map((point, index) => {
            const IconComponent = point.icon ? ICON_MAP[point.icon] : undefined
            // Divider pattern: right border on all items except last in each row
            // Mobile 2-col: items 0,2 get right border (odd-indexed items in each pair)
            // Desktop 4-col: all except last item get right border
            const isLastInRow2 = index % 2 === 1
            const isLastOverall = index === points.length - 1
            return (
              <li
                key={point.title}
                className={cn(
                  'flex flex-col px-7.5 py-11',
                  !isLastOverall && !isLastInRow2 && 'border-paper/12 border-r',
                  !isLastOverall &&
                    isLastInRow2 &&
                    'lg:border-paper/12 border-r-0 lg:border-r',
                )}
              >
                {/* Image branch (e.g. Australian flag) */}
                {point.image ? (
                  <Image
                    src={point.image.src}
                    alt={point.image.alt}
                    width={40}
                    height={40}
                    className="mb-4 size-10 shrink-0 object-contain"
                    aria-hidden="true"
                  />
                ) : IconComponent ? (
                  <IconComponent
                    className="text-gold mb-4 size-10 shrink-0"
                    aria-hidden="true"
                  />
                ) : null}
                <p className="font-display text-paper text-[2.4rem] leading-none">
                  {point.title}
                </p>
                <p className="text-paper/78 mt-2 max-w-[22ch] text-[0.9rem]">
                  {point.description}
                </p>
              </li>
            )
          })}
        </ul>
      </Section.Container>
    </Section.Root>
  )
}
