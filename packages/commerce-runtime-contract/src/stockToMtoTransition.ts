import type {
  ProductDetailViewModel,
  ProductVariantViewModel,
  VariantPurchaseState,
} from './product'

export type StockToMtoTransitionTrigger =
  | { kind: 'quantityExceedsImmediate'; immediateQty: number; requestedQty: number }
  | { kind: 'immediateExhausted' }

export function stockCap(
  selected: ProductVariantViewModel | undefined,
  product: ProductDetailViewModel,
): number {
  return Math.max(0, selected?.maxQuantity ?? product.maxQuantity ?? 99)
}

export function immediateAvailableQty(
  selected: ProductVariantViewModel | undefined,
): number {
  return selected?.immediateAvailableQty ?? 0
}

/** ¿El producto puede ofrecer puente a MTO desde contexto stock? */
export function canTransitionStockToMto(
  product: ProductDetailViewModel,
  _selected?: ProductVariantViewModel,
): boolean {
  if (product.madeToOrderClosed) return false
  return product.madeToOrderUpsell?.productHref != null
}

/** null = sin transición; de lo contrario trigger A o B */
export function resolveStockToMtoTransition(
  product: ProductDetailViewModel,
  selected: ProductVariantViewModel | undefined,
  requestedQty: number,
): StockToMtoTransitionTrigger | null {
  if (!canTransitionStockToMto(product, selected)) return null

  const immediate = immediateAvailableQty(selected)
  const cap = stockCap(selected, product)

  if (immediate === 0) return { kind: 'immediateExhausted' }
  if (requestedQty > cap) {
    return {
      kind: 'quantityExceedsImmediate',
      immediateQty: immediate,
      requestedQty,
    }
  }

  return null
}

export function shouldOpenStockToMtoModal(trigger: StockToMtoTransitionTrigger): boolean {
  return trigger.kind === 'quantityExceedsImmediate'
}

export function interpolateCount(template: string, count: number): string {
  return template.replace(/\{count\}/g, String(count))
}

export type StorefrontPurchaseCta =
  | {
      kind: 'add'
      availability: 'immediate' | 'prepared' | 'immediateAndPrepared'
      preparationPromiseLabel: string | null
    }
  | { kind: 'legacy-upsell' }
  | { kind: 'blocked' }

/**
 * CTA público. Contrato 1.2 compra con la mutación unificada.
 * El enlace `?salesMode=` solo queda para un productor 1.1 sin estado de compra.
 */
export function resolveStorefrontPurchaseCta(input: {
  purchaseState?: VariantPurchaseState | null
  canAddToCart?: boolean | null
  preparationPromiseLabel?: string | null
  hasLegacyUpsell: boolean
  madeToOrderClosed?: boolean
}): StorefrontPurchaseCta {
  if (input.madeToOrderClosed) return { kind: 'blocked' }
  const state = input.purchaseState
  if (
    input.canAddToCart === true &&
    (state === 'immediate' || state === 'prepared' || state === 'immediateAndPrepared')
  ) {
    return {
      kind: 'add',
      availability: state,
      preparationPromiseLabel:
        state === 'immediate' ? null : (input.preparationPromiseLabel ?? null),
    }
  }
  if (input.hasLegacyUpsell && input.canAddToCart !== true) return { kind: 'legacy-upsell' }
  return { kind: 'blocked' }
}
