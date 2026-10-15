import type { ProductDetailViewModel } from './product'

/**
 * Combina el detalle cargado del host con la selección local de variante.
 * Evita refetch completo del PDP en cada `selectVariant` (Sprint 6) pero
 * mantiene `selectedVariantId` sincronizado para los pickers.
 */
export function mergeProductWithSelectedVariant(
  product: ProductDetailViewModel,
  localSelectedVariantId: string | null,
): ProductDetailViewModel {
  const effectiveId = localSelectedVariantId ?? product.selectedVariantId
  if (!effectiveId || product.selectedVariantId === effectiveId) {
    return product
  }
  return { ...product, selectedVariantId: effectiveId }
}

/** Estado local tras elegir una variante en la PDP. */
export function nextLocalSelectedVariantId(
  current: string | null,
  variantId: string,
): string {
  return variantId
}

/** Al cargar un producto nuevo, alinear la selección local con el host. */
export function localSelectedVariantIdFromProduct(
  product: ProductDetailViewModel | null,
): string | null {
  return product?.selectedVariantId ?? null
}
