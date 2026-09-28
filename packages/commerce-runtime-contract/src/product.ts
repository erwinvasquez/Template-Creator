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
  /**
   * Stock mode only. Units available for immediate purchase on this variant.
   * When the shopper exceeds `maxQuantity` with upsell present, templates offer MTO navigation.
   */
  immediateAvailableQty?: number | null;
  available: boolean;
  imageUrl?: string | null;
}

/**
 * Host offers navigation to a made-to-order PDP when immediate stock is insufficient.
 * `productHref` should include `?salesMode=madeToOrder` when dual-mode applies.
 */
export interface MadeToOrderUpsellViewModel {
  productHref: string;
  /**
   * Optional MTO preparation value for the upsell target (host sends value only).
   * Falls back to `ProductDetailViewModel.preparationPromiseLabel` in templates when omitted.
   */
  preparationPromiseLabel?: string | null;
}

export interface ProductOptionDefinitionViewModel {
  name: string;
  values?: string[];
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
  /** Stock PDP: offer MTO product when immediate qty is exceeded. */
  madeToOrderUpsell?: MadeToOrderUpsellViewModel | null;
  highlights?: string[];
  bulletPoints?: string[];
  keyFeatures?: string[];
  specifications?: Array<{ key: string; value: string }>;
  badges?: string[];
  relatedProducts?: ProductCardViewModel[];
  brandLabel?: string | null;
  categoryLabels?: string[];
  collectionLabels?: string[];
  /**
   * Canonical picker dimension order (e.g. Material → Color).
   * Fallback in templates: first appearance in variants.
   */
  optionDefinitions?: ProductOptionDefinitionViewModel[];
}
