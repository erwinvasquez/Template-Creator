'use client'

import { useCallback, useEffect, useMemo, useState, useTransition } from 'react'
import type { CommerceRuntimeActions } from './actions'
import type { ProductDetailViewModel } from './product'
import {
  localSelectedVariantIdFromProduct,
  mergeProductWithSelectedVariant,
  nextLocalSelectedVariantId,
} from './productDetailHostSelection'

export type ProductDetailHost = Readonly<{
  getDetail: (slug: string) => Promise<ProductDetailViewModel | null>
  actions: Pick<
    CommerceRuntimeActions,
    'selectVariant' | 'addToCart' | 'openCartDrawer' | 'confirmAddToCartSuccess'
  >
}>

export function useHostProductDetail(host: ProductDetailHost, slug: string) {
  const [product, setProduct] = useState<ProductDetailViewModel | null>(null)
  const [missing, setMissing] = useState(false)
  const [localSelectedVariantId, setLocalSelectedVariantId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  useEffect(() => {
    let cancelled = false
    void host.getDetail(slug).then((loaded) => {
      if (cancelled) return
      startTransition(() => {
        if (!loaded) {
          setMissing(true)
          setProduct(null)
          setLocalSelectedVariantId(null)
        } else {
          setProduct(loaded)
          setLocalSelectedVariantId(localSelectedVariantIdFromProduct(loaded))
          setMissing(false)
        }
      })
    })
    return () => {
      cancelled = true
    }
  }, [host, slug])

  const productForView = useMemo(() => {
    if (!product) return null
    return mergeProductWithSelectedVariant(product, localSelectedVariantId)
  }, [product, localSelectedVariantId])

  const selectVariant = useCallback(
    (variantId: string) => {
      setLocalSelectedVariantId((current) => nextLocalSelectedVariantId(current, variantId))
      host.actions.selectVariant(variantId)
    },
    [host.actions],
  )

  const actions = useMemo(
    () => ({
      selectVariant,
      addToCart: host.actions.addToCart,
      openCartDrawer: host.actions.openCartDrawer,
      confirmAddToCartSuccess: host.actions.confirmAddToCartSuccess,
    }),
    [host.actions, selectVariant],
  )

  return { product: productForView, missing, actions }
}
