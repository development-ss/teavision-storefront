import type { ComponentType } from 'react'

import { AmericanExpressMark } from '../payment-marks/american-express'
import { ApplePayMark } from '../payment-marks/apple-pay'
import { GooglePayMark } from '../payment-marks/google-pay'
import { MastercardMark } from '../payment-marks/mastercard'
import { PayPalMark } from '../payment-marks/paypal'
import { ShopPayMark } from '../payment-marks/shop-pay'
import { UnionPayMark } from '../payment-marks/union-pay'
import { VisaMark } from '../payment-marks/visa'
import type { PaymentMethod, PaymentMethodLabel } from '../types'

const PAYMENT_MARKS = {
  'American Express': AmericanExpressMark,
  'Apple Pay': ApplePayMark,
  'Google Pay': GooglePayMark,
  Mastercard: MastercardMark,
  PayPal: PayPalMark,
  'Shop Pay': ShopPayMark,
  'Union Pay': UnionPayMark,
  Visa: VisaMark,
} satisfies Record<PaymentMethodLabel, ComponentType>

export function PaymentMark({ method }: { method: PaymentMethod }) {
  const Mark = PAYMENT_MARKS[method.label]

  return (
    <span className="inline-flex shrink-0 items-center justify-center">
      <Mark />
    </span>
  )
}
