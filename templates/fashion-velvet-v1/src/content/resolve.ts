import type {
  ContentPayload,
  MediaRef,
  NavLink,
  ResolvedProduct,
} from "./types";

export function resolveMediaUrl(
  ref: MediaRef,
  media: ContentPayload["media"] = [],
): string {
  if (ref.url) return ref.url;
  if (ref.mediaId) {
    const asset = media.find((m) => m.id === ref.mediaId);
    if (asset?.url) return asset.url;
  }
  throw new Error(`MediaRef unresolved: ${JSON.stringify(ref)}`);
}

export function withBasePath(basePath: string, href: string): string {
  if (!href || href === "#") return href;
  if (/^https?:\/\//i.test(href)) return href;
  const base = basePath.replace(/\/$/, "") || "";
  if (href.startsWith("#")) return href;
  const [pathPart, hash] = href.split("#");
  const [pathname, query] = (pathPart || "/").split("?");
  const normalized =
    !pathname || pathname === "/" ? base || "/" : `${base}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
  const withQuery = query ? `${normalized}?${query}` : normalized;
  return hash ? `${withQuery}#${hash}` : withQuery;
}

/**
 * Account routes relative to mount. Default root `/cuenta`; SaaS may set
 * `features.accountBasePath` to `/account` (or similar) without patching UI.
 */
export function accountPath(
  basePath: string,
  accountBasePath: string | undefined,
  segment?: string,
): string {
  const root = (accountBasePath?.trim() || "/cuenta").replace(/\/$/, "") || "/cuenta";
  const relative = segment
    ? `${root.startsWith("/") ? root : `/${root}`}/${segment.replace(/^\//, "")}`
    : root.startsWith("/")
      ? root
      : `/${root}`;
  return withBasePath(basePath, relative);
}

/** Mount-relative catalog root for Velvet (colección / catálogo entero). */
export const SHOP_PATH = "/coleccion" as const;

/**
 * Shop route query params (relative to mount):
 * - `categoria` — category slug from catalog.categories[].slug
 * - `coleccion` — collection slug from catalog.collections[].slug
 */
export const SHOP_QUERY = {
  category: "categoria",
  collection: "coleccion",
  salesMode: "salesMode",
  search: "q",
} as const;

export const SHOP_SEARCH_CLEAR_MS = 300;

export type ShopListingHrefPatch = {
  q?: string | null;
};

export function buildShopListingHref(
  basePath: string,
  searchParams: URLSearchParams,
  patch: ShopListingHrefPatch = {},
): string {
  const params = new URLSearchParams(searchParams.toString());
  params.delete("after");
  params.delete("afterProductId");
  if ("q" in patch) {
    const trimmed = patch.q?.trim();
    if (trimmed) params.set(SHOP_QUERY.search, trimmed);
    else params.delete(SHOP_QUERY.search);
  }
  const qs = params.toString();
  return withBasePath(basePath, qs ? `${SHOP_PATH}?${qs}` : SHOP_PATH);
}

export function shouldClearShopSearchOnEmpty(draft: string, qFromUrl: string): boolean {
  return draft.length === 0 && qFromUrl.length > 0;
}

/** Resolve navbar entry to a template-relative href. */
export function resolveNavHref(link: NavLink): string {
  if (link.type === "shopFilter") {
    const params = new URLSearchParams();
    if (link.categorySlug) {
      params.set(SHOP_QUERY.category, link.categorySlug);
    }
    if (link.collectionSlug) {
      params.set(SHOP_QUERY.collection, link.collectionSlug);
    }
    const q = params.toString();
    return q ? `${SHOP_PATH}?${q}` : SHOP_PATH;
  }
  return link.href;
}

export function resolveProducts(payload: ContentPayload): ResolvedProduct[] {
  const catById = new Map(payload.catalog.categories.map((c) => [c.id, c]));
  const colById = new Map(payload.catalog.collections.map((c) => [c.id, c]));

  return payload.catalog.products.map((p) => {
    const category = catById.get(p.categoryId);
    const collection = colById.get(p.collectionId);
    if (!category) throw new Error(`Missing category ${p.categoryId}`);
    if (!collection) throw new Error(`Missing collection ${p.collectionId}`);
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      description: p.description,
      price: p.price,
      categorySlug: category.slug,
      categoryLabel: category.label,
      collectionSlug: collection.slug,
      collectionName: collection.name,
      colors: p.colors,
      sizes: p.sizes,
      imageUrl: resolveMediaUrl(p.image, payload.media),
      imageAlt: p.image.alt,
      hoverImageUrl: p.hoverImage
        ? resolveMediaUrl(p.hoverImage, payload.media)
        : undefined,
      isNew: p.badges?.includes("new") ?? false,
      /** Catalog-level featured flag; section helpers may override. */
      isFeatured: p.badges?.includes("featured") ?? false,
    };
  });
}

export function getProductBySlug(payload: ContentPayload, slug: string) {
  return resolveProducts(payload).find((p) => p.slug === slug);
}

/**
 * Looks firma: membership in `sections.nocturne.productIds` is the source of
 * truth for the «Look firma» badge (`isFeatured`), not global catalog badges.
 * `isNew` still comes from catalog badges (`new` wins in ProductCard).
 */
export function getNocturneProducts(payload: ContentPayload): ResolvedProduct[] {
  const all = resolveProducts(payload);
  const byId = new Map(all.map((p) => [p.id, p]));
  return payload.sections.nocturne.productIds
    .map((id) => byId.get(id))
    .filter((p): p is ResolvedProduct => Boolean(p))
    .map((p) => ({ ...p, isFeatured: true }));
}

/**
 * Accesorios: never show «Look firma», even if catalog.products[].badges
 * includes `featured` (SaaS may stamp featured on all hydrated products).
 */
export function getVelvetEditProducts(payload: ContentPayload): ResolvedProduct[] {
  const all = resolveProducts(payload);
  const byId = new Map(all.map((p) => [p.id, p]));
  return payload.sections.velvetEdit.productIds
    .map((id) => byId.get(id))
    .filter((p): p is ResolvedProduct => Boolean(p))
    .map((p) => ({ ...p, isFeatured: false }));
}

export function getSoireesCollections(payload: ContentPayload) {
  const byId = new Map(payload.catalog.collections.map((c) => [c.id, c]));
  return payload.sections.soirees.collectionIds.map((id) => {
    const c = byId.get(id);
    if (!c) throw new Error(`Missing collection ${id}`);
    return {
      ...c,
      imageUrl: resolveMediaUrl(c.image, payload.media),
      imageAlt: c.image.alt,
    };
  });
}

export function formatPrice(
  amount: number,
  locale: string,
  currency: string,
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function themeStyle(payload: ContentPayload): Record<string, string> {
  const c = payload.theme?.colors ?? {};
  const primary = c.primary ?? "#1c1917";
  const secondary = c.secondary ?? "#ca8a04";
  return {
    "--color-primary": primary,
    "--color-secondary": secondary,
    "--color-background": c.background ?? "#fafaf9",
    "--color-surface": c.surface ?? "#f5f5f4",
    "--color-text": c.text ?? "#1c1917",
    "--color-muted": c.muted ?? "#78716c",
    "--color-border": c.border ?? "#e7e5e4",
    "--color-ink": "#0c0a09",
    "--color-cta": c.cta ?? primary,
    "--color-cta-hover": c.ctaHover ?? secondary,
  };
}
