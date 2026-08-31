'use client'

import { useActionState, useEffect, useId, useRef } from 'react'

import { Button } from '@/components/ui/button'
import { FormLabel } from '@/components/ui/form-label'
import { Textarea } from '@/components/ui/textarea'
import { TextInput } from '@/components/ui/text-input'
import type { ContactActionResult } from '@/lib/contact/types'
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

  const messageId = state.success ? `${id}-success` : `${id}-error`
  const hasMessage = state.success || Boolean(state.error)

  return (
    <form
      ref={formRef}
      action={formAction}
      aria-busy={isPending}
      className="grid gap-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <FormLabel htmlFor={`${id}-name`}>Name</FormLabel>
          <TextInput
            id={`${id}-name`}
            name="name"
            required
            maxLength={100}
            placeholder="Enter Name"
          />
        </div>
        <div className="grid gap-2">
          <FormLabel htmlFor={`${id}-phone`}>Number</FormLabel>
          <TextInput
            id={`${id}-phone`}
            name="phone"
            inputMode="tel"
            autoComplete="tel"
            maxLength={20}
            placeholder="Enter Number"
          />
        </div>
      </div>
      <div className="grid gap-2">
        <FormLabel htmlFor={`${id}-email`}>Email</FormLabel>
        <TextInput
          id={`${id}-email`}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          maxLength={254}
          placeholder="Enter Email"
        />
      </div>
      <div className="grid gap-2">
        <FormLabel htmlFor={`${id}-message`}>Message</FormLabel>
        <Textarea
          id={`${id}-message`}
          name="message"
          required
          maxLength={2000}
          rows={5}
          placeholder="Enter Message"
        />
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
          aria-live="polite"
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
