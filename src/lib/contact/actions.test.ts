import { beforeEach, describe, expect, test, vi } from 'vitest'

import {
  sendCustomTeaBlendAction,
  sendNewsletterSignupAction,
  sendNpdOrderAction,
  sendWholesaleAccountAction,
  submitContactFormAction,
} from './actions'

type ResendSendResult = {
  error: unknown | null
}

type ResendSend = () => Promise<ResendSendResult>

const {
  checkRateLimitMock,
  getClientIpFromHeadersMock,
  resendSendMock,
  subscribeNewsletterEmailMock,
} = vi.hoisted(() => ({
  checkRateLimitMock: vi.fn(),
  getClientIpFromHeadersMock: vi.fn(() => '127.0.0.1'),
  resendSendMock: vi.fn<ResendSend>(async () => ({ error: null })),
  subscribeNewsletterEmailMock: vi.fn(async () => undefined),
}))

const LIMITED_RESULT = {
  limited: true,
  remaining: 0,
  resetAt: 1_900_000_000_000,
}

const ALLOWED_RESULT = {
  limited: false,
  remaining: 4,
  resetAt: 1_900_000_000_000,
}

const RATE_LIMIT_ERROR =
  'Too many submissions. Please wait a moment before trying again.'

vi.mock('server-only', () => ({}))

vi.mock('next/headers', () => ({
  headers: vi.fn(async () => new Headers({ 'x-forwarded-for': '127.0.0.1' })),
}))

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: checkRateLimitMock,
  getClientIpFromHeaders: getClientIpFromHeadersMock,
}))

vi.mock('resend', () => ({
  Resend: vi.fn(function Resend() {
    return {
      emails: {
        send: resendSendMock,
      },
    }
  }),
}))

vi.mock('@/lib/env/server', () => ({
  getResendApiKey: vi.fn(() => 're_test'),
  getShopifyAdminApiAccessToken: vi.fn(() => 'admin_test'),
  shouldWarnAboutRateLimitMemoryFallback: vi.fn(() => false),
}))

vi.mock('@/lib/shopify/newsletter-subscription', () => ({
  subscribeNewsletterEmail: subscribeNewsletterEmailMock,
}))

function formData(fields: Record<string, string | string[]>): FormData {
  const data = new FormData()

  Object.entries(fields).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        data.append(key, item)
      })
      return
    }

    data.set(key, value)
  })

  return data
}

const VALID_CONTACT_SUBMISSION = {
  name: 'Ada Lovelace',
  phone: '0400000000',
  email: 'ada@example.com',
  message: 'Please send more tea details.',
  website: '',
}

const VALID_CUSTOM_TEA_BLEND_SUBMISSION = {
  name: 'Grace Hopper',
  phone: '0400000001',
  email: 'grace@example.com',
  company: 'Compiler Tea Co',
  blendCategory: 'Loose-leaf tea',
  packFormat: 'Pouch',
  flavours: ['Peach'],
  brief: 'A bright peach green tea for summer.',
  website: '',
}

const VALID_WHOLESALE_SUBMISSION = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  phone: '0400000000',
  email: 'ada@example.com',
  company: 'Analytical Tea Co',
  productList: 'Organic green tea, peppermint, chamomile',
  annualVolumeKg: '250kg per year',
  startPurchasing: 'Immediately',
  website: '',
}

const VALID_NPD_ORDER_SUBMISSION = {
  company: 'NPD Tea Co',
  date: '01/07/2026',
  timeframe: 'ASAP (priority)',
  otherTimeframe: '',
  productTypes: ['Tea Bags and Loose Leaf'],
  brandCertifiedOrganic: 'YES',
  blendCount: '1',
  'blend-1-name': 'Morning blend',
  'blend-1-profile': 'Bright and brisk',
  'blend-1-organic': 'YES',
  'blend-1-flavouring': 'NO',
  'blend-1-flavours': ['ACEROLA'],
  'blend-1-ingredients': 'Green tea',
  'blend-1-aroma': 'Fresh',
  'blend-1-flavourSuggestion': 'Citrus',
  'blend-1-notes': 'No added sugar',
  firstName: 'Katherine',
  lastName: 'Johnson',
  email: 'katherine@example.com',
  phone: '0400000002',
  naturopathCertification: 'NO',
  website: '',
}

