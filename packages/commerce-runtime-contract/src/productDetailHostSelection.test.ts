import { describe, expect, it } from 'vitest'

import type { ProductDetailViewModel } from './product'
import {
  localSelectedVariantIdFromProduct,
  mergeProductWithSelectedVariant,
  nextLocalSelectedVariantId,
} from './productDetailHostSelection'

function minimalProduct(selectedVariantId: string | null): ProductDetailViewModel {
  return {
    id: 'prod-1',
    slug: 'anillo-demo',
    href: '/products/anillo-demo',
    name: 'Anillo demo',
    description: null,
    shortDescription: null,
    gallery: [],
    variants: [
      {
        id: 'v-rojo-oro',
        label: 'Rojo / Oro',
        sku: null,
        options: [
          { name: 'Color', value: 'Rojo' },
          { name: 'Material', value: 'Oro' },
        ],
        displayPrice: '$100',
        compareAtPrice: null,
        stockLabel: 'available',
        maxQuantity: 5,
        available: true,
        imageUrl: null,
      },
      {
        id: 'v-azul-plata',
        label: 'Azul / Plata',
        sku: null,
        options: [
          { name: 'Color', value: 'Azul' },
          { name: 'Material', value: 'Plata' },
        ],
        displayPrice: '$120',
        compareAtPrice: null,
        stockLabel: 'available',
        maxQuantity: 3,
        available: true,
        imageUrl: null,
      },
    ],
    currency: 'USD',
    selectedVariantId,
    stockLabel: null,
    maxQuantity: 5,
    canAddToCart: true,
    highlights: [],
    bulletPoints: [],
    keyFeatures: [],
    specifications: [],
    badges: [],
    brandLabel: null,
    categoryLabels: [],
    collectionLabels: [],
    relatedProducts: [],
    optionDefinitions: [
      { name: 'Color', values: ['Rojo', 'Azul'] },
      { name: 'Material', values: ['Oro', 'Plata'] },
    ],
  }
}

describe('productDetailHostSelection', () => {
  it('regresión Sprint 6: sin estado local la selección no cambia en el view model', () => {
    const loaded = minimalProduct('v-rojo-oro')

    // Patrón roto: ProductView pasa `product` sin actualizar tras selectVariant.
    const brokenView = loaded
    expect(brokenView.selectedVariantId).toBe('v-rojo-oro')

    // El host sí recibe la nueva variante, pero el prop de la PDP no se actualiza.
    const afterSelectOnHostOnly = brokenView
    expect(afterSelectOnHostOnly.selectedVariantId).toBe('v-rojo-oro')
  })

  it('fusiona selectedVariantId local sin refetch del PDP', () => {
    const loaded = minimalProduct('v-rojo-oro')
    const localId = nextLocalSelectedVariantId(
      localSelectedVariantIdFromProduct(loaded),
      'v-azul-plata',
    )
    const merged = mergeProductWithSelectedVariant(loaded, localId)

    expect(merged.selectedVariantId).toBe('v-azul-plata')
    expect(merged).not.toBe(loaded)
    expect(loaded.selectedVariantId).toBe('v-rojo-oro')
  })

  it('mantiene el producto sin clonar si la selección no cambió', () => {
    const loaded = minimalProduct('v-rojo-oro')
    const merged = mergeProductWithSelectedVariant(loaded, 'v-rojo-oro')
    expect(merged).toBe(loaded)
  })

  it('reinicia la selección local al cargar un producto nuevo', () => {
    const first = minimalProduct('v-rojo-oro')
    const second = minimalProduct('v-azul-plata')
    expect(localSelectedVariantIdFromProduct(first)).toBe('v-rojo-oro')
    expect(localSelectedVariantIdFromProduct(second)).toBe('v-azul-plata')
  })
})
