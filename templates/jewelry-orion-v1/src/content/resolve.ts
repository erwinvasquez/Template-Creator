import type {
  ContentPayload,
  MediaRef,
  NavLink,
  ResolvedProduct,
} from "./types";

/** Mount-relative catalog root for Orion (design copy: "colección"). */
export const SHOP_PATH = "/coleccion" as const;

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

/**
 * Shop route query params (relative to mount, Orion shop path is `/coleccion`):
 * - `categoria` — category slug from catalog.categories[].slug
 * - `coleccion` — collection slug from catalog.collections[].slug
 * Both may combine: `/coleccion?categoria=anillos&coleccion=solitarios`
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
      metals: p.metals,
      sizes: p.sizes,
      imageUrl: resolveMediaUrl(p.image, payload.media),
      imageAlt: p.image.alt,
      hoverImageUrl: p.hoverImage
        ? resolveMediaUrl(p.hoverImage, payload.media)
        : undefined,
      isNew: p.badges?.includes("new") ?? false,
      isLimited: p.badges?.includes("limited") ?? false,
    };
  });
}

export function getProductBySlug(payload: ContentPayload, slug: string) {
  return resolveProducts(payload).find((p) => p.slug === slug);
}

export function getSignatureProducts(payload: ContentPayload) {
  const all = resolveProducts(payload);
  const byId = new Map(all.map((p) => [p.id, p]));
  return payload.sections.signatures.productIds
    .map((id) => byId.get(id))
    .filter((p): p is ResolvedProduct => Boolean(p));
}

export function getMaterialItems(payload: ContentPayload) {
  return payload.sections.materials.items.map((item) => ({
    ...item,
    imageUrl: resolveMediaUrl(item.image, payload.media),
    imageAlt: item.image.alt,
  }));
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
  const primary = c.primary ?? "#141210";
  const secondary = c.secondary ?? "#5c564f";
  return {
    "--color-primary": primary,
    "--color-secondary": secondary,
    "--color-background": c.background ?? "#fafaf8",
    "--color-surface": c.surface ?? "#f0ede8",
    "--color-text": c.text ?? "#121212",
    "--color-muted": c.muted ?? "#6b6560",
    "--color-border": c.border ?? "#ddd6cc",
    "--color-ink": "#0e0e10",
    "--color-cta": c.cta ?? primary,
    "--color-cta-hover": c.ctaHover ?? secondary,
  };
}