function limitNextRequest() {
  checkRateLimitMock.mockResolvedValueOnce(LIMITED_RESULT)
}

beforeEach(() => {
  vi.clearAllMocks()
  checkRateLimitMock.mockResolvedValue(ALLOWED_RESULT)
  resendSendMock.mockResolvedValue({ error: null })
  subscribeNewsletterEmailMock.mockResolvedValue(undefined)
})

describe('public contact surface rate limits', () => {
  test('returns safe rate-limit copy for contact enquiries', async () => {
    limitNextRequest()

    await expect(
      submitContactFormAction(formData(VALID_CONTACT_SUBMISSION)),
    ).resolves.toEqual({
      success: false,
      error: RATE_LIMIT_ERROR,
    })
    expect(resendSendMock).not.toHaveBeenCalled()
  })

  test('returns safe rate-limit copy for custom tea blend enquiries', async () => {
    limitNextRequest()

    await expect(
      sendCustomTeaBlendAction(formData(VALID_CUSTOM_TEA_BLEND_SUBMISSION)),
    ).resolves.toEqual({
      success: false,
      error: RATE_LIMIT_ERROR,
    })
    expect(resendSendMock).not.toHaveBeenCalled()
  })

  test('returns safe rate-limit copy for wholesale account requests', async () => {
    limitNextRequest()

    await expect(
      sendWholesaleAccountAction(formData(VALID_WHOLESALE_SUBMISSION)),
    ).resolves.toEqual({
      success: false,
      error: RATE_LIMIT_ERROR,
    })
    expect(resendSendMock).not.toHaveBeenCalled()
  })

  test('returns safe rate-limit copy for NPD order requests', async () => {
    limitNextRequest()

    await expect(
      sendNpdOrderAction(formData(VALID_NPD_ORDER_SUBMISSION)),
    ).resolves.toEqual({
      success: false,
      error: RATE_LIMIT_ERROR,
    })
    expect(resendSendMock).not.toHaveBeenCalled()
  })

  test('returns safe rate-limit copy for newsletter signups', async () => {
    limitNextRequest()

    await expect(
      sendNewsletterSignupAction(
        formData({ email: 'newsletter@example.com', website: '' }),
      ),
    ).resolves.toEqual({
      success: false,
      error: RATE_LIMIT_ERROR,
    })
    expect(resendSendMock).not.toHaveBeenCalled()
  })
})

describe('sendWholesaleAccountAction', () => {
  test('accepts a valid wholesale account request', async () => {
    const result = await sendWholesaleAccountAction(
      formData(VALID_WHOLESALE_SUBMISSION),
    )

    expect(result.success).toBe(true)
    expect(resendSendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: 'New Teavision wholesale account request',
        replyTo: 'ada@example.com',
        text: expect.stringContaining(
          'Company / business name: Analytical Tea Co',
        ),
      }),
    )
  })

  test('logs provider failures without submitted values or provider payloads', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)
    resendSendMock.mockResolvedValueOnce({
      error: {
        message: 'ada@example.com',
        providerPayload: { email: 'ada@example.com' },
      },
    })

    try {
      const result = await sendWholesaleAccountAction(
        formData(VALID_WHOLESALE_SUBMISSION),
      )

      expect(result).toEqual({
        success: false,
        error:
          'Unable to send your message right now. Please try again shortly.',
      })
      expect(consoleError).toHaveBeenCalledWith(
        '[observability]',
        expect.objectContaining({
          context: {
            status: 'provider-error',
            surface: 'wholesale-account',
          },
          event: 'contact_provider_failed',
          level: 'error',
        }),
      )
      expect(JSON.stringify(consoleError.mock.calls)).not.toContain(
        'ada@example.com',
      )
      expect(JSON.stringify(consoleError.mock.calls)).not.toContain(
        'providerPayload',
      )
    } finally {
      consoleError.mockRestore()
    }
  })

  test('rejects a request without the required business details', async () => {
    const result = await sendWholesaleAccountAction(
      formData({
        ...VALID_WHOLESALE_SUBMISSION,
        company: '',
      }),
    )

    expect(result).toEqual({
      success: false,
      error: 'Please fill in all required fields.',
    })
  })

  test('rejects an unknown purchasing timeframe option', async () => {
    const result = await sendWholesaleAccountAction(
      formData({
        ...VALID_WHOLESALE_SUBMISSION,
        startPurchasing: 'Eventually, maybe',
      }),
    )

    expect(result).toEqual({
      success: false,
      error: 'Please fill in all required fields.',
    })
  })
})

