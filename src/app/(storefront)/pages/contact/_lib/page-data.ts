export const PHONE = '1300 729 617'
export const PHONE_HREF = 'tel:1300729617'
export const EMAIL = 'info@teavision.com.au'
export const EMAIL_HREF = 'mailto:info@teavision.com.au'
export const ADDRESS = '29 Palladium Circuit, Clyde North VIC 3978'
export const MAP_EMBED_URL =
  'https://maps.google.com/maps?q=29%20Palladium%20Circuit%2C%20Clyde%20North%20VIC%203978&t=&z=16&ie=UTF8&iwloc=B&output=embed'
export const MAP_DIRECTIONS_URL =
  'https://www.google.com/maps/search/?api=1&query=29%20Palladium%20Circuit%2C%20Clyde%20North%20VIC%203978'

export const SUPPLY_CUES = [
  'Wholesale account support',
  'Custom blending',
  'Private label supply',
] as const

export const SUPPLY_NOTES = [
  'Bulk tea, herbs, spices, and botanicals',
  'Samples, quote requests, and ingredient availability',
  'HACCP and ACO certified supply conversations',
] as const

export const CONTACT_METHODS = [
  {
    label: 'Phone',
    value: PHONE,
    href: PHONE_HREF,
    icon: 'phone',
    external: false,
  },
  {
    label: 'Email',
    value: EMAIL,
    href: EMAIL_HREF,
    icon: 'mail',
    external: false,
  },
  {
    label: 'Address',
    value: ADDRESS,
    href: MAP_DIRECTIONS_URL,
    icon: 'pin',
    external: true,
  },
] as const

export type IconName = (typeof CONTACT_METHODS)[number]['icon']
