'use client'

import { useActionState, useEffect, useId, useRef } from 'react'

import { Button } from '@/components/ui/button'
import { FormLabel } from '@/components/ui/form-label'
import { Textarea } from '@/components/ui/textarea'
import { TextInput } from '@/components/ui/text-input'
import type {
  ContactActionResult,
  ContactField,
} from '@/lib/contact/types'
import { cn } from '@/lib/utils'

type ContactSectionFormProps = {
  action: (formData: FormData) => Promise<ContactActionResult>
}

const DEFAULT_ERROR =
  'Unable to send your message right now. Please try again shortly.'

const INITIAL_ACTION_STATE: ContactActionResult = { success: false }

export function ContactSectionForm({ action }: ContactSectionFormProps) {
  const id = useId()
  const formRef = useRef<HTMLFormElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const phoneRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const messageRef = useRef<HTMLTextAreaElement>(null)
  const [state, formAction, isPending] = useActionState(
    async (_previousState: ContactActionResult, formData: FormData) => {
      try {
        return await action(formData)
      } catch {
        return { success: false, error: DEFAULT_ERROR }
      }
    },
    INITIAL_ACTION_STATE,
  )

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset()
    }
  }, [state.success])

  useEffect(() => {
    if (state.success || !state.fieldErrors) return

    const firstErrorField = (
      ['name', 'phone', 'email', 'message'] as ContactField[]
    ).find((field) => state.fieldErrors?.[field])

    const firstErrorRef = {
      name: nameRef,
      phone: phoneRef,
      email: emailRef,
      message: messageRef,
    }[firstErrorField ?? 'name']

    if (firstErrorField) {
      firstErrorRef.current?.focus()
    }
  }, [state.fieldErrors, state.success])

  const messageId = state.success ? `${id}-success` : `${id}-error`
  const hasMessage = state.success || Boolean(state.error)
  const nameError = state.fieldErrors?.name
  const phoneError = state.fieldErrors?.phone
  const emailError = state.fieldErrors?.email
  const messageError = state.fieldErrors?.message
  const requiredFieldsNoteId = `${id}-required-fields`

  return (
    <form
      ref={formRef}
      action={formAction}
      aria-busy={isPending}
      className="grid gap-4"
    >
      <p id={requiredFieldsNoteId} className="type-body-sm text-ink-soft">
        Fields marked <span aria-hidden="true">*</span> are required.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <FormLabel htmlFor={`${id}-name`} required>
            Name
          </FormLabel>
          <TextInput
            id={`${id}-name`}
            name="name"
            ref={nameRef}
            autoComplete="name"
            required
            maxLength={100}
            placeholder="Enter Name"
            aria-describedby={nameError ? `${id}-name-error` : undefined}
            aria-invalid={nameError ? true : undefined}
          />
          {nameError ? (
            <p id={`${id}-name-error`} className="type-body-sm text-danger">
              {nameError}
            </p>
          ) : null}
        </div>
        <div className="grid gap-2">
          <FormLabel htmlFor={`${id}-phone`}>Phone number (optional)</FormLabel>
          <TextInput
            id={`${id}-phone`}
            name="phone"
            ref={phoneRef}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            maxLength={20}
            placeholder="Enter Number"
            aria-describedby={phoneError ? `${id}-phone-error` : undefined}
            aria-invalid={phoneError ? true : undefined}
          />
          {phoneError ? (
            <p id={`${id}-phone-error`} className="type-body-sm text-danger">
              {phoneError}
            </p>
          ) : null}
        </div>
      </div>
      <div className="grid gap-2">
        <FormLabel htmlFor={`${id}-email`} required>
          Email
        </FormLabel>
        <TextInput
          id={`${id}-email`}
          name="email"
          ref={emailRef}
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          maxLength={254}
          placeholder="Enter Email"
          aria-describedby={emailError ? `${id}-email-error` : undefined}
          aria-invalid={emailError ? true : undefined}
        />
        {emailError ? (
          <p id={`${id}-email-error`} className="type-body-sm text-danger">
            {emailError}
          </p>
        ) : null}
      </div>
      <div className="grid gap-2">
        <FormLabel htmlFor={`${id}-message`} required>
          Message
        </FormLabel>
        <Textarea
          id={`${id}-message`}
          name="message"
          ref={messageRef}
          required
          maxLength={2000}
          rows={5}
          placeholder="Enter Message"
          aria-describedby={messageError ? `${id}-message-error` : undefined}
          aria-invalid={messageError ? true : undefined}
        />
        {messageError ? (
          <p id={`${id}-message-error`} className="type-body-sm text-danger">
            {messageError}
          </p>
        ) : null}
      </div>
      <div className="sr-only" aria-hidden="true">
        <input
          id={`${id}-website`}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      <Button
        type="submit"
        variant="brand"
        size="cta"
        isLoading={isPending}
        disabled={isPending}
      >
        {isPending ? 'Sending…' : 'Submit'}
      </Button>
      {hasMessage ? (
        <p
          id={messageId}
          role={state.success ? 'status' : 'alert'}
          aria-live={state.success ? 'polite' : undefined}
          className={cn(
            'type-body-sm rounded-md border p-3',
            state.success
              ? 'border-brand bg-brand-tint text-brand'
              : 'border-danger bg-danger-tint text-danger',
          )}
        >
          {state.success
            ? 'Thanks. The Teavision team will review your enquiry shortly.'
            : state.error}
        </p>
      ) : null}
    </form>
  )
}
