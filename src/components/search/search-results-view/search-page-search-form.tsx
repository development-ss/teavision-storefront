import Form from 'next/form'
import { Search } from 'lucide-react'

import { Button, TextInput } from '@/components/ui'
import { encodeSearchFilter } from '@/lib/searchanise/params'
import type { SearchFilterSelection } from '@/lib/searchanise/types'
import { cn } from '@/lib/utils'

export function SearchPageSearchForm({
  query = '',
  filter,
  label = 'Search query',
  labelClassName,
  placeholder = 'Find products…',
  className,
  inputId = 'search-page-query',
  submitLabel = 'Search',
}: {
  query?: string
  filter?: SearchFilterSelection
  label?: string
  labelClassName?: string
  placeholder?: string
  className?: string
  inputId?: string
  submitLabel?: string
}) {
  return (
    <Form
      action="/search"
      className={cn(
        'mt-7 grid max-w-2xl gap-3 sm:grid-cols-[minmax(0,1fr)_auto]',
        className,
      )}
    >
      {filter ? (
        <input type="hidden" name="filter" value={encodeSearchFilter(filter)} />
      ) : null}
      <label htmlFor={inputId} className={labelClassName ?? 'sr-only'}>
        {label}
      </label>
      <TextInput
        id={inputId}
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
    </Form>
  )
}
