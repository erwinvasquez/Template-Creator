import type {
  CartLineViewModel,
  CartViewModel,
  CatalogFilterPatch,
  CatalogQueryViewModel,
  CheckoutPreviewInput,
  CheckoutPreviewResult,
  CheckoutViewModel,
  CommerceActionResult,
  CommerceRuntimeActions,
  CommerceRuntimeBridge,
  PlaceOrderInput,
  PlaceOrderResult,
  ProductDetailViewModel,
  ProductFilterViewModel,
  ProductSearchViewModel,
  ProductVariantViewModel,
} from "@shopenlinea/commerce-runtime-contract";
import {
  CATALOG_PRODUCTS,
  MOCK_BRANDS,
  MOCK_CATEGORIES,
  MOCK_COLLECTIONS,
  detailFromCard,
} from "../fixtures/seed";
import type { CommerceFixtureId } from "../fixtures/ids";

const SORT_OPTIONS = [
  { id: "featured", label: "Destacados" },
  { id: "price-asc", label: "Precio ↑" },
  { id: "price-desc", label: "Precio ↓" },
];

type Listener = () => void;

export type MockCommerceBridge = CommerceRuntimeBridge & {
  subscribe: (listener: Listener) => () => void;
  getCartSnapshot: () => CartViewModel;
  getSelectedProductSlug: () => string | null;
  setSelectedProductSlug: (slug: string | null) => void;
  isCartDrawerOpen: () => boolean;
  closeCartDrawer: () => void;
  getStoreVersion: () => number;
  fixtureId: CommerceFixtureId;
};

/**
 * Lab options. Fixtures are authored with Atelier's `/tienda` shop path; a
 * template mounted on another path (Orion uses `/coleccion`) passes `shopPath`
 * so every product href the bridge emits stays inside that template's routes.
 */
export type MockCommerceBridgeOptions = {
  /** Mount-relative shop root. Default `/tienda`. */
  shopPath?: string;
  /** Absolute checkout URL used by `navigateToCheckout`. */
  checkoutHref?: string;
};

const FIXTURE_SHOP_PATH = "/tienda";

function emptyCart(): CartViewModel {
  return {
    cartId: "mock-cart",
    salesMode: "stock",
    currency: "EUR",
    itemsCount: 0,
    subtotal: 0,
    subtotalDisplay: "0,00 €",
    requiresShipping: true,
    lines: [],
    cartHref: "/carrito",
    checkoutHref: "/checkout",
    promotionLabels: [],
  };
}

function formatEur(n: number): string {
  return `${n.toFixed(2).replace(".", ",")} €`;
}