describe('email field delivery', () => {
  test('includes the contact email in the message and reply-to address', async () => {
    const result = await submitContactFormAction(
      formData(VALID_CONTACT_SUBMISSION),
    )

    expect(result.success).toBe(true)
    expect(resendSendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        replyTo: 'ada@example.com',
        text: expect.stringContaining('Email: ada@example.com'),
      }),
    )
  })

  test('uses the custom blend email as the reply-to address', async () => {
    const result = await sendCustomTeaBlendAction(
      formData(VALID_CUSTOM_TEA_BLEND_SUBMISSION),
    )

    expect(result.success).toBe(true)
    expect(resendSendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        replyTo: 'grace@example.com',
      }),
    )
  })

  test('delegates newsletter signup to Shopify without sending a Resend email', async () => {
    const result = await sendNewsletterSignupAction(
      formData({ email: 'newsletter@example.com', website: '' }),
    )

    expect(result.success).toBe(true)
    expect(subscribeNewsletterEmailMock).toHaveBeenCalledWith(
      'newsletter@example.com',
    )
    expect(resendSendMock).not.toHaveBeenCalled()
  })

  test('returns a safe error when Shopify signup fails', async () => {
    subscribeNewsletterEmailMock.mockRejectedValueOnce(new Error('offline'))

    await expect(
      sendNewsletterSignupAction(
        formData({ email: 'newsletter@example.com', website: '' }),
      ),
    ).resolves.toEqual({
      success: false,
      error: 'Unable to send your signup right now. Please try again shortly.',
    })
  })
})

describe('sendNpdOrderAction', () => {
  test('accepts an Australian date and includes it in the staff email', async () => {
    const result = await sendNpdOrderAction(
      formData(VALID_NPD_ORDER_SUBMISSION),
    )

    expect(result.success).toBe(true)
    expect(resendSendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        replyTo: 'katherine@example.com',
        subject: 'New Teavision NPD form submission',
        text: expect.stringMatching(
          /Date: 01\/07\/2026[\s\S]*Email: katherine@example\.com/,
        ),
      }),
    )
  })

  test('normalizes legacy ISO date submissions during rollout', async () => {
    const result = await sendNpdOrderAction(
      formData({
        ...VALID_NPD_ORDER_SUBMISSION,
        date: '2026-07-01',
      }),
    )

    expect(result.success).toBe(true)
    expect(resendSendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        text: expect.stringContaining('Date: 01/07/2026'),
      }),
    )
  })

  test('rejects impossible dates', async () => {
    const result = await sendNpdOrderAction(
      formData({
        ...VALID_NPD_ORDER_SUBMISSION,
        date: '31/04/2026',
      }),
    )

    expect(result).toEqual({
      success: false,
      error: 'Please fill in all required fields.',
    })
    expect(resendSendMock).not.toHaveBeenCalled()
  })
})
