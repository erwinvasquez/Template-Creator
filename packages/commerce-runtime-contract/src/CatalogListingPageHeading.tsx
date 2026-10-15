import type { ProductFilterViewModel } from "./catalog";
import { catalogListingPageHeadingClassName } from "./catalogFilterPanelPresentation";

export function resolveCatalogListingHeadingLabel(
  filters: ProductFilterViewModel,
): string | null {
  const collectionId =
    filters.activeCollectionId ??
    (filters.activeCollectionIds?.length === 1 ? filters.activeCollectionIds[0] : null);
  if (!collectionId) return null;
  const match = filters.collections.find((c) => c.id === collectionId);
  return match?.label ?? null;
}

type CatalogListingPageHeadingProps = Readonly<{
  filters: ProductFilterViewModel;
  collectionPrefix: string;
}>;

/** Título contextual de PLP (p. ej. colección activa). Sin chrome de marketing del shop. */
export function CatalogListingPageHeading({
  filters,
  collectionPrefix,
}: CatalogListingPageHeadingProps) {
  const name = resolveCatalogListingHeadingLabel(filters);
  if (!name) return null;
  return (
    <h1 className={catalogListingPageHeadingClassName} data-commerce-plp-context-heading>
      {collectionPrefix} {name}
    </h1>
  );
}
