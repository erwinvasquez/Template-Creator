import type { ContentPayload, MediaRef, ResolvedProduct } from "./types";

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
  return {
    "--color-primary": c.primary ?? "#141210",
    "--color-secondary": c.secondary ?? "#5c564f",
    "--color-cta": c.cta ?? "#b8956a",
    "--color-cta-hover": c.ctaHover ?? "#9a7a55",
    "--color-background": c.background ?? "#fafaf8",
    "--color-surface": c.surface ?? "#f0ede8",
    "--color-text": c.text ?? "#121212",
    "--color-muted": c.muted ?? "#6b6560",
    "--color-border": c.border ?? "#ddd6cc",
    "--color-ink": c.ink ?? "#0e0e10",
  };
}
