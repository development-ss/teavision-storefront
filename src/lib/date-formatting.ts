const AUSTRALIAN_TIME_ZONE = 'Australia/Melbourne'
const AUSTRALIAN_DATE_PATTERN = /^(\d{2})\/(\d{2})\/(\d{4})$/
const LEGACY_ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

const australianDateFormatter = new Intl.DateTimeFormat('en-AU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: AUSTRALIAN_TIME_ZONE,
})

type DateParts = {
  day: number
  month: number
  year: number
}

function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
}

function isValidDateParts({ day, month, year }: DateParts): boolean {
  if (year < 1000 || year > 9999 || month < 1 || month > 12 || day < 1) {
    return false
  }

  const daysInMonth = [
    31,
    isLeapYear(year) ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ]

  return day <= daysInMonth[month - 1]
}

function composeAustralianDate({ day, month, year }: DateParts): string {
  return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`
}

export function formatAustralianDate(value: string | Date): string | null {
  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) return null

  const parts = australianDateFormatter.formatToParts(date)
  const day = Number(parts.find((part) => part.type === 'day')?.value)
  const month = Number(parts.find((part) => part.type === 'month')?.value)
  const year = Number(parts.find((part) => part.type === 'year')?.value)

  if (!isValidDateParts({ day, month, year })) return null

  return composeAustralianDate({ day, month, year })
}

export function normalizeAustralianDateInput(value: string): string | null {
  const trimmedValue = value.trim()
  const australianMatch = AUSTRALIAN_DATE_PATTERN.exec(trimmedValue)
  const legacyIsoMatch = LEGACY_ISO_DATE_PATTERN.exec(trimmedValue)

  const parts = australianMatch
    ? {
        day: Number(australianMatch[1]),
        month: Number(australianMatch[2]),
        year: Number(australianMatch[3]),
      }
    : legacyIsoMatch
      ? {
          day: Number(legacyIsoMatch[3]),
          month: Number(legacyIsoMatch[2]),
          year: Number(legacyIsoMatch[1]),
        }
      : null

  if (!parts || !isValidDateParts(parts)) return null

  return composeAustralianDate(parts)
}

export function isAustralianDateTodayOrFuture(value: string): boolean {
  const normalized = normalizeAustralianDateInput(value)
  if (!normalized) return false

  const [day, month, year] = normalized.split('/').map(Number)
  const todayParts = australianDateFormatter.formatToParts(new Date())
  const todayDay = Number(todayParts.find((part) => part.type === 'day')?.value)
  const todayMonth = Number(
    todayParts.find((part) => part.type === 'month')?.value,
  )
  const todayYear = Number(
    todayParts.find((part) => part.type === 'year')?.value,
  )

  if (year !== todayYear) return year > todayYear
  if (month !== todayMonth) return month > todayMonth
  return day >= todayDay
}
