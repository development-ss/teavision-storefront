import { Search } from 'lucide-react'

import { Button } from '@/components/ui/button'

type SearchFormProps = {
  searchAction?: string
}

export function SearchForm({ searchAction }: SearchFormProps) {
  return (
    <form
      action={searchAction}
      aria-label="Search tea topics"
      className="mt-8 flex w-full max-w-2xl flex-col gap-3 sm:flex-row"
      role="search"
    >
      <label className="sr-only" htmlFor="blog-hero-search">
        Search tea topics
      </label>
      <input
        id="blog-hero-search"
        name="q"
        type="search"
        autoComplete="off"
        placeholder="Search tea topics…"
        className="type-body border-hairline bg-card text-ink placeholder:text-ink-faint focus-visible:border-brand focus-visible:ring-ring min-h-12 flex-1 rounded-md border px-4 transition-colors focus-visible:ring-2 focus-visible:outline-none"
      />
      <Button type="submit" size="lg" className="shrink-0">
        <Search className="size-4" aria-hidden="true" />
        Search
      </Button>
    </form>
  )
}
