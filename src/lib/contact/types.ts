export type ContactField = 'name' | 'phone' | 'email' | 'message'

export type ContactActionResult = {
  success: boolean
  error?: string
  fieldErrors?: Partial<Record<ContactField, string>>
}

export type NewsletterSignupActionResult = ContactActionResult
