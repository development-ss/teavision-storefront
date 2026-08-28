'use server'

import { headers } from 'next/headers'
import { Resend } from 'resend'

import { getResendApiKey } from '@/lib/env/server'
import {
  CUSTOM_TEA_BLEND_LIMITS,
  isCustomTeaBlendCategory,
  isCustomTeaBlendFlavour,
  isCustomTeaBlendPackFormat,
} from '@/lib/contact/custom-tea-blend'
import {
  NPD_ORDER_LIMITS,
  isNpdFlavour,
  isNpdProductType,
  isNpdTimeframe,
  npdBlendFieldName,
} from '@/lib/contact/npd-order'
import type {
  ContactActionResult,
  NewsletterSignupActionResult,
} from '@/lib/contact/types'
import {
  WHOLESALE_ACCOUNT_LIMITS,
  isWholesaleAccountStartOption,
} from '@/lib/contact/wholesale-account'
import { normalizeAustralianDateInput } from '@/lib/date-formatting'
import { logEvent } from '@/lib/observability/logger'
import { checkRateLimit, getClientIpFromHeaders } from '@/lib/rate-limit'
import { ShopifyAdminConfigurationError } from '@/lib/shopify/admin-client'
import { subscribeNewsletterEmail } from '@/lib/shopify/newsletter-subscription'

type ContactSubmission = {
  name: string
  phone: string
  email: string
  message: string
  website: string
}

type CustomTeaBlendSubmission = {
  name: string
  phone: string
  email: string
  company: string
  blendCategory: string
  packFormat: string
  flavours: string[]
  brief: string
  website: string
}

type WholesaleAccountSubmission = {
  firstName: string
  lastName: string
  phone: string
  email: string
  company: string
  productList: string
  annualVolumeKg: string
  startPurchasing: string
  website: string
}

type ContactProviderSurface =
  | 'contact'
  | 'custom-tea-blend'
  | 'newsletter'
  | 'npd-order'
  | 'wholesale-account'

type ContactProviderStatus =
  | 'exception'
  | 'provider-error'
  | 'provider-not-configured'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const VALIDATION_ERROR = 'Please fill in all required fields.'
const SEND_ERROR =
  'Unable to send your message right now. Please try again shortly.'
const NEWSLETTER_VALIDATION_ERROR = 'Please enter a valid email address.'
const NEWSLETTER_SEND_ERROR =
  'Unable to send your signup right now. Please try again shortly.'
const RATE_LIMIT_ERROR =
  'Too many submissions. Please wait a moment before trying again.'
const CONTACT_NAME_MAX_LENGTH = 100
const CONTACT_PHONE_MAX_LENGTH = 20
const CONTACT_EMAIL_MAX_LENGTH = 254
const CONTACT_MESSAGE_MAX_LENGTH = 2000
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX_SUBMISSIONS = 5

function readStringField(formData: FormData, field: string) {
  const value = formData.get(field)
  return typeof value === 'string' ? value.trim() : ''
}

function readField(formData: FormData, field: keyof ContactSubmission) {
  return readStringField(formData, field)
}

function readStringList(formData: FormData, field: string) {
  return formData
    .getAll(field)
    .filter((value): value is string => typeof value === 'string')
    .map((value) => value.trim())
    .filter(Boolean)
}

async function getRateLimitKey(): Promise<string> {
  const requestHeaders = await headers()

  return getClientIpFromHeaders(requestHeaders)
}

async function isRateLimited(
  surface: ContactProviderSurface,
): Promise<boolean> {
  const identifier = await getRateLimitKey()
  const result = await checkRateLimit({
    namespace: `contact:${surface}`,
    identifier,
    limit: RATE_LIMIT_MAX_SUBMISSIONS,
    windowMs: RATE_LIMIT_WINDOW_MS,
  })

  return result.limited
}

function logProviderWarning(
  surface: ContactProviderSurface,
  status: ContactProviderStatus,
) {
  logEvent('warn', 'contact_provider_failed', { surface, status })
}

function logProviderError(
  surface: ContactProviderSurface,
  status: ContactProviderStatus,
) {
  logEvent('error', 'contact_provider_failed', { surface, status })
}

function readSubmission(formData: FormData): ContactSubmission {
  return {
    name: readField(formData, 'name'),
    phone: readField(formData, 'phone'),
    email: readField(formData, 'email'),
    message: readField(formData, 'message'),
    website: readField(formData, 'website'),
  }
}

