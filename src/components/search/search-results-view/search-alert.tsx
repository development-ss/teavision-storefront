import { AlertCircle, Leaf } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type SearchAlertProps = {
  actionHref?: string
  actionLabel?: string
  message: string
  tone: 'error' | 'empty'
}

export function SearchAlert({
  actionHref,
  actionLabel,
  message,
  tone,
}: SearchAlertProps) {
  const Icon = tone === 'error' ? AlertCircle : Leaf

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'bg-card border-hairline-2 mx-auto grid max-w-xl justify-items-center gap-4 rounded-lg border p-8 text-center',
        tone === 'error' && 'border-danger bg-danger-tint',
      )}
    >
      <Icon
        className={cn(
          'size-11',
          tone === 'error' ? 'text-danger' : 'text-ink-faint/50',
        )}
        aria-hidden="true"
      />
      <div className="grid gap-2">
        <h2 className="font-display text-ink text-2xl">
          {tone === 'error' ? 'Search unavailable' : 'No matches'}
        </h2>
        <p className="type-body-sm text-ink-soft max-w-md">{message}</p>
      </div>
      {actionHref && actionLabel && (
        <Button href={actionHref} variant="ghost" size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
