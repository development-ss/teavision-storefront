import { describe, expect, test } from 'vitest'

import {
  formatAustralianDate,
  isAustralianDateTodayOrFuture,
  normalizeAustralianDateInput,
} from './date-formatting'

describe('formatAustralianDate', () => {
  test('formats dates with zero-padded Australian ordering', () => {
    expect(formatAustralianDate('2026-06-01T04:20:00Z')).toBe('01/06/2026')
  })

  test('uses the Melbourne calendar date for timestamps', () => {
    expect(formatAustralianDate('2026-06-01T15:00:00Z')).toBe('02/06/2026')
  })

  test('returns null for invalid values', () => {
    expect(formatAustralianDate('not-a-date')).toBeNull()
    expect(formatAustralianDate(new Date(Number.NaN))).toBeNull()
  })
})

describe('normalizeAustralianDateInput', () => {
  test('accepts strict Australian dates and legacy ISO date submissions', () => {
    expect(normalizeAustralianDateInput('01/07/2026')).toBe('01/07/2026')
    expect(normalizeAustralianDateInput('2026-07-01')).toBe('01/07/2026')
  })

  test('validates leap years and rejects impossible dates', () => {
    expect(normalizeAustralianDateInput('29/02/2028')).toBe('29/02/2028')
    expect(normalizeAustralianDateInput('29/02/2026')).toBeNull()
    expect(normalizeAustralianDateInput('31/04/2026')).toBeNull()
  })

  test('rejects non-padded and differently ordered dates', () => {
    expect(normalizeAustralianDateInput('1/7/2026')).toBeNull()
    expect(normalizeAustralianDateInput('07/31/2026')).toBeNull()
  })
})

describe('isAustralianDateTodayOrFuture', () => {
  test('rejects dates before today and accepts a future date', () => {
    expect(isAustralianDateTodayOrFuture('01/01/2020')).toBe(false)
    expect(isAustralianDateTodayOrFuture('31/12/2099')).toBe(true)
  })
})