function readCustomTeaBlendSubmission(
  formData: FormData,
): CustomTeaBlendSubmission {
  return {
    name: readStringField(formData, 'name'),
    phone: readStringField(formData, 'phone'),
    email: readStringField(formData, 'email'),
    company: readStringField(formData, 'company'),
    blendCategory: readStringField(formData, 'blendCategory'),
    packFormat: readStringField(formData, 'packFormat'),
    flavours: readStringList(formData, 'flavours'),
    brief: readStringField(formData, 'brief'),
    website: readStringField(formData, 'website'),
  }
}

function readWholesaleAccountSubmission(
  formData: FormData,
): WholesaleAccountSubmission {
  return {
    firstName: readStringField(formData, 'firstName'),
    lastName: readStringField(formData, 'lastName'),
    phone: readStringField(formData, 'phone'),
    email: readStringField(formData, 'email'),
    company: readStringField(formData, 'company'),
    productList: readStringField(formData, 'productList'),
    annualVolumeKg: readStringField(formData, 'annualVolumeKg'),
    startPurchasing: readStringField(formData, 'startPurchasing'),
    website: readStringField(formData, 'website'),
  }
}

function isValidSubmission(submission: ContactSubmission) {
  if (!submission.name || submission.name.length > CONTACT_NAME_MAX_LENGTH) {
    return false
  }
  if (
    !submission.email ||
    submission.email.length > CONTACT_EMAIL_MAX_LENGTH ||
    !EMAIL_PATTERN.test(submission.email)
  ) {
    return false
  }
  if (
    !submission.message ||
    submission.message.length > CONTACT_MESSAGE_MAX_LENGTH
  ) {
    return false
  }
  if (submission.phone.length > CONTACT_PHONE_MAX_LENGTH) return false
  return submission.website.length === 0
}

function isValidCustomTeaBlendSubmission(submission: CustomTeaBlendSubmission) {
  if (submission.company.length > CUSTOM_TEA_BLEND_LIMITS.field) {
    return false
  }

  if (
    !submission.brief ||
    submission.brief.length > CUSTOM_TEA_BLEND_LIMITS.brief
  ) {
    return false
  }

  if (
    !isCustomTeaBlendCategory(submission.blendCategory) ||
    !isCustomTeaBlendPackFormat(submission.packFormat)
  ) {
    return false
  }

  if (
    submission.flavours.length > CUSTOM_TEA_BLEND_LIMITS.maxFlavours ||
    submission.flavours.some(
      (flavour) =>
        flavour.length > CUSTOM_TEA_BLEND_LIMITS.flavour ||
        !isCustomTeaBlendFlavour(flavour),
    )
  ) {
    return false
  }

  return true
}

function isValidWholesaleAccountSubmission(
  submission: WholesaleAccountSubmission,
) {
  const requiredFieldValues = [
    submission.firstName,
    submission.lastName,
    submission.email,
    submission.company,
    submission.productList,
    submission.annualVolumeKg,
    submission.startPurchasing,
  ]

  if (requiredFieldValues.some((value) => !value)) return false

  if (
    submission.firstName.length > WHOLESALE_ACCOUNT_LIMITS.field ||
    submission.lastName.length > WHOLESALE_ACCOUNT_LIMITS.field ||
    submission.company.length > WHOLESALE_ACCOUNT_LIMITS.field
  ) {
    return false
  }

  if (
    submission.email.length > CONTACT_EMAIL_MAX_LENGTH ||
    !EMAIL_PATTERN.test(submission.email)
  ) {
    return false
  }

  if (submission.phone.length > CONTACT_PHONE_MAX_LENGTH) return false

  if (
    submission.productList.length > WHOLESALE_ACCOUNT_LIMITS.text ||
    submission.annualVolumeKg.length > WHOLESALE_ACCOUNT_LIMITS.text
  ) {
    return false
  }

  if (!isWholesaleAccountStartOption(submission.startPurchasing)) {
    return false
  }

  return submission.website.length === 0
}

function formatSubmission(submission: ContactSubmission) {
  return [
    'New Teavision contact enquiry',
    '',
    `Name: ${submission.name}`,
    `Phone: ${submission.phone || 'Not provided'}`,
    `Email: ${submission.email}`,
    '',
    'Message:',
    submission.message,
  ].join('\n')
}

function formatCustomTeaBlendSubmission(submission: CustomTeaBlendSubmission) {
  return [
    'Custom tea blend enquiry',
    '',
    `Company: ${submission.company || 'Not provided'}`,
    `Blend category: ${submission.blendCategory || 'Not provided'}`,
    `Preferred format: ${submission.packFormat || 'Not provided'}`,
    `Selected flavours: ${submission.flavours.join(', ') || 'Not provided'}`,
    '',
    'Project brief:',
    submission.brief,
  ].join('\n')
}

