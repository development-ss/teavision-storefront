const PRIVACY_EMAIL = 'info@teavision.com.au'

export const COMPLIANCE_PRIVACY_EMAIL = PRIVACY_EMAIL
export const COMPLIANCE_PRIVACY_LINK_LABEL = 'Privacy Policy & Terms of Service'
export const COMPLIANCE_PRIVACY_LINK_HREF = '/pages/terms-of-service'

export type ComplianceRight = {
  title: string
  description: string
  /** Request type, combined with the page prefix to form the email subject. */
  subject: string
  tone?: 'default' | 'danger'
}

export type CompliancePage = {
  /** Law context for the request, e.g. "GDPR". */
  requestPrefix: string
  rights: ComplianceRight[]
  jurisdiction?: string
}

export function buildRequestHref(prefix: string, subject: string): string {
  const fullSubject = `${prefix}: ${subject}`
  const body = [
    'Hello Teavision team,',
    '',
    `I would like to make the following request: ${subject} (${prefix}).`,
    '',
    'This email is the address on my account.',
    'Full name:',
    'Order number (if relevant):',
    '',
    'Thank you.',
  ].join('\n')

  const query = `subject=${encodeURIComponent(fullSubject)}&body=${encodeURIComponent(body)}`

  return `mailto:${PRIVACY_EMAIL}?${query}`
}

const CORRECT: ComplianceRight = {
  title: 'Correct your data',
  description: 'Update account information that is inaccurate or incomplete.',
  subject: 'Data correction request',
}

const ACCESS: ComplianceRight = {
  title: 'Access your data',
  description: 'Get a report of the personal data we hold about you.',
  subject: 'Data access request',
}

const EXPORT: ComplianceRight = {
  title: 'Export your data',
  description:
    'Receive your data, including order history, in a portable format.',
  subject: 'Data export request',
}

const OPT_OUT: ComplianceRight = {
  title: 'Opt out of sale',
  description: 'Tell us not to sell or share your personal information.',
  subject: 'Do not sell my personal information',
}

const OPT_OUT_THIRD_PARTY: ComplianceRight = {
  title: 'Opt out of third-party sharing',
  description:
    'Tell us not to share your personal information with third parties.',
  subject: 'Do not sell my personal information to third parties',
}

const DELETE: ComplianceRight = {
  title: 'Delete your data',
  description:
    'Permanently erase your account and personal data. This cannot be undone.',
  subject: 'Data deletion request',
  tone: 'danger',
}

const COMPLIANCE_PAGES: Record<string, CompliancePage> = {
  'gdpr-compliance': {
    requestPrefix: 'GDPR',
    rights: [CORRECT, ACCESS, EXPORT, DELETE],
  },
  'us-laws-compliance': {
    requestPrefix: 'US state privacy law',
    rights: [CORRECT, ACCESS, EXPORT, OPT_OUT, DELETE],
    jurisdiction:
      'This page covers California (CCPA-CPRA), Virginia (VCDPA), Colorado (CPA), and Connecticut (CTDPA).',
  },
  'pipeda-compliance': {
    requestPrefix: 'PIPEDA',
    rights: [CORRECT, ACCESS, EXPORT],
  },
  'appi-compliance': {
    requestPrefix: 'APPI',
    rights: [CORRECT, ACCESS, EXPORT, OPT_OUT_THIRD_PARTY, DELETE],
  },
}

export function isComplianceHandle(handle: string): boolean {
  return handle in COMPLIANCE_PAGES
}

export function resolveCompliancePage(handle: string): CompliancePage | null {
  return COMPLIANCE_PAGES[handle] ?? null
}
