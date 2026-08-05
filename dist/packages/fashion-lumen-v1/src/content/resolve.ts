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

export const SHOP_PATH = "/tienda" as const;

/**
 * Shop route query params (relative to mount):
 * - `categoria` — category slug from catalog.categories[].slug
 * - `coleccion` — collection slug from catalog.collections[].slug
 * Both may combine: `/tienda?categoria=mujer&coleccion=otono-essentials`
 */
export const SHOP_QUERY = {
  category: "categoria",
  collection: "coleccion",
  salesMode: "salesMode",
} as const;

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
      isFeatured: p.badges?.includes("featured") ?? false,
    };
  });
}

export function getProductBySlug(payload: ContentPayload, slug: string) {
  return resolveProducts(payload).find((p) => p.slug === slug);
}

export function getGearSpotlight(payload: ContentPayload) {
  const all = resolveProducts(payload);
  const byId = new Map(all.map((p) => [p.id, p]));
  return payload.sections.gearSpotlight.productIds
    .map((id) => byId.get(id))
    .filter((p): p is ResolvedProduct => Boolean(p));
}

export function getHomeDisciplines(payload: ContentPayload) {
  const byId = new Map(payload.catalog.collections.map((c) => [c.id, c]));
  return payload.sections.disciplines.collectionIds.map((id) => {
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
  return {
    "--color-primary": c.primary ?? "#1c1917",
    "--color-secondary": c.secondary ?? "#44403c",
    "--color-cta": c.cta ?? "#ca8a04",
    "--color-cta-hover": c.ctaHover ?? "#a16207",
    "--color-background": c.background ?? "#fafaf9",
    "--color-surface": c.surface ?? "#f5f5f4",
    "--color-text": c.text ?? "#0c0a09",
    "--color-muted": c.muted ?? "#57534e",
    "--color-border": c.border ?? "#e7e5e4",
  };
}
