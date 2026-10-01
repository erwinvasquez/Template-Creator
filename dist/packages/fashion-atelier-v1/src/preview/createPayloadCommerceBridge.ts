"use client";

import type {
  CartViewModel,
  CatalogFilterPatch,
  CatalogQueryViewModel,
  CheckoutViewModel,
  CommerceActionResult,
  CommerceRuntimeActions,
  CommerceRuntimeBridge,
  PlaceOrderInput,
  PlaceOrderResult,
  ProductCardViewModel,
  ProductDetailViewModel,
  ProductFilterViewModel,
  ProductSearchViewModel,
} from "@shopenlinea/commerce-runtime-contract";
import { DEFAULT_PREVIEW_CAPABILITIES } from "@shopenlinea/commerce-runtime-contract";
import type { ContentPayload } from "../content/types";
import { resolveProducts, SHOP_PATH } from "../content/resolve";
import type { AtelierCommerceHost } from "../lib/commerce-host";
import { DEFAULT_BASE_PATH } from "../meta";

const LAB_CART_PATH = `${DEFAULT_BASE_PATH}/carrito`;
const LAB_CHECKOUT_PATH = `${DEFAULT_BASE_PATH}/checkout`;

export type PayloadCommerceBridgeOptions = {
  dualSalesMode?: boolean;
  salesMode?: "stock" | "madeToOrder";
  madeToOrderAcceptingOrders?: boolean;
  preparationPromiseLabel?: string;
};

function formatEur(n: number): string {
  return `${n.toFixed(2).replace(".", ",")} €`;
}

/**
 * Preview host backed by Content Payload catalog (clean-host / no Mock Bridge).
 * Implements CommerceRuntimeBridge — not a local CartProvider.
 */
