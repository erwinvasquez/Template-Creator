export type ProductDetailPresentationField =
  | "shortDescription"
  | "description"
  | "categoryLabels"
  | "collectionLabels"
  | "highlights"
  | "brandLabel"
  | "specifications"
  | "badges"
  | "stockMessage"
  | "preparationPromise"
  | "relatedProducts";

export type ProductDetailPresentation = Partial<
  Record<ProductDetailPresentationField, boolean>
>;

/** `presentation` undefined → all fields visible (backward compatible). */
export function isPdpFieldVisible(
  presentation: ProductDetailPresentation | undefined,
  field: ProductDetailPresentationField,
): boolean {
  return presentation?.[field] !== false;
}