function formatWholesaleAccountSubmission(
  submission: WholesaleAccountSubmission,
) {
  const notProvided = 'Not provided'

  return [
    'Wholesale bulk order account request',
    '',
    `First name: ${submission.firstName}`,
    `Last name: ${submission.lastName}`,
    `Phone: ${submission.phone || notProvided}`,
    `Email: ${submission.email}`,
    `Company / business name: ${submission.company}`,
    `Looking to start purchasing: ${submission.startPurchasing}`,
    '',
    'Product list:',
    submission.productList,
    '',
    'Product volumes (estimated annual volume in kg):',
    submission.annualVolumeKg,
  ].join('\n')
}

async function submitContactSubmission(
  submission: ContactSubmission,
  surface: Extract<
    ContactProviderSurface,
    'contact' | 'custom-tea-blend'
  > = 'contact',
): Promise<ContactActionResult> {
  if (submission.website) {
    return { success: true }
  }

  if (!isValidSubmission(submission)) {
    return { success: false, error: VALIDATION_ERROR }
  }

  if (await isRateLimited(surface)) {
    return { success: false, error: RATE_LIMIT_ERROR }
  }

  const resendApiKey = getResendApiKey()
  if (!resendApiKey) {
    logProviderWarning(surface, 'provider-not-configured')
    return { success: false, error: SEND_ERROR }
  }

  try {
    const resend = new Resend(resendApiKey)
    const { error } = await resend.emails.send({
      from: 'Teavision Contact <noreply@teavision.com.au>',
      to: 'info@teavision.com.au',
      subject: `New enquiry from ${submission.name.replace(/[\r\n]+/g, ' ')}`,
      text: formatSubmission(submission),
      replyTo: submission.email,
    })

    if (error) {
      logProviderError(surface, 'provider-error')
      return { success: false, error: SEND_ERROR }
    }

    return { success: true }
  } catch {
    logProviderError(surface, 'exception')
    return { success: false, error: SEND_ERROR }
  }
}

export async function submitContactFormAction(
  formData: FormData,
): Promise<ContactActionResult> {
  const submission = readSubmission(formData)

  return submitContactSubmission(submission)
}

export async function sendCustomTeaBlendAction(
  formData: FormData,
): Promise<ContactActionResult> {
  const submission = readCustomTeaBlendSubmission(formData)

  if (submission.website) {
    return { success: true }
  }

  if (!isValidCustomTeaBlendSubmission(submission)) {
    return { success: false, error: VALIDATION_ERROR }
  }

  const message = formatCustomTeaBlendSubmission(submission)

  if (message.length > CONTACT_MESSAGE_MAX_LENGTH) {
    return { success: false, error: VALIDATION_ERROR }
  }

  return submitContactSubmission(
    {
      name: submission.name,
      phone: submission.phone,
      email: submission.email,
      message,
      website: submission.website,
    },
    'custom-tea-blend',
  )
}

export async function sendWholesaleAccountAction(
  formData: FormData,
): Promise<ContactActionResult> {
  const submission = readWholesaleAccountSubmission(formData)

  if (submission.website) {
    return { success: true }
  }

  if (!isValidWholesaleAccountSubmission(submission)) {
    return { success: false, error: VALIDATION_ERROR }
  }

  if (await isRateLimited('wholesale-account')) {
    return { success: false, error: RATE_LIMIT_ERROR }
  }

  const resendApiKey = getResendApiKey()
  if (!resendApiKey) {
    logProviderWarning('wholesale-account', 'provider-not-configured')
    return { success: false, error: SEND_ERROR }
  }

  try {
    const resend = new Resend(resendApiKey)
    const { error } = await resend.emails.send({
      from: 'Teavision Wholesale <noreply@teavision.com.au>',
      to: 'info@teavision.com.au',
      subject: 'New Teavision wholesale account request',
      text: formatWholesaleAccountSubmission(submission),
      replyTo: submission.email,
    })

    if (error) {
      logProviderError('wholesale-account', 'provider-error')
      return { success: false, error: SEND_ERROR }
    }

    return { success: true }
  } catch {
    logProviderError('wholesale-account', 'exception')
    return { success: false, error: SEND_ERROR }
  }
}

export async function sendCustomTeaBlendFormAction(
  _previousState: ContactActionResult,
  formData: FormData,
): Promise<ContactActionResult> {
  return sendCustomTeaBlendAction(formData)
}

type NpdBlendSubmission = {
  name: string
  profile: string
  certifiedOrganic: string
  addNaturalFlavouring: string
  flavours: string[]
  ingredients: string
  aroma: string
  flavourSuggestion: string
  notes: string
}

