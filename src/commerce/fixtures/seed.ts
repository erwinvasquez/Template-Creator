import type {
  ProductCardViewModel,
  ProductDetailViewModel,
  TaxonomyOptionViewModel,
} from "@shopenlinea/commerce-runtime-contract";

const IMG =
  "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=1200&q=80";
const IMG2 =
  "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1200&q=80";
const IMG3 =
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=80";

export const MOCK_CATEGORIES: TaxonomyOptionViewModel[] = [
  { id: "cat_mujer", slug: "mujer", label: "Mujer" },
  { id: "cat_hombre", slug: "hombre", label: "Hombre" },
  { id: "cat_accesorios", slug: "accesorios", label: "Accesorios" },
];

export const MOCK_COLLECTIONS: TaxonomyOptionViewModel[] = [
  { id: "col_otono", slug: "otono-essentials", label: "Otoño Essentials" },
  { id: "col_linen", slug: "linen-edit", label: "Linen Edit" },
];

export const MOCK_BRANDS: TaxonomyOptionViewModel[] = [
  { id: "brand_atelier", slug: "atelier", label: "Atelier" },
];

export function card(
  partial: Partial<ProductCardViewModel> &
    Pick<ProductCardViewModel, "id" | "slug" | "name" | "displayPrice">,
): ProductCardViewModel {
  return {
    href: `/tienda/${partial.slug}`,
    imageUrl: IMG,
    galleryPreview: IMG2,
    currency: "EUR",
    compareAtPrice: null,
    discountPercent: null,
    hasPriceRange: false,
    defaultVariantId: `${partial.id}-default`,
    stockLabel: "available",
    badges: [],
    categoryLabels: ["Mujer"],
    bulletPoints: [],
    ...partial,
  };
}

export const CATALOG_PRODUCTS: ProductCardViewModel[] = [
  card({
    id: "1",
    slug: "abrigo-cashmere-stone",
    name: "Abrigo Cashmere Stone",
    displayPrice: "420,00 €",
    compareAtPrice: "480,00 €",
    discountPercent: 12,
    badges: ["new", "featured", "sale"],
  }),
  card({
    id: "2",
    slug: "blazer-lino-natural",
    name: "Blazer Lino Natural",
    displayPrice: "280,00 €",
    compareAtPrice: "320,00 €",
    discountPercent: 12,
    badges: ["featured"],
    categoryLabels: ["Mujer"],
  }),
  card({
    id: "3",
    slug: "pantalon-wide-leg-noir",
    name: "Pantalón Wide-Leg Noir",
    displayPrice: "190,00 €",
    categoryLabels: ["Mujer"],
  }),
  card({
    id: "4",
    slug: "camisa-oxford-marfil",
    name: "Camisa Oxford Marfil",
    displayPrice: "145,00 €",
    badges: ["new"],
    categoryLabels: ["Hombre"],
  }),
  card({
    id: "5",
    slug: "trench-tecnico-arena",
    name: "Trench Técnico Arena",
    displayPrice: "390,00 €",
    stockLabel: "out_of_stock",
    categoryLabels: ["Mujer"],
  }),
  card({
    id: "6",
    slug: "vestido-seda-noche",
    name: "Vestido Seda Noche",
    displayPrice: "350,00 €",
    badges: ["bestseller"],
    categoryLabels: ["Mujer"],
  }),
];

export function detailFromCard(
  c: ProductCardViewModel,
  overrides: Partial<ProductDetailViewModel> = {},
): ProductDetailViewModel {
  const variantId = c.defaultVariantId ?? `${c.id}-default`;
  const gallery = [
    { id: "g1", url: c.imageUrl ?? IMG, alt: c.name },
    ...(c.galleryPreview
      ? [{ id: "g2", url: c.galleryPreview, alt: c.name }]
      : []),
    { id: "g3", url: IMG3, alt: `${c.name} detalle` },
  ];
  return {
    id: c.id,
    slug: c.slug,
    href: c.href,
    name: c.name,
    description:
      "Pieza Atelier con corte preciso y materiales nobles. Diseñada para combinar sin esfuerzo.",
    shortDescription:
      c.shortDescription ?? "Silueta limpia. Material noble. Temporada actual.",
    gallery,
    variants: [
      {
        id: variantId,
        label: "Único / Único",
        options: [
          { name: "Talla", value: "M" },
          { name: "Color", value: "Stone" },
        ],
        displayPrice: c.displayPrice,
        compareAtPrice: c.compareAtPrice,
        stockLabel: c.stockLabel ?? "available",
        maxQuantity: c.stockLabel === "out_of_stock" ? 0 : 5,
        available: c.stockLabel !== "out_of_stock",
        imageUrl: c.imageUrl,
      },
    ],
    currency: c.currency,
    selectedVariantId: variantId,
    stockLabel: c.stockLabel ?? "available",
    maxQuantity: c.stockLabel === "out_of_stock" ? 0 : 5,
    cartQuantity: 0,
    canAddToCart: c.stockLabel !== "out_of_stock",
    badges: c.badges,
    categoryLabels: c.categoryLabels,
    brandLabel: "Atelier",
    collectionLabels: ["Otoño Essentials"],
    bulletPoints: ["Hecho en Europa", "Envío 2–4 días"],
    keyFeatures: ["Cashmere premium", "Forro de seda"],
    relatedProducts: CATALOG_PRODUCTS.filter((p) => p.id !== c.id).slice(0, 3),
    ...overrides,
  };
}
