import type { ProductCardViewModel, StockLabel } from "./catalog";

export interface ProductGalleryItemViewModel {
  id: string;
  url: string;
  alt?: string | null;
}

export interface ProductVariantOptionViewModel {
  name: string;
  value: string;
}

export interface ProductVariantViewModel {
  id: string;
  label: string;
  sku?: string | null;
  options: ProductVariantOptionViewModel[];
  displayPrice: string;
  compareAtPrice?: string | null;
  stockLabel?: StockLabel | null;
  maxQuantity?: number | null;
  available: boolean;
  imageUrl?: string | null;
}

export interface ProductDetailViewModel {
  id: string;
  slug: string;
  href: string;
  name: string;
  description?: string | null;
  shortDescription?: string | null;
  gallery: ProductGalleryItemViewModel[];
  variants: ProductVariantViewModel[];
  currency: string;
  selectedVariantId?: string | null;
  stockLabel?: StockLabel | null;
  maxQuantity?: number | null;
  cartQuantity?: number;
  canAddToCart: boolean;
  /** When true (made-to-order context), template blocks add-to-cart and shows closed copy. */
  madeToOrderClosed?: boolean;
  /**
   * Made-to-order only. Host sends **value only** (e.g. `"3–5 días"`).
   * Template prefixes with `ui.salesMode.madeToOrder.preparationLabel`.
   * Do NOT invent windows; omit when unknown.
   */
  preparationPromiseLabel?: string | null;
  /**
   * When channel is closed. Host sends **reopen value only** (e.g. `"10:00"`).
   * Template may prefix with `ui.salesMode.madeToOrder.reopensPrefix`.
   */
  madeToOrderReopensAtLabel?: string | null;
  highlights?: string[];
  bulletPoints?: string[];
  keyFeatures?: string[];
  specifications?: Array<{ key: string; value: string }>;
  badges?: string[];
  relatedProducts?: ProductCardViewModel[];
  brandLabel?: string | null;
  categoryLabels?: string[];
  collectionLabels?: string[];
}
