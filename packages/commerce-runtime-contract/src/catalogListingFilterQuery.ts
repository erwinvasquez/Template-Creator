import type { CatalogFilterPatch } from "./catalog";

function setCsvParam(params: URLSearchParams, key: string, values?: string[] | null) {
  if (!values?.length) {
    params.delete(key);
    return;
  }
  params.set(key, values.join(","));
}

/**
 * Serializa FILTER-01 en query de PLP (paridad con SaaS `catalogQueryInputToURLSearchParams`).
 */
export function applyCatalogFilterPatchToSearchParams(
  params: URLSearchParams,
  patch: CatalogFilterPatch,
): void {
  setCsvParam(params, "categoryIds", patch.categoryIds);
  setCsvParam(params, "collectionIds", patch.collectionIds);
  setCsvParam(params, "brandIds", patch.brandIds);
  setCsvParam(params, "colors", patch.colors);
  setCsvParam(params, "sizes", patch.sizes);
  setCsvParam(params, "materials", patch.materials);
  if (patch.priceMin != null) params.set("priceMin", String(patch.priceMin));
  else params.delete("priceMin");
  if (patch.priceMax != null) params.set("priceMax", String(patch.priceMax));
  else params.delete("priceMax");
  if (patch.hideOutOfStock) params.set("hideOutOfStock", "1");
  else params.delete("hideOutOfStock");
  if (patch.hasDiscount) params.set("hasDiscount", "1");
  else params.delete("hasDiscount");
  if (patch.salesMode) params.set("salesMode", patch.salesMode);
  params.delete("categoryId");
  params.delete("collectionId");
  params.delete("brandId");
  params.delete("categoria");
  params.delete("coleccion");
}
