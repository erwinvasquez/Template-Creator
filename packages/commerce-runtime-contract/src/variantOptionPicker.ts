export type VariantOptionLike = {
  id: string
  optionValues: readonly { option: string; value: string }[]
}

export type OptionDefinitionLike = {
  name: string
  values?: readonly string[]
}

export type OptionChipState =
  | 'impossible'
  | 'soldOut'
  | 'selectedSoldOut'
  | 'selected'
  | 'available'

export function sortOptionValuesAsc(values: readonly string[]): string[] {
  return [...values].sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
}

function buildDimensionsFromVariantsFirstAppearance(variants: readonly VariantOptionLike[]): string[] {
  const seen = new Set<string>()
  const order: string[] = []
  for (const v of variants) {
    for (const ov of v.optionValues) {
      if (!seen.has(ov.option)) {
        seen.add(ov.option)
        order.push(ov.option)
      }
    }
  }
  return order
}

/** Orden canónico de dimensiones: `optionDefinitions` del producto, con fallback por primera aparición. */
export function buildOptionDimensions(
  variants: readonly VariantOptionLike[],
  optionDefinitions?: readonly OptionDefinitionLike[] | null,
): string[] {
  const fromVariants = buildDimensionsFromVariantsFirstAppearance(variants)
  if (!optionDefinitions?.length) return fromVariants

  const ordered: string[] = []
  const seen = new Set<string>()
  for (const def of optionDefinitions) {
    const name = def.name.trim()
    if (!name || seen.has(name)) continue
    seen.add(name)
    ordered.push(name)
  }
  for (const dimension of fromVariants) {
    if (!seen.has(dimension)) {
      seen.add(dimension)
      ordered.push(dimension)
    }
  }
  return ordered
}

/** Valores presentes en variantes, ordenados A–Z con comparación numérica natural (7, 8, 9, 10). */
export function valuesForDimension(
  variants: readonly VariantOptionLike[],
  dimension: string,
): string[] {
  const present = new Set<string>()
  for (const v of variants) {
    const match = v.optionValues.find((ov) => ov.option === dimension)
    if (match) present.add(match.value)
  }
  return sortOptionValuesAsc([...present])
}

export function selectionsFromVariant(
  variant: VariantOptionLike | undefined,
): Record<string, string> {
  if (!variant) return {}
  return Object.fromEntries(variant.optionValues.map((ov) => [ov.option, ov.value]))
}

function getVariantOptionValue(variant: VariantOptionLike, dimension: string): string | undefined {
  return variant.optionValues.find((ov) => ov.option === dimension)?.value
}

function variantMatchesPriorSelections(
  variant: VariantOptionLike,
  dimensions: readonly string[],
  selections: Readonly<Record<string, string>>,
  dimensionIndex: number,
): boolean {
  for (let i = 0; i < dimensionIndex; i++) {
    const dim = dimensions[i]!
    const selected = selections[dim]
    if (selected && getVariantOptionValue(variant, dim) !== selected) return false
  }
  return true
}

export function candidatesForDimensionValue(
  variants: readonly VariantOptionLike[],
  dimensions: readonly string[],
  selections: Readonly<Record<string, string>>,
  dimensionIndex: number,
  value: string,
): VariantOptionLike[] {
  const dimension = dimensions[dimensionIndex]
  if (!dimension) return []

  return variants.filter((variant) => {
    if (getVariantOptionValue(variant, dimension) !== value) return false
    return variantMatchesPriorSelections(variant, dimensions, selections, dimensionIndex)
  })
}

export function isOptionValueSelectable(
  variants: readonly VariantOptionLike[],
  dimensions: readonly string[],
  selections: Readonly<Record<string, string>>,
  dimensionIndex: number,
  value: string,
): boolean {
  return (
    candidatesForDimensionValue(variants, dimensions, selections, dimensionIndex, value).length > 0
  )
}

export function resolveVariantForDimensionSelection(
  variants: readonly VariantOptionLike[],
  dimensions: readonly string[],
  selections: Readonly<Record<string, string>>,
  dimensionIndex: number,
  value: string,
  options: {
    maxAddQtyByVariantId: Readonly<Record<string, number>>
    preferredVariantId?: string
  },
): VariantOptionLike | undefined {
  const candidates = candidatesForDimensionValue(
    variants,
    dimensions,
    selections,
    dimensionIndex,
    value,
  )
  if (candidates.length === 0) return undefined

  const ranked = [...candidates].sort((a, b) => {
    const aPurchasable = (options.maxAddQtyByVariantId[a.id] ?? 0) > 0 ? 1 : 0
    const bPurchasable = (options.maxAddQtyByVariantId[b.id] ?? 0) > 0 ? 1 : 0
    if (bPurchasable !== aPurchasable) return bPurchasable - aPurchasable

    let aStability = 0
    let bStability = 0
    for (let j = dimensionIndex + 1; j < dimensions.length; j++) {
      const dim = dimensions[j]!
      const selected = selections[dim]
      if (!selected) continue
      if (getVariantOptionValue(a, dim) === selected) aStability++
      if (getVariantOptionValue(b, dim) === selected) bStability++
    }
    if (bStability !== aStability) return bStability - aStability

    if (options.preferredVariantId) {
      if (a.id === options.preferredVariantId) return -1
      if (b.id === options.preferredVariantId) return 1
    }

    return 0
  })

  return ranked[0]
}

export function chipStateForOptionValue(
  variants: readonly VariantOptionLike[],
  dimensions: readonly string[],
  selections: Readonly<Record<string, string>>,
  dimensionIndex: number,
  value: string,
  maxAddQtyByVariantId: Readonly<Record<string, number>>,
): OptionChipState {
  const dimension = dimensions[dimensionIndex]
  if (!dimension) return 'impossible'

  const candidates = candidatesForDimensionValue(
    variants,
    dimensions,
    selections,
    dimensionIndex,
    value,
  )
  if (candidates.length === 0) return 'impossible'

  const purchasable = candidates.some((variant) => (maxAddQtyByVariantId[variant.id] ?? 0) > 0)
  const isSelected = selections[dimension] === value
  if (!purchasable) return isSelected ? 'selectedSoldOut' : 'soldOut'
  return isSelected ? 'selected' : 'available'
}

export function canUseVariantOptionPickers(variants: readonly VariantOptionLike[]): boolean {
  if (variants.length <= 1) return false
  const withOptions = variants.filter((v) => v.optionValues.length > 0)
  if (withOptions.length === 0) return false
  return buildOptionDimensions(withOptions).length > 0
}
