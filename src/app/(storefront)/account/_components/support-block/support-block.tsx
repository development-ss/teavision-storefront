import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function SupportBlock() {
  return (
    <Card as="aside" padding="lg" radius="lg" tone="sunken">
      <div className="grid gap-3">
        <h2 className="type-heading-05 text-ink">Need account help?</h2>
        <p className="type-body-sm text-ink-soft">
          This account shows orders tied to the signed-in Shopify customer.
          Contact us if you need help with a guest order.
        </p>
        <Button href="/pages/contact" variant="secondary" size="sm">
          Contact support
        </Button>
      </div>
    </Card>
  )
}
