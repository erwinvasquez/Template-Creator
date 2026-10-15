/** Query param canónico PLP → PDP para continuidad de variante (SEARCH-01). */
export const STOREFRONT_PDP_VARIANT_QUERY_PARAM = 'variant'

export function readPdpVariantIdFromSearch(
  search: string | URLSearchParams | null | undefined,
): string | null {
  if (search == null) return null
  const params =
    typeof search === 'string'
      ? new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
      : search
  const raw = params.get(STOREFRONT_PDP_VARIANT_QUERY_PARAM)?.trim()
  return raw || null
}

/** Añade o reemplaza `variant=` en un href relativo o absoluto al path. */
export function appendPdpVariantQueryToHref(
  href: string,
  variantId: string | null | undefined,
): string {
  const id = variantId?.trim()
  if (!id) return href
  const qIndex = href.indexOf('?')
  const path = qIndex >= 0 ? href.slice(0, qIndex) : href
  const params = new URLSearchParams(qIndex >= 0 ? href.slice(qIndex + 1) : '')
  params.set(STOREFRONT_PDP_VARIANT_QUERY_PARAM, id)
  const qs = params.toString()
  return qs ? `${path}?${qs}` : path
}

export function resolveValidPdpVariantIdForProduct(
  requestedVariantId: string | null | undefined,
  variants: ReadonlyArray<{ id: string; available?: boolean }>,
): string | null {
  const id = requestedVariantId?.trim()
  if (!id) return null
  const match = variants.find((v) => v.id === id)
  if (!match) return null
  if (match.available === false) return null
  return match.id
}