type NpdOrderSubmission = {
  company: string
  date: string
  timeframe: string
  otherTimeframe: string
  productTypes: string[]
  brandCertifiedOrganic: string
  blends: NpdBlendSubmission[]
  firstName: string
  lastName: string
  email: string
  phone: string
  naturopathCertification: boolean
  website: string
}

function isYesNoOrEmpty(value: string) {
  return value === '' || value === 'YES' || value === 'NO'
}

function readNpdBlendCount(formData: FormData): number {
  const raw = readStringField(formData, 'blendCount')
  const count = Number.parseInt(raw, 10)

  if (!Number.isInteger(count)) return 0
  if (count < 1 || count > NPD_ORDER_LIMITS.maxBlends) return 0
  return count
}

function readNpdOrderSubmission(formData: FormData): NpdOrderSubmission {
  const blendCount = readNpdBlendCount(formData)
  const date = normalizeAustralianDateInput(readStringField(formData, 'date'))
  const blends = Array.from({ length: blendCount }, (_, blendIndex) => {
    const index = blendIndex + 1

    return {
      name: readStringField(formData, npdBlendFieldName(index, 'name')),
      profile: readStringField(formData, npdBlendFieldName(index, 'profile')),
      certifiedOrganic: readStringField(
        formData,
        npdBlendFieldName(index, 'organic'),
      ),
      addNaturalFlavouring: readStringField(
        formData,
        npdBlendFieldName(index, 'flavouring'),
      ),
      flavours: readStringList(formData, npdBlendFieldName(index, 'flavours')),
      ingredients: readStringField(
        formData,
        npdBlendFieldName(index, 'ingredients'),
      ),
      aroma: readStringField(formData, npdBlendFieldName(index, 'aroma')),
      flavourSuggestion: readStringField(
        formData,
        npdBlendFieldName(index, 'flavourSuggestion'),
      ),
      notes: readStringField(formData, npdBlendFieldName(index, 'notes')),
    }
  })

  return {
    company: readStringField(formData, 'company'),
    date: date ?? '',
    timeframe: readStringField(formData, 'timeframe'),
    otherTimeframe: readStringField(formData, 'otherTimeframe'),
    productTypes: readStringList(formData, 'productTypes'),
    brandCertifiedOrganic: readStringField(formData, 'brandCertifiedOrganic'),
    blends,
    firstName: readStringField(formData, 'firstName'),
    lastName: readStringField(formData, 'lastName'),
    email: readStringField(formData, 'email'),
    phone: readStringField(formData, 'phone'),
    naturopathCertification:
      readStringField(formData, 'naturopathCertification') === 'YES',
    website: readStringField(formData, 'website'),
  }
}

function isValidNpdBlend(blend: NpdBlendSubmission) {
  if (!blend.name || blend.name.length > NPD_ORDER_LIMITS.field) return false
  if (!isYesNoOrEmpty(blend.certifiedOrganic)) return false
  if (!isYesNoOrEmpty(blend.addNaturalFlavouring)) return false

  if (
    blend.flavours.length > NPD_ORDER_LIMITS.maxFlavoursPerBlend ||
    blend.flavours.some((flavour) => !isNpdFlavour(flavour))
  ) {
    return false
  }

  const textFields = [
    blend.profile,
    blend.ingredients,
    blend.aroma,
    blend.flavourSuggestion,
    blend.notes,
  ]

  return textFields.every((field) => field.length <= NPD_ORDER_LIMITS.text)
}

function isValidNpdOrderSubmission(submission: NpdOrderSubmission) {
  if (
    !submission.company ||
    submission.company.length > NPD_ORDER_LIMITS.field
  ) {
    return false
  }

  if (!submission.date || submission.date.length > NPD_ORDER_LIMITS.field) {
    return false
  }

  if (submission.timeframe && !isNpdTimeframe(submission.timeframe)) {
    return false
  }

  if (submission.otherTimeframe.length > NPD_ORDER_LIMITS.text) return false

  if (
    submission.productTypes.some(
      (productType) => !isNpdProductType(productType),
    )
  ) {
    return false
  }

  if (!isYesNoOrEmpty(submission.brandCertifiedOrganic)) return false

  if (
    submission.blends.length === 0 ||
    submission.blends.length > NPD_ORDER_LIMITS.maxBlends ||
    !submission.blends.every(isValidNpdBlend)
  ) {
    return false
  }

  if (
    !submission.firstName ||
    submission.firstName.length > NPD_ORDER_LIMITS.field
  ) {
    return false
  }

  if (
    !submission.lastName ||
    submission.lastName.length > NPD_ORDER_LIMITS.field
  ) {
    return false
  }

  if (
    !submission.email ||
    submission.email.length > NPD_ORDER_LIMITS.email ||
    !EMAIL_PATTERN.test(submission.email)
  ) {
    return false
  }

  return submission.phone.length <= NPD_ORDER_LIMITS.phone
}

