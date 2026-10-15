import type { ProductCardViewModel } from './catalog'
import { appendPdpVariantQueryToHref } from './productDetailVariantNavigation'

export type CatalogAvailabilityPresentation =
  | 'available'
  | 'contact'
  | 'sold_out'
  | 'made_to_order_available'

export function resolveCatalogAvailabilityPresentation(
  card: Pick<ProductCardViewModel, 'stockLabel' | 'madeToOrderUpsell'>,
): CatalogAvailabilityPresentation {
  if (card.stockLabel === 'contact') return 'contact'
  if (card.stockLabel === 'out_of_stock') {
    return card.madeToOrderUpsell?.productHref
      ? 'made_to_order_available'
      : 'sold_out'
  }
  return 'available'
}

export function catalogCardHref(
  card: Pick<
    ProductCardViewModel,
    'href' | 'stockLabel' | 'madeToOrderUpsell' | 'matchedVariantId'
  >,
): string {
  if (
    card.stockLabel === 'out_of_stock' &&
    card.madeToOrderUpsell?.productHref
  ) {
    return appendPdpVariantQueryToHref(
      card.madeToOrderUpsell.productHref,
      card.matchedVariantId,
    )
  }
  return card.href
}

export function shouldHideFromCatalog(
  card: Pick<ProductCardViewModel, 'stockLabel' | 'madeToOrderUpsell'>,
  hideOutOfStock: boolean,
): boolean {
  if (!hideOutOfStock) return false
  if (card.stockLabel !== 'out_of_stock') return false
  if (card.madeToOrderUpsell?.productHref) return false
  return true
}
