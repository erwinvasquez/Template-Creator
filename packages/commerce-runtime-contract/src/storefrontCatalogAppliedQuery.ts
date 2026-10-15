import type { CatalogFilterPatch, SalesMode } from "./catalog";

export type StorefrontCatalogTaxonomyRef = Readonly<{
  categories: ReadonlyArray<{ id: string; slug: string }>;
  collections: ReadonlyArray<{ id: string; slug: string }>;
}>;

export type StorefrontCatalogAppliedQuery = Readonly<{
  /** Stable signature for effects / session keys (excludes cursor). */
  signature: string;
  filterPatch: CatalogFilterPatch;
}>;

const FILTER_SIGNATURE_KEYS = [
  "q",
  "salesMode",
  "sort",
  "categoryIds",
  "collectionIds",
  "brandIds",
  "colors",
  "sizes",
  "materials",
  "priceMin",
  "priceMax",
  "hideOutOfStock",
  "hasDiscount",
  "categoria",
  "coleccion",
] as const;

function parseCsv(raw: string | null): string[] {
  if (!raw?.trim()) return [];
  return [...new Set(raw.split(",").map((v) => v.trim()).filter(Boolean))].sort();
}

function stableCsvParam(value: string): string {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .sort()
    .join(",");
}

export function catalogAppliedQuerySignature(params: URLSearchParams): string {
  const normalized = new URLSearchParams();
  for (const key of FILTER_SIGNATURE_KEYS) {
    const value = params.get(key);
    if (value == null || value === "") continue;
    if (
      key === "categoryIds" ||
      key === "collectionIds" ||
      key === "brandIds" ||
      key === "colors" ||
      key === "sizes" ||
      key === "materials"
    ) {
      const stable = stableCsvParam(value);
      if (stable) normalized.set(key, stable);
      continue;
    }
    normalized.set(key, value);
  }
  return normalized.toString();
}

function resolveLegacyTaxonomyIds(input: {
  params: URLSearchParams;
  taxonomy?: StorefrontCatalogTaxonomyRef;
  categorySlugKey: string;
  collectionSlugKey: string;
}): Readonly<{ categoryIds: string[]; collectionIds: string[] }> {
  const categoryIds = parseCsv(input.params.get("categoryIds"));
  const collectionIds = parseCsv(input.params.get("collectionIds"));
  if (categoryIds.length > 0 || collectionIds.length > 0) {
    return { categoryIds, collectionIds };
  }
  const taxonomy = input.taxonomy;
  if (!taxonomy) return { categoryIds: [], collectionIds: [] };
  const categorySlug = input.params.get(input.categorySlugKey);
  const collectionSlug = input.params.get(input.collectionSlugKey);
  const legacyCategory =
    categorySlug && categorySlug !== "todos"
      ? taxonomy.categories.find((c) => c.slug === categorySlug)?.id
      : undefined;
  const legacyCollection =
    collectionSlug && collectionSlug !== "todos"
      ? taxonomy.collections.find((c) => c.slug === collectionSlug)?.id
      : undefined;
  return {
    categoryIds: legacyCategory ? [legacyCategory] : [],
    collectionIds: legacyCollection ? [legacyCollection] : [],
  };
}

