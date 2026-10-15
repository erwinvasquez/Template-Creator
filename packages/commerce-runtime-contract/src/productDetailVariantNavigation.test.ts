import { describe, expect, it } from 'vitest'

import {
  appendPdpVariantQueryToHref,
  readPdpVariantIdFromSearch,
  resolveValidPdpVariantIdForProduct,
  STOREFRONT_PDP_VARIANT_QUERY_PARAM,
} from './productDetailVariantNavigation'

describe('productDetailVariantNavigation', () => {
  it('lee variant desde search params', () => {
    expect(readPdpVariantIdFromSearch('?variant=green&salesMode=stock')).toBe('green')
    expect(readPdpVariantIdFromSearch(new URLSearchParams('variant=v-azul'))).toBe('v-azul')
  })

  it('appendPdpVariantQueryToHref preserva otros query params', () => {
    expect(appendPdpVariantQueryToHref('/tienda/camisa?salesMode=stock', 'green')).toBe(
      `/tienda/camisa?salesMode=stock&${STOREFRONT_PDP_VARIANT_QUERY_PARAM}=green`,
    )
  })

  it('valida variantId perteneciente al producto', () => {
    const variants = [{ id: 'green', available: true }, { id: 'red', available: false }]
    expect(resolveValidPdpVariantIdForProduct('green', variants)).toBe('green')
    expect(resolveValidPdpVariantIdForProduct('red', variants)).toBeNull()
    expect(resolveValidPdpVariantIdForProduct('other-product', variants)).toBeNull()
    expect(resolveValidPdpVariantIdForProduct(null, variants)).toBeNull()
  })
})
