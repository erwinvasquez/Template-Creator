import { describe, expect, it } from 'vitest'

import { buildShopListingHref, SHOP_QUERY, shouldClearShopSearchOnEmpty } from './resolve'

describe('buildShopListingHref', () => {
  it('añade q y elimina cursores de paginación', () => {
    const params = new URLSearchParams('categoria=mujer&after=abc&afterProductId=xyz')
    const href = buildShopListingHref('/site/demo', params, { q: 'vestido' })
    expect(href).toBe('/site/demo/tienda?categoria=mujer&q=vestido')
  })

  it('elimina q cuando el patch es vacío', () => {
    const params = new URLSearchParams('q=vestido&coleccion=verano')
    const href = buildShopListingHref('', params, { q: null })
    expect(href).toBe('/tienda?coleccion=verano')
  })
})

describe('shouldClearShopSearchOnEmpty', () => {
  it('solo limpia cuando había q en URL y el draft está vacío', () => {
    expect(shouldClearShopSearchOnEmpty('', 'vestido')).toBe(true)
    expect(shouldClearShopSearchOnEmpty('a', 'vestido')).toBe(false)
    expect(shouldClearShopSearchOnEmpty('', '')).toBe(false)
  })

  it('usa la clave q del contrato de shop', () => {
    expect(SHOP_QUERY.search).toBe('q')
  })
})
