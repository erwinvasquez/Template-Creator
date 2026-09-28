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
import { formatPrice, resolveProducts } from "../content/resolve";
import type { VoxaCommerceHost } from "../lib/commerce-host";
import { DEFAULT_BASE_PATH } from "../meta";

const LAB_CART_PATH = `${DEFAULT_BASE_PATH}/carrito`;
const LAB_CHECKOUT_PATH = `${DEFAULT_BASE_PATH}/checkout`;

export type PayloadCommerceBridgeOptions = {
  dualSalesMode?: boolean;
  salesMode?: "stock" | "madeToOrder";
  madeToOrderAcceptingOrders?: boolean;
  preparationPromiseLabel?: string;
};

/**
 * Preview host backed by Content Payload catalog (clean-host / no Mock Bridge).
 * Implements CommerceRuntimeBridge — not a local CartProvider.
 */
export function createPayloadCommerceBridge(
  payload: ContentPayload,
  options: PayloadCommerceBridgeOptions = {},
): VoxaCommerceHost & CommerceRuntimeBridge {
  const dualSalesMode = options.dualSalesMode ?? false;
  const initialSalesMode = options.salesMode ?? "stock";
  const mtoAccepting = options.madeToOrderAcceptingOrders ?? true;
  const mtoPrepLabel = options.preparationPromiseLabel ?? null;
  const capabilities = {
    ...DEFAULT_PREVIEW_CAPABILITIES,
    salesModeSwitch: dualSalesMode ? ("supported" as const) : ("unsupported" as const),
  };

  const { locale, currency } = payload.brand;
  const money = (n: number) => formatPrice(n, locale, currency);

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
    collectionId: null,
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
      currency,
      itemsCount: 0,
      subtotal: 0,
      subtotalDisplay: money(0),
      requiresShipping: true,
      lines: [],
      cartHref: LAB_CART_PATH,
      checkoutHref: LAB_CHECKOUT_PATH,
      promotionLabels: [],
    };
  }

  let cart = emptyCart();

  function toCard(p: (typeof products)[0]): ProductCardViewModel {
    const firstModality = (p.metals[0] ?? "Online")
      .toLowerCase()
      .replace(/\s+/g, "-");
    return {
      id: p.id,
      slug: p.slug,
      href: `/catalogo/${p.slug}`,
      name: p.name,
      imageUrl: p.imageUrl,
      galleryPreview: p.hoverImageUrl ?? null,
      displayPrice: money(p.price),
      currency,
      defaultVariantId: `${p.id}-${firstModality}`,
      stockLabel: "available",
      badges: [
        ...(p.isNew ? ["new"] : []),
        ...(p.isLimited ? ["limitedEdition"] : []),
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
      subtotalDisplay: money(sum),
    };
  }

  function buildListing(query: CatalogQueryViewModel): ProductSearchViewModel {
    let source = products;
    const categoryId = query.categoryId ?? filterState.categoryId ?? null;
    const collectionId = query.collectionId ?? filterState.collectionId ?? null;
    if (categoryId) {
      const slug = payload.catalog.categories.find((c) => c.id === categoryId)?.slug;
      if (slug) source = source.filter((p) => p.categorySlug === slug);
    }
    if (collectionId) {
      const slug = payload.catalog.collections.find(
        (c) => c.id === collectionId,
      )?.slug;
      if (slug) source = source.filter((p) => p.collectionSlug === slug);
    }
    let list = source.map(toCard);
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
        categoryId,
        collectionId,
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
      activeCollectionId: filterState.collectionId ?? null,
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
    const duration = p.sizes[0] ?? "Programa";
    const level = p.sizes[1] ?? null;
    const modalities =
      p.metals.length > 0 ? p.metals : (["Online"] as string[]);
    const variants = modalities.map((modality) => {
      const id = `${p.id}-${modality.toLowerCase().replace(/\s+/g, "-")}`;
      return {
        id,
        label: `${modality} · ${duration}`,
        options: [
          { name: "Modalidad", value: modality },
          { name: "Duración", value: duration },
          ...(level ? [{ name: "Nivel", value: level }] : []),
        ],
        displayPrice: money(p.price),
        stockLabel: "available" as const,
        maxQuantity: p.categorySlug === "libros" ? 10 : 3,
        available: true,
        imageUrl: p.imageUrl,
      };
    });
    const defaultId = variants[0]?.id ?? `${p.id}-default`;
    const variantId =
      selectedVariantId && variants.some((v) => v.id === selectedVariantId)
        ? selectedVariantId
        : defaultId;
    const firstSentence =
      p.description.split(/(?<=\.)\s+/)[0]?.trim() || p.description;
    const isBook = p.categorySlug === "libros";
    const mode = currentSalesMode();
    const detail: ProductDetailViewModel = {
      id: p.id,
      slug: p.slug,
      href: `/catalogo/${p.slug}`,
      name: p.name,
      shortDescription: firstSentence,
      description: p.description,
      gallery: p.hoverImageUrl
        ? [
            { id: "g1", url: p.imageUrl, alt: p.imageAlt },
            { id: "g2", url: p.hoverImageUrl, alt: p.imageAlt },
          ]
        : [{ id: "g1", url: p.imageUrl, alt: p.imageAlt }],
      variants,
      currency,
      selectedVariantId: variantId,
      stockLabel: "available",
      maxQuantity: isBook ? 10 : 3,
      canAddToCart: true,
      badges: [
        ...(p.isNew ? ["new"] : []),
        ...(p.isLimited ? ["limitedEdition"] : []),
      ],
      highlights: [
        ...(duration ? [`Duración: ${duration}`] : []),
        ...(level ? [`Nivel: ${level}`] : []),
        `Modalidad: ${modalities.join(" · ")}`,
        isBook
          ? "Envío o descarga según formato"
          : "Feedback grabado en cada sesión",
      ],
      bulletPoints: isBook
        ? [
            "Escrito por el claustro Voxa",
            "Ejercicios aplicables desde el primer capítulo",
            "Complementa los programas de la academia",
          ]
        : [
            "Práctica en vivo con grupo reducido",
            "Feedback individual por escrito",
            "Materiales y grabaciones en el aula",
          ],
      specifications: [
        { key: "Categoría", value: p.categoryLabel },
        { key: "Itinerario", value: p.collectionName },
        { key: "Duración", value: duration },
        ...(level ? [{ key: "Nivel", value: level }] : []),
        { key: "Modalidad", value: modalities.join(" · ") },
      ],
      categoryLabels: [p.categoryLabel],
      collectionLabels: [p.collectionName],
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
          label: "Recogida en la sede",
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
        products.find((x) => variantId.startsWith(`${x.id}-`)) ??
        products.find((x) => `${x.id}-default` === variantId) ??
        products[0];
      if (!p) return { ok: false, errorCode: "UNKNOWN" };
      const modalityFromId = variantId
        .slice(`${p.id}-`.length)
        .replace(/-/g, " ");
      const modality =
        p.metals.find(
          (m) => m.toLowerCase().replace(/\s+/g, "-") === variantId.slice(`${p.id}-`.length),
        ) ??
        p.metals.find((m) => m.toLowerCase() === modalityFromId.toLowerCase()) ??
        p.metals[0] ??
        "Online";
      const unit = p.price;
      const existing = cart.lines.find((l) => l.variantId === variantId);
      const lines = existing
        ? cart.lines.map((l) =>
            l.variantId === variantId
              ? {
                  ...l,
                  quantity: l.quantity + quantity,
                  lineDisplayPrice: money(unit * (l.quantity + quantity)),
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
              variantLabel: `${modality} · ${p.sizes[0] ?? "Programa"}`,
              href: `/catalogo/${p.slug}`,
              imageUrl: p.imageUrl,
              quantity,
              maxQuantity: p.categorySlug === "libros" ? 10 : 3,
              unitDisplayPrice: money(unit),
              lineDisplayPrice: money(unit * quantity),
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
          lineDisplayPrice: money(unit * quantity),
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
