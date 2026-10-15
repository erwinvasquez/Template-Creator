const MONEY_EPSILON = 0.005;

export type QuantityPricingTierRef = Readonly<{
  id: string;
  minQuantity: number;
  unitPrice: number;
  label?: string | null;
}>;

export type QuantityPricingTierRowViewModel = Readonly<{
  minQuantity: number;
  unitPrice: number;
  /** Ej. "3+" o "3–5" — listo para UI. */
  rangeLabel: string;
  unitPriceDisplay?: string | null;
}>;

export type QuantityPricingProgressViewModel = Readonly<{
  minQuantity: number;
  unitPrice: number;
  remainingQuantity: number;
  /** Copy compacto listo para UI cuando el host lo provee. */
  message?: string | null;
}>;

/** Catálogo estático por variante (PDP / host). */
export type VariantQuantityPricingCatalogViewModel = Readonly<{
  listUnitPrice: number;
  tiers: readonly QuantityPricingTierRowViewModel[];
  /** Menor precio unitario entre tiers (teaser PLP). */
  lowestTierUnitPrice?: number | null;
}>;

/** Estado para una cantidad concreta (PDP qty selector / carrito). */
export type VariantQuantityPricingStateViewModel = Readonly<{
  listUnitPrice: number;
  catalogUnitPrice: number;
  quantity: number;
  tiers: readonly QuantityPricingTierRowViewModel[];
  currentTier: QuantityPricingTierRef | null;
  nextTier: QuantityPricingProgressViewModel | null;
  quantityPricingActive: boolean;
}>;

export type CartLineQuantityPricingViewModel = Readonly<{
  listUnitPrice: number;
  catalogUnitPrice: number;
  appliedTierMinQuantity: number | null;
  /** Etiqueta del tier aplicado, ej. "Precio por cantidad · 3+ unidades". */
  lineLabel: string | null;
  /** Progreso hacia el siguiente tier (solo tier futuro). */
  nextTierProgressLabel?: string | null;
  listUnitPriceDisplay?: string | null;
  catalogUnitPriceDisplay?: string | null;
}>;

export type QuantityPricingUiLabels = Readonly<{
  sectionTitle: string;
  perUnitSuffix: string;
  listPriceRow: string;
  appliedAtQuantity: string;
  nextTierTemplate: string;
  cartLineTemplate: string;
  plpTeaserTemplate: string;
}>;

function sortTiersAsc(tiers: readonly QuantityPricingTierRef[]): QuantityPricingTierRef[] {
  return [...tiers].sort((a, b) => a.minQuantity - b.minQuantity);
}

function resolveCurrentTier(
  quantity: number,
  tiers: readonly QuantityPricingTierRef[],
): QuantityPricingTierRef | null {
  let winner: QuantityPricingTierRef | null = null;
  for (const tier of tiers) {
    if (
      tier.minQuantity <= quantity &&
      (winner === null || tier.minQuantity > winner.minQuantity)
    ) {
      winner = tier;
    }
  }
  return winner;
}

/** Umbral canónico por minQuantity; ignora tier.label libre/legacy. */
function formatTierRangeLabel(
  tier: QuantityPricingTierRef,
  nextMin: number | null,
): string {
  if (nextMin != null && nextMin > tier.minQuantity) {
    return `${tier.minQuantity}–${nextMin - 1}`;
  }
  return `${tier.minQuantity}+`;
}

export function buildQuantityPricingTierRows(
  tiers: readonly QuantityPricingTierRef[],
): QuantityPricingTierRowViewModel[] {
  const sorted = sortTiersAsc(tiers);
  return sorted.map((tier, index) => {
    const next = sorted[index + 1]?.minQuantity ?? null;
    return {
      minQuantity: tier.minQuantity,
      unitPrice: tier.unitPrice,
      rangeLabel: formatTierRangeLabel(tier, next),
    };
  });
}

export function resolveVariantQuantityPricingState(input: {
  listUnitPrice: number;
  quantity: number;
  tiers: readonly QuantityPricingTierRef[];
  maxPurchasableQuantity?: number | null;
}): VariantQuantityPricingStateViewModel {
  const tiers = sortTiersAsc(input.tiers);
  const tierRows = buildQuantityPricingTierRows(tiers);
  const currentTier = resolveCurrentTier(input.quantity, tiers);
  const catalogUnitPrice = currentTier?.unitPrice ?? input.listUnitPrice;

  const currentMin = currentTier?.minQuantity ?? null;
  let nextTier: QuantityPricingProgressViewModel | null = null;
  for (const tier of tiers) {
    if (currentMin != null && tier.minQuantity <= currentMin) continue;
    if (tier.minQuantity <= input.quantity) continue;
    const remainingQuantity = tier.minQuantity - input.quantity;
    const maxQ = input.maxPurchasableQuantity;
    if (maxQ != null && tier.minQuantity > maxQ) {
      break;
    }
    nextTier = {
      minQuantity: tier.minQuantity,
      unitPrice: tier.unitPrice,
      remainingQuantity,
    };
    break;
  }

  return {
    listUnitPrice: input.listUnitPrice,
    catalogUnitPrice,
    quantity: input.quantity,
    tiers: tierRows,
    currentTier,
    nextTier,
    quantityPricingActive:
      currentTier != null && catalogUnitPrice < input.listUnitPrice - MONEY_EPSILON,
  };
}

export function variantQuantityPricingCatalog(input: {
  listUnitPrice: number;
  tiers: readonly QuantityPricingTierRef[];
}): VariantQuantityPricingCatalogViewModel | null {
  const tiers = sortTiersAsc(input.tiers);
  if (tiers.length === 0) return null;
  const tierRows = buildQuantityPricingTierRows(tiers);
  const lowest = tiers.reduce(
    (min, tier) => (tier.unitPrice < min ? tier.unitPrice : min),
    tiers[0]!.unitPrice,
  );
  return {
    listUnitPrice: input.listUnitPrice,
    tiers: tierRows,
    lowestTierUnitPrice: lowest,
  };
}

export function cartLineHasQuantityPricing(line: {
  quantityPricing?: CartLineQuantityPricingViewModel | null;
  listUnitPrice?: number | null;
  catalogUnitPrice?: number | null;
}): boolean {
  if (line.quantityPricing?.lineLabel) return true;
  if (
    typeof line.listUnitPrice === "number" &&
    typeof line.catalogUnitPrice === "number" &&
    line.listUnitPrice > line.catalogUnitPrice + MONEY_EPSILON
  ) {
    return true;
  }
  return false;
}

export function interpolateQuantityPricingTemplate(
  template: string,
  vars: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = vars[key];
    return value == null ? "" : String(value);
  });
}

export function buildNextTierProgressMessage(
  state: Pick<VariantQuantityPricingStateViewModel, "nextTier">,
  labels: Pick<QuantityPricingUiLabels, "nextTierTemplate">,
  formattedUnitPrice: string,
): string | null {
  const next = state.nextTier;
  if (!next) return null;
  return interpolateQuantityPricingTemplate(labels.nextTierTemplate, {
    count: next.remainingQuantity,
    unitPrice: formattedUnitPrice,
    minQuantity: next.minQuantity,
  });
}
