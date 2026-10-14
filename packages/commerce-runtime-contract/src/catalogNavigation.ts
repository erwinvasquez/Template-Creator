import type { SalesMode } from "./catalog";

export type CatalogNavigationHost = Readonly<{
  getPlpReturnHref?: () => string | null | undefined;
  getPersistedCatalogSalesMode?: () => SalesMode | null | undefined;
}>;

function splitHref(href: string): Readonly<{
  pathname: string;
  search: string;
  hash: string;
}> {
  const [pathAndQuery, hashPart] = href.split("#");
  const [pathname, ...queryParts] = (pathAndQuery || "/").split("?");
  const search = queryParts.length > 0 ? `?${queryParts.join("?")}` : "";
  const hash = hashPart ? `#${hashPart}` : "";
  return { pathname: pathname || "/", search, hash };
}

/**
 * Convierte un href de PLP (canónico absoluto interno o relativo al mount) en ruta
 * para `router.replace` / `<Link href>` sin duplicar `basePath`.
 */
export function resolvePlpReturnHrefForRouter(
  href: string,
  basePath: string,
): string {
  const trimmed = href.trim();
  if (!trimmed || /^https?:\/\//i.test(trimmed)) return trimmed;

  const base = basePath.replace(/\/$/, "");
  const { pathname, search, hash } = splitHref(trimmed);

  if (base) {
    if (pathname === base || pathname.startsWith(`${base}/`)) {
      return `${pathname}${search}${hash}`;
    }
    const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
    return `${base}${path === "/" ? "" : path}${search}${hash}`;
  }

  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${path}${search}${hash}`;
}

/** Breadcrumb / back desde PDP hacia la PLP preservada. */
export function resolveCatalogShopNavigationHref(
  host: CatalogNavigationHost | null | undefined,
  basePath: string,
  fallbackShopPath = "/tienda",
): string {
  const stored = host?.getPlpReturnHref?.();
  if (stored?.trim()) {
    return resolvePlpReturnHrefForRouter(stored, basePath);
  }
  return resolvePlpReturnHrefForRouter(fallbackShopPath, basePath);
}

/** @deprecated Usar resolveCatalogShopNavigationHref */
export function resolvePlpShopHref(
  host: CatalogNavigationHost | null | undefined,
  fallbackShopPath = "/tienda",
): string {
  const stored = host?.getPlpReturnHref?.();
  if (stored?.trim()) return stored.trim();
  return fallbackShopPath;
}
