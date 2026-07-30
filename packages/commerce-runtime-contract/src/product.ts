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
  madeToOrderClosed?: boolean;
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
