import type { BulkPricingTier, Money } from '@/lib/shopify/types'
import { cn } from '@/lib/utils'
import { Button, ToggleButton } from '@/components/ui'

type BulkSavingsProps = {
  tiers: BulkPricingTier[]
  basePrice: Money
  selectedQuantity: number
  selectedTierQuantity?: number | null
  maximumQuantity?: number
  canAddToCart?: boolean
  isPending?: boolean
  onGrabDeal?: () => void
  onSelectTier?: (quantity: number) => void
  className?: string
}

function parseAmount(money: Money): number {
  const amount = Number.parseFloat(money.amount)
  return Number.isFinite(amount) ? amount : 0
}

function formatCurrency(money: Money): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: money.currencyCode,
  }).format(parseAmount(money))
}

function getTierLabel(tier: BulkPricingTier): string {
  return `Buy ${tier.minimumQuantity}+`
}

function getTierUnitAmount(tier: BulkPricingTier): number {
  return parseAmount(tier.price)
}

function getTotalPrice(price: Money, quantity: number): Money {
  return {
    amount: (parseAmount(price) * quantity).toFixed(2),
    currencyCode: price.currencyCode,
  }
}

function getActiveTier(
  tiers: BulkPricingTier[],
  selectedQuantity: number,
): BulkPricingTier | null {
  return (
    tiers
      .filter((tier) => selectedQuantity >= tier.minimumQuantity)
      .sort((a, b) => b.minimumQuantity - a.minimumQuantity)[0] ?? null
  )
}

export function BulkSavings({
  tiers,
  basePrice,
  selectedQuantity,
  selectedTierQuantity = null,
  maximumQuantity,
  canAddToCart = true,
  isPending = false,
  onGrabDeal,
  onSelectTier,
  className,
}: BulkSavingsProps) {
  const visibleTiers = tiers
    .filter(
      (tier) =>
        tier.minimumQuantity > 0 &&
        (maximumQuantity === undefined ||
          tier.minimumQuantity <= maximumQuantity),
    )
    .sort((a, b) => a.minimumQuantity - b.minimumQuantity)
  const selectedTier =
    selectedTierQuantity === null
      ? null
      : (visibleTiers.find(
          (tier) => tier.minimumQuantity === selectedTierQuantity,
        ) ?? null)
  const activeTier =
    selectedTier ?? getActiveTier(visibleTiers, selectedQuantity)

  if (visibleTiers.length === 0) return null

  // The deepest visible tier carries the highest discount — the badge marks
  // it regardless of which tier is currently selected.
  const bestValueTier = visibleTiers[visibleTiers.length - 1]

  return (
    <div className={cn('flex min-w-0 flex-col gap-3', className)}>
      <h2 className="text-ink-faint font-mono text-[11px] tracking-[0.12em] uppercase">
        Buy in Bulk and Save
      </h2>

      <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-3" role="list">
        {visibleTiers.map((tier) => {
          const isActive = activeTier?.minimumQuantity === tier.minimumQuantity
          const tierUnitAmount = getTierUnitAmount(tier)
          const tierPrice = tier.price
          const tierTotal = {
            amount: (tierUnitAmount * tier.minimumQuantity).toFixed(2),
            currencyCode: tierPrice.currencyCode,
          }
          const baseTotal = getTotalPrice(basePrice, tier.minimumQuantity)

          return (
            <li key={`${tier.minimumQuantity}-${tierPrice.amount}`}>
              <ToggleButton
                type="button"
                pressed={isActive}
                className={cn(
                  'border-hairline bg-card focus-visible:ring-ring aria-pressed:border-brand relative flex min-h-30 w-full flex-col items-center justify-center rounded-sm border p-3.5 text-center transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
                  onSelectTier && 'hover:border-brand',
                  isActive && 'border-brand',
                )}
                onClick={() => onSelectTier?.(tier.minimumQuantity)}
              >
                {tier.minimumQuantity === bestValueTier.minimumQuantity ? (
                  <span className="bg-brand text-paper absolute -top-2 left-1/2 -translate-x-1/2 rounded-full px-2 py-0.5 font-mono text-[9px] tracking-widest whitespace-nowrap uppercase">
                    Best value
                  </span>
                ) : null}

                <span className="text-ink-faint font-mono text-[11px] tracking-wider">
                  {getTierLabel(tier)}
                </span>

                <span className="mt-1 min-w-0">
                  <span className="flex min-w-0 flex-col items-center gap-1">
                    <span className="font-display text-ink text-[1.3rem] leading-tight tabular-nums">
                      {formatCurrency(tierPrice)}
                    </span>
                    <span className="text-ink-faint font-mono text-[10px] tabular-nums line-through">
                      {formatCurrency(basePrice)}
                    </span>
                  </span>
                  <span className="text-brand mt-1 flex min-w-0 flex-wrap justify-center gap-x-1 text-[11px] font-semibold tabular-nums">
                    <span className="whitespace-nowrap">
                      Total {formatCurrency(tierTotal)}
                    </span>
                    <span className="text-ink-faint whitespace-nowrap line-through">
                      {formatCurrency(baseTotal)}
                    </span>
                  </span>
                </span>
              </ToggleButton>
            </li>
          )
        })}
      </ul>

      {onGrabDeal ? (
        <>
          <Button
            variant="brand"
            size="lg"
            className="w-full"
            onClick={onGrabDeal}
            isLoading={isPending}
            disabled={!canAddToCart || isPending}
          >
            Grab this deal
          </Button>
          <p className="type-caption text-brand text-center">
            Note: When ordering in sizes over 1kg, your package may not be
            packed in individual 1kg bags and will instead come in bulk packed
            bags (2kg 5kg 10kg etc)
          </p>
        </>
      ) : null}
    </div>
  )
}
