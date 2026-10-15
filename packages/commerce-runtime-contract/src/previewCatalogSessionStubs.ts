import type { CatalogSessionViewModel, ProductSearchViewModel } from "./catalog";

/** Preview bridges: adapt listing page to catalog session shape. */
export function previewCatalogSessionFromListing(
  listing: ProductSearchViewModel,
  queryKey = "preview",
): CatalogSessionViewModel {
  return {
    products: listing.products,
    nextCursor: listing.nextCursor,
    queryKey,
    isLoadingMore: false,
  };
}
