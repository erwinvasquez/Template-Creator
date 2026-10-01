"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ProductDetailViewModel, ProductGalleryItemViewModel } from "./product";
import {
  preferredGalleryIndexForVariant,
  resolveMainGalleryItem,
  resolveVariantIdForGallerySelection,
} from "./productDetailGalleryVariantSync";
import type { VariantOptionLike } from "./variantOptionPicker";

export type ProductDetailGalleryVariantSyncParams = {
  product: ProductDetailViewModel;
  onSelectVariant: (variantId: string) => void;
  pickerVariants: readonly VariantOptionLike[];
  dimensions: readonly string[];
  maxAddQtyMap: Readonly<Record<string, number>>;
};

export type ProductDetailGalleryVariantSyncResult = {
  activeGalleryIndex: number;
  mainImage: ProductGalleryItemViewModel | null;
  onGalleryItemClick: (index: number) => void;
  selectedVariant:
    | ProductDetailViewModel["variants"][number]
    | undefined;
};

/**
 * Fuente única: `product.selectedVariantId` (host) + índice de galería local.
 * Opciones → variante → imagen; imagen → variante → opciones.
 */
export function useProductDetailGalleryVariantSync(
  params: ProductDetailGalleryVariantSyncParams,
): ProductDetailGalleryVariantSyncResult {
  const { product, onSelectVariant, pickerVariants, dimensions, maxAddQtyMap } =
    params;

  const selectedVariant =
    product.variants.find((v) => v.id === product.selectedVariantId) ??
    product.variants[0];

  const selectedVariantId = selectedVariant?.id;

  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);

  useEffect(() => {
    setActiveGalleryIndex(
      preferredGalleryIndexForVariant(product, selectedVariantId),
    );
  }, [product.id, selectedVariantId]);

  const mainImage = useMemo(
    () =>
      resolveMainGalleryItem(product, activeGalleryIndex, selectedVariant),
    [product, activeGalleryIndex, selectedVariant],
  );

  const onGalleryItemClick = useCallback(
    (index: number) => {
      const item = product.gallery[index];
      if (!item) return;
      setActiveGalleryIndex(index);
      const nextVariantId = resolveVariantIdForGallerySelection(
        item,
        product,
        pickerVariants,
        dimensions,
        maxAddQtyMap,
        selectedVariantId,
      );
      if (nextVariantId && nextVariantId !== selectedVariantId) {
        onSelectVariant(nextVariantId);
      }
    },
    [
      product,
      pickerVariants,
      dimensions,
      maxAddQtyMap,
      selectedVariantId,
      onSelectVariant,
    ],
  );

  return {
    activeGalleryIndex,
    mainImage,
    onGalleryItemClick,
    selectedVariant,
  };
}