export function createPayloadCommerceBridge(
  payload: ContentPayload,
  options: PayloadCommerceBridgeOptions = {},
): AtelierCommerceHost & CommerceRuntimeBridge {
  const dualSalesMode = options.dualSalesMode ?? false;
  const initialSalesMode = options.salesMode ?? "stock";
  const mtoAccepting = options.madeToOrderAcceptingOrders ?? true;
  const mtoPrepLabel = options.preparationPromiseLabel ?? null;
  const capabilities = {
    ...DEFAULT_PREVIEW_CAPABILITIES,
    salesModeSwitch: dualSalesMode ? ("supported" as const) : ("unsupported" as const),
  };

  const listeners = new Set<() => void>();
  let storeVersion = 0;
  const notify = () => {
    storeVersion += 1;
    listeners.forEach((l) => l());
  };

  let cartDrawerOpen = false;
  let selectedVariantId: string | null = null;
  let filterState: CatalogFilterPatch = {
    searchQuery: null,
    categoryId: null,
    sort: "featured",
    salesMode: initialSalesMode,
  };

  const products = resolveProducts(payload);

  function currentSalesMode() {
    return filterState.salesMode ?? initialSalesMode;
  }

  function cartSalesMeta(): Pick<
    CartViewModel,
    "salesMode" | "madeToOrderAcceptingOrders"
  > {
    const mode = currentSalesMode();
    return {
      salesMode: mode,
      madeToOrderAcceptingOrders:
        dualSalesMode && mode === "madeToOrder" ? mtoAccepting : undefined,
    };
  }

  function emptyCart(): CartViewModel {
    return {
      cartId: "payload-cart",
      ...cartSalesMeta(),
      currency: "EUR",
      itemsCount: 0,
      subtotal: 0,
      subtotalDisplay: "0,00 €",
      requiresShipping: true,
      lines: [],
      cartHref: LAB_CART_PATH,
      checkoutHref: LAB_CHECKOUT_PATH,
      promotionLabels: [],
    };
  }

  let cart = emptyCart();

  function cardAvailabilityFields(
    p: (typeof products)[0],
  ): Pick<ProductCardViewModel, "stockLabel" | "madeToOrderUpsell"> {
    const mode = currentSalesMode();
    const isDemoStockZero =
      dualSalesMode && mode === "stock" && p.slug === products[0]?.slug;
    if (!isDemoStockZero) {
      return { stockLabel: "available" };
    }
    return {
      stockLabel: "out_of_stock",
      madeToOrderUpsell: {
        productHref: `${SHOP_PATH}/${p.slug}?salesMode=madeToOrder`,
        preparationPromiseLabel: mtoPrepLabel ?? "3–5 días",
      },
    };
  }

  function toCard(p: (typeof products)[0]): ProductCardViewModel {
    return {
      id: p.id,
      slug: p.slug,
      href: `/tienda/${p.slug}`,
      name: p.name,
      imageUrl: p.imageUrl,
      galleryPreview: p.hoverImageUrl ?? null,
      displayPrice: formatEur(p.price),
      currency: payload.brand.currency,
      defaultVariantId: `${p.id}-default`,
      ...cardAvailabilityFields(p),
      badges: [
        ...(p.isNew ? ["new"] : []),
        ...(p.isFeatured ? ["featured"] : []),
      ],
      categoryLabels: [p.categoryLabel],
    };
  }

  function recomputeCart(
    lines: CartViewModel["lines"],
  ): CartViewModel {
    const sum = lines.reduce((s, l) => {
      const prod = products.find((x) => x.id === l.productId);
      return s + (prod?.price ?? 0) * l.quantity;
    }, 0);
    return {
      ...cart,
      ...cartSalesMeta(),
      lines,
      itemsCount: lines.reduce((s, l) => s + l.quantity, 0),
      subtotal: sum,
      subtotalDisplay: formatEur(sum),
    };
  }

  function buildListing(query: CatalogQueryViewModel): ProductSearchViewModel {
    let list = products.map(toCard);
    const q = (query.searchQuery ?? filterState.searchQuery ?? "")
      .toString()
      .trim()
      .toLowerCase();
    if (q) list = list.filter((p) => p.name.toLowerCase().includes(q));
    const pageSize = 8;
    const cursor = query.cursor ?? null;
    let start = 0;
    if (cursor) {
      const idx = list.findIndex((p) => p.id === cursor);
      start = idx >= 0 ? idx + 1 : 0;
    }
    const slice = list.slice(start, start + pageSize);
    const last = slice[slice.length - 1];
    return {
      products: slice,
      nextCursor:
        start + pageSize < list.length && last ? last.id : null,
      query: {
        searchQuery: q || undefined,
        sort: query.sort ?? filterState.sort ?? "featured",
        cursor,
      },
      sortOptions: [{ id: "featured", label: "Destacados" }],
    };
  }

  function buildFilters(): ProductFilterViewModel {
    const mode = currentSalesMode();
    return {
      searchQuery: filterState.searchQuery ?? undefined,
      activeCategoryId: filterState.categoryId ?? null,
      activeCollectionId: null,
      activeBrandId: null,
      activeSort: filterState.sort ?? "featured",
      salesMode: mode,
      ...(dualSalesMode && mode === "madeToOrder"
        ? {
            madeToOrderAcceptingOrders: mtoAccepting,
            preparationPromiseLabel: mtoPrepLabel,
          }
        : {}),
      categories: payload.catalog.categories.map((c) => ({
        id: c.id,
        slug: c.slug,
        label: c.label,
      })),
      collections: payload.catalog.collections.map((c) => ({
        id: c.id,
        slug: c.slug,
        label: c.name,
      })),
      brands: [],
    };
  }

  function buildDetail(slug: string): ProductDetailViewModel | null {
    const p = products.find((x) => x.slug === slug);
    if (!p) return null;
    const variantId = selectedVariantId ?? `${p.id}-default`;
    const mode = currentSalesMode();
    const detail: ProductDetailViewModel = {
      id: p.id,
      slug: p.slug,
      href: `/tienda/${p.slug}`,
      name: p.name,
      description: p.description,
      gallery: [{ id: "g1", url: p.imageUrl, alt: p.imageAlt }],
      variants: [
        {
          id: `${p.id}-default`,
          label: `${p.sizes[0] ?? "M"} / ${p.colors[0] ?? "Único"}`,
          options: [
            { name: "Talla", value: p.sizes[0] ?? "M" },
            { name: "Color", value: p.colors[0] ?? "Único" },
          ],
          displayPrice: formatEur(p.price),
          stockLabel: "available",
          maxQuantity: 5,
          available: true,
          imageUrl: p.imageUrl,
        },
      ],
      currency: payload.brand.currency,
      selectedVariantId: variantId,
      stockLabel: "available",
      maxQuantity: 5,
      canAddToCart: true,
      badges: [
        ...(p.isNew ? ["new"] : []),
        ...(p.isFeatured ? ["featured"] : []),
      ],
      categoryLabels: [p.categoryLabel],
      relatedProducts: products
        .filter((x) => x.categorySlug === p.categorySlug && x.id !== p.id)
        .slice(0, 3)
        .map(toCard),
    };
    if (dualSalesMode && mode === "madeToOrder") {
      if (mtoPrepLabel) detail.preparationPromiseLabel = mtoPrepLabel;
      if (!mtoAccepting) detail.madeToOrderClosed = true;
    }
    if (dualSalesMode && mode === "stock") {
      const demoStockZeroSlug = products[0]?.slug;
      const isDemoStockZero = p.slug === demoStockZeroSlug;
      for (const v of detail.variants) {
        v.immediateAvailableQty = isDemoStockZero ? 0 : 2;
        v.maxQuantity = isDemoStockZero ? 0 : 2;
      }
      detail.maxQuantity = isDemoStockZero ? 0 : 2;
      detail.madeToOrderUpsell = {
        productHref: `${SHOP_PATH}/${p.slug}?salesMode=madeToOrder`,
        preparationPromiseLabel: mtoPrepLabel ?? "3–5 días",
      };
    }
    return detail;
  }

  function buildCheckout(): CheckoutViewModel {
    return {
      requiresShipping: true,
      shippingSelectionPending: false,
      lines: cart.lines.map((l) => ({
        lineId: l.lineId,
        productName: l.productName,
        variantLabel: l.variantLabel,
        quantity: l.quantity,
        lineDisplayPrice: l.lineDisplayPrice,
        imageUrl: l.imageUrl,
      })),
      totals: {
        subtotalDisplay: cart.subtotalDisplay,
        shippingDisplay: "A calcular",
        totalDisplay: cart.subtotalDisplay,
        currency: cart.currency,
      },
      shippingMethods: [
        {
          id: "pickup",
          kind: "pickup",
          label: "Recogida",
          priceDisplay: "Gratis",
        },
      ],
      paymentMethods: [
        { id: "transfer", kind: "transfer", label: "Transferencia" },
      ],
      pickupBranches: [],
      appliedPromotions: [],
      ...cartSalesMeta(),
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
    selectVariant(id) {
      selectedVariantId = id;
      notify();
    },
    async addToCart(variantId, quantity = 1): Promise<CommerceActionResult> {
      const p =
        products.find((x) => `${x.id}-default` === variantId) ??
        products.find((x) => variantId.startsWith(x.id)) ??
        products[0];
      if (!p) return { ok: false, errorCode: "UNKNOWN" };
      const unit = p.price;
      const existing = cart.lines.find((l) => l.variantId === variantId);
      const lines = existing
        ? cart.lines.map((l) =>
            l.variantId === variantId
              ? {
                  ...l,
                  quantity: l.quantity + quantity,
                  lineDisplayPrice: formatEur(
                    unit * (l.quantity + quantity),
                  ),
                }
              : l,
          )
        : [
            ...cart.lines,
            {
              lineId: `line-${variantId}`,
              variantId,
              productId: p.id,
              productName: p.name,
              variantLabel: `${p.sizes[0] ?? "M"} / ${p.colors[0] ?? "Único"}`,
              href: `/tienda/${p.slug}`,
              imageUrl: p.imageUrl,
              quantity,
              maxQuantity: 5,
              unitDisplayPrice: formatEur(unit),
              lineDisplayPrice: formatEur(unit * quantity),
            },
          ];
      cart = recomputeCart(lines);
      cartDrawerOpen = true;
      notify();
      return { ok: true };
    },
    async updateCartQuantity(variantId, quantity) {
      if (quantity <= 0) return actions.removeCartLine(variantId);
      const lines = cart.lines.map((l) => {
        if (l.variantId !== variantId) return l;
        const prod = products.find((x) => x.id === l.productId);
        const unit = prod?.price ?? 0;
        return {
          ...l,
          quantity,
          lineDisplayPrice: formatEur(unit * quantity),
        };
      });
      cart = recomputeCart(lines);
      notify();
      return { ok: true };
    },
    async removeCartLine(variantId) {
      cart = recomputeCart(cart.lines.filter((l) => l.variantId !== variantId));
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
    confirmAddToCartSuccess() {
      cartDrawerOpen = true;
      notify();
    },
    navigateToCheckout() {
      if (typeof window !== "undefined") {
        window.location.href = LAB_CHECKOUT_PATH;
      }
    },
    async previewCheckout() {
      return { ok: true, checkout: buildCheckout() };
    },
    async placeOrder(
      _input: PlaceOrderInput,
      _key: string,
    ): Promise<PlaceOrderResult> {
      return { ok: true, orderId: "preview-order" };
    },
    async uploadPaymentVoucher(): Promise<CommerceActionResult> {
      return { ok: true };
    },
  };

  return {
    capabilities,
    async getProductListing(query) {
      return { data: buildListing(query), filters: buildFilters() };
    },
    async getProductDetail(slug) {
      return buildDetail(slug);
    },
    async getCart() {
      return cart;
    },
    async getCheckout() {
      return buildCheckout();
    },
    getListing: async () => ({
      data: buildListing({}),
      filters: buildFilters(),
    }),
    getDetail: async (slug) => buildDetail(slug),
    actions,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    isCartOpen: () => cartDrawerOpen,
    closeCart: () => {
      cartDrawerOpen = false;
      notify();
    },
    getCartSnapshot: () => cart,
    getStoreVersion: () => storeVersion,
  };
}
