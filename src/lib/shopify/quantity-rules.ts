type QuantityRuleSource = {
  currentlyNotInStock?: boolean
  quantityAvailable?: number | null
  quantityRule?: {
    minimum: number
    maximum: number | null
    increment: number
  }
}

type QuantityTier = {
  minimumQuantity: number
}

export function getVariantMinimumQuantity(
  variant: QuantityRuleSource | undefined,
): number {
  return variant?.quantityRule?.minimum ?? 1
}

export function getVariantMaximumQuantity(
  variant: QuantityRuleSource | undefined,
): number | undefined {
  if (!variant) return undefined

  const candidates = [
    variant.quantityRule?.maximum ?? undefined,
    variant.currentlyNotInStock === true
      ? undefined
      : (variant.quantityAvailable ?? undefined),
  ].filter((value): value is number => value !== undefined && value >= 0)

  if (candidates.length === 0) return undefined

  return Math.min(...candidates)
}

export function getVariantQuantityIncrement(
  variant: QuantityRuleSource | undefined,
): number {
  return Math.max(1, variant?.quantityRule?.increment ?? 1)
}

export function alignTiersToQuantityRule<T extends QuantityTier>(
  tiers: readonly T[],
  {
    maximumQuantity,
    minimumQuantity,
    quantityIncrement,
  }: {
    maximumQuantity: number | undefined
    minimumQuantity: number
    quantityIncrement: number
  },
): T[] {
  const alignedTiers = new Map<number, T>()

  for (const tier of [...tiers].sort(
    (a, b) => a.minimumQuantity - b.minimumQuantity,
  )) {
    const steps = Math.max(
      0,
      Math.ceil((tier.minimumQuantity - minimumQuantity) / quantityIncrement),
    )
    const reachableQuantity = minimumQuantity + steps * quantityIncrement

    if (maximumQuantity !== undefined && reachableQuantity > maximumQuantity) {
      continue
    }

    // If thresholds land on the same reachable quantity, keep the deeper
    // tier because Shopify evaluates the highest qualifying threshold.
    alignedTiers.set(reachableQuantity, {
      ...tier,
      minimumQuantity: reachableQuantity,
    })
  }

  return [...alignedTiers.values()]
}

export function clampQuantity({
  maximumQuantity,
  minimumQuantity,
  quantityIncrement,
  value,
}: {
  maximumQuantity: number | undefined
  minimumQuantity: number
  quantityIncrement: number
  value: number
}): number {
  if (maximumQuantity !== undefined && maximumQuantity < minimumQuantity) {
    return minimumQuantity
  }

  const safeValue = Number.isFinite(value) ? Math.trunc(value) : minimumQuantity
  const lowerBounded = Math.max(minimumQuantity, safeValue)
  const upperBounded =
    maximumQuantity === undefined
      ? lowerBounded
      : Math.min(maximumQuantity, lowerBounded)
  const steppedValue =
    minimumQuantity +
    Math.floor((upperBounded - minimumQuantity) / quantityIncrement) *
      quantityIncrement

  return steppedValue
}
