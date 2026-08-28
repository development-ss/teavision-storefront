import { StatBand } from '@/components/ui'

import { STATS } from '../_lib/data'

export function StatsSection() {
  return (
    <StatBand aria-label="Tea bag manufacturing capabilities" items={STATS} />
  )
}
