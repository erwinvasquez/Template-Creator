import { describe, expect, it } from 'vitest'

import type { ProductCardViewModel } from './catalog'
import {
  catalogCardHref,
  resolveCatalogAvailabilityPresentation,
  shouldHideFromCatalog,
} from './catalogStockToMtoHint'

function card(
  partial: Partial<ProductCardViewModel> & Pick<ProductCardViewModel, 'href'>,
): ProductCardViewModel {
  return {
    id: 'p1',
    slug: 'camisa',
    name: 'Camisa',
    imageUrl: null,
    displayPrice: 'Bs. 100',
    currency: 'BOB',
    ...partial,
  }
}

const upsell = {
  productHref: '/tienda/camisa?salesMode=madeToOrder',
  preparationPromiseLabel: '3–5 días',
}

describe('resolveCatalogAvailabilityPresentation — matriz R6', () => {
  it('R6-1: stock disponible → available', () => {
    expect(
      resolveCatalogAvailabilityPresentation(
        card({ href: '/tienda/camisa', stockLabel: 'available', madeToOrderUpsell: upsell }),
      ),
    ).toBe('available')
  })

  it('R6-2: sin canal MTO → sold_out', () => {
    expect(
      resolveCatalogAvailabilityPresentation(
        card({ href: '/tienda/camisa', stockLabel: 'out_of_stock' }),
      ),
    ).toBe('sold_out')
  })

  it('R6-3: stock=0 + upsell → made_to_order_available', () => {
    expect(
      resolveCatalogAvailabilityPresentation(
        card({ href: '/tienda/camisa', stockLabel: 'out_of_stock', madeToOrderUpsell: upsell }),
      ),
    ).toBe('made_to_order_available')
  })

  it('R6-4: MTO cerrado sin upsell → sold_out', () => {
    expect(
      resolveCatalogAvailabilityPresentation(
        card({ href: '/tienda/camisa', stockLabel: 'out_of_stock', madeToOrderUpsell: null }),
      ),
    ).toBe('sold_out')
  })

  it('contact → contact', () => {
    expect(
      resolveCatalogAvailabilityPresentation(
        card({ href: '/tienda/camisa', stockLabel: 'contact' }),
      ),
    ).toBe('contact')
  })
})

describe('catalogCardHref', () => {
  it('prefiere href MTO cuando stock agotado con upsell', () => {
    expect(
      catalogCardHref(
        card({
          href: '/tienda/camisa?salesMode=stock',
          stockLabel: 'out_of_stock',
          madeToOrderUpsell: upsell,
        }),
      ),
    ).toBe('/tienda/camisa?salesMode=madeToOrder')
  })

  it('mantiene href stock cuando hay inventario', () => {
    expect(
      catalogCardHref(
        card({ href: '/tienda/camisa?salesMode=stock', stockLabel: 'available' }),
      ),
    ).toBe('/tienda/camisa?salesMode=stock')
  })
})

describe('shouldHideFromCatalog — R6-5', () => {
  it('no oculta producto con puente MTO', () => {
    expect(
      shouldHideFromCatalog(
        card({ href: '/tienda/camisa', stockLabel: 'out_of_stock', madeToOrderUpsell: upsell }),
        true,
      ),
    ).toBe(false)
  })

  it('oculta agotado sin upsell', () => {
    expect(
      shouldHideFromCatalog(
        card({ href: '/tienda/camisa', stockLabel: 'out_of_stock' }),
        true,
      ),
    ).toBe(true)
  })

  it('no oculta cuando filtro desactivado', () => {
    expect(
      shouldHideFromCatalog(
        card({ href: '/tienda/camisa', stockLabel: 'out_of_stock' }),
        false,
      ),
    ).toBe(false)
  })
})
