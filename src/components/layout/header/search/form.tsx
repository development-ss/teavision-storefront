import Form from 'next/form'
import { Search } from 'lucide-react'

import { IconButton } from '@/components/ui/icon-button'
import { TextInput } from '@/components/ui/text-input'
import { cn } from '@/lib/utils'

import { SUGGESTIONS_LISTBOX_ID } from './constants'
import { SearchSuggestions } from './suggestions'
import type { SearchFormProps } from './types'
export type { SearchSuggestionsStatus } from './types'

export function SearchForm({
  activeSuggestionIndex = -1,
  className,
  inputClassName,
  defaultQuery = '',
  isSuggestionsOpen = false,
  onBlur,
  onInputChange,
  onInputFocus,
  onKeyDown,
  onSubmit,
  onSuggestionClick,
  onSuggestionMouseDown,
  onSuggestionMouseEnter,
  suggestions = [],
  suggestionsStatus = 'idle',
  value,
}: SearchFormProps) {
  const activeDescendant =
    isSuggestionsOpen &&
    suggestionsStatus === 'results' &&
    activeSuggestionIndex >= 0
      ? `${SUGGESTIONS_LISTBOX_ID}-${activeSuggestionIndex}`
      : undefined
  const shouldShowSuggestions =
    isSuggestionsOpen && suggestionsStatus !== 'idle'
  const controls =
    suggestionsStatus === 'results' && suggestions.length > 0
      ? SUGGESTIONS_LISTBOX_ID
      : undefined

  return (
    <Form
      action="/search"
      role="search"
      aria-label="Site search"
      className={cn('relative w-full', className)}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      onSubmit={onSubmit}
    >
      <TextInput
        key={value === undefined ? defaultQuery : undefined}
        role="combobox"
        aria-label="Search products and articles"
        aria-autocomplete="list"
        aria-controls={controls}
        aria-expanded={isSuggestionsOpen}
        aria-activedescendant={activeDescendant}
        autoComplete="off"
        className={cn(
          // Comfortable body scale — Hanken Grotesk, no oversized clamp
          'type-body',
          // Shared .field treatment: hairline border, brand border + glow on focus
          'border-hairline bg-card text-ink placeholder:text-ink-faint rounded-sm border',
          // Sizing — generous vertical padding, room for search icon on right
          'min-h-12 w-full py-3.5 pr-12 pl-4 shadow-none',
          // Focus: brand border + green glow (same as TextInput / Textarea)
          'focus:border-brand focus:shadow-focus focus:ring-0 focus:outline-none',
          inputClassName,
        )}
        data-search-input
        defaultValue={value === undefined ? defaultQuery : undefined}
        enterKeyHint="search"
        inputMode="search"
        name="q"
        onChange={onInputChange}
        onFocus={onInputFocus}
        placeholder="Search 1,000+ teas, herbs & spices…"
        type="search"
        value={value}
      />
      <IconButton
        type="submit"
        variant="ghost"
        size="sm"
        className="absolute top-1/2 right-0 size-10 -translate-y-1/2"
        aria-label="Submit search"
      >
        <Search className="size-5" aria-hidden="true" strokeWidth={1.8} />
      </IconButton>
      {shouldShowSuggestions && (
        <SearchSuggestions
          activeSuggestionIndex={activeSuggestionIndex}
          onSuggestionClick={onSuggestionClick}
          onSuggestionMouseDown={onSuggestionMouseDown}
          onSuggestionMouseEnter={onSuggestionMouseEnter}
          suggestions={suggestions}
          status={suggestionsStatus}
        />
      )}
    </Form>
  )
}
