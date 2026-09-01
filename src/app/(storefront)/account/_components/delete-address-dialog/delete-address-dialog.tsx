'use client'

import { useActionState, useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import type { CustomerAccountFormState } from '@/lib/shopify/customer-account/types'

type DeleteAddressDialogProps = {
  action: (
    previousState: CustomerAccountFormState,
    formData: FormData,
  ) => Promise<CustomerAccountFormState>
  addressId: string
  addressLabel: string
  initialState?: CustomerAccountFormState
  isPendingOverride?: boolean
  openByDefault?: boolean
}

const initialDeleteAddressState: CustomerAccountFormState = {
  fieldErrors: {},
  message: null,
  status: 'idle',
}

export function DeleteAddressDialog({
  action,
  addressId,
  addressLabel,
  initialState = initialDeleteAddressState,
  isPendingOverride,
  openByDefault = false,
}: DeleteAddressDialogProps) {
  const [open, setOpen] = useState(openByDefault)
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(
    async (
      previousState: CustomerAccountFormState,
      formData: FormData,
    ): Promise<CustomerAccountFormState> => {
      const nextState = await action(previousState, formData)

      if (nextState.status === 'success') {
        setOpen(false)
        router.refresh()
      }

      return nextState
    },
    initialState,
  )
  const pending = isPendingOverride ?? isPending

  return (
    <>
      <Button variant="quiet" size="quiet" onClick={() => setOpen(true)}>
        Delete
      </Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Delete address"
        description="Delete this address? This cannot be undone."
        className="max-w-lg"
      >
        <form action={formAction} className="grid gap-5 p-5">
          <input type="hidden" name="addressId" value={addressId} />
          <p className="type-body-sm text-ink-soft">
            This removes {addressLabel} from your saved Shopify addresses.
          </p>
          {state.message ? (
            <p
              className="type-body-sm bg-danger-tint text-danger border-danger rounded-md border px-3 py-2"
              role={state.status === 'error' ? 'alert' : 'status'}
              aria-live={state.status === 'success' ? 'polite' : undefined}
            >
              {state.message}
            </p>
          ) : null}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Keep address
            </Button>
            <Button
              type="submit"
              variant="brand"
              disabled={pending}
              isLoading={pending}
            >
              Delete address
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  )
}
