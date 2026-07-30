/** Stock / availability labels for storefront UI. */
export type StockLabel = "available" | "out_of_stock" | "contact";

export type SalesMode = "stock" | "madeToOrder";

export interface TaxonomyOptionViewModel {
  id: string;
  slug: string;
  label: string;
  count?: number;
}

export interface CatalogSortOptionViewModel {
  id: string;
  label: string;
}

export interface CatalogQueryViewModel {
  searchQuery?: string;
  categoryId?: string | null;
  collectionId?: string | null;
  brandId?: string | null;
  sort?: string;
  cursor?: string | null;
}

export interface CatalogFilterPatch {
  searchQuery?: string | null;
  categoryId?: string | null;
  collectionId?: string | null;
  brandId?: string | null;
  sort?: string | null;
  salesMode?: SalesMode;
}

export interface ProductFilterViewModel {
  searchQuery?: string;
  activeCategoryId?: string | null;
  activeCollectionId?: string | null;
  activeBrandId?: string | null;
  activeSort?: string;
  salesMode: SalesMode;
  categories: TaxonomyOptionViewModel[];
  collections: TaxonomyOptionViewModel[];
  brands: TaxonomyOptionViewModel[];
}

export interface ProductCardViewModel {
  id: string;
  slug: string;
  href: string;
  name: string;
  imageUrl: string | null;
  galleryPreview?: string | null;
  displayPrice: string;
  compareAtPrice?: string | null;
  discountPercent?: number | null;
  currency: string;
  hasPriceRange?: boolean;
  defaultVariantId?: string | null;
  stockLabel?: StockLabel | null;
  shortDescription?: string | null;
  bulletPoints?: string[];
  categoryLabels?: string[];
  badges?: string[];
}

export interface ProductSearchViewModel {
  products: ProductCardViewModel[];
  nextCursor: string | null;
  query: CatalogQueryViewModel;
  sortOptions: CatalogSortOptionViewModel[];
}
