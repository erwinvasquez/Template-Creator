import { describe, expect, it } from 'vitest'
import {
  preferredGalleryIndexForVariant,
  resolveVariantIdForGallerySelection,
  type ProductDetailViewModel,
  type VariantOptionLike,
} from '@shopenlinea/commerce-runtime-contract'

describe('SF-01 productDetailGalleryVariantSync', () => {
  it('resuelve variante B al elegir imagen asociada', () => {
    const RED = 'v-red-pearl'
    const BLUE = 'v-blue-silk'
    const product: ProductDetailViewModel = {
      id: 'p1',
      slug: 's',
      href: '/h',
      name: 'N',
      gallery: [
        { id: 'g1', url: 'https://x/red', variantId: RED },
        { id: 'g2', url: 'https://x/blue', variantId: BLUE },
      ],
      variants: [
        {
          id: RED,
          label: 'Rojo / Perla',
          options: [
            { name: 'Color', value: 'Rojo' },
            { name: 'Material', value: 'Perla' },
          ],
          displayPrice: '1',
          available: true,
          maxQuantity: 1,
          imageUrl: 'https://x/red',
        },
        {
          id: BLUE,
          label: 'Celeste / Seda',
          options: [
            { name: 'Color', value: 'Celeste' },
            { name: 'Material', value: 'Seda' },
          ],
          displayPrice: '2',
          available: true,
          maxQuantity: 1,
          imageUrl: 'https://x/blue',
        },
      ],
      currency: 'EUR',
      selectedVariantId: RED,
      canAddToCart: true,
    }
    const pickerVariants: VariantOptionLike[] = product.variants.map((v) => ({
      id: v.id,
      optionValues: v.options.map((o) => ({ option: o.name, value: o.value })),
    }))
    const next = resolveVariantIdForGallerySelection(
      product.gallery[1]!,
      product,
      pickerVariants,
      ['Color', 'Material'],
      { [RED]: 1, [BLUE]: 1 },
      RED,
    )
    expect(next).toBe(BLUE)
  })

  it('elige la imagen de la variante comercial y cae a la principal si no tiene media', () => {
    const MEDIUM = 'combo-mediano'
    const LARGE = 'combo-grande'
    const product: ProductDetailViewModel = {
      id: 'kit',
      slug: 'combo',
      href: '/combo',
      name: 'Combo',
      gallery: [
        { id: 'primary', url: 'https://x/primary' },
        { id: 'medium', url: 'https://x/medium', variantId: MEDIUM },
        { id: 'large', url: 'https://x/large', variantId: LARGE },
      ],
      variants: [
        {
          id: MEDIUM,
          label: 'Combo Mediano',
          options: [{ name: 'Presentación', value: 'Combo Mediano' }],
          displayPrice: '10',
          available: true,
          maxQuantity: 1,
          imageUrl: 'https://x/medium',
        },
        {
          id: LARGE,
          label: 'Combo Grande',
          options: [{ name: 'Presentación', value: 'Combo Grande' }],
          displayPrice: '12',
          available: true,
          maxQuantity: 1,
          imageUrl: 'https://x/large',
        },
        {
          id: 'combo-sin-foto',
          label: 'Combo Sin Foto',
          options: [{ name: 'Presentación', value: 'Combo Sin Foto' }],
          displayPrice: '8',
          available: true,
          maxQuantity: 1,
        },
      ],
      currency: 'BOB',
      selectedVariantId: MEDIUM,
      canAddToCart: true,
    }
    expect(preferredGalleryIndexForVariant(product, MEDIUM)).toBe(1)
    expect(preferredGalleryIndexForVariant(product, LARGE)).toBe(2)
    expect(preferredGalleryIndexForVariant(product, 'combo-sin-foto')).toBe(0)
    const pickerVariants: VariantOptionLike[] = product.variants.map((variant) => ({
      id: variant.id,
      optionValues: variant.options.map((option) => ({ option: option.name, value: option.value })),
    }))
    expect(
      resolveVariantIdForGallerySelection(
        product.gallery[2]!,
        product,
        pickerVariants,
        ['Presentación'],
        { [MEDIUM]: 1, [LARGE]: 1, 'combo-sin-foto': 1 },
        MEDIUM,
      ),
    ).toBe(LARGE)
  })

  it('Presentación A→B→A cuando la portada es la imagen de la primera variante', () => {
    const ALFA = 'kit-alfa'
    const BETA = 'kit-beta'
    const GAMMA = 'kit-gamma'
    const product: ProductDetailViewModel = {
      id: 'kit',
      slug: 'kit',
      href: '/kit',
      name: 'Kit',
      gallery: [
        { id: 'alfa', url: 'https://x/kit-alfa', variantId: ALFA },
        { id: 'beta', url: 'https://x/kit-beta', variantId: BETA },
        { id: 'gamma', url: 'https://x/kit-gamma', variantId: GAMMA },
      ],
      variants: [
        {
          id: ALFA,
          label: 'Kit Alfa',
          options: [{ name: 'Presentación', value: 'Kit Alfa' }],
          displayPrice: '10',
          available: true,
          maxQuantity: 1,
          imageUrl: 'https://x/kit-alfa',
        },
        {
          id: BETA,
          label: 'Kit Beta',
          options: [{ name: 'Presentación', value: 'Kit Beta' }],
          displayPrice: '12',
          available: true,
          maxQuantity: 1,
          imageUrl: 'https://x/kit-beta',
        },
        {
          id: GAMMA,
          label: 'Kit Gamma',
          options: [{ name: 'Presentación', value: 'Kit Gamma' }],
          displayPrice: '14',
          available: true,
          maxQuantity: 1,
          imageUrl: 'https://x/kit-gamma',
        },
      ],
      currency: 'BOB',
      selectedVariantId: ALFA,
      canAddToCart: true,
    }
    const pickerVariants: VariantOptionLike[] = product.variants.map((variant) => ({
      id: variant.id,
      optionValues: variant.options.map((option) => ({ option: option.name, value: option.value })),
    }))
    const qty = { [ALFA]: 1, [BETA]: 1, [GAMMA]: 1 }

    expect(preferredGalleryIndexForVariant(product, ALFA)).toBe(0)
    expect(preferredGalleryIndexForVariant(product, BETA)).toBe(1)
    expect(preferredGalleryIndexForVariant(product, ALFA)).toBe(0)

    expect(
      resolveVariantIdForGallerySelection(product.gallery[1]!, product, pickerVariants, ['Presentación'], qty, ALFA),
    ).toBe(BETA)
    expect(
      resolveVariantIdForGallerySelection(product.gallery[0]!, product, pickerVariants, ['Presentación'], qty, BETA),
    ).toBe(ALFA)
    expect(
      resolveVariantIdForGallerySelection(product.gallery[2]!, product, pickerVariants, ['Presentación'], qty, ALFA),
    ).toBe(GAMMA)
  })
})