/** Parse URL search params into one applied catalog filter snapshot. */
export function parseStorefrontCatalogAppliedQuery(input: Readonly<{
  searchParams: URLSearchParams;
  defaultSalesMode: SalesMode;
  taxonomy?: StorefrontCatalogTaxonomyRef;
  categorySlugParam?: string;
  collectionSlugParam?: string;
}>): StorefrontCatalogAppliedQuery {
  const categorySlugKey = input.categorySlugParam ?? "categoria";
  const collectionSlugKey = input.collectionSlugParam ?? "coleccion";
  const { categoryIds, collectionIds } = resolveLegacyTaxonomyIds({
    params: input.searchParams,
    taxonomy: input.taxonomy,
    categorySlugKey,
    collectionSlugKey,
  });

  const salesModeRaw = input.searchParams.get("salesMode");
  const salesMode: SalesMode =
    salesModeRaw === "madeToOrder" || salesModeRaw === "stock"
      ? salesModeRaw
      : input.defaultSalesMode;

  const filterPatch: CatalogFilterPatch = {
    searchQuery: input.searchParams.get("q")?.trim() || null,
    sort: input.searchParams.get("sort") || "featured",
    salesMode,
    categoryId: null,
    collectionId: null,
    brandId: null,
    categoryIds,
    collectionIds,
    brandIds: parseCsv(input.searchParams.get("brandIds")),
    colors: parseCsv(input.searchParams.get("colors")),
    sizes: parseCsv(input.searchParams.get("sizes")),
    materials: parseCsv(input.searchParams.get("materials")),
    priceMin: input.searchParams.get("priceMin")
      ? Number(input.searchParams.get("priceMin"))
      : null,
    priceMax: input.searchParams.get("priceMax")
      ? Number(input.searchParams.get("priceMax"))
      : null,
    hideOutOfStock: input.searchParams.get("hideOutOfStock") === "1",
    hasDiscount: input.searchParams.get("hasDiscount") === "1",
  };

  return {
    signature: catalogAppliedQuerySignature(input.searchParams),
    filterPatch,
  };
}

/** Merge filter sheet patch onto current applied state for a single canonical navigation. */
export function buildCatalogFilterPatchForNavigation(
  searchParams: URLSearchParams,
  current: Readonly<{
    salesMode: SalesMode;
    searchQuery?: string;
    activeSort?: string;
    activeCategoryIds?: string[];
    activeCollectionIds?: string[];
    activeBrandIds?: string[];
    activeColors?: string[];
    activeSizes?: string[];
    activeMaterials?: string[];
    activePriceMin?: number | null;
    activePriceMax?: number | null;
    hideOutOfStock?: boolean;
    hasDiscount?: boolean;
  }>,
  patch: CatalogFilterPatch,
  options?: Readonly<{ defaultSalesMode: SalesMode; taxonomy?: StorefrontCatalogTaxonomyRef }>,
): CatalogFilterPatch {
  const applied = parseStorefrontCatalogAppliedQuery({
    searchParams,
    defaultSalesMode: options?.defaultSalesMode ?? current.salesMode,
    taxonomy: options?.taxonomy,
  }).filterPatch;

  const merged: CatalogFilterPatch = {
    searchQuery: applied.searchQuery ?? current.searchQuery ?? null,
    sort: patch.sort ?? applied.sort ?? current.activeSort ?? "featured",
    salesMode: patch.salesMode ?? applied.salesMode ?? current.salesMode,
    categoryId: null,
    collectionId: null,
    brandId: null,
    categoryIds: patch.categoryIds ?? applied.categoryIds ?? current.activeCategoryIds ?? [],
    collectionIds:
      patch.collectionIds ?? applied.collectionIds ?? current.activeCollectionIds ?? [],
    brandIds: patch.brandIds ?? applied.brandIds ?? current.activeBrandIds ?? [],
    colors: patch.colors ?? applied.colors ?? current.activeColors ?? [],
    sizes: patch.sizes ?? applied.sizes ?? current.activeSizes ?? [],
    materials: patch.materials ?? applied.materials ?? current.activeMaterials ?? [],
    priceMin: patch.priceMin !== undefined ? patch.priceMin : applied.priceMin ?? current.activePriceMin ?? null,
    priceMax: patch.priceMax !== undefined ? patch.priceMax : applied.priceMax ?? current.activePriceMax ?? null,
    hideOutOfStock:
      patch.hideOutOfStock !== undefined && patch.hideOutOfStock !== null
        ? patch.hideOutOfStock
        : applied.hideOutOfStock ?? current.hideOutOfStock ?? false,
    hasDiscount:
      patch.hasDiscount !== undefined && patch.hasDiscount !== null
        ? patch.hasDiscount
        : applied.hasDiscount ?? current.hasDiscount ?? false,
  };

  return merged;
}
