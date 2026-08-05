import type { ReactNode } from 'react'
import { Search } from 'lucide-react'

import { Button, TextInput } from '@/components/ui'
import { cn } from '@/lib/utils'

export function SearchPageSearchForm({
  action = '/search',
  children,
  query = '',
  label = 'Search query',
  labelClassName,
  placeholder = 'Find products…',
  className,
  inputId = 'search-page-query',
  submitLabel = 'Search',
}: {
  action?: string
  children?: ReactNode
  query?: string
  label?: string
  labelClassName?: string
  placeholder?: string
  className?: string
  inputId?: string
  submitLabel?: string
}) {
  // Keep search URLs shareable without the extra App Router state headers that
  // can push header-heavy browser sessions over server limits.
  return (
    <form
      action={action}
      method="get"
      className={cn(
        'mt-7 grid max-w-2xl gap-3 sm:grid-cols-[minmax(0,1fr)_auto]',
        className,
      )}
    >
      {children}
      <label htmlFor={inputId} className={labelClassName ?? 'sr-only'}>
        {label}
      </label>
      <TextInput
        id={inputId}
        className="rounded-full px-5"
        name="q"
        type="search"
        defaultValue={query}
        autoComplete="off"
        placeholder={placeholder}
        enterKeyHint="search"
      />
      <Button type="submit" size="lg">
        <Search className="size-4" aria-hidden="true" />
        {submitLabel}
      </Button>
    </form>
  )
}
