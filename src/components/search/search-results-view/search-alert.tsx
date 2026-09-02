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
        'bg-card border-hairline-2 flex max-w-2xl flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5',
        tone === 'error' && 'border-danger bg-danger-tint',
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        <Icon
          className={cn(
            'mt-0.5 size-6 shrink-0',
            tone === 'error' ? 'text-danger' : 'text-ink-faint/50',
          )}
          aria-hidden="true"
        />
        <div className="grid min-w-0 gap-1">
          <h2 className="type-heading-05 text-ink">
            {tone === 'error' ? 'Search unavailable' : 'No matches'}
          </h2>
          <p className="type-body-sm text-ink-soft max-w-md">{message}</p>
        </div>
      </div>
      {actionHref && actionLabel && (
        <Button href={actionHref} variant="ghost" size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
