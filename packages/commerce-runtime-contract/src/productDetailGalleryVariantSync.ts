import type {
  ProductDetailViewModel,
  ProductGalleryItemViewModel,
  ProductVariantViewModel,
} from "./product";
import {
  selectionsFromVariant,
  type VariantOptionLike,
} from "./variantOptionPicker";

export type GalleryVariantAssociationInput = Pick<
  ProductGalleryItemViewModel,
  "id" | "url" | "variantId" | "variantIds"
>;

function getVariantOptionValue(
  variant: VariantOptionLike,
  dimension: string,
): string | undefined {
  return variant.optionValues.find((ov) => ov.option === dimension)?.value;
}

/** Asociaciones explícitas: payload `variantId(s)` + `variant.imageUrl` igual a la URL del ítem. */
export function explicitVariantIdsForGalleryItem(
  item: GalleryVariantAssociationInput,
  variants: readonly Pick<ProductVariantViewModel, "id" | "imageUrl">[],
): readonly string[] {
  if (item.variantIds?.length) {
    return [...new Set(item.variantIds.filter(Boolean))];
  }
  if (item.variantId) return [item.variantId];
  const fromVariantImage = variants
    .filter((v) => v.imageUrl && v.imageUrl === item.url)
    .map((v) => v.id);
  return fromVariantImage;
}

export function galleryItemHasVariantAssociation(
  item: GalleryVariantAssociationInput,
  variants: readonly Pick<ProductVariantViewModel, "id" | "imageUrl">[],
): boolean {
  return explicitVariantIdsForGalleryItem(item, variants).length > 0;
}

function stabilityScore(
  variant: VariantOptionLike,
  dimensions: readonly string[],
  selections: Readonly<Record<string, string>>,
): number {
  let score = 0;
  for (const dim of dimensions) {
    const selected = selections[dim];
    if (selected && getVariantOptionValue(variant, dim) === selected) {
      score += 1;
    }
  }
  return score;
}

function rankGalleryVariantCandidates(
  candidates: readonly VariantOptionLike[],
  dimensions: readonly string[],
  selections: Readonly<Record<string, string>>,
  maxAddQtyByVariantId: Readonly<Record<string, number>>,
  preferredVariantId?: string,
): VariantOptionLike[] {
  return [...candidates].sort((a, b) => {
    const aPurchasable = (maxAddQtyByVariantId[a.id] ?? 0) > 0 ? 1 : 0;
    const bPurchasable = (maxAddQtyByVariantId[b.id] ?? 0) > 0 ? 1 : 0;
    if (bPurchasable !== aPurchasable) return bPurchasable - aPurchasable;

    const aStability = stabilityScore(a, dimensions, selections);
    const bStability = stabilityScore(b, dimensions, selections);
    if (bStability !== aStability) return bStability - aStability;

    if (preferredVariantId) {
      if (a.id === preferredVariantId) return -1;
      if (b.id === preferredVariantId) return 1;
    }

    return a.id.localeCompare(b.id);
  });
}

/**
 * Resuelve la variante al pulsar un ítem de galería.
 * `null` = imagen general (solo cambia la imagen activa).
 */
export function resolveVariantIdForGallerySelection(
  item: GalleryVariantAssociationInput,
  product: Pick<ProductDetailViewModel, "variants">,
  pickerVariants: readonly VariantOptionLike[],
  dimensions: readonly string[],
  maxAddQtyByVariantId: Readonly<Record<string, number>>,
  currentSelectedVariantId: string | undefined,
): string | null {
  const assocIds = explicitVariantIdsForGalleryItem(item, product.variants);
  if (assocIds.length === 0) return null;

  const assocSet = new Set(assocIds);
  const candidates = pickerVariants.filter((v) => assocSet.has(v.id));
  if (candidates.length === 0) return assocIds[0] ?? null;
  if (candidates.length === 1) return candidates[0]!.id;

  const currentSelections = selectionsFromVariant(
    pickerVariants.find((v) => v.id === currentSelectedVariantId),
  );
  const ranked = rankGalleryVariantCandidates(
    candidates,
    dimensions,
    currentSelections,
    maxAddQtyByVariantId,
    currentSelectedVariantId,
  );
  return ranked[0]?.id ?? null;
}

export function preferredGalleryIndexForVariant(
  product: Pick<ProductDetailViewModel, "gallery" | "variants">,
  variantId: string | undefined,
): number {
  if (!variantId || product.gallery.length === 0) return 0;

  const variant = product.variants.find((v) => v.id === variantId);
  if (variant?.imageUrl) {
    const byUrl = product.gallery.findIndex((g) => g.url === variant.imageUrl);
    if (byUrl >= 0) return byUrl;
  }

  for (let i = 0; i < product.gallery.length; i++) {
    const ids = explicitVariantIdsForGalleryItem(
      product.gallery[i]!,
      product.variants,
    );
    if (ids.includes(variantId)) return i;
  }

  return 0;
}

export function resolveMainGalleryItem(
  product: Pick<ProductDetailViewModel, "gallery" | "name" | "variants">,
  activeGalleryIndex: number,
  selectedVariant: ProductVariantViewModel | undefined,
): ProductGalleryItemViewModel | null {
  const fromIndex =
    product.gallery[activeGalleryIndex] ?? product.gallery[0] ?? null;
  if (fromIndex) return fromIndex;

  if (selectedVariant?.imageUrl) {
    return {
      id: "variant-fallback",
      url: selectedVariant.imageUrl,
      alt: product.name,
    };
  }

  return null;
}
