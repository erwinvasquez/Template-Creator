import { describe, expect, it } from 'vitest'

import type { ProductDetailViewModel, ProductVariantViewModel } from './product'
import { cartLineRoleLabel, resolveCartFulfillmentHeading } from './cart'
import {
  canTransitionStockToMto,
  immediateAvailableQty,
  interpolateCount,
  resolveStockToMtoTransition,
  resolveStorefrontPurchaseCta,
  shouldOpenStockToMtoModal,
  stockCap,
} from './stockToMtoTransition'

function variant(
  partial: Partial<ProductVariantViewModel> & Pick<ProductVariantViewModel, 'id'>,
): ProductVariantViewModel {
  return {
    label: 'M',
    options: [],
    displayPrice: 'Bs. 100',
    available: true,
    ...partial,
  }
}

function product(partial: Partial<ProductDetailViewModel> = {}): ProductDetailViewModel {
  return {
    id: 'p1',
    slug: 'camisa',
    href: '/tienda/camisa',
    name: 'Camisa',
    gallery: [],
    variants: [],
    currency: 'BOB',
    canAddToCart: true,
    ...partial,
  }
}

const upsell = {
  productHref: '/tienda/camisa?salesMode=madeToOrder',
  preparationPromiseLabel: '3–5 días',
}

describe('stockCap / immediateAvailableQty', () => {
  it('usa maxQuantity de variante o producto', () => {
    const p = product({ maxQuantity: 5 })
    expect(stockCap(variant({ id: 'v1', maxQuantity: 2 }), p)).toBe(2)
    expect(stockCap(undefined, p)).toBe(5)
  })

  it('immediateAvailableQty devuelve 0 cuando falta', () => {
    expect(immediateAvailableQty(variant({ id: 'v1' }))).toBe(0)
    expect(immediateAvailableQty(variant({ id: 'v1', immediateAvailableQty: 2 }))).toBe(2)
  })
})

describe('canTransitionStockToMto', () => {
  it('requiere upsell con href y canal MTO abierto', () => {
    expect(canTransitionStockToMto(product({ madeToOrderUpsell: upsell }))).toBe(true)
    expect(canTransitionStockToMto(product())).toBe(false)
    expect(
      canTransitionStockToMto(
        product({ madeToOrderUpsell: upsell, madeToOrderClosed: true }),
      ),
    ).toBe(false)
  })
})

describe('resolveStockToMtoTransition — matriz', () => {
  const selectedZero = variant({ id: 'v1', immediateAvailableQty: 0, maxQuantity: 0 })
  const selectedTwo = variant({ id: 'v1', immediateAvailableQty: 2, maxQuantity: 2 })

  it('immediate=0 + upsell → immediateExhausted (trigger B)', () => {
    const p = product({ madeToOrderUpsell: upsell })
    expect(resolveStockToMtoTransition(p, selectedZero, 1)).toEqual({
      kind: 'immediateExhausted',
    })
  })

  it('immediate=2, qty=3 → quantityExceedsImmediate (trigger A)', () => {
    const p = product({ madeToOrderUpsell: upsell })
    expect(resolveStockToMtoTransition(p, selectedTwo, 3)).toEqual({
      kind: 'quantityExceedsImmediate',
      immediateQty: 2,
      requestedQty: 3,
    })
  })

  it('immediate=2, qty=1 → null', () => {
    const p = product({ madeToOrderUpsell: upsell })
    expect(resolveStockToMtoTransition(p, selectedTwo, 1)).toBeNull()
  })

  it('sin upsell → null', () => {
    expect(resolveStockToMtoTransition(product(), selectedZero, 1)).toBeNull()
  })

  it('upsell + closed → null', () => {
    expect(
      resolveStockToMtoTransition(
        product({ madeToOrderUpsell: upsell, madeToOrderClosed: true }),
        selectedZero,
        1,
      ),
    ).toBeNull()
  })

  it('immediate=0 prioriza trigger B aunque qty supere cap', () => {
    const p = product({ madeToOrderUpsell: upsell })
    expect(resolveStockToMtoTransition(p, selectedZero, 99)).toEqual({
      kind: 'immediateExhausted',
    })
  })
})

describe('shouldOpenStockToMtoModal', () => {
  it('solo abre modal en trigger A', () => {
    expect(
      shouldOpenStockToMtoModal({
        kind: 'quantityExceedsImmediate',
        immediateQty: 2,
        requestedQty: 3,
      }),
    ).toBe(true)
    expect(shouldOpenStockToMtoModal({ kind: 'immediateExhausted' })).toBe(false)
  })
})

describe('interpolateCount', () => {
  it('reemplaza {count} en plantilla', () => {
    expect(interpolateCount('Solo {count} unidades', 2)).toBe('Solo 2 unidades')
  })
})

describe('resolveStorefrontPurchaseCta', () => {
  it('stock cero con preparación usa añadir, no el enlace legacy', () => {
    expect(
      resolveStorefrontPurchaseCta({
        purchaseState: 'prepared',
        canAddToCart: true,
        preparationPromiseLabel: '3 a 7 días',
        hasLegacyUpsell: true,
      }),
    ).toEqual({
      kind: 'add',
      availability: 'prepared',
      preparationPromiseLabel: '3 a 7 días',
    })
  })

  it('stock inmediato usa añadir sin promesa', () => {
    expect(
      resolveStorefrontPurchaseCta({
        purchaseState: 'immediate',
        canAddToCart: true,
        preparationPromiseLabel: '3 a 7 días',
        hasLegacyUpsell: false,
      }),
    ).toEqual({
      kind: 'add',
      availability: 'immediate',
      preparationPromiseLabel: null,
    })
  })

  it('productor 1.1 sin estado de compra conserva el upsell', () => {
    expect(
      resolveStorefrontPurchaseCta({
        canAddToCart: false,
        hasLegacyUpsell: true,
      }),
    ).toEqual({ kind: 'legacy-upsell' })
  })

  it('variante bloqueada no es comprable', () => {
    expect(
      resolveStorefrontPurchaseCta({
        purchaseState: 'unavailable',
        canAddToCart: false,
        hasLegacyUpsell: false,
      }),
    ).toEqual({ kind: 'blocked' })
  })
})

describe('resolveCartFulfillmentHeading', () => {
  const labels = { immediateLabel: 'Entrega inmediata', preparedLabel: 'Bajo pedido' }

  it('no etiqueta una línea preparada como entrega inmediata', () => {
    expect(
      resolveCartFulfillmentHeading({
        cartSalesMode: 'stock',
        lines: [
          { fulfillmentRole: 'immediate', salesMode: 'stock' },
          { fulfillmentRole: 'prepared', salesMode: 'madeToOrder' },
        ],
        ...labels,
      }),
    ).toBeNull()
    expect(
      cartLineRoleLabel({
        line: { fulfillmentRole: 'prepared', salesMode: 'madeToOrder' },
        cartSalesMode: 'stock',
        ...labels,
        mixed: true,
      }),
    ).toBe('Bajo pedido')
  })

  it('un carrito solo preparado usa el encabezado de preparación', () => {
    expect(
      resolveCartFulfillmentHeading({
        cartSalesMode: 'stock',
        lines: [{ fulfillmentRole: 'prepared', salesMode: 'madeToOrder' }],
        ...labels,
      }),
    ).toBe('Bajo pedido')
  })
})