function formatNpdOrderSubmission(submission: NpdOrderSubmission) {
  const notProvided = 'Not provided'
  const lines = [
    'New product development order',
    '',
    `Company / customer name: ${submission.company}`,
    `Date: ${submission.date}`,
    `Estimated timeframe: ${submission.timeframe || notProvided}`,
    `Other timeframe details: ${submission.otherTimeframe || notProvided}`,
    `Product types: ${submission.productTypes.join(', ') || notProvided}`,
    `Brand certified organic: ${submission.brandCertifiedOrganic || notProvided}`,
    `Naturopath certification ($250 per SKU/blend): ${submission.naturopathCertification ? 'YES' : 'NO'}`,
  ]

  submission.blends.forEach((blend, blendIndex) => {
    lines.push(
      '',
      `Blend ${blendIndex + 1}: ${blend.name}`,
      `Blend profile: ${blend.profile || notProvided}`,
      `Certified organic: ${blend.certifiedOrganic || notProvided}`,
      `Add natural flavouring: ${blend.addNaturalFlavouring || notProvided}`,
      `Flavours: ${blend.flavours.join(', ') || notProvided}`,
      `Ingredient suggestions: ${blend.ingredients || notProvided}`,
      `Aroma suggestion: ${blend.aroma || notProvided}`,
      `Flavour suggestion: ${blend.flavourSuggestion || notProvided}`,
      `Additional notes or requirements: ${blend.notes || notProvided}`,
    )
  })

  lines.push(
    '',
    'Contact details',
    `First name: ${submission.firstName}`,
    `Last name: ${submission.lastName}`,
    `Email: ${submission.email}`,
    `Phone: ${submission.phone || notProvided}`,
  )

  return lines.join('\n')
}

export async function sendNpdOrderAction(
  formData: FormData,
): Promise<ContactActionResult> {
  const submission = readNpdOrderSubmission(formData)

  if (submission.website) {
    return { success: true }
  }

  if (!isValidNpdOrderSubmission(submission)) {
    return { success: false, error: VALIDATION_ERROR }
  }

  if (await isRateLimited('npd-order')) {
    return { success: false, error: RATE_LIMIT_ERROR }
  }

  const resendApiKey = getResendApiKey()
  if (!resendApiKey) {
    logProviderWarning('npd-order', 'provider-not-configured')
    return { success: false, error: SEND_ERROR }
  }

  try {
    const resend = new Resend(resendApiKey)
    const { error } = await resend.emails.send({
      from: 'Teavision NPD <noreply@teavision.com.au>',
      to: 'info@teavision.com.au',
      subject: 'New Teavision NPD form submission',
      text: formatNpdOrderSubmission(submission),
      replyTo: submission.email,
    })

    if (error) {
      logProviderError('npd-order', 'provider-error')
      return { success: false, error: SEND_ERROR }
    }

    return { success: true }
  } catch {
    logProviderError('npd-order', 'exception')
    return { success: false, error: SEND_ERROR }
  }
}

export async function sendNewsletterSignupAction(
  formData: FormData,
): Promise<NewsletterSignupActionResult> {
  const email = readField(formData, 'email')
  const website = readField(formData, 'website')

  if (website) {
    return { success: true }
  }

  if (
    !email ||
    email.length > CONTACT_EMAIL_MAX_LENGTH ||
    !EMAIL_PATTERN.test(email)
  ) {
    return { success: false, error: NEWSLETTER_VALIDATION_ERROR }
  }

  if (await isRateLimited('newsletter')) {
    return { success: false, error: RATE_LIMIT_ERROR }
  }

  try {
    await subscribeNewsletterEmail(email)
    return { success: true }
  } catch (error) {
    if (error instanceof ShopifyAdminConfigurationError) {
      logProviderWarning('newsletter', 'provider-not-configured')
    } else {
      logProviderError('newsletter', 'exception')
    }

    return { success: false, error: NEWSLETTER_SEND_ERROR }
  }
}

export async function sendNewsletterSignupFormAction(
  _previousState: NewsletterSignupActionResult,
  formData: FormData,
): Promise<NewsletterSignupActionResult> {
  return sendNewsletterSignupAction(formData)
}