function parsePrice(display: string): number {
  const n = Number(display.replace(/[^\d,]/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

export function createMockCommerceBridge(
  fixtureId: CommerceFixtureId = "catalog-default",
  options: MockCommerceBridgeOptions = {},
): MockCommerceBridge {
  const shopPath = (options.shopPath ?? FIXTURE_SHOP_PATH).replace(/\/$/, "");
  const checkoutHref = options.checkoutHref ?? "/t/atelier/checkout";

  const rewriteHref = (href: string): string =>
    shopPath === FIXTURE_SHOP_PATH || !href.startsWith(FIXTURE_SHOP_PATH)
      ? href
      : `${shopPath}${href.slice(FIXTURE_SHOP_PATH.length)}`;

  const rewriteCard = <T extends { href: string }>(card: T): T =>
    shopPath === FIXTURE_SHOP_PATH
      ? card
      : { ...card, href: rewriteHref(card.href) };

  const listeners = new Set<Listener>();
  let storeVersion = 0;
  const notify = () => {
    storeVersion += 1;
    listeners.forEach((l) => l());
  };

  let filterState: CatalogFilterPatch = {
    searchQuery: fixtureId === "catalog-search-empty" ? "zzzz-no-match" : null,
    categoryId: null,
    collectionId: null,
    brandId: null,
    sort: "featured",
    salesMode: "stock",
  };

  let selectedProductSlug: string | null =
    fixtureId === "product-out-of-stock"
      ? "producto-agotado"
      : fixtureId === "product-variants"
        ? "abrigo-cashmere-stone"
        : fixtureId === "product-simple"
          ? "camisa-oxford-marfil"
          : null;

  let selectedVariantId: string | null = null;
  let cartDrawerOpen = false;
  let cart = emptyCart();

  if (fixtureId === "cart-promotion") {
    const p = CATALOG_PRODUCTS[0];
    const unit = parsePrice(p.displayPrice);
    cart = {
      ...emptyCart(),
      itemsCount: 1,
      subtotal: unit * 0.9,
      subtotalDisplay: formatEur(unit * 0.9),
      promotionLabels: ["−10% bienvenida"],
      appliedPromotions: [{ label: "−10% bienvenida" }],
      lines: [
        {
          lineId: "line-1",
          variantId: p.defaultVariantId ?? `${p.id}-default`,
          productId: p.id,
          productName: p.name,
          variantLabel: "M / Stone",
          href: rewriteHref(p.href),
          imageUrl: p.imageUrl,
          quantity: 1,
          maxQuantity: 5,
          unitDisplayPrice: formatEur(unit * 0.9),
          unitCompareAtPrice: p.displayPrice,
          lineDisplayPrice: formatEur(unit * 0.9),
          pricingAdjustments: [{ label: "−10% bienvenida" }],
          options: [
            { name: "Talla", value: "M" },
            { name: "Color", value: "Stone" },
          ],
        },
      ],
    };
  }

  if (fixtureId === "cart-empty" || fixtureId.startsWith("checkout-")) {
    cart = emptyCart();
  }

  function catalogSource(): typeof CATALOG_PRODUCTS {
    if (fixtureId === "catalog-empty") return [];
    return CATALOG_PRODUCTS;
  }

  function buildFilters(): ProductFilterViewModel {
    return {
      searchQuery: filterState.searchQuery ?? undefined,
      activeCategoryId: filterState.categoryId ?? null,
      activeCollectionId: filterState.collectionId ?? null,
      activeBrandId: filterState.brandId ?? null,
      activeSort: filterState.sort ?? "featured",
      salesMode: filterState.salesMode ?? "stock",
      categories: MOCK_CATEGORIES,
      collections: MOCK_COLLECTIONS,
      brands: MOCK_BRANDS,
    };
  }

  function buildListing(query: CatalogQueryViewModel): ProductSearchViewModel {
    let products = [...catalogSource()];
    const q = (query.searchQuery ?? filterState.searchQuery ?? "").trim().toLowerCase();
    if (q) {
      products = products.filter((p) => p.name.toLowerCase().includes(q));
    }
    const categoryId = query.categoryId ?? filterState.categoryId;
    if (categoryId) {
      const cat = MOCK_CATEGORIES.find((c) => c.id === categoryId);
      if (cat) {
        products = products.filter((p) =>
          (p.categoryLabels ?? []).some(
            (label) => label.toLowerCase() === cat.label.toLowerCase(),
          ),
        );
      }
    }
    if (fixtureId === "catalog-search-empty") {
      products = [];
    }

    const pageSize = 4;
    const cursor = query.cursor ?? null;
    let start = 0;
    if (cursor) {
      const idx = products.findIndex((p) => p.id === cursor);
      start = idx >= 0 ? idx + 1 : 0;
    }
    const slice = products.slice(start, start + pageSize);
    const last = slice[slice.length - 1];
    const nextCursor =
      start + pageSize < products.length && last ? last.id : null;

    return {
      products: slice.map(rewriteCard),
      nextCursor,
      query: {
        searchQuery: q || undefined,
        categoryId: query.categoryId ?? filterState.categoryId,
        collectionId: query.collectionId ?? filterState.collectionId,
        brandId: query.brandId ?? filterState.brandId,
        sort: query.sort ?? filterState.sort ?? "featured",
        cursor,
      },
      sortOptions: SORT_OPTIONS,
    };
  }

  function buildDetail(slug: string): ProductDetailViewModel | null {
    const detail = buildDetailForFixture(slug);
    if (!detail || shopPath === FIXTURE_SHOP_PATH) return detail;
    return {
      ...detail,
      href: rewriteHref(detail.href),
      relatedProducts: detail.relatedProducts?.map(rewriteCard),
    };
  }

  function buildDetailForFixture(slug: string): ProductDetailViewModel | null {
    if (fixtureId === "product-out-of-stock" && slug === "producto-agotado") {
      return detailFromCard(
        {
          ...CATALOG_PRODUCTS[0],
          id: "oos",
          slug: "producto-agotado",
          name: "Abrigo Agotado",
          href: "/tienda/producto-agotado",
          stockLabel: "out_of_stock",
          defaultVariantId: "oos-v1",
        },
        {
          canAddToCart: false,
          stockLabel: "out_of_stock",
          variants: [
            {
              id: "oos-v1",
              label: "M / Negro",
              options: [
                { name: "Talla", value: "M" },
                { name: "Color", value: "Negro" },
              ],
              displayPrice: "420,00 €",
              stockLabel: "out_of_stock",
              maxQuantity: 0,
              available: false,
            },
          ],
          selectedVariantId: "oos-v1",
        },
      );
    }

    if (fixtureId === "product-variants" || slug === "abrigo-cashmere-stone") {
      const base = CATALOG_PRODUCTS[0];
      const variants: ProductVariantViewModel[] = [
        {
          id: "v-s-stone",
          label: "S / Stone",
          options: [
            { name: "Talla", value: "S" },
            { name: "Color", value: "Stone" },
          ],
          displayPrice: "420,00 €",
          compareAtPrice: "480,00 €",
          stockLabel: "available",
          maxQuantity: 3,
          available: true,
          imageUrl: base.imageUrl,
        },
        {
          id: "v-m-stone",
          label: "M / Stone",
          options: [
            { name: "Talla", value: "M" },
            { name: "Color", value: "Stone" },
          ],
          displayPrice: "420,00 €",
          compareAtPrice: "480,00 €",
          stockLabel: "available",
          maxQuantity: 5,
          available: true,
          imageUrl: base.imageUrl,
        },
        {
          id: "v-m-noir",
          label: "M / Negro",
          options: [
            { name: "Talla", value: "M" },
            { name: "Color", value: "Negro" },
          ],
          displayPrice: "430,00 €",
          compareAtPrice: "490,00 €",
          stockLabel: "available",
          maxQuantity: 2,
          available: true,
          imageUrl: base.galleryPreview ?? base.imageUrl,
        },
      ];
      const selected = selectedVariantId ?? variants[0].id;
      return detailFromCard(base, {
        variants,
        selectedVariantId: selected,
        canAddToCart: true,
        optionDefinitions: [
          { name: "Talla", values: ["S", "M"] },
          { name: "Color", values: ["Stone", "Negro"] },
        ],
        specifications: [
          { key: "Composición", value: "100% cashmere" },
          { key: "Origen", value: "Italia" },
        ],
        highlights: ["Corte estructurado", "Forro de seda"],
      });
    }

    const found = CATALOG_PRODUCTS.find((p) => p.slug === slug);
    if (!found) return null;
    const d = detailFromCard(found);
    if (selectedVariantId) {
      return { ...d, selectedVariantId };
    }
    return d;
  }

  function buildCheckout(kind: "pickup" | "delivery"): CheckoutViewModel {
    const line = cart.lines[0];
    return {
      requiresShipping: kind === "delivery",
      shippingSelectionPending: kind === "delivery",
      lines: line
        ? [
            {
              lineId: line.lineId,
              productName: line.productName,
              variantLabel: line.variantLabel,
              quantity: line.quantity,
              lineDisplayPrice: line.lineDisplayPrice,
              imageUrl: line.imageUrl,
            },
          ]
        : [
            {
              lineId: "demo",
              productName: "Abrigo Cashmere Stone",
              variantLabel: "M / Stone",
              quantity: 1,
              lineDisplayPrice: "420,00 €",
              imageUrl: CATALOG_PRODUCTS[0].imageUrl,
            },
          ],
      totals: {
        subtotalDisplay: "420,00 €",
        shippingDisplay: kind === "pickup" ? "Gratis" : "8,00 €",
        discountDisplay: null,
        taxDisplay: null,
        totalDisplay: kind === "pickup" ? "420,00 €" : "428,00 €",
        currency: "EUR",
      },
      shippingMethods:
        kind === "pickup"
          ? [
              {
                id: "pickup",
                kind: "pickup",
                label: "Recogida en tienda",
                priceDisplay: "Gratis",
              },
              {
                id: "local",
                kind: "localMap",
                label: "Entrega local",
                priceDisplay: "8,00 €",
                estimatedDaysLabel: "1–2 días",
              },
              {
                id: "courier",
                kind: "nationalCourier",
                label: "Envío nacional",
                priceDisplay: "12,00 €",
                estimatedDaysLabel: "3–5 días",
              },
            ]
          : [
              {
                id: "local",
                kind: "localMap",
                label: "Entrega local",
                priceDisplay: "8,00 €",
                estimatedDaysLabel: "1–2 días",
              },
              {
                id: "courier",
                kind: "nationalCourier",
                label: "Envío nacional",
                priceDisplay: "12,00 €",
                estimatedDaysLabel: "3–5 días",
              },
              {
                id: "pickup",
                kind: "pickup",
                label: "Recogida en tienda",
                priceDisplay: "Gratis",
              },
            ],
      paymentMethods: [
        {
          id: "qr",
          kind: "qr",
          label: "QR (comprobante)",
          instructions: "Te mostramos el QR al confirmar el pedido.",
          requiresVoucher: true,
        },
        {
          id: "cod",
          kind: "cashOnDelivery",
          label: "Contra entrega",
          instructions: "Paga al recibir el pedido.",
        },
        {
          id: "transfer",
          kind: "transfer",
          label: "Transferencia",
          instructions: "Datos bancarios al confirmar",
          bankDetails: "ES12 3456 7890 1234 5678 9012 · Atelier SL",
        },
      ],
      pickupBranches: [
        {
          id: "b1",
          name: "Atelier Centro",
          addressLabel: "Calle Mayor 12, Madrid",
          scheduleLabel: "Lun–Sáb 11–20h",
        },
        {
          id: "b2",
          name: "Atelier Norte",
          addressLabel: "Av. de América 40, Madrid",
          scheduleLabel: "Lun–Vie 10–19h",
        },
      ],
      appliedPromotions: [],
      fulfillmentPromise: {
        label: "Retiro",
        detail: "Disponible para retiro: Inmediato",
      },
      salesMode: "stock",
    };
  }

  const actions: CommerceRuntimeActions = {
    setCatalogFilters(filters) {
      filterState = { ...filterState, ...filters };
      notify();
    },
    async loadMoreProducts(cursor) {
      return buildListing({
        searchQuery: filterState.searchQuery ?? undefined,
        categoryId: filterState.categoryId,
        collectionId: filterState.collectionId,
        brandId: filterState.brandId,
        sort: filterState.sort ?? undefined,
        cursor,
      });
    },
    selectVariant(variantId) {
      selectedVariantId = variantId;
      notify();
    },
    async addToCart(variantId, quantity = 1): Promise<CommerceActionResult> {
      if (fixtureId === "product-out-of-stock") {
        return {
          ok: false,
          errorCode: "STOCK_INSUFFICIENT",
          errorMessage: "Sin stock disponible",
        };
      }
      const detail =
        buildDetail(selectedProductSlug ?? CATALOG_PRODUCTS[0].slug) ??
        detailFromCard(CATALOG_PRODUCTS[0]);
      const variant =
        detail.variants.find((v) => v.id === variantId) ?? detail.variants[0];
      if (!variant?.available) {
        return {
          ok: false,
          errorCode: "VARIANT_UNAVAILABLE",
          errorMessage: "Variante no disponible",
        };
      }
      const unit = parsePrice(variant.displayPrice);
      const existing = cart.lines.find((l) => l.variantId === variant.id);
      let lines: CartLineViewModel[];
      if (existing) {
        lines = cart.lines.map((l) =>
          l.variantId === variant.id
            ? {
                ...l,
                quantity: l.quantity + quantity,
                lineDisplayPrice: formatEur(
                  unit * (l.quantity + quantity),
                ),
              }
            : l,
        );
      } else {
        lines = [
          ...cart.lines,
          {
            lineId: `line-${variant.id}`,
            variantId: variant.id,
            productId: detail.id,
            productName: detail.name,
            variantLabel: variant.label,
            href: detail.href,
            imageUrl: variant.imageUrl ?? detail.gallery[0]?.url ?? null,
            quantity,
            maxQuantity: variant.maxQuantity ?? 5,
            unitDisplayPrice: variant.displayPrice,
            lineDisplayPrice: formatEur(unit * quantity),
            options: variant.options,
          },
        ];
      }
      const subtotal = lines.reduce(
        (s, l) => s + parsePrice(l.unitDisplayPrice) * l.quantity,
        0,
      );
      cart = {
        ...cart,
        lines,
        itemsCount: lines.reduce((s, l) => s + l.quantity, 0),
        subtotal,
        subtotalDisplay: formatEur(subtotal),
      };
      cartDrawerOpen = true;
      notify();
      return { ok: true };
    },
    async updateCartQuantity(variantId, quantity) {
      if (quantity <= 0) {
        return actions.removeCartLine(variantId);
      }
      const lines = cart.lines.map((l) =>
        l.variantId === variantId
          ? {
              ...l,
              quantity,
              lineDisplayPrice: formatEur(
                parsePrice(l.unitDisplayPrice) * quantity,
              ),
            }
          : l,
      );
      const subtotal = lines.reduce(
        (s, l) => s + parsePrice(l.unitDisplayPrice) * l.quantity,
        0,
      );
      cart = {
        ...cart,
        lines,
        itemsCount: lines.reduce((s, l) => s + l.quantity, 0),
        subtotal,
        subtotalDisplay: formatEur(subtotal),
      };
      notify();
      return { ok: true };
    },
    async removeCartLine(variantId) {
      const lines = cart.lines.filter((l) => l.variantId !== variantId);
      const subtotal = lines.reduce(
        (s, l) => s + parsePrice(l.unitDisplayPrice) * l.quantity,
        0,
      );
      cart = {
        ...cart,
        lines,
        itemsCount: lines.reduce((s, l) => s + l.quantity, 0),
        subtotal,
        subtotalDisplay: formatEur(subtotal),
      };
      notify();
      return { ok: true };
    },
    async clearCart() {
      cart = emptyCart();
      notify();
      return { ok: true };
    },
    openCartDrawer() {
      cartDrawerOpen = true;
      notify();
    },
    confirmAddToCartSuccess(_variantId: string) {
      cartDrawerOpen = true;
      notify();
    },
    navigateToCheckout() {
      if (typeof window !== "undefined") {
        window.location.href = checkoutHref;
      }
    },
    async previewCheckout(
      _input: CheckoutPreviewInput,
    ): Promise<CheckoutPreviewResult> {
      const kind = fixtureId === "checkout-pickup" ? "pickup" : "delivery";
      return { ok: true, checkout: buildCheckout(kind) };
    },
    async placeOrder(
      _input: PlaceOrderInput,
      _idempotencyKey: string,
    ): Promise<PlaceOrderResult> {
      return {
        ok: true,
        orderId: "mock-order-1",
        confirmationHref: `${checkoutHref}?confirmed=1`,
      };
    },
    async uploadPaymentVoucher(): Promise<CommerceActionResult> {
      return { ok: true };
    },
  };

  return {
    fixtureId,
    async getProductListing(query) {
      return { data: buildListing(query), filters: buildFilters() };
    },
    async getProductDetail(productSlug) {
      return buildDetail(productSlug);
    },
    async getCart() {
      return cart;
    },
    getCartSnapshot: () => cart,
    async getCheckout() {
      const kind = fixtureId === "checkout-pickup" ? "pickup" : "delivery";
      return buildCheckout(kind);
    },
    actions,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSelectedProductSlug: () => selectedProductSlug,
    setSelectedProductSlug: (slug) => {
      selectedProductSlug = slug;
      notify();
    },
    isCartDrawerOpen: () => cartDrawerOpen,
    closeCartDrawer: () => {
      cartDrawerOpen = false;
      notify();
    },
    getStoreVersion: () => storeVersion,
  };
}
